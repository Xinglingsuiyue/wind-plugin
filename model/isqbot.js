import { Version } from '../components/index.js'
if (!global.segment) {
    global.segment = (await import("oicq")).segment
}
import fs from 'fs'
import yaml from 'yaml'
let btn
if(Version.name=="TRSS-Yunzai"){
    const idPath=process.cwd()+'/config/QQBot.yaml'
    let data=''
    if(fs.existsSync(idPath))
        data=fs.readFileSync(idPath, 'utf8');
    let data_list=yaml.parse(data)||{};
    let id=data_list.token
    id=JSON.stringify(id)
    id=id.split(':')[0]
    id=id.split('"')[1]
    logger.info(id)
	btn=segment.button([
		  { text: "修仙", callback: `修仙` },
		  { text: "突破", callback: `突破` },
		  { text: "服用丹药", callback: `服用丹药` },
		],[
		  { text: "修仙境界列表", callback: `修仙境界列表` },
		  { text: "我的境界", callback: `我的境界` },
		  { text: "决斗", input: `决斗`, send: false },
		  { text: "我的id", callback: `我的id` },
		],[
            { text: "修仙公告", callback:'修仙公告'},
			{ text: "点击添加机器人到群聊", link: `https://web.qun.qq.com/qunrobot/data.html?robot_uin=${id}` },
		])
}
let isqbot = {
	btn
}

export default isqbot