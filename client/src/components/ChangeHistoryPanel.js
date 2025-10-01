import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchChangeRequests } from '../api/changeRequests';
import './ChangeHistoryPanel.css';

function ChangeHistoryPanel({ dayLabels }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (!user) return null;

  return (
    <div className="history-panel">
      <h3>📜 내 요청 기록</h3>
      {error && <div className="history-error">{error}</div>}
      {loading ? (
        <p>불러오는 중...</p>
      ) : items.length === 0 ? (
        <p>아직 보낸 요청이 없어요.</p>
      ) : (
        <ul>
          {items.map((item) => {
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
