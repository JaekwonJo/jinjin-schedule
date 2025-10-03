import React, { useMemo } from 'react';
import './PrintPreviewModal.css';

function PrintPreviewModal({
  templateName,
  dayLabels,
  timeSlots,
  scheduleMap,
  onClose
}) {
  const now = new Date().toLocaleString();

  const getCellContent = (dayIndex, timeLabel) => {
    const key = `${dayIndex}-${timeLabel}`;
    const cell = scheduleMap[key];
    if (!cell) return { students: '', notes: '', color: '#333333' };
    return {
      teacher: cell.teacher || '',
      students: cell.students || '',
      notes: cell.notes || '',
      color: cell.color || '#333333'
    };
  };

  const colorLegend = useMemo(() => {
    const map = new Map();
    timeSlots.forEach((timeLabel) => {
      dayLabels.forEach((_, dayIndex) => {
        const { students, color } = getCellContent(dayIndex, timeLabel);
        if (students && color) {
          const names = students.split(',').map((s) => s.trim()).filter(Boolean);
          if (names.length === 0) return;
          if (!map.has(color)) {
            map.set(color, new Set(names));
          } else {
            const set = map.get(color);
            names.forEach((n) => set.add(n));
          }
        }
      });
    });
    return Array.from(map.entries()).map(([color, nameSet]) => ({
      color,
      names: Array.from(nameSet).join(', ')
    }));
  }, [dayLabels, timeSlots, scheduleMap]);

  return (
    <div className="print-modal-backdrop">
      <div className="print-modal-card">
        <header>
          <h2>인쇄용 미리보기</h2>
          <p className="print-meta">
            템플릿: <strong>{templateName}</strong><br />
            생성 시각: {now}
          </p>
          <img src="/logo-jinjin.png" alt="진진영어 학원 로고" className="print-logo" />
          <p className="print-tip">💡 색상은 학생별 강조 색상을 의미해요. 일요일 열은 빨간색으로 강조됩니다.</p>
        </header>

        <div className="print-table-wrapper">
          <table className="print-table">
            <thead>
              <tr>
                <th>시간</th>
                {dayLabels.map((day) => (
                  <th key={day}>{day}요일</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeLabel) => (
                <tr key={timeLabel}>
                  <td className="time-cell">{timeLabel}</td>
                  {dayLabels.map((_, dayIndex) => {
                    const { teacher, students, notes, color } = getCellContent(dayIndex, timeLabel);
                    return (
                      <td key={`${dayIndex}-${timeLabel}`}>
                        {teacher && (
                          <div className="teacher">👩‍🏫 {teacher}</div>
                        )}
                        {students && (
                          <div className="students" style={{ color }}>{students}</div>
                        )}
                        {notes && (
                          <div className="notes">📝 {notes}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {colorLegend.length > 0 && (
          <div className="print-legend">
            <h4>색상 전설</h4>
            <ul>
              {colorLegend.map(({ color, names }) => (
                <li key={color}>
                  <span className="legend-color" style={{ background: color }} />
                  <span>{names}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="print-actions">
          <button type="button" onClick={() => window.print()}>PDF/인쇄</button>
          <button type="button" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default PrintPreviewModal;
