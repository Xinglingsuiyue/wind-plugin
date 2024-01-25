import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import yaml from 'yaml'
const announcePath = './plugins/wind-plugin/resources/announce.yaml'
let data = ''
if (fs.existsSync(announcePath))
    data = fs.readFileSync(announcePath, 'utf8');
else{
    fs.writeFileSync(announcePath, data, 'utf8');
}
let announce = yaml.parse(data) || {};
export class example extends plugin {
    constructor() {
        super({
            name: 'dauchart',
            dsc: 'dauchart',
            event: 'message',
            priority: -1000005,
            rule: [
                {
                    reg: "^#?修仙公告$",
                    fnc: 'announce'
                },
                {
              		reg: "^#?修改修仙公告(.*)$",
                    fnc: 'announceset'
                },
                {
                    reg: "^#?机器人公告$",
                    fnc: 'announce_robot'
                },
                {
              		reg: "^#?修改机器人公告(.*)$",
                    fnc: 'announceset_robot'
                }
            ]
        })
    }
    async announceset(e){
    	if(!e.isMaster) return false
    	let msg=e.msg
    	let match = msg.match(/^#?修改修仙公告(.*)$/)
    	if (match) {
    		announce.test = match[1]
    	} else {
    		e.reply("请输入#修改修仙公告+内容")
    		return
    	}
    	e.reply(announce.test)
    	let yamlString = yaml.stringify(announce);
    	fs.writeFileSync(announcePath, yamlString , 'utf8')
    	e.reply("修改成功")
    }
    async announce(e){
        if(!announce.test) return await e.reply("当前无公告内容")
    	e.reply(["\r\r#修仙公告:\r\r>",announce.test,segment.button([{text:'其他板块',callback:'帮助'}])])
    }
    async announceset_robot(e){
    	if(!e.isMaster) return false
    	let msg=e.msg
    	let match = msg.match(/^#?修改机器人公告(.*)$/)
    	if (match) {
    		announce.robot = match[1]
    	} else {
    		e.reply("请输入#修改机器人公告+内容")
    		return
    	}
    	e.reply(announce.robot)
    	let yamlString = yaml.stringify(announce);
    	fs.writeFileSync(announcePath, yamlString , 'utf8')
    	e.reply("修改成功")
    }
    async announce_robot(e){
        if(!announce.robot) return await e.reply("当前无公告内容")
    	e.reply(["\r\r#机器人公告:\r\r>",announce.robot,segment.button([{text:'其他板块',callback:'帮助'}])])
    }
}