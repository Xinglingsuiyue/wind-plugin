import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from "lodash";
import cfg from'../../../lib/config/config.js'
import common from'../../../lib/common/common.js'
import YAML from 'yaml'
let t1=YAML.test1
let t2=YAML.test2
let t3=YAML.test3
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
                    reg: '^#?test$',
                    fnc: 'test'
                }
            ]
        })
    }
    async test(e){
        await e.reply(t1)
        await e.reply(t2)
        await e.reply(t3)
    }
}