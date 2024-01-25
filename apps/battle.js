import plugin from '../../../lib/plugins/plugin.js'
import Cfg from '../../../lib/config/config.js'
import fs from 'fs';
import YAML from "yaml";
import{segment}from'oicq';
import moment from "moment"
import xiuxiandb from "../model/xiuxiandb.js"
import isqbot from '../model/isqbot.js';
let btn
const ani={
    step:1,
    name:"蓬蓬兽",
    level:20,
    experience:100,
    level_up:0,
    level_ave:0,
    experience_up:10,
    experience_ave:5,
    level_down:0,
    experience_down:0,
    num:10000
}
let path = process.cwd().replace(/\\/g, '/')
const dirpath=path+'/plugins/wind-plugin/resources/xiuxian-data'
const levelname=['凡人','练气期','筑基期','金丹期','元婴期','化神期','合体期','大乘期','渡劫期','人仙境','地仙境','天仙境','金仙境','大罗金仙境','准仙帝','仙帝','天人五衰境','圣人','大帝','道祖']
const findlevelname=["凡人","炼气第1层","炼气第2层","炼气第3层","炼气第4层","炼气第5层","炼气第6层","炼气第7层","炼气第8层","炼气第9层","筑基第1层","筑基第2层","筑基第3层","筑基第4层","筑基第5层","筑基第6层","筑基第7层","筑基第8层","筑基第9层","金丹第1层","金丹第2层","金丹第3层","金丹第4层","金丹第5层","金丹第6层","金丹第7层","金丹第8层","金丹第9层","元婴第1层","元婴第2层","元婴第3层","元婴第4层","元婴第5层","元婴第6层","元婴第7层","元婴第8层","元婴第9层","化神第1层","化神第2层","化神第3层","化神第4层","化神第5层","化神第6层","化神第7层","化神第8层","化神第9层","合体第1层","合体第2层","合体第3层","合体第4层","合体第5层","合体第6层","合体第7层","合体第8层","合体第9层","大乘第1层","大乘第2层","大乘第3层","大乘第4层","大乘第5层","大乘第6层","大乘第7层","大乘第8层","大乘第9层","渡劫第1层","渡劫第2层","渡劫第3层","渡劫第4层","渡劫第5层","渡劫第6层","渡劫第7层","渡劫第8层","渡劫第9层","人仙境初期","人仙境中期","人仙境后期","人仙境圆满","地仙境初期","地仙境中期","地仙境后期","地仙境圆满","天仙境初期","天仙境中期","天仙境后期","天仙境圆满","金仙境初期","金仙境中期","金仙境后期","金仙境圆满","大罗金仙境初期","大罗金仙境中期","大罗金仙境后期","大罗金仙境圆满","准仙帝境","准仙帝境圆满","仙帝境","仙帝境圆满","天人五衰之仙衰","天人五衰之躯衰","天人五衰之窍衰","天人五衰之魂衰","天人五衰之煞衰","圣人第1层","圣人第2层","圣人第3层","圣人第4层","圣人第5层","圣人第6层","圣人第7层","圣人第8层","圣人第9层"]
const level_exp=[0,50,100,150,200,250,300,350,400/*炼气*/,460,520,580,640,700,760,820,880,940/*筑基*/,1010,1080,1150,1220,1290,1360,1430,1500,1570/*金丹*/,1650,1730,1810,1890,1970,2050,2130,2210,2290/*元婴*/,2380,2470,2560,2650,2740,2830,2920,3010,3100/*化神*/,3200,3300,3400,3500,3600,3700,3800,3900,4000/*合体*/,4100,4200,4300,4400,4500,4600,4700,4800,4900/*大乘*/,5000,5100,5200,5300,5400,5500,5600,5700,5800/*渡劫*/,6000,6200,6400,6600/*人仙*/,6900,7200,7500,7800/*地仙*/,8150,8500,8850,9200/*天仙*/,9600,10000,10400,10800/*金仙*/,11200,11600,12000,12400/*大罗金仙*/,13000,13800/*准仙帝*/,14600,15500/*仙帝*/,16500,17500,18500,19500,20500/*天人五衰*/,21500,22500,23500,24500,25500,26500,27500,28500,29500,30500/*圣人*/];
const master_battled=true //主人是否会被别人攻打
const master_cd=false //主人是否需要cd
const cdtime_battle = 5 * 60 //决斗的冷却时间,初始为1分钟
const cdtime_ani = 5 * 60
export class xiuxian extends plugin {//修炼
    constructor() {
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
                    reg: "^#?(战斗|决斗|pk|PK|攻打|battle)(.*)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'battle'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?扣除境界(.*)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'de_level'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?扣除灵力(.*)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'de_exp'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?test2$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'test2'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?给他境界(.*)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'give_level'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?给他灵力(.*)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'give_exp'
                },
                //{
                  //  reg: "^#?清理妖兽",
                    //fnc: "ani"
                //},
                //{
				//	reg: '^#?妖兽信息',
				//	fnc: 'ani_ms'
                //}
            ]
        })
    }
    async give_exp(e){
        let user_id=e.user_id
        if(user_id.length>30){
            btn=isqbot.btn
        }
        if(!e.isMaster) return await e.reply("你还想给别人灵力，先修炼吧")
        let msg=e.msg
        msg=msg.replace(/#?给他灵力/g,'');
        let uid=msg.split(':')[0]
        let exp=msg.split(':')[1]
        if(!uid||!exp) return await e.reply("请输入正确的参数")
        let at_data=await xiuxiandb.getUserById(uid)
        if (at_data===null) {
			e.reply("请输入正确的id")
        }
        if(!at_data.group_id.includes(e.group_id)){
			at_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        let at_id = at_data.user_id
        let exe=Number(at_data.experience)
        at_data.experience=exe+Number(exp);
        await xiuxiandb.updateUserInfo(at_id,at_data)
        let lev=at_data.level
        let exerp=100*(lev-110)+3050;
        let need
        if(at_data.experience < level_exp[lev] && at_data.level<111) need=level_exp[lev]-at_data.experience
        else if (at_data.level>110 && at_data.experience<exerp) need=exerp - at_data.experience
        else need=0
        if(user_id.length>30) return await e.reply([segment.at(at_id),`恭喜你，获得了${exp}点灵力,\n你的境界是${at_data.levelname},你的灵力是${at_data.experience},\n您还需要:${need}点灵力突破下一境界,\n继续努力修炼吧`,btn])
        return await e.reply([segment.at(at_id),`恭喜你，获得了${exp}点灵力,\n你的境界是${at_data.levelname},你的灵力是${at_data.experience},\n您还需要:${need}点灵力突破下一境界,\n继续努力修炼吧`])
    }
    async give_level(e){
        let user_id=e.user_id
        if(user_id.length>30){
            btn=isqbot.btn
        }
        if(!e.isMaster) return await e.reply("你还想给别人境界，先修炼吧")
        let msg=e.msg
        msg=msg.replace(/#?给他境界/g,'');
        let uid=msg.split(':')[0]
        let lev=msg.split(':')[1]
        if(!uid||!lev) return await e.reply("请输入正确的参数")
        let at_data=await xiuxiandb.getUserById(uid)
        if (at_data===null) {
			e.reply("请输入正确的id")
        }
        if(!at_data.group_id.includes(e.group_id)){
			at_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        let at_id = at_data.user_id
        let leve=Number(at_data.level)
        at_data.level=leve+Number(lev);
        if(at_data.level<111) at_data.levelname=findlevelname[at_data.level];
        if(at_data.level>110&&at_data.level<10000) at_data.levelname=`大帝第${at_data.level-110}重天`;
        if(at_data.level>=10000) at_data.levelname="道祖";
        await xiuxiandb.updateUserInfo(at_id,at_data)
        lev=at_data.level
        let exerp=100*(lev-110)+3050;
        let need
        if(at_data.experience < level_exp[lev] && at_data.level<111) need=level_exp[lev]-at_data.experience
        else if (at_data.level>110 && at_data.experience<exerp) need=exerp - at_data.experience
        else need=0
        if(user_id.length>30) return await e.reply([segment.at(at_id),`恭喜你，获得了${lev}层境界,\n你的境界是${at_data.levelname},你的灵力是${at_data.experience},\n您还需要:${need}点灵力突破下一境界,\n继续努力修炼吧`,btn])
        return await e.reply([segment.at(at_id),`恭喜你，获得了${lev}层境界,\n你的境界是${at_data.levelname},你的灵力是${at_data.experience},\n您还需要:${need}点灵力突破下一境界,\n继续努力修炼吧`])
    }
    async de_level(e){
		let user_id=e.user_id
        if(user_id.length>30){
            btn=isqbot.btn
        }
        if(!e.isMaster) return await e.reply("你还想给别人灵力，先修炼吧")
        let msg=e.msg
        msg=msg.replace(/#?扣除境界/g,'');
        let uid=msg.split(':')[0]
        let exp=msg.split(':')[1]
        if(!uid||!exp) return await e.reply("请输入正确的参数")
        let at_data=await xiuxiandb.getUserById(uid)
        if (at_data===null) {
			e.reply("请输入正确的id")
        }
        if(!at_data.group_id.includes(e.group_id)){
			at_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        let at_id = at_data.user_id
        let exe=Number(at_data.level)
        at_data.level=exe-Number(exp);
        if(at_data.level<0) at_data.level=0
        if(at_data.level<111) at_data.levelname=findlevelname[at_data.level];
        if(at_data.level>110&&at_data.level<10000) at_data.levelname=`大帝第${at_data.level-110}重天`;
        if(at_data.level>=10000) at_data.levelname="道祖";
        await xiuxiandb.updateUserInfo(at_id,at_data)
        await e.reply([segment.at(e.user_id),`您斩落了\n`,segment.at(at_id),`境界${exp}层`]);
        if(user_id.length>30) return await e.reply([segment.at(e.user_id),`\n对方的境界是:${at_data.levelname},\n对方的灵力为:${at_data.experience}`,btn]);
        return await e.reply([segment.at(e.user_id),`\n对方的境界是:${at_data.levelname},\n对方的灵力为:${at_data.experience}`]);
    }
    async de_exp(e){
		let user_id=e.user_id
        if(user_id.length>30){
            btn=isqbot.btn
        }
        if(!e.isMaster) return await e.reply("你还想给别人灵力，先修炼吧")
        let msg=e.msg
        msg=msg.replace(/#?扣除灵力/g,'');
        let uid=msg.split(':')[0]
        let exp=msg.split(':')[1]
        if(!uid||!exp) return await e.reply("请输入正确的参数")
        let at_data=await xiuxiandb.getUserById(uid)
        if (at_data===null) {
			e.reply("请输入正确的id")
        }
        if(!at_data.group_id.includes(e.group_id)){
			at_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        let at_id = at_data.user_id
        let exe=Number(at_data.experience)
        at_data.experience=exe-Number(exp);
        await xiuxiandb.updateUserInfo(at_id,at_data)
        await e.reply([segment.at(e.user_id),`您斩落了\n`,segment.at(at_id),`灵力${exp}点`]);
        if(user_id.length>30) return await e.reply([segment.at(e.user_id),`\n对方的境界是:${at_data.levelname},\n对方的灵力为:${at_data.experience}`,btn]);
        return await e.reply([segment.at(e.user_id),`\n对方的境界是:${at_data.levelname},\n对方的灵力为:${at_data.experience}`]);
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
    async battle(e){
        let user_id=e.user_id
        if(user_id.length>30){
            btn=isqbot.btn
        }
        let numreg = /[1-9][0-9]{0,12}/;
        let uid= Number(numreg.exec(e.msg));
        if(user_id.length>30&&!uid) return e.reply([segment.at(e.user_id),"你倒是说一说你跟谁决斗啊！他的id呢？",btn])
        if(!e.at&&!uid){
            return e.reply([segment.at(e.user_id),"大笨蛋，你要打谁你倒是说啊！！"])
        }
        if(e.atme||e.atall||e.at==e.user_id){
            return e.reply([segment.at(e.user_id),"大笨蛋，你艾特错了！！"])
        }
        let at_id
        let at_data
        if (!uid) {
			at_id= e.at;
			at_data=await xiuxiandb.getUserInfo(e.at)
        }
        if(!e.at){
			at_data=await xiuxiandb.getUserById(uid)
            at_id=at_data.user_id
        }
        if(at_data===null){
			return e.reply("请输入正确的用户id")
        }
        if(!at_data.group_id.includes(e.group_id)){
            return e.reply("请输入正确的用户id")
        }
        if(at_id==user_id){
			return e.reply("自己不能跟自己决斗")
        }
        let cdtime = await this.btinCd();
        if(this.e.isMaster && !master_cd){
            cdtime = 0;
        }
        if (cdtime) {
            if(user_id.length>30){
                return await e.reply([segment.at(e.user_id),`上一场战斗刚过去不久呢,你太累了,还有${cdtime}秒cd`,btn]);
            }
            return await e.reply([segment.at(e.user_id),`上一场战斗刚过去不久呢,你太累了,还有${cdtime}秒cd`]);
        }
        let user_data=await xiuxiandb.getUserInfo(user_id)
        if (user_data===null) {//如果json中不存在该用户
            if(user_id.length>30){
                return await e.reply([segment.at(e.user_id),"你还没有修炼过呢，想和别人决斗先修炼一下吧",btn]);
            }
            return e.reply([segment.at(e.user_id),"你还没有修炼过呢，想和别人决斗先修炼一下吧"])
        }
        let score;
        let sc
        let experience_user
        let experience_at
        let level_user
        let level_at
        sc = (user_data.level * 3 + user_data.experience) / (user_data.level * 3 + user_data.experience + at_data.level * 3 + at_data.experience) * 100;
        score = sc.toFixed(2);
        let sscore=Math.random()
        await e.reply([segment.at(e.user_id),`你的境界是${user_data.levelname},你的灵力值为${user_data.experience},\n`,segment.at(at_id),`的境界是${at_data.levelname},对方的灵力值为${at_data.experience},\n你赢的概率约为${score}%`]);
        if(score>(Math.random()*100)){
            if(score>95&&Math.random()<0.01){
                at_data.level=0;
                at_data.experience=0;
                at_data.levelname="凡人"
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"对方与你的差距太大了,对方直接被你抓住没跑掉,你将他打回凡人,从头修炼",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"对方与你的差距太大了,对方直接被你抓住没跑掉,你将他打回凡人,从头修炼"]);
            }
            else if(score>70){
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"与你差距较大，你轻松战胜了敌人，你们两个都没有获得提升",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"与你差距较大，你轻松战胜了敌人，你们两个都没有获得提升"])
            }
            else if(score>40&&sscore<0.3){
                experience_at=Math.round(6 + 5 * Math.random());
                experience_user=experience_at+Math.round(0 + 5 * Math.random());
                at_data.experience+=experience_at;
                user_data.experience+=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下，经过激烈的战斗之后你赢了，你们都获得了一些经验,\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下，经过激烈的战斗之后你赢了，你们都获得了一些经验,\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`]);
            }
            else if(score>40&&sscore<0.6){
                experience_at=Math.round(4 + 2 * Math.random());
                experience_user=experience_at-Math.round(0 + 2 * Math.random());
                at_data.experience-=experience_at;
                user_data.experience-=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下你打赢了对方，但是你们两个因为消耗巨大导致灵力流失,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下你打赢了对方，但是你们两个因为消耗巨大导致灵力流失,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`]);
            }
            else if(score>40){
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升"]);
            }
            else if(score>20&&sscore<0.5){
                experience_user=Math.round(10 + 10 * Math.random());
                experience_at=experience_user+Math.round(0 + 10 * Math.random());
                at_data.experience-=experience_at;
                user_data.experience+=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你因机缘巧合打败了对方，获得大量的经验值,\n你获得了${experience_user}点灵力对方丢失了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你因机缘巧合打败了对方，获得大量的经验值,\n你获得了${experience_user}点灵力对方丢失了${experience_at}点灵力`]);
            }
            else if(score<20&&sscore<0.2){
                level_user=Math.round(0 + 2 * Math.random());
                experience_user=Math.round(10 + 10 * Math.random());
                user_data.experience+=experience_user;
                user_data.level+=level_user;
                at_data.level-=level_user;
                at_data.experience-=experience_user;
                if(at_data.level<0) at_data.level=0
                if(user_data.level<111) user_data.levelname=findlevelname[user_data.level];
                if(user_data.level>110&&user_data.level<10000) user_data.levelname=`大帝第${user_data.level-110}重天`;
                if(user_data.level>=10000) user_data.levelname="道祖";
                if(at_data.level<111) at_data.levelname=findlevelname[at_data.level];
                if(at_data.level>110&&at_data.level<10000) at_data.levelname=`大帝第${at_data.level-110}重天`;
                if(at_data.level>=10000) at_data.levelname="道祖";
                if(user_id.length>30) await e.reply([segment.at(e.user_id),`你忽然觉醒，灵气值和境界提升，成功反杀了`,'\n',segment.at(at_id),'',`\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_user}个境界，丢失了${experience_user}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),`你忽然觉醒，灵气值和境界提升，成功反杀了`,'\n',segment.at(at_id),`\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_user}个境界，丢失了${experience_user}点灵力`]);
            }
            else if(score<10&&sscore<0.3){
                level_user=Math.round(2 + 2 * Math.random());
                experience_user=Math.round(10 + 20 * Math.random());
                level_at=Math.round(0 + 2 * Math.random());
                experience_at=Math.round(10 + 20 * Math.random());
                user_data.experience+=experience_user;
                user_data.level+=level_user;
                at_data.level-=level_at;
                if(at_data.level<0) at_data.level=0
                at_data.experience-=experience_at;
                if(user_data.level<111) user_data.levelname=findlevelname[user_data.level];
                if(user_data.level>110&&user_data.level<10000) user_data.levelname=`大帝第${user_data.level-110}重天`;
                if(user_data.level>=10000) user_data.levelname="道祖";
                if(at_data.level<111) at_data.levelname=findlevelname[at_data.level];
                if(at_data.level>110&&at_data.level<10000) at_data.levelname=`大帝第${at_data.level-110}重天`;
                if(at_data.level>=10000) at_data.levelname="道祖";
                if(user_id.length>30) await e.reply([segment.at(e.user_id),`你人品大爆发了，获得天道青睐，成功爆发进阶，反杀了`,'\n',segment.at(at_id),`\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_at}个境界，丢失了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),`你人品大爆发了，获得天道青睐，成功爆发进阶，反杀了`,'\n',segment.at(at_id),`\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_at}个境界，丢失了${experience_at}点灵力`]);
            }
            else{
				if(user_id.length>30) await e.reply([segment.at(e.user_id),`你由于别人帮助打败了`,'\n',segment.at(at_id),`\n你们都没有任何提升`,btn]);
                else await e.reply([segment.at(e.user_id),`你由于别人帮助打败了`,'\n',segment.at(at_id),`\n你们都没有任何提升`]);
            }
        }
        else{
            if(score>90&&sscore>0.9){
                level_at=Math.round(0 + 2 * Math.random());
                experience_at=Math.round(10 + 20 * Math.random());
                level_user=Math.round(0 + 2 * Math.random());
                experience_user=Math.round(10 + 20 * Math.random());
                at_data.experience+=experience_at;
                at_data.level+=level_at;
                user_data.level-=level_user;
                user_data.experience-=experience_user;
                if(user_data.level<0) user_data.level=0
                if(user_data.level<111) user_data.levelname=findlevelname[user_data.level];
                if(user_data.level>110&&user_data.level<10000) user_data.levelname=`大帝第${user_data.level-110}重天`;
                if(user_data.level>=10000) user_data.levelname="道祖";
                if(at_data.level<111) at_data.levelname=findlevelname[at_data.level];
                if(at_data.level>110&&at_data.level<10000) at_data.levelname=`大帝第${at_data.level-110}重天`;
                if(at_data.level>=10000) at_data.levelname="道祖";
                if(user_id.length>30) await e.reply([segment.at(e.user_id),`虽然你领先了`,'\n',segment.at(at_id),'\n',`很多个境界，但是对方忽然人品大爆发，获得了天道青睐，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_at}个境界，获得了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),`虽然你领先了`,'\n',segment.at(at_id),'\n',`很多个境界，但是对方忽然人品大爆发，获得了天道青睐，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_at}个境界，获得了${experience_at}点灵力`]);
            }
            else if(score>80&&sscore>0.8){
                level_at=Math.round(0 + 1 * Math.random());
                experience_at=Math.round(10 + 20 * Math.random());
                at_data.experience+=experience_at;
                at_data.level+=level_at;
                user_data.level-=level_at;
                user_data.experience-=experience_at;
                if(user_data.level<0) user_data.level=0
                if(user_data.level<111) user_data.levelname=findlevelname[user_data.level];
                if(user_data.level>110&&user_data.level<10000) user_data.levelname=`大帝第${user_data.level-110}重天`;
                if(user_data.level>=10000) user_data.levelname="道祖";
                if(at_data.level<111) at_data.levelname=findlevelname[at_data.level];
                if(at_data.level>110&&at_data.level<10000) at_data.levelname=`大帝第${at_data.level-110}重天`;
                if(at_data.level>=10000) at_data.levelname="道祖";
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`忽然觉醒，灵气值和境界获得提升，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_user}个境界，获得了${experience_user}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`忽然觉醒，灵气值和境界获得提升，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_user}个境界，获得了${experience_user}点灵力`]);
            }
            else if(score>60&&sscore>0.5){
                experience_at=Math.round(10 + 5 * Math.random());
                experience_user=experience_at+Math.round(0 + 5 * Math.random());
                at_data.experience+=experience_at;
                user_data.experience-=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`机缘巧合下击败了你，对方获得了大量经验,\n你损失了${experience_user}点灵力,\n对方获得了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`机缘巧合下击败了你，对方获得了大量经验,\n你损失了${experience_user}点灵力,\n对方获得了${experience_at}点灵力`,btn]);
            }
            else if(score>60){
                if(user_id.length>30) await e.reply([segment.at(at_id),`对方由于别人帮助打败了你`,'\n',segment.at(user_id),`\n你们都没有任何提升`,btn]);
                else await e.reply([segment.at(at_id),`你由于别人帮助打败了`,'\n',segment.at(user_id),`\n你们都没有任何提升`]);
            }
            else if(score>40&&sscore>0.7){
                experience_at=Math.round(6 + 2 * Math.random());
                experience_user=experience_at+Math.round(0 + 2 * Math.random());
                at_data.experience+=experience_at;
                user_data.experience+=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下，经过激烈的战斗之后你还是输了，但是你们都获得了一些经验\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下，经过激烈的战斗之后你还是输了，但是你们都获得了一些经验\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`]);
            }
            else if(score>40&&Math.random()>0.4){
                experience_at=Math.round(4 + 2 * Math.random());
                experience_user=experience_at-Math.round(0 + 2 * Math.random());
                at_data.experience-=experience_at;
                at_data.experience-=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下你打赢了对方，激烈战斗后,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下你打赢了对方，激烈战斗后,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`]);
            }
            else if(score>40){
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升"])
            }
            else if(score>20&&sscore>0.4){
				experience_user=Math.round(4 + 2 * Math.random());
                user_data.experience-=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),"\n你们实力相差太大，你被对方",'\n',segment.at(at_id),`打落灵力${experience_user}点`,btn]);
                else await e.reply([segment.at(e.user_id),"\n你们实力相差太大，你被对方",'\n',segment.at(at_id),`打落灵力${experience_user}点`])
            }
            else if(score<20&&sscore>0.6){
                user_data.level=0;
                user_data.experience=0;
                user_data.levelname="凡人"
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力相差太过悬殊，你被对面抓起来废了，需要重头修炼了",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力相差太过悬殊，你被对面抓起来废了，需要重头修炼了"])
            }
            else{
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们的境界相差过大了，你直接被对方吊打，再修炼一下再来决斗吧",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们的境界相差过大了，你直接被对方吊打，再修炼一下再来决斗吧"])
            }
        }
        await this.btsetCd(cdtime_battle)
        await xiuxiandb.updateUserInfo(user_id,user_data)
        await xiuxiandb.updateUserInfo(at_id,at_data)
    }
}