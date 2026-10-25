import { Version } from '../components/index.js'

export const helpCfg = {
  title: '修仙帮助',
  subTitle: `${Version.name} & wind-plugin`,
  columnCount: 3,
  colWidth: 265,
  theme: 'all',
  themeExclude: ['default'],
}

export const helpList = [{
  group: '修炼与境界',
  list: [{
    icon: 21,
    title: '修炼/修仙',
    desc: '消耗一次修炼机会，随机获得灵力'
  }, {
    icon: 22,
    title: '我的境界/查看境界',
    desc: '查看自身境界、灵力与突破需求'
  }, {
    icon: 139,
    title: '突破',
    desc: '灵力足够后突破境界，有成功率'
  }, {
    icon: 129,
    title: '境界列表',
    desc: '查看全部境界名称'
  }]
}, {
  group: '丹药',
  list: [{
    icon: 18,
    title: '丹药列表',
    desc: '查看仙/天/地/玄/黄五种丹药'
  }, {
    icon: 20,
    title: '选择丹药 黄丹',
    desc: '设置默认丹药，之后直接服用'
  }, {
    icon: 19,
    title: '服用丹药',
    desc: '按默认丹药结算，未选择会先提示'
  }]
}, {
  group: '闭关',
  list: [{
    icon: 109,
    title: '闭关 2小时',
    desc: '自选闭关时长，收益为修炼的80%'
  }, {
    icon: 110,
    title: '确认闭关',
    desc: '闭关完成后领取全部灵力'
  }, {
    icon: 111,
    title: '打断闭关',
    desc: '提前出关，只能获得已闭关时长的5成'
  }]
}, {
  group: '玩法与排行',
  list: [{
    icon: 117,
    title: '排行榜',
    desc: '本群修仙排行榜'
  }, {
    icon: 116,
    title: '全服排行榜',
    desc: '全服修仙排行榜'
  }, {
    icon: 115,
    title: '群排行榜 群号',
    desc: '查询指定群的修仙排行'
  }, {
    icon: 114,
    title: '决斗@群友',
    desc: '与群友决斗，争夺灵力'
  }, {
    icon: 113,
    title: '清理妖兽',
    desc: '挑战妖兽获得灵力，有冷却'
  }, {
    icon: 112,
    title: '修炼打卡',
    desc: '每日修炼打卡获得灵力'
  }, {
    icon: 108,
    title: '修仙者人数',
    desc: '查看当前修仙者总数'
  }, {
    icon: 107,
    title: '我的id',
    desc: '查看自己的修仙ID'
  }, {
    icon: 106,
    title: '妖兽列表',
    desc: '查看可清理的妖兽'
  }]
}, {
  group: '修仙管理',
  auth: 'master',
  list: [{
    icon: 101,
    title: '关闭群修仙/开启群修仙',
    desc: '控制当前群的修仙开关'
  }, {
    icon: 102,
    title: '全局关闭修仙/全局开启修仙',
    desc: '控制全局修仙开关'
  }, {
    icon: 103,
    title: '全部开启',
    desc: '开启全部群的修仙'
  }, {
    icon: 104,
    title: '加灵力/减灵力 QQ 数值',
    desc: '调整指定用户灵力，支持 uid'
  }, {
    icon: 105,
    title: '加境界/减境界 QQ 数值',
    desc: '调整指定用户境界，支持 uid'
  }, {
    icon: 118,
    title: '全服加灵力 数值',
    desc: '给全服玩家增加灵力'
  }]
}]
