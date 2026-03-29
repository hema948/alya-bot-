import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

global.botNumber = "" 

global.owner = [
// ZONA DE JIDS
['201112479305', 'هيما العاق', true],
    ['963949597160', 'وليام العاق', true],
  ['201116880068', 'حرب العاق', true],
["", "", true]
]

global.mods = []
global.suittag = ["201112479305"] 
global.prems = []


global.libreria = "Baileys Multi Device"
global.vs = "^1.3.2"
global.nameqr = "𝒂 𝒍 𝒚 𝒂"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.MichiJadibts = true

global.botname = "𝒂 𝒍 𝒚 𝒂 • 𝒃 𝒐 𝒕-MD"
global.textbot = "𝒂 𝒍 𝒚 𝒂 - 𝒃 𝒐 𝒕, 𝒉 𝒆 𝒎 𝒂"
global.dev = "𝒂 𝒍 𝒚 𝒂 • 𝒃 𝒐 𝒕-MD"
global.author = "*𝒂 𝒍 𝒚 𝒂 • 𝒃 𝒐 𝒕-MD* © mᥲძᥱ ᥕі𝗍һ 𝙮𝙤𝙨𝙪𝙚"
global.etiqueta = "© 𝒉 𝒆 𝒎 𝒂 | 𝟤𝟢𝟤𝟧"
global.currency = "¢ Pesos"
global.michipg = "https://files.catbox.moe/729lkp.jpg"
global.icono = "https://files.catbox.moe/pflz3t.jpg"
global.catalogo = fs.readFileSync('./lib/catalogo.jpg')


global.group = "https://chat.whatsapp.com/Lxu1TDQlXQh5lRBKWJJVrH"
global.community = "https://chat.whatsapp.com/IwfIPGmt9Tv2hgJEXnQ1Fy"
global.channel = "https://whatsapp.com/channel/0029VbBh4ku8aKvPx1m0l822"
global.github = "https://github.com"
global.gmail = "minexdt@gmail.com"
global.ch = {
ch1: "120363424385354007@newsletter",
ch2: "120363424385354007@newsletter"
}


global.APIs = {
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
zenzxz: { url: "https://api.zenzxz.my.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
adonix: { url: "https://api-adonix.ultraplus.click", key: null }
}


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings.js'"))
import(`${file}?update=${Date.now()}`)
})
