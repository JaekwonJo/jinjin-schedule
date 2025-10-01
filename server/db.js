const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const {
  PASSWORD_SALT_ROUNDS,
  SUPERADMIN_USERNAME,
  SUPERADMIN_PASSWORD,
  SUPERADMIN_DISPLAY_NAME
} = require('./config');

const dataDir = path.resolve(__dirname, 'data');
const dbPath = path.join(dataDir, 'jinjin-schedule.sqlite');

// Ensure the data directory exists so SQLite can create the file.
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      time_label TEXT NOT NULL,
      teacher_name TEXT DEFAULT '',
      student_names TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_schedule_entry_unique
    ON schedule_entries (template_id, day_of_week, time_label, teacher_name)
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS change_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      time_label TEXT NOT NULL,
      requested_by TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      decided_at TEXT,
      decided_by TEXT,
      acknowledged_by TEXT,
      acknowledged_at TEXT,
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    )
  `);

  db.run(`ALTER TABLE change_requests ADD COLUMN acknowledged_by TEXT`, (err) => {
    if (err && !String(err.message).includes('duplicate column name')) {
      console.warn('change_requests.acknowledged_by 추가 실패', err.message);
    }
  });

  db.run(`ALTER TABLE change_requests ADD COLUMN acknowledged_at TEXT`, (err) => {
    if (err && !String(err.message).includes('duplicate column name')) {
      console.warn('change_requests.acknowledged_at 추가 실패', err.message);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT DEFAULT '',
      role TEXT NOT NULL CHECK (role IN ('teacher', 'manager', 'superadmin')),
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  seedSuperAdmin();
});

function seedSuperAdmin() {
  const hashed = bcrypt.hashSync(SUPERADMIN_PASSWORD, PASSWORD_SALT_ROUNDS);

  db.run(
    `INSERT INTO users (username, display_name, role, password_hash)
     SELECT ?, ?, 'superadmin', ?
     WHERE NOT EXISTS (
       SELECT 1 FROM users WHERE username = ?
     )`,
    [SUPERADMIN_USERNAME, SUPERADMIN_DISPLAY_NAME, hashed, SUPERADMIN_USERNAME],
    (err) => {
      if (err) {
        console.error('슈퍼 관리자 생성에 실패했어요.', err);
      }
    }
  );
}

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(err) {
    if (err) return reject(err);
    resolve({ id: this.lastID, changes: this.changes });
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

module.exports = {
  db,
  run,
  get,
  all
};
