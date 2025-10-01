import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchChangeRequests, acknowledgeChangeRequest } from '../api/changeRequests';
import './ChangeNotifications.css';

function ChangeNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const displayName = user?.displayName || user?.username;

  const load = useCallback(async () => {
    if (!user || (user.role !== 'teacher' && user.role !== 'manager')) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const [approved, rejected] = await Promise.all([
        fetchChangeRequests('approved'),
        fetchChangeRequests('rejected')
      ]);

      const mine = [...(approved.requests || []), ...(rejected.requests || [])]
        .filter((item) => !item.acknowledgedAt)
        .filter((item) => (item.requestedBy || '').trim() === (displayName || '').trim())
        .sort((a, b) => new Date(b.decidedAt || 0) - new Date(a.decidedAt || 0))
        .slice(0, 5);

      setItems(mine);
      if (mine.length > 0) {
        setVisible(true);
      }
    } catch (error) {
      console.error('알림 로드 실패', error);
    } finally {
      setLoading(false);
    }
  }, [displayName, user]);

  useEffect(() => {
    load();
    if (!user) return undefined;

    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load, user]);

  if (!user || items.length === 0 || !visible) return null;

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeChangeRequest(id);
      await load();
    } catch (error) {
      console.error('읽음 처리 실패', error);
    }
  };

  return (
    <div className="change-toast">
      <div className="change-toast__header">
        <span>🛎️ 최근 승인/거절 소식 {loading ? '(새로고침 중...)' : ''}</span>
        <button type="button" onClick={() => setVisible(false)}>닫기</button>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={`change-toast__item change-toast__item--${item.status}`}>
            <strong>{item.status === 'approved' ? '승인' : '거절'}</strong>
            <span>
              {item.dayOfWeek + 1}일차 · {item.timeLabel}
              {' · '}
              {item.decidedAt ? new Date(item.decidedAt).toLocaleString() : ''}
            </span>
            {item.decidedBy && <em>처리자: {item.decidedBy}</em>}
            <button type="button" onClick={() => handleAcknowledge(item.id)}>
              확인했어요
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChangeNotifications;
