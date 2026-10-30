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
check(engOf([{ t: '대학영어', cat: '교양필수', eng: 'mark' }, { t: '재무관리', cat: '전공필수', eng: 'mark', ip: true }]).have === 1, '교양 영어강의(대학영어)는 영어강좌 의무이수에서 빼고 전공과목만 셈');
check(engOf([{ t: '대학영어', eng: 'mark' }, { t: '인간의가치탐색', eng: 'mark' }, { t: '마케팅원론', eng: 'mark' }]).have === 1, '이수구분이 없어도 교양 과목의 영어강의는 세지 않음');
check(engOf([{ t: '경영커뮤니케이션', cat: '전공선택', eng: 'mark' }], { dept: '회계·세무학과', year: 2019 }).have === 1, '타전공으로 인정된 경영대 전공선택 영어강의는 셈');
const pe = K.planGraduation({ year: 2024, dept: '경영학과', track: 'single', courses: [], liberal: {}, now: NOW }, { maxCr: 18 });
const engHints = pe.semesters.flatMap((s) => s.items).filter((i) => i.eng);
check(pe.done && engHints.length === 3 && engHints.every((i) => /영어강의/.test(i.why)), `신입생 계획: 전공과목 3개에 '영어강의 분반으로' 표시 (실제 ${engHints.length}개)`);

console.log('[6] 경영회계계열(2026~) 진단표');
const gyText = (deptField, year = 2026) => [
  '2026-후기 졸업진단표 2026-10-27 18:02:30 1 of 1',
  `학 번 20269999 성 명 홍길동 학 과 ${deptField} 학 년 1 등록횟수 2 학적상태 재학`,
  `입 학 구 분 신입학 졸업기준학점(년도) ${year} 외국인여부 N 최종변동 2026/09/01 최종판정 졸업유예`,
  '교양/기타/금학기수강학점 전공학점',
  '01 GEC1102 인간의가치탐색 3 2026 / 1 11 MGMT1001 경영학원론 3 2026 / 1',
  '01 GEC1104 세계와시민 3 2026 / 1 ACCT1001 회계원리 3 2026 / 1',
].join('\n');
const gd1 = K.parseDiagnosis(gyText('경영회계계열'), { now: NOW });
check(gd1.gyeyeol === '경영회계계열' && gd1.dept === null && gd1.year === 2026, `학과 칸이 경영회계계열 → 계열로 인식, 학과는 비워 둠 (실제 ${gd1.gyeyeol}/${gd1.dept})`);
check(gd1.courses.length >= 3, `계열 진단표에서도 과목을 읽음 (실제 ${gd1.courses.length}과목)`);
const gd2 = K.parseDiagnosis(gyText('경영회계 계열'), { now: NOW });
check(gd2.gyeyeol === '경영회계계열' && gd2.dept === null, '띄어 쓴 "경영회계 계열"도 인식');
const gd3 = K.parseDiagnosis(gyText('회계학과', 2022), { now: NOW });
check(gd3.gyeyeol === null && gd3.dept === '회계·세무학과', '학과 칸이 회계학과면 기존처럼 회계·세무학과');
const gd4 = K.parseDiagnosis(gyText('경영학과', 2025), { now: NOW });
check(gd4.gyeyeol === null && gd4.dept === '경영학과', '학과 칸이 경영학과면 기존처럼 경영학과');
const exch = K.parseDiagnosis(gyText('경영학과', 2023) + '\n08 EXCH015956 생활일본어(학점교류) 3 2025 / 2 계절', { now: NOW });
check(exch.courses.some((c) => c.no === 'EXCH015956' && c.cr === 3), '학점교류처럼 학수번호 숫자가 6자리인 과목도 읽음');
for (const d of K.GYEYEOL.depts) {
  const r = K.audit({ year: 2026, dept: d, track: 'single', courses: gd1.courses, liberal: {}, now: NOW });
  check(!r.error && r.rows.find((x) => x.label === '전공기초').have === 6, `계열 학생 수강 기록을 ${K.deptLabel(d, 2026)} 세칙으로 계산 (전공기초 6학점)`);
}

console.log('[7] 계획표: 배분 영역·졸업 절차·과목군 상한');
const tr = (rows) => K.parseTranscript(rows.map((r) => r.join('\t')).join('\n')).courses;
const bdCourses = tr([
  [2024, 1, '전공기초', 'MGMT1001', '경영통계학', 3, 'A0'], [2024, 1, '전공기초', 'ACCT1001', '회계원리', 3, 'A0'],
  [2024, 2, '전공기초', 'MGMT1007', '경영학원론', 3, 'A0'], [2024, 2, '전공기초', 'MGMT1003', '책임경영', 3, 'A0'],
  [2024, 1, '전공필수', 'BDAS1001', '빅데이터수학', 3, 'A0'], [2024, 2, '전공필수', 'BDAS1002', '빅데이터프로그래밍1', 3, 'A0'],
  [2025, 1, '배분이수', 'GED1106', '생명,영원한블루오션', 3, 'A0'], [2025, 2, '배분이수', 'GED1649', '호모무지쿠스:음악으로경', 3, 'A0'],
]);
const bdIn = { year: 2024, dept: '빅데이터응용학과', track: 'single', courses: bdCourses, liberal: {}, now: NOW };
const bp = K.planGraduation(bdIn, { maxCr: 18 });
check(bp.done, '성적표 붙여넣기(배분 영역 정보 없음)여도 계획이 끝까지 완성됨');
check(bp.semesters.every((s) => s.credits > 0), `0학점 빈 학기가 없음 (${bp.semesters.map((s) => s.credits).join('/')})`);
const ms = bp.semesters.flatMap((s, i) => s.items.filter((x) => x.milestone).map((x) => ({ t: x.t, i, reg: s.reg })));
const pj = ms.find((x) => /졸업프로젝트/.test(x.t)); const th = ms.find((x) => /졸업논문/.test(x.t));
check(pj && pj.reg >= 7, `빅데이터: 졸업프로젝트 신청을 7학기 이상 등록한 학기에 표시 (실제 ${pj && pj.reg}학기)`);
check(th && th.i === bp.semesters.length - 1, '빅데이터: 졸업논문을 마지막 계획 학기에 표시');
check(K.regSoFar({ year: 2024 }, NOW).n === 6 && K.regSoFar({ year: 2024, official: { regCount: 5 } }, NOW).n === 5, '등록 학기 수: 진단표 값 우선, 없으면 입학년도로 추정');
const mp = K.planGraduation({ year: 2024, dept: '경영학과', track: 'single', courses: [], liberal: {}, now: NOW }, { maxCr: 18 });
const mms = mp.semesters.flatMap((s) => s.items.filter((x) => x.milestone).map((x) => x.t));
check(mms.length === 1 && /졸업논문\(경영학\)/.test(mms[0]), `경영학과: 졸업논문만 표시하고 졸업프로젝트는 없음 (${mms.join(', ')})`);
check(mp.semesters.every((s) => s.credits === s.items.reduce((a, x) => a + x.cr, 0)), '졸업 절차 항목은 학기 학점에 더해지지 않음');
const capRes = K.audit({ ...bdIn, courses: [...bdCourses, ...['소비자행동론', '마케팅조사론', '디지털마케팅', '투자론'].map((t) => ({ t, cr: 3 }))] });
const cap = capRes.rows.find((r) => r.id === 'm-elec').cap;
check(cap && cap.max === 9 && cap.have === 12 && cap.over === 3, `빅데이터: 경영과목군 12학점 중 9학점만 인정, 3학점 초과 표시 (${JSON.stringify(cap)})`);
const exRow = capRes.rows.find((r) => r.id === 'exam');
check(exRow.subs.length >= 5 && /3월/.test(exRow.schedule || ''), '빅데이터: 졸업프로젝트 대체 요건과 진행 일정 표시');

const dbl = K.audit({ year: 2023, dept: '경영학과', track: 'single', courses: [], liberal: {}, now: NOW }).doubles;
const dA = dbl.find((d) => /회계/.test(d.dept)), dB = dbl.find((d) => /빅데이터/.test(d.dept));
check(dA && /졸업시험/.test(dA.grad2.exam) && /졸업논문\(회계학\)/.test(dA.grad2.thesis) && dB && /졸업프로젝트/.test(dB.grad2.exam), '다전공: 2전공 학과의 졸업시험·졸업프로젝트와 졸업논문을 따로 안내');
// 8) 현장실습: 이수구분대로 세고, 전공 인정분만 졸업시험 대체 (경영대 FAQ), 빅데이터는 학점 취득으로 졸업프로젝트 대체
console.log('[8] 현장실습 학점 인정과 졸업시험 대체');
{
  const au = (dept, year, courses) => K.audit({ year, dept, track: 'single', courses, liberal: {}, now: NOW });
  const ex = (r) => r.rows.find((x) => x.id === 'exam');
  const long12 = au('경영학과', 2024, K.FIELD_OPTS[0].parts);
  const f = long12.courses.filter((c) => c.field);
  check(f.length === 2 && f.find((c) => c.kind === '전공선택').cr === 9 && f.find((c) => c.kind === '일반선택').cr === 3, '장기현장실습 12학점: 전공선택 9 + 일반선택 3');
  check(ex(long12).ok === true, '전공 인정 현장실습은 졸업시험 대체');
  check(ex(au('회계·세무학과', 2019, K.FIELD_OPTS[4].parts)).ok === false, '일반선택 인정 현장실습은 졸업시험 대체 안 됨');
  check(ex(au('회계·세무학과', 2019, [{ t: '현장실습(장기)', cr: 12, cat: '전공선택' }])).ok === true, '진단표 전공선택 현장실습은 대체');
  check(ex(au('빅데이터응용학과', 2024, K.FIELD_OPTS[6].parts)).ok === true, '빅데이터: 현장실습 학점 취득으로 졸업프로젝트 대체');
  check(ex(au('경영학과', 2024, [{ t: '캡스톤디자인(경영학)', cr: 3 }])).ok === true, '경영: 캡스톤디자인(경영학) 대체');
  check(ex(au('회계·세무학과', 2024, [{ t: '캡스톤디자인(경영학)', cr: 3 }])).ok === false, '회계: 캡스톤은 대체 요건 아님');
  // 실제 진단표 형식: 'COOP3004 * 단기현장실습(전공) 6 2025 / 1 계절' (전공선택 05 구간)
  const fieldTxt = ['졸업진단표', '전공학점', '1 A11239 회계학 학점취득', '05 ACCT2001 세법총론 3 2024 / 1', 'COOP3004 * 단기현장실습(전공) 6 2025 / 1 계절', 'COOP3001 * 장기현장실습(전공) 9 2025 / 2', '11 ACCT1001 회계원리 3 2023 / 1'].join('\n');
  const fr = (K.parseAny(fieldTxt, { now: NOW }).courses || []).filter((c) => /현장실습/.test(c.t));
  check(fr.length === 2 && fr.every((c) => c.cat === '전공선택' && !/^\*/.test(c.t)) && fr.map((c) => c.cr).join() === '6,9', `진단표 현장실습 행 인식: ${JSON.stringify(fr.map((c) => [c.t, c.cat, c.cr]))}`);
  check(K.searchCourses('현장실습').filter((c) => c.field != null).length === 7, '검색에 현장실습 선택지 7개');
  const plan = K.planGraduation({ year: 2024, dept: '경영학과', track: 'single', courses: K.FIELD_OPTS[0].parts, liberal: {}, now: NOW }, { maxCr: 18 });
  check(!plan.error && (plan.finalRows || []).filter((r) => !r.flag && !r.ok).length === 0, '현장실습 포함 졸업 계획 완성');
}

console.log(`\n통과 ${pass}개, 실패 ${fail}개`);
process.exit(fail ? 1 : 0);
