const axios = require('axios');

const TG = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

// Alamat Mini App dan halaman iklan
const APP_URL = 'https://dwonload-video-tiktok.vercel.app/';
const SUPPORT_URL = 'https://dwonload-video-tiktok.vercel.app/support.html';

// Tombol di bawah pesan (Mini App + iklan)
const TOMBOL = {
  inline_keyboard: [
    [{ text: '📲 Open App', web_app: { url: APP_URL } }],
    [{ text: '❤️ View Ad & Support Us', url: SUPPORT_URL }]
  ]
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Gunakan POST');
  }

  const { message } = req.body || {};

  if (message && message.text) {
    const chatId = message.chat.id;
    const text = message.text;

    // Sambutan saat pengguna tekan Start
    if (text.startsWith('/start')) {
      await axios.post(`${TG}/sendMessage`, {
        chat_id: chatId,
        text: '👋 Halo! Kirim link video TikTok ke sini, nanti aku unduhkan tanpa watermark.\n\nAtau buka aplikasinya lewat tombol di bawah 👇',
        reply_markup: { inline_keyboard: [[{ text: '📲 Open App', web_app: { url: APP_URL } }]] }
      }).catch(() => {});
      return res.status(200).send('ok');
    }

    if (text.includes('tiktok.com') || text.includes('instagram.com')) {
      try {
        // 1. Ambil data dari API TikWM
        const response = await axios.get(
          `https://www.tikwm.com/api/?url=${encodeURIComponent(text.trim())}`
        );
        const data = response.data.data;

        if (data) {
          const videoUrl = data.play || data.url;

          // 2. Kirim video + tombol dalam satu pesan
          await axios.post(`${TG}/sendVideo`, {
            chat_id: chatId,
            video: videoUrl,
            caption: '✅ Video Berhasil Diunduh!\n\n🙏 Bantu kami tetap aktif, tekan tombol di bawah.',
            reply_markup: TOMBOL
          });
        } else {
          await axios.post(`${TG}/sendMessage`, {
            chat_id: chatId,
            text: '❌ Video tidak ditemukan. Pastikan link-nya benar.'
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  res.status(200).send('ok');
};
