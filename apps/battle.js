import fs from 'fs'
import YAML from 'yaml'
import xiuxiandb from '../model/xiuxiandb.js'
import isqbot from '../model/isqbot.js'

let btn
const battlePath = './plugins/wind-plugin/config/battle.yaml'
const battledefaultPath = './plugins/wind-plugin/config/default_config/battle.yaml'

let data = YAML.parse(fs.readFileSync(battledefaultPath, 'utf8')) // false全局关闭，true全局开启
if (fs.existsSync(battlePath)) { data = fs.readFileSync(battlePath, 'utf8') } else {
  data = YAML.stringify(data)
  fs.writeFileSync(battlePath, data, 'utf8')
}

let ydata = YAML.parse(data) || {}

// const master_battled = ydata.master_battled // 主人是否会被别人攻打
const master_cd = ydata.master_cd // 主人是否需要cd
const cdtime_battle = ydata.cdtime_battle * 60 // 决斗的冷却时间,初始为1分钟
const d1_battle = ydata.d1_battle // 低等级打高等级，且都为凡境相差两个大境界时,事先扣除的低境界的灵力
const d2_battle = ydata.d2_battle // 低等级打高等级，且都为仙境相差两个大境界时,事先扣除的低境界的灵力
const d3_battle = ydata.d3_battle // 低等级打高等级，拥有仙凡之隔,事先扣除的低境界的灵力
const d4_battle = ydata.d4_battle // 低等级打高等级，低等级为大帝之下,高等级为大帝之上时,事先扣除的低境界的灵力
const beclear = ydata.beclear // 低打高被废掉的概率
const toclear = ydata.toclear // 高打低打废低等级的概率
export class xiuxian extends plugin {// 修炼
  constructor () {
    super({
      /** 功能名称 */
      name: '轻量修炼',
      /** 功能描述 */
      dsc: '轻量修仙',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: -999,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(战斗|决斗|pk|PK|攻打|battle)(.*)$', // 匹配消息正则，命令正则
          /** 执行方法 */
          fnc: 'battle'
        }
      ]
    })
  }

  
  async btsetCd (seconds = 60) {
    let ext = new Date() * 1 + seconds * 1000
    await redis.set(`wind:battle-cd:${this.e.user_id}`, ext + '', { EX: seconds })
  }

  async btinCd () {
    let ext = await redis.get(`wind:battle-cd:${this.e.user_id}`)
    if (!ext || isNaN(ext)) {
      return false
    }
    let cd = (new Date() * 1) - ext
    if (cd < 0 && Math.abs(cd) < 100 * 60 * 1000) {
      return Math.ceil(0 - cd / 1000)
    }
    return false
  }

  async battle (e) {
    let user_id = e.user_id
    if(typeof user_id!='string') user_id=JSON.stringify(user_id) 
    if (user_id.length > 30) {
      btn = isqbot.btn
    }
    let numreg = /[1-9][0-9]{0,12}/
    let uid = Number(numreg.exec(e.msg))
    if (user_id.length > 30 && !uid) return e.reply([segment.at(e.user_id), '你倒是说一说你跟谁决斗啊！他的id呢？', btn])
    if (!e.at && !uid) {
      return e.reply([segment.at(e.user_id), '大笨蛋，你要打谁你倒是说啊！！'])
    }
    if (e.atme || e.atall || e.at == e.user_id) {
      return e.reply([segment.at(e.user_id), '大笨蛋，你艾特错了！！'])
    }
    let at_id
    let at_data
    if (!uid) {
      at_id = e.at
      at_data = await xiuxiandb.getUserInfo(e.at)
    }
    if (!e.at) {
      at_data = await xiuxiandb.getUserById(uid)
      // 兼容直接输入 QQ 号
      if (!at_data) at_data = await xiuxiandb.getUserInfo(String(uid))
      if (!at_data) return e.reply('请输入正确的用户id')
      at_id = at_data.user_id
    }
    if (at_data === null) {
      return e.reply('请输入正确的用户id')
    }
    if (!(at_data.group_id || '').includes(e.group_id)) {
      return e.reply('请输入正确的用户id')
    }
    if (at_id == user_id) {
      return e.reply('自己不能跟自己决斗')
    }
    let user_data = await xiuxiandb.getUserInfo(user_id)
    if (user_data === null) { // 如果json中不存在该用户
      if (user_id.length > 30) {
        return await e.reply([segment.at(e.user_id), '你还没有修炼过呢，想和别人决斗先修炼一下吧', btn])
      }
      return e.reply([segment.at(e.user_id), '你还没有修炼过呢，想和别人决斗先修炼一下吧'])
    }
    if (at_data.experience < 0) {
      return await e.reply([segment.at(e.user_id), '对方已经比凡人还弱了你就让让他吧'])
    }
    if (user_data.experience < 0) {
      return await e.reply([segment.at(e.user_id), '你都比凡人更弱了还想要跟别人决斗?'])
    }
    let cdtime = await this.btinCd()
    if (this.e.isMaster && !master_cd) {
      cdtime = 0
    }
    if (cdtime) {
      if (user_id.length > 30) {
        return await e.reply([segment.at(e.user_id), `上一场战斗刚过去不久呢,你太累了,还有${cdtime}秒cd`, btn])
      }
      return await e.reply([segment.at(e.user_id), `上一场战斗刚过去不久呢,你太累了,还有${cdtime}秒cd`])
    }
    await this.btsetCd(cdtime_battle)
    let score
    let sc
    let experience_user
    let experience_at
    let level_user
    let level_at
    sc = (user_data.level * user_data.level + user_data.experience) / (user_data.level * user_data.level + user_data.experience + at_data.level * at_data.level + at_data.experience) * 100
    score = sc.toFixed(2)
    let sscore = Math.random()

    /** 获取灵力名称、突破下境界所需灵力值 */
    const { pwname: pwname2 } = xiuxiandb.experience(at_data)
    const { pwname: pwname1 } = xiuxiandb.experience(user_data)

    if (user_data.level < 73 && at_data.level < 73 && at_data.level - user_data.level > 20) {
      user_data.experience -= d1_battle
      await e.reply([segment.at(user_id), `\r\r#对方已经超越你两个大境界了,你直接被对方的威压压制散去30点${pwname1}`])
    }
    if (user_data.level > 72 && at_data.level < 111 && at_data.level - user_data.level > 8) {
      user_data.experience -= d2_battle
      await e.reply([segment.at(user_id), `\r\r#对方已经超越你两个大境界了,你直接被对方的威压压制散去40点${pwname1}`])
    }
    if (user_data.level < 73 && at_data.level > 72 && at_data.level < 111) {
      user_data.experience -= d3_battle
      await e.reply([segment.at(user_id), `\r\r#你与对方实属仙凡人之隔,你直接被对方的威压压制散去40点${pwname1}`])
    }
    if (user_data.level < 111 && at_data.level > 110) {
      user_data.experience -= d4_battle
      await e.reply([segment.at(user_id), `\r\r#大帝之下皆为蝼蚁,你直接被对方的威压压制散去50点${pwname1}`])
    }
    await e.reply([segment.at(e.user_id), `\n你的境界是${user_data.levelname},你的${pwname1}值为${user_data.experience},\n`, segment.at(at_id), `的境界是${at_data.levelname},对方的${pwname2}值为${at_data.experience},\r#你赢的概率约为${score}%`])
    if (score > (Math.random() * 100)) {
      if (score > 95 && Math.random() < toclear) {
        at_data.level = 0
        at_data.experience = 0
        at_data.levelname = '凡人'
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '对方与你的差距太大了,对方直接被你抓住没跑掉,你将他打回凡人,从头修炼', btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '对方与你的差距太大了,对方直接被你抓住没跑掉,你将他打回凡人,从头修炼'])
      } else if (score > 70) {
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '与你差距较大，你轻松战胜了敌人，你们两个都没有获得提升', btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '与你差距较大，你轻松战胜了敌人，你们两个都没有获得提升'])
      } else if (score > 40 && sscore < 0.3) {
        experience_at = Math.round(6 + 5 * Math.random())
        experience_user = experience_at + Math.round(0 + 5 * Math.random())
        at_data.experience += experience_at
        user_data.experience += experience_user
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你们实力不相上下，经过激烈的战斗之后你赢了，你们都获得了一些经验,\n你获得了${experience_user}点${pwname1}\n对方获得了${experience_at}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你们实力不相上下，经过激烈的战斗之后你赢了，你们都获得了一些经验,\n你获得了${experience_user}点${pwname1}\n对方获得了${experience_at}点${pwname2}`])
      } else if (score > 40 && sscore < 0.6) {
        experience_at = Math.round(4 + 2 * Math.random())
        experience_user = experience_at - Math.round(0 + 2 * Math.random())
        at_data.experience -= experience_at
        user_data.experience -= experience_user
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你们实力不相上下你打赢了对方，但是你们两个因为消耗巨大导致灵力流失,\n你丢失了${experience_user}点${pwname1}\n对方丢失了${experience_at}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你们实力不相上下你打赢了对方，但是你们两个因为消耗巨大导致灵力流失,\n你丢失了${experience_user}点${pwname1}\n对方丢失了${experience_at}点${pwname2}`])
      } else if (score > 40) {
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升', btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升'])
      } else if (score > 20 && sscore < 0.2) {
        experience_user = Math.round(10 + 10 * Math.random())
        experience_at = experience_user + Math.round(0 + 10 * Math.random())
        at_data.experience -= experience_at
        user_data.experience += experience_user
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你因机缘巧合打败了对方，获得大量的经验值,\n你获得了${experience_user}点${pwname1}\n对方丢失了${experience_at}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你因机缘巧合打败了对方，获得大量的经验值,\n你获得了${experience_user}点${pwname1}\n对方丢失了${experience_at}点${pwname2}`])
      } else if (score < 20 && sscore < 0.1) {
        level_user = Math.round(0 + 2 * Math.random())
        experience_user = Math.round(10 + 10 * Math.random())
        user_data.experience += experience_user
        user_data.level += level_user
        at_data.level -= level_user
        at_data.experience -= experience_user
        if (at_data.level < 0) at_data.level = 0

        /** 更新境界名称 */
        at_data.levelname = xiuxiandb.levelName(at_data)
        user_data.levelname = xiuxiandb.levelName(user_data)

        if (user_id.length > 30) await e.reply([segment.at(e.user_id), `你忽然觉醒，${pwname1}和境界提升，成功反杀了`, '\n', segment.at(at_id), `\n你提升了${level_user}个境界，获得了${experience_user}点${pwname1}\n对方跌落了${level_user}个境界，丢失了${experience_user}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), `你忽然觉醒，${pwname1}和境界提升，成功反杀了`, '\n', segment.at(at_id), `\n你提升了${level_user}个境界，获得了${experience_user}点${pwname1}\n对方跌落了${level_user}个境界，丢失了${experience_user}点${pwname2}`])
      } else if (score < 10 && sscore < 0.05) {
        level_user = Math.round(2 + 2 * Math.random())
        experience_user = Math.round(10 + 20 * Math.random())
        level_at = Math.round(0 + 2 * Math.random())
        experience_at = Math.round(10 + 20 * Math.random())
        user_data.experience += experience_user
        user_data.level += level_user
        at_data.level -= level_at
        if (at_data.level < 0) at_data.level = 0
        at_data.experience -= experience_at

        /** 更新境界名称 */
        at_data.levelname = xiuxiandb.levelName(at_data)
        user_data.levelname = xiuxiandb.levelName(user_data)

        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '你人品大爆发了，获得天道青睐，成功爆发进阶，反杀了', '\n', segment.at(at_id), `\n你提升了${level_user}个境界，获得了${experience_user}点${pwname1}\n对方跌落了${level_at}个境界，丢失了${experience_at}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '你人品大爆发了，获得天道青睐，成功爆发进阶，反杀了', '\n', segment.at(at_id), `\n你提升了${level_user}个境界，获得了${experience_user}点${pwname1}\n对方跌落了${level_at}个境界，丢失了${experience_at}点${pwname2}`])
      } else {
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '你由于别人帮助打败了', '\n', segment.at(at_id), '\n你们都没有任何提升', btn])
        else await e.reply([segment.at(e.user_id), '你由于别人帮助打败了', '\n', segment.at(at_id), '\n你们都没有任何提升'])
      }
    } else {
      if (score > 90 && sscore > 0.9) {
        level_at = Math.round(0 + 2 * Math.random())
        experience_at = Math.round(10 + 20 * Math.random())
        level_user = Math.round(0 + 2 * Math.random())
        experience_user = Math.round(10 + 20 * Math.random())
        at_data.experience += experience_at
        at_data.level += level_at
        user_data.level -= level_user
        user_data.experience -= experience_user
        if (user_data.level < 0) user_data.level = 0

        /** 更新境界名称 */
        at_data.levelname = xiuxiandb.levelName(at_data)
        user_data.levelname = xiuxiandb.levelName(user_data)

        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '虽然你领先了', '\n', segment.at(at_id), '\n', `很多个境界，但是对方忽然人品大爆发，获得了天道青睐，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点${pwname1}\n对方提升了${level_at}个境界，获得了${experience_at}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '虽然你领先了', '\n', segment.at(at_id), '\n', `很多个境界，但是对方忽然人品大爆发，获得了天道青睐，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点${pwname1}\n对方提升了${level_at}个境界，获得了${experience_at}点${pwname2}`])
      } else if (score > 80 && sscore > 0.9) {
        level_at = Math.round(0 + 1 * Math.random())
        experience_at = Math.round(10 + 20 * Math.random())
        at_data.experience += experience_at
        at_data.level += level_at
        user_data.level -= level_at
        user_data.experience -= experience_at
        if (user_data.level < 0) user_data.level = 0

        /** 更新境界名称 */
        at_data.levelname = xiuxiandb.levelName(at_data)
        user_data.levelname = xiuxiandb.levelName(user_data)

        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `忽然觉醒，${pwname2}和境界获得提升，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点${pwname1}\n对方提升了${level_user}个境界，获得了${experience_user}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `忽然觉醒，${pwname2}和境界获得提升，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点${pwname1}\n对方提升了${level_user}个境界，获得了${experience_user}点${pwname2}`])
      } else if (score > 60 && sscore > 0.9) {
        experience_at = Math.round(10 + 5 * Math.random())
        experience_user = experience_at + Math.round(0 + 5 * Math.random())
        at_data.experience += experience_at
        user_data.experience -= experience_user
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `机缘巧合下击败了你，对方获得了大量经验,\n你损失了${experience_user}点${pwname1},\n对方获得了${experience_at}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `机缘巧合下击败了你，对方获得了大量经验,\n你损失了${experience_user}点${pwname1},\n对方获得了${experience_at}点${pwname2}`])
      } else if (score > 60) {
        if (user_id.length > 30) await e.reply([segment.at(at_id), '对方由于别人帮助打败了你', '\n', segment.at(user_id), '\n你们都没有任何提升', btn])
        else await e.reply([segment.at(at_id), '你由于别人帮助打败了', '\n', segment.at(user_id), '\n你们都没有任何提升'])
      } else if (score > 40 && sscore > 0.7) {
        experience_at = Math.round(6 + 2 * Math.random())
        experience_user = experience_at + Math.round(0 + 2 * Math.random())
        at_data.experience += experience_at
        user_data.experience += experience_user
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你们实力不相上下，经过激烈的战斗之后你还是输了，但是你们都获得了一些经验\n你获得了${experience_user}点${pwname1}\n对方获得了${experience_at}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你们实力不相上下，经过激烈的战斗之后你还是输了，但是你们都获得了一些经验\n你获得了${experience_user}点${pwname1}\n对方获得了${experience_at}点${pwname2}`])
      } else if (score > 40 && Math.random() > 0.4) {
        experience_at = Math.round(4 + 2 * Math.random())
        experience_user = experience_at - Math.round(0 + 2 * Math.random())
        at_data.experience -= experience_at
        at_data.experience -= experience_user
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你们实力不相上下你打赢了对方，激烈战斗后,\n你丢失了${experience_user}点${pwname1}\n对方丢失了${experience_at}点${pwname2}`, btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), `\n你们实力不相上下你打赢了对方，激烈战斗后,\n你丢失了${experience_user}点${pwname1}\n对方丢失了${experience_at}点${pwname2}`])
      } else if (score > 40) {
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升', btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升'])
      } else if (score > 20 && sscore > 0.4) {
        experience_user = Math.round(4 + 2 * Math.random())
        user_data.experience -= experience_user
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n你们实力相差太大，你被对方', '\n', segment.at(at_id), `打落${pwname1}共${experience_user}点`, btn])
        else await e.reply([segment.at(e.user_id), '\n你们实力相差太大，你被对方', '\n', segment.at(at_id), `打落${pwname1}共${experience_user}点`])
      } else if (score < 20 && sscore > (1 - beclear)) {
        user_data.level = 0
        user_data.experience = 0
        user_data.levelname = '凡人'
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '\n你们实力相差太过悬殊，你被对面抓起来废了，需要重头修炼了', btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '\n你们实力相差太过悬殊，你被对面抓起来废了，需要重头修炼了'])
      } else {
        if (user_id.length > 30) await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '\n你们的境界相差过大了，你直接被对方吊打，再修炼一下再来决斗吧', btn])
        else await e.reply([segment.at(e.user_id), '\n', segment.at(at_id), '\n你们的境界相差过大了，你直接被对方吊打，再修炼一下再来决斗吧'])
      }
    }
    await user_data.save()
    await at_data.save()
  }
}
