// 导入BaseModel和sequelize
import BaseModel, { sequelize } from './BaseModel.js'

// 定义一个xiuxiandb类，继承自BaseModel类
class tradedb extends BaseModel {
  static async getUserInfo (user_id) {
    let user = await tradedb.findOne({ where: { user_id } })
    if (user) return user
    /** 没有数据 新建 */
    user = await tradedb.create({
      user_id,
      ling_stone: 0, // 灵石
      gold_coin: 0, // 金币
      magic_stone: 0, // 魔晶
      celestial_stone: 0 // 仙晶
    })
    return user
  }

  static async updateUserInfo (user_id, data) {
    // 尝试从数据库中查询用户记录，如果不存在，就创建一个新的记录
    let user = await tradedb.findOne({ where: { user_id } })
    if (!user) {
      user = await tradedb.create({ user_id, ...data })
    }
    // 更新用户的信息，并保存到数据库中
    Object.assign(user, data)
    await user.save()
  }

  static async getUserById (id) {
    // 尝试从数据库中查询用户记录，如果不存在，就返回null
    let user = await tradedb.findOne({ where: { id } })
    if (user) {
      return user
    } else {
      return null
    }
  }

  static async getTopUsers (limit) {
    // 尝试从数据库中查询用户记录，按照境界的三倍加上灵力值降序排序，限制返回数量为limit
    let users = await tradedb.findAll({
      order: [
        [sequelize.literal('celestial_stone * 1000 * 1000000 + magic_stone * 1000 * 1000000 + ling_stone * 1000000 + gold_coin'), 'DESC'] // 使用sequelize.literal来包裹自定义的排序条件
      ],
      limit
    })
    if (users) {
      return users
    } else {
      return []
    }
  }

  static async getRankByUserId (user_id) {
    // 尝试从数据库中查询用户记录，按照境界的三倍加上灵力值降序排序
    let users = await tradedb.findAll({
      order: [
        [sequelize.literal('celestial_stone * 1000 * 1000000 + magic_stone * 1000 * 1000000 + ling_stone * 1000000 + gold_coin'), 'DESC']
      ]
    })
    if (users) {
      // 遍历用户记录，找到匹配的 user_id，并返回其索引值加一作为名次
      for (let i = 0; i < users.length; i++) {
        if (users[i].user_id == user_id) {
          return i + 1
        }
      }
      // 如果没有找到匹配的 user_id，返回 -1 表示不存在
      return -1
    } else {
      // 如果数据库中没有用户记录，返回 -1 表示不存在
      return -1
    }
  }

  static async clearall () {
    let users = await tradedb.findAll() // 遍历每个用户记录
    for (let user of users) { // 根据value的大小，给用户的level加上对应的数值
      user.celestial_stone = 2000
      user.magic_stone = 2000
      user.ling_stone = 2000
      user.gold_coin = 20000000
      await user.save()
    }
  }

  static async decelestial (value) { // 尝试从数据库中查询所有用户记录
    let users = await tradedb.findAll() // 遍历每个用户记录
    for (let user of users) { // 根据value的大小，给用户的level加上对应的数值
      user.celestial_stone -= value
      await user.save()
    }
  }

  static async addcelestial (value) { // 尝试从数据库中查询所有用户记录
    let users = await tradedb.findAll() // 遍历每个用户记录
    for (let user of users) { // 根据value的大小，给用户的level加上对应的数值
      user.celestial_stone += value
      await user.save()
    }
  }

  static async addmagic (value) { // 尝试从数据库中查询所有用户记录
    let users = await tradedb.findAll() // 遍历每个用户记录
    for (let user of users) { // 根据value的大小，给用户的level加上对应的数值
      user.magic_stone += value
      await user.save()
    }
  }

  static async addling (value) { // 尝试从数据库中查询所有用户记录
    let users = await tradedb.findAll() // 遍历每个用户记录
    for (let user of users) { // 根据value的大小，给用户的level加上对应的数值
      user.ling_stone += value
      await user.save()
    }
  }

  static async addgold (value) { // 尝试从数据库中查询所有用户记录
    let users = await tradedb.findAll() // 遍历每个用户记录
    for (let user of users) { // 根据value的大小，给用户的level加上对应的数值
      user.gold_coin += value
      await user.save()
    }
  }
}

const COLUMNS = {
  // 在这里定义模型属性
  id: {
    type: tradedb.Types.INTEGER,
    /** 自增 */
    autoIncrement: true,
    allowNull: false,
    primaryKey: true // 使用id作为主键
  },
  user_id: {
    type: tradedb.Types.STRING,
    allowNull: false
  },
  ling_stone: { // 灵石
    type: tradedb.Types.INTEGER,
    allowNull: false
  },
  gold_coin: { // 金币
    type: tradedb.Types.INTEGER,
    allowNull: false
  },
  magic_stone: { // 魔晶
    type: tradedb.Types.INTEGER,
    allowNull: false
  },
  celestial_stone: { // 仙晶
    type: tradedb.Types.INTEGER,
    allowNull: false
  }
}
// 初始化数据库模型和列
BaseModel.initDB(tradedb, COLUMNS, {
  modelName: 'tradedb',
  singleton: true,
  hooks: {
    // 在这里定义模型的钩子函数
  }
})

// 同步数据库表
await tradedb.sync()

export default tradedb
