import React, { useMemo, useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { useAuth } from '../context/AuthContext';
import { createChangeRequest } from '../api/changeRequests';
import EditCellModal from './modals/EditCellModal';
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
  const { user } = useAuth();

  const [newTime, setNewTime] = useState('');
  const [editingCell, setEditingCell] = useState(null);

  const sortedTimeSlots = useMemo(() => timeSlots, [timeSlots]);

  const isManager = user?.role === 'manager' || user?.role === 'superadmin';
  const displayName = user?.displayName || user?.username || '선생님';

  const handleAddTimeSlot = () => {
    if (!isManager) {
      window.alert('시간대 추가는 관리자만 할 수 있어요.');
      return;
    }
    if (!newTime.trim()) return;
    addTimeSlot(newTime.trim());
    setNewTime('');
  };

  const handleDeleteTimeSlot = (timeLabel) => {
    if (!isManager) {
      window.alert('시간대 삭제는 관리자만 할 수 있어요.');
      return;
    }
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
    const currentValue = scheduleMap[key] || { students: '', notes: '', color: '#333333' };

    if (isManager) {
      setEditingCell({
        dayIndex,
        timeLabel,
        initial: {
          students: currentValue.students || '',
          notes: currentValue.notes || '',
          color: currentValue.color || '#333333'
        }
      });
      return;
    }

    const message = window.prompt('어떻게 바꾸고 싶은지 남겨 주세요. 예: 학생 추가/시간 변경 등', '');
    if (!message || !message.trim()) return;

    createChangeRequest({
      templateId: selectedTemplateId,
      dayOfWeek: dayIndex,
      timeLabel,
      requestedBy: displayName,
      payload: {
        currentStudents: currentValue.students || '',
        currentNotes: currentValue.notes || '',
        currentColor: currentValue.color || '#333333',
        message: message.trim()
      }
    })
      .then(() => {
        window.alert('요청이 접수되었어요! 관리자가 승인하면 반영돼요. 😊');
      })
      .catch((err) => {
        console.error(err);
        window.alert(err.message || '요청을 보내지 못했어요.');
      });
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
      {editingCell && (
        <EditCellModal
          title={`${DAY_LABELS[editingCell.dayIndex]}요일 · ${editingCell.timeLabel}`}
          initialStudents={editingCell.initial.students}
          initialNotes={editingCell.initial.notes}
          initialColor={editingCell.initial.color}
          onSave={(students, notes, color) => {
            const trimmedStudents = students.trim();
            const trimmedNotes = notes.trim();
            const safeColor = color || '#333333';

            if (!trimmedStudents && !trimmedNotes) {
              setCell(editingCell.dayIndex, editingCell.timeLabel, undefined);
            } else {
              setCell(editingCell.dayIndex, editingCell.timeLabel, {
                students: trimmedStudents,
                notes: trimmedNotes,
                color: safeColor
              });
            }
            setEditingCell(null);
          }}
          onDelete={() => {
            setCell(editingCell.dayIndex, editingCell.timeLabel, undefined);
            setEditingCell(null);
          }}
          onClose={() => setEditingCell(null)}
        />
      )}
      <div className="schedule-header">
        <h2>📋 주간 시간표</h2>
        {isManager && (
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
        )}
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
              {isManager && (
                <button
                  type="button"
                  className="delete-time-btn"
                  onClick={() => handleDeleteTimeSlot(timeLabel)}
                  title="시간대 삭제"
                >
                  ❌
                </button>
              )}
            </div>

            {DAY_LABELS.map((_, dayIndex) => {
              const key = `${dayIndex}-${timeLabel}`;
              const cell = scheduleMap[key];
              const students = cell?.students;
              const notes = cell?.notes;
              const color = cell?.color || '#333333';

              return (
                <div
                  key={key}
                  className={`schedule-cell ${(students || notes) ? 'filled' : 'empty'}`}
                  onClick={() => handleCellClick(dayIndex, timeLabel)}
                >
                  <span className="cell-students" style={{ color }}>
                    {students?.trim()
                      ? students
                      : isManager
                        ? '+ 학생/메모 편집'
                        : '수정 요청 보내기'}
                  </span>
                  {notes?.trim() && <span className="cell-notes">📝 {notes}</span>}
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
