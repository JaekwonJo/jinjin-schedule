const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { all, get, run } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');
const { PASSWORD_SALT_ROUNDS } = require('../config');

const mapUser = (row) => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const ALLOWED_ROLES = ['teacher', 'manager', 'superadmin'];

router.use(authenticate, requireRole('superadmin'));

router.get('/', async (_req, res) => {
  try {
    const rows = await all(
      `SELECT id, username, display_name, role, is_active, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ users: rows.map(mapUser) });
  } catch (error) {
    console.error('계정 목록 조회 실패', error);
    res.status(500).json({ error: '계정 목록을 불러오지 못했어요.' });
  }
});

router.post('/', async (req, res) => {
  const { username, password, displayName = '', role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: '아이디, 비밀번호, 역할을 모두 입력해 주세요.' });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: '올바르지 않은 역할입니다.' });
  }

  try {
    const existing = await get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(409).json({ error: '이미 사용 중인 아이디예요.' });
    }

    const hash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const now = new Date().toISOString();

    const result = await run(
      `INSERT INTO users (username, display_name, role, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)` ,
      [username, displayName, role, hash, now, now]
    );

    const user = await get(
      'SELECT id, username, display_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [result.id]
    );

    res.status(201).json({ user: mapUser(user) });
  } catch (error) {
    console.error('계정 생성 실패', error);
    res.status(500).json({ error: '계정을 만들지 못했어요.' });
  }
});

router.patch('/:id/password', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: '새 비밀번호를 입력해 주세요.' });
  }

  try {
    const user = await get('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: '계정을 찾지 못했어요.' });
    }

    const hash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const now = new Date().toISOString();

    await run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [hash, now, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('비밀번호 초기화 실패', error);
    res.status(500).json({ error: '비밀번호를 변경하지 못했어요.' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { isActive, role } = req.body;

  if (typeof isActive !== 'boolean' && !role) {
    return res.status(400).json({ error: 'isActive 또는 role 중 하나는 반드시 포함되어야 해요.' });
  }

  if (role && !ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ error: '올바르지 않은 역할입니다.' });
  }

  try {
    const user = await get('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: '계정을 찾지 못했어요.' });
    }

    if (user.role === 'superadmin' && (role && role !== 'superadmin')) {
      return res.status(400).json({ error: '최고 관리자의 역할은 변경할 수 없어요.' });
    }

    const fields = [];
    const params = [];

    if (typeof isActive === 'boolean') {
      fields.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }

    if (role) {
      fields.push('role = ?');
      params.push(role);
    }

    const now = new Date().toISOString();
    fields.push('updated_at = ?');
    params.push(now, id);

    await run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const updated = await get(
      'SELECT id, username, display_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({ user: mapUser(updated) });
  } catch (error) {
    console.error('계정 상태 변경 실패', error);
    res.status(500).json({ error: '계정 상태를 변경하지 못했어요.' });
  }
});

module.exports = router;
