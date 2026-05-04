const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;

      // Cek apakah pesan berisi link TikTok/IG/FB
      if (text.includes('tiktok.com') || text.includes('instagram.com')) {
        try {
          // 1. Ambil data dari API TikWM
          const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`);
          const data = response.data.data;

          if (data) {
            const videoUrl = data.play || data.url;
            const caption = "✅ Video Berhasil Diunduh!\n\nJoin: @ChannelKamu";

            // 2. Kirim video sebagai FILE (langsung mengunduh di chat)
            await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendVideo`, {
              chat_id: chatId,
              video: videoUrl,
              caption: caption
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
    res.status(200).send('ok');
  } else {
    res.status(200).send('Gunakan POST');
  }
};
