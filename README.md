# 개인 근무 상황 관리 사이트 (Special Education Work Status Manager)

발달장애 학생의 직장생활 체험 및 진로직업 교육을 위한 100% 클라이언트(프런트엔드) 전용 근무 상황 관리 웹앱입니다.

---

## 🌟 주요 특징 및 배포 구조

1. **완전한 무서버 (Serverless / Static SPA) 구조**
   - 백엔드 서버, Firebase, Supabase, Google Sheets, Google Apps Script 등을 전혀 사용하지 않습니다.
   - GitHub Pages, Netlify, Vercel 등 어디서나 정적 파일 배포가 가능합니다.

2. **교사별 / 기기별 데이터 완벽 독립성 (Privacy & Isolation)**
   - 모든 사용자 데이터(학생 명단, 근무 신청 내역, 승인/반려 상태, 관리자 PIN 등)는 접속한 기기의 브라우저 `localStorage`(`workStatusManager_v1`)에만 보관됩니다.
   - 동일한 배포 링크를 교사 A와 교사 B가 각자의 노트북에서 접속하더라도, 서로의 데이터가 절대 공유되거나 섞이지 않습니다.
   - 학생 개인정보가 외부 서버로 전송되지 않아 안심하고 사용할 수 있습니다.

3. **영구 보존 및 데이터 백업/복원 (JSON)**
   - 브라우저를 새로고침하거나 창을 닫아도 데이터가 유지됩니다.
   - [부장님 메뉴] → [설정 · 백업]에서 언제든지 전체 데이터를 **JSON 파일로 내보내기/불러오기** 할 수 있어 학기 전환이나 기기 교체 시 편리합니다.

---

## 🚀 GitHub Pages 배포 방법

### 방법 1. GitHub Actions를 통한 자동 배포 (권장)
1. 이 프로젝트를 GitHub 리포지토리에 푸시(`push`)합니다.
2. GitHub 리포지토리의 **Settings** → **Pages**로 이동합니다.
3. **Build and deployment** 항목의 **Source**를 `GitHub Actions`로 선택합니다.
4. `.github/workflows/deploy.yml` 파일에 의해 자동으로 빌드 및 배포가 완료되며, 생성된 URL(예: `https://<사용자명>.github.io/<리포지토리명>/`)로 바로 접속할 수 있습니다.

### 방법 2. 정적 빌드 후 `dist` 폴더 배포
1. 터미널에서 `npm install` 실행
2. `npm run build` 실행 → `dist/` 폴더에 정적 HTML/CSS/JS 파일 생성
3. 생성된 `dist` 폴더의 내용을 `gh-pages` 브랜치나 웹 호스팅 서버에 업로드

---

## 🛠 기술 스택
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite (상대 경로 `base: './'` 설정 적용)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: 브라우저 Web Storage (`localStorage`)
