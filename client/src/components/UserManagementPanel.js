import React, { useEffect, useState } from 'react';
import { fetchUsers, updateUserStatus, resetUserPassword } from '../api/users';
import './UserManagementPanel.css';

const roleLabel = {
  teacher: '선생님',
  manager: '관리 선생님',
  superadmin: '최고 관리자'
};

function UserManagementPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setUsers(data.users ?? []);
    } catch (err) {
      console.error(err);
      setError(err.message || '계정 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId, role = 'teacher') => {
    try {
      setUpdatingId(userId);
      await updateUserStatus(userId, { isActive: true, role });
      await loadUsers();
    } catch (err) {
      window.alert(err.message || '승인에 실패했어요.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      setUpdatingId(userId);
      await updateUserStatus(userId, { isActive: false });
      await loadUsers();
    } catch (err) {
      window.alert(err.message || '비활성화에 실패했어요.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    try {
      setUpdatingId(userId);
      await updateUserStatus(userId, { role: nextRole });
      await loadUsers();
    } catch (err) {
      window.alert(err.message || '역할 변경에 실패했어요.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = window.prompt('새 비밀번호를 입력하세요 (8자 이상 추천)');
    if (!newPassword) return;

    try {
      setUpdatingId(userId);
      await resetUserPassword(userId, newPassword);
      window.alert('비밀번호가 초기화되었어요. 새 비밀번호를 전달해 주세요!');
    } catch (err) {
      window.alert(err.message || '비밀번호 초기화에 실패했어요.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="user-panel">
      <div className="user-panel__header">
        <h3>🧑‍🏫 계정 관리</h3>
        <button type="button" onClick={loadUsers} disabled={loading}>
          새로고침
        </button>
      </div>

      {error && <div className="user-panel__error">{error}</div>}

      <div className="user-panel__table">
        <div className="user-panel__row user-panel__row--head">
          <span>아이디</span>
          <span>표시 이름</span>
          <span>역할</span>
          <span>상태</span>
          <span>생성일</span>
          <span>작업</span>
        </div>
        {loading ? (
          <div className="user-panel__row">
            <span className="user-panel__loading">불러오는 중...</span>
          </div>
        ) : (
          users.map((user) => {
            const created = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-';
            const isPending = !user.isActive;
            const isSuperadmin = user.role === 'superadmin';

            return (
              <div key={user.id} className="user-panel__row">
                <span>{user.username}</span>
                <span>{user.displayName || '-'}</span>
                <span>
                  <select
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    disabled={isSuperadmin || updatingId === user.id}
                  >
                    <option value="teacher">선생님</option>
                    <option value="manager">관리 선생님</option>
                    <option value="superadmin">최고 관리자</option>
                  </select>
                </span>
                <span className={user.isActive ? 'status-badge status-badge--active' : 'status-badge status-badge--pending'}>
                  {user.isActive ? '활성' : '승인 대기'}
                </span>
                <span>{created}</span>
                <span className="user-panel__actions">
                  {isSuperadmin ? (
                    <em>변경 불가</em>
                  ) : (
                    <>
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(user.id, 'teacher')}
                            disabled={updatingId === user.id}
                          >
                            선생님 승인
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(user.id, 'manager')}
                            disabled={updatingId === user.id}
                          >
                            관리자 승인
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(user.id)}
                          disabled={updatingId === user.id}
                        >
                          비활성화
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleResetPassword(user.id)}
                        disabled={updatingId === user.id}
                      >
                        비밀번호 초기화
                      </button>
                    </>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UserManagementPanel;
