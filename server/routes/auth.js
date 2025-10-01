const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { get } = require('../db');
const { issueToken } = require('../middleware/auth');

const mapUser = (row) => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  isActive: Boolean(row.is_active)
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
