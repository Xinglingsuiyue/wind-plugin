import fs from 'fs'
import YAML from 'yaml'
const apiPath = './plugins/wind-plugin/config/api.yaml'
const apidefaultPath = './plugins/wind-plugin/config/default_config/api.yaml'
let data
if (fs.existsSync(apiPath)) { data = YAML.parse(fs.readFileSync(apiPath, 'utf8')) } else {
  data = YAML.parse(fs.readFileSync(apidefaultPath, 'utf8'))
  data = YAML.stringify(data)
  fs.writeFileSync(apiPath, data, 'utf8')
}
let i
let reg = ''
let atn = []
let btn = []
let arr = []
for (i = 0; i < data.length; i++) {
  atn.push({ text: data[i].split('::')[0], callback: data[i].split('::')[0] })
  if (atn.length == 5) {
    btn.push(atn)
    atn = []
  }
  arr.push(data[i].split('::')[0])
  reg += data[i].split('::')[0] + '|'
}
reg += '视频板块'
if (atn) {
  btn.push(atn)
  atn = []
}
btn = segment.button(...btn)
logger.info(reg)
export class video extends plugin {
  constructor () {
    super({
      name: 'wind-video',
      dsc: 'wind-video',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      priority: -999999,
      rule: [
        {
          reg,
          fnc: 'video'
        }
      ]
    })
  }

  async video (e) {
    for (i = 0; i < arr.length; i++) {
      if (e.msg == arr[i]) { break }
    }
    if (e.msg.includes('视频板块')) return await e.reply(['当前为视频板块', btn])
    let url = data[i]
    url = url.split('::')[Math.round(1 + (url.split('::').length - 2) * Math.random())]
    logger.info(url)
    await e.reply(segment.video(url))
    await e.reply(['当前为视频板块', btn])
  }
}
