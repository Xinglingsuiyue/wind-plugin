import fs from 'node:fs'
import YAML from 'yaml'
import xiuxiandb from '../model/xiuxiandb.js'

const xiuxianPath = './plugins/wind-plugin/config/xiuxian.yaml'
const xiuxiandefaultPath = './plugins/wind-plugin/config/default_config/xiuxian.yaml'
let xdata = YAML.parse(fs.readFileSync(xiuxiandefaultPath, 'utf8')) || {}
if (fs.existsSync(xiuxianPath)) xdata = YAML.parse(fs.readFileSync(xiuxianPath, 'utf8')) || {}

const down_rate = (xdata.down_rate ?? 80) / 100 // 闭关收益为正常修炼的百分比
const cdtime_xiuxian = xdata.cdtime_xiuxian ?? 1 // 修炼冷却（分钟），闭关按此冷却折算修炼次数
// 每天最多可结算的修炼次数
const MAX_DOWN_ROLLS = 24 * 60 / cdtime_xiuxian
// 每次修炼的收益区间
const rollMin = (xdata.xiuxian_up ?? 5) * down_rate
const rollMax = ((xdata.xiuxian_up ?? 5) + (xdata.xiuxian_ave ?? 10)) * down_rate
const MAX_DOWN_SECONDS = 24 * 3600

const aniPath = './plugins/wind-plugin/config/ani.yaml'
const anidefaultPath = './plugins/wind-plugin/config/default_config/ani.yaml'
let adata = YAML.parse(fs.readFileSync(anidefaultPath, 'utf8')) || {}
if (fs.existsSync(aniPath)) {
  adata = YAML.parse(fs.readFileSync(aniPath, 'utf8')) || {}
} else {
  fs.writeFileSync(aniPath, YAML.stringify(adata), 'utf8')
}
const cdtime_ani = (adata.cdtime_ani ?? 2) * 60 // 清理妖兽冷却（秒）

const BOSS_NAMES = ['青鳞蛇', '赤焰虎', '幽冥狼', '黑风蛟', '山岳巨猿', '九尾灵狐', '雷鹏', '冰甲蜈蚣']

/** 统一转换 user_id */
function toId (value) {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

/** 确保用户存在并记录群号 */
async function ensureUser (e) {
  const user_id = toId(e.user_id)
  let group_id = e.group_id
  if (group_id == null) return null
  if (typeof group_id !== 'string') group_id = JSON.stringify(group_id)
  let user = await xiuxiandb.getUserInfo(user_id)
  if (!user) {
    await xiuxiandb.updateUserInfo(user_id, {
      experience: 0,
      level: 0,
      levelname: '凡人',
      group_id
    })
    user = await xiuxiandb.getUserInfo(user_id)
  }
  user.group_id = user.group_id || ''
  if (!user.group_id.includes(group_id)) {
    user.group_id = user.group_id ? `${user.group_id},${group_id}` : group_id
    await user.save()
  }
  return { user_id, group_id, user }
}

function formatTime (seconds) {
  seconds = Math.max(0, Math.ceil(seconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h) return `${h}小时${m}分钟`
  if (m) return `${m}分钟${s}秒`
  return `${s}秒`
}

async function downState (user_id) {
  const raw = await redis.get(`wind:down:${user_id}`)
  if (!raw) return null
  let start, seconds
  try {
    const data = JSON.parse(raw)
    start = Number(data.start)
    seconds = Number(data.seconds)
  } catch {
    start = Number(raw)
    seconds = 0
  }
  const remain = Math.max(0, (start + seconds * 1000 - Date.now()) / 1000)
  return { start, seconds, remain }
}

/** 闭关秒数可折算的修炼次数（受修炼冷却限制，每天最多 MAX_DOWN_ROLLS 次） */
function downRolls (seconds) {
  return Math.min(MAX_DOWN_ROLLS, Math.max(0, seconds) / (cdtime_xiuxian * 60))
}

/** 按闭关秒数结算收益 */
function downRollSeconds (seconds) {
  const rolls = downRolls(seconds)
  const whole = Math.floor(rolls)
  const up = xdata.xiuxian_up ?? 5
  const ave = xdata.xiuxian_ave ?? 10
  let total = 0
  for (let i = 0; i < whole; i++) {
    total += (up + ave * Math.random()) * down_rate
  }
  const frac = rolls - whole
  if (frac > 0) total += frac * (up + ave * Math.random()) * down_rate
  return total
}

function resultText (user, gain) {
  const { need, pwname } = xiuxiandb.experience(user)
  const needMsg = need > 0 ? `\n您还需要:${need}点${pwname}突破下一境界` : '\n已可突破，发送 #突破 试试'
  return `#${gain >= 0 ? '恭喜你获得' : '你损失'}了${Math.abs(gain)}点${pwname}。\r>境界:${user.levelname}\r>${pwname}:${user.experience}${needMsg}`
}

export class xiuxianExtra extends plugin {
  constructor () {
    super({
      name: '轻量修炼扩展',
      dsc: '闭关、修炼打卡、清理妖兽',
      event: 'message',
      priority: -999,
      rule: [
        { reg: '^#?(闭关|开始闭关)(?:\\s*(\\d+(?:\\.\\d+)?)\\s*(小时|分钟|h|min))?$', fnc: 'downStart' },
        { reg: '^#?(确认闭关|出关)$', fnc: 'downEnd' },
        { reg: '^#?(打断闭关|提前出关)$', fnc: 'downBreak' },
        { reg: '^#?修炼打卡$', fnc: 'checkin' },
        { reg: '^#?清理妖兽$', fnc: 'ani' },
        { reg: '^#?(妖兽列表|妖兽表)$', fnc: 'aniList' }
      ]
    })
  }

  async downStart (e) {
    const ctx = await ensureUser(e)
    if (!ctx) return e.reply('请到群里使用闭关指令')
    const match = /(\d+(?:\.\d+)?)\s*(小时|分钟|h|min)/i.exec(e.msg)
    if (!match) return e.reply('请选择闭关时长，例如：#闭关 2小时 或 #闭关 30分钟（最长24小时）')
    const value = Number(match[1])
    const unit = match[2].toLowerCase()
    const seconds = Math.round(value * (unit === '小时' || unit === 'h' ? 3600 : 60))
    if (!Number.isFinite(seconds) || seconds < 60) return e.reply('闭关时长至少 1 分钟')
    if (seconds > MAX_DOWN_SECONDS) return e.reply('闭关时长最长 24 小时')
    const key = `wind:down:${ctx.user_id}`
    const state = await downState(ctx.user_id)
    if (state) {
      if (state.remain > 0) return e.reply(`你正在闭关中，还需${formatTime(state.remain)}才能出关`)
      return e.reply('你上次闭关已完成，请先发送 #确认闭关 出关')
    }
    await redis.set(key, JSON.stringify({ start: Date.now(), seconds }))
    const rolls = downRolls(seconds)
    return e.reply(`已开始闭关 ${formatTime(seconds)}，预计获得 ${Math.round(rollMin * rolls)}~${Math.round(rollMax * rolls)} 灵力\n发送 #确认闭关 出关`)
  }

  async downEnd (e) {
    const ctx = await ensureUser(e)
    if (!ctx) return e.reply('请到群里使用闭关指令')
    const key = `wind:down:${ctx.user_id}`
    const state = await downState(ctx.user_id)
    if (!state) return e.reply('你还没有开始闭关，发送 #闭关 2小时 开始')
    if (state.remain > 0) return e.reply(`闭关尚未结束，还需${formatTime(state.remain)}\n若强行打断，发送 #打断闭关，但只能获得5成灵力`)
    const gain = Math.round(downRollSeconds(state.seconds))
    ctx.user.experience += gain
    await ctx.user.save()
    await redis.del(key)
    return e.reply(`闭关结束！本次闭关${formatTime(state.seconds)}\n${resultText(ctx.user, gain)}`)
  }

  async downBreak (e) {
    const ctx = await ensureUser(e)
    if (!ctx) return e.reply('请到群里使用闭关指令')
    const key = `wind:down:${ctx.user_id}`
    const state = await downState(ctx.user_id)
    if (!state) return e.reply('你还没有开始闭关，发送 #闭关 2小时 开始')
    if (state.remain <= 0) return e.reply('闭关已经完成，发送 #确认闭关 可领取全部灵力')
    const elapsed = Math.max(0, Math.min(state.seconds, state.seconds - state.remain))
    const gain = Math.round(downRollSeconds(elapsed) * 0.5)
    ctx.user.experience += gain
    await ctx.user.save()
    await redis.del(key)
    return e.reply(`你强行打断了闭关，已闭关${formatTime(elapsed)}\n本次只获得${gain}点：\n${resultText(ctx.user, gain)}`)
  }

  async checkin (e) {
    const ctx = await ensureUser(e)
    if (!ctx) return e.reply('请到群里使用修炼打卡指令')
    const day = new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })
    const key = `wind:checkin:${ctx.user_id}:${day}`
    if (await redis.get(key)) return e.reply('今天已经修炼打卡过了，明天再来吧')
    const gain = Math.round((10 + 10 * Math.random()) * down_rate)
    ctx.user.experience += gain
    await ctx.user.save()
    await redis.set(key, '1', { EX: 26 * 3600 })
    return e.reply(`修炼打卡成功！\n${resultText(ctx.user, gain)}`)
  }

  async ani (e) {
    const ctx = await ensureUser(e)
    if (!ctx) return e.reply('请到群里使用清理妖兽指令')
    const down = await downState(ctx.user_id)
    if (down && down.remain > 0) return e.reply(`你正在闭关中，还需${formatTime(down.remain)}，闭关期间无法清理妖兽`)
    const key = `wind:ani-cd:${ctx.user_id}`
    if (await redis.get(key)) return e.reply('刚清理过妖兽，先调息一会儿再来吧')
    await redis.set(key, '1', { EX: cdtime_ani })
    const gain = Math.round((5 + 10 * Math.random()) * down_rate)
    ctx.user.experience += gain
    await ctx.user.save()
    return e.reply(`你清理了一只妖兽！\n${resultText(ctx.user, gain)}`)
  }

  async aniList (e) {
    return e.reply(`可清理的妖兽：${BOSS_NAMES.join('、')}\n清理冷却${Math.floor(cdtime_ani / 60)}分钟。\n发送 #清理妖兽 清理一只`)
  }
}
