export async function before(m, { conn, isOwner, isROwner }) {

    // تجاهل رسائل البوت
    if (m.isBaileys && m.fromMe) return !0;

    // فقط الخاص
    if (m.isGroup) return !1;

    // تأكد من وجود الإعدادات
    const bot = global.db.data.settings[conn.user.jid] || (global.db.data.settings[conn.user.jid] = {})

    // إذا غير مفعل → لا يسوي شي
    if (!bot.antiPrivate) return !1;

    // السماح للمطور فقط
    if (isOwner || isROwner) return !1;

    // 🚫 حظر مباشر بدون رد
    await conn.updateBlockStatus(m.chat, 'block');

    return !0;
}