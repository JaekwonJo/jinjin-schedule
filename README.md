# 진진영어 시간표 (JinJin Schedule)

> 400명 학생 시간표를 **빠르고 정확하게** 관리하기 위한 웹 프로젝트

## 🗺️ 지금 어디까지 왔나요?
- ✅ Express 서버 + SQLite 기반 API 뼈대(`/api/templates`, `/api/change-requests`) 준비 완료
- ✅ React 19 시간표 프로토타입을 `client/` 패키지로 분리하고 실행 스크립트 정리
- ✅ 템플릿/시간표 상태를 중앙에서 관리하는 React 컨텍스트(`TemplateContext`) 구축
- ✅ 로그인·권한 구조 초안 문서화 (`docs/auth/login-flow.md`)
- ✅ CSV 원본(9월 29일 이후) 구조를 분석하고 임포트 전략 문서화
- 🚧 React UI와 API 연결, 승인/이력 흐름은 이제 막 시작합니다.

## ✨ 주요 기능 로드맵
- [x] 격자형 시간표 기본 UI (요일/시간대 + 학생 입력)
- [x] 백엔드 실행 환경 + SQLite 스키마
- [ ] 시간대 자유 추가/삭제 데이터 영속화 & 템플릿 CRUD UI 연결
- [ ] 수정 요청 → 관리자 승인 + 이메일·웹 알림
- [ ] 변경 이력 자동 기록 및 복구
- [ ] 학생 정보 관리 + 스마트 알림(중복·누락)
- [ ] PDF/카카오톡 공유용 출력
- [ ] 구글시트/CSV 데이터 일괄 가져오기 스크립트

## 🛠️ 기술 스택
- **Frontend**: React 19 (`client/` 폴더, CRA 기반), 추후 react-beautiful-dnd 추가 예정
- **Backend**: Node.js + Express 5
- **Database**: SQLite (파일 위치 `server/data/jinjin-schedule.sqlite`)
- **이메일(예정)**: Nodemailer

## 🔐 환경 변수 (.env 예시)
프로젝트 루트에 `.env` 파일을 만들고 아래 값을 원하는 값으로 채워 주세요. (없으면 개발용 기본값이 사용되지만, 실제 배포 전에 꼭 바꿔 주세요!)

```
JWT_SECRET=dev-secret-change-me
SUPERADMIN_USERNAME=admin
SUPERADMIN_PASSWORD=admin1234
SUPERADMIN_DISPLAY_NAME=원장님
PASSWORD_SALT_ROUNDS=10
PORT=5001
```

React 개발 서버가 API를 찾을 수 있도록 `client/.env` 파일도 만들어 주세요.

```
REACT_APP_API_BASE=http://localhost:5001
```

## 🚀 실행 방법
```bash
# 1) 루트 의존성 설치
npm install

# 2) 프론트엔드 패키지 의존성 설치 (최초 1회)
npm run client:install

# 3) 프론트+백 동시 실행
npm run dev

# 개별 실행도 가능해요
npm run server   # 백엔드만
npm run client   # 프론트엔드만

# 프로덕션 빌드 (프론트엔드)
npm run build
```
> Tip: `npm run server`가 처음 실패한다면 `npm rebuild sqlite3 --build-from-source`로 네이티브 모듈을 한 번 빌드해 주세요. (WSL/리눅스 환경에서 필요한 작업이에요.)

## 📡 API 초안 (권한 필요)
- `POST /api/auth/signup` — 선생님이 직접 가입 요청 (기본적으로 비활성 상태)
- `POST /api/auth/login` — 아이디/비밀번호 로그인 → JWT 발급 (24시간 유지)
- `GET /api/me` — 현재 로그인한 사용자 정보 확인
- `GET /api/templates` — 템플릿 목록 + 수업 개수 (로그인 필요)
- `POST /api/templates` — 새 템플릿 생성 (manager 이상)
- `PUT /api/templates/:id` — 템플릿 정보 수정 (manager 이상)
- `DELETE /api/templates/:id` — 템플릿 삭제 (manager 이상)
- `GET /api/templates/:id/entries` — 템플릿에 연결된 시간표 조회
- `PUT /api/templates/:id/entries` — 시간표 전체 저장(덮어쓰기) (manager 이상)
- `GET /api/change-requests?status=pending` — 수정 요청 목록 (로그인 필요, 추후 역할별 필터 예정)
- `POST /api/change-requests` — 수정 요청 작성 (선생님)
- `PATCH /api/change-requests/:id/decision` — 승인/거절 처리 (manager 이상)
- `GET /api/users` — 계정 목록 조회 (superadmin 전용)
- `PATCH /api/users/:id/password` — 비밀번호 초기화 (superadmin 전용)
- `PATCH /api/users/:id/status` — 계정 활성/비활성 & 역할 변경 (superadmin 전용)

## 📂 프로젝트 구조
```
jinjin-schedule/
├── client/                # React UI (CRA 구조)
│   ├── package.json
│   ├── public/
│   └── src/
├── server/                # Express + SQLite API
│   ├── data/              # SQLite DB 파일 (자동 생성)
│   ├── db.js              # DB 커넥션 & 스키마 초기화
│   ├── middleware/        # 인증 등 공용 미들웨어
│   ├── routes/            # API 라우터
│   └── server.js
├── docs/                  # 문서 (임포트 계획 등)
├── BUILDLOG.md            # 날짜별 개발 일지
├── PROJECT_STATE.md       # 현재 진행 현황 요약
├── README.md              # 이 문서
└── CLAUDE.md              # AI 팀원용 상세 기획서
```

## 📖 참고 문서
- [CLAUDE.md](./CLAUDE.md) — 프로젝트 비전과 세부 요구사항
- [PROJECT_STATE.md](./PROJECT_STATE.md) — 진행 상황과 다음 할 일
- [BUILDLOG.md](./BUILDLOG.md) — 하루하루의 기록
- [docs/auth/login-flow.md](./docs/auth/login-flow.md) — 로그인/권한 구조 계획
- [docs/data-import-plan.md](./docs/data-import-plan.md) — CSV 데이터 → DB 임포트 전략

## 👥 만든 사람들
- 진진영어 원장님 + AI 팀원 (Codex & Claude)

---

**시작일**: 2025-10-01
**목표**: 꼭 필요한 핵심 기능을 며칠 안에 완성하기! 🚀
