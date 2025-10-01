# 📊 PROJECT_STATE.md - 진진영어 시간표 현황

**마지막 업데이트**: 2025-10-02 03:10 (KST)

## 🎯 전체 진행률: 55%
- 서버·프론트 실행 환경, DB/인증 뼈대, 로그인/가입/승인 흐름이 연결됐어요.
- 이제 승인 요청 로그 및 시간표 메모 구조만 정리하면 1차 목표에 근접합니다.

---

## ✅ 완료된 작업

### 2025-10-01
- [x] 루트/클라이언트 npm 스크립트 분리 (`npm run dev`, `npm run client:install` 등)
- [x] `client/` 전용 CRA 패키지 구성 (`package.json`, 실행 스크립트)
- [x] Express + SQLite 연결 및 기본 스키마(`templates`, `schedule_entries`, `change_requests`)
- [x] 템플릿/시간표/수정요청 API 라우트 초안 구현
- [x] `sqlite3` 네이티브 빌드 문제 해결 (`npm rebuild sqlite3 --build-from-source`)
- [x] CSV(9월29일) 구조 분석 및 임포트 전략 문서화 (`docs/data-import-plan.md`)
- [x] 로그인/권한 구조 기획 문서화 (`docs/auth/login-flow.md`)
- [x] React `TemplateContext`로 템플릿/시간표 상태 중앙 관리
- [x] 템플릿 선택·이름 수정 컴포넌트(`TemplateHeader`) 초안 + 시간표 UI 연동

### 2025-10-02
- [x] 사용자 계정 테이블(`users`) 및 슈퍼관리자 자동 시드 로직 추가
- [x] JWT 기반 로그인 API(`/api/auth/login`)와 미들웨어(authenticate/requireRole) 구현
- [x] 슈퍼관리자 계정 관리 API(`GET/POST/PATCH /api/users`) 구성
- [x] 템플릿/요청 API에 역할 기반 접근 제어 적용
- [x] 환경 변수 기본값 및 경고 추가 (`server/config.js`)
- [x] 로그인 페이지/UI 제작 및 감성 디자인 적용
- [x] 프론트 인증 컨텍스트(AuthProvider)와 토큰 보관 로직 구축
- [x] 템플릿 화면을 로그인 사용자에게만 노출 & 권한별 버튼 비활성화 처리
- [x] 선생님 자체 가입 API(`/api/auth/signup`)와 가입 폼 연결
- [x] superadmin 전용 계정 관리 패널(UI)에서 승인/역할/비활성/비번 초기화 처리
- [x] 수정 요청 로그 패널(UI)에서 승인/거절 흐름 구현

---

## 🔄 진행 중인 작업
- [ ] 시간표 저장 시 교실/비고 구조 정리 (notes 필드 활용)
- [ ] 승인된 계정/요청 알림 UX (이메일 or in-app) 설계
- [ ] 선생님 측 수정 요청 작성 UX (셀에서 요청 보내기)

---

## ⏳ 예정된 작업

### 1순위: 시간표 만들기·편집
- [ ] React 상태 관리 구조 정의 (템플릿/시간표/요청 분리)
- [ ] 시간표 API 연동 + 저장(덮어쓰기) 화면 구성
- [ ] 템플릿 생성/전환 UI + 기본 밸리데이션

### 2순위: 변경 이력 추적 & 승인
- [ ] 변경 이력 테이블 설계(`history_logs` 등) 및 API 추가
- [ ] 수정 요청 알림 로직 (pending → 이메일, 웹 알림)
- [ ] 관리자 승인 화면 UX 확정 및 라우팅

### 3순위 이후
- [ ] 학생 정보 관리 화면 (이름/학교/학년)
- [ ] 스마트 알림 (중복, 누락 감지)
- [ ] PDF/카카오톡 공유용 출력
- [ ] CSV/구글시트 일괄 임포트 스크립트 구현

---

## 🐛 알려진 이슈
- CRA 기반 `client/` 패키지에서 `npm audit` 고위험 경고가 발생 (React 19 + CRA 조합 이슈). 추후 Vite 전환 또는 CRA 업그레이드 시 해결 예정.
- 새 환경에서 `sqlite3` 사용 시 네이티브 바이너리를 한 번 빌드해야 함 (`npm rebuild sqlite3 --build-from-source`).

---

## ✅ 해결된 이슈
- *(신규)* WSL 환경에서 `sqlite3` 모듈 로드 실패 → 수동 리빌드로 해결.

---

## 📋 다음 단계 (Top 3)
1. 시간표 저장/불러오기 시 교실/비고를 담을 데이터 모델 초안 확정하기.
2. 승인/알림 UX 초안 잡기 (추후 이메일 연동 대비).
3. 선생님 측 수정 요청 작성 UX 설계 및 `/api/change-requests` 연동하기.

---

## 💡 기술적 결정 사항

| 항목 | 선택 | 이유 |
|------|------|------|
| Frontend | React 19 (CRA) | 기존 코드 재사용, 빠른 UI 프로토타입 |
| Backend | Node.js + Express 5 | 심플한 REST API 구성 |
| Database | SQLite | 파일 기반, 빠른 시작 |
| Drag & Drop | react-beautiful-dnd (예정) | 직관적 DnD 구현 |
| 이메일 | Nodemailer (예정) | 설정 간단, 무료 |

---

## 🎯 현재 우선순위
- **데이터 모델 정리 → UI 연동 → 승인 흐름** 순서로 베타 버전을 완성합니다.
- 목표: 며칠 안에 1순위 기능(시간표 편집) 베타 버전 완성!

---

*다음 업데이트는 UI와 API가 연결되는 즉시 공유할게요.*
