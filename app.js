/* 경영대 졸업사정표 — 화면 */
(function () {
  'use strict';
  const K = window.KHU;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const NOW = new Date();
  const list = (s) => s.split(',').map((t) => ({ t: t.trim() }));

  const ipList = (x) => list(x).map((c) => ({ ...c, ip: true }));
  const SAMPLES = {
    acct: {
      // 팀원이 직접 제공한 실제 졸업진단표의 과목 목록 (이름·학번 등 신상 정보는 넣지 않음)
      name: '7학기 재학 중, 실제 진단표 기반',
      year: 2019, dept: '회계·세무학과', track: 'single', sw: 0, engManual: 0, examDone: false, thesisDone: false,
      courses: [
        {t: '인간의가치탐색', no: 'GEC1102', cr: 3, cat: '교양필수', yr: 2019, sm: 2},
        {t: '세계와시민', no: 'GEC1104', cr: 3, cat: '교양필수', yr: 2019, sm: 2},
        {t: '빅뱅에서문명까지', no: 'GEC0103', cr: 3, cat: '교양필수', yr: 2020, sm: 1},
        {t: '대학영어', no: 'GEC1403', cr: 2, cat: '교양필수', yr: 2019, sm: 1},
        {t: '성찰과표현', no: 'GEC1105', cr: 3, cat: '교양필수', yr: 2019, sm: 1},
        {t: '주제연구', no: 'GEC2001', cr: 3, cat: '교양필수', yr: 2022, sm: 2},
        {t: '인간과식물', no: 'GED1116', cr: 3, cat: '배분이수', yr: 2022, sm: 2},
        {t: '모두를위한물리학', no: 'GED1246', cr: 3, cat: '배분이수', yr: 2024, sm: 1},
        {t: '공간과권력으로보는세계', no: 'GED1529', cr: 3, cat: '배분이수', yr: 2023, sm: 1},
        {t: '인구와주거', no: 'GED11037', cr: 3, cat: '배분이수', yr: 2024, sm: 1},
        {t: '메타버스,가상경제의길을열다(경희사이버)', no: 'KHCU0077', cr: 3, cat: '배분이수', yr: 2024, sm: 1},
        {t: '두얼굴의인류사:전쟁과평화', no: 'GED1511', cr: 3, cat: '배분이수', yr: 2026, sm: 2, ip: true},
        {t: '디지털세계의신인류,딥러닝과인공지능', no: 'GED1243', cr: 3, cat: '배분이수', yr: 2019, sm: 2, sw: 'mark'},
        {t: '조깅과워킹', no: 'GEE1638', cr: 1, cat: '자유이수', yr: 2019, sm: 1},
        {t: '윈드서핑', no: 'GEE1635', cr: 1, cat: '자유이수', yr: 2020, sm: 1},
        {t: '새로운생명체:인공지능', no: 'GEE1953', cr: 3, cat: '자유이수', yr: 2020, sm: 1, sw: 'mark'},
        {t: '자본주의똑바로알기', no: 'ETC0108', cr: 2, cat: '일반선택', yr: 2020, sm: 1},
        {t: '빅데이터프로그래밍2', no: 'BDAS1004', cr: 3, cat: '일반선택', yr: 2026, sm: 2, ip: true, sw: 'mark'},
        {t: 'DB기초및응용', no: 'BDAS2006', cr: 3, cat: '일반선택', yr: 2026, sm: 2, ip: true, eng: 'mark'},
        {t: '브레인앤슬립,뇌의건강을책임지다(경희사이버)', no: 'KHCU0119', cr: 3, cat: '일반선택', yr: 2026, sm: 2, ip: true},
        {t: '회사법', no: 'ACCT2003', cr: 3, cat: '전공선택', ip: true},
        {t: '회계정보애널리틱스', no: 'ACCT3013', cr: 3, cat: '전공선택', ip: true, sw: 'mark'},
        {t: '금융파생상품론', no: 'MGMT3006', cr: 3, cat: '전공선택', ip: true},
        {t: '관리회계1', no: 'ACCT1002', cr: 3, cat: '전공필수', yr: 2019, sm: 2},
        {t: '마케팅원론', no: 'MGMT2002', cr: 3, cat: '전공필수', yr: 2020, sm: 1, eng: 'mark'},
        {t: '조직행동론', no: 'MGMT2005', cr: 3, cat: '전공필수', yr: 2020, sm: 1, eng: 'mark'},
        {t: '재무회계1', no: 'ACCT2005', cr: 3, cat: '전공필수', yr: 2022, sm: 2},
        {t: '경영정보시스템', no: 'MGMT2001', cr: 3, cat: '전공필수', yr: 2022, sm: 2},
        {t: '재무관리', no: 'MGMT2004', cr: 3, cat: '전공필수', yr: 2022, sm: 2},
        {t: '세무회계1', no: 'ACCT2004', cr: 3, cat: '전공필수', yr: 2023, sm: 1},
        {t: '재무회계2', no: 'ACCT2006', cr: 3, cat: '전공필수', yr: 2023, sm: 1},
        {t: '경영커뮤니케이션', no: 'MGMT1005', cr: 3, cat: '전공선택', yr: 2019, sm: 2, eng: 'mark'},
        {t: '세법총론', no: 'ACCT2001', cr: 3, cat: '전공선택', yr: 2020, sm: 1},
        {t: '책임경영', no: 'MGMT1003', cr: 3, cat: '전공선택', yr: 2023, sm: 1},
        {t: '세무회계2', no: 'ACCT3004', cr: 3, cat: '전공선택', yr: 2024, sm: 1},
        {t: '투자론', no: 'MGMT2010', cr: 3, cat: '전공선택', yr: 2024, sm: 1},
        {t: '회계원리', no: 'ACCT1001', cr: 3, cat: '전공기초', yr: 2019, sm: 1},
        {t: '경제학원론', no: 'ECON1001', cr: 3, cat: '전공기초', yr: 2019, sm: 1},
        {t: '경영통계학', no: 'MGMT1001', cr: 3, cat: '전공기초', yr: 2019, sm: 1},
      ],
      liberal: { dist: 0, free: 0, general: 0, areas: [] },
    },
    mgmt: {
      // 제공받은 실제 졸업진단표의 과목 목록 (이름·학번 등 신상 정보는 넣지 않음)
      name: '7학기 재학 중, 실제 진단표 기반',
      year: 2021, dept: '경영학과', track: 'single', sw: 0, engManual: 0, examDone: false, thesisDone: false,
      courses: [
        {t: '인간의가치탐색', no: 'GEC1102', cr: 3, cat: '교양필수', yr: 2021, sm: 1},
        {t: '빅뱅에서문명까지', no: 'GEC0103', cr: 3, cat: '교양필수', yr: 2022, sm: 1},
        {t: '세계와시민', no: 'GEC1104', cr: 3, cat: '교양필수', yr: 2022, sm: 2},
        {t: '성찰과표현', no: 'GEC1105', cr: 3, cat: '교양필수', yr: 2021, sm: 2},
        {t: '주제연구', no: 'GEC2001', cr: 3, cat: '교양필수', yr: 2022, sm: 2},
        {t: '야담으로읽는한국역사와문화', no: 'GED1655', cr: 3, cat: '배분이수', yr: 2021, sm: 1},
        {t: '인간,장소,지명', no: 'GED1638', cr: 3, cat: '배분이수', yr: 2021, sm: 2},
        {t: '서양사상의번역과동아시아의근대', no: 'GED1614', cr: 3, cat: '배분이수', yr: 2023, sm: 1},
        {t: '비만의사회학', no: 'GED1452', cr: 3, cat: '배분이수', yr: 2022, sm: 1},
        {t: '메카-필로소피아:인간화된기계와기계화된인간사이', no: 'GED1970', cr: 3, cat: '배분이수', yr: 2021, sm: 1, sw: 'mark'},
        {t: '후마니타스특강', no: 'GEE1286', cr: 2, cat: '자유이수', yr: 2023, sm: 1},
        {t: '승마', no: 'GEE1626', cr: 1, cat: '자유이수', yr: 2026, sm: 2, ip: true},
        {t: '관리회계2', no: 'ACCT3003', cr: 3, cat: '일반선택', yr: 2022, sm: 2},
        {t: '인적자원관리', no: 'HSPMT3003', cr: 3, cat: '일반선택', yr: 2023, sm: 1},
        {t: '고급회계', no: 'ACCT3002', cr: 3, cat: '일반선택', yr: 2025, sm: 2},
        {t: '세무회계2', no: 'ACCT3004', cr: 3, cat: '일반선택', yr: 2025, sm: 2},
        {t: '회계정보애널리틱스', no: 'ACCT3013', cr: 3, cat: '일반선택', yr: 2026, sm: 2, ip: true, sw: 'mark'},
        {t: '금융파생상품론', no: 'MGMT3006', cr: 3, cat: '전공선택', ip: true},
        {t: '보험학원론', no: 'MGMT3009', cr: 3, cat: '전공선택', ip: true},
        {t: '연금론', no: 'MGMT3335', cr: 3, cat: '전공선택', ip: true},
        {t: '경영세미나', no: 'MGMT3339', cr: 3, cat: '전공선택', ip: true},
        {t: '관리회계1', no: 'ACCT1002', cr: 3, cat: '전공필수', yr: 2021, sm: 2},
        {t: '마케팅원론', no: 'MGMT2002', cr: 3, cat: '전공필수', yr: 2022, sm: 1},
        {t: '생산운영관리', no: 'MGMT2003', cr: 3, cat: '전공필수', yr: 2022, sm: 1, eng: 'mark'},
        {t: '조직행동론', no: 'MGMT2005', cr: 3, cat: '전공필수', yr: 2022, sm: 1, eng: 'mark'},
        {t: '경영정보시스템', no: 'MGMT2001', cr: 3, cat: '전공필수', yr: 2022, sm: 2},
        {t: '재무관리', no: 'MGMT2004', cr: 3, cat: '전공필수', yr: 2022, sm: 2},
        {t: '경영커뮤니케이션', no: 'MGMT1005', cr: 3, cat: '전공선택', yr: 2021, sm: 1, eng: 'mark'},
        {t: '재무회계1', no: 'ACCT2005', cr: 3, cat: '전공선택', yr: 2022, sm: 2},
        {t: '세무회계1', no: 'ACCT2004', cr: 3, cat: '전공선택', yr: 2023, sm: 1},
        {t: '재무회계2', no: 'ACCT2006', cr: 3, cat: '전공선택', yr: 2023, sm: 1},
        {t: '조직개발', no: 'MGMT4021', cr: 3, cat: '전공선택', yr: 2025, sm: 2},
        {t: '캡스톤디자인1(경영학)', no: 'MGMT4030', cr: 3, cat: '전공선택', yr: 2025, sm: 2},
        {t: '회계원리', no: 'ACCT1001', cr: 3, cat: '전공기초', yr: 2021, sm: 1},
        {t: '경영통계학', no: 'MGMT1001', cr: 3, cat: '전공기초', yr: 2021, sm: 1},
        {t: '경제학원론', no: 'ECON1001', cr: 3, cat: '전공기초', yr: 2021, sm: 2},
        {t: '책임경영', no: 'MGMT1003', cr: 3, cat: '전공기초', yr: 2021, sm: 2},
      ],
      liberal: { dist: 0, free: 0, general: 0, areas: [] },
    },
    bdas: {
      name: '4학년 2학기 재학 중',
      year: 2022, dept: '빅데이터응용학과', track: 'single', sw: 0, engManual: 3, examDone: false, thesisDone: false,
      courses: list('경영통계학,경제학원론,회계원리,책임경영,빅데이터수학,빅데이터프로그래밍1,빅데이터통계학,마케팅원론,재무관리,조직행동론,빅데이터프로그래밍2,빅데이터세미나,머신러닝기초및응용,빅데이터개론,투자론,비즈니스애널리틱스,인간의가치탐색,세계와시민,빅뱅에서문명까지,성찰과표현,주제연구,대학영어')
        .concat(ipList('DB기초및응용,소셜네트워크과학,딥러닝기초및응용,빅데이터알고리즘')),
      liberal: { dist: 12, free: 3, general: 15, areas: [] },
    },
  };
  const PASTE_EXAMPLE = [
    '년도\t학기\t이수구분\t학수번호\t교과목명\t학점\t등급',
    '2023\t1\t전공기초\tACCT1001\t회계원리\t3\tA+',
    '2023\t1\t전공기초\tMGMT1007\t경영학원론\t3\tA0',
    '2023\t1\t필수교과\tHUMA1001\t성찰과표현\t3\tB+',
    '2023\t2\t전공필수\tMGMT2002\t마케팅원론\t3\tA0',
    '2023\t2\t배분이수\tHUMA2105\t철학의이해\t3\tB0',
    '2024\t1\t전공필수\tMGMT2004\t재무관리\t3\tF',
    '2024\t1\t전공선택\tMGMT2008\t소비자행동론\t3\tA+',
    '2024\t2\t자유이수\tHUMA3201\t글쓰기와토론\t2\tP',
  ].join('\n');

  const state = {
    year: 2024, dept: '경영학과', track: 'single', sw: 0, engManual: 0, examDone: false, thesisDone: false,
    courses: [], liberal: { dist: 0, free: 0, general: 0, areas: [], reqChecked: [], engExempt: false },
    interests: [], tab: 'paste', sampleName: null, official: null, gyeyeol: null, maxCr: 18, view: 'audit', withdraw: [],
  };
  let lastCount = -1;
  // ChatKHU 질문: 사용자가 고친 내용은 화면이 다시 그려져도 유지한다 (다른 학생을 불러오면 초기화)
  let promptEdit = null; // { text, base }
  let promptBase = '';
  const CHATKHU_URL = 'https://chat.khu.ac.kr/'; // ChatKHU 주소는 여기 한 곳에서만 바꾸면 된다

  // 경영회계계열(2026~) 학생은 학과 대신 계열과 '진입 기준 학과'를 함께 보여 준다
  const whoDept = (res) => (state.gyeyeol ? `${state.gyeyeol} (${res.deptLabel} 진입 기준)` : res.deptLabel);

  /* ---------- 경영회계계열: 진입 학과별 비교 ---------- */
  function gyeyeolSection(input, res) {
    const G = K.GYEYEOL;
    const pick = (r, label) => r.rows.find((x) => x.label === label) || { need: 0, have: 0 };
    const cols = G.depts.map((d) => {
      const r = d === res.dept ? res : K.audit({ ...input, dept: d });
      const g = K.groupFor(d, input.year);
      return { d, r, g, label: K.deptLabel(d, input.year) };
    }).filter((c) => !c.r.error);
    if (cols.length < 2) return '';
    const [a, b] = cols;
    const only = (x, y) => x.g.required_courses.filter((t) => !y.g.required_courses.includes(t) && !/^졸업논문/.test(t));
    const taken = new Set(state.courses.map((c) => K.norm(c.t)));
    const left = (row) => Math.max(0, (row.need || 0) - (row.have || 0));
    const line = (name, label) => `<tr><td>${name}</td>${cols.map((c) => { const row = pick(c.r, label); return `<td>${row.have}/${row.need}학점${left(row) ? ` <span class="short">${left(row)} 남음</span>` : ' <span class="ok">충족</span>'}</td>`; }).join('')}</tr>`;
    const reqOnly = (x, y) => { const l = only(x, y); return l.length ? l.map((t) => `${esc(t)}${taken.has(K.norm(t)) ? ' ✓' : ''}`).join(', ') : '없음'; };
    const pre = G.common.map((t) => `${esc(t)} ${taken.has(K.norm(t)) ? '<span class="ok">이수</span>' : '<span class="short">아직</span>'}`).join(' · ');
    return `<section class="section gy">
      <h3>${esc(state.gyeyeol)} · 진입 학과별로 비교해 보기</h3>
      <p class="lead">${esc(state.gyeyeol)}로 입학하면 2학년부터 경영학과와 회계학과 중 하나를 자유롭게 골라요. 같은 수강 기록을 두 학과 세칙에 각각 대 봤어요. 지금 사정표는 <b>${esc(res.deptLabel)}</b> 기준이에요.</p>
      <table class="sim gy-cmp"><thead><tr><th>요건</th>${cols.map((c) => `<th>${esc(c.label)}${c.d === res.dept ? ' <span class="meta">(지금 보기)</span>' : ''}</th>`).join('')}</tr></thead><tbody>
        ${line('전공기초', '전공기초')}${line('전공필수', '전공필수')}${line('전공선택', '전공선택')}${line('전공 합계', '전공 합계')}
        <tr><td>이 학과에만 있는 전공필수</td><td>${reqOnly(a, b)}</td><td>${reqOnly(b, a)}</td></tr>
        <tr><td>남은 요건</td>${cols.map((c) => `<td>${c.r.rows.filter((x) => !x.ok && !x.flag).length}개</td>`).join('')}</tr>
        <tr><td></td>${cols.map((c) => `<td>${c.d === res.dept ? '<span class="meta">보는 중</span>' : `<button type="button" class="btn ghost small" data-gydept="${esc(c.d)}">${esc(c.label)} 기준으로 보기</button>`}</td>`).join('')}</tr>
      </tbody></table>
      <p class="msg">두 학과의 전공기초는 같아서, 1학년 때 듣는 전공기초는 어느 학과로 가도 그대로 인정돼요: ${pre}. 전공 배정 기준과 시기는 경영대학 공지를 확인하세요.</p>
    </section>`;
  }

  /* ---------- 입력 렌더 ---------- */
  function renderInputs() {
    $('#year').value = String(state.year);
    document.querySelectorAll('#dept button').forEach((b) => {
      const d = b.dataset.v;
      b.setAttribute('aria-pressed', String(d === state.dept));
      const gyNo = !!state.gyeyeol && d === '빅데이터응용학과';
      b.disabled = (d === '빅데이터응용학과' && state.year < 2022) || gyNo;
      b.title = gyNo ? '경영회계계열은 경영학과·회계학과 중에서 골라요' : b.disabled ? '빅데이터응용학과는 22학번부터 있어요' : '';
      if (d === '회계·세무학과') b.textContent = '회계학과';
    });
    document.querySelectorAll('#track button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state.track)));
    document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === state.tab)));
    $('#pane-paste').hidden = state.tab !== 'paste';
    $('#pane-search').hidden = state.tab !== 'search';
    $('#dist').value = state.liberal.dist || '';
    $('#free').value = state.liberal.free || '';
    $('#general').value = state.liberal.general || '';
    $('#sw').value = state.sw || '';
    $('#engx').value = state.engManual || '';
    $('#exam').checked = state.examDone;
    $('#thesis').checked = state.thesisDone;
    $('#engExempt').checked = state.liberal.engExempt;
    $('#areas-wrap').hidden = state.year < 2024;
    $('#maxcr').value = String(state.maxCr);
    const ct = K.currentTerm(NOW);
    $('#curterm').textContent = ct ? `${ct.year}-${ct.sem}학기` : '';
  }

  function kindClass(k) {
    return { '교양필수': 'k-lib', '배분이수': 'k-lib', '자유이수': 'k-lib', '전공기초': 'k-basic', '전공필수': 'k-req', '전공선택': 'k-elec' }[k] || 'k-etc';
  }

  function renderCourseList(res) {
    const ul = $('#clist');
    const items = res && res.courses ? res.courses : [];
    const ipN = items.filter((c) => c.ip).length;
    $('#ccount').textContent = items.length ? `${items.length - ipN}과목 이수${ipN ? `, ${ipN}과목 수강 중` : ''}` : '';
    if (!items.length) { ul.innerHTML = '<li class="empty" style="display:block">아직 과목이 없어요. 졸업진단표를 올리거나 과목을 검색해서 추가하세요.</li>'; return; }
    const sorted = [...items].sort((a, b) => (b.ip ? 1 : 0) - (a.ip ? 1 : 0));
    ul.innerHTML = sorted.map((c) => `<li>
      <div>${esc(c.t)} <span class="meta">${esc(c.cr)}학점${c.grp && c.kind === '전공선택' ? `, ${esc(c.grp)}과목군${c.unsure ? ' (세칙 목록 밖, 확인 필요)' : ''}` : ''}</span></div>
      <span class="kind ${kindClass(c.kind)}">${esc(c.kind === '타전공' ? `타전공(${c.from})` : c.kind)}${K.isSw(c) ? '<b class="swtag" title="SW 졸업요건 인정 과목">SW</b>' : ''}${K.isEng(c) ? (K.engCounts(c) ? '<b class="swtag engtag" title="전공 영어강의: 영어강좌 의무이수에 들어가요">영어</b>' : '<b class="swtag engtag off" title="교양·일반선택 영어강의라 영어강좌 의무이수(전공 3과목)에는 들어가지 않아요">영어(교양)</b>') : ''}</span>
      <button class="ipbtn" type="button" data-ip="${esc(c.t)}" aria-pressed="${!!c.ip}" title="이번 학기 수강 중이면 눌러서 표시">${c.ip ? '수강 중' : '이수'}</button>
      <button class="rm" data-rm="${esc(c.t)}" aria-label="${esc(c.t)} 빼기">×</button></li>`).join('');
  }

  function renderLibChecks(res) {
    const taken = new Set((res && res.courses || []).filter((c) => c.kind === '교양필수').map((c) => K.norm(c.t)));
    $('#libreq').innerHTML = K.LIB_REQ.map((r) => {
      const auto = taken.has(K.norm(r.t));
      const on = auto || state.liberal.reqChecked.includes(r.t);
      return `<label class="${auto ? 'auto' : ''}"><input type="checkbox" data-req="${esc(r.t)}" ${on ? 'checked' : ''} ${auto ? 'disabled' : ''}> ${esc(r.t)}</label>`;
    }).join('');
    const AREAS = window.KHU_DATA.liberal.distribution_areas_new;
    $('#areas').innerHTML = AREAS.map((a) => `<label><input type="checkbox" data-area="${esc(a)}" ${state.liberal.areas.includes(a) ? 'checked' : ''}> ${esc(a)}</label>`).join('');
  }

  /* ---------- 결과 렌더 ---------- */
  function cells(done, proj) {
    const a = done.credits; const b = proj.credits;
    const cats = [['lib', a.lib, b.lib], ['basic', a.basic, b.basic], ['req', a.required, b.required], ['elec', a.elective, b.elective], ['etc', a.general + a.other, b.general + b.other]];
    const out = [];
    cats.forEach(([cls, d, p]) => {
      for (let i = 0; i < d; i += 1) out.push(cls);
      for (let i = 0; i < Math.max(0, p - d); i += 1) out.push(`${cls} ip`);
    });
    return Array.from({ length: b.need }, (_, i) => out[i] || '');
  }

  function statusCell(r) {
    if (r.ok) return '<span class="mini" aria-label="충족">충족</span>';
    if (r.flag) return '<span class="short">체크 필요</span>';
    if (r.short === 0) return '<span class="short">과목군 부족</span>';
    return `<span class="short">−${r.short}${r.unit === '과목' ? '과목' : ''}</span>`;
  }

  function auditRows(res, area, done) {
    return res.rows.filter((r) => r.area === area).map((r) => {
      const d = done && done.rows.find((x) => x.id === r.id);
      const delta = d && !r.flag ? r.have - d.have : 0;
      let detail = '';
      if (r.missing && r.missing.length) detail += `<div class="detail">${r.missing.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`;
      if (r.choose && r.choose.done < r.choose.pick) detail += `<div class="sub">아래 중 ${r.choose.pick - r.choose.done}과목 더 선택: ${r.choose.options.map(esc).join(', ')}</div>`;
      if (r.groups && r.groups.length) detail += r.groups.map((gr) => `<div class="sub">${esc(gr.name)} ${gr.have}/${gr.need}학점 ${gr.have >= gr.need ? '충족' : `(−${gr.need - gr.have})`}${gr.unsure ? `, 그중 ${gr.unsure}학점은 세칙 목록 밖 과목이라 확인 필요` : ''}</div>`).join('');
      if (r.cap) detail += `<div class="sub">${esc(r.cap.name)}은 ${r.cap.max}학점까지만 전공선택으로 인정돼요. 지금 ${r.cap.have}학점${r.cap.over ? `이라 <b class="short">${r.cap.over}학점은 일반선택으로</b> 세었어요` : `, ${r.cap.max - r.cap.have}학점 더 인정받을 수 있어요`}.</div>`;
      if (r.areaNote) detail += `<div class="sub">배분이수 영역 ${esc(r.areaNote)}</div>`;
      if (r.engCourses && r.engCourses.length) detail += `<div class="detail">${r.engCourses.map((c) => `<span class="chip">${esc(c.t)}${c.ip ? ' (수강 중)' : ''}</span>`).join('')}</div>`;
      if (r.swCourses && r.swCourses.length) detail += `<div class="detail">${r.swCourses.map((c) => `<span class="chip">${esc(c.t)}${c.ip ? ' (수강 중)' : ''}</span>`).join('')}</div>`;
      if (r.note) detail += `<div class="sub">${esc(r.note)}</div>`;
      if (r.subs && r.subs.length && !r.ok) detail += `<div class="sub">대체 가능: ${r.subs.map(esc).join(' / ')}</div>`;
      if (r.schedule && !r.ok) detail += `<div class="sub">진행 일정: ${esc(r.schedule)}</div>`;
      const u = r.unit === '과목' ? '과목' : '';
      const nums = r.flag ? '<td class="num">—</td><td class="num">—</td>' : `<td class="num">${r.need}${u}</td><td class="num">${r.have}${u}${delta > 0 ? `<div class="sub">수강 중 +${delta}</div>` : ''}</td>`;
      return `<tr><td>${esc(r.label)}${detail}</td>${nums}<td class="st">${statusCell(r)}</td></tr>`;
    }).join('');
  }

  const termName = (t) => `${t.year}학년도 ${t.sem}학기`;

  /* ---------- 학점포기 시뮬레이션 탭 ---------- */
  let wdCache = { key: '', data: null };
  const wdKey = (input) => JSON.stringify([input.year, input.dept, input.track, input.courses, input.liberal, input.sw, input.official, input.retro2027]);
  const LV = { ok: ['lv-ok', '여유'], warn: ['lv-warn', '주의'], red: ['lv-red', '위험'] };
  function renderWithdraw(input, res) {
    const out = $('#sheet');
    const key = wdKey(input);
    if (wdCache.key !== key) wdCache = { key, data: K.withdrawRisks(input) };
    const data = wdCache.data;
    const items = data.items || [];
    const names = new Set(items.map((i) => K.norm(i.t)));
    state.withdraw = state.withdraw.filter((t) => names.has(K.norm(t)));
    const el = data.eligibility;
    const elig = !el || !el.known ? '<li>진단표를 올리면 신청 대상(7학기 이상 등록한 재학생)인지 자동으로 확인해요.</li>'
      : el.ok ? `<li><b>신청 대상이에요.</b> 진단표 기준 등록 ${el.reg}학기, 학적상태 ${esc(el.status || '확인 안 됨')}.</li>`
        : `<li><b class="short">진단표 기준으로는 신청 대상이 아니에요:</b> ${el.reasons.map(esc).join(', ')}.</li>`;
    const sch = data.scholarship;
    const groups = [['ok', '포기해도 졸업요건이 유지돼요'], ['warn', '주의가 필요해요'], ['red', '포기하면 졸업요건이 깨지거나 다시 들어야 해요']];
    const row = (i) => {
      const id = `wd-${i.no || K.norm(i.t)}`;
      return `<tr class="${LV[i.level][0]}"><td class="ck"><input type="checkbox" id="${esc(id)}" data-wd="${esc(i.t)}" ${state.withdraw.some((t) => K.norm(t) === K.norm(i.t)) ? 'checked' : ''}></td>
        <td><label for="${esc(id)}"><b>${esc(i.t)}</b>${i.sw ? '<b class="swtag">SW</b>' : ''}</label><div class="sub">${i.notes.map(esc).join(' · ')}</div></td>
        <td class="num">${i.cr}학점</td><td class="num">${i.yr ? `${i.yr}-${i.sm}` : '—'}</td><td>${esc(i.kind === '전공선택' && i.grp ? `${i.grp}과목군` : i.kind)}</td></tr>`;
    };
    const tables = groups.map(([lv, title]) => {
      const list = items.filter((i) => i.level === lv);
      if (!list.length) return '';
      return `<h4 class="wd-group"><span class="lv ${LV[lv][0]}">${LV[lv][1]}</span> ${esc(title)} <span class="meta">${list.length}과목</span></h4>
        <table class="sim wd"><thead><tr><th><span class="sr-only">선택</span></th><th>과목</th><th>학점</th><th>이수 학기</th><th>구분</th></tr></thead><tbody>${list.map(row).join('')}</tbody></table>`;
    }).join('');
    out.innerHTML = `
    <div class="sheet-head"><div><h2>학점포기 시뮬레이션</h2><p class="who">${esc(whoDept(res))} ${res.year}학번, ${res.track === 'multi' ? '다전공' : '단일전공'} · 포기해도 졸업할 수 있는지 미리 확인해요</p></div></div>
    <ul class="wd-notice">
      <li><b>2026학년도 2학기 신청 기간(${esc(K.WITHDRAW.period)})은 끝났어요.</b> 다음 신청 기간은 학교 공지를 확인하세요. 신청은 인포21 → 수업/성적 → 성적 → 학점포기신청에서 해요.</li>
      ${elig}
      <li>진단표에는 과목별 성적이 없어요. 인포21 성적조회에서 포기하고 싶은 과목을 확인한 뒤 아래에서 체크하면, 졸업에 미치는 영향을 계산해요. 평점 변화는 인포21 학점포기 화면 위쪽에서 볼 수 있어요.</li>
    </ul>
    <div id="wdResult" aria-live="polite"></div>
    ${items.length ? `<section class="section"><h3>이수한 과목 <span class="meta">이번 학기 수강 중인 과목은 성적이 없어 빠져요</span></h3>${tables}</section>`
      : '<p class="wd-empty">이수한 과목이 없어요. 졸업진단표를 올리거나 예시 학생을 골라 보세요.</p>'}
    <section class="section"><details class="swall"><summary>학점포기 유의사항 보기</summary>
      <ul class="tips" style="margin-top:8px">
        <li>신청 대상: 7학기 이상 등록한 재학생(수업연한 초과자 포함). 휴학생·수료생·학사학위취득유예생·졸업생은 신청할 수 없어요.</li>
        <li>대상 과목: 본교에서 이수한 모든 과목. 편입 때 인정받은 학점과 급제(P)를 받은 과목은 포기할 수 없어요.</li>
        <li>졸업필수 과목이나 졸업능력인증 과목을 포기하면 최종 졸업사정에서 졸업불가 판정이 날 수 있어요.</li>
        <li>${sch.year}-${sch.sem}학기처럼 국가장학금 심사 대상 학기(성적이 나온 직전 학기)의 학점을 포기하면, 받은 장학금(고지서 감면 포함)을 모두 돌려내야 할 수 있어요. 학생지원센터에 먼저 문의하세요.</li>
        <li>포기한 과목을 다시 들으면 재수강으로 처리돼 학기당 재수강 허용 과목 수에 들어가고, 최고 A0까지 받을 수 있어요.</li>
        <li>포기 전 성적으로 받은 성적경고 등은 그대로 유효하고, 포기한 성적은 다시 인정받을 수 없어요. 성적표에는 W로 표시돼요.</li>
        <li>교양 개편으로 대체 인정된 과목은 재수강이 아니라서, 대체 전 과목의 성적을 지우려면 학점포기를 신청해야 해요.</li>
      </ul>
      <p class="sub">출처: 제58대 경희대학교 서울캠퍼스 총학생회 MATE, 2026학년도 2학기 학점 포기 제도 신청 안내. 최종 판단은 인포21 학점포기 화면과 학과 확인을 따르세요.</p>
    </details></section>`;
    renderWithdrawResult(input);
  }
  function renderWithdrawResult(input) {
    const box = $('#wdResult');
    if (!box) return;
    const sel = state.withdraw;
    if (!sel.length) { box.innerHTML = '<p class="wd-empty">아래 목록에서 포기를 고민하는 과목을 체크하면 여기에 결과가 나와요.</p>'; return; }
    const r = K.withdrawSim(input, sel, { maxCr: state.maxCr });
    const items = (wdCache.data && wdCache.data.items) || [];
    const picked = items.filter((i) => sel.some((t) => K.norm(t) === K.norm(i.t)));
    const warns = picked.filter((i) => i.level !== 'ok');
    const terms = (x) => (x.short <= 0 ? '이번 학기로 졸업' : x.done ? `${x.terms}학기` : `${x.terms}학기 이상`);
    const moreTerms = r.after.terms > r.before.terms && r.after.short > 0;
    const verdict = r.broken.length ? '<b class="short">졸업요건이 새로 부족해져요.</b> 포기한 만큼 다시 들어야 할 과목이 생겨요.'
      : moreTerms ? `<b class="short">졸업이 ${r.after.terms - Math.max(r.before.terms, 0)}학기 늦어져요.</b>`
        : r.after.short > r.before.short ? `<b>졸업 시기는 그대로예요.</b> 다만 남은 학기에 ${r.removedCr}학점을 더 들어야 해요.`
          : '<b>졸업에 영향이 없어요.</b>';
    box.innerHTML = `<section class="wd-result">
      <h3>선택한 ${sel.length}과목 (${r.removedCr}학점)을 포기하면</h3>
      <p class="lead">${verdict}</p>
      <div class="wd-cmp">
        <div><span>이번 학기 후 이수학점</span><b>${r.before.have} → ${r.after.have}</b></div>
        <div><span>졸업까지 남은 학점</span><b>${Math.max(0, r.before.short)} → ${Math.max(0, r.after.short)}</b></div>
        <div><span>남은 학기</span><b>${terms(r.before)} → ${terms(r.after)}</b></div>
      </div>
      ${r.broken.length ? `<p class="sub" style="margin-top:10px"><b>새로 부족해지는 요건:</b> ${r.broken.map((b) => `${esc(b.label)}${b.short ? ` ${b.short}${b.unit === '과목' ? '과목' : '학점'}` : ''}${b.missing && b.missing.length ? ` (${b.missing.map(esc).join(', ')})` : ''}`).join(', ')}</p>` : ''}
      ${warns.length ? `<ul class="tips" style="margin-top:8px">${warns.map((i) => `<li><b>${esc(i.t)}</b>: ${i.notes.map(esc).join(' · ')}</li>`).join('')}</ul>` : ''}
      ${r.firstTerm && r.after.short > 0 ? `<p class="sub" style="margin-top:10px"><b>포기 후 ${esc(termName(r.firstTerm))} 계획:</b> ${r.firstTerm.items.map((i) => esc(i.t)).join(', ')}</p>` : ''}
      <div class="btnrow" style="margin-top:10px"><button class="btn ghost small" type="button" id="wdClear">선택 모두 해제</button></div>
    </section>`;
  }

  // SW 졸업요건: 들은 과목, 추천 과목, 인정 과목 전체
  function swSection(res, plan) {
    const sw = res.sw;
    if (!sw) return '';
    const short = Math.max(0, sw.need - sw.have);
    const planned = new Map();
    (plan.semesters || []).forEach((s) => s.items.forEach((i) => { if (/SW/.test(i.why)) planned.set(i.t, termName(s)); }));
    const parts = sw.courses.map((c) => `${esc(c.t)} ${c.cr}학점${c.ip ? ' (수강 중)' : ''}`);
    if (sw.official > sw.fromCourses) parts.push(`진단표에 집계된 SW ${sw.official - sw.fromCourses}학점`);
    if (sw.manual) parts.push(`직접 입력한 ${sw.manual}학점`);
    const takenTxt = parts.length ? parts.join(', ') : '아직 들은 SW 과목이 없어요';
    const extra = '';
    const recs = sw.options.filter((o) => !o.taken && ((o.src === 'hum' && o.campus === '서울') || o.own)).slice(0, 3);
    const recHtml = short > 0 ? `<p class="lead" style="margin-top:12px"><b>추천 과목</b> (3학점씩, 교육과정상 1·2학기 개설)</p>
      <ol class="swrec">${recs.map((o) => `<li><b>${esc(o.t)}</b> <span class="meta">${esc(o.no)} · ${o.cr}학점</span>${planned.has(o.t) ? ` <span class="chip">계획: ${esc(planned.get(o.t))}</span>` : ''}<div class="sub">${o.reasons.map(esc).join(' · ')}</div></li>`).join('')}</ol>` : '';
    const grp = (o) => (o.src === 'biz' ? 3 : o.campus === '국제' ? 2 : o.cat === '자유이수' ? 0 : 1);
    const rows = sw.options.slice().sort((a, b) => grp(a) - grp(b) || a.no.localeCompare(b.no)).map((o) => {
      const mine = sw.courses.find((c) => K.norm(c.t) === K.norm(o.t));
      const st = mine ? (mine.ip ? '수강 중' : '이수') : planned.has(o.t) ? '계획' : '';
      return `<tr><td>${esc(o.t)}</td><td class="num">${esc(o.no)}</td><td class="num">${o.cr}</td><td>${esc(o.src === 'hum' ? (o.campus === '국제' ? '후마니타스 (국제캠퍼스 개설)' : o.cat === '배분이수' ? `후마니타스 배분이수 · ${o.area}` : '후마니타스 자유이수') : o.kind ? `경영대학 · 내 ${o.kind}` : '경영대학 개설')}</td><td class="st">${st}</td></tr>`;
    }).join('');
    return `<section class="section sw">
      <h3>SW 교과목 <span class="meta">졸업까지 ${sw.need}학점</span></h3>
      <p class="lead">${short ? `<b>${short}학점 더 필요해요.</b> ` : '<b>SW 요건을 채웠어요.</b> '}지금 ${sw.have}학점: ${takenTxt}.</p>
      ${recHtml}
      <details class="swall"><summary>SW로 인정되는 과목 전체 보기 (${sw.options.length}과목)</summary>
        <table class="sim"><thead><tr><th>과목명</th><th>학수번호</th><th>학점</th><th>구분</th><th>상태</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="sub">기준: 2026학년도 학사제도안내의 SW기초교육 개설교과목 목록 (서울 후마니타스칼리지 21과목, 경영대학 9과목). 과목명·학점·이수구분은 2026 인포21 교육과정 기준이에요. 진단표에서 과목명 앞에 s(SW인증과목)가 붙은 과목은 이 목록에 없어도 SW로 계산해요.</p>
      </details>
    </section>`;
  }

  function chatkhuPrompt(res, plan) {
    const unmet = res.unmet.map((r) => `- ${r.label}: ${r.flag ? '확인 필요' : `${r.have}/${r.need}${r.unit === '과목' ? '과목' : '학점'}`}${r.missing && r.missing.length ? ` (미이수: ${r.missing.join(', ')})` : ''}`).join('\n') || '- 없음';
    const now = res.courses.filter((c) => c.ip).map((c) => c.t).join(', ');
    const planTxt = (plan.semesters || []).map((s) => `- ${termName(s)}: ${s.items.map((i) => (i.milestone ? `[졸업 절차] ${i.t}` : i.t)).join(', ')}`).join('\n');
    return `나는 경희대학교 ${state.gyeyeol ? `${state.gyeyeol}로 입학한 ${res.year}학번이고(${res.deptLabel} 진입 기준)` : `${res.deptLabel} ${res.year}학번이고`} ${res.track === 'multi' ? '다전공' : '단일전공'} 과정이야.
이번 학기에 듣는 과목: ${now || '없음'}
'경영대 졸업사정표'로 이번 학기를 마친 뒤 기준으로 점검한 결과는 아래와 같아.

[아직 충족하지 못한 요건]
${unmet}

[사정표가 만든 졸업까지 수강 계획 초안]
${planTxt || '- 남은 학기 없음'}

[관심 분야] ${plan.interests.join(', ') || '아직 없음'}

이 초안을 바탕으로, 내 관심 분야와 진로에 맞게 과목을 바꿀 만한 대안을 추천해 줘.
학칙이나 세칙 해석이 애매한 부분은 학과 사무실에 확인할 질문으로 따로 정리해 줘.`;
  }

  function retroBlock(proj, input) {
    if (!proj.retroCandidates || !proj.retroCandidates.length) return '';
    const alt = K.audit({ ...input, retro2027: true });
    const altPlan = K.planGraduation({ ...input, retro2027: true }, { maxCr: state.maxCr });
    const blocking = alt.rows.filter((r) => !r.ok && !r.flag);
    const first = altPlan.semesters[0];
    const short = Math.max(0, alt.credits.need - alt.credits.all);
    return `<div class="term" style="margin-top:14px;border-style:dashed">
      <h4>2027 세칙 개정이 소급 적용되면 <small>예정, 시행 시점 확인 필요</small></h4>
      <p class="sub" style="margin-top:0">${proj.retroCandidates.map(esc).join(', ')} 과목이 회계과목군으로 대체 인정돼요 (최대 6학점). 지금은 25학번 이전 학생에게 인정되지 않지만, 2027년 개정으로 소급 적용될 예정이라는 학과 답변이 있었어요.</p>
      <p style="margin:6px 0">${(() => {
        if (!blocking.length) return '이번 학기를 마치면 학점 요건을 모두 채워요.';
        const onlyTotal = blocking.every((r) => r.id === 'total');
        if (onlyTotal) return `남은 건 졸업학점 ${short}학점뿐이라, <b>과목 제한 없이</b> 아무 과목으로 채우면 돼요.`;
        return `남은 요건 ${blocking.length}개, 졸업까지 ${short}학점${first ? `. ${termName(first)} 계획: ${first.items.map((i) => esc(i.t)).join(', ')}` : ''}`;
      })()}</p>
    </div>`;
  }

  function roadmap(proj, plan) {
    const ct = K.currentTerm(NOW);
    const ipCr = proj.courses.filter((c) => c.ip).reduce((a, c) => a + (Number(c.cr) || 0), 0);
    const doneCr = proj.credits.all - ipCr;
    const totalShort = Math.max(0, proj.credits.need - proj.credits.all);
    const blocking = proj.rows.filter((r) => !r.ok && !r.flag);
    const n = plan.semesters.length;
    const when = ct && ipCr ? `이번 학기(${ct.year}-${ct.sem})를 마치면` : '지금 기준으로';
    let headline;
    if (!blocking.length) headline = `${when} 학점 요건은 모두 채워요.`;
    else if (!plan.done) headline = `${when} 졸업까지 <em>${totalShort}학점</em> 남았어요. 한 학기 ${plan.maxCr}학점씩 들으면 앞으로 ${n}학기 안에는 다 채우기 빠듯해요.`;
    else headline = `${when} 졸업까지 <em>${totalShort}학점</em>, <em>${n}학기</em> 남았어요.`;
    if (blocking.length && totalShort === 0) headline = `${when} 졸업학점은 채우지만, 영역별로 부족한 요건이 있어 <em>${n}학기</em> 더 필요해요.`;
    // 남은 학기 기준 안내: 단정하지 않고, 입력이 빠졌을 가능성과 줄이는 방법을 함께 알려 준다
    const lastReg = n ? plan.semesters[n - 1].reg : null;
    const hints = [];
    // 등록 학기 수를 입학년도로만 추정한 경우(휴학·군휴학을 모름)에는 8학기 초과 경고를 띄우지 않는다
    const overReg = lastReg && lastReg > 8 && plan.semesters.regKnown;
    if (!plan.done || overReg) {
      hints.push(overReg && plan.done
        ? `이 계획대로면 ${lastReg}학기째에 졸업해서 정규 8학기를 넘겨요 (${plan.semesters.regKnown ? '진단표 등록횟수' : '휴학 없이 다녔다고 가정한 등록 학기'} 기준).`
        : '남은 학기 기준으로 계산한 결과예요.');
      if (ct && !ipCr) hints.push('이번 학기에 듣는 과목을 넣으면 더 정확해져요.');
      hints.push('계절학기를 듣거나 "한 학기에 들을 학점"을 늘리면 줄어들 수 있어요.');
    }
    const hintHtml = hints.length ? `<p class="sub road-hint">${hints.map(esc).join(' ')}</p>` : '';
    const first = plan.semesters[0];
    const later = plan.semesters.slice(1);
    const li = (i) => (i.milestone
      ? `<li class="ms">${esc(i.t)} <span class="mstag">졸업 절차</span> <span class="why">${esc(i.why)}</span></li>`
      : `<li class="${i.placeholder ? 'ph' : ''}">${esc(i.t)} <span class="why">${esc(i.cr)}학점, ${esc(i.why)}</span></li>`);
    const msN = plan.semesters.reduce((a, s) => a + s.items.filter((i) => i.milestone).length, 0);
    const flags = plan.flags.length ? `<p class="sub" style="margin-top:10px">학점과 별개로 챙길 것: ${plan.flags.map(esc).join(', ')}${msN ? ' (언제 하면 되는지 계획에 \'졸업 절차\'로 표시했어요)' : ''}</p>` : '';
    return `<div class="road" aria-live="polite">
      <p class="headline">${headline}</p>${hintHtml}
      <div class="stats"><span>이수 완료 <b>${doneCr}</b>학점</span><span>수강 중 <b>${ipCr}</b>학점</span><span>졸업 기준 <b>${proj.credits.need}</b>학점</span>${blocking.length ? `<span>남은 요건 <b>${blocking.length}</b>개</span>` : ''}</div>
      ${first ? `<div class="plan">
        <div class="term first"><h4>${termName(first)}에 들을 과목 <small>${first.credits}학점</small></h4><ol>${first.items.map(li).join('')}</ol>
          ${first.unmetAfter.length ? `<p class="sub">이 학기 뒤에도 남는 요건: ${first.unmetAfter.map(esc).join(', ')}</p>` : '<p class="sub">이대로 들으면 학점 요건을 모두 채워요.</p>'}</div>
        ${later.length ? `<div class="later">${later.map((s) => `<div class="term"><h4>${termName(s)} <small>${s.credits}학점</small></h4><ol>${s.items.map(li).join('')}</ol></div>`).join('')}</div>` : ''}
      </div>` : ''}
      ${retroBlock(proj, { ...state, now: NOW })}
      ${flags}
      ${first ? '<p class="sub">회색 항목은 아무 과목이나 골라도 되는 자리예요. 2026학년도 교육과정의 개설 학기 기준이라 실제 시간표는 수강신청 때 확인하세요.</p>' : ''}
    </div>`;
  }

  function renderResult() {
    queueMicrotask(ckRefresh); // 화면을 다시 그린 뒤 열려 있는 ChatKHU 패널 질문도 맞춘다
    const input = { ...state, now: NOW };
    const res = K.audit(input);
    const out = $('#sheet');
    document.querySelectorAll('#viewtabs [data-view]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.view === state.view)));
    out.setAttribute('aria-labelledby', state.view === 'withdraw' ? 'tab-withdraw' : 'tab-audit');
    if (res.error) { out.innerHTML = `<p class="error">${esc(res.error)}</p>`; renderCourseList(null); renderLibChecks(null); return; }
    if (state.view === 'withdraw') { renderCourseList(res); renderLibChecks(res); renderWithdraw(input, res); return; }
    if (!state.courses.length && !state.official) {
      renderCourseList(res); renderLibChecks(res); lastCount = -1;
      out.innerHTML = `<div class="sheet-head"><div><h2>졸업사정표</h2><p class="who">${esc(whoDept(res))} ${res.year}학번, ${res.track === 'multi' ? '다전공' : '단일전공'}</p></div></div>
      <div class="road" style="margin-top:22px"><p class="headline">졸업진단표를 올리면, 이 자리에 졸업까지 남은 학점과 다음 학기에 들을 과목이 나와요.</p>
      <ol style="margin:12px 0 0;padding-left:20px;line-height:1.9"><li>인포21 → 졸업사정 조회에서 <b>졸업진단표를 PDF로 저장</b>해요.</li><li>왼쪽 <b>졸업진단표 PDF 올리기</b>를 눌러 파일을 골라요. 학번·학과·이번 학기 과목까지 자동으로 들어가요.</li><li>진단표가 없으면 성적 표를 붙여넣거나 과목을 검색해서 넣어도 돼요.</li></ol>
      <div class="btnrow" style="margin-top:14px"><span class="msg">먼저 둘러보려면:</span><button class="btn ghost small" type="button" data-sample2="acct">회계 19학번</button><button class="btn ghost small" type="button" data-sample2="mgmt">경영 21학번</button><button class="btn ghost small" type="button" data-sample2="bdas">빅데이터 22학번</button></div></div>
      <p class="sub" style="margin-top:14px">성적은 이 브라우저 안에서만 계산되고 어디에도 저장되지 않아요.</p>`;
      return;
    }
    const done = K.audit({ ...input, courses: state.courses.filter((c) => !c.ip) });
    const plan = K.planGraduation(input, { maxCr: state.maxCr });
    renderCourseList(res);
    renderLibChecks(res);
    const cs = cells(done, res);
    const fillAnim = res.credits.all !== lastCount;
    lastCount = res.credits.all;
    const dateStr = `${NOW.getFullYear()}년 ${NOW.getMonth() + 1}월 ${NOW.getDate()}일 기준`;
    const areasAll = window.KHU_DATA.areas;
    const hasIp = state.courses.some((c) => c.ip);
    const blockingN = res.rows.filter((r) => !r.ok && !r.flag).length;
    const allOk = !blockingN;

    const compare = state.official ? (() => {
      const o = state.official; const c = res.credits; const dc = done.credits;
      const withCur = o.currentCr > 0;
      const items = [
        ['이수 완료 학점', o.total, dc.all],
        ...(withCur ? [['이번 학기 포함 학점', o.totalWithCurrent, c.all]] : []),
        ['필수교과', o.libReq && o.libReq[0], c.libReq], ['배분이수', o.libDist && o.libDist[0], c.libDist], ['자유이수', o.libFree && o.libFree[0], c.libFree],
        ['전공기초', o.basic && o.basic[0], c.basic], ['전공필수', o.required && o.required[0], c.required], ['전공선택', o.elective && o.elective[0], c.elective],
        ['영어강의(전공)', o.engHave, res.courses.filter((x) => K.engCounts(x)).length, '과목'],
      ].filter((x) => x[1] != null);
      const same = items.filter((x) => x[1] === x[2]).length;
      return `<section class="section"><h3>인포21 진단표와 맞춰 보기</h3>
      <p class="lead">진단표의 공식 집계와 이 사정표의 계산을 나란히 놓았어요.${withCur ? ' 진단표의 영역별 학점은 이번 학기 수강 중 과목을 포함한 값이라, 같은 기준으로 비교했어요.' : ''} ${same === items.length ? `${items.length}개 항목이 모두 같아요.` : `${items.length}개 중 ${items.length - same}개가 달라요. 다른 항목은 학과 사무실에 확인해 보세요.`}</p>
      <table class="sim"><thead><tr><th>항목</th><th>인포21 진단표</th><th>졸업사정표 계산</th><th>결과</th></tr></thead><tbody>
      ${items.map(([n, a, b, u = '학점']) => `<tr><td>${esc(n)}</td><td>${a}${u}</td><td>${b}${u}</td><td>${a === b ? '일치' : `<span class="short">${b - a > 0 ? '+' : ''}${b - a}</span>`}</td></tr>`).join('')}
      </tbody></table></section>`;
    })() : '';

    const gySec = state.gyeyeol ? gyeyeolSection(input, res) : '';

    const th = `<thead><tr><th>요건</th><th style="text-align:right">기준</th><th style="text-align:right">${hasIp ? '이번 학기 후' : '취득'}</th><th style="text-align:center">판정</th></tr></thead>`;

    out.innerHTML = `
    <div class="sheet-head">
      <div><h2>졸업사정표</h2><p class="who">${esc(whoDept(res))} ${res.year}학번, ${res.track === 'multi' ? '다전공' : '단일전공'}${state.sampleName ? ` (예시 학생, ${esc(state.sampleName)})` : ''}${state.official ? ' (인포21 진단표 불러옴)' : ''}</p></div>
      <div class="date">${dateStr}<br>${res.year}학년도 시행세칙 적용</div>
    </div>

    <div class="tally">
      <div>
        <div class="grid ${fillAnim ? 'fill' : ''}" role="img" aria-label="졸업 학점 ${res.credits.need}칸 중 이수 ${done.credits.all}칸, 수강 중 ${res.credits.all - done.credits.all}칸">
          ${cs.map((c, i) => `<i class="${c}" style="--n:${i}"></i>`).join('')}
        </div>
        <div class="legend">
          <span style="--sw:var(--c-lib)">교양 ${res.credits.lib}</span>
          <span style="--sw:var(--c-basic)">전공기초 ${res.credits.basic}</span>
          <span style="--sw:var(--c-req)">전공필수 ${res.credits.required}</span>
          <span style="--sw:var(--c-elec)">전공선택 ${res.credits.elective}</span>
          <span style="--sw:var(--c-etc)">일반선택 등 ${res.credits.general + res.credits.other}</span>
          ${hasIp ? `<span class="ipl">빗금은 수강 중 ${res.credits.all - done.credits.all}</span>` : ''}
        </div>
      </div>
      <div class="count">
        <div class="num"><b>${res.credits.all}</b><span>/ ${res.credits.need}학점</span></div>
        <div class="stamp ${allOk ? '' : 'pending'}">${allOk ? '학점 요건<br>충족' : `남은 요건<br>${blockingN}개`}</div>
      </div>
    </div>

    ${gySec}

    ${roadmap(res, plan)}

    <div class="chips" id="interest-chips" style="margin-top:12px" aria-label="관심 분야">
      <span class="msg" style="align-self:center">계획에 넣을 관심 분야:</span>
      ${areasAll.map((a) => `<button type="button" data-int="${esc(a)}" aria-pressed="${plan.interests.includes(a)}">${esc(a)}</button>`).join('')}
    </div>

    ${compare}

    <table class="audit"><caption>교양</caption>${th}<tbody>${auditRows(res, '교양', done)}</tbody></table>
    <table class="audit"><caption>전공 (${esc(res.deptLabel)}${res.track === 'multi' ? ', 다전공 기준' : ''})</caption>${th}<tbody>${auditRows(res, '전공', done)}</tbody></table>
    <table class="audit"><caption>졸업 학점과 기타 요건</caption>${th}<tbody>${auditRows(res, '졸업', done)}${auditRows(res, '기타', done)}</tbody></table>
    ${swSection(res, plan)}

    <section class="section">
      <h3>관심 분야에서 바꿔 들을 수 있는 과목</h3>
      <p class="lead">계획에 들어간 과목 대신 고를 수 있는 ${res.nextTerm.sem}학기 개설 과목이에요.</p>
      <div class="two">${res.recommend.map((r) => `<div class="box"><h4>${esc(r.area)}</h4><ul class="reclist">${r.courses.map((c) => `<li><span>${esc(c.t)}</span><small>${esc(c.grp)}과목군${c.unsure ? '(확인 필요)' : ''}, ${esc(c.term || '')}</small></li>`).join('') || '<li><span class="msg">더 추천할 과목이 없어요</span></li>'}</ul></div>`).join('') || '<p class="msg">관심 분야를 고르면 추천이 나와요.</p>'}</div>
    </section>

    <section class="section">
      <h3>다전공하면 학점이 얼마나 달라질까</h3>
      <p class="lead">다전공을 하면 ${esc(res.deptLabel)} 요구학점이 줄고, 겹치는 전공기초·전공필수는 같이 인정받아요. 지금 들은 과목을 기준으로 졸업까지 남은 전공학점을 단일전공일 때와 다전공일 때로 비교했어요.</p>
      <table class="sim dbl"><thead><tr><th>다전공할 학과</th><th>1전공 요건</th><th>2전공 요건</th><th>남은 전공학점 비교</th></tr></thead><tbody>
      ${res.doubles.map((d) => { const firstLeft = d.firstNeed - d.firstHave, secondLeft = d.secondNeed - d.secondCr; return `<tr><td><b>${esc(d.dept)}</b>${d.req2.length ? `<div class="sub">꼭 들을 과목: ${d.req2.map(esc).join(', ')}</div>` : ''}${d.grad2 ? `<div class="sub">${esc(d.grad2.exam)} 통과${d.grad2.thesis ? `, ${esc(d.grad2.thesis)} 수강신청` : ''}도 따로 해야 해요</div>` : ''}${d.exact ? '' : '<div class="sub">세칙에 이 조합의 표가 없어 일반 다전공 기준으로 추정했어요</div>'}</td>
        <td data-label="1전공 요건">${d.firstNeed}학점 기준<div class="sub">${firstLeft > 0 ? `<span class="short">${firstLeft}학점 남음</span>` : '<span class="ok-text">이미 채웠어요</span>'}</div></td>
        <td data-label="2전공 요건">${d.secondCr} / ${d.secondNeed}학점<div class="bar"><span style="width:${Math.round((d.secondCr / d.secondNeed) * 100)}%"></span></div><div class="sub">${secondLeft > 0 ? `${secondLeft}학점 남음` : '이미 채웠어요'}</div></td>
        <td data-label="남은 전공학점"><div class="cmp2"><span>단일전공 <b>${d.remainSingle}</b>학점</span><span>다전공 <b>${d.remainDouble}</b>학점</span></div><div class="sub">${d.extra > 0 ? `다전공이 <b class="short">${d.extra}학점 더</b> 들어요` : d.extra < 0 ? `다전공이 오히려 <b>${-d.extra}학점 덜</b> 들어요` : '어느 쪽이든 같아요'}</div></td></tr>`; }).join('')}
      </tbody></table>
      <p class="msg" style="margin-top:8px">졸업 ${res.credits.need}학점은 어느 쪽이든 같아요. 들은 과목을 1전공과 2전공에 어떻게 나눠 인정하는지는 학과가 정하니, 다전공 신청 전에 학과에 확인하세요. 경영통계학·경영학원론·회계원리 선수과목 규정은 경영대 밖 학생이 대상이에요.</p>
      <div class="box" style="margin-top:16px"><h4>마이크로디그리</h4>
        <ul class="reclist">${res.mds.map((m) => `<li><span><b>${esc(m.name)}</b>${m.remain && (m.todo.length === 1 || m.remain <= 3) ? ' <span class="nearly">거의 다 왔어요</span>' : ''} <small>${esc(m.host)}</small><div class="sub">${m.done.length ? `이수: ${m.done.map(esc).join(', ')}` : '아직 이수한 과목 없음'}${m.remain ? `, 남은 과목: ${m.todo.map(esc).join(', ')}` : ''}</div></span><small>${m.remain ? `${m.remain}학점 남음` : '<span class="md-done">✓ 요건 충족</span>'}</small></li>`).join('')}</ul>
      </div>
    </section>

    ${res.tips.length ? `<section class="section"><h3>놓치기 쉬운 규정</h3><ul class="tips">${res.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}

    <section class="section ask">
      <h3><img src="assets/chatkhu.png" alt="ChatKHU" width="86" height="26">에게 이어서 물어보기</h3>
      <p class="lead">진단 결과와 수강 계획 초안을 담은 질문이에요. <b>궁금한 점이나 상황(진로, 희망 분야, 다음 학기 사정 등)을 직접 고치거나 덧붙인 뒤</b> 복사해서 ChatKHU에 붙여넣으세요.</p>
      ${(() => {
        promptBase = chatkhuPrompt(res, plan);
        const stale = promptEdit && promptEdit.base !== promptBase;
        return `<label class="sr-only" for="prompt">ChatKHU에 보낼 질문 (수정 가능)</label>
      <textarea id="prompt" spellcheck="false">${esc(promptEdit ? promptEdit.text : promptBase)}</textarea>
      <p class="msg" id="promptnote" aria-live="polite" style="margin:6px 0 0">${stale ? '진단 결과가 바뀌었어요. 고친 내용은 그대로 두었고, 새 결과를 넣으려면 기본 질문으로 되돌리세요.' : promptEdit ? '고친 내용은 결과가 바뀌어도 그대로 남아요.' : '이 칸을 눌러 바로 고칠 수 있어요.'}</p>
      <div class="btnrow" style="margin-top:8px"><button class="btn" type="button" id="copy">질문 복사하기</button><a class="btn ghost ck-open" href="${CHATKHU_URL}" target="_blank" rel="noopener" data-ck-copy="prompt">복사하고 ChatKHU 열기 ↗</a><button class="btn ghost" type="button" id="resetPrompt"${promptEdit ? '' : ' hidden'}>기본 질문으로 되돌리기</button><span class="msg" id="copied" aria-live="polite"></span></div>`;
      })()}
    </section>

    <div class="foot">
      <b>이 결과는 참고용이에요.</b> 경희대학교 공식 서비스가 아니라 2026 KHU AI Challenge에 출품한 학생 프로젝트예요. 최종 졸업사정은 소속 학과 사무실과 인포21 졸업요건 조회로 확인하세요.
      <ul>
        <li>근거: 경영대학 학과별 교육과정 시행세칙(2019~2026), 서울캠퍼스 학사제도안내 교양 기본구조, 인포21 2026학년도 교육과정</li>
        ${res.needsCheck.length ? `<li>세칙 안에서 표기가 엇갈려 학과 확인이 필요한 부분: ${res.needsCheck.map(esc).join(' ')}</li>` : ''}
        <li>전공선택 과목군(회계·경영·빅데이터)은 학수번호를 기준으로 나눠서, 일부 과목은 실제 인정 과목군과 다를 수 있어요.</li>
      </ul>
    </div>`;
  }

  function render() { renderInputs(); renderResult(); }

  /* ---------- 이벤트 ---------- */
  function addCourses(arr) {
    const keys = new Set(state.courses.map((c) => K.norm(c.t)));
    arr.forEach((c) => { if (!keys.has(K.norm(c.t))) { state.courses.push(c); keys.add(K.norm(c.t)); } });
  }

  function bind() {
    $('#year').innerHTML = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => `<option value="${y}">${y}학번 (${String(y).slice(2)}학번)</option>`).join('');
    $('#year').addEventListener('change', (e) => { state.year = Number(e.target.value); state.official = null; state.gyeyeol = null; const moved = state.year < 2022 && state.dept === '빅데이터응용학과'; if (moved) state.dept = '경영학과'; $('#deptmsg').textContent = moved ? '빅데이터응용학과는 22학번부터 있어서 경영학과로 바꿨어요.' : ''; state.sampleName = null; render(); });
    $('#dept').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && !b.disabled) { setDept(b.dataset.v); } });
    // 계열 학생은 진입 학과만 바꿔 보는 것이라 진단표 집계(state.official)를 유지한다
    function setDept(v) {
      state.dept = v; state.sampleName = null;
      if (state.gyeyeol) $('#deptmsg').textContent = `${state.gyeyeol}: ${K.deptLabel(v, state.year)}로 진입한다고 보고 계산해요.`;
      else { $('#deptmsg').textContent = ''; state.official = null; }
      render();
    }
    $('#sheet').addEventListener('click', (e) => { const b = e.target.closest('button[data-gydept]'); if (b) { setDept(b.dataset.gydept); $('#sheet').scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    $('#track').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.track = b.dataset.v; render(); } });
    document.querySelector('.tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.tab = b.dataset.tab; renderInputs(); } });

    function applyParsed(r, source) {
      const msg = $('#parsemsg');
      msg.className = 'msg';
      if (r.kind === 'diagnosis') {
        if (!r.courses.length) { msg.className = 'msg warn'; msg.textContent = '진단표는 찾았는데 과목 목록을 읽지 못했어요. 진단표 전체를 다시 복사하거나 PDF로 올려 주세요.'; return; }
        const notes = [];
        if (r.year && r.year >= 2019 && r.year <= 2026) state.year = r.year; else if (r.year) notes.push(`졸업기준년도 ${r.year}는 이 사이트 범위(2019~2026) 밖이에요.`);
        const prevGy = state.gyeyeol; // 같은 계열 진단표를 다시 올리면 학생이 골라 둔 진입 학과를 유지한다
        state.gyeyeol = r.gyeyeol || null;
        if (r.gyeyeol) {
          state.dept = r.dept || (prevGy && state.dept === '회계·세무학과' ? '회계·세무학과' : '경영학과');
          notes.push(`${r.gyeyeol}로 입학한 학생이에요. 2학년부터 경영학과·회계학과 중 고르니, 우선 ${K.deptLabel(state.dept, state.year)} 기준으로 계산했어요. 위 학과 버튼이나 사정표의 비교표에서 바꿔 볼 수 있어요.`);
        } else if (r.dept) state.dept = r.dept; else notes.push('학과를 찾지 못했어요. 위에서 직접 골라 주세요.');
        state.courses = r.courses;
        state.sw = 0; state.engManual = 0; // 진단표의 공식 SW 학점·영어강의 수는 state.official로 들어가 과목 목록과 함께 계산된다
        state.liberal = { dist: 0, free: 0, general: 0, areas: state.liberal.areas, reqChecked: [], engExempt: false };
        state.official = Object.keys(r.official).length ? r.official : null;
        promptEdit = null; state.withdraw = [];
        state.interests = []; state.interestsSet = false;
        state.sampleName = null;
        const ipN = r.courses.filter((c) => c.ip).length;
        if (window.matchMedia('(max-width: 960px)').matches) setTimeout(() => $('#viewtabs').scrollIntoView({ behavior: 'smooth' }), 50);
        msg.textContent = `${source} 졸업진단표를 읽었어요. ${state.gyeyeol ? `${state.gyeyeol}(${K.deptLabel(state.dept, state.year)} 진입 기준)` : K.deptLabel(state.dept, state.year)} ${state.year} 기준, ${r.courses.length - ipN}과목을 넣었어요${ipN ? ` (이번 학기 수강 중 ${ipN}과목 포함)` : ''}. 학번·학과도 진단표에 맞췄어요. ${ipN ? '' : '이번 학기에 듣는 과목은 아래 칸에서 추가하세요.'} ${notes.join(' ')}`;
      } else {
        addCourses(r.courses);
        msg.textContent = r.courses.length
          ? `${r.courses.length}과목을 불러왔어요.${r.skipped.length ? ` F·NP 등급이거나 읽지 못한 ${r.skipped.length}줄은 뺐어요.` : ''}`
          : '과목을 찾지 못했어요. 진단표나 성적 표를 행 단위로 복사했는지 확인하세요.';
        if (!r.courses.length) msg.className = 'msg warn';
        state.sampleName = null;
        if (r.courses.length && window.matchMedia('(max-width: 960px)').matches) setTimeout(() => $('#viewtabs').scrollIntoView({ behavior: 'smooth' }), 50);
      }
      render();
    }
    $('#parse').addEventListener('click', () => applyParsed(K.parseAny($('#paste').value, { now: NOW }), '붙여넣은'));
    const PDF_FAIL_MSG = {
      library: 'PDF 읽기 도구를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 올려 주세요.',
      worker: 'PDF 읽기 도구를 준비하지 못했어요. 다시 올려 보고, 계속 안 되면 페이지를 새로고침해 주세요.',
      file: '파일을 읽지 못했어요. 파일이 기기에 내려받아져 있는지 확인하고 다시 골라 주세요.',
      open: 'PDF를 열지 못했어요. 손상됐거나 암호가 걸린 파일일 수 있어요. 인포21에서 다시 저장해 올려 주세요.',
      text: 'PDF에서 글자를 꺼내지 못했어요. 다시 올려 보고, 계속 안 되면 진단표 내용을 복사해서 붙여넣어 주세요.',
    };
    let pdfBusy = false;
    $('#pdf').addEventListener('change', async (e) => {
      const input = e.target;
      const f = input.files && input.files[0];
      if (!f || pdfBusy) { input.value = ''; return; }
      const label = document.querySelector('label[for=pdf]');
      const msg = $('#parsemsg');
      pdfBusy = true; input.disabled = true; label.classList.add('busy'); label.setAttribute('aria-disabled', 'true');
      msg.className = 'msg'; msg.textContent = 'PDF를 읽는 중이에요…';
      try {
        const text = await pdfToText(f);
        const r = K.parseAny(text, { now: NOW });
        if (r.kind !== 'diagnosis' && !r.courses.length) {
          msg.className = 'msg warn';
          msg.textContent = text.trim() ? '졸업진단표 형식을 찾지 못했어요. 인포21 졸업사정 조회에서 저장한 졸업진단표 PDF인지 확인해 주세요.' : 'PDF에서 글자를 읽지 못했어요. 스캔하거나 캡처한 이미지 PDF는 읽을 수 없어요. 인포21에서 PDF로 저장한 파일을 올려 주세요.';
        } else applyParsed(r, 'PDF');
      } catch (err) {
        logPdfFailure(err);
        if (err && (err.stage === 'library' || err.stage === 'worker')) { resetPdfWorker(); pdfjs = null; pdfjsAttempt += 1; } // 다음 시도에서 본체와 worker를 함께 새로 불러온다
        else if (err && (err.stage === 'open' || err.stage === 'text')) resetPdfWorker();
        msg.className = 'msg warn';
        msg.textContent = (err && PDF_FAIL_MSG[err.stage]) || 'PDF를 읽지 못했어요. 다시 올려 보고, 계속 안 되면 진단표 내용을 복사해서 붙여넣어 주세요.';
      } finally {
        // 같은 파일을 다시 골라도 change가 일어나도록 비우고, 버튼을 되살린다
        input.value = ''; input.disabled = false; pdfBusy = false;
        label.classList.remove('busy'); label.removeAttribute('aria-disabled');
      }
    });
    $('#paste-example').addEventListener('click', () => { $('#paste').value = PASTE_EXAMPLE; $('#paste').focus(); });

    const q = $('#q');
    const suggestHtml = (val) => {
      const hits = K.searchCourses(val);
      if (val.trim() && !hits.length) return '<li class="msg" style="padding:7px 10px">검색 결과가 없어요. 과목명 일부나 학수번호로 찾아보세요.</li>';
      const have = new Set(state.courses.map((c) => K.norm(c.t)));
      return hits.map((c) => { const dup = have.has(K.norm(c.t)); return `<li><button type="button" data-add="${esc(c.t)}" data-cr="${esc(c.cr)}" data-no="${esc(c.no || '')}"${dup ? ' disabled' : ''}><span>${esc(c.t)}</span><small>${dup ? '이미 목록에 있음' : `${c.no ? esc(c.no) + ', ' : ''}${esc(c.cr)}학점`}</small></button></li>`; }).join('');
    };
    q.addEventListener('input', () => { $('#suggest').innerHTML = suggestHtml(q.value); });
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const f = $('#suggest button[data-add]:not(:disabled)'); if (f) f.click(); } if (e.key === 'ArrowDown') { const f = $('#suggest button[data-add]:not(:disabled)'); if (f) { e.preventDefault(); f.focus(); } } });
    $('#suggest').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-add]:not(:disabled)');
      if (!b) return;
      addCourses([{ t: b.dataset.add, cr: Number(b.dataset.cr), no: b.dataset.no || null }]);
      q.value = ''; $('#suggest').innerHTML = ''; q.focus(); state.sampleName = null; render();
    });

    $('#clist').addEventListener('click', (e) => {
      const t = e.target.closest('[data-ip]');
      if (t) { const c = state.courses.find((x) => K.norm(x.t) === K.norm(t.dataset.ip)); if (c) { c.ip = !c.ip; render(); } return; }
      const b = e.target.closest('[data-rm]');
      if (!b) return;
      state.courses = state.courses.filter((c) => K.norm(c.t) !== K.norm(b.dataset.rm));
      render();
    });

    const q2 = $('#q2');
    q2.addEventListener('input', () => { $('#suggest2').innerHTML = suggestHtml(q2.value); });
    q2.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const f = $('#suggest2 button[data-add]:not(:disabled)'); if (f) f.click(); } if (e.key === 'ArrowDown') { const f = $('#suggest2 button[data-add]:not(:disabled)'); if (f) { e.preventDefault(); f.focus(); } } });
    // 추천 목록 안에서 위아래 화살표로 이동
    ['#suggest', '#suggest2'].forEach((sel) => $(sel).addEventListener('keydown', (e) => {
      const btns = [...$(sel).querySelectorAll('button[data-add]:not(:disabled)')]; const i = btns.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && i < btns.length - 1) { e.preventDefault(); btns[i + 1].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); if (i > 0) btns[i - 1].focus(); else (sel === '#suggest' ? q : q2).focus(); }
    }));
    $('#suggest2').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-add]:not(:disabled)');
      if (!b) return;
      const ex = state.courses.find((x) => K.norm(x.t) === K.norm(b.dataset.add));
      if (ex) ex.ip = true; else state.courses.push({ t: b.dataset.add, cr: Number(b.dataset.cr), no: b.dataset.no || null, ip: true });
      q2.value = ''; $('#suggest2').innerHTML = ''; q2.focus(); state.sampleName = null; render();
    });
    $('#parse2').addEventListener('click', () => {
      const r = K.parseTranscript($('#paste2').value);
      r.courses.forEach((c) => { const ex = state.courses.find((x) => K.norm(x.t) === K.norm(c.t)); if (ex) ex.ip = true; else state.courses.push({ ...c, ip: true }); });
      $('#curmsg').className = r.courses.length ? 'msg' : 'msg warn';
      $('#curmsg').textContent = r.courses.length ? `${r.courses.length}과목을 수강 중으로 넣었어요.` : '과목을 찾지 못했어요. 학수번호나 과목명이 들어 있는 줄을 붙여넣어 주세요.';
      render();
    });
    $('#maxcr').addEventListener('change', (e) => { state.maxCr = Number(e.target.value); renderResult(); });
    $('#clear').addEventListener('click', () => { state.courses = []; state.sampleName = null; state.official = null; state.gyeyeol = null; promptEdit = null; state.withdraw = []; render(); });

    $('#libreq').addEventListener('change', (e) => {
      const t = e.target.dataset.req; if (!t) return;
      const s = new Set(state.liberal.reqChecked); e.target.checked ? s.add(t) : s.delete(t); state.liberal.reqChecked = [...s]; renderResult();
    });
    $('#areas').addEventListener('change', (e) => {
      const a = e.target.dataset.area; if (!a) return;
      const s = new Set(state.liberal.areas); e.target.checked ? s.add(a) : s.delete(a); state.liberal.areas = [...s]; renderResult();
    });
    // 숫자 칸: 0 이상 정수로 맞추고, 타이핑이 멈춘 뒤 한 번만 다시 계산
    const clampInt = (v, max) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
    let numTimer = null;
    const later = () => { clearTimeout(numTimer); numTimer = setTimeout(renderResult, 220); };
    [['dist', 'dist', 60], ['free', 'free', 60], ['general', 'general', 120]].forEach(([id, k, max]) => {
      const el = $(`#${id}`);
      el.addEventListener('input', () => { if (Number(el.value) > max) el.value = max; state.liberal[k] = clampInt(el.value, max); later(); });
      el.addEventListener('change', () => { el.value = state.liberal[k] || ''; });
    });
    const swEl = $('#sw');
    swEl.addEventListener('input', () => { if (Number(swEl.value) > 30) swEl.value = 30; state.sw = clampInt(swEl.value, 30); later(); });
    swEl.addEventListener('change', () => { swEl.value = state.sw || ''; });
    const engEl = $('#engx');
    engEl.addEventListener('input', () => { if (Number(engEl.value) > 10) engEl.value = 10; state.engManual = clampInt(engEl.value, 10); later(); });
    engEl.addEventListener('change', () => { engEl.value = state.engManual || ''; });
    $('#exam').addEventListener('change', (e) => { state.examDone = e.target.checked; renderResult(); });
    $('#thesis').addEventListener('change', (e) => { state.thesisDone = e.target.checked; renderResult(); });
    $('#engExempt').addEventListener('change', (e) => { state.liberal.engExempt = e.target.checked; renderResult(); });

    $('#samples').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-sample]');
      if (b) $('#deptmsg').textContent = '';
      if (!b) return;
      const s = SAMPLES[b.dataset.sample];
      Object.assign(state, JSON.parse(JSON.stringify({ year: s.year, dept: s.dept, track: s.track, sw: s.sw, engManual: s.engManual || 0, examDone: s.examDone, thesisDone: s.thesisDone, courses: s.courses })));
      state.liberal = { reqChecked: [], engExempt: false, ...JSON.parse(JSON.stringify(s.liberal)) };
      state.interests = []; state.interestsSet = false; state.sampleName = s.name; state.official = null; state.gyeyeol = null; promptEdit = null; state.withdraw = [];
      render();
      if (window.matchMedia('(max-width: 960px)').matches) $('#viewtabs').scrollIntoView({ behavior: 'smooth' });
    });

    $('#viewtabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-view]'); if (!b || state.view === b.dataset.view) return;
      state.view = b.dataset.view; renderResult();
    });
    $('#viewtabs').addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      state.view = state.view === 'audit' ? 'withdraw' : 'audit'; renderResult(); $(`#tab-${state.view}`).focus();
    });
    $('#sheet').addEventListener('change', (e) => {
      const t = e.target.dataset && e.target.dataset.wd; if (!t) return;
      const set = new Map(state.withdraw.map((x) => [K.norm(x), x]));
      if (e.target.checked) set.set(K.norm(t), t); else set.delete(K.norm(t));
      state.withdraw = [...set.values()];
      renderWithdrawResult({ ...state, now: NOW });
    });
    $('#sheet').addEventListener('input', (e) => {
      if (e.target.id !== 'prompt') return;
      const v = e.target.value;
      promptEdit = v === promptBase ? null : { text: v, base: promptBase };
      $('#resetPrompt').hidden = !promptEdit;
      $('#copied').textContent = '';
      $('#promptnote').textContent = promptEdit ? '고친 내용은 결과가 바뀌어도 그대로 남아요.' : '이 칸을 눌러 바로 고칠 수 있어요.';
      if (!$('#ckPanel').hidden) $('#ckPrompt').value = v;
    });
    $('#sheet').addEventListener('click', (e) => {
      const sb = e.target.closest('[data-sample2]');
      if (sb) { document.querySelector(`#samples button[data-sample="${sb.dataset.sample2}"]`).click(); return; }
      const ib = e.target.closest('[data-int]');
      if (ib) {
        const a = ib.dataset.int;
        const cur = state.interests.length ? state.interests : (K.planGraduation({ ...state, now: NOW }, { maxCr: state.maxCr }).interests || []);
        const s = new Set(cur); s.has(a) ? s.delete(a) : s.add(a);
        state.interests = [...s];
        state.interestsSet = true;
        renderResult();
        return;
      }
      if (e.target.id === 'wdClear') {
        state.withdraw = [];
        document.querySelectorAll('#sheet input[data-wd]').forEach((c) => { c.checked = false; });
        renderWithdrawResult({ ...state, now: NOW });
        return;
      }
      if (e.target.id === 'resetPrompt') {
        promptEdit = null;
        const ta = $('#prompt'); ta.value = promptBase;
        if (!$('#ckPanel').hidden) $('#ckPrompt').value = promptBase;
        e.target.hidden = true;
        $('#promptnote').textContent = '기본 질문으로 되돌렸어요.'; $('#copied').textContent = '';
        ta.focus();
        return;
      }
      if (e.target.id === 'copy') {
        const ta = $('#prompt');
        const done = () => { $('#copied').textContent = '복사했어요. ChatKHU에 붙여넣으세요.'; };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); document.execCommand('copy'); done(); });
        else { ta.select(); document.execCommand('copy'); done(); }
      }
    });
  }


  /* ---------- PDF → 텍스트 (브라우저 안에서만 처리) ---------- */
  // PDF.js 6.2.108 legacy 빌드. 본체(pdf.min.js)와 worker(pdf.worker.min.js)는 같은 패키지의 같은 버전이다.
  const PDFJS_VERSION = '6.2.108';
  const PDF_STAGES = { library: 'PDF 라이브러리 로딩', worker: 'worker 초기화', file: '파일 읽기', open: 'getDocument', text: '페이지 텍스트 추출' };

  // 단계별 실패 기록. 학생 PDF 내용·파일명·개인정보는 남기지 않고 단계, 오류, 브라우저 지원 여부만 남긴다.
  class PdfStageError extends Error {
    constructor(stage, cause, extra) {
      super(cause && cause.message ? cause.message : String(cause));
      this.name = 'PdfStageError'; this.stage = stage; this.cause = cause; this.extra = extra || {};
    }
  }
  function pdfEnv() {
    const RS = typeof ReadableStream !== 'undefined' ? ReadableStream : null;
    return {
      userAgent: navigator.userAgent,
      pdfjs: pdfjs ? pdfjs.lib.version : null,
      readableStreamAsyncIterator: !!(RS && RS.prototype[Symbol.asyncIterator]),
      readableStreamAsyncIteratorPolyfilled: !!(RS && RS.prototype[Symbol.asyncIterator] && RS.prototype[Symbol.asyncIterator].khuPolyfill),
      moduleWorker: typeof Worker !== 'undefined',
      fileArrayBuffer: typeof Blob !== 'undefined' && typeof Blob.prototype.arrayBuffer === 'function',
    };
  }
  function logPdfFailure(err) {
    const stage = err && err.stage ? err.stage : 'unknown';
    const cause = err && err.cause ? err.cause : err;
    console.groupCollapsed(`[PDF] 실패 단계: ${PDF_STAGES[stage] || stage}`);
    console.error('오류', { name: cause && cause.name, message: cause && cause.message, stack: cause && cause.stack });
    console.info('단계 정보', err && err.extra ? err.extra : {});
    console.info('환경', pdfEnv());
    console.groupEnd();
  }
  async function stage(name, fn, extra) {
    try { return await fn(); } catch (e) { throw e instanceof PdfStageError ? e : new PdfStageError(name, e, extra); }
  }

  // iOS·macOS Safari는 ReadableStream 비동기 반복(for await … of stream)을 지원하지 않는다.
  // PDF.js 내부에 그런 코드가 있어 PDF.js를 불러오기 전에 표준 동작대로 보완한다 (이미 지원하는 브라우저는 그대로 둔다).
  function ensureStreamAsyncIterator() {
    if (typeof ReadableStream === 'undefined' || ReadableStream.prototype[Symbol.asyncIterator]) return;
    const values = function ({ preventCancel = false } = {}) {
      const reader = this.getReader();
      return {
        async next() {
          try {
            const r = await reader.read();
            if (r.done) reader.releaseLock();
            return r;
          } catch (e) { reader.releaseLock(); throw e; }
        },
        async return(value) {
          if (!preventCancel) { const c = reader.cancel(value); reader.releaseLock(); await c; } else reader.releaseLock();
          return { done: true, value };
        },
        [Symbol.asyncIterator]() { return this; },
      };
    };
    values.khuPolyfill = true;
    Object.defineProperty(ReadableStream.prototype, 'values', { value: values, writable: true, configurable: true });
    Object.defineProperty(ReadableStream.prototype, Symbol.asyncIterator, { value: values, writable: true, configurable: true });
  }

  let pdfjs = null;
  let pdfjsAttempt = 0; // 로딩 실패 뒤 재시도할 때 브라우저에 남은 실패한 모듈 캐시를 피하려고 주소에 붙이는 번호
  async function loadPdfjs() {
    if (pdfjs) return pdfjs;
    ensureStreamAsyncIterator();
    const local = new URL('vendor/', document.baseURI).href;
    const q = pdfjsAttempt ? `?retry=${pdfjsAttempt}` : '';
    const [lib, cm] = await stage('library', () => Promise.all([import(local + 'pdf.min.js' + q), import(local + 'cmaps.js' + q)]));
    if (lib.version !== PDFJS_VERSION) throw new PdfStageError('library', new Error(`PDF.js 버전 불일치: ${lib.version} (기대 ${PDFJS_VERSION})`));
    lib.GlobalWorkerOptions.workerSrc = local + 'pdf.worker.min.js' + q; // 본체와 같은 6.2.108 worker
    const maps = cm.default;
    // 한글 CMap을 파일 대신 내장 데이터에서 읽어 오는 팩토리 (cmaps.js)
    class EmbeddedData {
      constructor() {}
      async fetch({ kind, filename }) {
        if (kind === 'cMapUrl' && maps[filename]) return Uint8Array.from(atob(maps[filename]), (c) => c.charCodeAt(0));
        throw new Error(`내장 데이터 없음: ${filename}`);
      }
    }
    pdfjs = { lib, worker: null, opts: { BinaryDataFactory: EmbeddedData, cMapUrl: 'embedded/', cMapPacked: true, useWorkerFetch: false } };
    return pdfjs;
  }
  // worker를 따로 띄워 두고 재사용한다. 실패하면 다음 시도에서 새로 만든다.
  async function getPdfWorker(lib) {
    if (pdfjs.worker && !pdfjs.worker.destroyed) return pdfjs.worker;
    const w = typeof lib.PDFWorker.create === 'function' ? lib.PDFWorker.create({}) : new lib.PDFWorker({});
    try { await w.promise; } catch (e) { try { w.destroy(); } catch (_) {} throw e; }
    pdfjs.worker = w;
    return w;
  }
  function resetPdfWorker() {
    if (pdfjs && pdfjs.worker) { try { pdfjs.worker.destroy(); } catch (_) {} pdfjs.worker = null; }
  }
  function readFileBytes(file) {
    if (typeof file.arrayBuffer === 'function') return file.arrayBuffer().then((b) => new Uint8Array(b));
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(new Uint8Array(fr.result));
      fr.onerror = () => reject(fr.error || new Error('파일을 읽지 못했어요'));
      fr.readAsArrayBuffer(file);
    });
  }
  // page.getTextContent()는 내부에서 for await로 스트림을 돈다. 브라우저 지원과 무관하게 reader로 직접 읽는다.
  async function readTextItems(page) {
    const reader = page.streamTextContent().getReader();
    const items = [];
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const it of value.items) items.push(it);
      }
    } finally { reader.releaseLock(); }
    return items;
  }
  function toLines(items) {
    const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
    const lines = [];
    sorted.forEach((it) => {
      const ln = lines.find((l) => Math.abs(l.y - it.y) <= Math.max(2.5, it.h * 0.4));
      if (ln) ln.items.push(it); else lines.push({ y: it.y, items: [it] });
    });
    return lines.sort((a, b) => a.y - b.y).map((l) => {
      const its = l.items.sort((a, b) => a.x - b.x);
      return its.reduce((acc, it, i) => {
        if (i === 0) return it.s;
        const prev = its[i - 1];
        const gap = it.x - (prev.x + prev.w);
        return acc + (gap > Math.max(1.5, it.h * 0.25) ? ' ' : '') + it.s;
      }, '');
    });
  }
  async function pdfToText(file) {
    const { lib, opts } = await loadPdfjs();
    const worker = await stage('worker', () => getPdfWorker(lib));
    const data = await stage('file', () => readFileBytes(file), { bytes: file.size });
    const task = lib.getDocument({ data, worker, ...opts });
    try {
      const doc = await stage('open', () => task.promise, { bytes: file.size });
      const out = [];
      for (let n = 1; n <= doc.numPages; n += 1) {
        const meta = { page: n, pages: doc.numPages };
        const page = await stage('text', () => doc.getPage(n), meta);
        const vp = page.getViewport({ scale: 1 });
        const raw = await stage('text', () => readTextItems(page), meta);
        const items = raw.filter((i) => i.str && i.str.trim()).map((i) => ({ s: i.str, x: i.transform[4], y: vp.height - i.transform[5], w: i.width, h: Math.abs(i.transform[3]) || 8 }));
        const libHead = items.find((i) => /교양\s*\/\s*기타/.test(i.s));
        const majHead = items.find((i) => /^\s*전공학점\s*$/.test(i.s));
        const splitY = libHead ? libHead.y - 3 : Infinity;
        const splitX = majHead ? majHead.x - 4 : vp.width * 0.43;
        const top = items.filter((i) => i.y < splitY);
        const rest = items.filter((i) => i.y >= splitY);
        out.push(...toLines(top), ...toLines(rest.filter((i) => i.x < splitX)), ...toLines(rest.filter((i) => i.x >= splitX)));
      }
      return out.join('\n');
    } finally {
      // 문서만 정리하고 공유 worker는 남겨 둔다
      task.destroy().catch(() => {});
    }
  }

  /* ---------- ChatKHU 바로 묻기 (오른쪽 아래 버튼·패널) ---------- */
  // 지금 결과로 만든 기본 질문. 고친 질문(promptEdit)이 있으면 그걸 쓴다.
  function ckBase() {
    if (!state.courses.length && !state.official) return '';
    const input = { ...state, now: NOW };
    const res = K.audit(input);
    if (res.error) return '';
    promptBase = chatkhuPrompt(res, K.planGraduation(input, { maxCr: state.maxCr }));
    return promptBase;
  }
  function ckText() { const base = ckBase(); return promptEdit ? promptEdit.text : base; }
  function ckRefresh() {
    const panel = $('#ckPanel');
    if (!panel || panel.hidden) return;
    const ta = $('#ckPrompt');
    if (document.activeElement === ta) return; // 입력 중에는 건드리지 않는다
    ta.value = ckText();
    ta.placeholder = '진단표를 올리거나 예시 학생을 고르면 내 결과가 담긴 질문이 만들어져요. 지금은 ChatKHU만 열 수 있어요.';
  }
  const CK_CHIPS = [
    ['다음 학기 계획 다듬기', () => '\n\n[추가 질문] 위 수강 계획을 내 진로(예: 회계사, 금융권, 데이터 직무)에 맞게 다듬어 줘. 학기별 부담이 고르게 되도록 순서도 제안해 줘.'],
    ['SW 과목 고르기', () => '\n\n[추가 질문] SW 졸업요건(6학점)을 채우려면 어떤 과목이 나에게 맞을지, 전공과 함께 인정되는 과목 위주로 난이도와 함께 비교해 줘.'],
    ['학점포기 상담', () => {
      if (!state.withdraw.length) return '\n\n[추가 질문] 학점포기를 고민 중이야. 졸업요건을 해치지 않으면서 포기와 재수강 중 무엇이 나은지 판단하는 기준을 알려 줘.';
      const r = K.withdrawSim({ ...state, now: NOW }, state.withdraw, { maxCr: state.maxCr });
      const brk = r.broken.length ? ` 새로 부족해지는 요건: ${r.broken.map((b) => b.label).join(', ')}.` : '';
      return `\n\n[추가 질문] 학점포기를 고민 중인 과목: ${r.removed.join(', ')} (${r.removedCr}학점). 졸업사정표 계산으로는 포기하면 졸업까지 남은 학점이 ${Math.max(0, r.before.short)} → ${Math.max(0, r.after.short)}학점, 남은 학기가 ${r.before.terms} → ${r.after.terms}학기가 돼.${brk} 재수강과 비교해 어떤 선택이 나을지, 국가장학금·성적경고 같은 위험도 함께 따져 줘.`;
    }],
    ['규정 다시 확인', () => '\n\n[추가 질문] 위 결과에서 학과 확인이 필요한 규정(과목군 인정, 신설 과목, 졸업시험 대체 등)을 시행세칙 기준으로 쉽게 설명하고, 학과 사무실에 물어볼 질문 목록으로 정리해 줘.'],
  ];
  function ckSync(v) {
    promptEdit = v === promptBase ? null : { text: v, base: promptBase };
    const main = $('#prompt');
    if (main) {
      main.value = v;
      const rb = $('#resetPrompt'); if (rb) rb.hidden = !promptEdit;
      const note = $('#promptnote'); if (note) note.textContent = promptEdit ? '고친 내용은 결과가 바뀌어도 그대로 남아요.' : '이 칸을 눌러 바로 고칠 수 있어요.';
    }
  }
  function ckCopy(text) {
    if (!text) return false;
    let ok = false;
    try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).catch(() => {}); ok = true; } } catch (_) {}
    try {
      const t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; t.style.top = '0';
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, text.length);
      ok = document.execCommand('copy') || ok; t.remove();
    } catch (_) {}
    return ok;
  }
  function ckOpen(open) {
    const panel = $('#ckPanel'); const fab = $('#ckFab');
    panel.hidden = !open; fab.setAttribute('aria-expanded', String(open));
    $('#ckDock').classList.toggle('open', open);
    if (open) {
      $('#ckBubble').hidden = true;
      try { sessionStorage.setItem('ckBubbleSeen', '1'); } catch (_) {}
      $('#ckMsg').textContent = '';
      ckRefresh();
      const ta = $('#ckPrompt'); ta.focus({ preventScroll: true }); try { ta.setSelectionRange(0, 0); } catch (_) {} ta.scrollTop = 0;
    } else fab.focus();
  }
  function bindChatKhu() {
    $('#ckGo').href = CHATKHU_URL;
    $('#ckChips').innerHTML = CK_CHIPS.map(([label], i) => `<button type="button" class="ck-chip" data-ck="${i}">+ ${esc(label)}</button>`).join('');
    $('#ckFab').addEventListener('click', () => ckOpen($('#ckPanel').hidden));
    $('#ckClose').addEventListener('click', () => ckOpen(false));
    $('#ckBubbleOpen').addEventListener('click', () => ckOpen(true));
    $('#ckBubbleX').addEventListener('click', () => { $('#ckBubble').hidden = true; try { sessionStorage.setItem('ckBubbleSeen', '1'); } catch (_) {} });
    $('#ckPanel').addEventListener('keydown', (e) => { if (e.key === 'Escape') ckOpen(false); });
    $('#ckChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-ck]'); if (!b) return;
      const ta = $('#ckPrompt');
      if (!ta.value) ta.value = ckText();
      ta.value += CK_CHIPS[Number(b.dataset.ck)][1]();
      ckSync(ta.value);
      ta.focus(); ta.scrollTop = ta.scrollHeight;
    });
    $('#ckPrompt').addEventListener('input', (e) => ckSync(e.target.value));
    // 링크로 새 탭을 여는 동시에 질문을 복사한다 (기본 동작은 막지 않는다: 팝업 차단을 피하려고)
    document.addEventListener('click', (e) => {
      const a = e.target.closest('#ckGo, [data-ck-copy]'); if (!a) return;
      const src = a.id === 'ckGo' ? $('#ckPrompt') : $('#prompt');
      const text = src ? src.value : '';
      const ok = ckCopy(text);
      const msg = a.id === 'ckGo' ? $('#ckMsg') : $('#copied');
      if (msg) msg.textContent = !text ? 'ChatKHU를 새 탭에서 열었어요.' : ok ? '질문을 복사했어요. 새 탭의 ChatKHU 입력창에 붙여넣으세요 (휴대폰은 길게 눌러 붙여넣기).' : '자동 복사가 안 됐어요. 질문을 길게 눌러 직접 복사해 주세요.';
    });
    let seen = false; try { seen = sessionStorage.getItem('ckBubbleSeen') === '1'; } catch (_) {}
    if (!seen) setTimeout(() => { if ($('#ckPanel').hidden) $('#ckBubble').hidden = false; }, 1500);
  }

  bind();
  bindChatKhu();
  render();
})();
