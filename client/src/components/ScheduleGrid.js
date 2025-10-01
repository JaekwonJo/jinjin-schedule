import React, { useMemo, useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import './ScheduleGrid.css';

function ScheduleGrid() {
  const {
    DAY_LABELS,
    timeSlots,
    addTimeSlot,
    removeTimeSlot,
    scheduleMap,
    setCell,
    selectedTemplateId,
    loading
  } = useTemplate();

  const [newTime, setNewTime] = useState('');

  const sortedTimeSlots = useMemo(() => timeSlots, [timeSlots]);

  const handleAddTimeSlot = () => {
    if (!newTime.trim()) return;
    addTimeSlot(newTime.trim());
    setNewTime('');
  };

  const handleDeleteTimeSlot = (timeLabel) => {
    if (window.confirm(`${timeLabel} 시간대를 삭제할까요?`)) {
      removeTimeSlot(timeLabel);
    }
  };

  const handleCellClick = (dayIndex, timeLabel) => {
    if (!selectedTemplateId) {
      window.alert('먼저 템플릿을 선택하거나 만들어 주세요.');
      return;
    }

    const key = `${dayIndex}-${timeLabel}`;
    const currentValue = scheduleMap[key] || '';
    const nextValue = window.prompt('학생 이름을 입력하세요 (쉼표로 구분 가능)', currentValue);
    if (nextValue === null) return;
    setCell(dayIndex, timeLabel, nextValue);
  };

  if (!selectedTemplateId) {
    return (
      <div className="schedule-placeholder">
        <p>먼저 템플릿을 만들어 주세요. (예: 정규 시간표, 시험대비 시간표)</p>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>📋 주간 시간표</h2>
        <div className="time-slot-controls">
          <input
            type="text"
            placeholder="시간 (예: 10:00)"
            value={newTime}
            onChange={(event) => setNewTime(event.target.value)}
            disabled={loading}
          />
          <button type="button" onClick={handleAddTimeSlot} disabled={loading}>
            ➕ 시간대 추가
          </button>
        </div>
      </div>

      <div className="schedule-grid">
        <div className="grid-header">
          <div className="header-cell corner">시간 / 요일</div>
          {DAY_LABELS.map((day) => (
            <div key={day} className="header-cell day-header">
              {day}요일
            </div>
          ))}
        </div>

        {sortedTimeSlots.map((timeLabel) => (
          <div key={timeLabel} className="grid-row">
            <div className="time-cell">
              <span>{timeLabel}</span>
              <button
                type="button"
                className="delete-time-btn"
                onClick={() => handleDeleteTimeSlot(timeLabel)}
                title="시간대 삭제"
              >
                ❌
              </button>
            </div>

            {DAY_LABELS.map((_, dayIndex) => {
              const key = `${dayIndex}-${timeLabel}`;
              const student = scheduleMap[key];

              return (
                <div
                  key={key}
                  className={`schedule-cell ${student ? 'filled' : 'empty'}`}
                  onClick={() => handleCellClick(dayIndex, timeLabel)}
                >
                  {student || '+ 학생 추가'}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="schedule-footer">
        <p>💡 셀을 클릭해서 학생을 추가하거나 수정하세요.</p>
        <p>💡 시간대 옆의 ❌를 클릭하면 해당 시간대를 삭제할 수 있어요.</p>
      </div>
    </div>
  );
}

export default ScheduleGrid;
