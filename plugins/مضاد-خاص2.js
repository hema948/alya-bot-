let handler = async (m, { conn, command, isOwner, isROwner }) => {

    const bot = global.db.data.settings[conn.user.jid] || (global.db.data.settings[conn.user.jid] = {})

    if (!isOwner && !isROwner) return m.reply('❌ هذا الأمر للمطور فقط')

    if (command === 'تفعيل-مضاد-خاص') {
        bot.antiPrivate = true
        return m.reply('✅ تم تفعيل مضاد الخاص')
    }

    if (command === 'تعطيل-مضاد-خاص') {
        bot.antiPrivate = false
        return m.reply('❌ تم تعطيل مضاد الخاص')
    }
}

handler.command = ['تفعيل-مضاد-خاص', 'تعطيل-مضاد-خاص']
handler.owner = true

export default handler