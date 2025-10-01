import React from 'react';
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
    if (!cell) return { students: '', notes: '' };
    return {
      students: cell.students || '',
      notes: cell.notes || ''
    };
  };

  return (
    <div className="print-modal-backdrop">
      <div className="print-modal-card">
        <header>
          <h2>인쇄용 미리보기</h2>
          <p className="print-meta">
            템플릿: <strong>{templateName}</strong><br />
            생성 시각: {now}
          </p>
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
                    const { students, notes } = getCellContent(dayIndex, timeLabel);
                    return (
                      <td key={`${dayIndex}-${timeLabel}`}>
                        {students && (
                          <div className="students">{students}</div>
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

        <div className="print-actions">
          <button type="button" onClick={() => window.print()}>PDF/인쇄</button>
          <button type="button" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default PrintPreviewModal;
