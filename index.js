import fs from 'node:fs'
if (!global.segment) {
    global.segment = (await import("oicq")).segment
}
const files = fs
    .readdirSync('./plugins/wind-plugin/apps')
    .filter( file => file.endsWith('.js'))
let ret = []
files.forEach((file) => {
    ret.push(import(`./apps/${file}`))
})
ret = await Promise.allSettled(ret)
let apps = {}
for (let i in files) {
    let name = files[i].replace('.js', '')
    if (ret[i].status != 'fulfilled') {
        logger.error(`载入插件错误：${logger.red(name)}`)
        logger.error(ret[i].reason)
        continue
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }
logger.info(logger.green('------------------'))
logger.info(logger.green('          .,:,,,                                        .::,,,::.          '))
logger.info(logger.green('        .::::,,;;,                                  .,;;:,,....:i:         '))
logger.info(logger.green('        :i,.::::,;i:.      ....,,:::::::::,....   .;i:,.  ......;i.        '))
logger.info(logger.green('        :;..:::;::::i;,,:::;:,,,,,,,,,,..,.,,:::iri:. .,:irsr:,.;i.        '))
logger.info(logger.green('        ;;..,::::;;;;ri,,,.                    ..,,:;s1s1ssrr;,.;r,        '))
logger.info(logger.green('        :;. ,::;ii;:,     . ...................     .;iirri;;;,,;i,        '))
logger.info(logger.green('        ,i. .;ri:.   ... ............................  .,,:;:,,,;i:        '))
logger.info(logger.green('        :s,.;r:... ....................................... .::;::s;        '))
logger.info(logger.green('        ,1r::. .............,,,.,,:,,........................,;iir;        '))
logger.info(logger.green('        ,s;...........     ..::.,;:,,.          ...............,;1s        '))
logger.info(logger.green('       :i,..,.              .,:,,::,.          .......... .......;1,       '))
logger.info(logger.green('      ir,....:rrssr;:,       ,,.,::.     .r5S9989398G95hr;. ....,.:s,      '))
logger.info(logger.green('     ;r,..,s9855513XHAG3i   .,,,,,,,.  ,S931,.,,.;s;s&BHHA8s.,..,..:r:     '))
logger.info(logger.green('    :r;..rGGh,  :SAG;;G@BS:.,,,,,,,,,.r83:      hHH1sXMBHHHM3..,,,,.ir.    '))
logger.info(logger.green('   ,si,.1GS,   sBMAAX&MBMB5,,,,,,:,,.:&8       3@HXHBMBHBBH#X,.,,,,,,rr    '))
logger.info(logger.green('   ;1:,,SH:   .A@&&B#&8H#BS,,,,,,,,,.,5XS,     3@MHABM&59M#As..,,,,:,is,   '))
logger.info(logger.green('  .rr,,,;9&1   hBHHBB&8AMGr,,,,,,,,,,,:h&&9s;   r9&BMHBHMB9:  . .,,,,;ri.  '))
logger.info(logger.green('  :1:....:5&XSi;r8BMBHHA9r:,......,,,,:ii19GG88899XHHH&GSr.      ...,:rs.  '))
logger.info(logger.green('  ;s.     .:sS8G8GG889hi.        ....,,:;:,.:irssrriii:,.        ...,,i1,  '))
logger.info(logger.green('  ;1,         ..,....,,isssi;,        .,,.                      ....,.i1,  '))
logger.info(logger.green('  ;h:               i9HHBMBBHAX9:         .                     ...,,,rs,  '))
logger.info(logger.green('  ,1i..            :A#MBBBBMHB##s                             ....,,,;si.  '))
logger.info(logger.green('  .r1,..        ,..;3BMBBBHBB#Bh.     ..                    ....,,,,,i1;   '))
logger.info(logger.green('   :h;..       .,..;,1XBMMMMBXs,.,, .. :: ,.               ....,,,,,,ss.   '))
logger.info(logger.green('    ih: ..    .;;;, ;;:s58A3i,..    ,. ,.:,,.             ...,,,,,:,s1,    '))
logger.info(logger.green('    .s1,....   .,;sh,  ,iSAXs;.    ,.  ,,.i85            ...,,,,,,:i1;     '))
logger.info(logger.green('     .rh: ...     rXG9XBBM#M#MHAX3hss13&&HHXr         .....,,,,,,,ih;      '))
logger.info(logger.green('      .s5: .....    i598X&&A&AAAAAA&XG851r:       ........,,,,:,,sh;       '))
logger.info(logger.green('      . ihr, ...  .         ..                    ........,,,,,;11:.       '))
logger.info(logger.green('         ,s1i. ...  ..,,,..,,,.,,.,,.,..       ........,,.,,.;s5i.         '))
logger.info(logger.green('          .:s1r,......................       ..............;shs,           '))
logger.info(logger.green('          . .:shr:.  ....                 ..............,ishs.             '))
logger.info(logger.green('              .,issr;,... ...........................,is1s;.               '))
logger.info(logger.green('                 .,is1si;:,....................,:;ir1sr;,                  '))
logger.info(logger.green('                    ..:isssssrrii;::::::;;iirsssssr;:..                    '))
logger.info(logger.green('                         .,::iiirsssssssssrri;;:.                          '))
logger.info(logger.yellow('                         wind插件加载完毕~~                                 '))
logger.info(logger.green('------------------'))