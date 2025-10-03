import React, { useState } from 'react';
import './LoginPage.css';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login, signup, error, setError } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isSignup = mode === 'signup';

  const resetFields = () => {
    setUsername('');
    setPassword('');
    setDisplayName('');
    setMessage('');
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        await signup({ username, password, displayName });
        setMessage('가입 요청이 접수되었어요! 승인 후 로그인할 수 있어요. 😊');
        setMode('login');
        setPassword('');
      } else {
        const user = await login(username, password);
        setMessage(`안녕하세요, ${user.displayName || user.username}님! 😊`);
      }
    } catch (err) {
      setMessage(err.message || (isSignup ? '가입에 실패했어요. 다시 시도해 주세요.' : '로그인에 실패했어요. 다시 시도해 주세요.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>진진영어학원</h1>
          <p>진진을 지켜주는 우리만의 시간표 💙</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">아이디</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="예: jinjinT"
            autoComplete="username"
            required
          />

          {isSignup && (
            <>
              <label htmlFor="displayName">이름 또는 표시 이름</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="예: 현T"
              />
            </>
          )}

          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? '처리 중...' : isSignup ? '가입 요청 보내기' : '로그인'}
          </button>
        </form>

        {message && <div className="login-message">{message}</div>}
        {error && <div className="login-error">{error}</div>}

        <div className="login-footer">
          {isSignup ? (
            <>
              <p>이미 계정이 있나요?</p>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setMode('login');
                  resetFields();
                }}
              >
                로그인 화면으로 돌아가기
              </button>
            </>
          ) : (
            <>
              <p>처음 오셨나요? 😊</p>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setMode('signup');
                  resetFields();
                }}
              >
                가입 요청 보내기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
