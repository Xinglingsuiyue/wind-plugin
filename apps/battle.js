import plugin from '../../../lib/plugins/plugin.js'
import Cfg from '../../../lib/config/config.js'
import fs from 'fs';
import YAML from "yaml";
import{segment}from'oicq';
import moment from "moment"
let path = process.cwd().replace(/\\/g, '/')
const dirpath=path+'/plugins/wind-plugin/resources/xiuxian-data'
const levelname=['练气期','筑基期','金丹期','元婴期','化神期','合体期','大乘期','渡劫期','人仙境','地仙境','天仙境','金仙境','大罗金仙境','准仙帝','仙帝','天人五衰境','圣人','大帝','至强大帝']
const level_exp=[0,10,20,30,40,55,70,85,100,125,150,175,200,230,260,290,320];
const master_battled=true //主人是否会被别人攻打
const master_cd=false //主人是否需要cd
const cdtime_battle = 1 * 60 //决斗的冷却时间,初始为1分钟
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
                }
            ]
        })
    }
    async de_level(e){
        if(!e.isMaster){
            return await e.reply("哈哈，就凭你也敢对别人的境界动手,🤣👉🏻🤡");
        }
        let numreg = /[1-9][0-9]{0,12}/;
        let numret= parseInt(numreg.exec(e.toString()));
        let user_id = e.at;
        let filename=[e.group_id]
        if(e.at==Cfg.masterQQ){
            return await e.reply(`扣除主人境界${numret}`);
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
        json[user_id].level-=numret;
        for(let j=0;j<17;j++){
            if(json[user_id].level == j) json[user_id].levelname = levelname[j];
        }
        if (json[user_id].level > 16 && json[user_id].level < 42) {
            let level_name = json[user_id].level - 16
            json[user_id].levelname = levelname[16] + `第${level_name}境`
        }
        if (json[user_id].level > 41 && json[user_id].level < 2001) {
            let level_name = json[user_id].level - 41
            json[user_id].levelname = levelname[17] + `${level_name}重天`
        }
        if (json[user_id].level > 2000) json[user_id].levelname = levelname[18];
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));
        await e.reply([segment.at(e.user_id),`您斩落了`,segment.at(e.at),`境界${numret}层`]);
        await e.reply([segment.at(e.user_id),`\n对方的境界是:${json[user_id].levelname},\n对方的灵力为:${json[user_id].experience}`]);
    }
    async giveme_exp(e){
        if(!e.isMaster){
            return await e.reply("哈哈，就凭你也敢对别人的灵力值动手,🤣👉🏻🤡");
        }
        let numreg = /[1-9][0-9]{0,12}/;
        let numret= parseInt(numreg.exec(e.toString()));
        let user_id = e.user_id;
        let filename=[e.group_id]
        if(e.at==Cfg.masterQQ){
            return await e.reply(`扣除主人灵力${numret}`);
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
        json[user_id].experience-=numret;
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));
        await e.reply([segment.at(e.user_id),`您斩落了`,segment.at(e.at),`灵力${numret}`]);
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
        if(!e.at){
            return e.reply("大笨蛋，你要打谁你倒是艾特啊！！")
        }
        if(e.atme||e.atall||e.at==e.user_id){
            return e.reply("大笨蛋，你艾特错了！！")
        }
        if(e.at==Cfg.masterQQ&&!master_battled){
            return e.reply("就凭你也配跟主人决斗！！？？")
        }
        let filename=[e.group_id]
        if (filename.indexOf(".json") == -1) {//如果文件名不包含.json
            filename = filename + ".json";//添加.json
        }
        let user_id = e.user_id;
        let at_id = e.at
        let cdtime = await this.btinCd();
        if(this.e.isMaster && !master_cd){
            cdtime = 0;
        }
        if (cdtime) {
            return await e.reply(`上一场战斗刚过去不久呢,你太累了,还有${cdtime}秒cd`);
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
            return e.reply("你还没有修炼过呢，想和别人决斗先修炼一下吧")
        }
        if (!json.hasOwnProperty(at_id)) {//如果json中不存在该用户
            return e.reply("对方还没修炼过呢，你这样欺负ta实在太可恶了！！")
        }
        let score;
        let sc
        sc = (json[user_id].level * 3 + json[user_id].experience) / (json[user_id].level * 3 + json[user_id].experience + json[at_id].level * 3 + json[at_id].experience) * 100;
        score = sc.toFixed(2);
        await e.reply(`你的境界是${json[user_id].levelname},你的灵力值为${json[user_id].experience},\n对方的境界是${json[at_id].levelname},对方的灵力值为${json[at_id].experience},\n你赢的概率约为${score}%`);
        if(sc>Math.random()){
            if(score>95&&Math.random()<0.1){
                json[at_id].level=0;
                json[at_id].experience=0;
                json[at_id].levelname="凡人"
                await e.reply("对方与你的差距太大了,对方直接被你抓住没跑掉,你将他打回凡人,从头修炼");
            }
            else if(score>60){
                await e.reply("对方与你差距较大，你轻松战胜了敌人，你们两个都没有获得提升")
            }
            else if(score>40&&Math.random()<0.3){
                experience_at=Math.round(6 + 2 * Math.random());
                experience_user=experience_at+Math.round(0 + 2 * Math.random());
                json[at_id].experience+=experience_at;
                json[user_id].experience+=experience_user;
                await e.reply(`你们实力不相上下，经过激烈的战斗之后你赢了，你们都获得了一些经验,\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`);
            }
            else if(score>40&&Math.random()<0.6){
                experience_at=Math.round(4 + 2 * Math.random());
                experience_user=experience_at-Math.round(0 + 2 * Math.random());
                json[at_id].experience-=experience_at;
                json[user_id].experience-=experience_user;
                await e.reply(`你们实力不相上下你打赢了对方，但是你们两个因为消耗巨大导致灵力流失,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`)
            }
            else if(score>40){
                await e.reply("你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升")
            }
            else if(score>30){
                experience_user=Math.round(10 + 5 * Math.random());
                experience_at=experience_user+Math.round(0 + 5 * Math.random());
                json[at_id].experience-=experience_at;
                json[user_id].experience+=experience_user;
                await e.reply(`你因机缘巧合打败了对方，获得大量的经验值,\n你获得了${experience_user}点灵力对方丢失了${experience_at}点灵力`)
            }
            else if(score>20){
                level_user=Math.round(0 + 2 * Math.random());
                experience_user=level_exp[json[user_id].level+level_user]+Math.round(10 + 5 * Math.random())-json[user_id].experience;
                json[user_id].experience+=experience_user;
                json[user_id].level+=level_user;
                json[at_id].level-=level_user;
                json[at_id].experience-=experience_user;
                for(let j=0;j<17;j++){
                    if(json[user_id].level == j) json[user_id].levelname = levelname[j];
                    if(json[at_id].level == j) json[at_id].levelname = levelname[j];
                }
                if (json[user_id].level > 16 && json[user_id].level < 42) {
                    let level_name = json[user_id].level - 16
                    json[user_id].levelname = levelname[16] + `第${level_name}境`
                }
                if (json[user_id].level > 41 && json[user_id].level < 2001) {
                    let level_name = json[user_id].level - 41
                    json[user_id].levelname = levelname[17] + `${level_name}重天`
                }
                if (json[user_id].level > 2000) json[user_id].levelname = levelname[18];
                if (json[at_id].level > 16 && json[at_id].level < 42) {
                    let level_name = json[at_id].level - 16
                    json[at_id].levelname = levelname[16] + `第${level_name}境`
                }
                if (json[at_id].level > 41 && json[at_id].level < 2001) {
                    let level_name = json[at_id].level - 41
                    json[at_id].levelname = levelname[17] + `${level_name}重天`
                }
                if (json[at_id].level > 2000) json[at_id].levelname = levelname[18];
                await e.reply(`你忽然觉醒，灵气值和境界提升，成功反杀了对方,\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_user}个境界，丢失了${experience_user}点灵力`);
            }
            else{
                level_user=Math.round(2 + 2 * Math.random());
                experience_user=level_exp[json[user_id].level+level_user]+Math.round(20 + 5 * Math.random())-json[user_id].experience;
                level_at=Math.round(0 + 2 * Math.random());
                experience_at=json[at_id].experience-level_exp[json[at_id].level-level_at]-Math.round(5 + 5 * Math.random());
                json[user_id].experience+=experience_user;
                json[user_id].level+=level_user;
                json[at_id].level-=level_at;
                json[at_id].experience-=experience_at;
                for(let j=0;j<17;j++){
                    if(json[user_id].level == j) json[user_id].levelname = levelname[j];
                    if(json[at_id].level == j) json[at_id].levelname = levelname[j];
                }
                if (json[user_id].level > 16 && json[user_id].level < 42) {
                    let level_name = json[user_id].level - 16
                    json[user_id].levelname = levelname[16] + `第${level_name}境`
                }
                if (json[user_id].level > 41 && json[user_id].level < 2001) {
                    let level_name = json[user_id].level - 41
                    json[user_id].levelname = levelname[17] + `${level_name}重天`
                }
                if (json[user_id].level > 2000) json[user_id].levelname = levelname[18];
                if (json[at_id].level > 16 && json[at_id].level < 42) {
                    let level_name = json[at_id].level - 16
                    json[at_id].levelname = levelname[16] + `第${level_name}境`
                }
                if (json[at_id].level > 41 && json[at_id].level < 2001) {
                    let level_name = json[at_id].level - 41
                    json[at_id].levelname = levelname[17] + `${level_name}重天`
                }
                if (json[at_id].level > 2000) json[at_id].levelname = levelname[18];
                await e.reply(`你人品大爆发了，获得天道青睐，成功爆发进阶，反杀了对方,\n你提升了${level_user}个境界，获得了${experience_user}点灵力\n对方跌落了${level_at}个境界，丢失了${experience_at}点灵力`)
            }
        }
        else{
            if(score>80){
                level_at=Math.round(2 + 2 * Math.random());
                experience_at=level_exp[json[at_id].level+level_at]+Math.round(20 + 5 * Math.random())-json[at_id].experience;
                level_user=Math.round(0 + 2 * Math.random());
                experience_user=json[user_id].experience-level_exp[json[user_id].level-level_user]-Math.round(5 + 5 * Math.random());
                json[at_id].experience+=experience_at;
                json[at_id].level+=level_at;
                json[user_id].level-=level_user;
                json[user_id].experience-=experience_user;
                for(let j=0;j<17;j++){
                    if(json[user_id].level == j) json[user_id].levelname = levelname[j];
                    if(json[at_id].level == j) json[at_id].levelname = levelname[j];
                }
                if (json[user_id].level > 16 && json[user_id].level < 42) {
                    let level_name = json[user_id].level - 16
                    json[user_id].levelname = levelname[16] + `第${level_name}境`
                }
                if (json[user_id].level > 41 && json[user_id].level < 2001) {
                    let level_name = json[user_id].level - 41
                    json[user_id].levelname = levelname[17] + `${level_name}重天`
                }
                if (json[user_id].level > 2000) json[user_id].levelname = levelname[18];
                if (json[at_id].level > 16 && json[at_id].level < 42) {
                    let level_name = json[at_id].level - 16
                    json[at_id].levelname = levelname[16] + `第${level_name}境`
                }
                if (json[at_id].level > 41 && json[at_id].level < 2001) {
                    let level_name = json[at_id].level - 41
                    json[at_id].levelname = levelname[17] + `${level_name}重天`
                }
                if (json[at_id].level > 2000) json[at_id].levelname = levelname[18];
                await e.reply(`虽然你领先了对方很多个境界，但是对方忽然人品大爆发，获得了天道青睐，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_at}个境界，获得了${experience_at}点灵力`);
            }
            else if(score>80){
                level_at=Math.round(0 + 2 * Math.random());
                experience_at=level_exp[json[at_id].level+level_at]+Math.round(10 + 5 * Math.random())-json[at_id].experience;
                json[at_id].experience+=experience_at;
                json[at_id].level+=level_at;
                json[user_id].level-=level_at;
                json[user_id].experience-=experience_at;
                for(let j=0;j<17;j++){
                    if(json[user_id].level == j) json[user_id].levelname = levelname[j];
                    if(json[at_id].level == j) json[at_id].levelname = levelname[j];
                }
                if (json[user_id].level > 16 && json[user_id].level < 42) {
                    let level_name = json[user_id].level - 16
                    json[user_id].levelname = levelname[16] + `第${level_name}境`
                }
                if (json[user_id].level > 41 && json[user_id].level < 2001) {
                    let level_name = json[user_id].level - 41
                    json[user_id].levelname = levelname[17] + `${level_name}重天`
                }
                if (json[user_id].level > 2000) json[user_id].levelname = levelname[18];
                if (json[at_id].level > 16 && json[at_id].level < 42) {
                    let level_name = json[at_id].level - 16
                    json[at_id].levelname = levelname[16] + `第${level_name}境`
                }
                if (json[at_id].level > 41 && json[at_id].level < 2001) {
                    let level_name = json[at_id].level - 41
                    json[at_id].levelname = levelname[17] + `${level_name}重天`
                }
                if (json[at_id].level > 2000) json[at_id].levelname = levelname[18];
                await e.reply(`对面忽然觉醒，灵气值和境界获得提升，你被对面反杀了,\n你跌落了${level_user}个境界，丢失了${experience_user}点灵力\n对方提升了${level_user}个境界，获得了${experience_user}点灵力`);
            }
            else if(score>60){
                experience_at=Math.round(10 + 5 * Math.random());
                experience_user=experience_user+Math.round(0 + 5 * Math.random());
                json[at_id].experience+=experience_at;
                json[user_id].experience-=experience_user;
                await e.reply(`对方机缘巧合下击败了你，对方获得了大量经验,\n你损失了${experience_user}点灵力,\n对方获得了${experience_at}点灵力`)
            }
            else if(score>40&&Math.random()>0.7){
                experience_at=Math.round(6 + 2 * Math.random());
                experience_user=experience_at+Math.round(0 + 2 * Math.random());
                json[at_id].experience+=experience_at;
                json[user_id].experience+=experience_user;
                await e.reply(`你们实力不相上下，经过激烈的战斗之后你还是输了，但是你们都获得了一些经验\n你获得了${experience_user}点灵力\n对方获得了${experience_at}点灵力`);
            }
            else if(score>40&&Math.random()>0.4){
                experience_at=Math.round(4 + 2 * Math.random());
                experience_user=experience_at-Math.round(0 + 2 * Math.random());
                json[at_id].experience-=experience_at;
                json[user_id].experience-=experience_user;
                await e.reply(`你们实力不相上下你打赢了对方，激烈战斗后你还是输了,\n你丢失了${experience_user}点灵力\n对方丢失了${experience_at}点灵力`);
            }
            else if(score>40){
                await e.reply("你们实力不相上下，激烈斗争后，你赢了对方,你们两个都没有提升")
            }
            else if(score<5&&Math.random()>0.9){
                json[at_id].level=0;
                json[at_id].experience=0;
                json[at_id].levelname="凡人"
                await e.reply("你们实力相差太过悬殊，你被对面抓起来废了，需要重头修炼了")
            }
            else{
                await e.reply("你们的境界相差过大了，你直接被对方吊打，再修炼一下再来决斗吧")
            }
        }
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
    }
}