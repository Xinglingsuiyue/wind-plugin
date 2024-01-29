// 导入BaseModel和sequelize
import BaseModel, { sequelize } from './BaseModel.js';
import { Sequelize, DataTypes, Model } from 'sequelize'
// 定义一个xiuxiandb类，继承自BaseModel类
class xiuxiandb extends BaseModel {
	static async addLevel(value) { // 尝试从数据库中查询所有用户记录
		const findlevelname=["凡人","炼气第1层","炼气第2层","炼气第3层","炼气第4层","炼气第5层","炼气第6层","炼气第7层","炼气第8层","炼气第9层","筑基第1层","筑基第2层","筑基第3层","筑基第4层","筑基第5层","筑基第6层","筑基第7层","筑基第8层","筑基第9层","金丹第1层","金丹第2层","金丹第3层","金丹第4层","金丹第5层","金丹第6层","金丹第7层","金丹第8层","金丹第9层","元婴第1层","元婴第2层","元婴第3层","元婴第4层","元婴第5层","元婴第6层","元婴第7层","元婴第8层","元婴第9层","化神第1层","化神第2层","化神第3层","化神第4层","化神第5层","化神第6层","化神第7层","化神第8层","化神第9层","合体第1层","合体第2层","合体第3层","合体第4层","合体第5层","合体第6层","合体第7层","合体第8层","合体第9层","大乘第1层","大乘第2层","大乘第3层","大乘第4层","大乘第5层","大乘第6层","大乘第7层","大乘第8层","大乘第9层","渡劫第1层","渡劫第2层","渡劫第3层","渡劫第4层","渡劫第5层","渡劫第6层","渡劫第7层","渡劫第8层","渡劫第9层","人仙境初期","人仙境中期","人仙境后期","人仙境圆满","地仙境初期","地仙境中期","地仙境后期","地仙境圆满","天仙境初期","天仙境中期","天仙境后期","天仙境圆满","金仙境初期","金仙境中期","金仙境后期","金仙境圆满","大罗金仙境初期","大罗金仙境中期","大罗金仙境后期","大罗金仙境圆满","准仙帝境","准仙帝境圆满","仙帝境","仙帝境圆满","天人五衰之仙衰","天人五衰之躯衰","天人五衰之窍衰","天人五衰之魂衰","天人五衰之煞衰","圣人第1层","圣人第2层","圣人第3层","圣人第4层","圣人第5层","圣人第6层","圣人第7层","圣人第8层","圣人第9层"]
		let users = await xiuxiandb.findAll(); // 遍历每个用户记录 
		for (let user of users) { // 根据value的大小，给用户的level加上对应的数值 
			user.level+=value
			if(user.level<111) user.levelname=findlevelname[user.level];
            		if(user.level>110&&user.level<10000) user.levelname=`大帝第${user.level-110}重天`;
           		if(user.level>=10000) user.levelname="道祖";
			await user.save(); 
			} 
	}	
	static async addExperience(value) { // 尝试从数据库中查询所有用户记录
			let users = await xiuxiandb.findAll(); // 遍历每个用户记录 
			for (let user of users) { // 根据value的大小，给用户的level加上对应的数值 
				user.experience+=value
				await user.save();
				} 
	}
	static async moveback(){
		const levelname=['凡人','练气期','筑基期','金丹期','元婴期','化神期','合体期','大乘期','渡劫期','人仙境','地仙境','天仙境','金仙境','大罗金仙境','准仙帝','仙帝','天人五衰境','圣人','大帝','道祖']
		const findlevelname=["凡人","炼气第1层","炼气第2层","炼气第3层","炼气第4层","炼气第5层","炼气第6层","炼气第7层","炼气第8层","炼气第9层","筑基第1层","筑基第2层","筑基第3层","筑基第4层","筑基第5层","筑基第6层","筑基第7层","筑基第8层","筑基第9层","金丹第1层","金丹第2层","金丹第3层","金丹第4层","金丹第5层","金丹第6层","金丹第7层","金丹第8层","金丹第9层","元婴第1层","元婴第2层","元婴第3层","元婴第4层","元婴第5层","元婴第6层","元婴第7层","元婴第8层","元婴第9层","化神第1层","化神第2层","化神第3层","化神第4层","化神第5层","化神第6层","化神第7层","化神第8层","化神第9层","合体第1层","合体第2层","合体第3层","合体第4层","合体第5层","合体第6层","合体第7层","合体第8层","合体第9层","大乘第1层","大乘第2层","大乘第3层","大乘第4层","大乘第5层","大乘第6层","大乘第7层","大乘第8层","大乘第9层","渡劫第1层","渡劫第2层","渡劫第3层","渡劫第4层","渡劫第5层","渡劫第6层","渡劫第7层","渡劫第8层","渡劫第9层","人仙境初期","人仙境中期","人仙境后期","人仙境圆满","地仙境初期","地仙境中期","地仙境后期","地仙境圆满","天仙境初期","天仙境中期","天仙境后期","天仙境圆满","金仙境初期","金仙境中期","金仙境后期","金仙境圆满","大罗金仙境初期","大罗金仙境中期","大罗金仙境后期","大罗金仙境圆满","准仙帝境","准仙帝境圆满","仙帝境","仙帝境圆满","天人五衰之仙衰","天人五衰之躯衰","天人五衰之窍衰","天人五衰之魂衰","天人五衰之煞衰","圣人第1层","圣人第2层","圣人第3层","圣人第4层","圣人第5层","圣人第6层","圣人第7层","圣人第8层","圣人第9层"]
const level_exp=[0,50,100,150,200,250,300,350,400/*炼气*/,460,520,580,640,700,760,820,880,940/*筑基*/,1010,1080,1150,1220,1290,1360,1430,1500,1570/*金丹*/,1650,1730,1810,1890,1970,2050,2130,2210,2290/*元婴*/,2380,2470,2560,2650,2740,2830,2920,3010,3100/*化神*/,3200,3300,3400,3500,3600,3700,3800,3900,4000/*合体*/,4100,4200,4300,4400,4500,4600,4700,4800,4900/*大乘*/,5000,5100,5200,5300,5400,5500,5600,5700,5800/*渡劫*/,6000,6200,6400,6600/*人仙*/,6900,7200,7500,7800/*地仙*/,8150,8500,8850,9200/*天仙*/,9600,10000,10400,10800/*金仙*/,11200,11600,12000,12400/*大罗金仙*/,13000,13800/*准仙帝*/,14600,15500/*仙帝*/,16500,17500,18500,19500,20500/*天人五衰*/,21500,22500,23500,24500,25500,26500,27500,28500,29500,30500/*圣人*/];
		let users = await xiuxiandb.findAll(); 
        let i
		for (let user of users) { // 根据value的大小，给用户的level加上对应的数值 
            if(user.level<111){
				for(i=0;i<level_exp.length;i++){
					if(user.experience>=level_exp[i]&&user.experience<level_exp[i+1]){
						user.level=i
						break
						}
				}
                user.levelname=findlevelname[user.level]
            }
            if(user.level>110&&user.level<10000){
                for(i=111;i<10000;i++){
                    if(user.experience>1000*(i-110)+30500&&user.experience<1000*(i-109)+30500){
                         user.level=i
                        break
                    }
                }
                user.levelname=`大帝第${user.level-110}重天`
            }
            if(user.level>=10000){
                for(i=10000;i>110;i--){
                    if(user.experience>1000*(10000-110)+30500) break
                    if(user.experience>1000*(i-110)+30500&&user.experience<1000*(i-109)+30500){
                        user.level=i
                        break
                    }
                }
                user.levelname='道祖'
            }
			await user.save();
		} 
	}
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
  static async getAllUsers(){
	let users = await xiuxiandb.findAll()
	if(users){
		return users
	} else {
		return [];
	}
  }
  static async getTopUsers(group_id,limit) {
	  // 尝试从数据库中查询用户记录，按照境界的三倍加上灵力值降序排序，限制返回数量为limit
	  let users = await xiuxiandb.findAll({
	   where: {
        group_id: {
          [Sequelize.Op.like]: `%${group_id}%`
			}
		},
		order: [
		  [sequelize.literal('level * level + experience'), 'DESC'] // 使用sequelize.literal来包裹自定义的排序条件
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
		  [sequelize.literal('level * level + experience'), 'DESC'] // 使用sequelize.literal来包裹自定义的排序条件
		],
		limit: limit
	  });
	  if (users) {
		return users;
	  } else {
		return [];
	  }
	}
	static async getAllUsers() {
		let users = await xiuxiandb.findAll()
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
static async isInGroup(user_id, group_id) {
  // 尝试从数据库中查询用户记录，根据user_id和group_id
  let user = await xiuxiandb.findOne({ where: { user_id, group_id } });
  if (user) {
    // 如果查询结果不为空，说明用户已经加入了该群组，返回true
    return true;
  } else {
    // 如果查询结果为空，说明用户没有加入该群组，返回false
    return false;
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
  id: {
    type: xiuxiandb.Types.INTEGER,
    allowNull: false,
    primaryKey: true, // 使用id作为主键
    autoIncrement: true // 使用自增长的方式生成id
  },
  user_id: {
    type: xiuxiandb.Types.STRING,
    allowNull: false
  },
  group_id: {
    type: xiuxiandb.Types.STRING, // 如果group_id是字符串数组，否则可以修改
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
  experience: {
    type: xiuxiandb.Types.INTEGER,
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
