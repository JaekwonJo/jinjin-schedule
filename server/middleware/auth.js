const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const TOKEN_TTL = '24h';

function issueToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      displayName: user.display_name || user.displayName || ''
    },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      displayName: payload.displayName
    };
    next();
  } catch (error) {
    console.error('토큰 검증 실패', error);
    return res.status(401).json({ error: '세션이 만료되었어요. 다시 로그인해 주세요.' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: '접근 권한이 없어요.' });
    }

    next();
  };
}

module.exports = {
  issueToken,
  authenticate,
  requireRole
};
