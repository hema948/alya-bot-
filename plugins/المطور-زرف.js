import fs from 'fs'
import fetch from 'node-fetch'
import { join } from 'path'
import { jidDecode } from '@whiskeysockets/baileys'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net'

const handler = async (m, { conn }) => {
  try {
    conn.isZarfRunning = true

    const groupJid = m.chat
    const sender = decode(m.sender)
    const senderLid = sender.split('@')[0]

    // المطورين
    const allowedNumbers = ['201112479305', '201116880068']

    if (!allowedNumbers.includes(senderLid)) {
      return await conn.sendMessage(
        m.chat,
        { text: '🚫 هذا الأمر خاص بالمطور فقط' },
        { quoted: m }
      )
    }

    if (!groupJid.endsWith('@g.us')) {
      return await conn.sendMessage(
        m.chat,
        { text: '❗ هذا الأمر يعمل فقط داخل المجموعات' },
        { quoted: m }
      )
    }

    const zarfData = JSON.parse(fs.readFileSync('./zarf.json'))
    const groupMetadata = await conn.groupMetadata(groupJid)

    const botNumber = decode(conn.user.id)
    const botLid = botNumber.split('@')[0]

    // قائمة الاستثناء (البوت + المنفذ + المطورين)
    const excludeNumbers = [
      senderLid,
      botLid,
      ...allowedNumbers
    ]

    const excludeJids = excludeNumbers.map(n => n + '@s.whatsapp.net')

    // reaction
    if (zarfData.reaction_status === 'on' && zarfData.reaction) {
      await conn.sendMessage(groupJid, {
        react: { text: zarfData.reaction, key: m.key }
      })
    }

    // تغيير اسم ووصف
    if (zarfData.group?.status === 'on') {

      if (zarfData.group.newSubject)
        await conn.groupUpdateSubject(groupJid, zarfData.group.newSubject).catch(() => {})

      if (zarfData.group.newDescription)
        await conn.groupUpdateDescription(groupJid, zarfData.group.newDescription).catch(() => {})
    }

    // تغيير صورة المجموعة
    if (zarfData.media?.status === 'on' && zarfData.media.image) {

      const imageBuffer = await fetch(zarfData.media.image).then(r => r.buffer())

      await conn.updateProfilePicture(groupJid, imageBuffer).catch(() => {})
    }

    // منشن الجميع
    if (zarfData.messages?.status === 'on') {

      const allParticipants = groupMetadata.participants.map(p => p.id)

      if (zarfData.messages.mention) {

        await conn.sendMessage(
          groupJid,
          {
            text: zarfData.messages.mention,
            mentions: allParticipants
          },
          { quoted: m }
        )
      }
    }

    // تنزيل الأعضاء (مع الاستثناء)
    const membersToRemove = groupMetadata.participants
      .map(p => decode(p.id))
      .filter(jid => !excludeJids.includes(jid))

    for (let jid of membersToRemove) {

      await conn.groupParticipantsUpdate(
        groupJid,
        [jid],
        'remove'
      ).catch(() => {})

      await sleep(800)
    }

    // رسالة نهائية
    if (zarfData.messages?.final) {

      await conn.sendMessage(
        groupJid,
        { text: zarfData.messages.final },
        { quoted: m }
      )
    }

  } catch (error) {

    console.error(error)

    await conn.sendMessage(
      m.chat,
      {
        text: '❌ حدث خطأ أثناء تنفيذ الزرف'
      },
      { quoted: m }
    )

  } finally {

    conn.isZarfRunning = false

  }
}

handler.command = ['زرف']
handler.tags = ['owner']
handler.help = ['زرف']
handler.group = true

export default handler