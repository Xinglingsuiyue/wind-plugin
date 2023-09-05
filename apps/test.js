import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'
import { segment } from "oicq";
import lodash from "lodash";
import cfg from'../../../lib/config/config.js'
import common from'../../../lib/common/common.js'

export class slander extends plugin {
    constructor() {
        super({
            name: '小测试',
            dsc: '小测试',
            /** https://oicqjs.github.io/oicq/#events */
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: '^#?小测试$',
                    fnc: 'test'
                }
            ]
        })
    }
    async test(e){
        logger.info('[wind-plugin]', e.msg);
        e.reply("test");
    }
}