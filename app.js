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
      name: '4학년 2학기 재학 중',
      year: 2021, dept: '회계·세무학과', track: 'single', sw: 6, examDone: false, thesisDone: false,
      courses: list('회계원리,경영통계학,경제학원론,책임경영,관리회계1,세무회계1,재무회계1,재무관리,마케팅원론,경영정보시스템,세법총론,관리회계2,고급회계,회계감사,세무회계2,회사법,유가증권법,재무제표분석,투자론,경영과학,소비자행동론,인간의가치탐색,세계와시민,빅뱅에서문명까지,성찰과표현,대학영어')
        .concat(ipList('재무회계2,조직행동론,주제연구,회계이론,금융파생상품론')),
      liberal: { dist: 12, free: 3, general: 6, areas: [] },
    },
    mgmt: {
      name: '3학년 2학기 재학 중',
      year: 2024, dept: '경영학과', track: 'single', sw: 3, examDone: false, thesisDone: false,
      courses: list('경영통계학,경영학원론,책임경영,회계원리,마케팅원론,재무관리,조직행동론,경영정보시스템,소비자행동론,마케팅조사론,디지털마케팅,통계기반데이터분석,경영커뮤니케이션,인간의가치탐색,세계와시민,성찰과표현,대학영어')
        .concat(ipList('생산운영관리,관리회계1,마케팅전략,빅뱅에서문명까지,피플애널리틱스')),
      liberal: { dist: 6, free: 3, general: 12, areas: ['상징·문화·소통', '사회·공동체·평화'] },
    },
    bdas: {
      name: '4학년 2학기 재학 중',
      year: 2022, dept: '빅데이터응용학과', track: 'single', sw: 6, examDone: false, thesisDone: false,
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
    year: 2024, dept: '경영학과', track: 'single', sw: 0, examDone: false, thesisDone: false,
    courses: [], liberal: { dist: 0, free: 0, general: 0, areas: [], reqChecked: [], engExempt: false },
    interests: [], tab: 'paste', sampleName: null, official: null, maxCr: 18,
  };
  let lastCount = -1;

  /* ---------- 입력 렌더 ---------- */
  function renderInputs() {
    $('#year').value = String(state.year);
    document.querySelectorAll('#dept button').forEach((b) => {
      const d = b.dataset.v;
      b.setAttribute('aria-pressed', String(d === state.dept));
      b.disabled = d === '빅데이터응용학과' && state.year < 2022;
      b.title = b.disabled ? '빅데이터응용학과는 22학번부터 있어요' : '';
      if (d === '회계·세무학과') b.textContent = state.year >= 2026 ? '회계학과' : '회계·세무학과';
    });
    document.querySelectorAll('#track button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state.track)));
    document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === state.tab)));
    $('#pane-paste').hidden = state.tab !== 'paste';
    $('#pane-search').hidden = state.tab !== 'search';
    $('#dist').value = state.liberal.dist || '';
    $('#free').value = state.liberal.free || '';
    $('#general').value = state.liberal.general || '';
    $('#sw').value = state.sw || '';
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
      <span class="kind ${kindClass(c.kind)}">${esc(c.kind === '타전공' ? `타전공(${c.from})` : c.kind)}</span>
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
      if (r.areaNote) detail += `<div class="sub">배분이수 영역 ${esc(r.areaNote)}</div>`;
      if (r.note) detail += `<div class="sub">${esc(r.note)}</div>`;
      if (r.subs && r.subs.length && !r.ok) detail += `<div class="sub">대체 가능: ${r.subs.map(esc).join(' / ')}</div>`;
      const u = r.unit === '과목' ? '과목' : '';
      const nums = r.flag ? '<td class="num">—</td><td class="num">—</td>' : `<td class="num">${r.need}${u}</td><td class="num">${r.have}${u}${delta > 0 ? `<div class="sub">수강 중 +${delta}</div>` : ''}</td>`;
      return `<tr><td>${esc(r.label)}${detail}</td>${nums}<td class="st">${statusCell(r)}</td></tr>`;
    }).join('');
  }

  const termName = (t) => `${t.year}학년도 ${t.sem}학기`;

  function chatkhuPrompt(res, plan) {
    const unmet = res.unmet.map((r) => `- ${r.label}: ${r.flag ? '확인 필요' : `${r.have}/${r.need}${r.unit === '과목' ? '과목' : '학점'}`}${r.missing && r.missing.length ? ` (미이수: ${r.missing.join(', ')})` : ''}`).join('\n') || '- 없음';
    const now = res.courses.filter((c) => c.ip).map((c) => c.t).join(', ');
    const planTxt = (plan.semesters || []).map((s) => `- ${termName(s)}: ${s.items.map((i) => i.t).join(', ')}`).join('\n');
    return `나는 경희대학교 ${res.deptLabel} ${res.year}학번이고 ${res.track === 'multi' ? '다전공' : '단일전공'} 과정이야.
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
    else if (!plan.done) headline = `${when} 졸업까지 <em>${totalShort}학점</em> 남았어요. 한 학기 ${plan.maxCr}학점으로는 4년 안에 다 채우기 어려워요.`;
    else headline = `${when} 졸업까지 <em>${totalShort}학점</em>, <em>${n}학기</em> 남았어요.`;
    if (blocking.length && totalShort === 0) headline = `${when} 졸업학점은 채우지만, 영역별로 부족한 요건이 있어 <em>${n}학기</em> 더 필요해요.`;
    const first = plan.semesters[0];
    const later = plan.semesters.slice(1);
    const li = (i) => `<li class="${i.placeholder ? 'ph' : ''}">${esc(i.t)} <span class="why">${esc(i.cr)}학점, ${esc(i.why)}</span></li>`;
    const flags = plan.flags.length ? `<p class="sub" style="margin-top:10px">학점과 별개로 챙길 것: ${plan.flags.map(esc).join(', ')}</p>` : '';
    return `<div class="road" aria-live="polite">
      <p class="headline">${headline}</p>
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
    const input = { ...state, now: NOW };
    const res = K.audit(input);
    const out = $('#sheet');
    if (res.error) { out.innerHTML = `<p class="error">${esc(res.error)}</p>`; renderCourseList(null); renderLibChecks(null); return; }
    if (!state.courses.length && !state.official) {
      renderCourseList(res); renderLibChecks(res); lastCount = -1;
      out.innerHTML = `<div class="sheet-head"><div><h2>졸업사정표</h2><p class="who">${esc(res.deptLabel)} ${res.year}학번, ${res.track === 'multi' ? '다전공' : '단일전공'}</p></div></div>
      <div class="road" style="margin-top:22px"><p class="headline">졸업진단표를 올리면, 이 자리에 졸업까지 남은 학점과 다음 학기에 들을 과목이 나와요.</p>
      <ol style="margin:12px 0 0;padding-left:20px;line-height:1.9"><li>인포21 → 졸업사정 조회에서 <b>졸업진단표를 PDF로 저장</b>해요.</li><li>왼쪽 <b>졸업진단표 PDF 올리기</b>를 눌러 파일을 골라요. 학번·학과·이번 학기 과목까지 자동으로 들어가요.</li><li>진단표가 없으면 성적 표를 붙여넣거나 과목을 검색해서 넣어도 돼요.</li></ol>
      <div class="btnrow" style="margin-top:14px"><span class="msg">먼저 둘러보려면:</span><button class="btn ghost small" type="button" data-sample2="acct">회계·세무 21학번</button><button class="btn ghost small" type="button" data-sample2="mgmt">경영 24학번</button><button class="btn ghost small" type="button" data-sample2="bdas">빅데이터 22학번</button></div></div>
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
      ].filter((x) => x[1] != null);
      const same = items.filter((x) => x[1] === x[2]).length;
      return `<section class="section"><h3>인포21 진단표와 맞춰 보기</h3>
      <p class="lead">진단표의 공식 집계와 이 사정표의 계산을 나란히 놓았어요.${withCur ? ' 진단표의 영역별 학점은 이번 학기 수강 중 과목을 포함한 값이라, 같은 기준으로 비교했어요.' : ''} ${same === items.length ? `${items.length}개 항목이 모두 같아요.` : `${items.length}개 중 ${items.length - same}개가 달라요. 다른 항목은 학과 사무실에 확인해 보세요.`}</p>
      <table class="sim"><thead><tr><th>항목</th><th>인포21 진단표</th><th>졸업사정표 계산</th><th>결과</th></tr></thead><tbody>
      ${items.map(([n, a, b]) => `<tr><td>${esc(n)}</td><td>${a}학점</td><td>${b}학점</td><td>${a === b ? '일치' : `<span class="short">${b - a > 0 ? '+' : ''}${b - a}</span>`}</td></tr>`).join('')}
      </tbody></table></section>`;
    })() : '';

    const th = `<thead><tr><th>요건</th><th style="text-align:right">기준</th><th style="text-align:right">${hasIp ? '이번 학기 후' : '취득'}</th><th style="text-align:center">판정</th></tr></thead>`;

    out.innerHTML = `
    <div class="sheet-head">
      <div><h2>졸업사정표</h2><p class="who">${esc(res.deptLabel)} ${res.year}학번, ${res.track === 'multi' ? '다전공' : '단일전공'}${state.sampleName ? ` (예시 학생, ${esc(state.sampleName)})` : ''}${state.official ? ' (인포21 진단표 불러옴)' : ''}</p></div>
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

    ${roadmap(res, plan)}

    <div class="chips" id="interest-chips" style="margin-top:12px" aria-label="관심 분야">
      <span class="msg" style="align-self:center">계획에 넣을 관심 분야:</span>
      ${areasAll.map((a) => `<button type="button" data-int="${esc(a)}" aria-pressed="${plan.interests.includes(a)}">${esc(a)}</button>`).join('')}
    </div>

    ${compare}

    <table class="audit"><caption>교양</caption>${th}<tbody>${auditRows(res, '교양', done)}</tbody></table>
    <table class="audit"><caption>전공 (${esc(res.deptLabel)}${res.track === 'multi' ? ', 다전공 기준' : ''})</caption>${th}<tbody>${auditRows(res, '전공', done)}</tbody></table>
    <table class="audit"><caption>졸업 학점과 기타 요건</caption>${th}<tbody>${auditRows(res, '졸업', done)}${auditRows(res, '기타', done)}</tbody></table>

    <section class="section">
      <h3>관심 분야에서 바꿔 들을 수 있는 과목</h3>
      <p class="lead">계획에 들어간 과목 대신 고를 수 있는 ${res.nextTerm.sem}학기 개설 과목이에요.</p>
      <div class="two">${res.recommend.map((r) => `<div class="box"><h4>${esc(r.area)}</h4><ul class="reclist">${r.courses.map((c) => `<li><span>${esc(c.t)}</span><small>${esc(c.grp)}과목군${c.unsure ? '(확인 필요)' : ''}, ${esc(c.term || '')}</small></li>`).join('') || '<li><span class="msg">더 추천할 과목이 없어요</span></li>'}</ul></div>`).join('') || '<p class="msg">관심 분야를 고르면 추천이 나와요.</p>'}</div>
    </section>

    <section class="section">
      <h3>다전공하면 몇 학점 더 들어야 할까</h3>
      <p class="lead">경영대 안에서 다전공하면 전공기초와 공통 전공필수를 같이 인정받아요. 1전공 요구학점도 줄어들어서, 실제로 늘어나는 부담은 생각보다 작을 수 있어요.</p>
      <table class="sim"><thead><tr><th>제2전공</th><th>1전공 기준</th><th>2전공 진행</th><th>단일전공 대비 추가 부담</th></tr></thead><tbody>
      ${res.doubles.map((d) => `<tr><td><b>${esc(d.dept)}</b>${d.req2.length ? `<div class="sub">2전공 필수: ${d.req2.map(esc).join(', ')}</div>` : ''}${d.exact ? '' : '<div class="sub">세칙에 이 조합의 중복인정 표가 없어 일반 다전공 기준으로 추정했어요</div>'}</td>
        <td>${d.firstNeed}학점</td>
        <td>${d.secondCr} / ${d.secondNeed}학점<div class="bar"><span style="width:${Math.round((d.secondCr / d.secondNeed) * 100)}%"></span></div></td>
        <td><span class="big">${d.extra > 0 ? `+${d.extra}` : d.extra}</span> 학점</td></tr>`).join('')}
      </tbody></table>
      <div class="box" style="margin-top:16px"><h4>마이크로디그리</h4>
        <ul class="reclist">${res.mds.map((m) => `<li><span><b>${esc(m.name)}</b> <small>${esc(m.host)}</small><div class="sub">${m.done.length ? `이수: ${m.done.map(esc).join(', ')}` : '아직 이수한 과목 없음'}${m.remain ? `, 남은 과목: ${m.todo.map(esc).join(', ')}` : ''}</div></span><small>${m.remain ? `${m.remain}학점 남음` : '요건 충족'}</small></li>`).join('')}</ul>
      </div>
    </section>

    ${res.tips.length ? `<section class="section"><h3>놓치기 쉬운 규정</h3><ul class="tips">${res.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}

    <section class="section ask">
      <h3><img src="assets/chatkhu.png" alt="ChatKHU" width="86" height="26">에게 이어서 물어보기</h3>
      <p class="lead">진단 결과와 수강 계획 초안을 담은 질문이에요. 복사해서 ChatKHU에 붙여넣으면 진로에 맞게 계획을 다듬을 수 있어요.</p>
      <textarea id="prompt" readonly>${esc(chatkhuPrompt(res, plan))}</textarea>
      <div class="btnrow" style="margin-top:8px"><button class="btn" type="button" id="copy">질문 복사하기</button><span class="msg" id="copied" aria-live="polite"></span></div>
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
    $('#year').addEventListener('change', (e) => { state.year = Number(e.target.value); state.official = null; const moved = state.year < 2022 && state.dept === '빅데이터응용학과'; if (moved) state.dept = '경영학과'; $('#deptmsg').textContent = moved ? '빅데이터응용학과는 22학번부터 있어서 경영학과로 바꿨어요.' : ''; state.sampleName = null; render(); });
    $('#dept').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && !b.disabled) { $('#deptmsg').textContent = ''; state.dept = b.dataset.v; state.sampleName = null; state.official = null; render(); } });
    $('#track').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.track = b.dataset.v; render(); } });
    document.querySelector('.tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.tab = b.dataset.tab; renderInputs(); } });

    function applyParsed(r, source) {
      const msg = $('#parsemsg');
      msg.className = 'msg';
      if (r.kind === 'diagnosis') {
        if (!r.courses.length) { msg.className = 'msg warn'; msg.textContent = '진단표는 찾았는데 과목 목록을 읽지 못했어요. 진단표 전체를 다시 복사하거나 PDF로 올려 주세요.'; return; }
        const notes = [];
        if (r.year && r.year >= 2019 && r.year <= 2026) state.year = r.year; else if (r.year) notes.push(`졸업기준년도 ${r.year}는 이 사이트 범위(2019~2026) 밖이에요.`);
        if (r.dept) state.dept = r.dept; else notes.push('학과를 찾지 못했어요. 위에서 직접 골라 주세요.');
        state.courses = r.courses;
        if (r.sw != null) state.sw = r.sw;
        state.liberal = { dist: 0, free: 0, general: 0, areas: state.liberal.areas, reqChecked: [], engExempt: false };
        state.official = Object.keys(r.official).length ? r.official : null;
        state.interests = []; state.interestsSet = false;
        state.sampleName = null;
        const ipN = r.courses.filter((c) => c.ip).length;
        if (window.matchMedia('(max-width: 960px)').matches) setTimeout(() => $('#sheet').scrollIntoView({ behavior: 'smooth' }), 50);
        msg.textContent = `${source} 졸업진단표를 읽었어요. ${K.deptLabel(state.dept, state.year)} ${state.year} 기준, ${r.courses.length - ipN}과목을 넣었어요${ipN ? ` (이번 학기 수강 중 ${ipN}과목 포함)` : ''}. 학번·학과도 진단표에 맞췄어요. ${ipN ? '' : '이번 학기에 듣는 과목은 아래 칸에서 추가하세요.'} ${notes.join(' ')}`;
      } else {
        addCourses(r.courses);
        msg.textContent = r.courses.length
          ? `${r.courses.length}과목을 불러왔어요.${r.skipped.length ? ` F·NP 등급이거나 읽지 못한 ${r.skipped.length}줄은 뺐어요.` : ''}`
          : '과목을 찾지 못했어요. 진단표나 성적 표를 행 단위로 복사했는지 확인하세요.';
        if (!r.courses.length) msg.className = 'msg warn';
        state.sampleName = null;
      }
      render();
    }
    $('#parse').addEventListener('click', () => applyParsed(K.parseAny($('#paste').value, { now: NOW }), '붙여넣은'));
    $('#pdf').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const msg = $('#parsemsg');
      msg.className = 'msg'; msg.textContent = 'PDF를 읽는 중이에요…';
      try {
        const text = await pdfToText(f);
        const r = K.parseAny(text, { now: NOW });
        if (r.kind !== 'diagnosis' && !r.courses.length) {
          msg.className = 'msg warn';
          msg.textContent = text.trim() ? '졸업진단표 형식을 찾지 못했어요. 인포21 졸업사정 조회에서 저장한 졸업진단표 PDF인지 확인해 주세요.' : 'PDF에서 글자를 읽지 못했어요. 스캔하거나 캡처한 이미지 PDF는 읽을 수 없어요. 인포21에서 PDF로 저장한 파일을 올려 주세요.';
        } else applyParsed(r, 'PDF');
      } catch (err) {
        msg.className = 'msg warn';
        msg.textContent = `PDF를 열지 못했어요 (${err && err.message ? err.message : err}). 진단표 내용을 복사해서 붙여넣어 주세요.`;
      }
      e.target.value = '';
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
    $('#clear').addEventListener('click', () => { state.courses = []; state.sampleName = null; state.official = null; render(); });

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
    $('#exam').addEventListener('change', (e) => { state.examDone = e.target.checked; renderResult(); });
    $('#thesis').addEventListener('change', (e) => { state.thesisDone = e.target.checked; renderResult(); });
    $('#engExempt').addEventListener('change', (e) => { state.liberal.engExempt = e.target.checked; renderResult(); });

    $('#samples').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-sample]');
      if (b) $('#deptmsg').textContent = '';
      if (!b) return;
      const s = SAMPLES[b.dataset.sample];
      Object.assign(state, JSON.parse(JSON.stringify({ year: s.year, dept: s.dept, track: s.track, sw: s.sw, examDone: s.examDone, thesisDone: s.thesisDone, courses: s.courses })));
      state.liberal = { reqChecked: [], engExempt: false, ...JSON.parse(JSON.stringify(s.liberal)) };
      state.interests = []; state.interestsSet = false; state.sampleName = s.name; state.official = null;
      render();
      if (window.matchMedia('(max-width: 960px)').matches) $('#sheet').scrollIntoView({ behavior: 'smooth' });
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
      if (e.target.id === 'copy') {
        const ta = $('#prompt');
        const done = () => { $('#copied').textContent = '복사했어요. ChatKHU에 붙여넣으세요.'; };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); document.execCommand('copy'); done(); });
        else { ta.select(); document.execCommand('copy'); done(); }
      }
    });
  }


  /* ---------- PDF → 텍스트 (브라우저 안에서만 처리) ---------- */
  let pdfjs = null;
  async function loadPdfjs() {
    if (pdfjs) return pdfjs;
    const local = new URL('vendor/', document.baseURI).href;
    try {
      const [lib, cm] = await Promise.all([import(local + 'pdf.min.js'), import(local + 'cmaps.js')]);
      lib.GlobalWorkerOptions.workerSrc = local + 'pdf.worker.min.js';
      const maps = cm.default;
      // 한글 CMap을 파일 대신 내장 데이터에서 읽어 오는 팩토리
      class EmbeddedData {
        constructor() {}
        async fetch({ kind, filename }) {
          if (kind === 'cMapUrl' && maps[filename]) return Uint8Array.from(atob(maps[filename]), (c) => c.charCodeAt(0));
          throw new Error(`내장 데이터 없음: ${filename}`);
        }
      }
      pdfjs = { lib, opts: { BinaryDataFactory: EmbeddedData, cMapUrl: 'embedded/', cMapPacked: true, useWorkerFetch: false } };
    } catch (e) {
      const cdn = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/';
      const lib = await import(cdn + 'pdf.min.mjs');
      lib.GlobalWorkerOptions.workerSrc = cdn + 'pdf.worker.min.mjs';
      pdfjs = { lib, opts: { cMapUrl: cdn + 'cmaps/', cMapPacked: true } };
    }
    return pdfjs;
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
    const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), ...opts }).promise;
    const out = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n);
      const vp = page.getViewport({ scale: 1 });
      const tc = await page.getTextContent();
      const items = tc.items.filter((i) => i.str && i.str.trim()).map((i) => ({ s: i.str, x: i.transform[4], y: vp.height - i.transform[5], w: i.width, h: Math.abs(i.transform[3]) || 8 }));
      const libHead = items.find((i) => /교양\s*\/\s*기타/.test(i.s));
      const majHead = items.find((i) => /^\s*전공학점\s*$/.test(i.s));
      const splitY = libHead ? libHead.y - 3 : Infinity;
      const splitX = majHead ? majHead.x - 4 : vp.width * 0.43;
      const top = items.filter((i) => i.y < splitY);
      const rest = items.filter((i) => i.y >= splitY);
      out.push(...toLines(top), ...toLines(rest.filter((i) => i.x < splitX)), ...toLines(rest.filter((i) => i.x >= splitX)));
    }
    return out.join('\n');
  }

  bind();
  render();
})();
