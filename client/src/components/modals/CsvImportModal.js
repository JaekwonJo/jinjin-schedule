import React, { useState } from 'react';
import { importTemplateCsv } from '../../api/templates';
import './CsvImportModal.css';

function CsvImportModal({ templateId, templateName, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('replace');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [summary, setSummary] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event) => {
    const [selected] = event.target.files || [];
    setFile(selected || null);
    setSummary(null);
    setStatus({ type: 'idle', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setStatus({ type: 'error', message: 'CSV 파일을 먼저 선택해 주세요.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'info', message: '업로드 중입니다. 잠시만 기다려 주세요...' });

    try {
      const result = await importTemplateCsv(templateId, file, { mode });
      setSummary(result);
      setStatus({ type: 'success', message: result.message || '시간표를 불러왔어요!' });
      if (typeof onImported === 'function') {
        onImported(result);
      }
    } catch (error) {
      console.error(error);
      setSummary(null);
      setStatus({ type: 'error', message: error.message || '업로드 중 문제가 발생했어요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="csv-modal-card">
        <header>
          <h2>CSV로 시간표 불러오기</h2>
          <p className="csv-modal-subtitle">
            템플릿 <strong>{templateName}</strong>에 CSV 데이터를 불러옵니다. 업로드 전에 꼭 미리보기와 백업을 확인해 주세요.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="csv-form">
          <label htmlFor="csv-file">CSV 파일 선택</label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />

          <label htmlFor="csv-mode">저장 방법</label>
          <select
            id="csv-mode"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            disabled={isSubmitting}
          >
            <option value="replace">기존 시간표를 새 CSV 내용으로 교체</option>
            <option value="append">기존 시간표 아래에 추가</option>
          </select>

          <div className="csv-instructions">
            <h3>📄 CSV 작성 가이드</h3>
            <ol>
              <li>첫 줄은 <code>시간, 담당 선생님, 월, 화, 수, 목, 금, 토, 일</code> 순으로 작성해 주세요.</li>
              <li>각 셀에는 <strong>첫 줄에 반/비고</strong>, 그 아래 줄에는 <strong>학생 이름(쉼표 구분)</strong>을 적으면 자동으로 메모와 학생이 나뉩니다.</li>
              <li>시간은 <code>2:00</code>, <code>3:30</code> 처럼 동일한 형식으로 입력해 주세요.</li>
              <li>예시는 <code>docs/data-import-plan.md</code> 또는 곧 제공될 템플릿을 참고해 주세요.</li>
            </ol>
            <p className="csv-tip">Tip: 구글시트에서 “다른 이름으로 다운로드 → CSV”를 이용하면 가장 깔끔해요.</p>
          </div>

          <div className="csv-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '업로드 중...' : 'CSV 불러오기'}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              닫기
            </button>
          </div>
        </form>

        {status.message && (
          <div className={`csv-status csv-status--${status.type}`}>
            {status.message}
          </div>
        )}

        {summary && (
          <div className="csv-summary">
            <h3>✅ 불러오기 결과</h3>
            <ul>
              <li>총 {summary.importedCount ?? 0}개 셀 저장</li>
              <li>시간대 {summary.timeSlotCount ?? 0}개 · 선생님 {summary.teacherCount ?? 0}명</li>
            </ul>
            {summary.warnings?.length > 0 && (
              <div className="csv-warnings">
                <h4>⚠️ 참고하세요</h4>
                <ul>
                  {summary.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CsvImportModal;
