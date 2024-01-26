// 导入BaseModel和sequelize
import BaseModel, { sequelize } from './BaseModel.js';
import { Sequelize, DataTypes, Model } from 'sequelize'
// 定义一个xiuxiandb类，继承自BaseModel类
class tradedb extends BaseModel {
	static async getUserInfo(user_id){
		let user = await tradedb.findOne({ where: {user_id} });
		if (user) {
			return user;
		} else {
		  return null;
		}
	}
	static async updateUserInfo(user_id, data) {
    // 尝试从数据库中查询用户记录，如果不存在，就创建一个新的记录
    let user = await tradedb.findOne({ where: { user_id } });
    if (!user) {
      user = await tradedb.create({ user_id,...data });
    }
    // 更新用户的信息，并保存到数据库中
    Object.assign(user, data);
    await user.save();
  }
  static async getTopUsers(limit) {
	  // 尝试从数据库中查询用户记录，按照财富值值降序排序，限制返回数量为limit
	  let users = await xiuxiandb.findAll({
		order: [
		  [sequelize.literal('ling_stone'), 'DESC'] // 使用sequelize.literal来包裹自定义的排序条件
		],
		limit: limit
	  });
	  if (users) {
		return users;
	  } else {
		return [];
	  }
	}
	static async getUserById(id) {
		// 尝试从数据库中查询用户记录，如果不存在，就返回null
		let user = await tradedb.findOne({ where: { id } });
		if (user) {
		  return user;
		} else {
		  return null;
		}
	}
}
const COLUMNS = {
  // 在这里定义模型属性
  id: {
    type: tradedb.Types.INTEGER,
    allowNull: false,
    primaryKey: true // 使用id作为主键
  },
  user_id: {
    type: tradedb.Types.STRING,
    allowNull: false
  },
  ling_stone: {//灵石
    type: tradedb.Types.INTEGER,
    allowNull: false
  },
  gold_coin: {//金币
    type: tradedb.Types.INTEGER,
    allowNull: false
  },
  magic_stone: {//魔晶
    type: tradedb.Types.INTEGER,
    allowNull: false
  },
  celestial_stone: {//仙晶
    type: tradedb.Types.INTEGER,
    allowNull: false
  }
};
// 初始化数据库模型和列
BaseModel.initDB(tradedb, COLUMNS, { 
  modelName: 'tradedb',
  singleton: true,
  hooks: {
    // 在这里定义模型的钩子函数
  }
});

// 同步数据库表
await tradedb.sync()

export default tradedb
