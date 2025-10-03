# 진진영어 시간표 (JinJin Schedule)

> 400명 학생 시간표를 **빠르고 정확하게** 관리하기 위한 웹 프로젝트

## 🗺️ 지금 어디까지 왔나요?
- ✅ Express + SQLite 백엔드와 템플릿/수정요청 API가 안정적으로 동작합니다.
- ✅ React 19 기반 UI와 `TemplateContext`로 시간표/요청 상태를 중앙에서 관리합니다.
- ✅ 선생님 자체 가입 → 관리자 승인 → 로그인 → 시간표 수정 요청 → 승인/거절 알림 흐름이 완성되었습니다.
- ✅ 학원 로고·일요일 강조·색상 전설이 포함된 인쇄 미리보기와 학생 색상 강조, 요청 히스토리 필터까지 제공됩니다.
- ✅ 헤더에서 `/api/notifications/test` 버튼으로 SMTP 설정을 즉석에서 검사할 수 있습니다.
- ✅ 요청 히스토리 필터가 저장되어 다시 접속해도 같은 조건으로 빠르게 찾을 수 있습니다.
- ✅ CSV 업로드(베타)로 구글시트 시간표를 한 번에 불러올 수 있습니다.
- ✅ 학생 이름을 주요 원색으로 강조하고 시간대별 파스텔 배경을 지정할 수 있습니다.
- ✅ 관리자용 알림 로그에서 승인/거절 내역을 바로 확인할 수 있습니다.
- ✅ 셀 선택 모드에서 색상 일괄 변경·복사/붙여넣기·위치 이동을 지원해 대량 편집도 스프레드시트처럼 처리합니다.
- ✅ CSV 다운로드·검증 API로 데이터 왕복 후 누락 여부를 즉시 확인할 수 있습니다.
- 🚧 남은 과제는 PDF/보고서 상세화와 외부 알림(이메일·SMS) 고도화입니다.

## ✨ 주요 기능 로드맵
- [x] 격자형 시간표 기본 UI (요일/시간대 + 학생 입력)
- [x] 백엔드 실행 환경 + SQLite 스키마
- [ ] 시간대 자유 추가/삭제 데이터 영속화 & 템플릿 CRUD UI 연결
- [x] 수정 요청 → 관리자 승인 + 이메일·웹 알림
- [ ] 변경 이력 자동 기록 및 복구
- [ ] 학생 정보 관리 + 스마트 알림(중복·누락)
- [ ] PDF/카카오톡 공유용 출력
- [x] 구글시트/CSV 데이터 일괄 가져오기 (베타 업로드 모달)
- [x] 관리자용 수정 요청 로그 & 승인 패널
- [x] 셀 단위 학생/메모 모달 편집 + 선생님 요청 작성
- [x] 승인 알림 토스트/배지 + 이메일 전송 스텁
- [x] 인쇄 미리보기(PDF 대비) + 학원 로고/일요일 강조
- [x] 선생님 전용 요청 히스토리 & 검색/필터
- [x] 셀 선택 모드 + 색상 일괄 변경 + 복사/붙여넣기 + 위치 이동
- [ ] 드래그 앤 드롭 이동, 자동 확장 등 직관적 범위 편집 UX 마감

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
# (선택) 이메일 알림을 사용하려면 아래 SMTP 값을 채워주세요.
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NOTIFY_FROM=
NOTIFY_TO=
```

React 개발 서버가 API를 찾을 수 있도록 `client/.env` 파일도 만들어 주세요.

```
REACT_APP_API_BASE=http://localhost:5001
```

### 📥 CSV 업로드로 시간표 불러오기 (베타)
1. 구글시트(또는 엑셀)에서 `시간, 담당 선생님, 월, 화, 수, 목, 금, 토, 일` 순서로 헤더를 맞춘 뒤 CSV로 다운로드합니다.
2. 셀 안에서는 첫 줄에 반/비고, 다음 줄부터 학생 이름(쉼표 구분)으로 적어두면 자동으로 메모와 학생이 나뉩니다.
3. 웹앱 상단 `CSV 업로드` 버튼을 눌러 CSV를 선택하고, 교체/추가 방식 중 하나를 고른 뒤 업로드합니다.
4. 업로드 전에 헤더/열 구성을 자동으로 검사해 주며, 오류 시 친절한 메시지로 수정 방향을 안내합니다.
5. 업로드 결과 요약과 경고를 확인한 뒤 필요하면 바로 편집하거나 다시 업로드하면 됩니다.

> 샘플 파일: [`client/public/templates/sample-schedule-template.csv`](client/public/templates/sample-schedule-template.csv)

### ✨ 셀 선택 & 단축키 요약
- `셀 선택 모드`를 켜고 첫 셀을 클릭한 뒤 **Shift+클릭**으로 범위를 지정하거나 **Ctrl/Cmd+클릭**으로 개별 셀을 추가/제거하세요.
- 툴바 버튼 또는 단축키로 손쉽게 편집할 수 있습니다.
  - **색상 팔레트**: 여러 셀의 배경색을 한 번에 변경
  - **복사(Ctrl/Cmd+C)** → **붙여넣기(Ctrl/Cmd+V)**: 학생/메모/색상까지 그대로 복사
  - **위치 이동**: 기준 시간·요일을 입력하면 상대 위치를 유지한 채 이동 (충돌 시 덮어쓰기 여부 확인)
  - **Esc** 또는 `선택 해제` 버튼: 현재 선택을 빠르게 초기화

### 🎨 색상/스타일 빠르게 설정하기
- 학생 편집 모달에서 각 학생별로 **정해진 주요 원색**(빨강/주황/노랑/민트/블루/퍼플 등)을 지정할 수 있습니다.
- 시간대 오른쪽의 셀렉트 박스로 **파스텔톤 시간대 배경색**을 선택하면, 전체 보기·인쇄본 모두 동일하게 강조됩니다.
- 승인/거절 이력은 “알림 로그” 패널에서 언제든지 다시 확인할 수 있어요.

### ✉️ 이메일 테스트 방법
1. 위 `.env`에 SMTP 정보를 채운 뒤 `npm run dev`로 서버를 재시작합니다.
2. superadmin 계정으로 로그인하여 우측 상단의 `테스트 메일 보내기` 버튼을 클릭합니다.
3. 성공하면 "테스트 메일을 보냈어요!" 알림이 뜨고, 실패하면 원인 메시지가 표시됩니다.
4. API로 직접 확인하려면 아래 명령을 사용할 수 있어요.
   ```bash
   curl -X POST http://localhost:5001/api/notifications/test \
     -H "Authorization: Bearer <슈퍼관리자 토큰>"
   ```
   토큰은 로그인 후 개발자 도구(네트워크 탭)에서 확인하거나 프론트엔드 콘솔에 출력된 값을 활용하세요.

### 📧 네이버 메일 SMTP 설정 방법 (선택)
1. 네이버 메일 → 환경설정 → **POP3/IMAP**에서 IMAP/SMTP 사용을 “사용함”으로 변경합니다.
2. 같은 화면에서 2단계 인증을 켠 뒤, **애플리케이션 비밀번호 생성**으로 이동합니다.
   - 종류 선택을 `직접 입력`으로 두고 예: `jinjin-schedule`을 입력 후 생성하기를 누릅니다.
   - 12자리 대문자/숫자 비밀번호가 표시되며, 이 값이 `.env`의 `SMTP_PASS`가 됩니다.
3. `.env`를 아래 예시처럼 채웁니다.
   ```
   SMTP_HOST=smtp.naver.com
   SMTP_PORT=465
   SMTP_USER=네이버아이디@naver.com
   SMTP_PASS=위에서 생성한 12자리 비밀번호
   NOTIFY_FROM=네이버아이디@naver.com
   NOTIFY_TO=알림을 받을 주소 (여러 개면 콤마로 구분)
   ```
4. 서버를 재시작하면 `server/services/notifier.js`가 승인/거절 시 자동으로 이메일을 전송합니다. (환경 변수를 비워두면 콘솔 로그만 남아요.)

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
