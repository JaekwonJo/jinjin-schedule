# 진진영어 시간표 (JinJin Schedule)

> 400명 학생의 복잡한 시간표를 스마트하게 관리하는 웹 시스템

## 📌 프로젝트 소개

진진영어 학원의 시간표 관리를 위한 웹 애플리케이션입니다.
기존 구글시트의 한계를 극복하고, 변경 추적·복구·알림 기능을 제공합니다.

## ✨ 주요 기능

- 📅 **격자형 시간표**: 월~일, 자유로운 시간대 설정
- 🔄 **변경 이력 추적**: 모든 수정 내역 자동 저장 및 복구
- 📋 **다중 템플릿**: 정규/시험대비 등 여러 시간표 관리
- 👥 **권한 관리**: 선생님 수정 요청 → 관리자 승인
- 🔔 **스마트 알림**: 중복 배정·누락 자동 감지
- 🖨️ **인쇄/공유**: PDF 다운로드, 카카오톡 공유

## 🛠️ 기술 스택

- **Frontend**: React 19
- **Backend**: Node.js + Express
- **Database**: SQLite
- **UI**: 드래그앤드롭, 반응형 디자인

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프론트엔드만 실행
npm run client

# 백엔드만 실행
npm run server
```

## 📂 프로젝트 구조

```
jinjin-schedule/
├── client/           # React 프론트엔드
│   ├── src/
│   │   ├── components/  # 재사용 컴포넌트
│   │   └── pages/       # 페이지 컴포넌트
│   └── public/
├── server/           # Node.js 백엔드
│   ├── routes/      # API 라우트
│   └── models/      # 데이터 모델
├── docs/            # 문서
└── CLAUDE.md        # AI 팀원용 상세 문서
```

## 📖 문서

- [CLAUDE.md](./CLAUDE.md) - 프로젝트 상세 기획 및 개발 가이드
- [PROJECT_STATE.md](./PROJECT_STATE.md) - 현재 진행 상황
- [BUILDLOG.md](./BUILDLOG.md) - 개발 일지

## 👤 개발자

진진영어 원장님 & Claude Code (AI 팀원)

## 📝 라이선스

ISC

---

**시작일**: 2025-10-01
**목표**: 며칠 안에 빠르게 완성! 🚀
