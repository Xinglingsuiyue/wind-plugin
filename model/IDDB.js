import BaseModel, { sequelize } from '../../genshin/model/db/BaseModel.js';

// 定义一个IDDB类，继承自BaseModel类
class IDDB extends BaseModel {
  // 定义一个静态方法，用来获取id的值
  static async getID() {
    // 尝试从数据库中查询id记录，如果不存在，就返回null
    let id = await IDDB.findOne();
    if (id) {
      return id.value;
    } else {
      return null;
    }
  }

  // 定义一个静态方法，用来修改id的值
  static async setID(value) {
    // 尝试从数据库中查询id记录，如果不存在，就创建一个新的记录
    let id = await IDDB.findOne();
    if (!id) {
      id = await IDDB.create({ value });
    }
    // 更新id的值，并保存到数据库中
    id.value = value;
    await id.save();
  }
}
const COLUMNS = {
  value: IDDB.Types.INTEGER
};
// 初始化数据库模型和列
BaseModel.initDB(IDDB, COLUMNS, { 
  modelName: 'id',
  singleton: true,
  hooks: {
    beforeCreate: async (id, options) => {
      // 在创建id记录之前，检查数据库中是否已经有id记录
      let count = await IDDB.count();
      if (count > 0) {
        // 如果有，就抛出一个错误，防止重复创建
        throw new Error('id record already exists');
      }
    }
  }
});

// 同步数据库表
await IDDB.sync()

export default IDDB
