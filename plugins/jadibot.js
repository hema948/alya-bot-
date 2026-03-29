import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from "fs";
const fs = { ...fsPromises, existsSync };
import path, { join } from 'path';
import ws from 'ws';

let handler = async (m, { conn: _envio, command, usedPrefix, args, text, isOwner }) => {
  const isCommand1 = /^(deletesesion|deletebot|deletesession)$/i.test(command);
  const isCommand2 = /^(stop|pausarai|pausarbot)$/i.test(command);
  const isCommand3 = /^(bots|sockets|socket)$/i.test(command);

  async function reportError(e) {
    await m.reply(`(｡•́︿•̀｡) حدث خطأ غير متوقع.`);
    console.log(e);
  }

  switch (true) {

    // 🗑️ حذف الجلسة
    case isCommand1: {
      let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
      let uniqid = `${who.split`@`[0]}`;
      const dir = `./${jadi}/${uniqid}`;

      if (!fs.existsSync(dir)) {
        await _envio.sendMessage(m.chat, {
          text: `(⁎˃ᆺ˂) لا توجد لديك جلسة.\n\nأنشئ واحدة عبر:\n*${usedPrefix + command}*\n\nأو استخدم ID:\n*${usedPrefix + command}* (ID)`,
        }, { quoted: m });
        return;
      }

      if (global.conn.user.jid !== conn.user.jid) {
        return _envio.sendMessage(m.chat, {
          text: `⚠️ هذا الأمر يستخدم فقط من *البوت الرئيسي*.\n\nتواصل: https://wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix + command}`,
        }, { quoted: m });
      }

      await _envio.sendMessage(m.chat, {
        text: `☁️ جاري حذف جلستك كبوت فرعي...`,
      }, { quoted: m });

      try {
        fs.rmSync(dir, { recursive: true, force: true });
        await _envio.sendMessage(m.chat, {
          text: `✔️ تم حذف الجلسة بنجاح.`,
        }, { quoted: m });
      } catch (e) {
        reportError(e);
      }
      break;
    }

    // ⏸️ إيقاف البوت
    case isCommand2: {
      if (global.conn.user.jid == conn.user.jid) {
        await _envio.reply(m.chat, `⚠️ هذا الأمر خاص بالبوتات الفرعية فقط.\n\nتواصل مع البوت الرئيسي.`, m);
      } else {
        await _envio.reply(m.chat, `✦ تم *إيقاف البوت مؤقتاً*.`, m);
        _envio.ws.close();
      }
      break;
    }

    // 🤖 قائمة البوتات
    case isCommand3: {
      const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws && conn.ws.readyState !== ws.CLOSED)])];

      function convertirMs(ms) {
        let segundos = Math.floor(ms / 1000) % 60;
        let minutos = Math.floor(ms / 60000) % 60;
        let horas = Math.floor(ms / 3600000) % 24;
        let dias = Math.floor(ms / 86400000);
        return [
          dias ? `${dias} يوم` : '',
          horas ? `${horas} ساعة` : '',
          minutos ? `${minutos} دقيقة` : '',
          segundos ? `${segundos} ثانية` : ''
        ].filter(Boolean).join('، ');
      }

      const message = users.map((v, index) =>
        `✧･ﾟ「 ${index + 1} 」･ﾟ✧
📎 https://wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado
*👤 المستخدم:* ${v.user.name || 'بوت فرعي'}
*⏱️ متصل منذ:* ${v.uptime ? convertirMs(Date.now() - v.uptime) : 'غير معروف'}`
      ).join('\n\n｡･:*:･ﾟ★,｡･:*:･ﾟ☆\n\n');

      const replyMessage = message.length === 0
        ? `(｡•́︿•̀｡) لا يوجد بوتات فرعية حالياً.` 
        : message;

      const totalUsers = users.length;

      const responseMessage =
`*╭─ ⋞⟡⋟───❀──⋞⟡⋟─╮*
   ୨୧ قائمة البوتات الفرعية
*╰─ ⋞⟡⋟───────────╯*

╭⊹˚₊✦ يمكنك طلب إضافة أحدهم إلى مجموعتك.

┈┈┈┈┈┈┈┈┈┈┈┈
*「 تنبيه 」*
كل بوت فرعي مستقل بذاته.
البوت الرئيسي غير مسؤول عن استخدامهم.

*✦ عدد البوتات:* ${totalUsers || '0'}
┈┈┈┈┈┈┈┈┈┈┈┈

${replyMessage}

╰─⌗ 𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡 ⌗─╯`;

      await _envio.sendMessage(m.chat, {
        text: responseMessage,
        mentions: _envio.parseMention(responseMessage)
      }, { quoted: m });
      break;
    }
  }
};

handler.tags = ['سيربوت'];
handler.help = ['بوتات', 'حذف-جلسة', 'ايقاف'];
handler.command = [
  'deletesesion', 'deletebot', 'deletesession',
  'stop', 'pausarai', 'pausarbot',
  'bots', 'sockets', 'socket',
  'حذف-جلسة', 'ايقاف', 'بوتات'
];

export default handler;