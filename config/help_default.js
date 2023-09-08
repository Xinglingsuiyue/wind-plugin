import { Version } from '../../components/index.js'
/**
* 请注意，系统不会读取help_default.js ！！！！
* 【请勿直接修改此文件，且可能导致后续冲突】
*
* 如需自定义可将文件【复制】一份，并重命名为 help.js
*
* */

export const helpCfg = {
  title: 'wind-plugin帮助',
  subTitle: `${Version.name} & wind-plugin`,
  columnCount: 3,
  colWidth: 265,
  theme: 'all',
  themeExclude: ['default'],
}

export const helpList = [{
  group: '各大平台热搜',
  list: [{
    icon: 117,
    title: 'bilibili热搜/哔哩哔哩热搜',
    desc: '哔哩哔哩热搜'
  }, {
    icon: 116,
    title: '抖音热搜/tiktok热搜',
    desc: '抖音热搜'
  }, {
    icon: 115,
    title: '知乎热搜',
    desc: '知乎热搜'
  }, {
    icon: 114,
    title: '微博热搜',
    desc: '微博热搜'
  }, {
    icon: 113,
    title: '今日头条热搜',
    desc: '今日头条热搜'
  }, {
    icon: 112,
    title: 'bilibili周榜/哔哩哔哩周榜',
    desc: '哔哩哔哩周榜'
  }, {
    icon: 111,
    title: '今日头条新闻/今日头条热点新闻',
    desc: '今日头条热点新闻'
  }]
}, {
  group: '轻量修仙',
  list: [{
    icon: 21,
    title: '修仙/修炼',
    desc: '修炼增加自身灵力'
  }, {
    icon: 22,
    title: '查看境界',
    desc: '查看自身境界'
  }, {
    icon: 18,
    title: '服用丹药',
    desc: '使用丹药增加自身灵力'
  }, {
    icon: 139,
    title: '突破/闭关突破',
    desc: '突破境界'
  }, {
    icon: 129,
    title: '修仙境界列表/修炼境界列表',
    desc: '修仙境界列表'
  }]
}]