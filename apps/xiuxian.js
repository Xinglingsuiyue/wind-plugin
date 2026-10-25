import fs from 'fs'
import YAML from 'yaml'
import xiuxiandb from '../model/xiuxiandb.js'
import isqbot from '../model/isqbot.js'

const xiuxianPath = './plugins/wind-plugin/config/xiuxian.yaml'
const xiuxiandefaultPath = './plugins/wind-plugin/config/default_config/xiuxian.yaml'
let data = YAML.parse(fs.readFileSync(xiuxiandefaultPath, 'utf8')) // false全局关闭，true全局开启
if (fs.existsSync(xiuxianPath)) { data = fs.readFileSync(xiuxianPath, 'utf8') } else {
    data = YAML.stringify(data)
    fs.writeFileSync(xiuxianPath, data, 'utf8')
}
let ydata = YAML.parse(data) || {}
const levelname = ['凡人', '练气期', '筑基期', '金丹期', '元婴期', '化神期', '合体期', '大乘期', '渡劫期', '人仙境', '地仙境', '天仙境', '金仙境', '大罗金仙境', '准仙帝', '仙帝', '天人五衰境', '圣人', '大帝', '神帝/魔帝', '神境/魔境', '神魔境', '道祖']
const level_exp = [0, 50, 100, 150, 200, 250, 300, 350, 400/* 炼气 */, 460, 520, 580, 640, 700, 760, 820, 880, 940/* 筑基 */, 1010, 1080, 1150, 1220, 1290, 1360, 1430, 1500, 1570/* 金丹 */, 1650, 1730, 1810, 1890, 1970, 2050, 2130, 2210, 2290/* 元婴 */, 2380, 2470, 2560, 2650, 2740, 2830, 2920, 3010, 3100/* 化神 */, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000/* 合体 */, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900/* 大乘 */, 5000, 5100, 5200, 5300, 5400, 5500, 5600, 5700, 5800/* 渡劫 */, 6000, 6200, 6400, 6600/* 人仙 */, 6900, 7200, 7500, 7800/* 地仙 */, 8150, 8500, 8850, 9200/* 天仙 */, 9600, 10000, 10400, 10800/* 金仙 */, 11200, 11600, 12000, 12400/* 大罗金仙 */, 13000, 13800/* 准仙帝 */, 14600, 15500/* 仙帝 */, 16500, 17500, 18500, 19500, 20500/* 天人五衰 */, 21500, 22500, 23500, 24500, 25500, 26500, 27500, 28500, 29500, 30500/* 圣人 */]
const master_cd = ydata.master_cd // 主人是否需要cd
const cdtime_xiuxian = ydata.cdtime_xiuxian * 60 // 修炼的冷却时间,初始为15分钟
const cdtime_break = ydata.cdtime_break * 60 // 突破的冷却时间,初始为5分钟
// const cdtime_down = ydata.cdtime_down * 60 * 60 // 闭关冷却
// const down_up = ydata.down_up// 闭关保底提升值
// const down_ave = ydata.down_ave// 闭关提升波动幅度
// 丹药配置：success 成功率(%), up 成功增加灵力, down 失败扣除灵力；成功率最高 50%
const PILL_SUCCESS_MAX = 50
const PILLS = {
    仙丹: { success: 0.1, up: 5000, down: 50 },
    天丹: { success: 20, up: 200, down: 50 },
    地丹: { success: 30, up: 100, down: 30 },
    玄丹: { success: 40, up: 60, down: 15 },
    黄丹: { success: 50, up: 30, down: 5 }
}
if (ydata.pills && typeof ydata.pills === 'object') {
    for (const name of Object.keys(PILLS)) {
        const item = ydata.pills[name]
        if (!item) continue
        if (Number.isFinite(Number(item.success))) PILLS[name].success = Math.min(PILL_SUCCESS_MAX, Math.max(0, Number(item.success)))
        if (Number.isFinite(Number(item.up))) PILLS[name].up = Number(item.up)
        if (Number.isFinite(Number(item.down))) PILLS[name].down = Number(item.down)
    }
}
const xiuxian_up = ydata.xiuxian_up // 修仙提升保底
const xiuxian_ave = ydata.xiuxian_ave // 修仙提升波动幅度
const group_limit = ydata.group_limit // 群排行人数限制
const all_limit = ydata.all_limit // 全服排行人数限制

async function getDownRemain (user_id) {
    const raw = await redis.get(`wind:down:${user_id}`)
    if (!raw) return 0
    try {
        const data = JSON.parse(raw)
        const remain = (Number(data.start) + Number(data.seconds) * 1000 - Date.now()) / 1000
        return remain > 0 ? Math.ceil(remain) : 0
    } catch {
        return 0
    }
}

function formatDownTime (seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h) return `${h}小时${m}分钟`
    if (m) return `${m}分钟`
    return `${Math.ceil(seconds)}秒`
}
let btn
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
                    reg: '^#?(我的境界|查看境界)$', // 匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'view'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?(修炼|修仙)$', // 匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'xiuxian'
                },
                {
                    /** 丹药列表 */
                    reg: '^#?丹药列表$',
                    fnc: 'pillList'
                },
                {
                    /** 选择默认丹药 */
                    reg: '^#?选择丹药(?:\\s*([天地玄黄仙])丹)?$',
                    fnc: 'choosePill'
                },
                {
                    /** 服用丹药：未选择时提示，选择后直接使用默认丹药 */
                    reg: '^#?服用丹药(?:\\s*([天地玄黄仙])丹)?$',
                    fnc: 'pill'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?突破$', // 匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'break'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?(修仙|修炼)?境界列表$', // 匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'list'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?排行榜$', // 匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'rankings'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?(修仙者|修炼者|用户)(人数|数量)$', // 匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'numxiuxian'
                },
                {
                    /** 命令正则匹配 */
                    reg: '^#?我的id$', // 匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'myid'
                },
                // {
                /** 命令正则匹配 */
                ///  reg: "^#?清空修仙数据$", //匹配消息正则，命令正则
                /** 执行方法 */
                // fnc: 'clear'
                // },
                {
                    reg: '#?全服(排行榜|排名)$',
                    fnc: 'allrank'
                },
                {
                    reg: '#?全服加灵力(.*)',
                    fnc: 'giveall_exp'
                },
                {
                    reg: '#?全服加境界(.*)',
                    fnc: 'giveall_level'
                },
                {
                    reg: '#?开始压缩(.*)',
                    fnc: 'moveback'
                }
            ]
        })
    }

    async moveback (e) {
        if (!e.isMaster) return false
        await xiuxiandb.moveback()
        await e.reply('压缩完成')
    }

    async clear (e) {
        let dirpath = process.cwd() + '/data/wind-db/xiuxiandata.db'
        if (fs.existsSync(dirpath)) { // 如果文件夹不存在
            let files = fs.readdirSync(dirpath)
            files.forEach(function (file) {
                // 拼接文件或子文件夹的完整路径
                let filepath = dirpath + '/' + file
                // 获取文件或子文件夹的状态
                let stats = fs.statSync(filepath)
                // 判断是文件还是文件夹
                if (stats.isFile()) {
                    // 如果是文件，直接删除
                    fs.unlinkSync(filepath)
                } else if (stats.isDirectory()) {
                    // 如果是文件夹，递归调用删除文件夹的函数
                    // deleteFolder(filepath)
                }
            })
            // 删除空文件夹
            fs.rmdirSync(dirpath)
        }
        e.reply('清除成功！！')
    }

    async myid (e) {
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        if (user_id.length > 30) btn = isqbot.btn
        let group_id = e.group_id
        if (typeof group_id != 'string') group_id = JSON.stringify(group_id)
        let user_data = await xiuxiandb.getUserInfo(user_id)
        if (user_data === null) {
            return e.reply('\r\r#请先使用【修仙】自动分配id')
        }
        user_data.group_id = user_data.group_id || ''
        if (group_id && !user_data.group_id.includes(group_id)) {
            user_data.group_id = user_data.group_id ? `${user_data.group_id},${group_id}` : group_id
        }
        if (user_id.length > 30) return await e.reply([segment.at(e.user_id), `\r\r#你的id是:${user_data.id}`, btn])
        return await e.reply([segment.at(e.user_id), `\r\r#你的id是:${user_data.id}`])
    }

    async numxiuxian (e) {
        const count = await xiuxiandb.countUsers()
        return e.reply(`当前修仙者共 ${count} 人`)
    }

    async xxsetCd (seconds = 60) {
        let ext = new Date() * 1 + seconds * 1000
        await redis.set(`wind:xiuxian-cd:${this.e.user_id}`, ext + '', { EX: seconds })
    }

    async xxinCd () {
        let ext = await redis.get(`wind:xiuxian-cd:${this.e.user_id}`)
        if (!ext || isNaN(ext)) {
            return false
        }
        let cd = (new Date() * 1) - ext
        if (cd < 0 && Math.abs(cd)) {
            return Math.ceil(0 - cd / 1000)
        }
        return false
    }

    async brsetCd (seconds = 60) {
        let ext = new Date() * 1 + seconds * 1000
        await redis.set(`wind:break-cd:${this.e.user_id}`, ext + '', { EX: seconds })
    }

    async brinCd () {
        let ext = await redis.get(`wind:break-cd:${this.e.user_id}`)
        if (!ext || isNaN(ext)) {
            return false
        }
        let cd = (new Date() * 1) - ext
        if (cd < 0 && Math.abs(cd) < 100 * 60 * 1000) {
            return Math.ceil(0 - cd / 1000)
        }
        return false
    }

    async rankings (e) {
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        if (user_id.length > 30) {
            btn = isqbot.btn
        }
        let group_id = e.group_id
        if (typeof group_id != 'string') group_id = JSON.stringify(group_id)
        let group_data = await xiuxiandb.getTopUsers(group_id, group_limit)
        if (group_data.length == 0) { // 如果文件不存在
            return await e.reply('本群暂无修炼者～')
        }

        /** 获取灵力名称、突破下境界所需灵力值 */
        const { pwname } = xiuxiandb.experience(group_data[0])
        let MsgList = []
        for (let i = 0; i < group_data.length; i++) {
            MsgList.push({
                message: [segment.image(`http://q2.qlogo.cn/headimg_dl?dst_uin=${group_data[i].user_id}&spec=100`), `\n第${i+1}名\nqq:${group_data[i].user_id}\n用户id:${group_data[i].id}\n境界:${group_data[i].levelname}\n灵力:${group_data[i].experience}`],
                nickname: e.bot.nickname,
                user_id: e.bot.uin
            })
        }
        let forwardMsg
        if (e.group?.makeForwardMsg) {
            forwardMsg = await e.group.makeForwardMsg(MsgList)
        } else if (e.friend?.makeForwardMsg) {
            forwardMsg = await e.friend.makeForwardMsg(MsgList)
        } else {
            forwardMsg = await Bot.makeForwardMsg(MsgList)
        }
        return await e.reply(forwardMsg)
    }

    async giveall_exp (e) {
        if (!e.isMaster) {
            return false
        }
        await e.reply('添加中请耐心等待')
        let numreg = /[1-9][0-9]{0,12}/
        let value = Number(numreg.exec(e.msg))
        if (!value) return e.reply('请提供有效数值')
        await xiuxiandb.addExperience(value)
        await e.reply(`添加成功,全服增加灵力${value}`)
    }

    async giveall_level (e) {
        if (!e.isMaster) {
            return false
        }
        await e.reply('添加中请耐心等待')
        let numreg = /[1-9][0-9]{0,12}/
        let value = Number(numreg.exec(e.msg))
        if (!value) return e.reply('请提供有效数值')
        await xiuxiandb.addLevel(value)
        await e.reply(`添加成功,全服增加境界${value}`)
    }

    async allrank (e) {
        let user_id = e.user_id
        if (user_id.length > 30) {
            btn = isqbot.btn
        }
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        let group_data = await xiuxiandb.getTopUsers2(all_limit)
        if (group_data.length == 0) { // 如果文件不存在
            return await e.reply('暂无修炼者～')
        }
        let MsgList = []
        for (let i = 0; i < group_data.length; i++) {
            MsgList.push({
                message: [segment.image(`http://q2.qlogo.cn/headimg_dl?dst_uin=${group_data[i].user_id}&spec=100`), `\n第${i+1}名\nqq:${group_data[i].user_id}\n用户id:${group_data[i].id}\n境界:${group_data[i].levelname}\n灵力:${group_data[i].experience}`],
                nickname: e.bot.nickname,
                user_id: e.bot.uin
            })
        }
        let forwardMsg
        if (e.group?.makeForwardMsg) {
            forwardMsg = await e.group.makeForwardMsg(MsgList)
        } else if (e.friend?.makeForwardMsg) {
            forwardMsg = await e.friend.makeForwardMsg(MsgList)
        } else {
            forwardMsg = await Bot.makeForwardMsg(MsgList)
        }
        e.reply(forwardMsg)
    }

    async view (e) {
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        if (user_id.length > 30) btn = isqbot.btn
        let user_data = await xiuxiandb.getUserInfo(user_id)
        if (user_data === null) {
            if (user_id.length > 30) {
                return e.reply([segment.at(e.user_id), '您还是凡人，请通过#修炼和#突破开启你的仙途', btn])
            }
            return e.reply([segment.at(e.user_id), '您还是凡人，请通过#修炼和#突破开启你的仙途'])
        }
        let group_id = e.group_id
        if (group_id == null) group_id = null
        else if (typeof group_id != 'string') group_id = JSON.stringify(group_id)
        if (group_id && !(user_data.group_id || '').includes(group_id)) {
            user_data.group_id = user_data.group_id ? `${user_data.group_id},${group_id}` : group_id
            await user_data.save()
        }
        /** 获取灵力名称、突破下境界所需灵力值 */
        const { need, pwname } = xiuxiandb.experience(user_data)
        const needMsg = need > 0 ? `\r>您还需要:${need}点${pwname}突破下一境界` : '\r>已可突破，发送 #突破 试试'
        if (user_id.length > 30) {
            return await e.reply([segment.at(e.user_id), `\r#你的id:${user_data.id},\r>境界:${user_data.levelname},\r>${pwname}:${user_data.experience}${needMsg}`, btn])
        }
        await e.reply([segment.at(e.user_id), `\r#你的id:${user_data.id},\r>境界:${user_data.levelname},\r>${pwname}:${user_data.experience}${needMsg}`])
    }

    async list (e) {
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        if (user_id.length > 30) {
            btn = isqbot.btn
        }
        let msg = levelname[0] + '\n'
        for (let j = 1; j < levelname.length; j++) {
            msg = msg + levelname[j] + '\n'
        }
        msg += `\r#凡境每个境界分九层,仙境每个境界分初期中期后期圆满四层,仙帝之后则还有不同,自行探索吧!\r#大帝境之后依次为神帝/魔帝、神境/魔境、神魔境,最终方可踏入道祖之境!\r#后期修行困难可以选择丹药，发送 #服用丹药.`
        if (user_id.length > 30) {
            return e.reply([msg, btn])
        }
        e.reply(msg)
    }

    async xiuxian (e) {
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        if (user_id.length > 30) {
            btn = isqbot.btn
        }
        let group_id = e.group_id
        if (group_id == null) group_id = null
        else if (typeof group_id != 'string') group_id = JSON.stringify(group_id)
        if (!group_id) return e.reply('请到群里使用修仙指令，私聊无法记录群排行')
        const downRemain = await getDownRemain(user_id)
        if (downRemain) return e.reply(`你正在闭关中，还需${formatDownTime(downRemain)}，闭关期间无法修炼`)
        let cdtime = await this.xxinCd()
        if (this.e.isMaster && !master_cd) {
            cdtime = 0
        }
        if (cdtime > cdtime_xiuxian) return await e.reply(`\r#您还在调息中,还有${cdtime}秒cd`)
        if (cdtime) {
            if (user_id.length > 30) {
                return await e.reply([segment.at(user_id), `\n对不起,修炼失败，还有${cdtime}秒cd`, btn])
            }
            return await e.reply([segment.at(user_id), `\n对不起,修炼失败，还有${cdtime}秒cd`])
        }
        await this.xxsetCd(cdtime_xiuxian)
        let user_data = await xiuxiandb.getUserInfo(user_id)
        if (user_data === null) {
            user_data = { // 创建新用户
                experience: 0,
                level: 0,
                levelname: '凡人',
                group_id
            }
            await xiuxiandb.updateUserInfo(user_id, user_data)
            user_data = await xiuxiandb.getUserInfo(user_id)
        }
        user_data.group_id = user_data.group_id || ''
        if (!user_data.group_id.includes(group_id)) {
            user_data.group_id = user_data.group_id ? `${user_data.group_id},${group_id}` : group_id
            await user_data.save()
        }
        let experience_ = 0
        /** 获取灵力名称、突破下境界所需灵力值 */
        const { pwname } = xiuxiandb.experience(user_data)
        const needMsg = need => need > 0 ? `\n您还需要:${need}点${pwname}突破下一境界` : '\n已可突破，发送 #突破 试试'

        experience_ = Math.round(xiuxian_up + xiuxian_ave * Math.random())
        user_data.experience += experience_
        /** 保存数据库 */
        await user_data.save()
        const { need } = xiuxiandb.experience(user_data)
        const msg = [segment.at(user_id), `\r#用户:${user_data.id}\r#恭喜你获得了${experience_}点${pwname}。\r>境界:${user_data.levelname}\r>${pwname}:${user_data.experience}${needMsg(need)}`]
        if (user_id.length > 30) msg.push(btn)
        await e.reply(msg)
    }

    async pillList (e) {
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        const selected = await redis.get(`wind:pill:${user_id}`)
        const lines = ['请选择要服用的丹药：']
        for (const name of ['仙丹', '天丹', '地丹', '玄丹', '黄丹']) {
            const t = PILLS[name]
            lines.push(`${name}：成功率${t.success}%，成功+${t.up}灵力，失败-${t.down}灵力`)
        }
        lines.push(`当前默认丹药：${selected || '未选择'}`)
        lines.push('发送 #选择丹药 黄丹')
        return e.reply(lines.join('\n'))
    }

    async choosePill (e) {
        const match = /([天地玄黄仙])丹/.exec(e.msg)
        if (!match) return this.pillList(e)
        const name = `${match[1]}丹`
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        await redis.set(`wind:pill:${user_id}`, name)
        return e.reply(`已选择默认丹药：${name}（成功率${PILLS[name].success}%）\n之后发送 #服用丹药 即可服用`)
    }

    async pill (e) {
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        const match = /([天地玄黄仙])丹/.exec(e.msg)
        let name = match ? `${match[1]}丹` : await redis.get(`wind:pill:${user_id}`)
        if (!name || !PILLS[name]) return this.pillList(e)
        if (match) await redis.set(`wind:pill:${user_id}`, name)
        const tier = PILLS[name]
        if (user_id.length > 30) btn = isqbot.btn
        let group_id = e.group_id
        if (group_id == null) return e.reply('请到群里使用丹药')
        if (typeof group_id != 'string') group_id = JSON.stringify(group_id)
        const downRemain = await getDownRemain(user_id)
        if (downRemain) return e.reply(`你正在闭关中，还需${formatDownTime(downRemain)}，闭关期间无法服用丹药`)
        let cdtime = await this.xxinCd()
        if (this.e.isMaster && !master_cd) cdtime = 0
        if (cdtime) {
            if (user_id.length > 30) return e.reply([segment.at(user_id), `\n丹药还在炼化中，还有${cdtime}秒cd`, btn])
            return e.reply([segment.at(user_id), `\n丹药还在炼化中，还有${cdtime}秒cd`])
        }
        await this.xxsetCd(cdtime_xiuxian)
        let user_data = await xiuxiandb.getUserInfo(user_id)
        if (user_data === null) {
            user_data = { experience: 0, level: 0, levelname: '凡人', group_id }
            await xiuxiandb.updateUserInfo(user_id, user_data)
            user_data = await xiuxiandb.getUserInfo(user_id)
        }
        user_data.group_id = user_data.group_id || ''
        if (!user_data.group_id.includes(group_id)) {
            user_data.group_id = user_data.group_id ? `${user_data.group_id},${group_id}` : group_id
            await user_data.save()
        }
        const loss = tier.down
        const success = Math.random() * 100 < tier.success
        if (success) user_data.experience += tier.up
        else user_data.experience = Math.max(0, user_data.experience - loss)
        /** 保存数据库 */
        await user_data.save()
        user_data = await xiuxiandb.getUserInfo(user_id)
        const { need, pwname } = xiuxiandb.experience(user_data)
        const needMsg = need > 0 ? `\n您还需要:${need}点${pwname}突破下一境界` : '\n已可突破，发送 #突破 试试'
        const result = success
            ? `#服用${name}成功，你获得了${tier.up}点${pwname}！`
            : `#服用${name}失败，丹毒反噬，你损失了${loss}点${pwname}！`
        const msg = [segment.at(user_id), `\r#用户:${user_data.id}\r${result}\r>境界:${user_data.levelname}\r>${pwname}:${user_data.experience}${needMsg}`]
        if (user_id.length > 30) msg.push(btn)
        return e.reply(msg)
    }

    async break (e) {
        let user_id = e.user_id
        if (typeof user_id != 'string') user_id = JSON.stringify(user_id)
        if (user_id.length > 30) {
            btn = isqbot.btn
        }
        let cdtime = await this.brinCd()
        if (this.e.isMaster && !master_cd) {
            cdtime = 0
        }
        if (cdtime) {
            if (user_id.length > 30) {
                return await e.reply([segment.at(e.user_id), `\n对不起,突破失败，还有${cdtime}秒cd`, btn])
            }
            return await e.reply([segment.at(e.user_id), `\n对不起,突破失败，还有${cdtime}秒cd`])
        }
        await this.brsetCd(cdtime_break)
        let group_id = e.group_id
        if (group_id == null) group_id = null
        else if (typeof group_id != 'string') group_id = JSON.stringify(group_id)
        if (!group_id) return e.reply('请到群里使用突破指令，私聊无法记录群排行')
        let user_data = await xiuxiandb.getUserInfo(user_id)
        if (user_data === null) {
            // let idd=await xiuxiandb.getMaxId();
            // idd++
            // let groupid=[]
            // await groupid.push(e.group_id)
            user_data = { // 创建新用户
                // "id": idd,
                experience: 0,
                level: 0,
                levelname: '凡人',
                group_id
            }
            await xiuxiandb.updateUserInfo(user_id, user_data)
            user_data = await xiuxiandb.getUserInfo(user_id)
        }
        user_data.group_id = user_data.group_id || ''
        if (!user_data.group_id.includes(group_id)) {
            user_data.group_id = user_data.group_id ? `${user_data.group_id},${group_id}` : group_id
        }
        let lev = user_data.level
        let exerp = 1000 * (lev - 110) + 30500
        if (user_data.experience < level_exp[lev] && user_data.level < 111) {
            if (user_id.length > 30) {
                return e.reply([segment.at(e.user_id), `对不起，用户:${user_data.id},\n你的修为不足,还差${level_exp[lev] - user_data.experience},请再接再厉`, btn])
            }
            return e.reply([segment.at(e.user_id), `对不起，用户:${user_data.id},\n你的修为不足,还差${level_exp[lev] - user_data.experience},请再接再厉`])
        }
        if (user_data.level > 110 && user_data.experience < exerp) {
            if (user_id.length > 30) {
                return e.reply([segment.at(e.user_id), `对不起，用户:${user_data.id},\n你的修为不足,还差${exerp - user_data.experience},请再接再厉`, btn])
            }
            return e.reply([segment.at(e.user_id), `对不起，用户:${user_data.id},\n你的修为不足,还差${exerp - user_data.experience},请再接再厉`])
        }

        let gailv = user_data.level < 110 ? 100 - user_data.level * 0.5 : 45 - user_data.level * 0.05
        gailv = Math.min(100, Math.max(5, gailv))
        gailv = Math.round(gailv * 10) / 10
        const delay = 200 * (lev + 1)

        e.reply([segment.at(e.user_id), `用户:${user_data.id},\n你当前境界为${user_data.levelname},需要时间${(delay / 1000).toFixed(1)}s,突破成功概率${gailv}%,开始突破......`])
        let i = Math.random() * 100
        if (i > gailv) {
            return await e.reply([segment.at(user_id), `用户:${user_data.id},\n对不起，突破失败，请努力修行`])
        } else {
            user_data.level++
        }

        /** 修改境界名称 */
        user_data.levelname = xiuxiandb.levelName(user_data)

        /** 获取灵力名称、突破下境界所需灵力值 */
        const { need, pwname } = xiuxiandb.experience(user_data)

        const needMsg = need > 0 ? `\r>您还需要:${need}点${pwname}突破下一境界` : '\r>已可突破，发送 #突破 试试'
        setTimeout(() => { // 按境界层级延迟
            if (user_id.length > 30) { e.reply([segment.at(e.user_id), `\r#用户:${user_data.id}\r#恭喜你已突破成功！\r>境界:${user_data.levelname},\r>${pwname}:${user_data.experience}${needMsg}`, btn]) } else { e.reply([segment.at(e.user_id), `\r#用户:${user_data.id}\r#恭喜你已突破成功！\r>境界:${user_data.levelname},\r>${pwname}:${user_data.experience}${needMsg}`]) }
        }, delay)// 设置延时
        await user_data.save()
    }
}