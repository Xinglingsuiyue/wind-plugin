import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from "lodash";
//插件作者：风  qq：459521475
const order = 'https://way.jd.com/jisuapi/search';
const appkey='da39dce4f8aa52155677ed8cd23a6470';
export class example extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: '做菜系统',
            /** 功能描述 */
            dsc: '教你如何做好菜',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1,
            rule: [

                {
                    reg: "^#?(做菜|order|菜谱)(.*)$", //匹配消息正则，命令正则
                    fnc: 'order'
                }
            ]
        })
    }

    async order (e){
        logger.info('[点菜系统.js]', e.msg);
        let num=5;
        let keyword=e.toString().replace(/^#?(点菜|order|菜谱)/,'')
        let numreg = /[1-9][0-9]{0,12}/;
        let numret= numreg.exec(e.toString());
        if(numret>10) return e.reply("您点的数量太多了，请减少到10以下！！");
        if(numret){
            num=numret;
            keyword=keyword.replace(/\d/g,'');
        }
        let url = order + `?keyword=${keyword}&num=${num}&appkey=${appkey}`
        let res = await fetch(url).catch((err) => logger.error(err));
        if (!res) {
            logger.error('查询接口请求失败');
            return await this.reply('查询接口请求失败');
        }
        res = await res.json();
        logger.info(`请求结果：${res.msg}`);
        if(res.msg=="查询成功"){
            e.reply("请求成功");
            if(res.result.msg!="ok"){
                return e.reply("查询失败请检查菜名是否正确～～")
            }
            let MsgList = [];
            let msg=[]
            MsgList.push({
                message: ["总共检索到的菜式数量:"+res.result.result.total+"\n查询出的菜单数量:"+res.result.result.num],
                nickname: e.nickname,
                user_id: e.user_id
            });
            let a = 1
            let j = res.result.result.num;
            let line
            for (let i = 0 ;i<j;i++){
                line = i+1
                MsgList.push({
                    message: ["--------------------------------\n**********菜式"+line+"**********\n--------------------------------"],
                    nickname: e.nickname,
                    user_id: e.user_id
                });
                MsgList.push({
                    message: [segment.image(res.result.result.list[i].pic),"\n菜名:",res.result.result.list[i].name,"\n适宜人数:",res.result.result.list[i].peoplenum,"\n准备时间:",res.result.result.list[i].preparetime,"\n作菜时间:",res.result.result.list[i].cookingtime,"\n菜品tag:",res.result.result.list[i].tag],
                    nickname: e.nickname,
                    user_id: e.user_id
                });
                let b=res.result.result.list[i].material.length;
                let c=res.result.result.list[i].process.length;
                let material=res.result.result.list[i].material[0].mname+res.result.result.list[i].material[0].amount
                for(a;a<b;a++){
                    material=material+","+res.result.result.list[i].material[a].mname+res.result.result.list[i].material[a].amount
                }
                a=0
                MsgList.push({
                    message: ["配料表:",material],
                    nickname: e.nickname,
                    user_id: e.user_id
                });
                MsgList.push({
                    message: "制作方法:",
                    nickname: e.nickname,
                    user_id: e.user_id
                });
                for(a;a<c;a++){
                    line = a+1;
                    MsgList.push({
                        message: [segment.image(res.result.result.list[i].process[a].pic),"\n"+line+".",res.result.result.list[i].process[a].pcontent],
                        nickname: e.nickname,
                        user_id: e.user_id
                    });
                }
                a=1
            }
            let forwardMsg = await e.group.makeForwardMsg(MsgList);
            forwardMsg.data = forwardMsg.data
                .replace(/\n/g, '')
                .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                .replace(/___+/, `<title color="#777777" size="26">${keyword}如何做～～</title>`)
            e.reply(typeof forwardMsg.data);
            await e.reply(forwardMsg)
        }
        else return e.reply(res.msg)
    }
}