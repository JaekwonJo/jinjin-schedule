const express = require('express');
const router = express.Router();

const { run, all, get } = require('../db');
const { requireRole } = require('../middleware/auth');
const { sendDecisionNotification, isEmailConfigured } = require('../services/notifier');

const mapRow = (row) => ({
  id: row.id,
  templateId: row.template_id,
  dayOfWeek: row.day_of_week,
  timeLabel: row.time_label,
  requestedBy: row.requested_by,
  payload: row.payload ? JSON.parse(row.payload) : null,
  status: row.status,
  createdAt: row.created_at,
  decidedAt: row.decided_at,
  decidedBy: row.decided_by,
  acknowledgedBy: row.acknowledged_by,
  acknowledgedAt: row.acknowledged_at
});

router.get('/', async (req, res) => {
  const { status } = req.query;

  try {
    let rows;

    if (status) {
      rows = await all(
        `SELECT * FROM change_requests WHERE status = ? ORDER BY created_at DESC`,
        [status]
      );
    } else {
      rows = await all(`SELECT * FROM change_requests ORDER BY created_at DESC`);
    }

    res.json({ requests: rows.map(mapRow) });
  } catch (error) {
    console.error('Failed to fetch change requests', error);
    res.status(500).json({ error: '수정 요청을 불러오지 못했어요.' });
  }
});

router.post('/', async (req, res) => {
  const { templateId, dayOfWeek, timeLabel, requestedBy, payload } = req.body;

  if (!templateId || typeof dayOfWeek !== 'number' || !timeLabel || !requestedBy) {
    return res.status(400).json({ error: 'templateId, dayOfWeek, timeLabel, requestedBy가 필요해요.' });
  }

  try {
    const now = new Date().toISOString();
    const payloadJson = JSON.stringify(payload ?? {});

    const result = await run(
      `INSERT INTO change_requests (template_id, day_of_week, time_label, requested_by, payload, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)` ,
      [templateId, dayOfWeek, timeLabel, requestedBy, payloadJson, now]
    );

    const row = await get('SELECT * FROM change_requests WHERE id = ?', [result.id]);
    res.status(201).json({ request: mapRow(row) });
  } catch (error) {
    console.error('Failed to create change request', error);
    res.status(500).json({ error: '수정 요청을 저장하지 못했어요.' });
  }
});

router.patch('/:id/decision', requireRole('manager', 'superadmin'), async (req, res) => {
  const { id } = req.params;
  const { status, decidedBy } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "status는 'approved' 또는 'rejected'만 가능해요." });
  }

  try {
    const request = await get('SELECT * FROM change_requests WHERE id = ?', [id]);

    if (!request) {
      return res.status(404).json({ error: '요청을 찾지 못했어요.' });
    }

    const decidedAt = new Date().toISOString();

    await run(
      `UPDATE change_requests SET status = ?, decided_at = ?, decided_by = ? WHERE id = ?`,
      [status, decidedAt, decidedBy ?? null, id]
    );

    const updated = await get('SELECT * FROM change_requests WHERE id = ?', [id]);

    if (isEmailConfigured()) {
      try {
        const template = await get('SELECT name FROM templates WHERE id = ?', [updated.template_id]);
        const templateName = template?.name || `템플릿 #${updated.template_id}`;
        const dayLabel = ['월', '화', '수', '목', '금', '토', '일'][updated.day_of_week] || `${updated.day_of_week}일차`;
        await sendDecisionNotification({
          templateName,
          dayLabel,
          timeLabel: updated.time_label,
          status,
          requestedBy: updated.requested_by,
          decidedBy: updated.decided_by || decidedBy || '관리자'
        });
      } catch (notifyError) {
        console.warn('알림 이메일 전송 실패', notifyError);
      }
    }

    res.json({ request: mapRow(updated) });
  } catch (error) {
    console.error('Failed to update request status', error);
    res.status(500).json({ error: '요청 상태를 변경하지 못했어요.' });
  }
});

router.patch('/:id/acknowledge', async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  if (!user) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  try {
    const request = await get('SELECT * FROM change_requests WHERE id = ?', [id]);

    if (!request) {
      return res.status(404).json({ error: '요청을 찾지 못했어요.' });
    }

    if (user.role === 'teacher') {
      const displayName = user.displayName || user.username;
      if ((request.requested_by || '').trim() !== displayName.trim()) {
        return res.status(403).json({ error: '본인 요청만 읽음 처리할 수 있어요.' });
      }
    }

    const now = new Date().toISOString();
    await run(
      `UPDATE change_requests SET acknowledged_by = ?, acknowledged_at = ? WHERE id = ?`,
      [user.displayName || user.username || '사용자', now, id]
    );

    const updated = await get('SELECT * FROM change_requests WHERE id = ?', [id]);
    res.json({ request: mapRow(updated) });
  } catch (error) {
    console.error('읽음 처리 실패', error);
    res.status(500).json({ error: '읽음 처리를 완료하지 못했어요.' });
  }
});

module.exports = router;
