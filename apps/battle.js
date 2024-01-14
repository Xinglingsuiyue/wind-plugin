import plugin from '../../../lib/plugins/plugin.js'
import Cfg from '../../../lib/config/config.js'
import fs from 'fs';
import YAML from "yaml";
import{segment}from'oicq';
import moment from "moment"
import isqbot from '../model/isqbot.js';
let btn
let path = process.cwd().replace(/\\/g, '/')
const dirpath=path+'/plugins/wind-plugin/resources/xiuxian-data'
const levelname=['凡人','练气期','筑基期','金丹期','元婴期','化神期','合体期','大乘期','渡劫期','人仙境','地仙境','天仙境','金仙境','大罗金仙境','准仙帝','仙帝','天人五衰境','圣人','大帝','道祖']
const findlevelname=["凡人","炼气第1层","炼气第2层","炼气第3层","炼气第4层","炼气第5层","炼气第6层","炼气第7层","炼气第8层","炼气第9层","筑基第1层","筑基第2层","筑基第3层","筑基第4层","筑基第5层","筑基第6层","筑基第7层","筑基第8层","筑基第9层","金丹第1层","金丹第2层","金丹第3层","金丹第4层","金丹第5层","金丹第6层","金丹第7层","金丹第8层","金丹第9层","元婴第1层","元婴第2层","元婴第3层","元婴第4层","元婴第5层","元婴第6层","元婴第7层","元婴第8层","元婴第9层","化神第1层","化神第2层","化神第3层","化神第4层","化神第5层","化神第6层","化神第7层","化神第8层","化神第9层","合体第1层","合体第2层","合体第3层","合体第4层","合体第5层","合体第6层","合体第7层","合体第8层","合体第9层","大乘第1层","大乘第2层","大乘第3层","大乘第4层","大乘第5层","大乘第6层","大乘第7层","大乘第8层","大乘第9层","渡劫第1层","渡劫第2层","渡劫第3层","渡劫第4层","渡劫第5层","渡劫第6层","渡劫第7层","渡劫第8层","渡劫第9层","人仙境初期","人仙境中期","人仙境后期","人仙境圆满","地仙境初期","地仙境中期","地仙境后期","地仙境圆满","天仙境初期","天仙境中期","天仙境后期","天仙境圆满","金仙境初期","金仙境中期","金仙境后期","金仙境圆满","大罗金仙境初期","大罗金仙境中期","大罗金仙境后期","大罗金仙境圆满","准仙帝境","准仙帝境圆满","仙帝境","仙帝境圆满","天人五衰之仙衰","天人五衰之躯衰","天人五衰之窍衰","天人五衰之魂衰","天人五衰之煞衰","圣人第1层","圣人第2层","圣人第3层","圣人第4层","圣人第5层","圣人第6层","圣人第7层","圣人第8层","圣人第9层"]
const level_exp=[0,5,10,15,20,25,30,35,40,46,52,58,64,70,76,82,88,94,101,108,115,122,129,136,143,150,157,165,173,181,189,197,205,213,221,229,238,247,256,265,274,283,292,301,301,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,600,620,640,660,690,720,750,780,815,850,885,920,960,1000,1040,1080,1120,1160,1200,1240,1300,1380,1460,1550,1650,1750,1850,1950,2050,2150,2250,2350,2450,2550,2650,2750,2850,2950,3050];
const master_battled=true //主人是否会被别人攻打
const master_cd=false //主人是否需要cd
const cdtime_battle = 5 * 60 //决斗的冷却时间,初始为1分钟
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
                }
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
		let filename='xiuxian.json'
		if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        let at_id
        const json = JSON.parse(fs.readFileSync(dirpath + "/" + filename));//读取文件
        for (let key in json) {
				if (json[key].id == uid) {
					at_id=key
				}
			}
			if(!at_id){
				return e.reply("请输入正确的用户id")
			}
		let exe=Number(json[at_id].experience)
		json[at_id].experience=exe+Number(exp);
		fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
		let lev=json[at_id].level
        let exerp=100*(lev-110)+3050;
        let need
        if(json[at_id].experience < level_exp[lev] && json[at_id].level<111) need=level_exp[lev]-json[at_id].experience
        else if (json[at_id].level>110 && json[at_id].experience<exerp) need=exerp - json[at_id].experience
        else need=0
        filename=[e.group_id]+'.json';
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        const groupjson = JSON.parse(fs.readFileSync(dirpath + "/" + filename));
        if (!groupjson.hasOwnProperty(at_id)) {//如果json中不存在该用户
            let new_data = {//创建新用户
                "experience": 0,
                "level": 0,
                "levelname": '凡人',
                "Privilege": 0,
            };
            groupjson[at_id] = new_data
        }
        groupjson[at_id].id=json[at_id].id;
        groupjson[at_id].experience=json[at_id].experience;
        groupjson[at_id].level=json[at_id].level;
        groupjson[at_id].levelname=json[at_id].levelname;
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(groupjson, null, "\t"));
		return await e.reply([segment.at(at_id),`恭喜你，获得了${exp}点灵力,\n你的境界是${json[at_id].levelname},你的灵力是${json[at_id].experience},\n您还需要:${need}点灵力突破下一境界,\n继续努力修炼吧`,btn])
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
		let filename=[e.group_id]+'.json'
		if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        let at_id
        const json = JSON.parse(fs.readFileSync(dirpath + "/" + filename));//读取文件
        for (let key in json) {
				if (json[key].id == uid) {
					at_id=key
				}
			}
			if(!at_id){
				return e.reply("请输入正确的用户id")
			}
		let leve=Number(json[at_id].level)
		json[at_id].level=leve+Number(lev);
		if(json[at_id].level<111) json[at_id].levelname=findlevelname[json[at_id].level];
		if(json[at_id].level>110&&json[at_id].level<10000) json[at_id].levelname=`大帝第${json[at_id].level-101}重天`;
		if(json[at_id].level>=10000) json[at_id].levelname="道祖";
		fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
		lev=json[at_id].level
        let exerp=100*(lev-110)+3050;
        let need
        if(json[at_id].experience < level_exp[lev] && json[at_id].level<111) need=level_exp[lev]-json[at_id].experience
        else if (json[at_id].level>110 && json[at_id].experience<exerp) need=exerp - json[at_id].experience
        else need=0
        filename=[e.group_id]+'.json';
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        const groupjson = JSON.parse(fs.readFileSync(dirpath + "/" + filename));
        if (!groupjson.hasOwnProperty(at_id)) {//如果json中不存在该用户
            let new_data = {//创建新用户
                "experience": 0,
                "level": 0,
                "levelname": '凡人',
                "Privilege": 0,
            };
            groupjson[at_id] = new_data
        }
        groupjson[at_id].id=json[at_id].id;
        groupjson[at_id].experience=json[at_id].experience;
        groupjson[at_id].level=json[at_id].level;
        groupjson[at_id].levelname=json[at_id].levelname;
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(groupjson, null, "\t"));
		return await e.reply([segment.at(at_id),`恭喜你，获得了${lev}层境界,\n你的境界是${json[at_id].levelname},你的灵力是${json[at_id].experience},\n您还需要:${need}点灵力突破下一境界,\n继续努力修炼吧`,btn])
    }
    async de_level(e){
        if(!e.isMaster){
            return await e.reply("哈哈，就凭你也敢对别人的境界动手,🤣👉🏻🤡");
        }
        let numreg = /[1-9][0-9]{0,12}/;
        let numret= parseInt(numreg.exec(e.msg));
        let user_id = e.at;
        let filename=[e.group_id]+".json"
        if(!e.at||e.at==e.user_id){
            filename="masterxiuxian.json";
        }
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        const json = JSON.parse(fs.readFileSync(dirpath + "/" + filename));//读取文件
        if(json[user_id].level < numret){
            numret=json[user_id].level;
        }
        json[user_id].level -= numret;
        for(let j=0;j<18;j++){
            if(json[user_id].level == j) json[user_id].levelname = levelname[j];
        }
        if (json[user_id].level > 16 && json[user_id].level < 42) {
            let level_name = json[user_id].level - 16
            json[user_id].levelname = levelname[16] + `第${level_name}境`
        }
        if (json[user_id].level > 41 && json[user_id].level < 2001) {
            let level_name = json[user_id].level - 41
            json[user_id].levelname = levelname[18] + `${level_name}重天`
        }
        if (json[user_id].level > 2000) json[user_id].levelname = levelname[19];
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));
        await e.reply([segment.at(e.user_id),`您斩落了`,segment.at(e.at),`境界${numret}层`]);
        await e.reply([segment.at(e.user_id),`\n对方的境界是:${json[user_id].levelname},\n对方的灵力为:${json[user_id].experience}`]);
    }
    async de_exp(e){
        if(!e.isMaster){
            return await e.reply("哈哈，就凭你也敢对别人的灵力值动手,🤣👉🏻🤡");
        }
        let msg=e.msg.replace(/#?扣除灵力/g,'');
        let user_id
        if(e.at) user_id = e.at;
        let filename=[e.group_id]+".json"
        if(!e.at||e.at==e.user_id){
            filename="masterxiuxian.json";
        }
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        const json = JSON.parse(fs.readFileSync(dirpath + "/" + filename));//读取文件
        if(json[user_id].experience < numret){
            numret = json[user_id].experience;
        }
        json[user_id].experience-=numret;
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));
        await e.reply([segment.at(e.user_id),`您斩落了`,segment.at(e.at),`灵力${numret}点`]);
        await e.reply([segment.at(e.user_id),`\n对方的境界是:${json[user_id].levelname},\n对方的灵力为:${json[user_id].experience}`]);
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
        let uid= parseInt(numreg.exec(e.msg));
        if(user_id.length>30&&!uid) return e.reply([segment.at(e.user_id),"你倒是说一说你跟谁决斗啊！他的id呢？",btn])
        if(!e.at&&!uid){
            return e.reply([segment.at(e.user_id),"大笨蛋，你要打谁你倒是说啊！！"])
        }
        if(e.atme||e.atall||e.at==e.user_id){
            return e.reply([segment.at(e.user_id),"大笨蛋，你艾特错了！！"])
        }
        let filename='xiuxian.json'
        let at_id 
        if (!uid) at_id= e.at;
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
        await this.btsetCd(cdtime_battle);
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        const json = JSON.parse(fs.readFileSync(dirpath + "/" + filename));//读取文件
        if (!json.hasOwnProperty(user_id)) {//如果json中不存在该用户
			if(user_id.length>30){
				return await e.reply([segment.at(e.user_id),"你还没有修炼过呢，想和别人决斗先修炼一下吧",btn]);
			}
			return e.reply([segment.at(e.user_id),"你还没有修炼过呢，想和别人决斗先修炼一下吧"])
		}
        if(!e.at){
			for (let key in json) {
				if (json[key].id == uid) {
					at_id=key
					if(at_id == e.user_id)
					{	
						if(user_id.length>30) return await e.reply([segment.at(e.user_id),"自己不能跟自己决斗哦",btn]);
						return e.reply([segment.at(e.user_id),"自己不能跟自己决斗哦"])
					}
				}
			}
			if(!at_id){
				return e.reply("请输入正确的用户id")
			}
        }
		if (!json.hasOwnProperty(at_id)) {//如果json中不存在该用户
			if(user_id.length>30){
				return await e.reply([segment.at(e.user_id),"对方还没修炼过呢，你这样欺负ta实在太可恶了！！",btn]);
				}
			return e.reply([segment.at(e.user_id),"对方还没修炼过呢，你这样欺负ta实在太可恶了！！"])
		}
        let score;
        let sc
        let experience_user
        let experience_at
        let level_user
        let level_at
        sc = (json[user_id].level * 3 + json[user_id].experience) / (json[user_id].level * 3 + json[user_id].experience + json[at_id].level * 3 + json[at_id].experience) * 100;
        score = sc.toFixed(2);
        await e.reply([segment.at(e.user_id),`你的境界是${json[user_id].levelname},你的灵力值为${json[user_id].experience},\n`,'',segment.at(at_id),'',`的境界是${json[at_id].levelname},对方的灵力值为${json[at_id].experience},\n你赢的概率约为${score}%`]);
        if(score>(Math.random()*100)){
            if(score>95&&Math.random()<0.01){
                json[at_id].level=0;
                json[at_id].experience=0;
                json[at_id].levelname="凡人"
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"与你的差距太大了,对方直接被你抓住没跑掉,你将他打回凡人,从头修炼",btn]);
				else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"对方与你的差距太大了,对方直接被你抓住没跑掉,你将他打回凡人,从头修炼"]);
            }
            else if(score>60){
				if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"与你差距较大，你轻松战胜了敌人，你们两个都没有获得提升",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"与你差距较大，你轻松战胜了敌人，你们两个都没有获得提升"])
            }
            else if(score>40&&Math.random()<0.3){
                experience_at=Math.round(6 + 5 * Math.random());
                experience_user=experience_at+Math.round(0 + 5 * Math.random());
                json[at_id].experience+=experience_at;
                json[user_id].experience+=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下，经过激烈的战斗之后你赢了，你们都获得了一些经验,\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下，经过激烈的战斗之后你赢了，你们都获得了一些经验,\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`]);
            }
            else if(score>40&&Math.random()<0.6){
                experience_at=Math.round(4 + 2 * Math.random());
                experience_user=experience_at-Math.round(0 + 2 * Math.random());
                json[at_id].experience-=experience_at;
                json[user_id].experience-=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下你打赢了对方，但是你们两个因为消耗巨大导致灵力流失,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下你打赢了对方，但是你们两个因为消耗巨大导致灵力流失,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`]);
            }
            else if(score>40){
				if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升"]);
            }
            else if(score>20){
                experience_user=Math.round(10 + 10 * Math.random());
                experience_at=experience_user+Math.round(0 + 10 * Math.random());
                json[at_id].experience-=experience_at;
                json[user_id].experience+=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你因机缘巧合打败了对方，获得大量的经验值,\n你获得了${experience_user}点灵力对方丢失了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你因机缘巧合打败了对方，获得大量的经验值,\n你获得了${experience_user}点灵力对方丢失了${experience_at}点灵力`]);
            }
            else if(score<20&&Math.random()<0.9){
                level_user=Math.round(0 + 2 * Math.random());
                experience_user=Math.round(10 + 10 * Math.random());
                json[user_id].experience+=experience_user;
                json[user_id].level+=level_user;
                json[at_id].level-=level_user;
                json[at_id].experience-=experience_user;
                if(json[user_id].level<111) json[user_id].levelname=findlevelname[json[user_id].level];
				if(json[user_id].level>110&&json[user_id].level<10000) json[user_id].levelname=`大帝第${json[user_id].level-101}重天`;
				if(json[user_id].level>=10000) json[user_id].levelname="道祖";
				if(json[at_id].level<111) json[at_id].levelname=findlevelname[json[at_id].level];
				if(json[at_id].level>110&&json[at_id].level<10000) json[at_id].levelname=`大帝第${json[at_id].level-101}重天`;
				if(json[at_id].level>=10000) json[at_id].levelname="道祖";
                if(user_id.length>30) await e.reply([segment.at(e.user_id),`你忽然觉醒，灵气值和境界提升，成功反杀了`,'\n',segment.at(at_id),'',`\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_user}个境界，丢失了${experience_user}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),`你忽然觉醒，灵气值和境界提升，成功反杀了`,'\n',segment.at(at_id),`\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_user}个境界，丢失了${experience_user}点灵力`]);
            }
            else{
                level_user=Math.round(2 + 2 * Math.random());
                experience_user=Math.round(10 + 20 * Math.random());
                level_at=Math.round(0 + 2 * Math.random());
                experience_at=Math.round(10 + 20 * Math.random());
                json[user_id].experience+=experience_user;
                json[user_id].level+=level_user;
                json[at_id].level-=level_at;
                json[at_id].experience-=experience_at;
                if(json[user_id].level<111) json[user_id].levelname=findlevelname[json[user_id].level];
				if(json[user_id].level>110&&json[user_id].level<10000) json[user_id].levelname=`大帝第${json[user_id].level-101}重天`;
				if(json[user_id].level>=10000) json[user_id].levelname="道祖";
				if(json[at_id].level<111) json[at_id].levelname=findlevelname[json[at_id].level];
				if(json[at_id].level>110&&json[at_id].level<10000) json[at_id].levelname=`大帝第${json[at_id].level-101}重天`;
				if(json[at_id].level>=10000) json[at_id].levelname="道祖";
                if(user_id.length>30) await e.reply([segment.at(e.user_id),`你人品大爆发了，获得天道青睐，成功爆发进阶，反杀了`,'\n',segment.at(at_id),`\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_at}个境界，丢失了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),`你人品大爆发了，获得天道青睐，成功爆发进阶，反杀了`,'\n',segment.at(at_id),`\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_at}个境界，丢失了${experience_at}点灵力`]);
            }
        }
        else{
            if(score>80&&Math.random()>0.9){
                level_at=Math.round(0 + 2 * Math.random());
                experience_at=Math.round(10 + 20 * Math.random());
                level_user=Math.round(0 + 2 * Math.random());
                experience_user=Math.round(10 + 20 * Math.random());
                json[at_id].experience+=experience_at;
                json[at_id].level+=level_at;
                json[user_id].level-=level_user;
                json[user_id].experience-=experience_user;
                if(json[user_id].level<111) json[user_id].levelname=findlevelname[json[user_id].level];
				if(json[user_id].level>110&&json[user_id].level<10000) json[user_id].levelname=`大帝第${json[user_id].level-101}重天`;
				if(json[user_id].level>=10000) json[user_id].levelname="道祖";
				if(json[at_id].level<111) json[at_id].levelname=findlevelname[json[at_id].level];
				if(json[at_id].level>110&&json[at_id].level<10000) json[at_id].levelname=`大帝第${json[at_id].level-101}重天`;
				if(json[at_id].level>=10000) json[at_id].levelname="道祖";
                if(user_id.length>30) await e.reply([segment.at(e.user_id),`虽然你领先了`,'\n',segment.at(at_id),'\n',`很多个境界，但是对方忽然人品大爆发，获得了天道青睐，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_at}个境界，获得了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),`虽然你领先了`,'\n',segment.at(at_id),'\n',`很多个境界，但是对方忽然人品大爆发，获得了天道青睐，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_at}个境界，获得了${experience_at}点灵力`]);
            }
            else if(score>80){
                level_at=Math.round(0 + 1 * Math.random());
                experience_at=Math.round(10 + 20 * Math.random());
                json[at_id].experience+=experience_at;
                json[at_id].level+=level_at;
                json[user_id].level-=level_at;
                json[user_id].experience-=experience_at;
                if(json[user_id].level<111) json[user_id].levelname=findlevelname[json[user_id].level];
				if(json[user_id].level>110&&json[user_id].level<10000) json[user_id].levelname=`大帝第${json[user_id].level-101}重天`;
				if(json[user_id].level>=10000) json[user_id].levelname="道祖";
				if(json[at_id].level<111) json[at_id].levelname=findlevelname[json[at_id].level];
				if(json[at_id].level>110&&json[at_id].level<10000) json[at_id].levelname=`大帝第${json[at_id].level-101}重天`;
				if(json[at_id].level>=10000) json[at_id].levelname="道祖";
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`忽然觉醒，灵气值和境界获得提升，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_user}个境界，获得了${experience_user}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`忽然觉醒，灵气值和境界获得提升，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_user}个境界，获得了${experience_user}点灵力`]);
            }
            else if(score>60){
                experience_at=Math.round(10 + 5 * Math.random());
                experience_user=experience_at+Math.round(0 + 5 * Math.random());
                json[at_id].experience+=experience_at;
                json[user_id].experience-=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`机缘巧合下击败了你，对方获得了大量经验,\n你损失了${experience_user}点灵力,\n对方获得了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`机缘巧合下击败了你，对方获得了大量经验,\n你损失了${experience_user}点灵力,\n对方获得了${experience_at}点灵力`,btn]);
            }
            else if(score>40&&Math.random()>0.7){
                experience_at=Math.round(6 + 2 * Math.random());
                experience_user=experience_at+Math.round(0 + 2 * Math.random());
                json[at_id].experience+=experience_at;
                json[user_id].experience+=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下，经过激烈的战斗之后你还是输了，但是你们都获得了一些经验\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下，经过激烈的战斗之后你还是输了，但是你们都获得了一些经验\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`]);
            }
            else if(score>40&&Math.random()>0.4){
                experience_at=Math.round(4 + 2 * Math.random());
                experience_user=experience_at-Math.round(0 + 2 * Math.random());
                json[at_id].experience-=experience_at;
                json[user_id].experience-=experience_user;
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下你打赢了对方，激烈战斗后你还是输了,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`,btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),`\n你们实力不相上下你打赢了对方，激烈战斗后你还是输了,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`]);
            }
            else if(score>40){
				if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升"])
            }
            else if(score<5&&Math.random()>0.9){
                json[at_id].level=0;
                json[at_id].experience=0;
                json[at_id].levelname="凡人"
                if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力相差太过悬殊，你被对面抓起来废了，需要重头修炼了",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们实力相差太过悬殊，你被对面抓起来废了，需要重头修炼了"])
            }
            else{
				if(user_id.length>30) await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们的境界相差过大了，你直接被对方吊打，再修炼一下再来决斗吧",btn]);
                else await e.reply([segment.at(e.user_id),'\n',segment.at(at_id),"\n你们的境界相差过大了，你直接被对方吊打，再修炼一下再来决斗吧"])
            }
        }
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        filename=[e.group_id]+'.json';
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        const groupjson = JSON.parse(fs.readFileSync(dirpath + "/" + filename));
        if (!groupjson.hasOwnProperty(user_id)) {//如果json中不存在该用户
            let new_data = {//创建新用户
                "experience": 0,
                "level": 0,
                "levelname": '凡人',
                "Privilege": 0,
            };
            groupjson[user_id] = new_data
        }
        if (!groupjson.hasOwnProperty(at_id)) {//如果json中不存在该用户
            let new_data = {//创建新用户
                "experience": 0,
                "level": 0,
                "levelname": '凡人',
                "Privilege": 0,
            };
            groupjson[at_id] = new_data
        }
        groupjson[user_id].id=json[user_id].id;
        groupjson[user_id].experience=json[user_id].experience;
        groupjson[user_id].level=json[user_id].level;
        groupjson[user_id].levelname=json[user_id].levelname;
        groupjson[at_id].id=json[at_id].id;
        groupjson[at_id].experience=json[at_id].experience;
        groupjson[at_id].level=json[at_id].level;
        groupjson[at_id].levelname=json[at_id].levelname;
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(groupjson, null, "\t"));
    }
}