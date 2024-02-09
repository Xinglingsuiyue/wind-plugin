// 导入BaseModel和sequelize
import BaseModel, { sequelize } from './BaseModel.js';
import { Sequelize, DataTypes, Model } from 'sequelize'
// 定义一个xiuxiandb类，继承自BaseModel类
class bossplayerdb extends BaseModel {
	static async getUserInfo(ids){
		let user = await bossplayerdb.findOne({ where: {ids} });
		if (user) {
			return user;
		} else {
		  return null;
		}
	}
	static async updateUserInfo(ids, data) {
    // 尝试从数据库中查询用户记录，如果不存在，就创建一个新的记录
    let user = await bossplayerdb.findOne({ where: { ids } });
    if (!user) {
      user = await bossplayerdb.create({ ids,...data });
    }
    // 更新用户的信息，并保存到数据库中
    Object.assign(user, data);
    await user.save();
  }
  static async getAllUsers(id) {
	  // 尝试从数据库中查询用户记录，按照财富值值降序排序，限制返回数量为limit
	  let users = await bossplayerdb.findAll({ where: { id } });
	  if (users) {
		return users;
	  } else {
		return [];
	  }
	}
}
const COLUMNS = {
  // 在这里定义模型属性
  ids: {
    type: bossplayerdb.Types.STRING,
    allowNull: false,
    primaryKey: true // 使用id作为主键
  },
  id: {
    type: bossplayerdb.Types.INTEGER,
    allowNull: false,
    primaryKey: true // 使用id作为主键
  },
  user_id: {
    type: bossplayerdb.Types.STRING,
    allowNull: false
  },
  times: {
    type: bossplayerdb.Types.INTEGER,
    allowNull: false
  }
};
// 初始化数据库模型和列
BaseModel.initDB(bossplayerdb, COLUMNS, { 
  modelName: 'bossplayerdb',
  singleton: true,
  hooks: {
    // 在这里定义模型的钩子函数
  }
});

// 同步数据库表
await bossplayerdb.sync()

export default bossplayerdb
