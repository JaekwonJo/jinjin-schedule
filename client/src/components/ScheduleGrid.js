import React, { useState } from 'react';
import './ScheduleGrid.css';

function ScheduleGrid() {
  // 요일 (월~일)
  const [days] = useState(['월', '화', '수', '목', '금', '토', '일']);

  // 시간대 (추가/삭제 가능)
  const [timeSlots, setTimeSlots] = useState([
    '2:00', '3:30', '5:00', '6:30', '8:00', '9:30'
  ]);

  // 새 시간대 추가
  const [newTime, setNewTime] = useState('');

  // 시간표 데이터 (예시)
  const [scheduleData, setScheduleData] = useState({});

  // 시간대 추가 함수
  const handleAddTimeSlot = () => {
    if (newTime && !timeSlots.includes(newTime)) {
      setTimeSlots([...timeSlots, newTime].sort());
      setNewTime('');
    }
  };

  // 시간대 삭제 함수
  const handleDeleteTimeSlot = (time) => {
    if (window.confirm(`${time} 시간대를 삭제하시겠습니까?`)) {
      setTimeSlots(timeSlots.filter(t => t !== time));
    }
  };

  // 셀 클릭 핸들러 (나중에 학생 추가 기능)
  const handleCellClick = (day, time) => {
    const key = `${day}-${time}`;
    const student = prompt('학생 이름을 입력하세요:');
    if (student) {
      setScheduleData({
        ...scheduleData,
        [key]: student
      });
    }
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>📋 주간 시간표</h2>
        <div className="time-slot-controls">
          <input
            type="text"
            placeholder="시간 (예: 10:00)"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
          <button onClick={handleAddTimeSlot}>➕ 시간대 추가</button>
        </div>
      </div>

      <div className="schedule-grid">
        {/* 헤더: 시간/요일 */}
        <div className="grid-header">
          <div className="header-cell corner">시간 / 요일</div>
          {days.map(day => (
            <div key={day} className="header-cell day-header">
              {day}요일
            </div>
          ))}
        </div>

        {/* 본문: 시간대별 행 */}
        {timeSlots.map(time => (
          <div key={time} className="grid-row">
            {/* 시간대 셀 */}
            <div className="time-cell">
              <span>{time}</span>
              <button
                className="delete-time-btn"
                onClick={() => handleDeleteTimeSlot(time)}
                title="시간대 삭제"
              >
                ❌
              </button>
            </div>

            {/* 요일별 셀 */}
            {days.map(day => {
              const key = `${day}-${time}`;
              const student = scheduleData[key];

              return (
                <div
                  key={key}
                  className={`schedule-cell ${student ? 'filled' : 'empty'}`}
                  onClick={() => handleCellClick(day, time)}
                >
                  {student || '+ 학생 추가'}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="schedule-footer">
        <p>💡 셀을 클릭해서 학생을 추가하세요!</p>
        <p>💡 시간대 옆의 ❌를 클릭해서 삭제할 수 있어요!</p>
      </div>
    </div>
  );
}

export default ScheduleGrid;
