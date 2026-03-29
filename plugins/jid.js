let handler = async (m, { conn }) => {
  let chatJid = m.chat;

  let message = `
┏━━━━━━━[ 🥀 ⃝𝑎 𝑙 𝑦 𝑎 - 𝑏 𝑜 𝑡⃝🍒 ]━━━━━━━┓

${chatJid}

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  `.trim();

  await conn.reply(m.chat, message, m);
}

handler.help = ['jid']
handler.tags = ['tools']
handler.command = /^jid$/i
handler.group = false

export default handler