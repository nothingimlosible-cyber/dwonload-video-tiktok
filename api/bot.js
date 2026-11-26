const axios = require('axios');

const TG = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

// Peluang iklan muncul setelah video: 1 = selalu, 0.5 = sekitar tiap 2 download
const PELUANG_IKLAN = 1;

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
        text: '👋 Halo! Kirim link video TikTok ke sini, nanti aku unduhkan tanpa watermark.'
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

          // 2. Kirim video
          await axios.post(`${TG}/sendVideo`, {
            chat_id: chatId,
            video: videoUrl,
            caption: '✅ Video Berhasil Diunduh!\n\nJoin: https://dwonload-video-tiktok.vercel.app/'
          });

          // 3. Kirim iklan setelah video
          if (Math.random() < PELUANG_IKLAN) {
            await axios.post(`${TG}/sendMessage`, {
              chat_id: chatId,
              text: '🙏 Please support us! Tap the button and view the ad for a few seconds. It helps keep this website alive 👇',
              reply_markup: {
                inline_keyboard: [[
                  { text: '❤️ View Ad & Support Us', url: 'https://dwonload-video-tiktok.vercel.app/support.html' }
                ]]
              }
            });
          }
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
