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
1. ScheduleGrid 상태 구조를 API 스키마에 맞게 정리하고 더미 데이터를 교체하기
2. 템플릿 생성/선택 UI 초안을 만들고 `/api/templates` 연동하기
3. 수정 요청 리스트 화면 뼈대를 만들고 `/api/change-requests` 데이터로 확인하기

---

**작업 시간**: 약 4시간
**기분**: 신남! 빠르게 진행 중! 🔥

---

*다음 날 작업 시 여기에 계속 추가할게요!*
