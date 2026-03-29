import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) { 
  global.canalIdM = ["120363424385354007@newsletter", "120363424385354007@newsletter"]
  global.canalNombreM = ["⌗ 𝒂𝒍𝒚𝒂･𝒃𝒐𝒕", "⌗ 𝒂𝒍𝒚𝒂･𝒃𝒐𝒕²"]
  global.channelRD = await getRandomChannel()

  global.d = new Date(new Date + 3600000)
  global.locale = 'es'
  global.dia = d.toLocaleDateString(locale, { weekday: 'long' })
  global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' })
  global.mes = d.toLocaleDateString('es', { month: 'long' })
  global.año = d.toLocaleDateString('es', { year: 'numeric' })
  global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })

  var canal = 'https://whatsapp.com/channel/0029VbBh4ku8aKvPx1m0l822'  
  var comunidad = 'https://chat.whatsapp.com/IwfIPGmt9Tv2hgJEXnQ1Fy'
  var git = 'https://github.com/'
  var github = 'https://github.com/' 
  var correo = 'minexdt@gmail.com'
  global.redes = pickRandom([canal, comunidad, git, github, correo])

  global.nombre = m.pushName || 'Anónimo'
  global.packsticker = `╮┄┄┄┄┄┄┄┄┄┄┄┄╭
𝙽𝚊𝚖𝚎 : 𝒂 𝒍 𝒚 𝒂･𝒃 𝒐 𝒕
⏱ ࣪𓏲ִ𝚃𝙷𝙴 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 ⊹₊˚𖥔⸼
𝙾𝚠𝚗𝚎𝚛 : 𝒉 𝒆 𝒎 𝒂ｼ
╯┄┄┄┄┄┄┄┄┄┄┄┄╰
⏱`
global.namebot = '🐱⸽⃕❬ 𝒂 𝒍 𝒚 𝒂･𝒃 𝒐 𝒕 ❭ - 🧸🍁⃨፝⃕✰'
global.author = `⏱
╮┄┄┄┄┄┄┄┄┄┄┄┄╭
꯭✿꯭᪲୭𓍢ִ  𝙱𝚈 →  🐱⸽⃕❬ 𝒂 𝒍 𝒚 𝒂･𝒃 𝒐 𝒕 ❭ - 🧸🍁⃨፝⃕✰
╯┄┄┄┄┄┄┄┄┄┄┄┄╰`
  global.packsticker2 = `╮┄┄┄┄┄┄┄┄┄┄┄┄╭
𝙽𝚊𝚖𝚎 : 𝒂 𝒍 𝒚 𝒂･𝒃 𝒐 𝒕
⏱ ࣪𓏲ִ𝚃𝙷𝙴 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 ⊹₊˚𖥔⸼
𝙾𝚠𝚗𝚎𝚛 : 𝒉 𝒆 𝒎 𝒂ｼ
╯┄┄┄┄┄┄┄┄┄┄┄┄╰
⏱`
global.namebot = '🐱⸽⃕❬ 𝒂 𝒍 𝒚 𝒂･𝒃 𝒐 𝒕 ❭ - 🧸🍁⃨፝⃕✰'
global.author = `⏱
╮┄┄┄┄┄┄┄┄┄┄┄┄╭
꯭✿꯭᪲୭𓍢ִ  𝙱𝚈 →  🐱⸽⃕❬ 𝒂 𝒍 𝒚 𝒂･𝒃 𝒐 𝒕 ❭ - 🧸🍁⃨፝⃕✰
╯┄┄┄┄┄┄┄┄┄┄┄┄╰`
  
  global.fkontak = { 
    key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "🐱⸽⃕❬ 𝒂 𝒍 𝒚 𝒂･𝒃 𝒐 𝒕 ❭ - 🧸🍁⃨፝⃕✰" }, 
    "message": { 
      "contactMessage": { 
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      }
    }, 
    "participant": "0@s.whatsapp.net" 
  }
}

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
  let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
  let id = global.canalIdM[randomIndex]
  let name = global.canalNombreM[randomIndex]
  return { id, name }
}