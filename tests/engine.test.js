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

console.log(`\n통과 ${pass}개, 실패 ${fail}개`);
process.exit(fail ? 1 : 0);
