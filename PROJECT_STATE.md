# 📊 PROJECT_STATE.md - 진진영어 시간표 현황

**마지막 업데이트**: 2025-10-01 23:15 (KST)

## 🎯 전체 진행률: 22%
- 서버·프론트 실행 환경과 DB 뼈대를 갖춘 상태예요.
- 이제 UI를 실제 데이터와 연결하고 승인/이력 흐름을 붙이는 단계로 넘어갑니다.

---

## ✅ 완료된 작업

### 2025-10-01
- [x] 루트/클라이언트 npm 스크립트 분리 (`npm run dev`, `npm run client:install` 등)
- [x] `client/` 전용 CRA 패키지 구성 (`package.json`, 실행 스크립트)
- [x] Express + SQLite 연결 및 기본 스키마(`templates`, `schedule_entries`, `change_requests`)
- [x] 템플릿/시간표/수정요청 API 라우트 초안 구현
- [x] `sqlite3` 네이티브 빌드 문제 해결 (`npm rebuild sqlite3 --build-from-source`)
- [x] CSV(9월29일) 구조 분석 및 임포트 전략 문서화 (`docs/data-import-plan.md`)

---

## 🔄 진행 중인 작업
- [ ] ScheduleGrid UI를 API 응답 구조에 맞게 정리 (데이터 모델 설계 포함)
- [ ] 템플릿 선택/저장 플로우 UX 초안 잡기
- [ ] 수정 요청 → 승인 화면 각도 잡기 (요청 데이터 모델 검토)

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
1. ScheduleGrid 상태 구조를 API 스키마에 맞게 다시 설계하고 더미 데이터를 교체하기.
2. 템플릿 생성/선택 UI 초안을 만들고 `/api/templates` 연동하기.
3. 수정 요청 리스트 화면 뼈대를 만들고 `/api/change-requests` 데이터로 확인하기.

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
