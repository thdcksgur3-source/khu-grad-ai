# 경영대 졸업사정표

경희대학교 경영대학(경영학과 · 회계(·세무)학과 · 빅데이터응용학과) 19~26학번 학생이 인포21 **졸업진단표 PDF**를 올리면, 입학년도 시행세칙 기준으로

- 이번 학기(수강 중 과목 포함)를 마치면 졸업까지 몇 학점·몇 학기가 남았는지
- 다음 학기부터 졸업까지 학기별로 무엇을 들어야 하는지

를 알려 주는 정적 웹사이트입니다. 2026 KHU AI Challenge(AI 문제해결 솔루션 부문) 출품작입니다.

## 파일 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 화면 뼈대 |
| `styles.css` | 디자인 |
| `app.js` | 화면 동작: 입력, PDF 읽기, 결과 그리기 |
| `engine.js` | 계산 엔진: 졸업요건 판정(`audit`), 졸업 계획 생성(`planGraduation`), 진단표 해석(`parseDiagnosis`) |
| `data.js` | 데이터: 학과·학번별 시행세칙 규칙(`rules`), 교양 기준(`liberal`), 2026학년도 교과목(`courses`) |
| `vendor/` | PDF 읽기 라이브러리 pdf.js (Mozilla, Apache 2.0)와 한글 글꼴 지도 |
| `tests/engine.test.js` | 자동 테스트 (기준학점 42개 조합, 신입생 졸업 계획, 학번별 과목군 판정) |
| `tests/expected.json` | 세칙과 대조해 확정한 기준학점 값 |
| `samples/sample_diagnosis_fake.pdf` | 테스트용 **가상** 졸업진단표 (실존 인물 아님) |

## 세칙 규칙을 고칠 때

1. `data.js`의 `rules` → 학과 → `groups`에서 해당 학번 구간을 찾아 고친다.
2. GitHub에 올리면 Actions가 `node tests/engine.test.js`를 자동으로 돌린다.
3. 세칙이 실제로 바뀌어 기준학점이 달라져야 하는 경우에만 `node tests/engine.test.js --update`로 `expected.json`을 다시 만든다.

## 실행 · 배포

- 빌드 과정이 없다. 저장소 루트를 그대로 정적 사이트로 올리면 된다.
- Vercel: Import Git Repository → Framework Preset `Other` → Build Command 비움 → Output Directory 비움(루트).
- 내 컴퓨터에서 보기: 이 폴더에서 `python -m http.server` 실행 후 `http://localhost:8000`.

## 개인정보

진단표 PDF는 브라우저 안에서만 읽고 어디에도 전송하거나 저장하지 않는다. **실제 졸업진단표 파일은 이 저장소에 올리지 않는다.**

## 출처

경희대학교 경영대학 학과별 교육과정 시행세칙(2019~2026), 서울캠퍼스 학사제도안내, 인포21 교육과정조회(2026학년도). 최종 졸업사정은 소속 학과 행정실 확인이 필요하다.
