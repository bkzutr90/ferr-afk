const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const cfg = require('./config');

fs.mkdirSync(cfg.dataDir, { recursive: true });
const dbPath = path.join(cfg.dataDir, 'bot.db');
const isNewDb = !fs.existsSync(dbPath);
const db = new Database(dbPath);
console.log(`[db] ${dbPath} (${isNewDb ? 'database BARU' : 'database lama dipakai'})`);
if (isNewDb && process.env.RAILWAY_ENVIRONMENT && !process.env.DATA_DIR) {
  console.warn('[db] PERINGATAN: DATA_DIR belum diisi di Railway. Pengaturan AFK akan hilang tiap redeploy. Pasang Volume di /data dan set DATA_DIR=/data.');
}
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS afk_channels (
    guild_id   TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id       TEXT PRIMARY KEY,
    log_channel_id TEXT
  );
`);

module.exports = { db };
