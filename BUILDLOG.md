# 🔨 BUILDLOG.md - 진진영어 시간표 개발 일지

## 2025-10-01 (Day 1) - 프로젝트 시작! 🚀

### 🎯 오늘의 목표
- [x] 프로젝트 초기 세팅
- [x] 문서 작성 & 정리
- [x] 기본 서버 구성
- [x] 기본 React 앱 세팅

### ✅ 완료한 작업

#### 1. 프로젝트 생성 & 환경 세팅
- Desktop에 `jinjin-schedule` 폴더 생성, npm 초기화
- 핵심 패키지 설치 (React 19, Express 5, SQLite 등)
- `npm run dev`용 concurrently 스크립트 초안 추가

#### 2. 서버 베이스 구축
- `server/server.js` 작성, Express 앱 구성
- `/api/health` 헬스체크로 서버 상태 확인 가능
- CORS/Body-parser 기본 설정 완료

#### 3. 프론트엔드 베이스 구축
- `client/` 폴더 구조 마련 (`src`, `public`)
- `App` 컴포넌트에서 서버 헬스체크 결과 표시
- `ScheduleGrid` 컴포넌트로 시간표 격자/시간대 추가·삭제 프로토타입 구현

#### 4. 문서 정리
- README / PROJECT_STATE / BUILDLOG / CLAUDE 초안 작성
- 진행 상태, 우선순위, 다음 단계 재정리

#### 5. 실행 환경 다듬기
- 루트와 `client/` 패키지를 분리하고 `npm run dev`, `npm run client:install` 스크립트 정비
- CRA 환경에서 프론트 빌드/실행이 가능하도록 `client/package.json` 구성

#### 6. 데이터 & API 뼈대
- SQLite 스키마(`templates`, `schedule_entries`, `change_requests`) 설계 및 마이그레이션 자동화
- 템플릿/시간표/수정요청 API 라우트 초안(`GET/POST/PUT/PATCH`) 구현
- `sqlite3` 모듈 네이티브 빌드 이슈 해결 (`npm rebuild sqlite3 --build-from-source`)

#### 7. CSV 분석
- 9월 29일 이후 시간표 CSV 구조 파악 (10열, 요일/강의실/학생명 패턴)
- 임포트 전략을 `docs/data-import-plan.md`로 문서화

#### 8. 로그인/권한 설계
- 역할별 로그인 흐름을 `docs/auth/login-flow.md`에 정리 (선생님/관리 선생님/최고 관리자)
- 세션 유지 시간 24시간, 토큰 기반 인증 계획 수립

#### 9. 프론트 구조 리팩터링
- `TemplateContext`로 템플릿·시간표를 중앙에서 관리하고 API 연동 준비
- `TemplateHeader` 컴포넌트로 템플릿 선택/이름 수정/저장 흐름 초안 구현
- ScheduleGrid가 컨텍스트 데이터를 사용하도록 리팩터링

### 💡 배운 점
- WSL 환경에서는 `sqlite3`가 처음엔 바이너리를 찾지 못하므로 수동 리빌드가 필요
- CSV가 병합셀 기반이라 열/행 해석 로직을 custom 하게 짜야 함 → 파싱 단계에서 시간/선생님 캐싱이 중요
- 프론트/백을 분리하면 실행 흐름이 훨씬 명확해져 협업/배포 모두 편해짐

### 🤔 어려웠던 점
- `sqlite3` 네이티브 바인딩이 바로 설치되지 않아 1회 빌드 과정이 필요했음
- CSV 안의 추가 열(8,9)의 용도를 파악하는 데 시간이 조금 걸렸음

### 📝 메모
- 1순위: **시간표 UI ↔ API 연동**
- 2순위: **템플릿 선택/저장 UX**
- 3순위: **수정 요청 리스트/승인 화면 뼈대**

### 다음 단계
1. `/api/auth/login` 구현과 프론트 로그인 화면 연결
2. 수정 요청 로그 화면 뼈대를 만들고 `/api/change-requests` 데이터 연동
3. 시간표 저장 시 교실/비고(notes) 구조 설계

---

**작업 시간**: 약 4시간
**기분**: 신남! 빠르게 진행 중! 🔥

---

*다음 날 작업 시 여기에 계속 추가할게요!*

## 2025-10-02 (Day 2) - 계정/인증 뼈대 구축 💪

### 🎯 오늘의 목표
- [x] 관리자 계정 발급 구조 현실화 (아이디/비밀번호 기반)
- [x] JWT 인증 미들웨어로 API 접근 제어
- [ ] 프론트 로그인 화면 연결 (다음 단계)

### ✅ 완료한 작업

#### 1. 환경 변수 & 설정 모듈
- `server/config.js`에서 `.env`를 불러오고 기본값/경고 로직 추가
- JWT 시크릿, 비밀번호 솔트 횟수, 슈퍼관리자 정보 등을 한곳에서 관리

#### 2. DB 사용자 테이블 & 시드
- `users` 테이블 생성 (username, role, password_hash 등)
- 슈퍼관리자 계정을 자동으로 만들어주는 시드 로직 추가 (env 기본값 사용)

#### 3. 인증 미들웨어 & 토큰
- `server/middleware/auth.js`에 JWT 발급/검증/역할 체크 구현
- 모든 주요 API에 로그인 필수/역할 제한을 적용

#### 4. 인증 & 계정 API
- `POST /api/auth/login`으로 아이디+비밀번호 로그인 구현
- `GET/POST/PATCH /api/users`로 슈퍼관리자가 계정 생성/비활성/비번 초기화 가능
- 템플릿/수정요청 API에 manager/superadmin 전용 권한 적용

### 💡 배운 점
- 초기 개발 단계에서는 기본값을 넣되, 경고를 띄워두면 실수로 배포하는 일을 막을 수 있다.
- 계정 기반으로 바꾸면서 API 구성이 조금 복잡해졌지만, 이후 확장(학생용 앱 등)에 큰 도움이 됨!

### 🤔 어려웠던 점
- JWT/비밀번호 로직을 추가하면서 기존 API와 충돌하지 않도록 경로/미들웨어 순서를 신경써야 했다.

### 📝 메모
- 프론트 로그인 페이지를 붙이면 이제 시간표 화면도 로그인 후에만 접근 가능하게 만들 수 있다.
- 계정 관리 UI는 superadmin만 볼 수 있도록 별도 페이지로 빼기.

### 다음 단계
1. 로그인 페이지 + 인증 컨텍스트 구현
2. 수정 요청 로그 화면 설계/연동
3. 시간표 `notes` 구조 설계 (교실, 비고 분리)

---

**작업 시간**: 약 3시간
**기분**: 탄탄한 기반을 갖췄다! 🔐

---

### 추가 진행 사항 (동일 Day 2)
- [x] 감성 로그인 페이지(UI) 완성 및 AuthProvider 연결
- [x] 토큰 자동 헤더 첨부 & 로그인 사용자만 시간표 접근하도록 보호
- [x] 권한에 따라 템플릿 생성/저장 버튼 자동 비활성화
- [x] 프론트 `.env` 안내 및 README 업데이트
- [x] 선생님 자체 가입 API + 가입 폼(승인 대기)
- [x] superadmin 계정 관리 패널(UI)로 승인/역할 변경/비번 초기화 흐름 구현
- [x] 수정 요청 로그 패널에서 승인/거절 버튼으로 실시간 대응
- [x] 셀 편집 모달로 학생/메모 색상까지 관리하고, 선생님이 직접 요청 작성
- [x] 승인/거절 알림 토스트·배지·읽음 처리 + 이메일 발송 스텁 준비
- [x] 인쇄 미리보기 모달에 학원 로고/일요일 강조 컬럼 추가
- [x] 선생님 요청 히스토리 패널 및 검색/필터 기능

**추가 작업 시간**: 약 2.5시간
**기분**: 드디어 로그인부터 시간표까지 한 줄! 😎

---

## 2025-10-02 (Evening) - UX 마감 점검 🌙

- 오류: 셀 편집 시 학생 색상을 저장하지 못함 → 원인: DB/Context 구조에 색상 필드 부재 → 해결: `schedule_entries.color` 컬럼 추가 후 Context/모달에 동기화 → 수정파일: `server/db.js`, `server/routes/templates.js`, `client/src/context/TemplateContext.js`, `client/src/components/ScheduleGrid.js`, `client/src/components/modals/EditCellModal.js`
- 오류: 인쇄본에 학원 브랜드와 일요일 강조가 빠짐 → 원인: 기존 미리보기 템플릿 부족 → 해결: 로고 이미지 추가하고 일요일 컬럼 스타일링 → 수정파일: `client/public/logo-jinjin.png`, `client/src/components/modals/PrintPreviewModal.js`, `client/src/components/modals/PrintPreviewModal.css`
- 오류: 승인/거절 알림이 선생님에게 누적되지 않음 → 원인: 읽음 처리 API 부재 → 해결: `PATCH /acknowledge` 추가 후 토스트에서 호출 → 수정파일: `server/routes/changeRequests.js`, `client/src/api/changeRequests.js`, `client/src/components/ChangeNotifications.js`
- 오류: 선생님이 과거 요청을 조회할 방법 없음 → 원인: UI 미구현 → 해결: 요청 히스토리 패널 구현 및 TemplateHeader에 연결 → 수정파일: `client/src/components/ChangeHistoryPanel.js`, `client/src/components/TemplateHeader.js`
- 작업 메모: 문서(README/PROJECT_STATE/BUILDLOG)에 SMTP 설정과 오늘 변경 사항을 동기화하여 기록

## 2025-10-03 (Day 3) - 출력·알림 다듬기 ✨

- 오류: 인쇄 미리보기에서 색상 전설이 흐트러짐 → 원인: 리스트 레이아웃이 고정 폭이 아님 → 해결: CSS로 컬럼 정렬·간격을 재정비 → 수정파일: `client/src/components/modals/PrintPreviewModal.css`
- 오류: 셀 편집 시 학생/비고/색상을 따로 저장해야 했음 → 원인: 모달 폼이 분리 → 해결: 단일 폼으로 통합하고 Context 저장 로직을 정리 → 수정파일: `client/src/components/modals/EditCellModal.js`, `client/src/context/TemplateContext.js`
- 오류: 승인/거절 후 선생님 화면에 알림 표시가 늦음 → 원인: 토스트/배지 상태 공유 미흡 → 해결: `ChangeNotifications`에서 읽음 처리와 배지 카운터를 동기화 → 수정파일: `client/src/components/ChangeNotifications.js`, `client/src/context/NotificationContext.js`
- 오류: SMTP 설정을 확인할 수단이 없었음 → 원인: 테스트 엔드포인트 부재 → 해결: `POST /api/notifications/test` 추가 후 헤더 버튼과 성공/실패 안내 배너를 연결 → 수정파일: `server/routes/notifications.js`, `client/src/api/notifications.js`, `client/src/components/TemplateHeader.js`
- 오류: 요청 히스토리에서 원하는 기록을 찾기 어려움 → 원인: 필터 UI 미흡 → 해결: 상태·템플릿·기간 필터와 검색창을 추가하고 최근 값을 저장 → 수정파일: `client/src/components/ChangeHistoryPanel.js`, `client/src/components/ChangeHistoryPanel.css`, `client/src/components/TemplateHeader.css`
