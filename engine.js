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
  const deptLabel = (dept, year) => (ruleKey(dept) === '회계·세무학과' ? (year >= 2026 ? '회계학과' : '회계·세무학과') : dept);
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
    if (capKey) {
      const grpName = capKey.startsWith('경영') ? '경영' : capKey.replace('_max', '');
      const over = Math.max(0, (groupCr[grpName] || 0) - eg[capKey]);
      electiveCr -= over;
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
    row('m-elec', '전공', '전공선택', electiveNeed, electiveCr, { groups: groupChecks });
    groupChecks.forEach((gc) => { if (gc.have < gc.need) rows.find((r) => r.id === 'm-elec').ok = false; });
    row('m-total', '전공', multi ? '전공 합계 (다전공 기준)' : '전공 합계', totalNeed, majorTotal);

    // 기타 요건
    const sw = common.sw_requirement;
    const swInfo = sw ? swStatus(courses, input, sw.credits) : null;
    if (sw) row('sw', '기타', 'SW 교과목', sw.credits, swInfo.have, { unit: '학점', note: sw.note, swCourses: swInfo.courses });
    const examLabel = common.graduation_exam ? '졸업시험 통과 또는 대체' : '졸업프로젝트 통과';
    rows.push({ id: 'exam', area: '기타', label: examLabel, ok: !!input.examDone, flag: true, subs: common.graduation_exam_substitutes || [], note: common.graduation_note || common.graduation_exam_note });
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
    if (key === '회계·세무학과' && year <= 2023) tips.push('19~23학번 회계·세무학과는 회사법·유가증권법·재무제표분석·가치평가론이 경영과목군이에요. 회계과목군 15학점 계산에서 빠지니 주의하세요.');

    /* --- 다전공 시뮬레이션 (경영대 안) --- */
    const doubles = BIZ_DEPTS.filter((d) => d !== key).map((d2) => {
      const label2 = deptLabel(d2, 2026);
      const intra = (g.intra_double || []).find((x) => ruleKey(x.second) === d2 || (d2 === '회계·세무학과' && /회계/.test(x.second)));
      const g2 = D.rules[d2].groups[D.rules[d2].groups.length - 1];
      const firstNeed = intra ? intra.first_total : byYear(g.multi.total, year);
      const secondNeed = intra ? intra.second_total : byYear(g2.multi.total, 2026);
      const ownSet = new Set([...g.basic_courses, ...g.required_courses].map(norm));
      const secondCourses = courses.filter((c) => prefixOf(c) === PREFIX[d2] && !ownSet.has(norm(c.t)));
      const secondCr = Math.min(sum(secondCourses), secondNeed);
      const firstHave = Math.min(majorTotal, firstNeed);
      const remainDouble = Math.max(0, firstNeed - majorTotal) + (secondNeed - secondCr);
      const remainSingle = Math.max(0, byYear(g.single.total, year) - majorTotal);
      const req2 = g2.required_courses.filter((t) => !/졸업논문/.test(t) && !ownSet.has(norm(t)) && !courses.some((c) => norm(c.t) === norm(t)));
      return { dept: label2, firstNeed, secondNeed, secondCr, firstHave, remainDouble, remainSingle, extra: remainDouble - remainSingle, req2, exact: !!intra };
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
  const DIAG_ROW = /(?:(?:^|\s)(\d{2})(?:\s+\d{2})?\s+)?([A-Z]{2,6}\s?\d{3,5}[A-Z]?)\s+(.+?)\s*(\d(?:\.\d)?)\s+(20\d{2})\s*\/\s*([12])/g;
  const CUR_ROW = /(?:^|\s)(\d{2})\s+([A-Z]{2,6}\d{3,5}[A-Z]?)\s+(.+?)\s*(\d(?:\.\d)?)\s*$/;
  const DEPT_NAMES = ['빅데이터응용학과', '회계·세무학과', '회계ㆍ세무학과', '회계세무학과', '회계학과', '경영학과'];
  const isDiagnosis = (text) => /졸\s*업\s*진\s*단\s*표|졸업기준학점/.test(text || '');
  const cleanTitle = (t) => t.replace(/^[es#@*$%G]+(?=[가-힣A-Z0-9])/, '').replace(/\s+/g, ' ').trim();
  const swMarked = (t) => { const m = (t || '').trim().match(/^([es#@*$%G]+)(?=[가-힣A-Z0-9])/); return !!(m && m[1].includes('s')); };

  function parseDiagnosis(text, opts = {}) {
    const cur = currentTerm(opts.now || new Date());
    const lines = (text || '').split(/\r?\n/);
    const head = lines.slice(0, 40).join(' ');
    let dept = null;
    const dm = head.match(/학\s*과\s+(\S+학과)/);
    const cand = dm ? dm[1] : (DEPT_NAMES.find((d) => head.includes(d)) || null);
    if (cand) dept = /빅데이터/.test(cand) ? '빅데이터응용학과' : /회계/.test(cand) ? '회계·세무학과' : /경영/.test(cand) ? '경영학과' : null;
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
          courses.push({ t: known ? known.t : cleanTitle(cm[3]), no: code, cr: Number(cm[4]), cat, ip: true, fromCur: true, ...(swMarked(cm[3]) ? { sw: 'mark' } : {}) });
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
        courses.push({ t: known ? known.t : title, no: code, cr: Number(cr), cat, ...(ip ? { ip: true } : {}), ...(swMarked(title0) ? { sw: 'mark' } : {}) });
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
      if (ex) { if (c.ip) ex.ip = true; if (c.sw) ex.sw = ex.sw || c.sw; } else { const { fromCur, ...rest } = c; merged.push(rest); }
    });
    if (sw != null) official.sw = sw;
    return { kind: 'diagnosis', year, dept, courses: merged, official, sw, skipped: [] };
  }


  /* ===== 졸업 로드맵: 다음 학기부터 졸업까지 학기별 수강 계획 ===== */
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
      let areaShort = res.year >= 2024 ? Math.max(0, 3 - haveAreas.size - extraAreas) : 0;
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
      // ⑦ 총 학점 부족분: 관심 분야 전공선택 → 자유 선택
      const planned = items.reduce((a, i) => a + i.cr, 0);
      let totShort = row('total').short - planned;
      pool((c) => interests.includes(c.a) && !inList(res.g.basic_courses, c.t) && !inList(res.g.required_courses, c.t))
        .forEach((c) => { if (totShort > 0 && budget >= c.cr && totShort >= 3 && add({ t: c.t, no: c.no, cr: c.cr }, '관심 분야 (졸업학점 채우기)')) totShort -= c.cr; });
      while (totShort > 0 && budget >= 3) { ph += 1; add({ t: `자유 선택 ${ph}`, cr: 3, cat: '일반선택', placeholder: true }, '졸업학점 채우기 (교양·일반선택 아무거나)'); totShort -= 3; }

      courses = courses.concat(items.map((i) => ({ t: i.t, no: i.no || null, cr: i.cr, cat: i.cat || null, plan: true, ...(i.sw ? { sw: i.sw } : {}) })));
      res = run();
      semesters.push({ ...term, items, credits: items.reduce((a, i) => a + i.cr, 0), unmetAfter: blocking(res).map((r) => r.label) });
      if (!items.length) break;
    }
    const done = !blocking(res).length;
    return { semesters, done, maxCr, interests, finalRows: res.rows, flags: res.rows.filter((r) => r.flag && !r.ok).map((r) => r.label) };
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

  root.KHU = { swOptions, isSw, SW_LIST, audit, planGraduation, currentTerm, parseTranscript, parseDiagnosis, parseAny, isDiagnosis, searchCourses, deptLabel, groupFor, LIB_REQ, norm, nextTerm, lookup };
})(typeof window !== 'undefined' ? window : globalThis);
