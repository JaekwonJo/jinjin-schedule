import React, { useState, useEffect } from 'react';
import './App.css';
import ScheduleGrid from './components/ScheduleGrid';

function App() {
  const [serverStatus, setServerStatus] = useState('확인 중...');

  // 서버 연결 확인
  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => {
        setServerStatus(`서버 연결 성공! (${data.message})`);
      })
      .catch(err => {
        setServerStatus('서버 연결 실패');
        console.error(err);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📅 진진영어 시간표</h1>
        <p className="server-status">{serverStatus}</p>
      </header>

      <main className="App-main">
        <ScheduleGrid />
      </main>
    </div>
  );
}

export default App;
