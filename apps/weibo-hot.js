import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from "lodash";
const weibohot='https://tenapi.cn/v2/weibohot'
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
                    reg: '^#?微博(热搜榜|热榜|热度榜|热搜)$',
                    fnc: 'weibohot'
                }
            ]
        })
    }
    async weibohot(e){
        logger.info('[wind-plugin]', e.msg);
        let url=weibohot
        let res = await fetch(url).catch((err) => logger.error(err));
        if (!res) {
            logger.error('查询接口请求失败');
            return await this.reply('查询接口请求失败');
        }
        res = await res.json();
        logger.info(`请求结果：${res.msg}`);
        if(res.msg=="success"){
            let MsgList = [];
            let msg=[]
            let j = res.data.length
            if(j==0) return await e.reply("未查询到结果")
            if ([1, '1', 4, '4'].includes(e.bot.config.markdown?.type)){
                let msg = ``
                let btn = []
                e.Buttons = []
                for (let i = 0; i < ((j < 10) ? j : 10); i++) {
                    msg += `\r\r#热搜${ i + 1 }: \r\r>标题:${res.data[i].name} \r\r>热度:${res.data[i].hot}`
                    btn.push({
                        label: `${ i + 1 }`,
                        link: `${res.data[i].url}`,
                    })
                    if (btn.length == 5){
                        e.Buttons.push(btn)
                        btn = []
                    }
                }
                if (btn.length > 0){
                    e.Buttons.push(btn)
                }
                return await e.reply(msg)
            }
            if(Bot[e.self_id].adapter.name=="微信Bot"||Bot[e.self_id].adapter.name=="QQ频道Bot"){
                let msg= `热搜1: 标题:${res.data[0].name}热度:${res.data[0].hot}直达链接:${res.data[0].url}`
                if(j<10){
                    for (let i = 1; i < j; i++){
                        let m= i + 1
                        msg = msg + `\n热搜${m}: 标题:${res.data[i].name}热度:${res.data[i].hot}直达链接:${res.data[i].url}`
                    }
                }
                else{
                    for (let i = 1; i < 10; i++){
                        let m= i + 1
                        msg = msg + `\n热搜${m}: 标题:${res.data[i].name}热度:${res.data[i].hot}直达链接:${res.data[i].url}`
                    }
                }
                return e.reply(msg);
            }
            if(Bot[e.self_id].adapter.name=="QQBot"){
                let msg= `\n热搜1: 标题:${res.data[0].name}热度:${res.data[0].hot}`
                let arr = []
                let atns = []
                let btns = []
                let ctns = []
                let buttons = []
                arr.push({
                    text: `热搜1`,
                    link: `${res.data[0].url}`,
                })
                if(j<10){
                    for (let i = 1; i < j; i++){
                        let m= i + 1
                        msg = msg + `\n热搜${m}: 标题:${res.data[i].name}热度:${res.data[i].hot}`
                        arr.push({
                            text: `热搜${m}`,
                            link: `${res.data[i].url}`,
                        })
                        if(arr.length==2){
                            buttons.push(arr)
                            arr=[]
                        }
                    }
                }
                else{
                    for (let i = 1; i < 10; i++){
                        let m= i + 1
                        msg = msg + `\n热搜${m}: 标题:${res.data[i].name}热度:${res.data[i].hot}`
                        arr.push({
                            text: `热搜${m}`,
                            link: `${res.data[i].url}`,
                        })
                        if(arr.length==2){
                            buttons.push(arr)
                            arr=[]
                        }
                    }
                }
                if (arr.length) {
                    buttons.push(arr)
                }
                for(let btn of buttons) {atns.push(btn[0]);btns.push(btn[1]);}
                return e.reply([msg,segment.button(atns,btns,ctns)]);
            }
            for (let i = 0 ;i<j;i++){
                MsgList.push({
                    message: ["标题:",res.data[i].name,"\n热度:",res.data[i].hot,"\n直达链接:",res.data[i].url],
                    nickname: e.nickname,
                    user_id: e.user_id
                });
            }
            let forwardMsg
            if(!e.isGroup){
                forwardMsg = await e.friend.makeForwardMsg(MsgList);
            }
            else{
                forwardMsg = await e.group.makeForwardMsg(MsgList);
            }
            if(typeof forwardMsg.data!='string'){forwardMsg.data = JSON.stringify(forwardMsg.data)}
            forwardMsg.data = forwardMsg.data
                .replace(/\n/g, '')
                .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                .replace(/___+/, `<title color="#777777" size="26">微博热搜榜～</title>`)
            await e.reply(forwardMsg)
        }
        else return e.reply(res.msg)
    }
}