const crypto = require("crypto");
const axios = require("axios");

function verify(initData, token) {
  const p = new URLSearchParams(initData);
  const hash = p.get("hash");
  if (!hash) return null;
  p.delete("hash");
  const str = [...p.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const calc = crypto.createHmac("sha256", secret).update(str).digest("hex");
  return calc === hash ? JSON.parse(p.get("user")) : null;
}

module.exports = async (req, res) => {
  // CORS: supaya bisa dipanggil dari domain lain (misal GitHub Pages)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const token = process.env.BOT_TOKEN;
  const user = verify((req.body && req.body.initData) || "", token);
  if (!user) return res.status(401).json({ ok: false });

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: user.id,
      text: "🔥 Promo hari ini! Cek sebelum kehabisan 👇",
      reply_markup: {
        inline_keyboard: [[{ text: "🛒 Lihat Promo", url: "https://linkmu.com" }]],
      },
    });
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false });
  }
};
