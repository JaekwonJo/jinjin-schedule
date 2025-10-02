import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchChangeRequests } from '../api/changeRequests';
import './ChangeHistoryPanel.css';

function ChangeHistoryPanel({ dayLabels, templates }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const [pending, approved, rejected] = await Promise.all([
          fetchChangeRequests('pending'),
          fetchChangeRequests('approved'),
          fetchChangeRequests('rejected')
        ]);
        const displayName = user.displayName || user.username;
        const mine = [...(pending.requests || []), ...(approved.requests || []), ...(rejected.requests || [])]
          .filter((item) => (item.requestedBy || '').trim() === displayName.trim())
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setItems(mine);
      } catch (err) {
        console.error(err);
        setError(err.message || '요청 기록을 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const filteredItems = useMemo(() => {
    const start = dateFrom ? new Date(dateFrom).getTime() : null;
    const end = dateTo ? new Date(dateTo).getTime() : null;
    const lower = keyword.trim().toLowerCase();

    return items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (templateFilter !== 'all' && Number(templateFilter) !== item.templateId) return false;
      if (start && new Date(item.createdAt || 0).getTime() < start) return false;
      if (end && new Date(item.createdAt || 0).getTime() > end + 86_400_000) return false;
      if (lower) {
        const payloadText = JSON.stringify(item.payload || {}).toLowerCase();
        if (!payloadText.includes(lower) && !(item.timeLabel || '').toLowerCase().includes(lower)) {
          return false;
        }
      }
      return true;
    });
  }, [items, statusFilter, templateFilter, keyword, dateFrom, dateTo]);

  if (!user) return null;

  return (
    <div className="history-panel">
      <h3>📜 내 요청 기록</h3>
      <div className="history-filters">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">전체 상태</option>
          <option value="pending">대기</option>
          <option value="approved">승인</option>
          <option value="rejected">거절</option>
        </select>
        <select value={templateFilter} onChange={(event) => setTemplateFilter(event.target.value)}>
          <option value="all">모든 템플릿</option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
        <input
          type="search"
          placeholder="요청 내용 검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>
      {error && <div className="history-error">{error}</div>}
      {loading ? (
        <p>불러오는 중...</p>
      ) : filteredItems.length === 0 ? (
        <p>아직 보낸 요청이 없어요.</p>
      ) : (
        <ul>
          {filteredItems.map((item) => {
            const dayLabel = dayLabels[item.dayOfWeek] ?? `${item.dayOfWeek}일차`;
            return (
              <li key={item.id} className={`history-item history-item--${item.status}`}>
                <header>
                  <strong>{item.status === 'pending' ? '대기 중' : item.status === 'approved' ? '승인됨' : '거절됨'}</strong>
                  <span>
                    {dayLabel} · {item.timeLabel}
                  </span>
                </header>
                <pre>{JSON.stringify(item.payload || {}, null, 2)}</pre>
                <footer>
                  <span>작성: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</span>
                  {item.decidedBy && (
                    <span>처리자: {item.decidedBy} / {item.decidedAt ? new Date(item.decidedAt).toLocaleString() : '-'}</span>
                  )}
                </footer>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ChangeHistoryPanel;
