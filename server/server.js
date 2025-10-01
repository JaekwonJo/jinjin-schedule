const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 기본 라우트
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '진진영어 시간표 서버가 실행 중입니다!',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 진진영어 시간표 서버가 포트 ${PORT}에서 실행 중입니다!`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
