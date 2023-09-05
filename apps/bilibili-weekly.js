import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from "lodash";
const bilibiliweekly='https://tenapi.cn/v2/weekly';
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
                    reg: '^#?(bilibili|哔哩哔哩)周榜(.*)$',
                    fnc: 'bilibili'
                }
            ]
        })
    }
    async bilibili(e){
        logger.info('[wind-plugin]', e.msg);
        let num;
        let url;
        let numreg = /[1-9][0-9]{4,12}/;
        let numret = numreg.exec(e.toString());
        if(numret){url=bilibiliweekly + `?num=${num}`}
        else{url=bilibiliweekly}
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
            let j = res.data.list.length
            MsgList.push({
                message: `当前查询期数:${res.data.name}`,
                nickname: e.nickname,
                user_id: e.user_id
            });
            MsgList.push({
                message: `若是想要查询其他期的bilibili周榜请在指令后加上期数(例如bilibili周榜123)，否则默认为最新`,
                nickname: e.nickname,
                user_id: e.user_id
            });
            for (let i = 0 ;i<j;i++){
                MsgList.push({
                    message: [segment.image(res.data.list[i].cover),"\n标题:",res.data.list[i].title,"\n推荐理由:",res.data.list[i].reason,"\n直达链接:",res.data.list[i].url],
                    nickname: e.nickname,
                    user_id: e.user_id
                });
            }
            let forwardMsg = await e.group.makeForwardMsg(MsgList);
            forwardMsg.data = forwardMsg.data
                .replace(/\n/g, '')
                .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                .replace(/___+/, `<title color="#777777" size="26">${res.data.name}哔哩哔哩周榜～</title>`)
            await e.reply(forwardMsg)
        }
        else return e.reply(res.msg)
    }
}