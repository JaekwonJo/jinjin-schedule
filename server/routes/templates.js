const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const { run, all, get } = require('../db');
const { requireRole } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

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
  color: row.color || '#333333',
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
          notes = '',
          color = '#333333'
        } = entry;

        if (typeof dayOfWeek !== 'number' || !timeLabel) {
          throw new Error('dayOfWeek 숫자와 timeLabel 문자열이 필요해요.');
        }

        await run(
          `INSERT INTO schedule_entries (template_id, day_of_week, time_label, teacher_name, student_names, notes, color, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, dayOfWeek, timeLabel, teacherName, studentNames, notes, color, now, now]
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

const NORMALIZE_WHITESPACE_REGEX = /\s+/g;
const DAY_CHAR_TO_INDEX = {
  '월': 0,
  '화': 1,
  '수': 2,
  '목': 3,
  '금': 4,
  '토': 5,
  '일': 6
};

function normalizeHeader(value) {
  return (value || '')
    .toString()
    .replace(/\r?\n/g, ' ')
    .replace(NORMALIZE_WHITESPACE_REGEX, ' ')
    .trim();
}

function parseCellContent(raw) {
  const text = (raw || '')
    .toString()
    .replace(/\r\n?/g, '\n');

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { students: '', notes: '' };
  }

  if (lines.length === 1) {
    return { students: lines[0], notes: '' };
  }

  const [first, ...rest] = lines;
  return {
    notes: first,
    students: rest.join('\n')
  };
}

router.post('/:id/import', requireRole('manager', 'superadmin'), upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const mode = (req.body.mode || 'replace').toLowerCase();

  if (!['replace', 'append'].includes(mode)) {
    return res.status(400).json({ error: "mode는 'replace' 또는 'append'만 사용할 수 있어요." });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'CSV 파일을 업로드해 주세요.' });
  }

  const template = await get('SELECT * FROM templates WHERE id = ?', [id]);
  if (!template) {
    return res.status(404).json({ error: '템플릿을 찾지 못했어요.' });
  }

  let records;
  try {
    records = parse(req.file.buffer.toString('utf8'), {
      skip_empty_lines: true
    });
  } catch (error) {
    console.error('CSV 파싱 실패', error);
    return res.status(400).json({ error: 'CSV 파일을 읽는 중 문제가 발생했어요.' });
  }

  if (!records || records.length === 0) {
    return res.status(400).json({ error: 'CSV 파일에 데이터가 없습니다.' });
  }

  const header = records.shift().map(normalizeHeader);

  let timeIndex = header.findIndex((value) => /시간|time/i.test(value));
  if (timeIndex === -1) timeIndex = 0;

  let teacherIndex = header.findIndex((value) => /담당|선생|teacher/i.test(value));
  if (teacherIndex === -1) teacherIndex = 1;

  const dayColumns = header
    .map((value, index) => {
      const match = value.match(/[월화수목금토일]/);
      if (!match) return null;
      const dayIndex = DAY_CHAR_TO_INDEX[match[0]];
      if (typeof dayIndex === 'number') {
        return { index, dayOfWeek: dayIndex, label: value };
      }
      return null;
    })
    .filter(Boolean);

  if (dayColumns.length === 0) {
    return res.status(400).json({ error: '요일 컬럼을 찾지 못했어요. 헤더에 월~일 컬럼이 있는지 확인해 주세요.' });
  }

  const warnings = [];
  const entries = [];
  const uniqueTeachers = new Set();
  const uniqueTimes = new Set();

  let currentTime = '';
  let currentTeacher = '';

  records.forEach((row, i) => {
    const rowValues = row.length < header.length
      ? row.concat(Array.from({ length: header.length - row.length }, () => ''))
      : row;

    const rowNumber = i + 2; // considering header row as #1

    const rawTime = (rowValues[timeIndex] || '').toString().trim();
    if (rawTime) {
      currentTime = rawTime;
    }

    if (!currentTime) {
      warnings.push(`${rowNumber}행: 시간 정보를 찾을 수 없어 건너뛰었습니다.`);
      return;
    }

    const rawTeacher = (rowValues[teacherIndex] || '').toString().replace(/\r?\n/g, ' ').trim();
    if (rawTeacher) {
      currentTeacher = rawTeacher;
    }

    const cells = dayColumns.map(({ index, dayOfWeek }) => {
      return {
        dayOfWeek,
        raw: rowValues[index]
      };
    });

    const hasContent = cells.some(({ raw }) => (raw || '').toString().trim());
    if (!hasContent) {
      return;
    }

    if (!currentTeacher) {
      warnings.push(`${rowNumber}행: 담당 선생님 정보가 없어 빈 문자열로 저장했어요.`);
    }

    cells.forEach(({ dayOfWeek, raw }) => {
      const content = (raw || '').toString();
      if (!content.trim()) return;

      const { students, notes } = parseCellContent(content);

      entries.push({
        dayOfWeek,
        timeLabel: currentTime,
        teacherName: currentTeacher,
        studentNames: students,
        notes,
        color: '#333333'
      });
    });

    if (currentTeacher) {
      uniqueTeachers.add(currentTeacher);
    }
    uniqueTimes.add(currentTime);
  });

  if (entries.length === 0) {
    return res.status(400).json({ error: '가져올 수 있는 데이터가 없습니다. CSV 내용을 다시 확인해 주세요.' });
  }

  try {
    await run('BEGIN IMMEDIATE TRANSACTION');

    if (mode === 'replace') {
      await run('DELETE FROM schedule_entries WHERE template_id = ?', [id]);
    }

    const now = new Date().toISOString();

    for (const entry of entries) {
      await run(
        `INSERT INTO schedule_entries (template_id, day_of_week, time_label, teacher_name, student_names, notes, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [
          id,
          entry.dayOfWeek,
          entry.timeLabel,
          entry.teacherName || '',
          entry.studentNames || '',
          entry.notes || '',
          entry.color || '#333333',
          now,
          now
        ]
      );
    }

    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    console.error('CSV 가져오기 실패', error);
    return res.status(500).json({ error: 'CSV 데이터를 저장하지 못했어요.' });
  }

  res.json({
    message: `${entries.length}개의 셀을 불러왔어요!`,
    importedCount: entries.length,
    teacherCount: Array.from(uniqueTeachers).filter((v) => v && v.trim()).length,
    timeSlotCount: uniqueTimes.size,
    warnings
  });
});

module.exports = router;
