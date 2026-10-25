// 文件可命名为: queryGroupRank.js
// 将其放置在 wind-plugin 的插件目录中，并确保在 index.js 或其他入口文件中正确加载。

import fs from 'fs'
import YAML from 'yaml'
import xiuxiandb from '../model/xiuxiandb.js'
import isqbot from '../model/isqbot.js'

// 复用原插件的配置路径和数据
const xiuxianPath = './plugins/wind-plugin/config/xiuxian.yaml'
const xiuxiandefaultPath = './plugins/wind-plugin/config/default_config/xiuxian.yaml'
let data = YAML.parse(fs.readFileSync(xiuxiandefaultPath, 'utf8'))
if (fs.existsSync(xiuxianPath)) { data = fs.readFileSync(xiuxianPath, 'utf8') } else {
    data = YAML.stringify(data)
    fs.writeFileSync(xiuxianPath, data, 'utf8')
}
let ydata = YAML.parse(data) || {}
const levelname = ['凡人', '练气期', '筑基期', '金丹期', '元婴期', '化神期', '合体期', '大乘期', '渡劫期', '人仙境', '地仙境', '天仙境', '金仙境', '大罗金仙境', '准仙帝', '仙帝', '天人五衰境', '圣人', '大帝', '神帝/魔帝', '神境/魔境', '神魔境', '道祖']
const group_limit = ydata.group_limit // 群排行人数限制
let btn

export class queryGroupRank extends plugin {
    constructor() {
        super({
            name: '查询指定群排行榜',
            dsc: '根据指定的群号查询该群的修仙排行榜',
            event: 'message',
            priority: 1000, // 优先级可自行调整
            rule: [
                {
                    // 匹配命令如：#查询排行榜 421951182 或 #群排行榜 421951182
                    reg: '^#?(查询排行榜|群排行榜)\\s*(\\d+)$',
                    fnc: 'queryGroupRank'
                }
            ]
        })
    }

    async queryGroupRank(e) {
        // 从正则匹配结果中提取群号，e.msg 是用户发送的消息
        const regMatch = e.msg.match(/^#?(查询排行榜|群排行榜)\s*(\d+)$/)
        if (!regMatch || regMatch.length < 3) {
            // 理论上不会进入这里，因为正则已匹配
            return await e.reply('命令格式错误，请使用“#查询排行榜 群号”的格式。')
        }
        const targetGroupId = regMatch[2] // 提取的群号
        const user_id = String(e.user_id)
        if (user_id.length > 30) {
            btn = isqbot.btn
        }

        // 调用数据库方法，查询该群的所有用户
        // 注意：原 xiuxiandb.getTopUsers 方法接受一个 group_id 参数
        // 这里假设该方法能根据传入的 group_id 返回对应群的前 N 名用户
        let groupData
        try {
            // 直接调用原排行榜函数，传入指定的群号
            groupData = await xiuxiandb.getTopUsers(targetGroupId, group_limit)
        } catch (error) {
            console.error('[查询指定群排行榜] 数据库查询错误：', error)
            return await e.reply('查询排行榜时发生内部错误。')
        }

        // 判断是否有数据
        if (!groupData || groupData.length === 0) {
            // 按照您的要求，没有该群数据时返回 “群号无排行榜”
            if (user_id.length > 30) {
                return await e.reply([`${targetGroupId}（群号）无排行榜`, btn])
            }
            return await e.reply(`${targetGroupId}（群号）无排行榜`)
        }

        // 获取灵力名称（使用第一名用户的数据获取名称）
        const { pwname } = xiuxiandb.experience(groupData[0])
        let MsgList = []
        for (let i = 0; i < groupData.length; i++) {
            MsgList.push({
                message: [segment.image(`http://q2.qlogo.cn/headimg_dl?dst_uin=${groupData[i].user_id}&spec=100`), `\n第${i + 1}名\nQQ: ${groupData[i].user_id}\n用户ID: ${groupData[i].id}\n境界: ${groupData[i].levelname}\n${pwname}: ${groupData[i].experience}`],
                nickname: e.bot.nickname,
                user_id: e.bot.uin
            })
        }

        // 构造合并转发消息
        let forwardMsg
        try {
            if (e.group?.makeForwardMsg) {
                forwardMsg = await e.group.makeForwardMsg(MsgList)
            } else if (e.friend?.makeForwardMsg) {
                forwardMsg = await e.friend.makeForwardMsg(MsgList)
            } else {
                forwardMsg = await Bot.makeForwardMsg(MsgList)
            }
        } catch (err) {
            console.error('[查询指定群排行榜] 构建转发消息失败：', err)
            return await e.reply('构建排行榜展示消息失败。')
        }

        // 在转发消息前或后，可以附加一条说明文字
        const titleMsg = `群 ${targetGroupId} 的修仙排行榜：`
        const replyContent = [titleMsg, forwardMsg]
        if (user_id.length > 30) {
            replyContent.push(btn)
        }
        await e.reply(replyContent)
    }
}
