const express = require('express');
const router = express.Router();

const { authenticate, requireRole } = require('../middleware/auth');
const { sendDecisionNotification, isEmailConfigured } = require('../services/notifier');
const { get } = require('../db');

router.post('/test', authenticate, requireRole('manager', 'superadmin'), async (req, res) => {
  if (!isEmailConfigured()) {
    return res.status(400).json({ error: 'SMTP 환경 변수가 설정되지 않았어요. .env를 확인해 주세요.' });
  }

  const {
    templateId,
    templateName = '테스트 템플릿',
    dayLabel = '월요일',
    timeLabel = '오전 10:00',
    requestedBy = req.user.displayName || req.user.username || '테스트 계정',
    decidedBy = req.user.displayName || req.user.username || '관리자'
  } = req.body || {};

  try {
    let finalTemplateName = templateName;
    if (templateId) {
      const tpl = await get('SELECT name FROM templates WHERE id = ?', [templateId]);
      if (tpl?.name) finalTemplateName = tpl.name;
    }

    await sendDecisionNotification({
      templateName: finalTemplateName,
      dayLabel,
      timeLabel,
      status: 'approved',
      requestedBy,
      decidedBy
    });

    res.json({ message: '테스트 메일을 전송했어요! 메일함을 확인해 주세요.' });
  } catch (error) {
    console.error('테스트 메일 전송 실패', error);
    res.status(500).json({ error: '테스트 메일을 보내지 못했어요.' });
  }
});

module.exports = router;
