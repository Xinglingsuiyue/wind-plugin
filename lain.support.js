export default class Button {
  constructor() {
    this.plugin = {
      name: "wind-plugin",
      dsc: "wind-plugin",
      priority: -999,
      rule: [
        {
          reg: '^#?(百度|baidu|抖音|tiktok|(今日)?头条|微博|知乎|((bili|哔哩)?(bili|哔哩)))(热搜榜|热榜|热度榜|热搜)$',
          fnc: 'hot'
        },
        {
          reg: '^#?(bili|哔哩)?(bili|哔哩)周榜(.*)$',
          fnc: 'hot'
        },
        {
          reg: '^#?(今日)?头条(新闻|热点新闻)$',
          fnc: 'hot'
        },
        {
          reg: "^#?(wind|风|Wind|WIND)(命令|帮助|菜单|help|说明|功能|指令|使用说明)$",
          fnc: 'help'
        },
        {
          reg: "^#?(我的境界|查看境界)$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?(修炼|修仙|服用丹药)$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?(闭关)?突破$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?(修仙|修炼)?境界列表$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?排行榜$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?我要境界(.*)$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?我要灵力(.*)$",
          fnc: 'xiuxian'
        },
        {  
          reg: "^#?(修仙者|修炼者|用户)(人数|数量)$",
          fnc: 'xiuxian'
        },
        {  
          reg: "^#?我的id$",
          fnc: 'xiuxian'
        },
        {
          reg: "#?全服(排行榜|排名)$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?(战斗|决斗|pk|PK|攻打|battle)(.*)$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?扣除境界(.*)$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?扣除灵力(.*)$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?test2$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?给他境界(.*)$",
          fnc: 'xiuxian'
        },
        {
          reg: "^#?给他灵力(.*)$",
          fnc: 'xiuxian'
        },
        //{
        //  reg: "^#?清理妖兽",
        //  fnc: "xiuxian"
        //},
        //{
        //	reg: '^#?妖兽信息',
        //	fnc: 'xiuxian'
        //}
      ]
    }
  }

  hot (e) {
    return Bot.Button(e.Buttons)
  }

  help () {
    const btn = [
      { label: '修仙'},
      { label: '知乎热搜'},
    ]
    return Bot.Button(btn)
  }

  xiuxian () {
    const btn = []
    btn.push(...shuffle([
      { label: "修仙", callback: `修仙` },
      { label: "突破", callback: `突破` },
      { label: "服用丹药", callback: `服用丹药` },
    ]))
    btn.push(...[
      { label: "我的境界", callback: `我的境界` },
      { label: "决斗" },
      { label: "我的id", callback: `我的id` },
      { label: "境界列表", callback: `修仙境界列表` },
      { label: "排行榜", enter: true },
      { label: "全服排行榜", enter: true },
    ])
    return Bot.Button(btn, 3)
  }
}

function shuffle(array) {
  return Array.from({ length: array.length }, () => {
      const index = Math.floor(Math.random() * array.length);
      return array.splice(index, 1)[0];
  });
}
