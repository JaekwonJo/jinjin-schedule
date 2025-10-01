# 진진영어 시간표 (JinJin Schedule)

> 400명 학생 시간표를 **빠르고 정확하게** 관리하기 위한 웹 프로젝트

## 🗺️ 지금 어디까지 왔나요?
- ✅ Express 서버가 `/api/health` 엔드포인트로 정상 동작합니다.
- ✅ React 19 기반의 격자형 시간표 프로토타입(UI)까지 만들어졌어요.
- 🚧 프론트·백 동시 실행 스크립트, DB 연동, 승인/이력 기능은 이제 막 시작합니다.

## ✨ 주요 기능 로드맵
- [x] 격자형 시간표 기본 UI (요일/시간대 + 학생 입력)
- [ ] 시간대 자유 추가/삭제 데이터 영속화
- [ ] 여러 시간표 템플릿 저장/불러오기
- [ ] 수정 요청 → 관리자 승인 + 이메일·웹 알림
- [ ] 변경 이력 자동 기록 및 복구
- [ ] 학생 정보 관리 + 스마트 알림(중복·누락)
- [ ] PDF/카카오톡 공유용 출력
- [ ] 구글시트 데이터 일괄 가져오기

## 🛠️ 기술 스택
- **Frontend**: React 19, 향후 react-beautiful-dnd
- **Backend**: Node.js + Express 5
- **Database(예정)**: SQLite → 추후 PostgreSQL 업그레이드
- **이메일(예정)**: Nodemailer

## 🚀 실행 방법 (현재 기준)
```bash
# 1) 의존성 설치
npm install

# 2) 서버만 먼저 실행 (포트 5000)
npm run server
```

> ⚠️ `npm run client`, `npm run dev` 스크립트는 `client/` 폴더 구조 정리 중이라 바로 실행되지 않아요. 다음 단계에서 수정 예정입니다.

React UI를 확인하고 싶다면, 우선 코드 구조를 정리한 뒤 `create-react-app` 레이아웃처럼 루트에서 실행하도록 손보는 작업이 필요합니다.

## 📂 프로젝트 구조
```
jinjin-schedule/
├── client/            # React UI 소스 (src, public 등)
│   ├── src/
│   │   ├── components/   # ScheduleGrid 등 UI 컴포넌트
│   │   └── pages/        # 향후 페이지 구성 예정
│   └── public/
├── server/            # Express 서버 코드
│   ├── routes/        # API 라우트 (예정)
│   └── models/        # DB 모델 (예정)
├── docs/              # 추가 문서 (요구사항 등)
├── BUILDLOG.md        # 날짜별 개발 일지
├── PROJECT_STATE.md   # 현재 진행 현황 요약
├── README.md          # 이 문서
└── CLAUDE.md          # AI 팀원용 상세 기획서
```

## 📖 참고 문서
- [CLAUDE.md](./CLAUDE.md) — 프로젝트 비전과 세부 요구사항
- [PROJECT_STATE.md](./PROJECT_STATE.md) — 진행 상황과 다음 할 일
- [BUILDLOG.md](./BUILDLOG.md) — 하루하루의 기록

## 👥 만든 사람들
- 진진영어 원장님 + AI 팀원 (Codex & Claude)

---

**시작일**: 2025-10-01
**목표**: 꼭 필요한 핵심 기능을 며칠 안에 완성하기! 🚀
