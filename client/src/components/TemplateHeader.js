import React, { useEffect, useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import './TemplateHeader.css';

function TemplateHeader() {
  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    createTemplate,
    renameTemplate,
    saveSchedule,
    saving,
    loading
  } = useTemplate();

  const [nameDraft, setNameDraft] = useState('');
  const [renameError, setRenameError] = useState('');

  useEffect(() => {
    const current = templates.find((template) => template.id === selectedTemplateId);
    setNameDraft(current?.name ?? '');
  }, [templates, selectedTemplateId]);

  const handleCreate = async () => {
    const name = window.prompt('새 템플릿 이름을 입력해 주세요.');
    if (!name) return;
    try {
      await createTemplate(name);
      setRenameError('');
    } catch (err) {
      setRenameError(err.message);
    }
  };

  const handleRename = async () => {
    if (!selectedTemplateId) return;
    try {
      await renameTemplate(selectedTemplateId, nameDraft);
      setRenameError('');
    } catch (err) {
      setRenameError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      await saveSchedule();
      window.alert('시간표가 저장되었어요!');
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className="template-header">
      <div className="template-controls">
        <div className="template-select">
          <label htmlFor="template-select">템플릿 선택</label>
          <select
            id="template-select"
            value={selectedTemplateId ?? ''}
            onChange={(event) => setSelectedTemplateId(Number(event.target.value))}
            disabled={loading}
          >
            {templates.length === 0 && <option value="">템플릿이 없어요</option>}
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleCreate}>
            + 새 템플릿
          </button>
        </div>

        <div className="template-name">
          <label htmlFor="template-name">템플릿 이름</label>
          <div className="inline-edit">
            <input
              id="template-name"
              type="text"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              placeholder="예: 정규 시간표"
              disabled={!selectedTemplateId}
            />
            <button type="button" onClick={handleRename} disabled={!selectedTemplateId}>
              이름 수정
            </button>
          </div>
          {renameError && <p className="error">{renameError}</p>}
        </div>
      </div>

      <div className="template-actions">
        <button
          type="button"
          className="save-button"
          onClick={handleSave}
          disabled={!selectedTemplateId || saving || loading}
        >
          {saving ? '저장 중...' : '시간표 저장'}
        </button>
      </div>
    </div>
  );
}

export default TemplateHeader;
