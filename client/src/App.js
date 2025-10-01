import React, { useEffect, useState } from 'react';
import './App.css';
import ScheduleGrid from './components/ScheduleGrid';
import TemplateHeader from './components/TemplateHeader';
import { TemplateProvider, useTemplate } from './context/TemplateContext';

function HealthStatus() {
  const [statusText, setStatusText] = useState('연결 확인 중...');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((data) => {
        setStatusText(`서버 연결 성공! (${data.message})`);
      })
      .catch(() => {
        setStatusText('서버 연결 실패 😢 서버를 먼저 실행해 주세요.');
      });
  }, []);

  return <p className="server-status">{statusText}</p>;
}

function ErrorBanner() {
  const { error } = useTemplate();

  if (!error) return null;
  return (
    <div className="error-banner">
      ⚠️ {error}
    </div>
  );
}

function Dashboard() {
  const { loading } = useTemplate();

  return (
    <div className="dashboard">
      <TemplateHeader />
      <ErrorBanner />
      {loading && <div className="loading">불러오는 중...</div>}
      <ScheduleGrid />
    </div>
  );
}

function App() {
  return (
    <TemplateProvider>
      <div className="App">
        <header className="App-header">
          <h1>📅 진진영어 시간표</h1>
          <HealthStatus />
        </header>

        <main className="App-main">
          <Dashboard />
        </main>
      </div>
    </TemplateProvider>
  );
}

export default App;
