import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from "lodash";
import cfg from'../../../lib/config/config.js'
import common from'../../../lib/common/common.js'
import YAML from 'yaml'
//插件作者：风 qq：459521475
//也可自定义指令中不加次数时的戳的次数，还有戳戳的间隔,参照注释修改即可
//因为自己可以控制使用的次数，但是群友不一定能控制，所以我分开计算主人和群友最高可以戳的次数
let poketime = YAML.poketime //指令不加次数时戳戳的次数，默认3
let limit = YAML.limit   //其他人的最高可以戳的次数，建议尽量设置低一点，太高可能容易出问题，默认3
let masterlimit = YAML.masterlimit  //主人的最高可以戳的次数，建议尽量设置低一点，太高可能容易出问题，默认10
let sleeptime = YAML.sleeptime  //间隔时间，单位ms，默认1000，
export class slander extends plugin {
    constructor() {
        super({
            name: '戳我',
            dsc: '快去捉弄你的群友吧',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: '^#?戳我(.*次|.*下|.*回)?$',
                    fnc: 'chuo'
                },
                {
                    reg: '^#?戳(他|她|它)(.*)$',
                    fnc: 'chuota'
                }
            ]
        })
    }
    async chuo(e){
    		let msg = this.e.msg
    		if(e.isMaster){
			limit = masterlimit
		}
    		if(msg!='戳我'){
        	let value = msg.replace(/[^0-9]/ig, "");
        	poketime = value
        	}
        	if(poketime>limit && !e.isMaster){
        		await e.reply([segment.at(e.user_id),'大笨蛋，戳的次数太多了，'+limit+'次以下我才帮你哦']);
        		return;
        	}
        	if(poketime>limit && e.isMaster){
        		await e.reply([segment.at(e.user_id),'主人，戳的次数太多了，'+limit+'次以下我才帮你哦']);
        		return;
        	}
		let i = 0;
		for(i;i<poketime;i++){
			await common.sleep(sleeptime)
			await e.group.pokeMember(e.user_id)
		}
   	 
    }
    async chuota(e){
    		let msg = this.e.msg
    		if(e.isMaster){
			limit = masterlimit
		}
		let i = 0;
		if(!e.at){
			await e.reply("你要戳谁你倒是艾特啊，大笨蛋");
			return;
		}
		if(msg!='戳他'){
        	let value = msg.replace(/[^0-9]/ig, "");
        	poketime = value
        	}
        	if(poketime>limit && !e.isMaster){
        		await e.reply([segment.at(e.user_id),'大笨蛋，戳的次数太多了，'+limit+'次以下我才帮你哦']);
        		return;
        	}
        	if(poketime>limit && e.isMaster){
        		await e.reply([segment.at(e.user_id),'主人，戳的次数太多了，'+limit+'次以下我才帮你哦']);
        		return;
        	}
		for(i;i<poketime;i++){
			await common.sleep(sleeptime)
			await e.group.pokeMember(e.at)
		}
   	 
    }
  }