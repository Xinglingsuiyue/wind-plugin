// 导入BaseModel和sequelize
import BaseModel, { sequelize } from './BaseModel.js';
import { Sequelize, DataTypes, Model } from 'sequelize'
// 定义一个xiuxiandb类，继承自BaseModel类
class bossdb extends BaseModel {
	static async getBossInfo(id){
		let boss = await bossdb.findOne({ where: {id} });
		if (boss) {
			return boss;
		} else {
		  return null;
		}
	}
	static async updateBossInfo(boss_name,data) {
    // 尝试从数据库中查询用户记录，如果不存在，就创建一个新的记录
    let boss = await bossdb.findOne({ where: { boss_name } });
    if (!boss) {
      boss = await bossdb.create({...data });
    }
    // 更新用户的信息，并保存到数据库中
    Object.assign(boss,data);
    await boss.save();
  }
	static async getBossByName(boss_name) {
		// 尝试从数据库中查询用户记录，如果不存在，就返回null
		let boss = await bossdb.findOne({ where: { boss_name } });
		if (boss) {
		  return boss;
		} else {
		  return null;
		}
	}
}
const COLUMNS = {
  // 在这里定义模型属性
  id: {
    type: bossdb.Types.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  boss_name: {
    type: bossdb.Types.STRING,
    allowNull: false
  },
  boss_hp: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
  boss_atk: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
  boss_atkper: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
  boss_dod: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
  boss_earntit: {
    type: bossdb.Types.STRING,
    allowNull: false
  },
  boss_earnexp: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
  boss_earnlevel: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
   boss_earngold: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
  boss_earnling: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
  boss_earncele: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
  boss_earnmagic: {
    type: bossdb.Types.INTEGER,
    allowNull: false
  },
};
// 初始化数据库模型和列
BaseModel.initDB(bossdb, COLUMNS, { 
  modelName: 'bossdb',
  singleton: true,
  hooks: {
    // 在这里定义模型的钩子函数
  }
});

// 同步数据库表
await bossdb.sync()

export default bossdb
