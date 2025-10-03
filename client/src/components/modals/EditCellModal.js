import React, { useState } from 'react';
import './EditCellModal.css';

function EditCellModal({
  title,
  initialTeacher = '',
  initialStudents = '',
  initialNotes = '',
  initialColor = '#333333',
  onSave,
  onDelete,
  onClose
}) {
  const [teacher, setTeacher] = useState(initialTeacher);
  const [students, setStudents] = useState(initialStudents);
  const [notes, setNotes] = useState(initialNotes);
  const [color, setColor] = useState(initialColor || '#333333');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (typeof onSave === 'function') {
      onSave(students, notes, color, teacher);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header>
          <h2>{title}</h2>
          <p className="modal-subtitle">콤마로 학생을 구분하고, 메모에는 교재·특이사항 등을 적어주세요.</p>
        </header>
        <form onSubmit={handleSubmit}>
          <label htmlFor="modal-teacher">담당 선생님</label>
          <input
            id="modal-teacher"
            type="text"
            value={teacher}
            onChange={(event) => setTeacher(event.target.value)}
            placeholder="예: 현T"
          />

          <label htmlFor="modal-students">학생 이름 (쉼표로 구분)</label>
          <textarea
            id="modal-students"
            value={students}
            onChange={(event) => setStudents(event.target.value)}
            placeholder="예: 김학생, 이학생"
          />

          <label htmlFor="modal-notes">메모 / 비고</label>
          <textarea
            id="modal-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="예: 교재, 특이사항 등"
          />

          <label htmlFor="modal-color">학생 이름 색상</label>
          <input
            id="modal-color"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />

          <div className="modal-actions">
            <button type="submit" className="primary">저장</button>
            <button type="button" onClick={onClose}>닫기</button>
            <button type="button" className="danger" onClick={onDelete}>셀 비우기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCellModal;
