// plugins/wind-plugin/apps/give-power.js
import plugin from '../../../lib/plugins/plugin.js';
import fs from 'fs';
import YAML from 'yaml';
import xiuxiandb from '../model/xiuxiandb.js';
import isqbot from '../model/isqbot.js';

// 读取配置
const configPath = './plugins/wind-plugin/config/xiuxian.yaml';
let ydata = {};
if (fs.existsSync(configPath)) {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    ydata = YAML.parse(fileContent) || {};
}
const masterOnly = true; // 权限控制：true=仅Master可用

export class givePower extends plugin {
    constructor() {
        super({
            name: '用户修为管理（完整版）',
            dsc: '通过QQ号或用户ID，增加或减少用户的灵力与境界',
            event: 'message',
            priority: -999,
            rule: [
                {
                    // 增加灵力
                    reg: '^#?(给ID加灵力|加灵力)\\s*(?:qq|uid)?\\s*(\\d+)\\s*(\\d+)$',
                    fnc: 'addExpToUser'
                },
                {
                    // 减少灵力
                    reg: '^#?(给ID减灵力|减灵力)\\s*(?:qq|uid)?\\s*(\\d+)\\s*(\\d+)$',
                    fnc: 'reduceExpToUser'
                },
                {
                    // 增加境界
                    reg: '^#?(给ID加境界|加境界)\\s*(?:qq|uid)?\\s*(\\d+)\\s*(\\d+)$',
                    fnc: 'addLevelToUser'
                },
                {
                    // 减少境界
                    reg: '^#?(给ID减境界|减境界)\\s*(?:qq|uid)?\\s*(\\d+)\\s*(\\d+)$',
                    fnc: 'reduceLevelToUser'
                },
                {
                    // 查询用户
                    reg: '^#?查询(用户|境界)\\s*(?:qq|uid)?\\s*(\\d+)$',
                    fnc: 'queryUser'
                }
            ]
        });
    }

    /**
     * 通过QQ号或用户ID获取用户数据
     * 注意：此函数中的通过uid查询部分（getAllUsers方法）可能需要您根据实际xiuxiandb模型进行实现
     * @param {string} identifier 标识符
     * @param {string} type 指定类型：‘qq’ 或 ‘uid’
     * @returns {Object|null} 用户数据
     */
    async getUserByIdentifier(identifier, type = '') {
        let userData = null;
        
        // 判断查询类型
        let queryByUid = false;
        if (type === 'uid') {
            queryByUid = true;
        } else if (type === 'qq') {
            queryByUid = false;
        } else {
            // 自动判断：用户ID通常是较小的数字
            queryByUid = identifier.length < 9;
        }

        if (queryByUid) {
            // 通过用户ID查询 - 需要您根据实际数据模型实现
            // 以下是示例代码，您可能需要修改
            const allUsers = await xiuxiandb.getAllUsers(); // 注意：此方法在原插件中可能不存在
            if (allUsers && allUsers.length > 0) {
                const targetId = parseInt(identifier);
                userData = allUsers.find(user => user.id === targetId) || null;
            }
        } else {
            // 通过QQ号查询
            userData = await xiuxiandb.getUserInfo(identifier);
        }
        
        return userData;
    }

    /**
     * 为指定用户增加灵力
     */
    async addExpToUser(e) {
        if (masterOnly && !e.isMaster) {
            await e.reply('⚠️ 此命令仅管理员可执行。');
            return true;
        }

        const args = e.msg.match(/^#?(给ID加灵力|加灵力)\s*(qq|uid)?\s*(\d+)\s*(\d+)$/i);
        if (!args) {
            await e.reply('❌ 命令格式错误。\n' +
                         '格式1：#加灵力 [目标用户QQ号] [灵力值]\n' +
                         '格式2：#加灵力 uid [用户ID] [灵力值]\n' +
                         '示例：#加灵力 3127656455 100\n' +
                         '示例：#加灵力 uid 68 100');
            return true;
        }

        const type = args[2] ? args[2].toLowerCase() : '';
        const targetIdentifier = args[3];
        const expToAdd = parseInt(args[4]);

        if (expToAdd <= 0) {
            await e.reply('❌ 灵力值必须为正整数。');
            return true;
        }

        let userData = await this.getUserByIdentifier(targetIdentifier, type);
        const usingUid = (type === 'uid') || (type === '' && targetIdentifier.length < 9);

        if (userData === null) {
            if (usingUid) {
                await e.reply(`❌ 未找到用户ID为 ${targetIdentifier} 的修仙者。`);
                return true;
            } else {
                const groupId = e.group_id ? JSON.stringify(e.group_id) : '';
                userData = {
                    experience: 0,
                    level: 0,
                    levelname: '凡人',
                    group_id: groupId
                };
                await xiuxiandb.updateUserInfo(targetIdentifier, userData);
                userData = await xiuxiandb.getUserInfo(targetIdentifier);
                await e.reply(`ℹ️ 用户 ${targetIdentifier} 不存在，已自动创建并初始化为凡人。`);
            }
        }

        const oldExp = userData.experience;
        userData.experience += expToAdd;
        await userData.save();

        const { need, pwname } = xiuxiandb.experience(userData);
        const idInfo = usingUid ? `用户ID:${userData.id}` : `QQ:${targetIdentifier}`;
        await e.reply(`✅ 灵力增加成功！\n` +
                     `目标：${idInfo} (内部ID:${userData.id})\n` +
                     `操作：增加 ${expToAdd} 点${pwname}\n` +
                     `境界：${userData.levelname}\n` +
                     `${pwname}：${oldExp} → ${userData.experience}\n` +
                     `下一境需求：${need} 点${pwname}`);
        return true;
    }

    /**
     * 为指定用户减少灵力
     */
    async reduceExpToUser(e) {
        if (masterOnly && !e.isMaster) {
            await e.reply('⚠️ 此命令仅管理员可执行。');
            return true;
        }

        const args = e.msg.match(/^#?(给ID减灵力|减灵力)\s*(qq|uid)?\s*(\d+)\s*(\d+)$/i);
        if (!args) {
            await e.reply('❌ 命令格式错误。\n' +
                         '格式1：#减灵力 [目标用户QQ号] [灵力值]\n' +
                         '格式2：#减灵力 uid [用户ID] [灵力值]\n' +
                         '示例：#减灵力 3127656455 50\n' +
                         '示例：#减灵力 uid 68 50');
            return true;
        }

        const type = args[2] ? args[2].toLowerCase() : '';
        const targetIdentifier = args[3];
        const expToReduce = parseInt(args[4]);

        if (expToReduce <= 0) {
            await e.reply('❌ 灵力值必须为正整数。');
            return true;
        }

        let userData = await this.getUserByIdentifier(targetIdentifier, type);
        const usingUid = (type === 'uid') || (type === '' && targetIdentifier.length < 9);

        if (userData === null) {
            if (usingUid) {
                await e.reply(`❌ 未找到用户ID为 ${targetIdentifier} 的修仙者。`);
            } else {
                await e.reply(`❌ 未找到QQ号为 ${targetIdentifier} 的修仙者。`);
            }
            return true;
        }

        const oldExp = userData.experience;
        userData.experience = Math.max(0, oldExp - expToReduce); // 确保灵力不低于0
        
        await userData.save();

        const { need, pwname } = xiuxiandb.experience(userData);
        const idInfo = usingUid ? `用户ID:${userData.id}` : `QQ:${targetIdentifier}`;
        const actualReduced = oldExp - userData.experience;
        
        await e.reply(`✅ 灵力减少成功！\n` +
                     `目标：${idInfo} (内部ID:${userData.id})\n` +
                     `操作：减少 ${actualReduced} 点${pwname}\n` +
                     `境界：${userData.levelname}\n` +
                     `${pwname}：${oldExp} → ${userData.experience}\n` +
                     `下一境需求：${need} 点${pwname}`);
        return true;
    }

    /**
     * 为指定用户增加境界
     */
    async addLevelToUser(e) {
        if (masterOnly && !e.isMaster) {
            await e.reply('⚠️ 此命令仅管理员可执行。');
            return true;
        }

        const args = e.msg.match(/^#?(给ID加境界|加境界)\s*(qq|uid)?\s*(\d+)\s*(\d+)$/i);
        if (!args) {
            await e.reply('❌ 命令格式错误。\n' +
                         '格式1：#加境界 [目标用户QQ号] [境界层数]\n' +
                         '格式2：#加境界 uid [用户ID] [境界层数]\n' +
                         '示例：#加境界 3127656455 2\n' +
                         '示例：#加境界 uid 68 2');
            return true;
        }

        const type = args[2] ? args[2].toLowerCase() : '';
        const targetIdentifier = args[3];
        const levelToAdd = parseInt(args[4]);

        if (levelToAdd <= 0) {
            await e.reply('❌ 境界层数必须为正整数。');
            return true;
        }

        let userData = await this.getUserByIdentifier(targetIdentifier, type);
        const usingUid = (type === 'uid') || (type === '' && targetIdentifier.length < 9);

        if (userData === null) {
            if (usingUid) {
                await e.reply(`❌ 未找到用户ID为 ${targetIdentifier} 的修仙者。`);
                return true;
            } else {
                const groupId = e.group_id ? JSON.stringify(e.group_id) : '';
                userData = {
                    experience: 0,
                    level: 0,
                    levelname: '凡人',
                    group_id: groupId
                };
                await xiuxiandb.updateUserInfo(targetIdentifier, userData);
                userData = await xiuxiandb.getUserInfo(targetIdentifier);
                await e.reply(`ℹ️ 用户 ${targetIdentifier} 不存在，已自动创建并初始化为凡人。`);
            }
        }

        const oldLevel = userData.level;
        const oldLevelName = userData.levelname;
        userData.level += levelToAdd;
        userData.levelname = xiuxiandb.levelName(userData);
        await userData.save();

        const { need, pwname } = xiuxiandb.experience(userData);
        const idInfo = usingUid ? `用户ID:${userData.id}` : `QQ:${targetIdentifier}`;
        await e.reply(`✅ 境界增加成功！\n` +
                     `目标：${idInfo} (内部ID:${userData.id})\n` +
                     `操作：增加 ${levelToAdd} 层境界\n` +
                     `境界：${oldLevelName} → ${userData.levelname}\n` +
                     `${pwname}：${userData.experience}\n` +
                     `下一境需求：${need} 点${pwname}`);
        return true;
    }

    /**
     * 为指定用户减少境界
     */
    async reduceLevelToUser(e) {
        if (masterOnly && !e.isMaster) {
            await e.reply('⚠️ 此命令仅管理员可执行。');
            return true;
        }

        const args = e.msg.match(/^#?(给ID减境界|减境界)\s*(qq|uid)?\s*(\d+)\s*(\d+)$/i);
        if (!args) {
            await e.reply('❌ 命令格式错误。\n' +
                         '格式1：#减境界 [目标用户QQ号] [境界层数]\n' +
                         '格式2：#减境界 uid [用户ID] [境界层数]\n' +
                         '示例：#减境界 3127656455 1\n' +
                         '示例：#减境界 uid 68 1');
            return true;
        }

        const type = args[2] ? args[2].toLowerCase() : '';
        const targetIdentifier = args[3];
        const levelToReduce = parseInt(args[4]);

        if (levelToReduce <= 0) {
            await e.reply('❌ 境界层数必须为正整数。');
            return true;
        }

        let userData = await this.getUserByIdentifier(targetIdentifier, type);
        const usingUid = (type === 'uid') || (type === '' && targetIdentifier.length < 9);

        if (userData === null) {
            if (usingUid) {
                await e.reply(`❌ 未找到用户ID为 ${targetIdentifier} 的修仙者。`);
            } else {
                await e.reply(`❌ 未找到QQ号为 ${targetIdentifier} 的修仙者。`);
            }
            return true;
        }

        const oldLevel = userData.level;
        const oldLevelName = userData.levelname;
        userData.level = Math.max(0, oldLevel - levelToReduce); // 确保境界不低于0（凡人）
        userData.levelname = xiuxiandb.levelName(userData);
        await userData.save();

        const { need, pwname } = xiuxiandb.experience(userData);
        const idInfo = usingUid ? `用户ID:${userData.id}` : `QQ:${targetIdentifier}`;
        const actualReduced = oldLevel - userData.level;
        
        await e.reply(`✅ 境界减少成功！\n` +
                     `目标：${idInfo} (内部ID:${userData.id})\n` +
                     `操作：减少 ${actualReduced} 层境界\n` +
                     `境界：${oldLevelName} → ${userData.levelname}\n` +
                     `${pwname}：${userData.experience}\n` +
                     `下一境需求：${need} 点${pwname}`);
        return true;
    }

    /**
     * 查询指定用户信息
     */
    async queryUser(e) {
        const args = e.msg.match(/^#?查询(用户|境界)\s*(qq|uid)?\s*(\d+)$/i);
        if (!args) {
            await e.reply('❌ 命令格式错误。\n' +
                         '格式1：#查询用户 [QQ号]\n' +
                         '格式2：#查询用户 uid [用户ID]\n' +
                         '示例：#查询用户 3127656455\n' +
                         '示例：#查询用户 uid 68');
            return true;
        }

        const type = args[2] ? args[2].toLowerCase() : '';
        const targetIdentifier = args[3];

        const userData = await this.getUserByIdentifier(targetIdentifier, type);
        const usingUid = (type === 'uid') || (type === '' && targetIdentifier.length < 9);

        if (userData === null) {
            const idType = usingUid ? '用户ID' : 'QQ';
            await e.reply(`❌ 未找到${idType}为 ${targetIdentifier} 的修仙者。`);
            return true;
        }

        const { need, pwname } = xiuxiandb.experience(userData);
        const idInfo = usingUid ? `用户ID:${targetIdentifier}` : `QQ:${targetIdentifier}`;
        await e.reply(`📊 用户修仙信息\n` +
                     `标识：${idInfo} (内部ID:${userData.id})\n` +
                     `境界：${userData.levelname} (第${userData.level}层)\n` +
                     `${pwname}：${userData.experience}\n` +
                     `距离下一境界：${need} 点${pwname}`);
        return true;
    }
}
