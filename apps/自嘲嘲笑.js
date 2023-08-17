import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from "lodash";
import YAML from 'yaml'
//插件作者：风 qq：459521475
//请参考注释进行修改,修改一下几个变量即可
let list = [459521475,2320616454,2277900494,2952838857]//禁止自嘲的QQ
let msglist = ['是大笨蛋','是憨憨','是大鲨臂','油饼'];//嘲笑的词条
let j = 4;//嘲笑词条数是多少这里就填多少
let re_msg1 = "您最伟大了，不用自嘲啦" //当自己不小心嘲笑别人时没艾特别人时的回复
let re_msg = "这位大人是伟大的，你不能嘲笑！" //当list里面的qq被别人艾特嘲笑时的回复
export class slander extends plugin {
    constructor() {
        super({
            name: '自嘲',
            dsc: '快去捉弄你的群友吧',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 1000,
            rule: [
                {
                    reg: '^#?(自嘲|嘲笑)(.*)$',
                    fnc: 'chao'
                }
            ]
        })
    }
    async chao(e) {
        console.log(e);
        if (!e.isGroup) {//不是群聊
            e.reply("就只有我在场你还想怎么自嘲，让我看吗");
            return true;
        }
        if(e.isMaster&&!e.at&&e.msg){
            e.reply(re_msg1);
            return true;
        }
        if(e.atme&&e.atall){
            e.reply("请艾特正确的人");
            return true;
        }
        if(!e.at&&e.msg){
            let msgs = [];
            let MsgList = [];
            for (let i = 0 ;i<j;i++){
                msgs.push([e.nickname,msglist[i]]);
                MsgList.push({
                    message: msgs[i],
                    nickname: e.nickname,
                    user_id: e.user_id
                });
            }
            let forwardMsg = await e.group.makeForwardMsg(MsgList);
            forwardMsg.data = forwardMsg.data
                .replace(/\n/g, '')
                .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                .replace(/___+/, `<title color="#777777" size="26">你被嘲笑了！快来看看吧～</title>`)
            await e.reply(forwardMsg)
            return true;
        }
        if(list.indexOf(e.at) > -1){
            e.reply(re_msg);
            return true;
        }
        let targetQQ = e.at;//获取嘲笑对象QQ
        let targetName = e.message[1].text.replace("@", "");//获得嘲笑对象名字
        let msgs = [];
        let MsgList = [];
        for (let i = 0 ;i<j;i++){
            msgs.push([targetName,msglist[i]]);
            MsgList.push({
                message: msgs[i],
                nickname: targetName,
                user_id: e.at
            });
        }
        let forwardMsg = await e.group.makeForwardMsg(MsgList);
        forwardMsg.data = forwardMsg.data
            .replace(/\n/g, '')
            .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
            .replace(/___+/, `<title color="#777777" size="26">你被嘲笑了！快来看看吧～</title>`)
        await e.reply(forwardMsg)
        return true;
    }
}