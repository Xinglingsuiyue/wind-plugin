import { Version } from '../components/index.js'
if (!global.segment) {
    global.segment = (await import("oicq")).segment
}
let flag=true
try{
	const { config, configSave } = require("../../QQBot-Plugin/Model/config.js");
}catch(err){
	flag=false
}


let btn
if(Version.name=="TRSS-Yunzai"){
	btn=segment.button([
		  { text: "修仙", callback: `修仙` },
		  { text: "突破", callback: `突破` },
		  { text: "服用丹药", callback: `服用丹药` },
		],[
		  { text: "修仙境界列表", callback: `修仙境界列表` },
		  { text: "我的境界", callback: `我的境界` },
		  { text: "决斗", input: `决斗`, send: false },
		  { text: "我的id", callback: `我的id` },
		])
}
let isqbot = {
	btn,
	async trssbtnqbot(user_id){
		let id = user_id
		if(id.split(':')[1]!=null){
			id=id.split(':')[0]
			if(flag){
				if(config.markdown[id]!=null) return true
			}
		}
		return false
	}
}

export default isqbot