const express = require('express');
const router = express.Router();

const { run, all, get } = require('../db');
const { requireRole } = require('../middleware/auth');

const mapTemplateRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapEntryRow = (row) => ({
  id: row.id,
  templateId: row.template_id,
  dayOfWeek: row.day_of_week,
  timeLabel: row.time_label,
  teacherName: row.teacher_name,
  studentNames: row.student_names,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

router.get('/', async (req, res) => {
  try {
    const rows = await all(
      `SELECT t.*, COUNT(e.id) AS entry_count
       FROM templates t
       LEFT JOIN schedule_entries e ON e.template_id = t.id
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    );

    const templates = rows.map((row) => ({
      ...mapTemplateRow(row),
      entryCount: row.entry_count
    }));

    res.json({ templates });
  } catch (error) {
    console.error('Failed to fetch templates', error);
    res.status(500).json({ error: '템플릿 목록을 불러오지 못했어요.' });
  }
});

router.post('/', requireRole('manager', 'superadmin'), async (req, res) => {
  const { name, description = '', isActive = false } = req.body;

  if (!name) {
    return res.status(400).json({ error: '템플릿 이름이 필요해요.' });
  }

  try {
    const now = new Date().toISOString();
    const result = await run(
      `INSERT INTO templates (name, description, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)` ,
      [name, description, isActive ? 1 : 0, now, now]
    );

    const template = await get('SELECT * FROM templates WHERE id = ?', [result.id]);
    res.status(201).json({ template: mapTemplateRow(template) });
  } catch (error) {
    console.error('Failed to create template', error);
    res.status(500).json({ error: '템플릿을 만들지 못했어요.' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const template = await get('SELECT * FROM templates WHERE id = ?', [id]);

    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾지 못했어요.' });
    }

    res.json({ template: mapTemplateRow(template) });
  } catch (error) {
    console.error('Failed to fetch template detail', error);
    res.status(500).json({ error: '템플릿 정보를 불러오지 못했어요.' });
  }
});

router.put('/:id', requireRole('manager', 'superadmin'), async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  try {
    const template = await get('SELECT * FROM templates WHERE id = ?', [id]);

    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾지 못했어요.' });
    }

    const nextName = name ?? template.name;
    const nextDescription = description ?? template.description;
    const nextIsActive = typeof isActive === 'boolean' ? (isActive ? 1 : 0) : template.is_active;
    const now = new Date().toISOString();

    await run(
      `UPDATE templates SET name = ?, description = ?, is_active = ?, updated_at = ? WHERE id = ?`,
      [nextName, nextDescription, nextIsActive, now, id]
    );

    const updated = await get('SELECT * FROM templates WHERE id = ?', [id]);
    res.json({ template: mapTemplateRow(updated) });
  } catch (error) {
    console.error('Failed to update template', error);
    res.status(500).json({ error: '템플릿을 수정하지 못했어요.' });
  }
});

router.delete('/:id', requireRole('manager', 'superadmin'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await run('DELETE FROM templates WHERE id = ?', [id]);

    if (!result.changes) {
      return res.status(404).json({ error: '이미 삭제되었거나 없는 템플릿이에요.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete template', error);
    res.status(500).json({ error: '템플릿을 삭제하지 못했어요.' });
  }
});

router.get('/:id/entries', async (req, res) => {
  const { id } = req.params;

  try {
    const template = await get('SELECT * FROM templates WHERE id = ?', [id]);

    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾지 못했어요.' });
    }

    const rows = await all(
      `SELECT * FROM schedule_entries
       WHERE template_id = ?
       ORDER BY day_of_week, time_label, teacher_name`,
      [id]
    );

    res.json({ entries: rows.map(mapEntryRow) });
  } catch (error) {
    console.error('Failed to fetch schedule entries', error);
    res.status(500).json({ error: '시간표 데이터를 불러오지 못했어요.' });
  }
});

router.put('/:id/entries', requireRole('manager', 'superadmin'), async (req, res) => {
  const { id } = req.params;
  const { entries } = req.body;

  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'entries 배열이 필요해요.' });
  }

  try {
    const template = await get('SELECT * FROM templates WHERE id = ?', [id]);

    if (!template) {
      return res.status(404).json({ error: '템플릿을 찾지 못했어요.' });
    }

    await run('BEGIN IMMEDIATE TRANSACTION');

    try {
      await run('DELETE FROM schedule_entries WHERE template_id = ?', [id]);

      const now = new Date().toISOString();

      for (const entry of entries) {
        const {
          dayOfWeek,
          timeLabel,
          teacherName = '',
          studentNames = '',
          notes = ''
        } = entry;

        if (typeof dayOfWeek !== 'number' || !timeLabel) {
          throw new Error('dayOfWeek 숫자와 timeLabel 문자열이 필요해요.');
        }

        await run(
          `INSERT INTO schedule_entries (template_id, day_of_week, time_label, teacher_name, student_names, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, dayOfWeek, timeLabel, teacherName, studentNames, notes, now, now]
        );
      }

      await run('UPDATE templates SET updated_at = ? WHERE id = ?', [new Date().toISOString(), id]);
      await run('COMMIT');
    } catch (innerError) {
      await run('ROLLBACK');
      throw innerError;
    }

    const rows = await all(
      `SELECT * FROM schedule_entries
       WHERE template_id = ?
       ORDER BY day_of_week, time_label, teacher_name`,
      [id]
    );

    res.json({ entries: rows.map(mapEntryRow) });
  } catch (error) {
    console.error('Failed to upsert schedule entries', error);
    res.status(500).json({ error: error.message || '시간표를 저장하지 못했어요.' });
  }
});

module.exports = router;
