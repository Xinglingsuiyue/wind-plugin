// 导入BaseModel和sequelize
import BaseModel, { sequelize } from './BaseModel.js';

// 定义一个xiuxiandb类，继承自BaseModel类
class xiuxiandb extends BaseModel {
  // 定义一个静态方法，用来获取用户的修仙信息
  static async getUserInfo(user_id) {
    // 尝试从数据库中查询用户记录，如果不存在，就返回null
    let user = await xiuxiandb.findOne({ where: { user_id } });
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  // 定义一个静态方法，用来修改用户的修仙信息
  static async updateUserInfo(user_id, data) {
    // 尝试从数据库中查询用户记录，如果不存在，就创建一个新的记录
    let user = await xiuxiandb.findOne({ where: { user_id } });
    if (!user) {
      user = await xiuxiandb.create({ user_id,...data });
    }
    // 更新用户的信息，并保存到数据库中
    Object.assign(user, data);
    await user.save();
  }
  static async getTopUsers(group_id,limit) {
	  // 尝试从数据库中查询用户记录，按照境界的三倍加上灵力值降序排序，限制返回数量为limit
	  let users = await xiuxiandb.findAll({
	   where: {
		group_id: group_id // 根据group_id过滤
		},
		order: [
		  [sequelize.literal('level * 3 + experience'), 'DESC'] // 使用sequelize.literal来包裹自定义的排序条件
		],
		limit: limit
	  });
	  if (users) {
		return users;
	  } else {
		return [];
	  }
	}
	static async getTopUsers2(limit) {
	  // 尝试从数据库中查询用户记录，按照境界的三倍加上灵力值降序排序，限制返回数量为limit
	  let users = await xiuxiandb.findAll({
		order: [
		  [sequelize.literal('level * 3 + experience'), 'DESC'] // 使用sequelize.literal来包裹自定义的排序条件
		],
		limit: limit
	  });
	  if (users) {
		return users;
	  } else {
		return [];
	  }
	}
  // 定义一个静态方法，用来通过id查询用户的修仙信息
  static async getUserById(id) {
    // 尝试从数据库中查询用户记录，如果不存在，就返回null
    let user = await xiuxiandb.findOne({ where: { id } });
    if (user) {
      return user;
    } else {
      return null;
    }
  }
  static async getAllUser() {
    // 尝试从数据库中查询用户记录，如果不存在，就返回null
    let user = await xiuxiandb.findOne();
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  // 定义一个静态方法，用来通过group_id查询用户的修仙信息
  static async getUsersByGroupId(group_id) {
    // 尝试从数据库中查询用户记录，如果不存在，就返回空数组
    let users = await xiuxiandb.findAll({ where: { group_id } });
    if (users) {
      return users;
    } else {
      return [];
    }
  }
  static async getMaxId() {
    try {
      // 使用sequelize.max方法来获取id列的最大值
      let maxId = await xiuxiandb.max("id");
      // 返回查询结果，或者0，如果查询结果为空
      return maxId || 0;
    } catch (error) {
      // 打印错误信息，并返回0
      console.error(error);
      return 0;
    }
  }
}
const COLUMNS = {
  // 在这里定义模型属性
  user_id: {
    type: xiuxiandb.Types.STRING,
    allowNull: false,
    primaryKey: true // 如果user_id是主键，否则可以删除
  },
  id: {
    type: xiuxiandb.Types.INTEGER,
    allowNull: false,
    autoIncrement: true, // 设置自增选项
    initialValue: 1,
    increment: 1
  },
  experience: {
    type: xiuxiandb.Types.INTEGER,
    allowNull: false
  },
  level: {
    type: xiuxiandb.Types.INTEGER,
    allowNull: false
  },
  levelname: {
    type: xiuxiandb.Types.STRING,
    allowNull: false
  },
  group_id: {
    type: xiuxiandb.Types.JSON, // 如果group_id是字符串数组，否则可以修改
    allowNull: false
  }
};
// 初始化数据库模型和列
BaseModel.initDB(xiuxiandb, COLUMNS, { 
  modelName: 'xiuxiandb',
  singleton: true,
  hooks: {
    // 在这里定义模型的钩子函数
  }
});

// 同步数据库表
await xiuxiandb.sync()

export default xiuxiandb
