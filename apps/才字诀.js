import plugin from '../../../lib/plugins/plugin.js'
import fetch from "node-fetch";
import{segment}from'oicq'
import cfg from '../../../lib/config/config.js'
//作者：风 qq：459521475
//将每个以‘你’开头的句子换成‘你才’，然后艾特并返还给说那句话的人
export class example extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'helpall',
            /** 功能描述 */
            dsc: 'helpall',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1,
            rule: [

                {
                    reg: "^你([^你].*)$", //匹配消息正则，命令正则
                    fnc: 'cai'
                }
            ]
        })
    }

    async cai (e){
        if(e.user_id==cfg.qq || (e.at && e.at!=cfg.qq)) {
            return;
        }
        let charArr = e.toString().replace(/^你/, '你才')
        e.reply([segment.at(e.user_id),`${charArr}`])
    }
}