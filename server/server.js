const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize database and ensure tables are ready.
require('./db');

const templateRoutes = require('./routes/templates');
const changeRequestRoutes = require('./routes/changeRequests');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 라우트
app.use('/api/templates', templateRoutes);
app.use('/api/change-requests', changeRequestRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '진진영어 시간표 서버가 실행 중입니다!',
    timestamp: new Date().toISOString()
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: '요청한 경로를 찾을 수 없어요.' });
});

// 에러 핸들러
app.use((err, req, res, _next) => {
  console.error('서버 에러', err);
  res.status(500).json({ error: '서버에서 문제가 발생했어요.' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 진진영어 시간표 서버가 포트 ${PORT}에서 실행 중입니다!`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
