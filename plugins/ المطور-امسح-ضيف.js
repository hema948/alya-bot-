import fs from 'fs';

import { fileTypeFromBuffer } from 'file-type';

const handler = async (m, { text, usedPrefix, command }) => {

  

const allowed = ['201116880068@s.whatsapp.net', '201112479305@s.whatsapp.net',
  '201116880068@s.whatsapp.net'];

  if (!allowed.includes(m.sender)) {

    return m.reply('〘 🚫 〙 تحلم يا عبد صح !؟');

  }

  if (!text) throw `〘 ❗ 〙 يرجى إدخال اسم الملف`;

  const q = m.quoted || m;

  const mime = q.mimetype || '';

  const isTextMessage = q.text;

  const path = `plugins/${text}.js`;

  let isAdd = false;

  let isDel = false;

  let fileContent = '';

  switch (command) {

    case 'ضيف':

      if (!q || (!isTextMessage && !mime)) {

        throw `〘 ❗ 〙 يرجى الرد على رسالة نصية أو مستند ليتم حفظه كملف`;

      }

      if (fs.existsSync(path)) {

        const existing = fs.readFileSync(path, 'utf8').trim();

        if (existing.length > 0) {

          return m.reply('〘 ⚠️ 〙 في كود موجود بالفعل في الملف دا، ومش هينفع تكتب فوقه 🚫');

        }

      }

      try {

        if (isTextMessage) {

          fileContent = isTextMessage.trim();

          if (!fileContent) throw `〘 ❗ 〙 النص المستلم فارغ.`;

          fs.writeFileSync(path, fileContent, 'utf8');

          isAdd = true;

        } else if (mime === 'application/javascript') {

          const buffer = await q.download();

          fileContent = buffer.toString('utf8');

          if (!fileContent.trim()) throw `〘 ❗ 〙 الملف المرفق فارغ أو لا يحتوي على نصوص صالحة.`;

          fs.writeFileSync(path, fileContent, 'utf8');

          isAdd = true;

        } else {

          throw `〘 ❗ 〙 الملف المرفق غير مدعوم.`;

        }

      } catch (error) {

        throw `〘 ❗ 〙 حدث خطأ أثناء حفظ الملف: ${error.message || error}`;

      }

      break;

    case 'امسح':

      if (!fs.existsSync(path)) {

        throw `〘 ❗ 〙 الملف "${path}" غير موجود لحذفه`;

      }

      try {

        fs.unlinkSync(path);

        isDel = true;

      } catch (error) {

        throw `〘 ❗ 〙 حدث خطأ أثناء حذف الملف: ${error.message || error}`;

      }

      break;

    default:

      throw `〘 ❗ 〙 الأمر غير معروف

      استخدم أحد الأوامر التالية:

      - ${usedPrefix}ضيف

      - ${usedPrefix}امسح`;

  }

  if (isAdd) {

    m.reply(`〘 ✅ 〙 تم حفظ الملف بنجاح: "${path}"`);

  } else if (isDel) {

    m.reply(`〘 ✅ 〙 تم حذف الملف بنجاح: "${path}"`);

  }

};

handler.help = ['ضيف', 'امسح'];

handler.tags = ['owner'];

handler.command = ['ضيف', 'امسح'];

export default handler;