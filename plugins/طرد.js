var handler = async (m, { conn, participants, usedPrefix, command }) => {
    if (!m.mentionedJid[0] && !m.quoted) {
        return conn.reply(m.chat, `*منشن الشخص  ԅ(¯ㅂ¯ԅ)*`, m);
    }

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;

    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

    if (user === conn.user.jid) {
        return conn.reply(m.chat, `🤖 لا يمكنني طرد نفسي من المجموعة.`, m);
    }

    if (user === ownerGroup) {
        return conn.reply(m.chat, `👑 لا يمكنني طرد مالك المجموعة.`, m);
    }

    if (user === ownerBot) {
        return conn.reply(m.chat, `🛡️ لا يمكنني طرد مالك البوت.`, m);
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
};

handler.help = ['طرد'];
handler.tags = ['مجموعة'];
handler.command = ['طرد', 'طير', 'انطر', 'كسمك', 'kick', 'برا', 'هش', 'مص'];
handler.admin = true;
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;