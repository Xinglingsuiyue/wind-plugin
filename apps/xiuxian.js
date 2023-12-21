import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs';
import YAML from "yaml";
import{segment}from'oicq';
import moment from "moment"
let path = process.cwd().replace(/\\/g, '/')
const dirpath=path+'/plugins/wind-plugin/resources/xiuxian-data'
const levelname=['凡人','练气期','筑基期','金丹期','元婴期','化神期','合体期','大乘期','渡劫期','人仙境','地仙境','天仙境','金仙境','大罗金仙境','准仙帝','仙帝','天人五衰境','圣人','大帝','至强大帝']
const level_exp=[10,20,30,40,55,70,85,100,125,150,175,200,230,260,290,320];
const master_cd=false //主人是否需要cd
const cdtime_xiuxian = 15 * 60 //修炼的冷却时间,初始为15分钟
const cdtime_break = 5 * 60 //突破的冷却时间,初始为5分钟
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
                }
            ]
        })
    }
    async giveme_level(e){
        if(!e.isMaster){
            return await e.reply("哈哈，你也想要我的境界吗，咦，不给你，哈哈哈哈,🤣👉🏻🤡");
        }
        let numreg = /[1-9][0-9]{0,12}/;
        let numret= parseInt(numreg.exec(e.msg));
        let user_id = e.user_id;
        let filename=[e.group_id]
        if(e.isMaster){
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
        json[user_id].level+=numret;
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
        await e.reply([segment.at(e.user_id),`恭喜您，获得了境界${numret}层`]);
        await e.reply([segment.at(e.user_id),`\n您的境界是:${json[user_id].levelname},\n您的灵力为:${json[user_id].experience}`]);
    }
    async giveme_exp(e){
        if(!e.isMaster){
            return await e.reply("哈哈，你也想要我的灵力吗，咦，不给你，哈哈哈哈,🤣👉🏻🤡");
        }
        let numreg = /[1-9][0-9]{0,12}/;
        let numret= parseInt(numreg.exec(e.msg));
        let user_id = e.user_id;
        let filename=[e.group_id]
        if(e.isMaster){
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
        json[user_id].experience+=numret;
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));
        await e.reply([segment.at(e.user_id),`恭喜您，获得了灵力${numret}点`]);
        await e.reply([segment.at(e.user_id),`\n您的境界是:${json[user_id].levelname},\n您的灵力为:${json[user_id].experience}`]);
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
        let id=e.user_id
        if(id.length>12) return await e.reply("暂时还未适配");
        let filename = [e.group_id]+".json";
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            return e.reply("本群暂无修炼者～")
        }
        let data = fs.readFileSync(dirpath + "/" + filename);
        let jsonData = JSON.parse(data);
        let userids = Object.keys(jsonData);
        let MsgList = [];
        const sortedUsers = userids.sort((a, b) => {
            const scoreA = jsonData[a].level * 3 + jsonData[a].experience;
            const scoreB = jsonData[b].level * 3 + jsonData[b].experience;
            return scoreB - scoreA;
        });
        const scores = sortedUsers.map(userid => {
            const score = jsonData[userid].level * 3 + jsonData[userid].experience;
            console.log(`userid: ${userid}, score: ${score}`);
            MsgList.push({
                message: [segment.image(`https://tenapi.cn/v2/qqimg?qq=${userid}`),"\n用户名：",jsonData[userid].nickname,"\n境界：",jsonData[userid].levelname,"\n灵力："+jsonData[userid].experience],
                nickname: e.nickname,
                user_id: e.user_id
            })
            return score;
        });
        console.log(`scores: ${scores}`);
        const sortedScores = scores.sort((a, b) => b - a);
        console.log(`sortedScores: ${sortedScores}`);
        const topTenUserids = sortedScores.reduce((acc, score, index) => {
            if (index < 10) {
                const userId = sortedUsers[scores.indexOf(score)];
                if (!acc.includes(userId)) {
                    acc.push(userId);
                }
            }
            return acc;
        }, []);
        console.log(`topTenUserids: ${topTenUserids}`);
        let forwardMsg = await e.group.makeForwardMsg(MsgList);
        if(typeof forwardMsg.data!='string')
        {forwardMsg.data = JSON.stringify(forwardMsg.data)}
        forwardMsg.data = forwardMsg.data
            .replace(/\n/g, '')
            .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
            .replace(/___+/, `<title color="#777777" size="26">修仙排行榜～</title>`)
        await e.reply(forwardMsg)
    }
    async view(e){
        console.log("[wind-plugin]", e.msg);
        let user_id = e.user_id;
        let filename=[e.group_id]
        if(e.isMaster){
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
        if (!json.hasOwnProperty(user_id)||json[user_id].level==0) {//如果文件夹不存在
            e.reply([segment.at(e.user_id), '您还是凡人，请通过#修炼和#突破开启你的仙途']);
            return
        }
        e.reply([segment.at(e.user_id),`\n您的境界是:${json[user_id].levelname},\n您的灵力为:${json[user_id].experience}`]);
    }
    async list(e) {
        let msg = levelname[0] + '\n';
        for (let j = 0; j < levelname.length; j++) {
            msg = msg + levelname[j] + '\n'
        }
        msg+='欸嘿!到大帝境界后别努力了,至强你达不到的doge!!\n后期修行困难可以选择#服用丹药,有40%的成功率.\n'
        e.reply(msg);
    }
    async xiuxian(e){
        console.log("[wind-plugin]", e.msg);
        let new_data = {//创建新用户
            "nickname": e.nickname,
            "experience": 0,
            "level": 0,
            "levelname": '凡人',
            "Privilege": 0,
        };
        let filename=[e.group_id]
        if(e.isMaster){
            filename="masterxiuxian";
        }
        if (filename.indexOf(".json") == -1) {//如果文件名不包含.json
            filename = filename + ".json";//添加.json
        }
        let user_id = e.user_id;
        let cdtime = await this.xxinCd();
        if(this.e.isMaster && !master_cd){
            cdtime = 0;
        }
        if (cdtime) {
            return await e.reply(`对不起，修炼失败，还有${cdtime}秒cd`)
        }
        await this.xxsetCd(cdtime_xiuxian);
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        const json = JSON.parse(fs.readFileSync(dirpath + "/" + filename));//读取文件
        if (!json.hasOwnProperty(user_id)) {//如果json中不存在该用户
            json[user_id] = new_data
        }
        const date = new Date();
        let experience_ = 0
        let pills = Math.random() * 100
        if (e.msg.includes('丹药')) {
            if (pills > 60) {
                json[user_id].experience += 10
                e.reply([segment.at(user_id),
                    `\n服用丹药成功，你获得了10点灵力！\n你的灵力为:${json[user_id].experience}\n你的境界为${json[user_id].levelname}`]);
            }
            else {
                json[user_id].experience -= 3
                e.reply([segment.at(user_id),
                    `\n服用失败，由于大量丹毒你损失了3点灵力！\n你的灵力为:${json[user_id].experience}\n你的境界为${json[user_id].levelname}`]);
            }
        }
        else{
            experience_ = Math.round(1 + 2 * Math.random())
            json[user_id].experience += experience_
            e.reply([segment.at(user_id),
                `\n你获得了${experience_}点灵力。\n你的灵力为:${json[user_id].experience}\n你的境界为${json[user_id].levelname}`]);
        }
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        if(e.isMaster){
            filename=[e.group_id];
            if (filename.indexOf(".json") == -1) {//如果文件名不包含.json
                filename = filename + ".json";//添加.json
            }
            let user_id = e.user_id;
            if (!fs.existsSync(dirpath)) {//如果文件夹不存在
                fs.mkdirSync(dirpath);//创建文件夹
            }
            if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
                fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
                }));
            }
            const masterjson = JSON.parse(fs.readFileSync(dirpath + "/" + filename));
            if (!masterjson.hasOwnProperty(user_id)) {//如果json中不存在该用户
                masterjson[user_id] = new_data
            }
            masterjson[user_id].experience=json[user_id].experience;
            masterjson[user_id].level=json[user_id].level;
            masterjson[user_id].levelname=json[user_id].levelname;
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(masterjson, null, "\t"));
        }
    }
    async break(e){
        console.log("[wind-plugin]", e.msg);
        let new_data = {//创建新用户
            "nickname": e.nickname,
            "experience": 0,
            "level": 0,
            "levelname": '凡人',
            "Privilege": 0,
        };
        let filename=[e.group_id]
        if(e.isMaster){
            filename="masterxiuxian";
        }
        if (filename.indexOf(".json") == -1) {//如果文件名不包含.json
            filename = filename + ".json";//添加.json
        }
        let user_id = e.user_id;
        let cdtime = await this.brinCd();
        if(this.e.isMaster && !master_cd){
            cdtime = 0;
        }
        if (cdtime) {
            return await e.reply(`对不起，突破失败，还有${cdtime}秒cd`)
        }
        await this.brsetCd(cdtime_break);
        if (!fs.existsSync(dirpath)) {//如果文件夹不存在
            fs.mkdirSync(dirpath);//创建文件夹
        }
        if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
            }));
        }
        const json = JSON.parse(fs.readFileSync(dirpath + "/" + filename));//读取文件
        if (!json.hasOwnProperty(user_id)) {//如果json中不存在该用户
            json[user_id] = new_data
        }
        if (json[user_id].experience < 5) json[user_id].level = 1
        for(let ls=1;ls<17;ls++){
            if(json[user_id].experience < level_exp[ls] && json[user_id].level >= ls+1){
                e.reply(`修为不足,还差${level_exp[ls] - json[user_id].experience},请再接再厉`)
                return
            }
        }
        if (json[user_id].experience >= 320 && json[user_id].level > 18 + Math.floor((json[user_id].experience - 320) / 80)) {
            e.reply(`修为不足,还差${(Math.floor(json[user_id].experience / 80) * 80 + 80) - json[user_id].experience},请再接再厉`)
            return
        }
        if (json[user_id].experience < 1) {
            json[user_id].experience = 0
        }
        if (json[user_id].level < 18) { var gailv = 100 - json[user_id].level * 2 }
        else { var gailv = 68 - json[user_id].level * 0.05 }
        e.reply(`当前境界${json[user_id].levelname},需要时间${2 * (json[user_id].level)}s,突破成功概率${gailv},开始突破......`)
        let i = Math.random() * 100
        if (i > gailv) {
            setTimeout(() => {//延迟5秒
                e.reply('对不起，突破失败，请努力修行')
            }, 2 * (json[user_id].level));//设置延时
        }
        else{
            json[user_id].level++
            for(let j=0;j<18;j++){
                if(json[user_id].level == j) json[user_id].levelname = levelname[j];
            }
            if (json[user_id].level > 17 && json[user_id].level < 43) {
                let level_name = json[user_id].level - 17
                json[user_id].levelname = levelname[17] + `第${level_name}境`
            }
            if (json[user_id].level > 42 && json[user_id].level < 2001) {
                let level_name = json[user_id].level - 42
                json[user_id].levelname = levelname[18] + `${level_name}重天`
            }
            if (json[user_id].level > 2000) json[user_id].levelname = levelname[19];
        }
        setTimeout(() => {//延迟5秒
            e.reply(`突破成功，当前境界${json[user_id].levelname}`)
        }, 3000 * (json[user_id].level + 1));//设置延时
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        if(e.isMaster){
            filename=[e.group_id];
            if (filename.indexOf(".json") == -1) {//如果文件名不包含.json
                filename = filename + ".json";//添加.json
            }
            let user_id = e.user_id;
            if (!fs.existsSync(dirpath)) {//如果文件夹不存在
                fs.mkdirSync(dirpath);//创建文件夹
            }
            if (!fs.existsSync(dirpath + "/" + filename)) {//如果文件不存在
                fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({//创建文件
                }));
            }
            const masterjson = JSON.parse(fs.readFileSync(dirpath + "/" + filename));
            if (!masterjson.hasOwnProperty(user_id)) {//如果json中不存在该用户
                masterjson[user_id] = new_data
            }
            masterjson[user_id].experience=json[user_id].experience;
            masterjson[user_id].level=json[user_id].level;
            masterjson[user_id].levelname=json[user_id].levelname;
            fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(masterjson, null, "\t"));
        }
    }
}