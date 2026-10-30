/* 경영대 졸업사정표 — 계산 엔진 (화면과 분리된 순수 함수들) */
(function (root) {
  'use strict';
  const D = root.KHU_DATA;
  const norm = (s) => (s || '').replace(/[\s·ㆍ()（）\[\]:]/g, '').toLowerCase();
  const LIB_REQ = [
    { t: '인간의가치탐색', cr: 3 }, { t: '세계와시민', cr: 3 }, { t: '빅뱅에서문명까지', cr: 3 },
    { t: '성찰과표현', cr: 3 }, { t: '주제연구', cr: 3 }, { t: '대학영어', cr: 2 },
  ];
  const isLibReq = (t) => LIB_REQ.some((x) => norm(x.t) === norm(t));
  const PREFIX = { '경영학과': 'MGMT', '회계·세무학과': 'ACCT', '빅데이터응용학과': 'BDAS' };
  const BIZ_DEPTS = ['경영학과', '회계·세무학과', '빅데이터응용학과'];

  const byTitle = new Map();
  const byNo = new Map();
  D.courses.forEach((c) => {
    byNo.set(c.no, c);
    const k = norm(c.t);
    const prev = byTitle.get(k);
    if (!prev || Object.keys(c.k).length > Object.keys(prev.k).length) byTitle.set(k, c);
  });
  const lookup = (c) => (c.no && byNo.get(c.no)) || byTitle.get(norm(c.t)) || null;
  /* ===== SW 졸업요건 과목 =====
     출처: 2026 인포21 교육과정의 '후마니타스칼리지교육과정(서울) 자유이수교과 SW' 영역(hum) + 경영대학 개설 과목(biz).
     진단표에서 과목명 앞에 's'가 붙은 과목도 SW 과목으로 본다. */
  const SW_LIST = D.courses.filter((c) => c.sw);
  const isSw = (c) => !!(c.sw || ((lookup(c) || {}).sw));
  const SW_AI = /인공지능|머신러닝|딥러닝|데이터|파이썬/;
  /* ===== 영어강좌 의무이수제 =====
     2008학년도 이후 신·편입생: 영어강좌 3과목 이상(편입생 1과목). 영어강의 여부는 과목이 아니라 분반마다 정해지므로
     진단표의 'e' 표시(또는 직접 입력)로만 센다. 인포21 진단표는 이번 학기 수강 중인 영어강의도 함께 센다. */
  const ENG_DEFAULT = 3;
  const isEng = (c) => !!c.eng;
  const MAJOR_KIND = /^전공/;
  // 영어강좌 의무이수제는 전공과목(전공기초·전공필수·전공선택) 영어강좌를 센다 (학사지원팀 안내).
  // 인포21 집계와 같게, 교양 과목(대학영어 등 교양필수·배분이수·자유이수, GE 학수번호)의 영어강의만 빼고 나머지 전공 개설 과목은 센다.
  const LIB_CAT = /^(교양|배분이수|자유이수)/;
  const engCounts = (c) => isEng(c) && !(LIB_CAT.test(c.cat || '') || LIB_CAT.test(c.kind || '') || /^GE/.test(c.no || '') || isLibReq(c.t));
  function swStatus(courses, input, need) {
    const counted = courses.filter((c) => isSw(c) && !c.plan);
    const planned = courses.filter((c) => isSw(c) && c.plan);
    const fromCourses = sum(counted);
    const official = input.official && input.official.sw != null ? Number(input.official.sw) : 0;
    const manual = Number(input.sw) || 0;
    // 진단표 공식 SW 학점과 과목 목록에서 센 학점 중 큰 값 + 목록에 없는 과목으로 직접 입력한 학점 + 계획에 넣은 과목
    const have = Math.max(official, fromCourses) + manual + sum(planned);
    return { need, have, official, manual, fromCourses, courses: counted.map((c) => ({ t: c.t, cr: c.cr, ip: !!c.ip, no: c.no })) };
  }
  // 아직 안 들은 SW 과목을 추천 순서대로: 학과 맞춤(빅데이터 전공과목) → 자유이수가 부족하면 함께 채움 → 관심 분야 → 학수번호
  function swOptions({ dept, year, interests = [], takenNorms, freeShort = 0, majorShort = 0, distShort = 0, areas = [] }) {
    const key = ruleKey(dept);
    const ai = interests.includes('AI·데이터');
    return SW_LIST.map((c) => {
      const taken = takenNorms.has(norm(c.t));
      const reasons = [];
      let score = 50;
      const kind = c.sw === 'biz' ? (c.k[key] || (key === '회계·세무학과' && c.k['회계학과']) || (key === '빅데이터응용학과' && '전공선택') || null) : null;
      const own = !!kind;
      if (c.sw === 'biz') {
        if (own) {
          reasons.push(`${deptLabel(dept, year || 2025)} ${kind}이면서 SW로 인정돼요`);
          score = kind === '전공필수' ? 0 : majorShort > 0 ? 10 : 40;
          if (majorShort > 0 && kind !== '전공필수') reasons.push('부족한 전공 학점도 함께 채워요');
        } else { reasons.push('경영대학 개설 SW 과목 (내 학과 전공으로는 인정되지 않을 수 있어요)'); score = 90; }
        if (c.a && interests.includes(c.a)) { reasons.push(`관심 분야(${c.a})와 맞아요`); score -= 5; }
      } else if (c.campus === '국제') {
        reasons.push('국제캠퍼스 개설 SW 과목이라 추천하지 않아요 (이수했다면 SW로 인정)'); score = 95;
      } else if (c.cat === '배분이수') {
        const newArea = year >= 2024 && c.area && !areas.includes(c.area);
        reasons.push(`배분이수(${c.area}) 교양${distShort > 0 ? ' 부족분도 함께 채워요' : '으로 들어가요'}`);
        if (distShort > 0) score -= 20;
        if (newArea && distShort > 0) { reasons.push('아직 안 들은 배분 영역이에요'); score -= 5; }
        if (ai && SW_AI.test(c.t)) { reasons.push('관심 분야(AI·데이터)와 맞아요'); score -= 5; }
      } else {
        reasons.push(freeShort > 0 ? '자유이수 교양 부족분도 함께 채워요' : '자유이수 교양으로 들어가요');
        if (freeShort > 0) score -= 20;
        if (ai && SW_AI.test(c.t)) { reasons.push('관심 분야(AI·데이터)와 맞아요'); score -= 5; }
      }
      return { t: c.t, no: c.no, cr: c.cr, term: c.term, src: c.sw, cat: c.cat, area: c.area, campus: c.campus, own, kind, taken, reasons, score };
    }).sort((a, b) => a.score - b.score || a.no.localeCompare(b.no));
  }
  const prefixOf = (c) => ((c.no || (lookup(c) || {}).no || '').match(/^[A-Z]+/) || [''])[0];

  const ruleKey = (dept) => (dept === '회계학과' ? '회계·세무학과' : dept);
  // 2026학년도부터 학과명이 회계학과로 바뀌어, 화면에는 학번과 상관없이 '회계학과'로 표시한다 (규칙 데이터 키는 '회계·세무학과' 그대로)
  const deptLabel = (dept) => (ruleKey(dept) === '회계·세무학과' ? '회계학과' : dept);
  const groupFor = (dept, year) => D.rules[ruleKey(dept)].groups.find((g) => g.entry_years.includes(year));
  const byYear = (v, year) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[String(year)] ?? Object.values(v).pop()) : v);
  const inList = (list, t) => (list || []).some((x) => norm(x) === norm(t));

  /* 회계·세무 19~23학번: 회사법·유가증권법·재무제표분석·가치평가론은 학수번호가 ACCT여도 '경영과목군' */
  const ACCT_AS_MGMT_PRE2024 = ['회사법', '유가증권법', '재무제표분석', '가치평가론'];
  const acctList = (year) => ((D.rules['회계·세무학과'].acct_group_by_year || {})[String(year)]) || [];
  /* 입학년도 세칙에 없는 신설 과목은 그 과목이 처음 실린 연도의 세칙 분류를 따른다 (학과 확인, 2026-10-28) */
  function newCourseYear(c, year) {
    for (let y = year + 1; y <= 2026; y += 1) if (inList(acctList(y), c.t)) return y;
    return null;
  }
  function groupUnsure(c, dept, year) {
    if (ruleKey(dept) !== '회계·세무학과') return false;
    if (inList(acctList(year), c.t)) return false;
    if (year <= 2023 && inList(ACCT_AS_MGMT_PRE2024, c.t)) return false;
    if (newCourseYear(c, year)) return false;
    return prefixOf(c) === 'ACCT';
  }
  function electiveGroup(c, dept, year) {
    const key = ruleKey(dept);
    const p = prefixOf(c);
    if (key === '회계·세무학과') {
      if (inList(acctList(year), c.t)) return '회계';
      if (!(year <= 2023 && inList(ACCT_AS_MGMT_PRE2024, c.t)) && newCourseYear(c, year)) return '회계';
      if (year <= 2023 && inList(ACCT_AS_MGMT_PRE2024, c.t)) return '경영';
      return p === 'ACCT' ? '회계' : '경영';
    }
    if (key === '빅데이터응용학과') return p === 'BDAS' ? '빅데이터' : '경영';
    return '경영';
  }

  /* 과목 한 개를 이 학생의 세칙 기준으로 분류 */
  function classify(c, ctx) {
    const { g, dept, year } = ctx;
    const key = ruleKey(dept);
    if (isLibReq(c.t)) return { kind: '교양필수' };
    if (inList(g.basic_courses, c.t)) return { kind: '전공기초' };
    if (inList(g.required_courses, c.t)) return { kind: '전공필수' };
    if (g.required_choose && inList(g.required_choose.from, c.t)) return { kind: '전공필수택' };
    const info = lookup(c);
    const cat0 = c.cat || (info && info.cat);
    if (['배분이수', '자유이수', '일반선택', '교양필수'].includes(cat0)) return { kind: cat0 };
    const p = prefixOf(c);
    const biz = (info && Object.keys(info.k).length > 0) || ['MGMT', 'ACCT', 'BDAS'].includes(p);
    const inOwn = info && (info.k[key] || (key === '회계·세무학과' && info.k['회계학과']));
    if (inOwn || (key === '빅데이터응용학과' && biz)) return { kind: '전공선택', grp: electiveGroup(c, dept, year), unsure: groupUnsure(c, dept, year) };
    if (biz) return { kind: '타전공', from: '경영대' };
    if (c.cat && c.cat.startsWith('전공')) return { kind: '타전공', from: '타학과' };
    return { kind: c.cat || '일반선택' };
  }

  const sum = (arr) => arr.reduce((a, c) => a + (Number(c.cr) || 0), 0);
  const dedupe = (courses) => {
    const seen = new Map();
    courses.forEach((c) => { if (c.t) seen.set(norm(c.t), c); });
    return [...seen.values()];
  };

  function currentTerm(now) {
    const m = now.getMonth() + 1;
    if (m >= 9) return { year: now.getFullYear(), sem: 2 };
    if (m >= 3) return { year: now.getFullYear(), sem: 1 };
    return null;
  }
  function nextTerm(now) {
    const m = now.getMonth() + 1;
    if (m >= 9) return { year: now.getFullYear() + 1, sem: 1 };
    if (m <= 2) return { year: now.getFullYear(), sem: 1 };
    return { year: now.getFullYear(), sem: 2 };
  }

  /* ===== 메인 진단 ===== */
  function audit(input) {
    const year = Number(input.year);
    const dept = input.dept;
    const key = ruleKey(dept);
    const g = groupFor(dept, year);
    if (!g) return { error: `${deptLabel(dept, year)}는 ${year}학번 세칙이 없어요. 빅데이터응용학과는 2022학번부터 선택할 수 있어요.` };
    const common = D.rules[key].common;
    const multi = input.track === 'multi';
    const req = multi ? g.multi : g.single;
    const ctx = { g, dept, year };
    const courses = dedupe(input.courses || []).map((c0) => {
      const info = lookup(c0);
      const libReq = LIB_REQ.find((x) => norm(x.t) === norm(c0.t));
      const c = { ...c0, no: c0.no || (info && info.no) || null, cr: c0.cr != null && c0.cr !== '' ? Number(c0.cr) : (info ? info.cr : libReq ? libReq.cr : 3) };
      return { ...c, ...classify(c, ctx) };
    });

    // 빅데이터: 경영 필수 '택N' 처리 — 앞의 N개는 전공필수, 나머지는 경영과목군 전공선택
    if (g.required_choose) {
      let n = 0;
      courses.filter((c) => c.kind === '전공필수택').forEach((c) => {
        if (n < g.required_choose.pick) { c.kind = '전공필수'; c.choose = true; n += 1; } else { c.kind = '전공선택'; c.grp = '경영'; }
      });
    }

    /* 2027 개정 예정(행정실 확인 2026-10-28): 25학번 이전 회계(·세무)학과 단일전공자도 2026 별표2처럼
       빅데이터응용학과 등 경영대 타전공 과목을 회계과목군으로 대체 인정 (회계과목군 대체 6학점까지) */
    const retroEligible = key === '회계·세무학과' && year <= 2025 && !multi;
    const retroCands = retroEligible ? courses.filter((c) => (c.kind === '일반선택' || c.kind === '타전공') && /^(BDAS|MGMT)/.test(prefixOf(c))) : [];
    if (input.retro2027 && retroCands.length) {
      let cap = 6;
      retroCands.forEach((c) => { if (cap >= (Number(c.cr) || 0)) { c.kind = '전공선택'; c.grp = '회계'; c.retro = true; cap -= Number(c.cr) || 0; } });
    }

    /* --- 전공 --- */
    const basic = courses.filter((c) => c.kind === '전공기초');
    const required = courses.filter((c) => c.kind === '전공필수');
    const electives = courses.filter((c) => c.kind === '전공선택');
    const other = courses.filter((c) => c.kind === '타전공');
    const otherCap = multi ? 0 : byYear(g.other_major_credit_max_single ?? 9, year) || 0;
    const otherCounted = Math.min(sum(other), otherCap);

    const missingBasic = g.basic_courses.filter((t) => !basic.some((c) => norm(c.t) === norm(t)));
    const missingRequired = g.required_courses.filter((t) => !/졸업논문/.test(t) && !required.some((c) => norm(c.t) === norm(t)));
    const thesis = g.required_courses.find((t) => /졸업논문/.test(t));
    const chooseInfo = g.required_choose ? {
      pick: g.required_choose.pick,
      done: required.filter((c) => c.choose).length,
      options: g.required_choose.from.filter((t) => !courses.some((c) => norm(c.t) === norm(t))),
    } : null;

    const basicCr = sum(basic);
    const requiredCr = sum(required);
    let electiveCr = sum(electives) + otherCounted;
    // 빅데이터 단일전공: 경영과목군 상한
    const eg = req.elective_groups || {};
    const groupCr = {};
    electives.forEach((c) => { groupCr[c.grp] = (groupCr[c.grp] || 0) + (Number(c.cr) || 0); });
    const capKey = Object.keys(eg).find((k) => k.endsWith('_max'));
    let capInfo = null;
    if (capKey) {
      const grpName = capKey.startsWith('경영') ? '경영' : capKey.replace('_max', '');
      const over = Math.max(0, (groupCr[grpName] || 0) - eg[capKey]);
      electiveCr -= over;
      capInfo = { name: `${grpName}과목군`, max: eg[capKey], have: groupCr[grpName] || 0, over };
    }
    const majorTotal = basicCr + requiredCr + electiveCr;
    const totalNeed = byYear(req.total, year);
    const electiveNeed = byYear(req.elective, year);

    const groupChecks = Object.entries(eg).filter(([k]) => !k.endsWith('_max')).map(([k, need]) => {
      const name = k.replace('_min', '');
      const unsure = electives.filter((c) => c.grp === name && c.unsure).reduce((a, c) => a + (Number(c.cr) || 0), 0);
      return { name: `${name}과목군`, need, have: groupCr[name] || 0, unsure };
    });

    /* --- 교양 --- */
    const L = D.liberal.by_entry_year[String(year)];
    const libCourses = courses.filter((c) => c.kind === '교양필수');
    const lib = input.liberal || {};
    const reqStatus = LIB_REQ.map((r) => {
      const taken = libCourses.some((c) => norm(c.t) === norm(r.t)) || (lib.reqChecked || []).some((t) => norm(t) === norm(r.t));
      const exempt = r.t === '대학영어' && lib.engExempt;
      return { ...r, taken, exempt, ok: taken || exempt };
    });
    const reqCr = reqStatus.filter((r) => r.taken).reduce((a, r) => a + r.cr, 0);
    const distCr = sum(courses.filter((c) => c.kind === '배분이수')) + (Number(lib.dist) || 0);
    const freeCr = sum(courses.filter((c) => c.kind === '자유이수')) + (Number(lib.free) || 0);
    const libTotal = reqCr + distCr + freeCr;
    const areasNeed = year >= 2024 ? 3 : 0;
    const areaSet = new Set(lib.areas || []);
    courses.filter((c) => c.kind === '배분이수').forEach((c) => { const a = c.area || (lookup(c) || {}).area; if (a) areaSet.add(a); });
    const areasHave = areaSet.size;

    /* --- 총 학점 --- */
    const generalCr = sum(courses.filter((c) => c.kind === '일반선택')) + (Number(lib.general) || 0);
    const otherUncounted = sum(other) - otherCounted;
    const allCr = basicCr + requiredCr + sum(electives) + sum(other) + libTotal + generalCr;

    const rows = [];
    const row = (id, area, label, need, have, extra = {}) => rows.push({ id, area, label, need, have, ok: have >= need, short: Math.max(0, need - have), ...extra });
    row('total', '졸업', '총 이수학점', g.graduation_total, allCr);
    row('lib-req', '교양', '필수교과', LIB_REQ.length, reqStatus.filter((r) => r.ok).length, { unit: '과목', missing: reqStatus.filter((r) => !r.ok).map((r) => r.t) });
    row('lib-dist', '교양', `배분이수${areasNeed ? ` (5개 영역 중 ${areasNeed}개 영역)` : ''}`, L.distribution, distCr, areasNeed ? { areaNote: `${areasHave}/${areasNeed}개 영역`, areas: [...areaSet], ok: distCr >= L.distribution && areasHave >= areasNeed } : {});
    row('lib-free', '교양', '자유이수', L.free, freeCr);
    const libMin = L.min_total - (lib.engExempt ? 2 : 0);
    row('lib-total', '교양', '교양 합계', libMin, libTotal, lib.engExempt ? { note: '대학영어 면제 2학점을 뺀 기준 — 면제 학점은 총학점에 들어가지 않아요' } : {});
    row('m-basic', '전공', '전공기초', req.basic, basicCr, { missing: missingBasic });
    row('m-req', '전공', '전공필수', req.required, requiredCr, { missing: missingRequired, choose: chooseInfo });
    row('m-elec', '전공', '전공선택', electiveNeed, electiveCr, { groups: groupChecks, cap: capInfo });
    groupChecks.forEach((gc) => { if (gc.have < gc.need) rows.find((r) => r.id === 'm-elec').ok = false; });
    row('m-total', '전공', multi ? '전공 합계 (다전공 기준)' : '전공 합계', totalNeed, majorTotal);

    // 기타 요건
    const sw = common.sw_requirement;
    const swInfo = sw ? swStatus(courses, input, sw.credits) : null;
    if (sw) row('sw', '기타', 'SW 교과목', sw.credits, swInfo.have, { unit: '학점', note: sw.note, swCourses: swInfo.courses });
    const engCourses = courses.filter((c) => engCounts(c) && !c.plan);
    const engPlanned = courses.filter((c) => engCounts(c) && c.plan).length;
    const engNonMajor = courses.filter((c) => isEng(c) && !engCounts(c) && !c.plan);
    const engOfficial = input.official && input.official.engHave != null ? Number(input.official.engHave) : 0;
    const engNeed = (input.official && input.official.engNeed) || ENG_DEFAULT;
    const engHave = Math.max(engOfficial, engCourses.length) + (Number(input.engManual) || 0) + engPlanned;
    row('eng', '기타', '영어강의', engNeed, engHave, {
      unit: '과목', engCourses: engCourses.map((c) => ({ t: c.t, ip: !!c.ip })),
      note: `2008학년도 이후 입학생은 전공과목(전공기초·전공필수·전공선택) 영어강좌 ${engNeed}과목 이상 (편입생 1과목). 영어강의는 분반마다 정해져 진단표의 e 표시로 세요${engOfficial > engCourses.length ? `. 진단표 집계 ${engOfficial}과목` : ''}${engNonMajor.length ? `. 교양 영어강의(${engNonMajor.map((c) => c.t).join(', ')})는 세지 않았어요` : ''}.`,
    });
    const examLabel = common.graduation_exam ? '졸업시험 통과 또는 대체' : '졸업프로젝트 통과';
    rows.push({ id: 'exam', area: '기타', label: examLabel, ok: !!input.examDone, flag: true, subs: common.graduation_exam_substitutes || [], note: common.graduation_note || common.graduation_exam_note, schedule: common.graduation_project_schedule || null });
    rows.push({ id: 'thesis', area: '기타', label: `${thesis} 수강신청`, ok: !!input.thesisDone || courses.some((c) => /졸업논문/.test(c.t)), flag: true });

    /* --- 놓치기 쉬운 규정 --- */
    const tips = [];
    if (year <= 2023 && courses.some((c) => norm(c.t) === norm('경제학원론'))) tips.push('경제학원론은 19~23학번 세칙에서 전공기초예요. 인포21에 전공선택으로 기록돼 있어도 전공기초가 부족하면 전공기초로 인정받을 수 있어요 (2025 세칙 부칙 경과조치).');
    if (year <= 2023 && missingBasic.some((t) => norm(t) === norm('경제학원론'))) tips.push('19~23학번은 전공기초에 경제학원론이 들어가요. 24학번부터는 경영학원론으로 바뀌었으니 헷갈리지 마세요.');
    if (otherUncounted > 0) tips.push(`타전공 과목 ${otherUncounted}학점은 전공으로 인정되지 않아요. ${multi ? '다전공생은 타전공 인정이 없어요.' : `단일전공자는 최대 ${otherCap}학점까지만 전공선택으로 인정돼요.`}`);
    if (key === '회계·세무학과') {
      const newCs = electives.filter((c) => !inList(acctList(year), c.t) && !(year <= 2023 && inList(ACCT_AS_MGMT_PRE2024, c.t)) && newCourseYear(c, year));
      if (newCs.length) tips.push(`${newCs.map((c) => `${c.t}(${newCourseYear(c, year)} 신설)`).join(', ')} 과목은 ${year}학번 세칙에 없는 신설 과목이라, 처음 생긴 연도의 세칙에 따라 회계과목군으로 인정돼요.`);
    }
    const unsureCs = electives.filter((c) => c.unsure);
    if (unsureCs.length) tips.push(`${unsureCs.map((c) => c.t).join(', ')} 과목은 ${year}학번 세칙의 회계과목군 목록에 없어요. 진단 표에서는 회계과목군으로 셌지만, 인정되지 않으면 회계과목군이 ${sum(unsureCs)}학점 더 부족해요. 수강 계획은 인정되지 않는 경우까지 대비해서 짰으니, 학과에 꼭 확인하세요.`);
    if (multi && year <= 2023) tips.push(`다전공 전공학점은 세칙 부칙상 "선발연도" 기준으로 적용된다고 적혀 있어요. 2024학년도 이후에 다전공으로 선발됐다면 입학년도 기준(${byYear(g.multi.total, year)}학점)이 아니라 2024 개정 기준(39학점)이 적용될 수도 있으니 학과에 확인하세요.`);
    if (common.graduation_exam) tips.push('졸업시험은 공인회계사 1차 합격, 현장실습, 공인 경진대회 입상 등으로 대체할 수 있어요.');
    if (key === '회계·세무학과' && year <= 2023) tips.push('19~23학번 회계학과는 회사법·유가증권법·재무제표분석·가치평가론이 경영과목군이에요. 회계과목군 15학점 계산에서 빠지니 주의하세요.');

    /* --- 다전공 시뮬레이션 (경영대 안) --- */
    const doubles = BIZ_DEPTS.filter((d) => d !== key).map((d2) => {
      const label2 = deptLabel(d2, 2026);
      const intra0 = (g.intra_double || []).find((x) => ruleKey(x.second) === d2 || (d2 === '회계·세무학과' && /회계/.test(x.second)));
      // 같은 세칙 묶음 안에서도 연도별로 표가 다르면(by_year) 그 해 값을 쓴다 (예: 회계 2026 → 빅데이터 2전공 21학점)
      const intra = intra0 && intra0.by_year && intra0.by_year[String(year)] ? { ...intra0, ...intra0.by_year[String(year)] } : intra0;
      // 2전공 과목 목록은 같은 입학년도 세칙을 쓰고, 그 해 세칙이 없으면(빅데이터 21학번 이전) 최신 세칙을 쓴다
      const g2same = D.rules[d2].groups.find((x) => x.entry_years.includes(year));
      const g2 = g2same || D.rules[d2].groups[D.rules[d2].groups.length - 1];
      const firstNeed = intra ? intra.first_total : byYear(g.multi.total, year);
      const secondNeed = intra ? intra.second_total : byYear(g2.multi.total, g2same ? year : 2026);
      const ownSet = new Set([...g.basic_courses, ...g.required_courses].map(norm));
      const secondCourses = courses.filter((c) => prefixOf(c) === PREFIX[d2] && !ownSet.has(norm(c.t)));
      const secondCr = Math.min(sum(secondCourses), secondNeed);
      const firstHave = Math.min(majorTotal, firstNeed);
      const remainDouble = Math.max(0, firstNeed - majorTotal) + (secondNeed - secondCr);
      const remainSingle = Math.max(0, byYear(g.single.total, year) - majorTotal);
      const req2 = g2.required_courses.filter((t) => !/졸업논문/.test(t) && !ownSet.has(norm(t)) && !courses.some((c) => norm(c.t) === norm(t)));
      // 경영대 내 다전공은 2전공 학과의 졸업시험·졸업프로젝트와 졸업논문도 따로 통과해야 한다 (경영대학 학사 FAQ, 2025.07.02)
      const c2 = D.rules[d2].common || {};
      const grad2 = { exam: c2.graduation_exam ? '졸업시험(또는 대체요건)' : '졸업프로젝트', thesis: (g2.required_courses || []).find((t) => /졸업논문/.test(t)) || null };
      return { dept: label2, firstNeed, secondNeed, secondCr, firstHave, remainDouble, remainSingle, extra: remainDouble - remainSingle, req2, exact: !!intra, grad2 };
    }).sort((a, b) => a.extra - b.extra);

    /* --- 마이크로디그리 --- */
    const mds = [];
    Object.entries(D.rules).forEach(([dk, r]) => (r.common.microdegrees || []).forEach((m) => {
      const done = m.courses.filter((t) => courses.some((c) => norm(c.t) === norm(t)));
      const doneCr = done.reduce((a, t) => a + ((byTitle.get(norm(t)) || {}).cr || 3), 0);
      mds.push({ ...m, host: deptLabel(dk, 2026), done, todo: m.courses.filter((t) => !done.includes(t)), doneCr, remain: Math.max(0, m.need_credits - doneCr) });
    }));
    mds.sort((a, b) => a.remain - b.remain || b.doneCr - a.doneCr);

    /* --- 관심분야 & 추천 --- */
    const areaScore = {};
    courses.forEach((c) => { const a = (lookup(c) || {}).a; if (a) areaScore[a] = (areaScore[a] || 0) + (Number(c.cr) || 0); });
    const ranked = Object.entries(areaScore).sort((a, b) => b[1] - a[1]).map(([a, s]) => ({ area: a, cr: s }));
    const interests = input.interestsSet ? (input.interests || []) : (input.interests && input.interests.length ? input.interests : ranked.slice(0, 2).map((x) => x.area));
    const nt = nextTerm(input.now || new Date());
    const takenSet = new Set(courses.map((c) => norm(c.t)).concat([...g.basic_courses, ...g.required_courses].map(norm)));
    const offered = (c) => !c.term || c.term.includes(String(nt.sem));
    const ownCourse = (c) => c.k[key] || (key === '회계·세무학과' && c.k['회계학과']) || (key === '빅데이터응용학과' && Object.keys(c.k).length);
    const recommend = interests.map((a) => ({
      area: a,
      courses: D.courses.filter((c) => c.a === a && ownCourse(c) && !takenSet.has(norm(c.t)) && offered(c) && c.cr > 0)
        .sort((x, y) => (groupUnsure(x, dept, year) ? 1 : 0) - (groupUnsure(y, dept, year) ? 1 : 0))
        .filter((c, i, arr) => arr.findIndex((x) => norm(x.t) === norm(c.t)) === i).slice(0, 5)
        .map((c) => ({ t: c.t, no: c.no, cr: c.cr, term: c.term, grp: electiveGroup(c, dept, year), unsure: groupUnsure(c, dept, year) })),
    }));
    const mustTake = [...missingBasic.map((t) => ({ t, why: '전공기초' })), ...missingRequired.map((t) => ({ t, why: '전공필수' }))];

    const unmet = rows.filter((r) => !r.ok);
    return {
      year, dept, deptLabel: deptLabel(dept, year), track: input.track, g, rows, unmet, courses,
      credits: { all: allCr, lib: libTotal, libReq: reqCr, libDist: distCr, libFree: freeCr, basic: basicCr, required: requiredCr, elective: sum(electives) + otherCounted, other: otherUncounted, general: generalCr, need: g.graduation_total },
      tips, doubles, mds, ranked, interests, recommend, mustTake, nextTerm: nt,
      sw: swInfo ? { ...swInfo, options: swOptions({ dept, year, interests, takenNorms: new Set(courses.map((c) => norm(c.t))), freeShort: Math.max(0, L.free - freeCr), majorShort: Math.max(0, electiveNeed - electiveCr, totalNeed - majorTotal), distShort: Math.max(0, L.distribution - distCr), areas: [...areaSet] }) } : null,
      retroCandidates: retroCands.map((c) => c.t), retroApplied: !!input.retro2027 && retroCands.length > 0,
      needsCheck: [...(D.needsCheck[key] || []), ...(D.needsCheck._all || [])].filter((n) => n.years === 'all' || n.years.includes(year)).map((n) => n.text),
    };
  }

  /* ===== 인포21 성적 붙여넣기 파서 ===== */
  const CAT_RULES = [
    [/전공기초|전기(?![가-힣])/, '전공기초'], [/전공필수|전필/, '전공필수'], [/전공선택|전선/, '전공선택'],
    [/필수교과|교양필수|교필|중핵/, '교양필수'], [/배분이수|배분/, '배분이수'], [/자유이수|자유/, '자유이수'], [/일반선택|일선/, '일반선택'],
  ];
  const CODE_RE = /\b([A-Z]{2,6}\d{3,4}[A-Z]?)(?:-\d+)?\b/;
  const titles = [...byTitle.values()].map((c) => c.t).concat(LIB_REQ.map((x) => x.t)).sort((a, b) => b.length - a.length);
  function parseTranscript(text) {
    const out = [];
    const skipped = [];
    (text || '').split(/\r?\n/).forEach((line) => {
      const raw = line.trim();
      if (!raw) return;
      if (/(^|\s)(F|NP|FA)(\s|$)/.test(raw)) { skipped.push(raw); return; }
      const cells = raw.split(/\t+|\s{2,}|\s*\|\s*/).map((s) => s.trim()).filter(Boolean);
      const codeM = raw.match(CODE_RE);
      const no = codeM ? codeM[1] : null;
      const info = no ? byNo.get(no) : null;
      let title = info ? info.t : null;
      if (!title) {
        const flat = norm(raw);
        title = titles.find((t) => norm(t).length >= 3 && flat.includes(norm(t))) || null;
      }
      if (!title && no) {
        const idx = cells.findIndex((c) => c.includes(no));
        title = cells.slice(idx + 1).find((c) => /[가-힣A-Za-z]{2,}/.test(c) && !CAT_RULES.some(([re]) => re.test(c))) || null;
      }
      let crFromLine = null;
      if (!title) {
        // 목록에 없는 과목(교양 등): '이수구분/학수번호 … 과목명 … 학점' 순서에서 과목명 추출
        const toks = raw.split(/\s*\|\s*|\t+|\s+/).filter(Boolean);
        let i = toks.findIndex((x) => CODE_RE.test(x));
        if (i < 0) i = toks.findIndex((x) => CAT_RULES.some(([re]) => re.test(x)));
        if (i >= 0) {
          const j = toks.findIndex((x, k) => k > i && /^\d(\.\d)?$/.test(x) && Number(x) <= 4);
          const name = toks.slice(i + 1, j < 0 ? undefined : j).filter((x) => !CODE_RE.test(x)).join(' ');
          if (/[가-힣A-Za-z]{2,}/.test(name)) { title = name; if (j >= 0) crFromLine = Number(toks[j]); }
        }
      }
      if (!title) { if (/[가-힣]/.test(raw) && /\d/.test(raw)) skipped.push(raw); return; }
      const catR = CAT_RULES.find(([re]) => re.test(raw));
      const toks2 = raw.split(/\s*\|\s*|\t+|\s{2,}/).filter(Boolean);
      const ti = toks2.findIndex((x) => norm(x) === norm(title));
      const after = ti >= 0 ? toks2.slice(ti + 1).find((x) => /^\d(\.\d)?$/.test(x) && Number(x) <= 4) : null;
      const nums = after != null ? [Number(after)] : [];
      const known = lookup({ t: title, no });
      const cr = known ? known.cr : (LIB_REQ.find((x) => norm(x.t) === norm(title)) || {}).cr ?? crFromLine ?? (nums[0] ?? 3);
      out.push({ t: title, no: no || (known && known.no) || null, cr, cat: catR ? catR[1] : null });
    });
    return { courses: dedupe(out), skipped };
  }

  /* ===== 인포21 졸업진단표 파서 ===== */
  const DIAG_NUM = { '01': '교양필수', '04': '전공필수', '05': '전공선택', '11': '전공기초', '08': '일반선택', '20': '전공선택' };
  const MAJOR_PREFIX = /^(MGMT|ACCT|BDAS|ECON|EDU)/;
  const DIAG_ROW = /(?:(?:^|\s)(\d{2})(?:\s+\d{2})?\s+)?([A-Z]{2,6}\s?\d{3,6}[A-Z]?)\s+(.+?)\s*(\d(?:\.\d)?)\s+(20\d{2})\s*\/\s*([12])/g;
  const CUR_ROW = /(?:^|\s)(\d{2})\s+([A-Z]{2,6}\d{3,6}[A-Z]?)\s+(.+?)\s*(\d(?:\.\d)?)\s*$/;
  const GYEYEOL = { name: '경영회계계열', depts: ['경영학과', '회계·세무학과'], common: ['경영통계학', '경영학원론', '책임경영', '회계원리'] }; // 두 학과 공통 전공기초 (2026 세칙)
  const DEPT_NAMES = ['빅데이터응용학과', '회계·세무학과', '회계ㆍ세무학과', '회계세무학과', '회계학과', '경영학과'];
  const isDiagnosis = (text) => /졸\s*업\s*진\s*단\s*표|졸업기준학점/.test(text || '');
  const cleanTitle = (t) => t.replace(/^[es#@*$%G]+(?=[가-힣A-Z0-9])/, '').replace(/\s+/g, ' ').trim();
  const markOf = (t) => { const m = (t || '').trim().match(/^([es#@*$%G]+)(?=[가-힣A-Z0-9])/); return m ? m[1] : ''; };
  const swMarked = (t) => markOf(t).includes('s');

  function parseDiagnosis(text, opts = {}) {
    const cur = currentTerm(opts.now || new Date());
    const lines = (text || '').split(/\r?\n/);
    const head = lines.slice(0, 40).join(' ');
    let dept = null;
    const dm = head.match(/학\s*과\s+(\S+학과)/);
    const cand = dm ? dm[1] : (DEPT_NAMES.find((d) => head.includes(d)) || null);
    if (cand) dept = /빅데이터/.test(cand) ? '빅데이터응용학과' : /회계/.test(cand) ? '회계·세무학과' : /경영/.test(cand) ? '경영학과' : null;
    // 2026학번부터 경영학과·회계학과는 '경영회계계열'로 통합 모집한다. 학과 칸이 계열이면 학과를 정하지 않고 계열로 알린다.
    const gm = head.match(/학\s*과\s+([가-힣]+계\s*열)/) || head.match(/(경\s*영\s*회\s*계\s*계\s*열)/);
    const gyeyeol = gm ? gm[1].replace(/\s+/g, '') : null;
    if (gyeyeol) {
      const pm = head.match(/(?:주\s*전\s*공|심화전공|단일전공|진입\s*학과|배정\s*학과)\s+(경영학과|회계학과|회계·세무학과)/);
      dept = pm ? (/회계/.test(pm[1]) ? '회계·세무학과' : '경영학과') : null;
    }
    const ym = text.match(/졸업기준학점\s*\(\s*년도\s*\)\s*(20\d{2})/) || text.match(/(?:심화전공|단일전공|주전공)\s+\d\s+\S+\s+(20\d{2})/);
    const year = ym ? Number(ym[1]) : null;

    const courses = [];
    let side = 'lib';
    let libHead = null;
    let libCarry = null;
    let majCarry = null;
    let inCur = false;
    lines.forEach((line) => {
      if (/\[\s*금학기\s*수강\s*학점\s*\]/.test(line)) inCur = true;
      if (/졸업능력인증/.test(line)) inCur = false;
      if (/전공학점/.test(line) && !/교양\/기타/.test(line)) side = 'major';
      const hm = line.match(/(필수교과|배분이수|자유이수|일반선택)(?!교과\()/);
      if (hm && !/\/\s*\d+\s+\d+\s*\//.test(line)) libHead = hm[1];
      const matches = [...line.matchAll(DIAG_ROW)];
      if (inCur && !matches.length) {
        const cm = line.match(CUR_ROW);
        if (cm) {
          const code = cm[2];
          const known = byNo.get(code);
          const n = cm[1];
          const cat = n === '01' ? '교양필수' : DIAG_NUM[n] || null;
          courses.push({ t: known ? known.t : cleanTitle(cm[3]), no: code, cr: Number(cm[4]), cat, ip: true, fromCur: true, ...(swMarked(cm[3]) ? { sw: 'mark' } : {}), ...(markOf(cm[3]).includes('e') ? { eng: 'mark' } : {}) });
        }
        return;
      }
      matches.forEach((m, idx) => {
        const [, num, code0, title0, cr, yy, ss] = m;
        const code = code0.replace(/\s/g, '');
        const title = cleanTitle(title0);
        if (/학점계|전공계/.test(title)) return;
        let s = side;
        if (matches.length > 1) s = idx === 0 ? 'lib' : 'major';
        else if (num) s = ['01', '02', '03'].includes(num) ? 'lib' : 'major';
        else if (side === 'lib') {
          const kb = byNo.get(code);
          if (MAJOR_PREFIX.test(code) || (kb && Object.keys(kb.k).length)) s = 'major';
        }
        let cat;
        if (s === 'lib') {
          if (num) libCarry = num;
          const n = num || libCarry;
          cat = n === '01' ? '교양필수' : n === '02' ? (libHead === '자유이수' ? '자유이수' : libHead === '일반선택' ? '일반선택' : '배분이수') : (DIAG_NUM[n] || null);
        } else {
          if (num) majCarry = num;
          cat = DIAG_NUM[num || majCarry] || '전공선택';
        }
        const known = byNo.get(code);
        const ip = (inCur && (matches.length === 1 || idx === 0)) || (cur && Number(yy) === cur.year && Number(ss) === cur.sem);
        courses.push({ t: known ? known.t : title, no: code, cr: Number(cr), cat, yr: Number(yy), sm: Number(ss), ...(ip ? { ip: true } : {}), ...(swMarked(title0) ? { sw: 'mark' } : {}), ...(markOf(title0).includes('#') ? { gradReq: true } : {}), ...(markOf(title0).includes('e') ? { eng: 'mark' } : {}) });
      });
    });

    const official = {};
    const mj = text.match(/전공계\s*:\s*(\d+)\s*\(\s*전필\s*:\s*(\d+)\s*\/\s*(\d+)\s*전선\s*:\s*(\d+)\s*\/\s*(\d+)\s*전기\s*:\s*(\d+)\s*\/\s*(\d+)/);
    if (mj) Object.assign(official, { majorTotal: +mj[1], required: [+mj[2], +mj[3]], elective: [+mj[4], +mj[5]], basic: [+mj[6], +mj[7]] });
    const pair = (re) => { const m = text.match(re); return m ? [+m[3], +m[4]] : null; };
    official.libReq = pair(/필수교과\s+(\d+)\s*\/\s*(\d+)\s+(\d+)\s*\/\s*(\d+)/);
    official.libDist = pair(/배분이수교과(?:\([^)]*\))?\s+(\d+)\s*\/\s*(\d+)\s+(\d+)\s*\/\s*(\d+)/);
    official.libFree = pair(/자유이수\s+(\d+)\s*\/\s*(\d+)\s+(\d+)\s*\/\s*(\d+)/);
    const tm = text.match(/취득\s+(\d+)\s+(\d+)\s*\(\s*(\d+)\s*\)/);
    if (tm) Object.assign(official, { currentCr: +tm[1], total: +tm[2], totalWithCurrent: +tm[3] });
    const sm = text.match(/^\s*취득\s.*학점\s+(\d+)\s*$/m);
    const sw = sm ? Number(sm[1]) : null;
    const merged = [];
    courses.forEach((c) => {
      const ex = merged.find((x) => x.no === c.no || norm(x.t) === norm(c.t));
      if (ex) { if (c.ip) ex.ip = true; if (c.sw) ex.sw = ex.sw || c.sw; if (c.eng) ex.eng = ex.eng || c.eng; } else { const { fromCur, ...rest } = c; merged.push(rest); }
    });
    if (sw != null) official.sw = sw;
    const rc = text.match(/등\s*록\s*횟\s*수\s*(\d{1,2})(?!\d)/);
    const st = text.match(/학\s*적\s*상\s*태\s*([가-힣])\s*([가-힣])/);
    if (rc) official.regCount = Number(rc[1]);
    const hdr = lines.find((l) => /구분\s+수강학점.*영어강의/.test(l));
    if (hdr) {
      const ht = hdr.trim().split(/\s+/); const idx = ht.indexOf('영어강의') - ht.indexOf('구분') - 1;
      const val = (label) => { const l = lines.find((x) => new RegExp(`^\\s*${label}\\s+\\d`).test(x)); return l ? l.trim().split(/\s+/).slice(1)[idx] : null; };
      const need = Number(val('기준')); const have = Number(val('취득')); const pass = val('판정');
      if (Number.isFinite(need) && need > 0) official.engNeed = need;
      if (Number.isFinite(have)) official.engHave = have;
      if (pass === '통과' || pass === '미통과') official.engPass = pass === '통과';
    }
    if (st) official.status = st[1] + st[2];
    return { kind: 'diagnosis', year, dept, gyeyeol, courses: merged, official, sw, skipped: [] };
  }


  /* ===== 졸업 로드맵: 다음 학기부터 졸업까지 학기별 수강 계획 ===== */
  // 지금까지 등록한 학기 수: 진단표의 등록횟수가 있으면 그 값, 없으면 입학 학기부터 지금 학기까지(휴학 없다고 가정)
  function regSoFar(input, now) {
    const o = input.official || {};
    if (o.regCount != null && !Number.isNaN(Number(o.regCount))) return { n: Number(o.regCount), known: true };
    if (input.regCount != null && !Number.isNaN(Number(input.regCount))) return { n: Number(input.regCount), known: true }; // 예시 학생처럼 등록 학기 수를 따로 아는 경우
    const cur = currentTerm(now) || (() => { const t = nextTerm(now); return t.sem === 1 ? { year: t.year - 1, sem: 2 } : { year: t.year, sem: 1 }; })();
    const y = Number(input.year);
    return { n: Math.max(0, (cur.year - y) * 2 + cur.sem), known: false };
  }
  // 학점과 별개인 졸업 절차(졸업프로젝트 신청, 졸업논문 수강신청)를 계획 학기에 표시한다
  function placeMilestones(semesters, res, input, now) {
    if (!semesters.length) return;
    const common = D.rules[ruleKey(input.dept)].common || {};
    const reg = regSoFar(input, now);
    const regAt = (i) => reg.n + i + 1;
    const lastI = semesters.length - 1;
    const rowOf = (id) => res.rows.find((r) => r.id === id);
    const push = (i, item) => semesters[i].items.push({ cr: 0, milestone: true, ...item });
    const proj = rowOf('exam');
    if (common.graduation_project && proj && !proj.ok) {
      const minT = common.project_min_terms || 7;
      let i = semesters.findIndex((_, k) => regAt(k) >= minT);
      const early = i < 0;
      if (early) i = lastI;
      push(i, { t: '졸업프로젝트 신청·수행', why: `${minT}학기 이상 등록하면 신청${common.graduation_project_schedule ? ` · ${common.graduation_project_schedule}` : ''}${early ? ` · 계획상 ${minT}학기 등록 전이라 학과 확인 필요` : ''}` });
    }
    const th = rowOf('thesis');
    const thesisT = (res.g.required_courses || []).find((t) => /졸업논문/.test(t));
    if (th && !th.ok && thesisT) {
      const minT = common.thesis_min_terms;
      const short = minT && regAt(lastI) < minT;
      push(lastI, { t: thesisT, why: minT ? `졸업학기 수강신청 · 졸업프로젝트 통과 + ${minT}학기 이상 등록해야 Pass${short ? ` · 계획상 ${minT}학기 등록 전이라 학과 확인 필요` : ''}` : '졸업학기 수강신청 (0학점)' });
    }
    semesters.forEach((s, k) => { s.reg = regAt(k); });
    semesters.regKnown = reg.known;
  }

  function termsFrom(start, n) {
    const out = [];
    let { year, sem } = start;
    for (let i = 0; i < n; i += 1) { out.push({ year, sem }); if (sem === 1) sem = 2; else { sem = 1; year += 1; } }
    return out;
  }
  function planGraduation(input, opts = {}) {
    const maxCr = Number(opts.maxCr) || 18;
    const now = input.now || new Date();
    const terms = termsFrom(nextTerm(now), 8);
    let courses = [...(input.courses || [])];
    let sw = Number(input.sw) || 0;
    let extraAreas = 0;
    let ph = 0;
    const base = { ...input, liberal: { ...(input.liberal || {}) } };
    const run = () => audit({ ...base, courses, sw, liberal: { ...base.liberal, areas: [...(base.liberal.areas || []), ...Array.from({ length: extraAreas }, (_, i) => `추가영역${i}`)] } });
    let res = run();
    if (res.error) return { error: res.error };
    const key = ruleKey(input.dept);
    const year = Number(input.year);
    const interests = input.interestsSet ? (input.interests || []) : ((input.interests && input.interests.length) ? input.interests : res.interests);
    const blocking = (r) => r.rows.filter((x) => !x.ok && !x.flag);
    const rank = (c) => { const i = interests.indexOf(c.a); return i < 0 ? 99 : i; };
    const unsureMemo = new Map();
    const unsureOf = (c) => { if (!unsureMemo.has(c.no)) unsureMemo.set(c.no, groupUnsure(c, input.dept, year)); return unsureMemo.get(c.no); };
    const semesters = [];
    const ownCourse = (c) => c.k[key] || (key === '회계·세무학과' && c.k['회계학과']) || (key === '빅데이터응용학과' && Object.keys(c.k).length);
    const uniq = (arr) => { const seen = new Set(); return arr.filter((c) => { const k = norm(c.t); if (seen.has(k)) return false; seen.add(k); return true; }); };

    for (const term of terms) {
      if (!blocking(res).length) break;
      const items = [];
      let budget = maxCr;
      const takenSet = new Set(courses.map((c) => norm(c.t)));
      const taken = () => takenSet;
      const offered = (c) => !c.term || c.term.includes(String(term.sem));
      const add = (c, why) => {
        if (budget < c.cr || taken().has(norm(c.t))) return false;
        const unsure = !c.placeholder && groupUnsure(c, input.dept, year);
        const swAlso = !c.placeholder && !/SW/.test(why) && isSw(c);
        const why2 = (unsure ? `${why}, 과목군 인정 확인 필요` : why) + (swAlso ? ' + SW 졸업요건' : '');
        items.push({ ...c, ...(swAlso ? { sw: (lookup(c) || {}).sw || true } : {}), why: why2, unsure }); takenSet.add(norm(c.t)); budget -= c.cr; return true;
      };
      const pool = (filter) => uniq(D.courses.filter((c) => c.cr > 0 && !takenSet.has(norm(c.t)) && ownCourse(c) && offered(c) && filter(c)))
        .map((c) => ({ c, u: unsureOf(c) ? 1 : 0, s: c.sw && swLeft() > 0 ? 0 : 1, r: rank(c) }))
        .sort((a, b) => a.u - b.u || a.s - b.s || a.r - b.r || a.c.no.localeCompare(b.c.no)).map((x) => x.c);
      const swLeft = () => { const r0 = row('sw'); return (r0 ? r0.short : 0) - items.filter((i) => i.sw).reduce((a, i) => a + i.cr, 0); };
      const row = (id) => res.rows.find((r) => r.id === id);

      // ① 빠진 전공기초·전공필수
      res.mustTake.forEach((m) => { const c = byTitle.get(norm(m.t)); if (c && offered(c)) add({ t: c.t, no: c.no, cr: c.cr }, m.why); });
      // ② 빅데이터 '택N' 부족분
      const ch = row('m-req').choose;
      if (ch && ch.done < ch.pick) ch.options.slice(0, ch.pick - ch.done).forEach((t) => { const c = byTitle.get(norm(t)); if (c && offered(c)) add({ t: c.t, no: c.no, cr: c.cr }, '전공필수(택)'); });
      // ③ 교양 필수교과
      (row('lib-req').missing || []).forEach((t) => { const r = LIB_REQ.find((x) => x.t === t); if (r) add({ t: r.t, cr: r.cr }, '교양 필수교과'); });
      // ④ 전공선택 과목군 부족분
      (row('m-elec').groups || []).forEach((g) => {
        let short = g.need - (g.have - (g.unsure || 0)); // 인정 여부가 불확실한 학점은 빼고 안전하게 계획
        const grp = g.name.replace('과목군', '');
        pool((c) => electiveGroup(c, input.dept, year) === grp && !inList(res.g.basic_courses, c.t) && !inList(res.g.required_courses, c.t))
          .forEach((c) => { if (short > 0 && add({ t: c.t, no: c.no, cr: c.cr }, `${g.name}`)) short -= c.cr; });
      });
      // ⑤ 전공선택·전공 합계 부족분
      let majShort = Math.max(row('m-elec').short, row('m-total').short) - items.filter((i) => /과목군|전공/.test(i.why)).reduce((a, i) => a + i.cr, 0);
      pool((c) => !inList(res.g.basic_courses, c.t) && !inList(res.g.required_courses, c.t) && !(res.g.required_choose && inList(res.g.required_choose.from, c.t)))
        .forEach((c) => { if (majShort > 0 && add({ t: c.t, no: c.no, cr: c.cr }, '전공선택')) majShort -= c.cr; });
      // ⑥ 교양 배분·자유, SW
      let dShort = row('lib-dist').short;
      const haveAreas = new Set(row('lib-dist').areas || base.liberal.areas || []);
      let areaShort = res.year >= 2024 ? Math.max(0, 3 - haveAreas.size) : 0; // haveAreas에는 앞 학기에 넣은 계획 자리(추가영역)도 들어 있다
      // SW 배분이수 과목은 SW 요건과 배분이수(영역)를 함께 채운다. 새 영역을 먼저.
      if (swLeft() > 0 && (dShort > 0 || areaShort > 0)) {
        const opts = swOptions({ dept: input.dept, year, interests, takenNorms: takenSet, distShort: Math.max(dShort, 1), areas: [...haveAreas] })
          .filter((o) => !o.taken && o.src === 'hum' && o.campus === '서울' && o.cat === '배분이수' && offered(o))
          .sort((a, b) => (res.year >= 2024 ? (haveAreas.has(a.area) ? 1 : 0) - (haveAreas.has(b.area) ? 1 : 0) : 0) || a.score - b.score);
        for (const o of opts) {
          if (swLeft() <= 0 || (dShort <= 0 && areaShort <= 0) || budget < o.cr) break;
          if (res.year >= 2024 && dShort <= 0 && haveAreas.has(o.area)) continue;
          const fresh = res.year >= 2024 && !haveAreas.has(o.area);
          if (add({ t: o.t, no: o.no, cr: o.cr, cat: '배분이수', sw: 'hum' }, `SW 졸업요건 + 배분이수(${o.area})`)) {
            dShort -= o.cr; if (fresh) { areaShort -= 1; haveAreas.add(o.area); }
          }
        }
      }
      let nDist = Math.max(Math.ceil(Math.max(0, dShort) / 3), Math.max(0, areaShort));
      while (nDist > 0 && budget >= 3) { ph += 1; add({ t: `배분이수 교양 ${ph}`, cr: 3, cat: '배분이수', placeholder: true }, areaShort > 0 ? '배분이수 (아직 안 들은 영역)' : '배분이수'); if (areaShort > 0) { extraAreas += 1; areaShort -= 1; } nDist -= 1; }
      let fShort = row('lib-free').short;
      const swRow = row('sw');
      let swShort = swLeft();
      // SW 자유이수 과목은 SW 요건과 자유이수 교양을 함께 채운다. 개설 학기와 추천 순서(swOptions)를 따른다.
      const swPick = () => swOptions({ dept: input.dept, year, interests, takenNorms: takenSet, freeShort: fShort, majorShort: Math.max(0, majShort) })
        .filter((o) => !o.taken && ((o.src === 'hum' && o.campus === '서울' && o.cat === '자유이수') || o.own) && offered(o));
      for (const o of swPick()) {
        if (swShort <= 0 || budget < o.cr) break;
        const both = fShort > 0 && o.src === 'hum' && o.cat === '자유이수';
        if (add({ t: o.t, no: o.no, cr: o.cr, cat: o.src === 'hum' ? '자유이수' : null, sw: o.src }, both ? 'SW 졸업요건 + 자유이수' : o.own ? `SW 졸업요건 + ${o.kind}` : 'SW 졸업요건')) {
          swShort -= o.cr; if (both) fShort -= o.cr;
        }
      }
      while (fShort > 0 && budget >= 3) { ph += 1; add({ t: `자유이수 교양 ${ph}`, cr: 3, cat: '자유이수', placeholder: true }, '자유이수'); fShort -= 3; }
      while (swShort > 0 && budget >= 3) { ph += 1; if (add({ t: `SW 교과목 ${ph}`, cr: 3, cat: '일반선택', placeholder: true, sw: true }, 'SW 졸업요건')) { swShort -= 3; } else break; }
      // ⑥-2 영어강의: 과목이 아니라 분반이므로, 이번 학기 계획의 전공과목을 영어강의 분반으로 듣도록 표시
      const engRow = row('eng');
      let engShort = engRow ? engRow.short - items.filter((i) => i.eng).length : 0;
      if (engShort > 0) {
        items.filter((i) => !i.placeholder && !i.eng && i.no && ownCourse(lookup(i) || { k: {} }))
          .sort((x, y) => (/전공선택|과목군/.test(y.why) ? 1 : 0) - (/전공선택|과목군/.test(x.why) ? 1 : 0)).forEach((i) => {
          if (engShort > 0) { i.eng = 'plan'; i.why += ' · 영어강의 분반으로'; engShort -= 1; }
        });
        pool((c) => !inList(res.g.basic_courses, c.t) && !inList(res.g.required_courses, c.t))
          .forEach((c) => { if (engShort > 0 && add({ t: c.t, no: c.no, cr: c.cr, eng: 'plan' }, '영어강의 요건 (영어강의 분반으로 수강)')) engShort -= 1; });
      }
      // ⑦ 총 학점 부족분: 관심 분야 전공선택 → 자유 선택
      const planned = items.reduce((a, i) => a + i.cr, 0);
      let totShort = row('total').short - planned;
      // 독립심화학습처럼 교수와 따로 정해야 하는 과목은 졸업학점 채우기용으로 넣지 않는다
      pool((c) => interests.includes(c.a) && !inList(res.g.basic_courses, c.t) && !inList(res.g.required_courses, c.t) && !/독립심화학습/.test(c.t))
        .forEach((c) => { if (totShort > 0 && budget >= c.cr && totShort >= 3 && add({ t: c.t, no: c.no, cr: c.cr }, '관심 분야 (졸업학점 채우기)')) totShort -= c.cr; });
      while (totShort > 0 && budget >= 3) { ph += 1; add({ t: `자유 선택 ${ph}`, cr: 3, cat: '일반선택', placeholder: true }, '졸업학점 채우기 (교양·일반선택 아무거나)'); totShort -= 3; }

      courses = courses.concat(items.map((i) => ({ t: i.t, no: i.no || null, cr: i.cr, cat: i.cat || null, plan: true, ...(i.sw ? { sw: i.sw } : {}), ...(i.eng ? { eng: i.eng } : {}) })));
      res = run();
      if (!items.length) break; // 더 넣을 과목이 없으면 빈 학기를 만들지 않고 멈춘다
      semesters.push({ ...term, items, credits: items.reduce((a, i) => a + i.cr, 0), unmetAfter: blocking(res).map((r) => r.label) });
    }
    const done = !blocking(res).length;
    placeMilestones(semesters, res, input, now);
    return { semesters, done, maxCr, interests, finalRows: res.rows, flags: res.rows.filter((r) => r.flag && !r.ok).map((r) => r.label) };
  }

  /* ===== 학점포기 시뮬레이션 =====
     근거: 제58대 서울캠퍼스 총학생회 MATE '2026학년도 2학기 학점 포기 제도 신청 안내' (학교 공지 요약).
     성적은 진단표에 없으므로 '어떤 과목을 포기해도 졸업요건이 유지되는지'만 판단한다. */
  const WITHDRAW = { minReg: 7, period: '2026. 9. 15.(화) 09:30 ~ 9. 21.(월) 17:00', periodEnd: '2026-09-21' };
  // 국가장학금 심사 대상 학기 = 성적이 나온 가장 최근 정규학기 (이번 학기의 바로 전 학기)
  function scholarshipTerm(now) {
    const cur = currentTerm(now || new Date());
    if (!cur) { const d = now || new Date(); return { year: d.getFullYear() - 1, sem: 2 }; }
    return cur.sem === 2 ? { year: cur.year, sem: 1 } : { year: cur.year - 1, sem: 2 };
  }
  function withdrawEligibility(official) {
    if (!official || official.regCount == null) return { known: false };
    const reg = official.regCount;
    const status = official.status || null;
    const reasons = [];
    if (reg < WITHDRAW.minReg) reasons.push(`등록 ${reg}학기 (7학기 이상부터 신청 가능)`);
    if (status && status !== '재학') reasons.push(`학적상태 ${status} (재학생만 신청 가능)`);
    return { known: true, reg, status, ok: reasons.length === 0, reasons };
  }
  const blockingIds = (res) => new Set(res.rows.filter((r) => !r.ok && !r.flag).map((r) => r.id));
  const MUST_KINDS = ['전공기초', '전공필수', '교양필수'];
  // 전공선택 안의 과목군(회계·경영·빅데이터) 중 원래 충족이던 것이 새로 부족해지는 경우
  const groupBreaks = (before, after) => {
    const g0 = ((before.rows.find((r) => r.id === 'm-elec') || {}).groups) || [];
    const g1 = ((after.rows.find((r) => r.id === 'm-elec') || {}).groups) || [];
    return g1.filter((g) => g.have < g.need && (g0.find((x) => x.name === g.name) || { have: 0 }).have >= g.need)
      .map((g) => ({ label: g.name, short: g.need - g.have }));
  };
  function withoutCourses(input, names) {
    const drop = new Set(names.map(norm));
    const removed = (input.courses || []).filter((c) => drop.has(norm(c.t)));
    const swCr = removed.filter((c) => isSw(c)).reduce((a, c) => a + (Number(c.cr) || 0), 0);
    const engN = removed.filter((c) => engCounts(c)).length;
    const official = input.official ? { ...input.official, ...(input.official.sw != null ? { sw: Math.max(0, input.official.sw - swCr) } : {}), ...(input.official.engHave != null ? { engHave: Math.max(0, input.official.engHave - engN) } : {}) } : input.official;
    return { ...input, official, courses: (input.courses || []).filter((c) => !drop.has(norm(c.t))) };
  }
  // 과목 하나씩 뺐을 때의 위험도 (이번 학기 수강 과목 포함 기준)
  function withdrawRisks(input) {
    const base = audit(input);
    if (base.error) return { error: base.error };
    const baseUnmet = blockingIds(base);
    const sch = scholarshipTerm(input.now);
    const rowsById = (res) => Object.fromEntries(res.rows.map((r) => [r.id, r]));
    const b = rowsById(base);
    const items = base.courses.filter((c) => !c.ip && !c.plan).map((c) => {
      const after = audit(withoutCourses(input, [c.t]));
      const a = rowsById(after);
      const broken = after.rows.filter((r) => !r.ok && !r.flag && !baseUnmet.has(r.id)).map((r) => r.label).concat(groupBreaks(base, after).map((g) => g.label));
      const worse = after.rows.filter((r) => !r.flag && baseUnmet.has(r.id) && r.id !== 'total' && (r.short || 0) > (b[r.id].short || 0)).map((r) => r.label);
      const notes = [];
      let level = 'ok';
      if (MUST_KINDS.includes(c.kind)) { level = 'red'; notes.push(`${c.kind} 과목이라 포기하면 다시 들어야 해요`); }
      if (c.gradReq) { level = 'red'; notes.push('진단표에 졸업필수(#)로 표시된 과목이라 졸업불가 판정이 날 수 있어요'); }
      const kindLabel = { 전공기초: '전공기초', 전공필수: '전공필수', 교양필수: '필수교과' }[c.kind];
      const extra = broken.filter((l) => l !== kindLabel);
      if (broken.length) { level = 'red'; if (extra.length) notes.push(`포기하면 새로 부족해져요: ${extra.join(', ')}`); }
      if (worse.length && !broken.length && !MUST_KINDS.includes(c.kind) && !c.gradReq) { if (level === 'ok') level = 'warn'; notes.push(`이미 부족한 요건(${worse.join(', ')})이 ${c.cr}학점 더 늘어나요. 다른 과목으로 채우면 돼요`); }
      const schTerm = c.yr === sch.year && c.sm === sch.sem;
      if (schTerm) { if (level === 'ok') level = 'warn'; notes.push(`${sch.year}-${sch.sem}학기 과목: 국가장학금 심사 대상 학기라 포기하면 장학금 환수 위험이 있어요`); }
      if (!notes.length) notes.push(a.total && a.total.ok ? '포기해도 졸업요건이 유지돼요' : '다른 요건은 그대로고 졸업까지 남은 학점만 늘어나요');
      return { t: c.t, no: c.no, cr: c.cr, kind: c.kind, grp: c.grp, yr: c.yr || null, sm: c.sm || null, sw: isSw(c), level, notes, schTerm };
    });
    const order = { red: 2, warn: 1, ok: 0 };
    items.sort((x, y) => order[x.level] - order[y.level] || (y.yr || 0) - (x.yr || 0) || (y.sm || 0) - (x.sm || 0));
    return { items, scholarship: sch, eligibility: withdrawEligibility(input.official), base };
  }
  // 고른 과목들을 함께 포기했을 때 전·후 비교
  function withdrawSim(input, names, opts = {}) {
    const before = audit(input);
    const afterInput = withoutCourses(input, names);
    const after = audit(afterInput);
    const pb = planGraduation(input, opts);
    const pa = planGraduation(afterInput, opts);
    const baseUnmet = blockingIds(before);
    const broken = after.rows.filter((r) => !r.ok && !r.flag && !baseUnmet.has(r.id)).map((r) => ({ label: r.label, short: r.short, unit: r.unit, missing: r.missing })).concat(groupBreaks(before, after));
    const total = (res) => res.rows.find((r) => r.id === 'total');
    const removed = before.courses.filter((c) => names.map(norm).includes(norm(c.t)));
    return {
      removedCr: removed.reduce((a, c) => a + (Number(c.cr) || 0), 0), removed: removed.map((c) => c.t),
      before: { have: total(before).have, short: total(before).short, terms: pb.semesters.length, done: pb.done },
      after: { have: total(after).have, short: total(after).short, terms: pa.semesters.length, done: pa.done },
      broken, firstTerm: pa.semesters[0] || null, planAfter: pa,
    };
  }

  function parseAny(text, opts) {
    if (isDiagnosis(text)) return parseDiagnosis(text, opts);
    return { kind: 'transcript', ...parseTranscript(text) };
  }

  function searchCourses(q, limit = 8) {
    const k = norm(q);
    if (!k) return [];
    const pool = [...byTitle.values()].concat(LIB_REQ.map((x) => ({ t: x.t, cr: x.cr, no: null, k: {}, lib: true })));
    return pool.filter((c) => norm(c.t).includes(k) || (c.no || '').toLowerCase().includes(k)).slice(0, limit);
  }

  root.KHU = { engCounts, regSoFar, GYEYEOL, isEng, withdrawRisks, withdrawSim, withdrawEligibility, scholarshipTerm, WITHDRAW, swOptions, isSw, SW_LIST, audit, planGraduation, currentTerm, parseTranscript, parseDiagnosis, parseAny, isDiagnosis, searchCourses, deptLabel, groupFor, LIB_REQ, norm, nextTerm, lookup };
})(typeof window !== 'undefined' ? window : globalThis);
