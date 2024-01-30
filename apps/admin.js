import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import YAML from "yaml"
import fs from "node:fs"
const blackPath = './plugins/wind-plugin/config/black.yaml'
const blackdefaultPath = './plugins/wind-plugin/config/default_config/black.yaml'
let data=YAML.parse(fs.readFileSync(blackdefaultPath, 'utf8')); //false全局关闭，true全局开启
if (fs.existsSync(blackPath))
    data = fs.readFileSync(blackPath, 'utf8');
else{
	data = YAML.stringify(data) 
    fs.writeFileSync(blackPath, data, 'utf8');
}
let black = YAML.parse(data) || {};
export class slander extends plugin {
    constructor() {
        super({
            name: 'black_xiuxian',
            dsc: 'black_xiuxian',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: -999999,
            rule: [
                {
                    reg: '^(#?(战斗|决斗|pk|PK|攻打|battle)(.*)|#?清理妖兽|#?突破|#?(修炼|修仙|服用丹药)|闭关|打卡)$',
                    fnc: 'black'
                },
                {
					reg: "#?关闭群修仙",
					fnc: 'turnoff'
                },
                {
					reg: "#?开启群修仙",
					fnc: 'turnon'
                },
                {
					reg: "#?全局(关闭|开启)修仙", ///开启全局修仙，但是被单独关闭的不会开启
					fnc: 'turnall'
                },
                {
					reg: "#?全部开启", ///开启全部群的修仙，包括被关闭的群
					fnc: 'allon'
                }
            ]
        })
    }
    async black(e){
        if(black.all&&!black.group.includes(e.group_id)) return false
        e.reply("当前群聊修仙功能已关闭,请联系机器人管理员开启")
        return true
    }
    async turnoff(e){
		if(!e.isMaster) return await e.reply("你看起来真是个笨蛋呢")
		if(black.group.includes(e.group_id)) return await e.reply("当前群修仙为关闭状态")
		black.group.push(e.group_id);
		let yaml = YAML.stringify(black)
		await fs.writeFileSync(blackPath, yaml, "utf8")
		await e.reply("已关闭群修仙")
    }
    async turnon(e){
		if(!e.isMaster) return await e.reply("你看起来真是个笨蛋呢")
		if(!black.group) return await e.reply("当前是开启状态");
		let index = black.group.indexOf(e.group_id)
		if(index > -1){
            black.group.splice(index, 1) 
            let yaml = YAML.stringify(black) 
            fs.writeFileSync(blackPath, yaml, "utf8")
            return await e.reply(`已开启群修仙`);
        }else{
            return await e.reply(`当前是开启状态`); 
        }
    }
    async turnall(e){
		let msg=e.msg
		if(!e.isMaster) return await e.reply("你看起来真是个笨蛋呢")
		if(msg.includes("开启")){
			black.all=true
			let yaml = YAML.stringify(black) 
            fs.writeFileSync(blackPath, yaml, "utf8")
            return await e.reply(`已全局开启修仙【除开单独关闭过的群】`);
		}
		if(msg.includes("关闭")){
			black.all=false
			let yaml = YAML.stringify(black) 
            fs.writeFileSync(blackPath, yaml, "utf8")
            return await e.reply(`已全局关闭修仙`);
		}
    }
    async allon(e){
		black.all=true
		black.group=[]
		let yaml = YAML.stringify(black) 
        fs.writeFileSync(blackPath, yaml, "utf8")
        return await e.reply(`已全部开启修仙`);
    }
}