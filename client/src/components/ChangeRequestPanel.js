import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTemplate, DAY_LABELS } from '../context/TemplateContext';
import { useAuth } from '../context/AuthContext';
import { fetchChangeRequests, decideChangeRequest } from '../api/changeRequests';
import './ChangeRequestPanel.css';

const statusLabels = {
  pending: '승인 대기',
  approved: '승인 완료',
  rejected: '거절됨'
};

function prettyPayload(payload) {
  if (!payload) return '추가 정보 없음';
  try {
    if (typeof payload === 'string') {
      const parsed = JSON.parse(payload);
      return JSON.stringify(parsed, null, 2);
    }
    return JSON.stringify(payload, null, 2);
  } catch (error) {
    return String(payload);
  }
}

function ChangeRequestPanel({ onRefreshTemplates, onPendingUpdate }) {
  const { templates } = useTemplate();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const templateNameById = useMemo(() => {
    const map = new Map();
    templates.forEach((template) => {
      map.set(template.id, template.name);
    });
    return map;
  }, [templates]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchChangeRequests(statusFilter === 'all' ? undefined : statusFilter);
      setRequests(data.requests ?? []);
      if (statusFilter === 'pending' && typeof onPendingUpdate === 'function') {
        onPendingUpdate((data.requests || []).length);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || '요청 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleDecision = async (id, nextStatus) => {
    const confirmMsg = nextStatus === 'approved' ? '이 요청을 승인할까요?' : '이 요청을 거절할까요?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setActingId(id);
      await decideChangeRequest(id, nextStatus, user?.displayName || user?.username || '관리자');
      await loadRequests();
      if (typeof onPendingUpdate === 'function') {
        const pendingData = await fetchChangeRequests('pending');
        onPendingUpdate((pendingData.requests || []).length);
      }
      if (typeof onRefreshTemplates === 'function') {
        onRefreshTemplates();
      }
    } catch (err) {
      console.error(err);
      window.alert(err.message || '요청 처리에 실패했어요.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="change-panel">
      <div className="change-panel__header">
        <h3>🔁 수정 요청 관리</h3>
        <div className="change-panel__filters">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="pending">승인 대기</option>
            <option value="approved">승인 완료</option>
            <option value="rejected">거절됨</option>
            <option value="all">전체 보기</option>
          </select>
          <button type="button" onClick={loadRequests} disabled={loading}>
            새로고침
          </button>
        </div>
      </div>

      {error && <div className="change-panel__error">{error}</div>}

      <div className="change-panel__list">
        {loading ? (
          <div className="change-panel__item">불러오는 중...</div>
        ) : requests.length === 0 ? (
          <div className="change-panel__item">표시할 요청이 없어요.</div>
        ) : (
          requests.map((request) => {
            const templateName = templateNameById.get(request.templateId) || `템플릿 #${request.templateId}`;
            const statusLabel = statusLabels[request.status] || request.status;
            const dayLabel = DAY_LABELS[request.dayOfWeek] ?? `${request.dayOfWeek}일차`;
            const payloadText = prettyPayload(request.payload);

            return (
              <div key={request.id} className={`change-panel__item change-panel__item--${request.status}`}>
                <div className="change-panel__meta">
                  <span className="change-panel__badge">{statusLabel}</span>
                  <div>
                    <strong>{templateName}</strong>
                    <span>
                      {dayLabel} · {request.timeLabel}
                    </span>
                  </div>
                </div>
                <div className="change-panel__details">
                  <p>
                    <strong>요청자:</strong> {request.requestedBy}
                  </p>
                  <p>
                    <strong>요청 ID:</strong> {request.id}
                  </p>
                  <pre>{payloadText}</pre>
                  {request.decidedBy && (
                    <p className="change-panel__decided">
                      처리자: {request.decidedBy} / 처리 시간: {request.decidedAt ? new Date(request.decidedAt).toLocaleString() : '-'}
                    </p>
                  )}
                </div>
                {request.status === 'pending' && (
                  <div className="change-panel__actions">
                    <button
                      type="button"
                      className="approve"
                      onClick={() => handleDecision(request.id, 'approved')}
                      disabled={actingId === request.id}
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      className="reject"
                      onClick={() => handleDecision(request.id, 'rejected')}
                      disabled={actingId === request.id}
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChangeRequestPanel;
