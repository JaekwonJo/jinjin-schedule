import React, { useEffect, useState } from 'react';
import { useTemplate } from '../context/TemplateContext';
import { useAuth } from '../context/AuthContext';
import { fetchChangeRequests } from '../api/changeRequests';
import { sendTestNotification } from '../api/notifications';
import UserManagementPanel from './UserManagementPanel';
import ChangeRequestPanel from './ChangeRequestPanel';
import ChangeHistoryPanel from './ChangeHistoryPanel';
import PrintPreviewModal from './modals/PrintPreviewModal';
import CsvImportModal from './modals/CsvImportModal';
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
    loading,
    refreshTemplates,
    scheduleMap,
    timeSlots,
    DAY_LABELS,
    viewMode,
    setViewMode,
    teacherFilter,
    setTeacherFilter,
    teacherOptions,
    loadEntriesForTemplate
  } = useTemplate();
  const { user, logout } = useAuth();

  const [nameDraft, setNameDraft] = useState('');
  const [renameError, setRenameError] = useState('');
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showRequestPanel, setShowRequestPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [testingMail, setTestingMail] = useState(false);
  const [testFeedback, setTestFeedback] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const current = templates.find((template) => template.id === selectedTemplateId);
    setNameDraft(current?.name ?? '');
  }, [templates, selectedTemplateId]);

  const isManager = user?.role === 'manager' || user?.role === 'superadmin';
  const isSuperadmin = user?.role === 'superadmin';

  useEffect(() => {
    const loadPendingCount = async () => {
      if (!isManager) {
        setPendingCount(0);
        return;
      }
      setRequestLoading(true);
      try {
        const data = await fetchChangeRequests('pending');
        setPendingCount((data.requests || []).length);
      } catch (error) {
        console.error(error);
      } finally {
        setRequestLoading(false);
      }
    };

    loadPendingCount();
  }, [isManager, showRequestPanel]);

  useEffect(() => {
    if (!testFeedback) return undefined;
    const timer = setTimeout(() => setTestFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [testFeedback]);

  const handleCreate = async () => {
    if (!isManager) {
      window.alert('템플릿을 만들 수 있는 권한이 없어요. 관리자에게 문의해 주세요.');
      return;
    }
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
    if (!isManager) {
      window.alert('템플릿 이름을 수정할 수 있는 권한이 없어요.');
      return;
    }
    try {
      await renameTemplate(selectedTemplateId, nameDraft);
      setRenameError('');
    } catch (err) {
      setRenameError(err.message);
    }
  };

  const handleSave = async () => {
    if (!isManager) {
      window.alert('시간표 저장은 관리자만 할 수 있어요.');
      return;
    }
    try {
      await saveSchedule();
      window.alert('시간표가 저장되었어요!');
    } catch (err) {
      window.alert(err.message);
    }
  };

  const handleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleTeacherSelect = (event) => {
    setTeacherFilter(event.target.value);
  };

  const setTeacherToMe = () => {
    const candidate = user?.displayName?.trim?.() || user?.username?.trim?.();
    if (candidate) {
      setTeacherFilter(candidate);
    } else {
      window.alert('내 이름 정보를 찾을 수 없어요. 계정 정보를 확인해 주세요.');
    }
  };

  const isTeacherMode = viewMode === 'teacher';

  const handleImportSuccess = async () => {
    await refreshTemplates();
    await loadEntriesForTemplate(selectedTemplateId);
    setShowImportModal(false);
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
          <button type="button" onClick={handleCreate} disabled={!isManager}>
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
              disabled={!selectedTemplateId || !isManager}
            />
            <button type="button" onClick={handleRename} disabled={!selectedTemplateId || !isManager}>
              이름 수정
            </button>
          </div>
          {renameError && <p className="error">{renameError}</p>}
        </div>

        <div className="view-mode">
          <label>보기 모드</label>
          <div className="view-toggle">
            <button
              type="button"
              className={`view-button ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => handleViewMode('all')}
            >
              전체 보기
            </button>
            <button
              type="button"
              className={`view-button ${isTeacherMode ? 'active' : ''}`}
              onClick={() => handleViewMode('teacher')}
            >
              선생님별 보기
            </button>
          </div>
          {isTeacherMode && (
            <div className="teacher-filter">
              <select value={teacherFilter || ''} onChange={handleTeacherSelect}>
                {teacherOptions.length === 0 && <option value="">선생님 이름을 선택하세요</option>}
                {teacherOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <button type="button" onClick={setTeacherToMe} className="assign-me">
                내 이름으로 보기
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="template-actions">
        {user && (
          <div className="user-badge">
            <span className="role-chip">{user.role === 'superadmin' ? '최고 관리자' : user.role === 'manager' ? '관리 선생님' : '선생님'}</span>
            <span className="user-name">{user.displayName || user.username}</span>
            <button
              type="button"
              className="user-panel-toggle"
              onClick={() => setShowHistoryPanel((prev) => !prev)}
            >
              {showHistoryPanel ? '기록 닫기' : '내 요청 기록'}
            </button>
            {isManager && (
              <button
                type="button"
                className="user-panel-toggle"
                onClick={() => setShowPrintPreview(true)}
              >
                인쇄 미리보기
              </button>
            )}
            {isManager && (
              <button
                type="button"
                className="user-panel-toggle"
                onClick={() => setShowRequestPanel((prev) => !prev)}
              >
                {showRequestPanel ? '요청 관리 닫기' : '요청 관리 열기'}
                {pendingCount > 0 && !showRequestPanel && (
                  <span className="badge">{pendingCount}</span>
                )}
                {requestLoading && !showRequestPanel && <span className="badge badge--loading">…</span>}
              </button>
            )}
            {testFeedback && (
              <div className={`mail-test-alert mail-test-alert--${testFeedback.type}`}>
                {testFeedback.message}
              </div>
            )}
            {isSuperadmin && (
              <button
                type="button"
                className="user-panel-toggle"
                onClick={async () => {
                  try {
                    setTestingMail(true);
                    const response = await sendTestNotification();
                    setTestFeedback({
                      type: 'success',
                      message: response.message || '테스트 메일을 보냈어요! 우편함을 확인해 주세요.'
                    });
                  } catch (error) {
                    console.error(error);
                    setTestFeedback({
                      type: 'error',
                      message: error.message || '테스트 메일을 보내지 못했어요. SMTP 설정을 확인해 주세요.'
                    });
                  } finally {
                    setTestingMail(false);
                  }
                }}
              >
                {testingMail ? '메일 전송 중...' : '테스트 메일 보내기'}
              </button>
            )}
            {isSuperadmin && (
              <button
                type="button"
                className="user-panel-toggle"
                onClick={() => setShowUserPanel((prev) => !prev)}
              >
                {showUserPanel ? '계정 관리 닫기' : '계정 관리 열기'}
              </button>
            )}
          </div>
        )}
        {isManager && (
          <button
            type="button"
            className="import-button"
            onClick={() => setShowImportModal(true)}
            disabled={!selectedTemplateId}
          >
            CSV 업로드
          </button>
        )}
        <button
          type="button"
          className="save-button"
          onClick={handleSave}
          disabled={!selectedTemplateId || saving || loading || !isManager}
        >
          {saving ? '저장 중...' : '시간표 저장'}
        </button>
        <button type="button" className="logout-button" onClick={logout}>
          로그아웃
        </button>
      </div>
      {showRequestPanel && isManager && (
        <ChangeRequestPanel
          onRefreshTemplates={refreshTemplates}
          onPendingUpdate={setPendingCount}
        />
      )}
      {showHistoryPanel && <ChangeHistoryPanel dayLabels={DAY_LABELS} templates={templates} />}
      {showUserPanel && isSuperadmin && <UserManagementPanel />}
      {showPrintPreview && isManager && (
        <PrintPreviewModal
          templateName={templates.find((t) => t.id === selectedTemplateId)?.name || '무제 시간표'}
          dayLabels={DAY_LABELS}
          timeSlots={timeSlots}
          scheduleMap={scheduleMap}
          onClose={() => setShowPrintPreview(false)}
        />
      )}
      {showImportModal && isManager && selectedTemplateId && (
        <CsvImportModal
          templateId={selectedTemplateId}
          templateName={templates.find((t) => t.id === selectedTemplateId)?.name || '무제 시간표'}
          onClose={() => setShowImportModal(false)}
          onImported={handleImportSuccess}
        />
      )}
    </div>
  );
}

export default TemplateHeader;
