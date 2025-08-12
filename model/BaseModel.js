import { Sequelize, DataTypes, Model } from 'sequelize'
import { Data } from '../components/index.js'

Data.createDir('/data/wind-db', 'root')
let dbPath = process.cwd() + '/data/wind-db/xiuxiandata.db'

// TODO DB自定义
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
})

await sequelize.authenticate()

export default class BaseModel extends Model {
  static Types = DataTypes

  static initDB (model, columns) {
    let name = model.name
    name = name.replace(/DB$/, 's')
    model.init(columns, { sequelize, tableName: name })
    model.COLUMNS = columns
  }
}
export { sequelize }
