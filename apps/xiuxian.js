import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs';
import YAML from "yaml";
import{segment}from'oicq';
import moment from "moment"
import xiuxiandb from "../model/xiuxiandb.js"
import isqbot from '../model/isqbot.js';
let path = process.cwd().replace(/\\/g, '/')
const levelname=['凡人','练气期','筑基期','金丹期','元婴期','化神期','合体期','大乘期','渡劫期','人仙境','地仙境','天仙境','金仙境','大罗金仙境','准仙帝','仙帝','天人五衰境','圣人','大帝','道祖']
const findlevelname=["凡人","炼气第1层","炼气第2层","炼气第3层","炼气第4层","炼气第5层","炼气第6层","炼气第7层","炼气第8层","炼气第9层","筑基第1层","筑基第2层","筑基第3层","筑基第4层","筑基第5层","筑基第6层","筑基第7层","筑基第8层","筑基第9层","金丹第1层","金丹第2层","金丹第3层","金丹第4层","金丹第5层","金丹第6层","金丹第7层","金丹第8层","金丹第9层","元婴第1层","元婴第2层","元婴第3层","元婴第4层","元婴第5层","元婴第6层","元婴第7层","元婴第8层","元婴第9层","化神第1层","化神第2层","化神第3层","化神第4层","化神第5层","化神第6层","化神第7层","化神第8层","化神第9层","合体第1层","合体第2层","合体第3层","合体第4层","合体第5层","合体第6层","合体第7层","合体第8层","合体第9层","大乘第1层","大乘第2层","大乘第3层","大乘第4层","大乘第5层","大乘第6层","大乘第7层","大乘第8层","大乘第9层","渡劫第1层","渡劫第2层","渡劫第3层","渡劫第4层","渡劫第5层","渡劫第6层","渡劫第7层","渡劫第8层","渡劫第9层","人仙境初期","人仙境中期","人仙境后期","人仙境圆满","地仙境初期","地仙境中期","地仙境后期","地仙境圆满","天仙境初期","天仙境中期","天仙境后期","天仙境圆满","金仙境初期","金仙境中期","金仙境后期","金仙境圆满","大罗金仙境初期","大罗金仙境中期","大罗金仙境后期","大罗金仙境圆满","准仙帝境","准仙帝境圆满","仙帝境","仙帝境圆满","天人五衰之仙衰","天人五衰之躯衰","天人五衰之窍衰","天人五衰之魂衰","天人五衰之煞衰","圣人第1层","圣人第2层","圣人第3层","圣人第4层","圣人第5层","圣人第6层","圣人第7层","圣人第8层","圣人第9层"]
const level_exp=[0,5,10,15,20,25,30,35,40,46,52,58,64,70,76,82,88,94,101,108,115,122,129,136,143,150,157,165,173,181,189,197,205,213,221,229,238,247,256,265,274,283,292,301,301,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,600,620,640,660,690,720,750,780,815,850,885,920,960,1000,1040,1080,1120,1160,1200,1240,1300,1380,1460,1550,1650,1750,1850,1950,2050,2150,2250,2350,2450,2550,2650,2750,2850,2950,3050];
const master_cd=false //主人是否需要cd
const cdtime_xiuxian = 2 * 60 //修炼的冷却时间,初始为15分钟
const cdtime_break = 2 * 60 //突破的冷却时间,初始为5分钟
let btn
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
                    reg: "^#?(我的境界|查看境界)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'view'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?(修炼|修仙|服用丹药)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'xiuxian'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?(闭关)?突破$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'break'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?(修仙|修炼)?境界列表$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'list'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?排行榜$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'rankings'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?我要境界(.*)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'giveme_level'
                },
                {
                    /** 命令正则匹配 */
                    reg: "^#?我要灵力(.*)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'giveme_exp'
                },
                {
					/** 命令正则匹配 */
                    reg: "^#?(修仙者|修炼者|用户)(人数|数量)$", //匹配消息正则，命令正则
                    /** 执行方法 */
                    fnc: 'numxiuxian'
                },
                {
					/** 命令正则匹配 */
                    reg: "^#?我的id$", //匹配消息正则，命令正则
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
                    reg: "#?全服(排行榜|排名)$",
                    fnc: 'allrank'
                }
            ]
        })
    }
    async clear(e){
		let dirpath=process.cwd()+'/data/wind-db/xiuxiandata.db'
		if (fs.existsSync(dirpath)) {//如果文件夹不存在
			var files = fs.readdirSync(dirpath);
            files.forEach(function(file) {
			  // 拼接文件或子文件夹的完整路径
			  var filepath = dirpath + "/" + file;
			  // 获取文件或子文件夹的状态
			  var stats = fs.statSync(filepath);
			  // 判断是文件还是文件夹
			  if (stats.isFile()) {
				// 如果是文件，直接删除
				fs.unlinkSync(filepath);
			  } else if (stats.isDirectory()) {
				// 如果是文件夹，递归调用删除文件夹的函数
				deleteFolder(filepath);
				}
			});
		// 删除空文件夹
		fs.rmdirSync(dirpath);
        }
        e.reply("清除成功！！")
    }
    async myid(e){
		let user_id=e.user_id
		if(user_id.length>30) btn=isqbot.btn
		let user_data=await xiuxiandb.getUserInfo(user_id)
        if (user_data===null) {
			return e.reply("请先使用【修仙】自动分配id")
        }
        if(!user_data.group_id.includes(e.group_id)){
			user_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        if (user_id.length>30) return await e.reply([segment.at(e.user_id),`\n你的id是:${user_data.id}`,btn])
        return await e.reply([segment.at(e.user_id),`\n你的id是:${user_data.id}`])
    }
    async numxiuxian(e){
		e.reply(JSON.stringify(await xiuxiandb.getMaxId()))
	}
    async giveme_level(e){
		let user_id=e.user_id
		if(user_id.length>30){
			btn=isqbot.btn
		}
        if(!e.isMaster){
			if(user_id.length>30) return await e.reply(["哈哈，你也想要我的境界吗，咦，不给你，哈哈哈哈,🤣👉🏻🤡",btn]);
            return await e.reply("哈哈，你也想要我的境界吗，咦，不给你，哈哈哈哈,🤣👉🏻🤡");
        }
        let numreg = /[1-9][0-9]{0,12}/;
        let numret= parseInt(numreg.exec(e.msg));
        let user_data=await xiuxiandb.getUserInfo(user_id)
        if (user_data===null) {
			//let idd=await xiuxiandb.getMaxId();
			//idd++
			//let groupid=[]
			//await groupid.push(e.group_id)
			user_data = {//创建新用户
				//"id": idd,
				"experience": 0,
				"level": 0,
				"levelname": '凡人',
				"group_id": e.group_id
			};
			await xiuxiandb.updateUserInfo(user_id,user_data)
			user_data=await xiuxiandb.getUserInfo(user_id)
        }
        if(!user_data.group_id.includes(e.group_id)){
			user_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        user_data.level+=numret;
        if(user_data.level<111) user_data.levelname=findlevelname[user_data.level];
        if(user_data.level>110&&user_data.level<10000) user_data.levelname=`大帝第${user_data.level-101}重天`;
        if(user_data.level>=10000) user_data.levelname="道祖";
        await xiuxiandb.updateUserInfo(user_id,user_data)
        await e.reply([segment.at(e.user_id),`恭喜您，获得了境界${numret}层`]);
         let lev=user_data.level
        let exerp=100*(lev-110)+3050;
        let need
        if(user_data.experience < level_exp[lev] && user_data.level<111) need=level_exp[lev]-user_data.experience
        else if (user_data.level>110 && user_data.experience<exerp) need=exerp - user_data.experience
        else need=0
        if(user_id.length>30){
			return await e.reply([segment.at(e.user_id),`\n你的id:${user_data.id},\n您的境界是:${user_data.levelname},\n您的灵力为:${user_data.experience},\n您还需要:${need}点灵力突破下一境界`,btn]);
        }
        return await e.reply([segment.at(e.user_id),`\n你的id:${user_data.id},\n您的境界是:${user_data.levelname},\n您的灵力为:${user_data.experience},\n您还需要:${need}点灵力突破下一境界`]);
    }
    async giveme_exp(e){
		let user_id=e.user_id
		if(user_id.length>30){
			btn=isqbot.btn
		}
        if(!e.isMaster){
			if(user_id.length>30) return await e.reply(["哈哈，你也想要我的灵力吗，咦，不给你，哈哈哈哈,🤣👉🏻🤡",btn]);
            return await e.reply("哈哈，你也想要我的灵力吗，咦，不给你，哈哈哈哈,🤣👉🏻🤡");
        }
        let numreg = /[1-9][0-9]{0,12}/;
        let numret= parseInt(numreg.exec(e.msg));
       let user_data=await xiuxiandb.getUserInfo(user_id)
        if (user_data===null) {
			//let idd=await xiuxiandb.getMaxId();
			//idd++
			//let groupid=[]
			//await groupid.push(e.group_id)
			user_data = {//创建新用户
				//"id": idd,
				"experience": 0,
				"level": 0,
				"levelname": '凡人',
				"group_id": e.group_id
			};
			await xiuxiandb.updateUserInfo(user_id,user_data)
			user_data=await xiuxiandb.getUserInfo(user_id)
        }
        if(!user_data.group_id.includes(e.group_id)){
			user_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        user_data.experience+=numret;
        await xiuxiandb.updateUserInfo(user_id,user_data)
        await e.reply([segment.at(e.user_id),`恭喜您，获得了灵力${numret}点`]);
        let lev=user_data.level
        let exerp=100*(lev-110)+3050;
        let need
        if(user_data.experience < level_exp[lev] && user_data.level<111) need=level_exp[lev]-user_data.experience
        else if (user_data.level>110 && user_data.experience<exerp) need=exerp - user_data.experience
        else need=0
        if(user_id.length>30) return await e.reply([segment.at(e.user_id),`\n你的id:${user_data.id},\n您的境界是:${user_data.levelname},\n您的灵力为:${user_data.experience},\n您还需要:${need}点灵力突破下一境界`,btn]);
        return await e.reply([segment.at(e.user_id),`\n你的id:${user_data.id},\n您的境界是:${user_data.levelname},\n您的灵力为:${user_data.experience},\n您还需要:${need}点灵力突破下一境界`]);
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
        if (cd < 0 && Math.abs(cd) < 100 * 60 * 1000) {
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
    async rankings(e){
        let user_id=e.user_id
        if(user_id.length>30){
			btn=isqbot.btn
		}
        let group_data=await xiuxiandb.getTopUsers(e.group_id,15)
        if (group_data.length==0) {//如果文件不存在
            return await e.reply("本群暂无修炼者～")
        }
        if(user_id.length <=5 || user_id.length>15){
            // 如果用户id长度小于等于5或者大于15，就用文本的方式展示前N名的用户信息，N为group_data的长度
            let remsg=`第1名:id:${group_data[0].id},境界:${group_data[0].levelname},灵力:${group_data[0].experience}`;
            for(let i=1;i<group_data.length;i++){
                remsg=remsg+`\n第${i+1}名:id:${group_data[i].id},境界:${group_data[i].levelname},灵力:${group_data[i].experience}`
            }
            if(user_id.length>30) return await e.reply([remsg,btn])
            return await e.reply(remsg)
        }
        if(user_id.length<12){
            // 如果用户id长度小于12，就用转发的方式展示前N名的用户信息，N为group_data的长度
            let MsgList = [];
            for(let i=0;i<group_data.length;i++){
                MsgList.push({
                    message: [segment.image(`https://tenapi.cn/v2/qqimg?qq=${group_data[i].user_id}`),"\n用户id：",group_data[i].id,"\n境界：",group_data[i].levelname,"\n灵力："+group_data[i].experience],
                    nickname: e.nickname,
                    user_id: e.user_id
                })
            }
            let forwardMsg = await e.group.makeForwardMsg(MsgList);
            if(typeof forwardMsg.data!='string')
            {forwardMsg.data = JSON.stringify(forwardMsg.data)}
            forwardMsg.data = forwardMsg.data
                .replace(/\n/g, '')
                .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                .replace(/___+/, `<title color="#777777" size="26">修仙排行榜～</title>`)
            return await e.reply(forwardMsg)
        }
        await e.reply("暂时还未适配");
	}
    async allrank(e){
        if(!e.isMaster){
            return false
        }
        let user_id=e.user_id
        if(user_id.length>30){
            btn=isqbot.btn
        }
        let group_data=await xiuxiandb.getTopUsers2(30)
        if (group_data.length==0) {//如果文件不存在
            return await e.reply("暂无修炼者～")
        }
        if(user_id.length <=5 || user_id.length>15){
            // 如果用户id长度小于等于5或者大于15，就用文本的方式展示前N名的用户信息，N为group_data的长度
            let remsg=`第1名:id:${group_data[0].id},境界:${group_data[0].levelname},灵力:${group_data[0].experience}`;
            for(let i=1;i<group_data.length;i++){
                remsg=remsg+`\n第${i+1}名:id:${group_data[i].id},境界:${group_data[i].levelname},灵力:${group_data[i].experience}`
            }
            if(user_id.length>30) return await e.reply([remsg,btn])
            return await e.reply(remsg)
        }
        if(user_id.length<12){
            // 如果用户id长度小于12，就用转发的方式展示前N名的用户信息，N为group_data的长度
            let MsgList = [];
            for(let i=0;i<group_data.length;i++){
                MsgList.push({
                    message: [segment.image(`https://tenapi.cn/v2/qqimg?qq=${group_data[i].user_id}`),"\n用户id：",group_data[i].id,"\n境界：",group_data[i].levelname,"\n灵力："+group_data[i].experience],
                    nickname: e.nickname,
                    user_id: e.user_id
                })
            }
            let forwardMsg = await e.group.makeForwardMsg(MsgList);
            if(typeof forwardMsg.data!='string')
            {forwardMsg.data = JSON.stringify(forwardMsg.data)}
            forwardMsg.data = forwardMsg.data
                .replace(/\n/g, '')
                .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                .replace(/___+/, `<title color="#777777" size="26">修仙排行榜～</title>`)
            return await e.reply(forwardMsg)
        }
        await e.reply("暂时还未适配");
    }
    async view(e){
		let user_id=e.user_id
		if(user_id.length>30) btn=isqbot.btn
        console.log("[wind-plugin]", e.msg);
        let user_data=await xiuxiandb.getUserInfo(user_id)
        if (user_data===null) {
			if(user_id.length>30){
				return e.reply([segment.at(e.user_id),"您还是凡人，请通过#修炼和#突破开启你的仙途",btn]);
			}
            return e.reply([segment.at(e.user_id),'您还是凡人，请通过#修炼和#突破开启你的仙途']);
        }
        if(!user_data.group_id.includes(e.group_id)){
			user_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        let lev=user_data.level
        let exerp=100*(lev-110)+3050;
        let need
        if(user_data.experience < level_exp[lev] && user_data.level<111) need=level_exp[lev]-user_data.experience
        else if (user_data.level>110 && user_data.experience<exerp) need=exerp - user_data.experience
        else need=0
        if(user_id.length>30){
			return await e.reply([segment.at(e.user_id),`\n你的id:${user_data.id},\n您的境界是:${user_data.levelname},\n您的灵力为:${user_data.experience},\n您还需要:${need}点灵力突破下一境界`,btn]);
        }
        await e.reply([segment.at(e.user_id),`\n你的id:${user_data.id},\n您的境界是:${user_data.levelname},\n您的灵力为:${user_data.experience},\n您还需要:${need}点灵力突破下一境界`]);
    }
    async list(e) {
		let user_id=e.user_id
		if(user_id.length>30){
			btn=isqbot.btn
		}
        let msg = levelname[0] + '\n';
        for (let j = 1; j < levelname.length; j++) {
            msg = msg + levelname[j] + '\n'
        }
        msg+='凡境每个境界分九层,仙境每个境界分初期中期后期圆满四层,仙帝之后则还有不同,自行探索吧!\n欸嘿!到大帝境界后别努力了,道祖境界你达不到的doge!!\n后期修行困难可以选择#服用丹药,有40%的成功率.\n'
        if(user_id.length>30){
			return e.reply([msg,btn])
        }
        e.reply(msg);
    }
    async xiuxian(e){
		let user_id=e.user_id
		if(user_id.length>30){
			btn=isqbot.btn
		}
        console.log("[wind-plugin]", e.msg);
        let cdtime = await this.xxinCd();
        if(this.e.isMaster && !master_cd){
            cdtime = 0;
        }
        if (cdtime) {
			if(user_id.length>30){
				return await e.reply([segment.at(user_id),`\n对不起,修炼失败，还有${cdtime}秒cd`,btn])
			}
            return await e.reply([segment.at(user_id),`\n对不起,修炼失败，还有${cdtime}秒cd`])
        }
        await this.xxsetCd(cdtime_xiuxian);
        let user_data=await xiuxiandb.getUserInfo(user_id)
        if (user_data===null) {
			//let idd=await xiuxiandb.getMaxId();
			//idd++
			//let groupid=[]
			//await groupid.push(e.group_id)
			user_data = {//创建新用户
				//"id": idd,
				"experience": 0,
				"level": 0,
				"levelname": '凡人',
				"group_id": e.group_id
			};
			await xiuxiandb.updateUserInfo(user_id,user_data)
			user_data=await xiuxiandb.getUserInfo(user_id)
        }
        if(!user_data.group_id.includes(e.group_id)){
			user_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        let experience_ = 0
        let pills = Math.random() * 100
        if (e.msg.includes('丹药')) {
            if (pills > 60) {
                user_data.experience += 15
                let lev=user_data.level
				let exerp=100*(lev-110)+3050;
				let need
				if(user_data.experience < level_exp[lev] && user_data.level<111) need=level_exp[lev]-user_data.experience
				else if (user_data.level>110 && user_data.experience<exerp) need=exerp - user_data.experience
				else need=0
				await xiuxiandb.updateUserInfo(user_id,user_data);
				user_data=await xiuxiandb.getUserInfo(user_id)
                if(user_id.length>30) await e.reply([segment.at(user_id),
                    `\n用户:${user_data.id}\n服用丹药成功，你获得了15点灵力！\n你的id:${user_data.id},\n你的灵力为:${user_data.experience}\n你的境界为${user_data.levelname},\n您还需要:${need}点灵力突破下一境界`,btn]);
                else await e.reply([segment.at(user_id),
                    `\n用户:${user_data.id}\n服用丹药成功，你获得了15点灵力！\n你的id:${user_data.id},\n你的灵力为:${user_data.experience}\n你的境界为${user_data.levelname},\n您还需要:${need}点灵力突破下一境界`]);
            }
            else {
                user_data.experience -= 5
                await xiuxiandb.updateUserInfo(user_id,user_data);
                if(user_id.length>30) await e.reply([segment.at(user_id),
                    `\n用户:${user_data.id}\n服用失败，由于大量丹毒你损失了5点灵力！\n你的id:${user_data.id},\n你的灵力为:${user_data.experience}\n你的境界为${user_data.levelname}`,btn]);
                else await e.reply([segment.at(user_id),
                    `\n用户:${user_data.id}\n服用失败，由于大量丹毒你损失了5点灵力！\n你的id:${user_data.id},\n你的灵力为:${user_data.experience}\n你的境界为${user_data.levelname}`]);
            }
        }
        else{
            experience_ = Math.round(1 + 5 * Math.random())
            user_data.experience += experience_
            let lev =user_data.level
			let exerp=100*(lev-110)+3050;
			let need
			if(user_data.experience < level_exp[lev] && user_data.level<111) need=level_exp[lev]-user_data.experience
			else if (user_data.level>110 && user_data.experience<exerp) need=exerp - user_data.experience
			else need=0
			await xiuxiandb.updateUserInfo(user_id,user_data)
            if(user_id.length>30) await e.reply([segment.at(user_id),
                `\n用户:${user_data.id}\n你获得了${experience_}点灵力。\n你的id:${user_data.id},\n你的灵力为:${user_data.experience}\n你的境界为${user_data.levelname},\n您还需要:${need}点灵力突破下一境界`,btn]);
            else await e.reply([segment.at(user_id),
                `\n用户:${user_data.id}\n你获得了${experience_}点灵力。\n你的id:${user_data.id},\n你的灵力为:${user_data.experience}\n你的境界为${user_data.levelname},\n您还需要:${need}点灵力突破下一境界`]);
        }
    }
    async break(e){
		let user_id=e.user_id;
		if(user_id.length>30){
			btn=isqbot.btn
		}
        console.log("[wind-plugin]", e.msg);
        let cdtime = await this.brinCd();
        if(this.e.isMaster && !master_cd){
            cdtime = 0;
        }
        if (cdtime){
			if(user_id.length>30){
				return await e.reply([segment.at(e.user_id),`\n对不起,突破失败，还有${cdtime}秒cd`,btn])
			}
            return await e.reply([segment.at(e.user_id),`\n对不起,突破失败，还有${cdtime}秒cd`])
        }
        await this.brsetCd(cdtime_break);
        let user_data=await xiuxiandb.getUserInfo(user_id)
        if (user_data===null) {
			//let idd=await xiuxiandb.getMaxId();
			//idd++
			//let groupid=[]
			//await groupid.push(e.group_id)
			user_data = {//创建新用户
				//"id": idd,
				"experience": 0,
				"level": 0,
				"levelname": '凡人',
				"group_id": e.group_id
			};
			await xiuxiandb.updateUserInfo(user_id,user_data)
			user_data=await xiuxiandb.getUserInfo(user_id)
        }
        if(!user_data.group_id.includes(e.group_id)){
			user_data.group_id += ',' + e.group_id // 使用字符串拼接来添加群组id
        }
        let lev=user_data.level;
        let exerp=100*(lev-110)+3050;
        if(user_data.experience < level_exp[lev] && user_data.level<111){
			if(user_id.length>30){
				return e.reply([segment.at(e.user_id),`对不起，用户:${user_data.id},\n你的修为不足,还差${level_exp[lev] - user_data.experience},请再接再厉`,btn])
			}
            return e.reply([segment.at(e.user_id),`对不起，用户:${user_data.id},\n你的修为不足,还差${level_exp[lev] - user_data.experience},请再接再厉`])
        }
        if (user_data.level>110 && user_data.experience<exerp) {
			if(user_id.length>30){
				return e.reply([segment.at(e.user_id),`对不起，用户:${user_data.id},\n你的修为不足,还差${exerp - user_data.experience},请再接再厉`,btn])
				}
            return e.reply([segment.at(e.user_id),`对不起，用户:${user_data.id},\n你的修为不足,还差${exerp - user_data.experience},请再接再厉`])
        }
        if (user_data.level < 110) { var gailv = 100 - user_data.level * 0.5 }
        else { var gailv = 45 - user_data.level * 0.05 }
        e.reply([segment.at(e.user_id),`用户:${user_data.id},\n你当前境界为${user_data.levelname},需要时间${(0.2 * user_data.level)}s,突破成功概率${gailv},开始突破......`])
        let i = Math.random() * 100
        if (i > gailv) {
            setTimeout(() => {
                return e.reply([segment.at(user_id),`用户:${user_data.id},\n对不起，突破失败，请努力修行`])
            }, 1 * (user_data.level));//设置延时
        }
        else{
            user_data.level++
            if(user_data.level<111) user_data.levelname=findlevelname[user_data.level];
            if(user_data.level>110&&l<10000) user_data.levelname=`大帝第${level-101}重天`;
            if(user_data.level>=10000) user_data.levelname="道祖";
        }
        let need
        lev++
        if(user_data.experience < level_exp[lev] && user_data.level<111) need=level_exp[lev]-user_data.experience
        else if (user_data.level>110 && user_data.experience<exerp) need=exerp - user_data.experience
        else need=0
        setTimeout(() => {//延迟5秒
            if(user_id.length>30){e.reply([segment.at(e.user_id),`用户:${user_data.id},\n你已突破成功，当前境界${user_data.levelname},\n您还需要:${need}点灵力突破下一境界`,btn]);}
            else {e.reply([segment.at(e.user_id),`用户:${user_data.id},\n你已突破成功，当前境界${user_data.levelname},\n您还需要:${need}点灵力突破下一境界`]);}
        }, 200 * (user_data.level + 1));//设置延时
        await xiuxiandb.updateUserInfo(user_id,user_data)
    }
}
