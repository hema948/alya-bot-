let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const groupMetadataCache = new Map()
const lidCache = new Map()
const handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return
const primaryBot = global.db.data.chats[m.chat].primaryBot
if (primaryBot && conn.user.jid !== primaryBot) throw !1
const chat = global.db.data.chats[m.chat]
const users = m.messageStubParameters[0]
const usuario = await resolveLidToRealJid(m?.sender, conn, m?.chat)
const groupAdmins = participants.filter(p => p.admin)
const rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '', newsletterName: channelRD.name }, externalAdReply: { title: "◜𝐀 𝐋 𝐘 𝐀┊🌿┊𝐂𝐇𝐀𝐍𝐍𝐄𝐋◞", body: textbot, mediaUrl: null, description: null, previewType: "PHOTO", thumbnail: await (await fetch(icono)).buffer(), sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false }, mentionedJid: null }}
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/ipr7qr.jpg'
const nombre = `> ❀ @${usuario.split('@')[0]} لقد غير اسم المجموعة.\n> ✦ تُسمى المجموعة الآن:\n> *${m.messageStubParameters[0]}*.`
const foto = `> ❀ تم تغيير صورة المجموعة.\n> ✦ الإجراءات المتخذة من قبل:\n> » @${usuario.split('@')[0]}`
const edit = `> ❀ @${usuario.split('@')[0]} سمح بأن ${m.messageStubParameters[0] == 'on' ? 'الادمنز فقط' : 'الجميع'} يمكنهم تعديل إعدادات الجروب.`
const newlink = `> ❀ تم إعادة ضبط رابط الجروب.\n> ✦ تم الإجراء بواسطة:\n> » @${usuario.split('@')[0]}`
const descripcion = `> ❀ @${usuario.split('@')[0]} لقد تم تغيير وصف المجموعة.\n> ✦ الوصف الجديد:\n> *${m.messageStubParameters[0]}*`
const status = `> ❀ الجروب ${m.messageStubParameters[0] == 'on' ? '*مقفول*' : '*مفتوح*'} بواسطة @${usuario.split('@')[0]}\n> ✦ دلوقتي ${m.messageStubParameters[0] == 'on' ? '*الادمنز فقط*' : '*الجميع*'} يقدروا يبعتوا رسائل.`
const admingp = `> ❀ @${users.split('@')[0]} دلوقتي أصبح أدمن في الجروب.\n> ✦ تم الإجراء بواسطة:\n> » @${usuario.split('@')[0]}`
const noadmingp = `> ❀ @${users.split('@')[0]} دلوقتي مبقاش أدمن في الجروب.\n> ✦ تم الإجراء بواسطة:\n> » @${usuario.split('@')[0]}`
if (chat.detect && m.messageStubType == 2) {
const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
const sessionPath = `./${sessions}/`
for (const file of await fs.promises.readdir(sessionPath)) {
if (file.includes(uniqid)) {
await fs.promises.unlink(path.join(sessionPath, file))
console.log(`${chalk.yellow.bold('✎ تم الحذف!')} ${chalk.greenBright(`'${file}'`)}\n${chalk.redBright('ما سبب ظهور "undefined" في الشات.')}`)
}}} if (chat.detect && m.messageStubType == 21) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { text: nombre, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 22) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { image: { url: pp }, caption: foto, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 23) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { text: newlink, ...rcanal }, { quoted: null })
}
if (chat.detect && m.messageStubType == 24) {
    rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
    await this.sendMessage(m.chat, { text: descripcion, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 25) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { text: edit, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 26) {
rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
await this.sendMessage(m.chat, { text: status, ...rcanal }, { quoted: null })
} if (chat.detect && m.messageStubType == 29) {
rcanal.contextInfo.mentionedJid = [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean)
await this.sendMessage(m.chat, { text: admingp, ...rcanal }, { quoted: null })
return
} if (chat.detect && m.messageStubType == 30) {
rcanal.contextInfo.mentionedJid = [usuario, users, ...groupAdmins.map(v => v.id)].filter(Boolean)
await this.sendMessage(m.chat, { text: noadmingp, ...rcanal }, { quoted: null })
} else { 
if (m.messageStubType == 2) return
console.log({messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType], 
})}}

export default handler

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
const inputJid = lid.toString()
if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) { return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net` }
if (lidCache.has(inputJid)) { return lidCache.get(inputJid) }
const lidToFind = inputJid.split("@")[0]
let attempts = 0
while (attempts < maxRetries) {
try {
const metadata = await conn?.groupMetadata(groupChatId)
if (!metadata?.participants) { throw new Error("لم يتم الحصول على أي مشاركين") }
for (const participant of metadata.participants) {
try {
if (!participant?.jid) continue
const contactDetails = await conn?.onWhatsApp(participant.jid)
if (!contactDetails?.[0]?.lid) continue
const possibleLid = contactDetails[0].lid.split("@")[0]
if (possibleLid === lidToFind) {
lidCache.set(inputJid, participant.jid)
return participant.jid
}} catch (e) { continue }}
lidCache.set(inputJid, inputJid)
return inputJid
} catch (e) {
if (++attempts >= maxRetries) {
lidCache.set(inputJid, inputJid)
return inputJid
}
await new Promise((resolve) => setTimeout(resolve, retryDelay))
}}
return inputJid
}