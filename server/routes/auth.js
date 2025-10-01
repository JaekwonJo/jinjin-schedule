const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { get, run } = require('../db');
const { PASSWORD_SALT_ROUNDS } = require('../config');
const { issueToken } = require('../middleware/auth');

const mapUser = (row) => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  isActive: Boolean(row.is_active)
});

router.post('/signup', async (req, res) => {
  const { username, password, displayName = '' } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해 주세요.' });
  }

  const trimmedUsername = String(username).trim();

  if (trimmedUsername.length < 3) {
    return res.status(400).json({ error: '아이디는 최소 3자 이상이어야 해요.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '비밀번호는 최소 6자 이상으로 설정해 주세요.' });
  }

  try {
    const existing = await get('SELECT id FROM users WHERE username = ?', [trimmedUsername]);
    if (existing) {
      return res.status(409).json({ error: '이미 사용 중인 아이디예요. 다른 아이디를 선택해 주세요.' });
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const now = new Date().toISOString();

    await run(
      `INSERT INTO users (username, display_name, role, password_hash, is_active, created_at, updated_at)
       VALUES (?, ?, 'teacher', ?, 0, ?, ?)` ,
      [trimmedUsername, displayName || '', passwordHash, now, now]
    );

    res.status(201).json({
      message: '가입 요청이 접수되었어요! 관리자가 승인하면 로그인할 수 있어요.'
    });
  } catch (error) {
    console.error('회원가입 실패', error);
    res.status(500).json({ error: '가입 처리 중 문제가 발생했어요.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해 주세요.' });
  }

  try {
    const user = await get(
      'SELECT id, username, display_name, role, password_hash, is_active FROM users WHERE username = ?',
      [username.trim()]
    );

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않아요.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: '계정이 비활성화되어 있습니다. 관리자에게 문의하세요.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않아요.' });
    }

    const token = issueToken(user);
    res.json({
      token,
      user: mapUser(user)
    });
  } catch (error) {
    console.error('로그인 실패', error);
    res.status(500).json({ error: '로그인 처리 중 문제가 발생했어요.' });
  }
});

module.exports = router;
