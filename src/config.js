require('dotenv').config();
const path = require('path');

module.exports = {
  token: process.env.DISCORD_TOKEN,
  // Kosong = command didaftarkan global (semua server). Isi hanya untuk testing di 1 server (muncul instan).
  guildId: process.env.GUILD_ID || null,
  dataDir: process.env.DATA_DIR || path.join(__dirname, '..', 'data'),
};
