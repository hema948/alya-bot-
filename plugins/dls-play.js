import fetch from "node-fetch"
import yts from "yt-search"
import Jimp from "jimp"
import axios from "axios"
import fs from "fs"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB
const AUDIO_DOC_THRESHOLD = 30 * 1024 * 1024 // 30 MB

async function resizeImage(buffer, size = 300) {
    try {
        const image = await Jimp.read(buffer)
        return await image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG)
    } catch {
        return buffer
    }
}

// =================== API SAVENOW/Y2DOWN CORRECTA ===================
const savenowApi = {
    name: "Savenow/Y2Down API",
    key: "dfcb6d76f2f6a9894gjkege8a4ab232222",
    agent: "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
    referer: "https://y2down.cc/enSB/",
    
    ytdl: async function(url, format) {
        try {
            const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${this.key}`;
            
            console.log(`📡 Starting download in format: ${format}`);
            
            const init = await fetch(initUrl, {
                headers: {
                    "User-Agent": this.agent,
                    "Referer": this.referer
                }
            });

            const data = await init.json();
            
            if (!data.success) {
                return { error: data.message || "Failed to start download" };
            }

            const id = data.id;
            const progressUrl = `https://p.savenow.to/api/progress?id=${id}`;
            let attempts = 0;
            const maxAttempts = 30;
            
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
                
                console.log(`⏳ Checking progress... (${attempts}/${maxAttempts})`);
                
                const response = await fetch(progressUrl, {
                    headers: {
                        "User-Agent": this.agent,
                        "Referer": this.referer
                    }
                });
                
                const status = await response.json();
                
                if (status.progress === 1000) {
                    console.log(`✅ Progress completed!`);
                    return {
                        title: data.title || data.info?.title,
                        image: data.info?.image,
                        video: data.info?.title,
                        link: status.download_url,
                        alternatives: status.alternative_download_urls || []
                    };
                }
                
                console.log(`📊 Current progress: ${status.progress / 10}%`);
            }

            return { error: "Timeout waiting for download" };
        } catch (error) {
            console.error("Error in ytdl:", error.message);
            return { error: error.message };
        }
    },
    
    download: async function(link, type = "audio") {
        try {
            const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!videoId) {
                return { status: false, error: "معرف الفيديو غير صالح🙂" };
            }
            
            const videoInfo = await yts({ videoId: videoId });
            
            let format, result;
            
            if (type === "audio") {
                format = "mp3";
                result = await this.ytdl(link, format);
                
                if (result.error) {
                    console.log(`❌ MP3 failed, attempting M4A...`);
                    result = await this.ytdl(link, "m4a");
                }
            } else {
                const videoFormats = ["720", "360", "480", "240", "144", "1080"];
                
                for (const format of videoFormats) {
                    console.log(`🎬 Attempting video in ${format}p...`);
                    result = await this.ytdl(link, format);
                    
                    if (!result.error) {
                        console.log(`✅ Video found on ${format}p`);
                        break;
                    }
                    
                    console.log(`❌ ${format}p not available`);
                }
            }
            
            if (result.error) {
                return { status: false, error: result.error };
            }
            
            return {
                status: true,
                result: {
                    title: result.title || videoInfo.title || "بدون عنوان",
                    author: videoInfo.author?.name || "غير معروف",
                    views: videoInfo.views || "0",
                    timestamp: videoInfo.timestamp || "0:00",
                    ago: videoInfo.ago || "غير معروف",
                    format: type === "audio" ? "mp3" : "mp4",
                    download: result.link,
                    thumbnail: result.image || videoInfo.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                }
            };
        } catch (error) {
            console.error("Savenow API Error:", error.message);
            return { status: false, error: error.message };
        }
    }
};

// =================== API AM SCRAPER ===================
const amScraperApi = {
    name: "AM Scraper API",
    baseUrl: "https://scrapers.hostrta.win/scraper/24",
    
    download: async (link, type = "audio") => {
        try {
            const videoId = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!videoId) {
                return { status: false, error: "معرف الفيديو غير صالح 🙂" };
            }
            
            const videoInfo = await yts({ videoId: videoId });
            
            const response = await axios.get(`${amScraperApi.baseUrl}?url=${encodeURIComponent(link)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://scrapers.hostrta.win/'
                },
                timeout: 15000
            });
            
            if (!response.data || response.data.error) {
                return { status: false, error: response.data?.error || "Error in AM Scraper" };
            }
            
            const data = response.data;
            let downloadUrl = null;
            let formatType = null;
            
            if (type === "audio") {
                if (data.audio && data.audio.url) {
                    downloadUrl = data.audio.url;
                    formatType = "mp3";
                } else if (data.formats) {
                    const audioFormat = data.formats.find(f => 
                        f.mimeType && (f.mimeType.includes('audio/mp4') || f.mimeType.includes('audio/mpeg'))
                    );
                    downloadUrl = audioFormat?.url;
                    formatType = "mp3";
                }
            } else {
                if (data.video && data.video.url) {
                    downloadUrl = data.video.url;
                    formatType = "mp4";
                } else if (data.formats) {
                    const qualityOrder = ["720", "480", "360", "240"];
                    
                    for (const quality of qualityOrder) {
                        const videoFormat = data.formats.find(f => 
                            f.quality === `${quality}p` || 
                            (f.mimeType && f.mimeType.includes('video/mp4') && f.qualityLabel === `${quality}p`)
                        );
                        
                        if (videoFormat) {
                            downloadUrl = videoFormat.url;
                            formatType = "mp4";
                            break;
                        }
                    }
                    
                    if (!downloadUrl) {
                        const anyVideo = data.formats.find(f => 
                            f.mimeType && f.mimeType.includes('video/mp4')
                        );
                        downloadUrl = anyVideo?.url;
                        formatType = "mp4";
                    }
                }
            }
            
            if (!downloadUrl) {
                return { status: false, error: "التنسيق غير متوفر 😔" };
            }
            
            return {
                status: true,
                result: {
                    title: videoInfo.title || data.title || "بدون عنوان",
                    author: videoInfo.author?.name || data.author || "غير معروف",
                    views: videoInfo.views || data.views || "0",
                    timestamp: videoInfo.timestamp || data.duration || "0:00",
                    ago: videoInfo.ago || data.uploadDate || "غير معروف",
                    format: formatType || (type === "audio" ? "mp3" : "mp4"),
                    download: downloadUrl,
                    thumbnail: videoInfo.thumbnail || 
                             data.thumbnail || 
                             `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                }
            };
        } catch (error) {
            console.error("AM Scraper API Error:", error.message);
            return { status: false, error: error.message };
        }
    }
};

// =================== API backup ===================
const backupApi = {
    name: "YouTube Downloader API",
    baseUrl: "https://youtube-downloader-api.vercel.app",
    
    download: async (link, type = "audio") => {
        try {
            const response = await axios.get(`${backupApi.baseUrl}/info?url=${encodeURIComponent(link)}`, {
                timeout: 10000
            });
            
            if (!response.data || !response.data.success) {
                return { status: false, error: "لا يمكنك الحصول على معلومات يا الفيد خاص يا في حاجه غلط" };
            }
            
            const videoInfo = response.data.data;
            let downloadUrl = null;
            
            if (type === "audio") {
                const audioFormats = videoInfo.formats.filter(f => 
                    f.mimeType && f.mimeType.includes('audio') && f.hasAudio
                );
                const bestAudio = audioFormats.sort((a, b) => b.bitrate - a.bitrate)[0];
                downloadUrl = bestAudio?.url;
            } else {
                const videoFormats = videoInfo.formats.filter(f => 
                    f.hasVideo && f.hasAudio && (f.qualityLabel === "720p" || f.qualityLabel === "480p")
                );
                const bestVideo = videoFormats[0] || 
                                 videoInfo.formats.find(f => f.hasVideo && f.hasAudio);
                downloadUrl = bestVideo?.url;
            }
            
            if (!downloadUrl) {
                return { status: false, error: "التنسيق غير متوفر" };
            }
            
            return {
                status: true,
                result: {
                    title: videoInfo.title || "بدون عنوان",
                    author: videoInfo.author?.name || "غير معروف",
                    views: videoInfo.viewCount || "0",
                    timestamp: videoInfo.lengthSeconds || 0,
                    ago: videoInfo.uploadDate || "غير معروف",
                    format: type === "audio" ? "mp3" : "mp4",
                    download: downloadUrl,
                    thumbnail: videoInfo.thumbnails?.[videoInfo.thumbnails.length - 1]?.url || 
                              `https://i.ytimg.com/vi/${videoInfo.videoId}/hqdefault.jpg`
                }
            };
        } catch (error) {
            console.error("Backup API Error:", error.message);
            return { status: false, error: error.message };
        }
    }
};

// Función principal de descarga con fallback
async function downloadWithFallback(url, type = 'audio') {
    console.log(`🔍 Trying to download: ${url}`);
    
    console.log(`🔄 Trying with Savenow API...`);
    let result = await savenowApi.download(url, type);
    if (result.status) {
        console.log(`✅ Successful download using Savenow API`);
        return result;
    }
    
    console.log(`❌ Savenow API failed: ${result.error}, trying AM Scraper...`);
    
    result = await amScraperApi.download(url, type);
    if (result.status) {
        console.log(`✅ Successful download using AM Scraper API`);
        return result;
    }
    
    console.log(`❌ AM Scraper failed: ${result.error}, attempting backup API...`);
    
    result = await backupApi.download(url, type);
    if (result.status) {
        console.log(`✅ Download successful with Backup API`);
        return result;
    }
    
    console.log(`❌ All APIs failed`);
    return {
        status: false,
        error: "لا يمكنك تنزيل المحتوى. جرب استخدام فيديو آخر أو جرب لاحقًا."
    };
}

function formatSize(bytes) {
    if (!bytes || isNaN(bytes)) return 'غير معروف';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    bytes = Number(bytes);
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

async function getSize(url) {
    try {
        const res = await axios.head(url, {
            timeout: 10000,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            }
        });
        return parseInt(res.headers['content-length'], 10) || 0;
    } catch {
        return 0;
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // If it's a direct download command
    if (['ytmp340', 'ytmp440', 'ytmpp3doc', 'ytmpp4doc'].includes(command)) {
        return await handleDownload(m, conn, text, command, usedPrefix);
    }

    // Main play command
    if (!text?.trim()) {
        return conn.reply(m.chat, `❗ أدخل اسم الأغنية أو الفيديو.\n\n📝 مثال: *${usedPrefix + command} The Stranglers Golden Brown*`, m);
    }

    await m.react('🔍');

    try {
        const search = await yts(text);
        const videoInfo = search.all?.[0];

        if (!videoInfo) {
            throw '❗ لم يتم العثور على نتائج.';
        }

        const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;
        const vistas = views?.toLocaleString?.() || 'غير معروف';

        const cleanTitle = title.substring(0, 100);
        const cleanAuthor = author.name.substring(0, 50);

        const body = `╭━━━━━━━━━━━━━╮
│ 🎵 *YouTube Play*
╰━━━━━━━━━━━━━╯

📹 *${cleanTitle}*

👤 القناة/الؤلف: ${cleanAuthor}
👁️ المشاهدات: ${vistas}
⏱️ المدة: ${timestamp}
📅 نُشر: ${ago}
🔗 الرابط: ${url}

*اختر خيارًا:*`;

        const buttons = [
            { buttonId: `${usedPrefix}ytmp340 ${url}`, buttonText: { displayText: '🎧 Audio' } },
            { buttonId: `${usedPrefix}ytmp440 ${url}`, buttonText: { displayText: '📽️ Video' } },
            { buttonId: `${usedPrefix}ytmpp3doc ${url}`, buttonText: { displayText: '💿 Audio Doc' } },
            { buttonId: `${usedPrefix}ytmpp4doc ${url}`, buttonText: { displayText: '🎥 Video Doc' } }
        ];
try {
            await conn.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption: body,
                footer: `ᥫ᭡⁩ 𝐵𝑌 𝑯 𝑬 𝑴 𝑨 𝐵𝛩𝑇`,
                buttons: buttons,
                viewOnce: true,
                headerType: 4
            }, { quoted: m });
        } catch (e1) {
            try {
                await conn.sendButton(m.chat, body, `ᥫ᭡⁩ 𝐵𝑌 𝑯 𝑬 𝑴 𝑨 𝐵𝛩𝑇`, thumbnail, buttons, m);
            } catch (e2) {
                try {
                    await conn.sendFile(m.chat, thumbnail, 'thumbnail.jpg', body + `\n\n*الأوامر المتاحة:*\n• ${usedPrefix}ytmp340 ${url}\n• ${usedPrefix}ytmp440 ${url}\n• ${usedPrefix}ytmpp3doc ${url}\n• ${usedPrefix}ytmpp4doc ${url}`, m);
                } catch (e3) {
                    await conn.reply(m.chat, body + `\n\n*استخدم هذه الأوامر:*\n• ${usedPrefix}ytmp340 ${url}\n• ${usedPrefix}ytmp440 ${url}\n• ${usedPrefix}ytmpp3doc ${url}\n• ${usedPrefix}ytmpp4doc ${url}`, m);
                }
            }
        }

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        return conn.reply(m.chat, typeof e === 'string' ? e : `⚠️ Error: ${e.message}`, m);
    }
};

async function handleDownload(m, conn, text, command, usedPrefix) {
    if (!text?.trim()) {
        return conn.reply(m.chat, `❌ أدخل عنوان URL أو اسمًا.\n\n📝 مثال: *${usedPrefix + command} Golden Brown*`, m);
    }

    await m.react('⏳');

    try {
        let url, title, thumbnail, author;

        // If it's a direct URL
        if (/youtube.com|youtu.be/.test(text)) {
            const id = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!id) throw '❌ عنوان URL غير صالح';

            const search = await yts({ videoId: id });
            url = `https://www.youtube.com/watch?v=${id}`;
            title = search.title || "بدون عنوان";
            thumbnail = search.thumbnail;
            author = search.author?.name || "غير معروف";

        } else {
            // If it's a search
            const search = await yts(text);
            if (!search.videos.length) throw "❌ لم يتم العثور على نتائج";

            const videoInfo = search.videos[0];
            url = videoInfo.url;
            title = videoInfo.title;
            thumbnail = videoInfo.thumbnail;
            author = videoInfo.author?.name || "غير معروف";
        }

        console.log(`🎯 Downloading: ${title}`);

        const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300);

        // ========== ytmp340 - ALWAYS SEND AS PLAYABLE AUDIO ==========
        if (command === 'ytmp340') {
            await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮
│ ⏳ *تنزيل...*
╰━━━━━━━━━━━━━╯

🎵 *${title}*

⚡ _معالجة الصوت..._
⌛ _انتظر لحظة..._

*ᥫ᭡⁩ 𝐵𝑌 𝑯 𝑬 𝑴 𝑨 𝐵𝛩𝑇*`, m);

            const dl = await downloadWithFallback(url, 'audio');
            if (!dl.status) throw dl.error || '❌ خطأ في التنزيل';

            const size = await getSize(dl.result.download);
            console.log(`📦 Size: ${formatSize(size)}`);

            const fkontak = {
                key: { fromMe: false, participant: "0@s.whatsapp.net" },
                message: {
                    documentMessage: {
                        title: `🎵「 ${title} 」⚡`,
                        fileName: `◜𝐄𝐑𝐄𝐍┊👤┊𝐁𝐎𝐓◞`,
                        jpegThumbnail: thumbResized
                    }
                }
            };

            // NEW STRATEGY: Always send as NORMAL AUDIO (not PTT, not document)
            // This ensures that it can be reproduced directly in WhatsApp.
            await conn.sendMessage(m.chat, {
                audio: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                // Do NOT use ptt: true
                // This causes it to be sent as a playable audio message.
            }, { quoted: fkontak });

            console.log('✅ Audio sent as a playable message');

            await m.react('✅');
            return;
        }

        // ========== ytmp440 - Video ==========
        if (command === 'ytmp440') {
            await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮
│ ⏳ *تنزيل...*
╰━━━━━━━━━━━━━╯

📹 *${title}*

⚡ _معالجة الفيديو..._
🎬 _قد يستغرق الأمر بعض الدقائق..._

*ᥫ᭡⁩ 𝐵𝑌 𝑯 𝑬 𝑴 𝑨 𝐵𝛩𝑇*`, m);

            const dl = await downloadWithFallback(url, 'video');
            if (!dl.status) throw dl.error || '❌ خطأ في التنزيل';

            const size = await getSize(dl.result.download);
            console.log(`📦 Size: ${formatSize(size)}`);

            const fkontak = {
                key: { fromMe: false, participant: "0@s.whatsapp.net" },
                message: {
                    documentMessage: {
                        title: `🎬「 ${title} 」⚡`,
                        fileName: `◜𝐄𝐑𝐄𝐍┊👤┊𝐁𝐎𝐓◞`,
                        jpegThumbnail: thumbResized
                    }
                }
            };

            if (size > 200 * 1024 * 1024) {
                throw `📦 فيديو كبير جدًا (${formatSize(size)}).\n\n💡 استخدم: *${usedPrefix}ytmpp4doc ${url}*`;
            }

            await conn.sendMessage(m.chat, {
                video: { url: dl.result.download },
                mimetype: 'video/mp4',
                caption: `🎬 *${title}*`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak });

            await m.react('✅');
            return;
        }

        // ========== ytmpp3doc - Audio as a document ==========
        if (command === 'ytmpp3doc') {
            await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮
│ 💿 *جارٍ التنزيل...*
╰━━━━━━━━━━━━━╯

🎵 *${title}*

📄 _التنسيق: ملف صوتي MP3_
⚡ _معالجة الصوت..._
⏳ _انتظر لحظة..._

*ᥫ᭡⁩ 𝐵𝑌 𝑯 𝑬 𝑴 𝑨 𝐵𝛩𝑇*`, m);

            const dl = await downloadWithFallback(url, 'audio');
            if (!dl.status) throw dl.error || '❌ خطأ في التنزيل';

            const size = await getSize(dl.result.download);

            const fkontak = {
                key: { fromMe: false, participant: "0@s.whatsapp.net" },
                message: {
                    documentMessage: {
                        title: `👑「 ${title} 」📿`,
                        fileName: `◜𝐄𝐑𝐄𝐍┊👤┊𝐁𝐎𝐓◞`,
                        jpegThumbnail: thumbResized
                    }
                }
            };

            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                caption: `${title}`,
                jpegThumbnail: thumbResized
            }, { quoted: fkontak });

            await m.react('✅');
            return;
        }

        // ========== ytmpp4doc - Video as a document ==========
        if (command === 'ytmpp4doc') {
            await conn.reply(m.chat, `╭━━━━━━━━━━━━━╮
│ 🎥 *جارٍ التنزيل...*
╰━━━━━━━━━━━━━╯

📹 *${title}*

📄 _التنسيق: مستند MP4_
⚡ _معالجة الفيديو..._
⏳ _يمكن للملفات الكبيرة أن تتأخر..._

*ᥫ᭡⁩ 𝐵𝑌 𝑯 𝑬 𝑴 𝑨 𝐵𝛩𝑇*`, m);

            const dl = await downloadWithFallback(url, 'video');
            if (!dl.status) throw dl.error || '❌ خطأ في التنزيل';

            const size = await getSize(dl.result.download);

            if (size > 600 * 1024 * 1024) {
                throw `📦 فيديو كبير جدًا (${formatSize(size)}).\n\n⚠️ حجم الملف يتجاوز 600 ميجابايت، لا أستطيع إرساله.`;
            }

            const fkontak = {
                key: { fromMe: false, participant: "0@s.whatsapp.net" },
                message: {
                    documentMessage: {
                        title: `🎬「 ${title} 」⚡`,
                        fileName: `◜𝐄𝐑𝐄𝐍┊👤┊𝐁𝐎𝐓◞`,
                        jpegThumbnail: thumbResized
                    }
                }
            };

            await conn.sendMessage(m.chat, {
                document: { url: dl.result.download },
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`,
                jpegThumbnail: thumbResized,
                caption: `🎬 *${title}*`
            }, { quoted: fkontak });

            await m.react('✅');
            return;
        }

    } catch (e) {
        await m.react('❌');
        console.error('❌ Error:', e);
        return conn.reply(m.chat, typeof e === 'string' ? e : `❌ Error: ${e.message}`, m);
    }
}

handler.help = ['شغل <نص البحث>'];
handler.tags = ['download'];
handler.command = ['play', 'ytmp340', 'ytmp440', 'ytmpp3doc', 'ytmpp4doc','شغل'];
handler.register = false;
handler.group = true;

export default handler;