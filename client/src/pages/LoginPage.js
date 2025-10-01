import React, { useState } from 'react';
import './LoginPage.css';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login, error, setError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError(null);
    setLoading(true);

    try {
      const user = await login(username, password);
      setMessage(`안녕하세요, ${user.displayName || user.username}님! 😊`);
    } catch (err) {
      setMessage(err.message || '로그인에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>진진영어학원</h1>
          <p>400명의 시간을 지켜주는 우리만의 시간표 💙</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">아이디</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="예: hyunT"
            autoComplete="username"
            required
          />

          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {message && <div className="login-message">{message}</div>}
        {error && <div className="login-error">{error}</div>}

        <div className="login-footer">
          <p>계정은 관리자에게 문의해 주세요. 🔒</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
