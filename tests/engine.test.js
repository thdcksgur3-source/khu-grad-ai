// 경영대 졸업사정표 자동 테스트 (Node 18 이상, 설치할 패키지 없음)
// 실행: node tests/engine.test.js            → 검사
//       node tests/engine.test.js --update   → 기준값(expected.json) 다시 만들기 (세칙 규칙을 일부러 바꿨을 때만)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
globalThis.window = globalThis;
eval(fs.readFileSync(path.join(root, 'data.js'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'engine.js'), 'utf8'));
const K = globalThis.KHU;

const NOW = new Date('2026-10-28T12:00:00+09:00');
const DEPTS = ['경영학과', '회계·세무학과', '빅데이터응용학과'];
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const TRACKS = ['single', 'multi'];
let fail = 0, pass = 0;
const check = (ok, msg) => { if (ok) pass++; else { fail++; console.log('  실패: ' + msg); } };

// 1) 학과·학번·이수형태별 기준학점 스냅샷
const snapshot = {};
for (const dept of DEPTS) for (const year of YEARS) for (const track of TRACKS) {
  if (dept === '빅데이터응용학과' && year < 2022) continue;
  const res = K.audit({ year, dept, track, courses: [], liberal: {}, now: NOW });
  const key = `${dept}|${year}|${track}`;
  if (res.error) { check(false, `${key}: ${res.error}`); continue; }
  snapshot[key] = Object.fromEntries(res.rows.filter((r) => !r.flag).map((r) => [r.id, r.need]));
}
const expPath = path.join(__dirname, 'expected.json');
if (process.argv.includes('--update')) {
  fs.writeFileSync(expPath, JSON.stringify(snapshot, null, 1));
  console.log(`기준값 ${Object.keys(snapshot).length}개 조합을 저장했어요.`);
  process.exit(0);
}
const expected = JSON.parse(fs.readFileSync(expPath, 'utf8'));
console.log('[1] 기준학점이 세칙 기준값과 같은지');
for (const [key, want] of Object.entries(expected)) {
  const got = snapshot[key];
  if (!got) { check(false, `${key} 결과 없음`); continue; }
  for (const [id, need] of Object.entries(want)) check(got[id] === need, `${key} ${id}: 기대 ${need}, 실제 ${got[id]}`);
}

// 2) 아무것도 안 들은 학생도 8학기 안에 졸업 계획이 완성되는지
console.log('[2] 신입생(이수 0학점) 졸업 계획 완성');
for (const key of Object.keys(expected)) {
  const [dept, year, track] = key.split('|');
  const plan = K.planGraduation({ year: Number(year), dept, track, courses: [], liberal: {}, now: NOW }, { maxCr: 18 });
  const left = (plan.finalRows || []).filter((r) => !r.flag && !r.ok).map((r) => r.label);
  check(!plan.error && left.length === 0, `${key}: 남은 요건 ${left.join(', ') || plan.error}`);
  check((plan.semesters || []).every((s) => s.credits === undefined || s.credits <= 18), `${key}: 학기당 18학점 초과`);
}

// 3) 입학년도 세칙 적용 (19학번 회계: 회사법은 경영과목군, 신설 과목은 신설 연도 세칙)
console.log('[3] 학번별 과목군 판정');
const a19 = K.audit({ year: 2019, dept: '회계·세무학과', track: 'single', courses: [{ t: '회사법', cr: 3 }, { t: '회계정보애널리틱스', cr: 3 }], liberal: {}, now: NOW });
const grpOf = (res, t) => (res.courses.find((c) => K.norm(c.t) === K.norm(t)) || {}).grp;
check(grpOf(a19, '회사법') === '경영', `19학번 회사법 과목군: ${grpOf(a19, '회사법')} (기대: 경영)`);
check(grpOf(a19, '회계정보애널리틱스') === '회계', `19학번 회계정보애널리틱스 과목군: ${grpOf(a19, '회계정보애널리틱스')} (기대: 회계)`);

// 4) SW 졸업요건 과목
console.log('[4] SW 과목 인정·계산');
check(K.SW_LIST.filter((c) => c.sw === 'hum' && c.campus === '서울').length === 21 && K.SW_LIST.filter((c) => c.sw === 'biz').length === 9, `SW 과목 수: 서울 후마니타스 21 + 경영대 9 이어야 함 (실제 ${K.SW_LIST.length})`);
const g1 = K.audit({ year: 2024, dept: '경영학과', track: 'single', courses: [{ t: '인공지능과라이프3.0', cr: 3 }], liberal: {}, now: NOW });
check(g1.credits.libDist === 3 && g1.rows.find((x) => x.id === 'sw').have === 3, 'SW 배분이수 과목은 배분이수와 SW 모두 인정');
check((g1.rows.find((x) => x.id === 'lib-dist').areas || []).includes('지능·정보·미래'), 'SW 배분이수 과목의 영역(지능·정보·미래)이 자동으로 잡힘');
const swOf = (courses, extra = {}) => K.audit({ year: 2024, dept: '경영학과', track: 'single', courses, liberal: {}, now: NOW, ...extra });
const swHave = (r) => r.rows.find((x) => x.id === 'sw').have;
const a1 = swOf([{ t: '파이썬으로배우는소프트웨어코딩', cr: 3 }]);
check(swHave(a1) === 3, `검색으로 넣은 SW 과목 3학점 인정 (실제 ${swHave(a1)})`);
check(a1.credits.libFree === 3, `SW 자유이수 과목은 자유이수 교양에도 들어감 (실제 ${a1.credits.libFree})`);
check(swHave(swOf([{ t: '네트워크기술을통한현재', no: 'GED1227', cr: 3, sw: 'mark' }])) === 3, '진단표 s 표시 과목(목록 밖 옛 과목) 인정');
check(swHave(swOf([{ t: '새로운생명체:인공지능', no: 'GEE1953', cr: 3, sw: 'mark' }], { official: { sw: 3 } })) === 3, '진단표 공식 SW 학점과 같은 과목을 두 번 세지 않음');
check(swHave(swOf([{ t: '새로운생명체:인공지능', no: 'GEE1953', cr: 3 }], { sw: 3 })) === 6, '목록에 없는 SW 학점 직접 입력은 더해짐');
const p24 = K.planGraduation({ year: 2024, dept: '경영학과', track: 'single', courses: [], liberal: {}, now: NOW }, { maxCr: 18 });
const swPlanned = p24.semesters.flatMap((s) => s.items).filter((i) => /SW/.test(i.why) && !i.placeholder);
check(swPlanned.length >= 2 && swPlanned.every((i) => K.isSw(i)), `신입생 계획에 실제 SW 과목 2개 이상 (실제 ${swPlanned.map((i) => i.t).join(', ')})`);
const pB = K.planGraduation({ year: 2022, dept: '빅데이터응용학과', track: 'single', courses: [], liberal: {}, now: NOW }, { maxCr: 18 });
check(pB.semesters.flatMap((s) => s.items).some((i) => i.no === 'BDAS1004' && /SW/.test(i.why)), '빅데이터 학생 계획: 빅데이터프로그래밍2가 SW 요건도 채움으로 표시');

// 5) 영어강좌 의무이수 (3과목, 진단표 e 표시)
console.log('[5] 영어강의 3과목');
const engOf = (courses, extra = {}) => K.audit({ year: 2022, dept: '경영학과', track: 'single', courses, liberal: {}, now: NOW, ...extra }).rows.find((x) => x.id === 'eng');
const e3 = [{ t: '마케팅원론', eng: 'mark' }, { t: '조직행동론', eng: 'mark' }, { t: '재무관리', eng: 'mark', ip: true }];
check(engOf(e3).have === 3 && engOf(e3).ok, '진단표 e 표시 3과목(수강 중 포함) → 충족');
check(engOf(e3.slice(0, 2)).short === 1, 'e 표시 2과목 → 1과목 부족');
check(engOf(e3.slice(0, 2), { official: { engHave: 3 } }).have === 3, '진단표 공식 영어강의 수와 같은 과목을 두 번 세지 않음');
check(engOf([], { engManual: 2 }).have === 2, '직접 입력한 영어강의 과목 수 반영');
const pe = K.planGraduation({ year: 2024, dept: '경영학과', track: 'single', courses: [], liberal: {}, now: NOW }, { maxCr: 18 });
const engHints = pe.semesters.flatMap((s) => s.items).filter((i) => i.eng);
check(pe.done && engHints.length === 3 && engHints.every((i) => /영어강의/.test(i.why)), `신입생 계획: 전공과목 3개에 '영어강의 분반으로' 표시 (실제 ${engHints.length}개)`);

console.log(`\n통과 ${pass}개, 실패 ${fail}개`);
process.exit(fail ? 1 : 0);
