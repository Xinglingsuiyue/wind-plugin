import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from "lodash";
const zhihuhot='https://tenapi.cn/v2/zhihuhot'
export class slander extends plugin {
    constructor() {
        super({
            name: 'bilibili-weekly',
            dsc: '获取哔哩哔哩周榜',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: '^#?知乎(热搜榜|热榜|热度榜|热搜)$',
                    fnc: 'zhihuhot'
                }
            ]
        })
    }
    async zhihuhot(e){
        logger.info('[用户命令]', e.msg);
        let url=zhihuhot
        let res = await fetch(url).catch((err) => logger.error(err));
        if (!res) {
            logger.error('查询接口请求失败');
            return await this.reply('查询接口请求失败');
        }
        res = await res.json();
        logger.info(`请求结果：${res.msg}`);
        if(res.msg=="success"){
            e.reply("查询成功");
            let MsgList = [];
            let msg=[]
            let j = res.data.length
            for (let i = 0 ;i<j;i++){
                MsgList.push({
                    message: ["标题:",res.data[i].name,"\n热度:",res.data[i].hot,"\n直达链接:",res.data[i].url],
                    nickname: e.nickname,
                    user_id: e.user_id
                });
            }
            let forwardMsg = await e.group.makeForwardMsg(MsgList);
            forwardMsg.data = forwardMsg.data
                .replace(/\n/g, '')
                .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                .replace(/___+/, `<title color="#777777" size="26">知乎热搜榜～</title>`)
            await e.reply(forwardMsg)
        }
        else return e.reply(res.msg)
    }
}