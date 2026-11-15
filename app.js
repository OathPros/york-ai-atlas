/* global YORK_AI_AUDIT */
(() => {
  'use strict';
  const data = window.YORK_AI_AUDIT;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const byId = new Map(data.records.map(r => [r.id, r]));
  const byNeed = new Map(data.needs.map(n => [n.id, n]));
  const fields = ['audience','owner','domain','action','evidence','topic'];
  const needFields = ['needsSearch','needsAudience','needsCategory','needsCoverage','needsBasis','needsMultiplicity','needsSort'];
  const defaults = { tab:'inventory', search:'', audience:'', owner:'', domain:'', action:'', evidence:'', topic:'', sort:'priority', table:false, resource:'',resourceNeed:'',need:'',
    needsSearch:'',needsAudience:'',needsCategory:'',needsCoverage:'',needsBasis:'',needsMultiplicity:'',needsSort:'priority' };
  const state = { ...defaults };
  const hashFields = ['search',...fields,'sort','resource','resourceNeed','need',...needFields];
  const tabNames = ['inventory','needs','sitemap','overlaps','blueprint','method'];
  const priorities = ['P0 / resolve before reuse','P1 / high priority','P2 / consolidation','P3 / supporting resource'];
  const link = (r, text = 'Visit source') => `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(text)} <span aria-hidden="true">&nearr;</span></a>`;
  const detailButton = (id, label) => `<button class="source-link" data-resource="${esc(id)}">${esc(label || byId.get(id).title)}</button>`;
  const unique = values => [...new Set(values)].sort((a,b) => a.localeCompare(b));
  const bad = r => /HTTP|failure|Protected|Wrong destination/.test(r.evidence);
  const date = value => new Date(value).toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric', timeZone:'America/Toronto' });
  let opener = null;
  function readHash() {
    Object.assign(state, defaults);
    const p = new URLSearchParams(location.hash.slice(1));
    state.tab = tabNames.includes(p.get('view')) ? p.get('view') : 'inventory';
    for (const f of hashFields) if (p.has(f)) state[f] = p.get(f);
    state.table = p.get('table') === '1';
  }
  function writeHash() {
    const p = new URLSearchParams({ view:state.tab });
    for (const f of hashFields) if (state[f] && !(['sort','needsSort'].includes(f) && state[f] === 'priority')) p.set(f, state[f]);
    if (state.table) p.set('table','1');
    history.replaceState(null,'',`#${p}`);
  }
  function filtered() {
    const query = state.search.trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    const records = data.records.filter(r => {
      if (state.audience && !r.audience.includes(state.audience)) return false;
      if (state.topic && !r.topics.includes(state.topic)) return false;
      if (state.owner && r.owner !== state.owner) return false;
      if (state.domain && r.domain !== state.domain) return false;
      if (state.action && r.action !== state.action) return false;
      if (state.evidence && r.evidence !== state.evidence) return false;
      if (state.resourceNeed && !r.needIds.includes(state.resourceNeed)) return false;
      const haystack = [r.title,r.summary,r.addresses,r.url,r.finalUrl,r.owner,r.target,r.recommendation,...r.topics,...r.audience,...r.needIds.map(id=>byNeed.get(id).title)].join(' ').toLowerCase();
      return terms.every(t => haystack.includes(t));
    });
    return records.sort((a,b) => {
      if (state.sort === 'priority') return a.priority - b.priority || Number(b.curated) - Number(a.curated) || a.title.localeCompare(b.title);
      if (state.sort === 'hops') return (a.hops ?? Infinity) - (b.hops ?? Infinity) || a.title.localeCompare(b.title);
      const key = ['title','domain','owner','action'].includes(state.sort) ? state.sort : 'title';
      return a[key].localeCompare(b[key]) || a.title.localeCompare(b.title);
    });
  }
  function syncInputs() {
    $('search').value = state.search;
    for (const f of fields) $(f).value = state[f];
    $('sort').value = state.sort;
    $('resource-need').value = state.resourceNeed;
    $('view-toggle').textContent = state.table ? 'Card view' : 'Table view';
    $('view-toggle').setAttribute('aria-pressed',String(state.table));
  }
  function filteredNeeds() {
    const terms=state.needsSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return data.needs.filter(n=>{
      if(state.needsAudience && !n.audience.includes(state.needsAudience)) return false;
      if(state.needsCategory && n.category!==state.needsCategory) return false;
      if(state.needsCoverage && n.coverage!==state.needsCoverage) return false;
      if(state.needsBasis && n.basis!==state.needsBasis) return false;
      if(state.needsMultiplicity==='multiple' && n.directCount<2) return false;
      if(state.needsMultiplicity==='zero' && n.directCount!==0) return false;
      const haystack=[n.id,n.title,n.statement,n.success,n.assessment,n.action,n.owner,n.category,...n.audience,...n.mappings.map(m=>byId.get(m.resourceId).title)].join(' ').toLowerCase();
      return terms.every(t=>haystack.includes(t));
    }).sort((a,b)=>{
      if(state.needsSort==='title') return a.title.localeCompare(b.title);
      if(state.needsSort==='most') return b.directCount-a.directCount || a.title.localeCompare(b.title);
      if(state.needsSort==='least') return a.directCount-b.directCount || a.title.localeCompare(b.title);
      if(state.needsSort==='coverage') return data.needCoverageOrder.indexOf(a.coverage)-data.needCoverageOrder.indexOf(b.coverage) || a.title.localeCompare(b.title);
      return a.priority-b.priority || data.needCoverageOrder.indexOf(a.coverage)-data.needCoverageOrder.indexOf(b.coverage) || a.title.localeCompare(b.title);
    });
  }
  function syncNeedInputs() {
    for(const f of needFields) $(f).value=state[f];
  }
  function renderNeedResults() {
    const needs=filteredNeeds();
    $('need-result-count').textContent=`${needs.length} of ${data.needs.length} atomic needs / ${needs.reduce((sum,n)=>sum+n.mappings.length,0)} content relationships`;
    $('need-list').innerHTML=needs.length ? needs.map(n=>`
      <article class="need-card ${n.coverage==='Potential gap'?'gap':n.coverage==='Conflicting answers'?'conflict':''}" id="${esc(n.id)}" tabindex="-1">
        <div class="card-top"><span>${esc(n.id)} / ${esc(n.category)}</span><span class="need-status">${esc(n.coverage)}</span></div>
        <h3><button data-need="${esc(n.id)}">${esc(n.title)}</button></h3>
        <p class="need-statement">${esc(n.statement)}</p>
        <div class="card-tags">${n.audience.map(a=>`<span class="tag">${esc(a)}</span>`).join('')}<span class="tag">${esc(n.basis)}</span></div>
        <p class="need-assessment">${esc(n.assessment)}</p>
        <div class="need-counts"><strong>${n.directCount}</strong> current direct answer instances <span>/ ${n.contentCount-n.directCount} context, signpost, historical or unverified links</span></div>
        <details class="need-detail"><summary>Evidence, content instances & proposed response</summary>
          <h4>Success condition (proposed)</h4><p>${esc(n.success)}</p>
          <h4>Content mapped to this one need</h4>
          ${n.mappings.map(m=>{const r=byId.get(m.resourceId);return `<div class="need-mapping"><span class="tag">${esc(m.role)}</span>${detailButton(r.id)}<p>${esc(m.rationale)}</p>${m.quote?`<blockquote>${esc(m.quote)}</blockquote>`:''}<p>${link(r,'Open original source')} / ${esc(r.evidence)}</p></div>`;}).join('')}
          <h4>Proposed canonical answer/home</h4><p>${esc(n.proposedHome)}</p>
          <h4>Proposed accountable group</h4><p>${esc(n.owner)}</p>
          <h4>Consolidation or gap response</h4><p>${esc(n.action)}</p>
          ${n.gapSearch?`<div class="callout warning"><h4>Bounded gap-search record</h4><p>No direct answer identified in these ${n.gapSearch.scopeIds.length} selected captured sources; this is not a York-wide absence claim.</p><p>${esc(n.gapSearch.limitation)}</p><p>Literal term hits (not proof of coverage): ${n.gapSearch.results.map(r=>`${esc(r.term)}: ${r.resourceIds.length} sources`).join('; ')}.</p><details><summary>Sources checked</summary>${n.gapSearch.scopeIds.map(id=>detailButton(id)).join('')}</details></div>`:''}
          <p class="muted">${esc(n.validation)}. Content presence does not establish that users can successfully complete the task.</p>
        </details>
        <div class="need-actions"><button class="text-button" data-need-content="${esc(n.id)}">View all ${n.contentCount} mapped resources &rarr;</button><button class="text-button" data-need="${esc(n.id)}">Open / link to need</button></div>
      </article>`).join('') : '<div class="empty"><h3>No matching needs</h3><p>Try fewer filters. Unmapped content is not classified as an unmet need.</p><button class="button secondary" data-needs-reset>Clear need filters</button></div>';
  }
  function renderNeeds() {
    const options=(values)=>values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    const m=data.needsMeta;
    $('needs').innerHTML=`<div class="section-head"><div><p class="eyebrow">START WITH THE PROBLEM, NOT THE PAGE</p><h2>Catalogue of need</h2><p>One atomic user outcome can be served by many pieces of content; one piece of content can serve many needs. These are analyst-inferred needs, not validated user-research findings.</p></div><button id="export-needs" class="button secondary">Export filtered needs CSV &darr;</button></div>
      <div class="need-metrics">${[[m.total,'atomic needs'],[m.multipleDirect,'with multiple direct answers'],[m.coverageCounts['Potential gap'],'potential gaps'],[m.coverageCounts['Conflicting answers'],'conflicting answers'],[m.mappings,'need-to-content mappings']].map(([count,label])=>`<div><strong>${count}</strong><span>${esc(label)}</span></div>`).join('')}</div>
      <div class="callout"><strong>Coverage is a judgement, not a page count.</strong> "Addressed" means a current answer was identified in reviewed content, not that it is complete, approved or usability-tested. Multiple instances may be useful contextual or format variants, not redundant copies. A potential gap means no direct answer was identified in the stated reviewed scope, not that York has no such service or process.</div>
      <div class="workspace"><aside class="filters" aria-label="Need filters">
        <label for="needsSearch">Search user outcomes</label><input id="needsSearch" type="search" placeholder="Try: permission, disclose, harm...">
        <label for="needsAudience">Audience</label><select id="needsAudience"><option value="">All audiences</option>${options(unique(data.needs.flatMap(n=>n.audience)))}</select>
        <label for="needsCategory">Need category</label><select id="needsCategory"><option value="">All categories</option>${options(unique(data.needs.map(n=>n.category)))}</select>
        <label for="needsCoverage">Coverage assessment</label><select id="needsCoverage"><option value="">All coverage assessments</option>${options(data.needCoverageOrder)}</select>
        <label for="needsMultiplicity">Current direct answer instances</label><select id="needsMultiplicity"><option value="">Any number</option><option value="multiple">Two or more instances</option><option value="zero">No direct answer identified</option></select>
        <label for="needsBasis">Need evidence basis</label><select id="needsBasis"><option value="">All need hypotheses</option>${options(unique(data.needs.map(n=>n.basis)))}</select>
        <button class="text-button" data-needs-reset>Clear need filters</button>
        <div class="filter-note"><strong>Need &ne; content topic.</strong><p>"AI policy" is a topic. "Know whether I may use AI for this assessment" is a need with a testable user outcome.</p><p>${m.mappedResources} resource records are mapped; ${m.unmappedResources} are not yet mapped. Unmapped does not mean irrelevant, unnecessary or unmet.</p><a href="need-content-map.csv" download>Export full relationship map</a></div>
      </aside><div class="results"><div class="results-bar"><span id="need-result-count" role="status" aria-live="polite"></span><div><label for="needsSort" class="sr-only">Sort needs</label><select id="needsSort"><option value="priority">Priority: highest first</option><option value="coverage">Coverage assessment</option><option value="title">Need: A to Z</option><option value="most">Most direct answer instances</option><option value="least">Fewest direct answer instances</option></select></div></div><div id="need-list" class="need-grid"></div></div></div>`;
    for(const f of needFields) $(f).addEventListener(f==='needsSearch'?'input':'change',()=>{
      state[f]=$(f).value;state.need='';renderNeedResults();writeHash();
    });
    $('export-needs').addEventListener('click',downloadNeedsCsv);
    syncNeedInputs();renderNeedResults();
  }
  function resetNeeds() {
    for(const f of needFields) state[f]=defaults[f];
    state.need='';syncNeedInputs();renderNeedResults();writeHash();
  }
  function focusNeed(id) {
    const card=$(id);
    if(!card) return;
    card.querySelector('.need-detail').open=true;
    card.scrollIntoView({behavior:'smooth',block:'start'});card.focus({preventScroll:true});
  }
  function openNeed(id) {
    if(!byNeed.has(id)) return;
    if($('detail').open) closeDetail();
    state.resource='';
    for(const f of needFields) state[f]=defaults[f];
    state.need=id;syncNeedInputs();renderNeedResults();showTab('needs');focusNeed(id);
  }
  function renderInventory() {
    const records = filtered();
    $('result-count').textContent = `${records.length} of ${data.records.length} resources / ${records.filter(r=>r.curated).length} analyst-curated`;
    const tags = ['Academic integrity','Approved tools','Teaching','Research practice','Training','Citation','Privacy','Programs','Governance'];
    $('quick-tags').innerHTML = ['All topics',...tags].map(t=>`<button class="chip ${(!state.topic && t==='All topics') || state.topic===t ? 'active':''}" aria-pressed="${(!state.topic && t==='All topics') || state.topic===t}" data-topic="${t==='All topics'?'':esc(t)}">${esc(t)}</button>`).join('');
    if (!records.length) {
      $('resource-list').innerHTML = '<div class="empty"><h3>No matching resources</h3><p>Try fewer filters or clear your search. Filters are combined.</p><button class="button secondary" data-reset>Clear all filters</button></div>';
      return;
    }
    if (state.table) {
      $('resource-list').innerHTML = `<div class="table-wrap"><table><thead><tr><th>RESOURCE / WHAT IT ADDRESSES</th><th>PUBLISHER / HOST</th><th>ACTION / PRIORITY</th><th>EVIDENCE</th><th>SOURCE</th></tr></thead><tbody>${records.map(r=>`<tr><td><button data-resource="${esc(r.id)}">${esc(r.title)}</button><small>${esc(r.addresses)}</small></td><td>${esc(r.owner)}<small>${esc(r.domain)}</small></td><td><span class="action ${r.action.toLowerCase()}">${esc(r.action)}</span><small>${esc(priorities[r.priority])}</small></td><td>${esc(r.evidence)}</td><td>${link(r,'Open')}</td></tr>`).join('')}</tbody></table></div>`;
    } else {
      $('resource-list').innerHTML = `<div class="resource-grid">${records.map(r=>`<article class="resource-card"><div class="card-top"><span>${esc(r.owner)}</span><span class="action ${r.action.toLowerCase()}">${esc(r.action)}</span></div><h3><button data-resource="${esc(r.id)}">${esc(r.title)}</button></h3><div class="resource-url">${esc(r.domain)}${r.hops!==null ? ` / ${r.hops===0 ? 'Hub' : r.hops+' observed link hop'+(r.hops===1?'':'s')}` : ' / No observed hub path'}</div><p>${esc(r.summary)}</p><div class="card-tags">${r.topics.slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div><div class="card-footer"><span class="${bad(r)?'status-warning':''}">${esc(r.evidence)}</span>${link(r)}</div></article>`).join('')}</div>`;
    }
  }
  function renderSitemap() {
    const pillars = [['teaching','Teaching & learning'],['research','Research & innovation'],['operations','University operations & AI']];
    const groups = unique(data.records.map(r=>r.owner));
    $('sitemap').innerHTML = `<div class="section-head"><div><p class="eyebrow">HOW THE CURRENT LANDSCAPE FITS TOGETHER</p><h2>A small front door. A distributed web.</h2><p>The three cards below are actual onward links from AI @ York. The publishing-family groups are an inventory view, not invented parent-child navigation.</p></div></div>
      <div class="sitemap-root"><p class="eyebrow" style="color:#ffffff">CURRENT ENTRY POINT</p><h3>AI @ York</h3>${link(byId.get('hub'),'yorku.ca/ai-at-york/')}<p>Coordinates the message; delegates the answers to three separate branches.</p></div>
      <div class="pillars">${pillars.map(([id,label])=>`<article class="pillar"><p class="eyebrow">OBSERVED DIRECT HUB LINK &darr;</p><h3>${esc(label)}</h3><p>${esc(byId.get(id).owner)}</p>${detailButton(id,'Explore this branch and its links')}</article>`).join('')}</div>
      <div class="callout"><strong>${data.edges.length} observed resource-to-resource links.</strong> Open any resource to explore its captured incoming and outgoing links. Distances are shortest observed paths in this bounded graph, not guaranteed website-wide click counts. No observed path does not mean a page is orphaned.</div>
      <label for="map-search" class="sr-only">Find a resource in the sitemap</label><input id="map-search" type="search" placeholder="Find a page, topic or publishing family..." style="width:100%;margin-bottom:20px">
      <div id="map-groups">${groups.map(g=>`<details class="map-family"><summary>${esc(g)} <small>${data.records.filter(r=>r.owner===g).length} resources</small></summary><div class="map-items">${data.records.filter(r=>r.owner===g).sort((a,b)=>a.title.localeCompare(b.title)).map(r=>`<div class="map-item" data-map-search="${esc([r.title,r.owner,r.url,...r.topics].join(' ').toLowerCase())}"><div><button data-resource="${esc(r.id)}">${esc(r.title)}</button><small>${esc(r.url)}</small></div><span class="hops">${r.hops===null?'No observed hub path':r.hops+' observed hops'}<br>${esc(r.action)}</span></div>`).join('')}</div></details>`).join('')}</div>`;
    $('map-search').addEventListener('input',e=>{
      const q=e.target.value.toLowerCase().trim();
      for (const group of $('map-groups').querySelectorAll('details')) {
        let visible=0;
        for(const row of group.querySelectorAll('.map-item')) { row.hidden=!row.dataset.mapSearch.includes(q); if(!row.hidden) visible++; }
        group.hidden=visible===0;
        if(q && visible) group.open=true;
      }
    });
  }
  function renderOverlaps() {
    const exact = data.exactDuplicates.map(g=>`<article class="method-card"><h3>Identical extracted text</h3><p>${esc(g.basis)}. This does not establish identical files, visual presentation or document authority.</p>${g.ids.map(id=>detailButton(id)).join('')}<small class="muted">SHA-256: ${esc(g.hash.slice(0,24))}...</small></article>`).join('');
    $('overlaps').innerHTML = `<div class="section-head"><div><p class="eyebrow">WHAT SHOULD BE FIXED, SHARED OR LEFT ALONE?</p><h2>Overlap is not always duplication.</h2><p>${data.findings.length} evidence-linked clusters separate contradictory guidance, version drift, repeated navigation and valuable specialist content.</p></div></div>
      <div class="callout warning"><h3>Resolve the rules before consolidating the pages.</h3><p>The highest-priority findings concern course permission and the version of operational guidelines being linked. A merged page would only spread ambiguity faster if these are not resolved by the appropriate authorities.</p></div>
      <div class="cluster-grid">${data.findings.map((f,i)=>`<article class="cluster ${['Critical','High'].includes(f.severity)?'high':''}" id="finding-${esc(f.id)}"><p class="eyebrow">${String(i+1).padStart(2,'0')} / ${esc(f.severity)} / ${esc(f.kind)}</p><h3>${esc(f.title)}</h3><p>${esc(f.observation)}</p>${f.quotes.map(q=>`<blockquote>${esc(q.text)}<br>${detailButton(q.id,'Source: '+byId.get(q.id).title)}</blockquote>`).join('')}<div class="decision"><p><strong>Proposed action:</strong> ${esc(f.decision)}</p><p><strong>Proposed accountable group:</strong> ${esc(f.owner)}</p><p><strong>Future home:</strong> ${esc(f.target)}</p><p><strong>Done when:</strong> ${esc(f.measure)}</p><details><summary>${f.keys.length} related resources</summary>${f.keys.map(id=>detailButton(id)).join('')}</details></div></article>`).join('')}</div>
      <h2 style="margin-top:35px">Machine-checked text matches</h2><p class="muted">Topic overlap above is analyst judgement, not a duplicate-percentage calculation. The matches below use text equality instead.</p><div class="method-grid">${exact || '<p>No exact extracted-text matches found.</p>'}</div>`;
  }
  function renderBlueprint() {
    $('blueprint').innerHTML = `<div class="section-head"><div><p class="eyebrow">A SINGLE FRONT DOOR, NOT A SINGLE GIANT DOCUMENT</p><h2>One experience. Federated expertise.</h2><p>A proposed information architecture for the existing AI @ York destination. These section names and ownership assignments are recommendations, not approved York structure.</p></div></div>
      <div class="hub-preview"><p class="eyebrow">PROPOSED AI @ YORK HOMEPAGE / INTERACTIVE TASK ROUTES</p><h3>What do you need to do?</h3><p>Make the user's task the organising principle. Bring approved answers, summaries and discovery together; leave authoritative policies, transactions and specialist depth with their owners.</p><div class="task-grid">${data.blueprint.map(b=>`<button data-blueprint="${esc(b.id)}">${esc(b.task)}<span>${esc(b.subtitle)} &rarr;</span></button>`).join('')}</div></div>
      <div class="callout"><strong>What "single page" should mean:</strong> one canonical AI @ York landing experience with searchable/filterable sections, common answers and clear onward actions. Do not copy every research project, course page, registration workflow and policy document into a huge page. Canonical summaries and metadata can be presented together while detailed content stays at its authoritative source.</div>
      <div class="blueprint-grid">${data.blueprint.map((b,i)=>`<article class="blueprint-card" id="blueprint-${esc(b.id)}" tabindex="-1"><span class="number">${String(i+1).padStart(2,'0')} / PROPOSED SECTION</span><h3>${esc(b.title)}</h3><p>${esc(b.body)}</p><h4>Proposed content owner</h4><p>${esc(b.owner)}</p><h4>Keep or reuse, rather than duplicate</h4><p>${esc(b.keep)}</p><details><summary>Existing sources to bring together</summary>${b.source.map(id=>detailButton(id)).join('')}</details><button class="text-button" data-inventory-topic="${esc(b.topic)}">Browse matching inventory &rarr;</button></article>`).join('')}</div>
      <h2>Make consolidation sustainable</h2><div class="method-grid">
      <article class="method-card"><h3>One content model</h3><p>Each resource needs: canonical ID/URL, plain-language title, what question it answers, audience, task/topic, content type, policy authority (where applicable), source owner, approval/review dates, language, access conditions and migration action. Tool records additionally need licence, authentication, purpose, permitted data classes and configuration caveats.</p><p>Use reusable structured records or shared content components in the CMS; a common WordPress taxonomy alone will not keep copied paragraphs in sync.</p></article>
      <article class="method-card"><h3>Named accountability</h3><p>Assign a hub product owner and a publisher for each content family. Policy authorities approve common interpretations; UIT/Information Security/privacy approve tool statements; Libraries owns citation mechanics; Faculties contribute examples. Confirm these responsibilities with the units rather than assuming this audit establishes them.</p><p>Suggested cadence: monthly link checks; quarterly tool, permission and top-task reviews; event-driven updates after policy/licence changes; semiannual programme/centre checks. Display last-reviewed dates and an issue-reporting route.</p></article></div>
      <h2>A practical migration sequence</h2><div class="phase-grid"><article class="phase"><p class="eyebrow">PHASE 1 / CORRECT</p><h4>Agree on the answers</h4><p>Resolve course-permission wording, confirm current guideline versions, review tool privacy claims and fix intended-destination failures. Confirm owners, archival duties and baseline task success before changing URLs.</p></article><article class="phase"><p class="eyebrow">PHASE 2 / CONSOLIDATE</p><h4>Build the shared front door</h4><p>Publish the seven task sections, shared catalogue and policy/tool records. Migrate or replace generic summaries, syndicate training/news and keep specialist detail linked. Preserve accessible and French-language routes.</p></article><article class="phase"><p class="eyebrow">PHASE 3 / RETIRE & MEASURE</p><h4>Reduce maintenance without breaking journeys</h4><p>Approve URL-by-URL redirects only for superseded equivalents. Keep useful faculty/admissions entry points, add canonical links where appropriate and monitor search, errors and task completion after launch.</p></article></div>
      <div class="callout"><strong>Measure the outcome, not the page-count reduction:</strong> no conflicting common rules, no broken critical paths, every core answer and tool record has an owner/review date, and users can complete tool-selection, course-permission, citation, research and training tasks from AI @ York. Establish analytics and usability baselines before setting numerical targets; no traffic or analytics was available for this audit.</div>`;
  }
  function renderMethod() {
    const m=data.meta;
    $('method').innerHTML = `<div class="section-head"><div><p class="eyebrow">KNOW WHAT THIS AUDIT DOES AND DOES NOT PROVE</p><h2>Evidence, scope & repeatability</h2><p>Public-web snapshot collected ${esc(date(m.collectedAt))}. Live pages, tool availability and policy wording may change after this date.</p></div></div>
      <div class="callout"><strong>${m.attemptedUrls} URL retrievals &rarr; ${m.inventoryRecords} inventory records.</strong> ${m.curatedRecords} have analyst-written summaries and proposed actions; ${m.extractedRecords} are extracted supporting leads that still need triage. ${m.excludedEndpoints} proxy/transactional endpoints are excluded. Aliases resolving to a common destination are grouped, so URL and resource counts differ.</div>
      <div class="method-grid">
      <article class="method-card"><h3>Discovery and retrieval</h3><p>Started from AI @ York and its three main branches. Followed topic-relevant links in extracted main content to depth two, with a 150-URL initial cap and a 400 ms pause between sequential requests. Added targeted public search follow-up for faculty, law, continuing education, cybersecurity and Library guide sections.</p><p>Retained ${m.pdfsExtracted} PDF text extractions. Added observed Library section-navigation relationships. Recorded final response URLs, declared canonicals where available, HTTP outcomes, retrieved excerpts and timestamps. SAVY was retrieved through an alternate web fetch after the local collector failed; its record says so.</p></article>
      <article class="method-card"><h3>Coverage is broad, not exhaustive</h3><p>Includes the central hub, educational principles, integrity/policy, Libraries/SPARK, UIT tools and data handling, graduate research, centres/initiatives, law/IP, teaching resources, programmes, continuing education, training and sampled news.</p><p>There is no claim to have found every York AI mention, course, researcher, event, PDF, French page or subdomain. ${m.unvisitedLeads} discovered URLs remain in the explicit retrieval backlog. No complete campus-by-campus or bilingual audit was performed. Many connected-minds/news/workshop records are leads, not recommendations to migrate.</p></article>
      <article class="method-card"><h3>Evidence and authority</h3><p><strong>Analyst-curated source:</strong> manually written summary and recommendation tied to a retrieved source. <strong>Extracted / needs triage:</strong> machine-extracted description, not substantively validated. <strong>Verified alternate fetch:</strong> source content retrieved using another fetch route. Failures are shown explicitly.</p><p>Publishing families are inferred from site identity/URL, not verified legal ownership. Proposed owners and canonical homes require confirmation. "Approved tools" is a topic tag, not a determination that every mentioned tool or use is approved.</p></article>
      <article class="method-card"><h3>Failure and interpretation limits</h3><p>HTTP 404 means the tested URL returned not found; HTTP 500 is a server response, not proof of restricted access. Transport failure may be specific to this network/tool. Password-protected and generic replacement pages are not treated as verified destination content.</p><p>No sign-in, passwords, private systems, analytics, embedded videos, JavaScript-only interactions or tool configurations were inspected. Visual permission states were not inferred from plain text. External funder/vendor/publisher pages were not audited. This is a content audit, not a policy ruling, technical security review or legal opinion.</p></article>
      <article class="method-card"><h3>What counts as duplication?</h3><p>Findings identify overlapping answers, inconsistent interpretations, outdated versions, repeated navigation, marketing surfaces and alternate formats separately. These do not all warrant deletion.</p><p>Exact-text matches are SHA-256 matches of whitespace-normalised extracted body/PDF text, not binary equality or proof of identical legal status. Same-final-URL aliases are grouped separately. No inferred percentage of redundant content or maintenance savings is presented.</p></article>
      <article class="method-card"><h3>How to finish the institution-wide audit</h3><p>Obtain CMS URL exports/sitemaps and analytics from York web owners, add all Faculties/campuses and French counterparts, confirm protected-content inventories with owners, triage the backlog and validate the proposed owner/canonical mapping.</p><p>Run task-based usability sessions with students, instructors, researchers and staff. Complete accessibility testing and content sign-off before production. This dashboard is a local decision aid, not a deployed replacement for York's live site.</p></article>
      <article class="method-card"><h3>Atomic needs and coverage judgements</h3><p>The needs catalogue separates the user outcome from its current content implementation. Mappings distinguish current direct answers, supporting context, signposts, historical guidance and unverified destinations. Direct-answer counts are grouped resource records, not independent policy authorities or a redundancy score.</p><p>Needs were inferred from captured content or proposed as explicit hypotheses; none has been validated through user research. Potential gaps include the selected search scope, literal term hits and limitations. Unverified destinations, missing translations and unmapped content are not automatically gaps. The catalogue reuses the original public-web snapshot; adding it did not perform a new institutional crawl.</p></article>
      <article class="method-card wide"><h3>Files and reusable data</h3><div class="downloads"><a href="inventory.csv" download>Full inventory CSV</a><a href="needs-catalogue.csv" download>Catalogue of need CSV</a><a href="need-content-map.csv" download>Need-to-content relationship CSV</a><a href="discovery-backlog.csv" download>Unretrieved discovery backlog CSV</a><a href="audit-data.json" download>Structured audit JSON</a><a href="sources.json" download>Raw HTML extraction evidence JSON</a><a href="pdf-evidence.json" download>PDF extraction evidence JSON</a><a href="supplemental-evidence.json" download>Alternate-fetch evidence</a><a href="briefing.html">Printable executive briefing</a></div><p style="margin-top:16px">Open index.html locally; no server or installation is required. The dashboard reads its packaged data.js and makes no network requests. External source links require an internet connection. Collection scripts are included for repeatability and require local Node + jsdom, and Python + pypdf for PDF extraction. Re-running the collector overwrites sources.json; preserve dated snapshots before refreshing.</p></article>
      </div>
      <details class="map-family"><summary>Unretrieved discovery backlog <small>${m.unvisitedLeads} URLs</small></summary><div class="map-items">${data.unvisited.map(r=>`<div class="map-item"><div><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.text || r.url)}</a><small>Found on: ${esc(r.from)}</small></div></div>`).join('')}</div></details>
      <details class="map-family"><summary>Excluded endpoints <small>${m.excludedEndpoints} URLs</small></summary><div class="map-items">${data.excluded.map(r=>`<div class="map-item"><div><small>${esc(r.url)}</small><p>${esc(r.reason)}</p></div></div>`).join('')}</div></details>`;
  }
  function openDetail(id) {
    const r=byId.get(id);
    if(!r) return;
    if(!$('detail').open) opener=document.activeElement;
    state.resource=id; writeHash();
    const relationships=(ids,label)=>`<h4>${esc(label)} (${ids.length})</h4><div class="detail-links">${ids.length ? ids.map(i=>detailButton(i)).join(''):'<p>No relationship captured in this bounded graph.</p>'}</div>`;
    const destination = r.finalUrl !== r.url
      ? `<br>Final retrieved URL: <a href="${esc(r.finalUrl)}" target="_blank" rel="noopener noreferrer">${esc(r.finalUrl)}</a>` : '';
    const response = r.http ? `<p>Collector HTTP response: ${r.http}${r.evidence==='Verified alternate fetch'?' (alternate content retrieval is recorded separately)':''}.</p>` : '';
    const variants = r.variants.length > 1
      ? `<details><summary>${r.variants.length} observed URL variants</summary>${r.variants.map(u=>`<p><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a></p>`).join('')}</details>` : '';
    const quotes = r.excerpt ? `<blockquote>${esc(r.excerpt)}</blockquote>` : '<p>No intended destination content was verified. The summary describes the referring page or retrieval result, not unseen page content.</p>';
    const clusters = r.clusters.length
      ? '<h4>Related overlap findings</h4>' + r.clusters.map(cid=>`<button class="source-link" data-finding="${esc(cid)}">${esc(data.findings.find(f=>f.id===cid).title)}</button>`).join('') : '';
    const modified = r.modifiedMetadata
      ? 'Page-supplied modified metadata: '+r.modifiedMetadata+'. This is not a content review date.'
      : 'No reliable content-review date was established.';
    $('detail-content').innerHTML = `
      <div class="detail-header">
        <div><p class="eyebrow">${esc(r.owner)} / ${esc(r.kind)}</p><h2 id="detail-title">${esc(r.title)}</h2></div>
        <button id="close-detail" aria-label="Close resource detail">Close</button>
      </div>
      <div class="detail-body">
        <p>${esc(r.summary)}</p><h4>What it addresses</h4><p>${esc(r.addresses)}</p>
        <div class="detail-meta">
          <div><strong>EVIDENCE</strong>${esc(r.evidence)}</div>
          <div><strong>CHECKED</strong>${esc(date(r.checkedAt))}</div>
          <div><strong>PROPOSED ACTION</strong>${esc(r.action)} / ${esc(priorities[r.priority])}</div>
          <div><strong>OBSERVED DISTANCE FROM HUB</strong>${r.hops===null?'No observed path (not proof of orphaning)':r.hops+' link hops'}</div>
          <div><strong>AUDIENCE</strong>${esc(r.audience.join(', '))}</div>
          <div><strong>PUBLISHING FAMILY (INFERRED)</strong>${esc(r.owner)}</div>
        </div>
        <h4>Source and destination</h4><p>${link(r,r.url)}${destination}</p>
        <p>${esc(r.retrievalNote)}</p>${response}${variants}
        <h4>Retrieved source excerpt</h4>${quotes}
        <h4>Proposed future home</h4><p>${esc(r.target)}</p>
        <h4>Consolidation recommendation</h4><p>${esc(r.recommendation)}</p>${clusters}
        <h4>Atomic user needs served by this content (${r.needIds.length})</h4>
        ${r.needIds.length?r.needIds.map(id=>{const n=byNeed.get(id),m=n.mappings.find(m=>m.resourceId===r.id);return `<button class="source-link" data-need="${esc(id)}">${esc(n.title)}</button><p>${esc(m.role)} / ${esc(n.coverage)}. ${esc(m.rationale)}</p>`;}).join(''):'<p>Not yet mapped to a need. This is not a finding of no user need or no coverage.</p>'}
        ${relationships(r.inlinks,'Observed incoming links')}${relationships(r.outlinks,'Observed outgoing links')}
        <p style="margin-top:20px" class="muted">Only relationships among inventoried records are shown. A missing edge is not proof that no site link exists. ${esc(modified)}</p>
      </div>`;
    if(!$('detail').open) $('detail').showModal();
    $('detail').scrollTop=0;
    $('close-detail').focus();
  }
  function closeDetail() {
    $('detail').close();
  }
  function showTab(tab) {
    if(!tabNames.includes(tab)) return;
    state.tab=tab;
    for(const name of tabNames) $(name).hidden=name!==tab;
    for(const button of document.querySelectorAll('.tabs [data-tab]')) {
      button.classList.toggle('active',button.dataset.tab===tab);
      if(button.dataset.tab===tab) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
    }
    writeHash();
  }
  function reset() {
    for(const f of fields) state[f]='';
    state.search='';state.sort='priority';
    state.resourceNeed='';
    syncInputs();renderInventory();writeHash();
  }
  function csvValue(value) {
    let t=String(Array.isArray(value)?value.join(' | '):value??'');
    if(/^[=+\-@\t\r]/.test(t)) t="'"+t;
    return '"'+t.replace(/"/g,'""')+'"';
  }
  function downloadCsv() {
    const keys=['title','url','finalUrl','owner','domain','summary','addresses','topics','audience','action','priority','target','recommendation','evidence','checkedAt','hops','needIds'];
    saveCsv('york-ai-filtered-inventory.csv',keys,filtered());
  }
  function downloadNeedsCsv() {
    const keys=['id','title','statement','audience','category','success','coverage','basis','validation','assessment','directCount','contentCount','proposedHome','owner','action','priority','resourceIds','sourceUrls'];
    const rows=filteredNeeds().map(n=>({...n,resourceIds:n.mappings.map(m=>m.resourceId),sourceUrls:n.mappings.map(m=>byId.get(m.resourceId).url)}));
    saveCsv('york-ai-filtered-needs.csv',keys,rows);
  }
  function saveCsv(filename,keys,rows) {
    const content='\ufeff'+[keys.join(','),...rows.map(r=>keys.map(k=>csvValue(r[k])).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=filename;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function init() {
    readHash();
    const fieldKeys={audience:'audience',owner:'owner',domain:'domain',action:'action',evidence:'evidence',topic:'topics'};
    for(const [field,key] of Object.entries(fieldKeys)) {
      const values=unique(data.records.flatMap(r=>Array.isArray(r[key])?r[key]:[r[key]]));
      $(field).insertAdjacentHTML('beforeend',values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join(''));
      if(state[field]&&!values.includes(state[field])) state[field]='';
      $(field).addEventListener('change',()=>{state[field]=$(field).value;renderInventory();writeHash();});
    }
    $('search').addEventListener('input',()=>{state.search=$('search').value;renderInventory();writeHash();});
    $('sort').addEventListener('change',()=>{state.sort=$('sort').value;renderInventory();writeHash();});
    $('view-toggle').addEventListener('click',()=>{state.table=!state.table;syncInputs();renderInventory();writeHash();});
    $('reset').addEventListener('click',reset);
    $('export').addEventListener('click',downloadCsv);
    $('resource-need').insertAdjacentHTML('beforeend',data.needs.map(n=>`<option value="${esc(n.id)}">${esc(n.title)}</option>`).join(''));
    $('resource-need').addEventListener('change',()=>{state.resourceNeed=$('resource-need').value;renderInventory();writeHash();});
    window.addEventListener('hashchange',()=>{
      readHash();syncInputs();syncNeedInputs();renderInventory();renderNeedResults();showTab(state.tab);
      if(state.resource) openDetail(state.resource);
      else {
        if($('detail').open) closeDetail();
        if(state.tab==='needs' && state.need) focusNeed(state.need);
      }
    });
    $('detail').addEventListener('close',()=>{state.resource='';writeHash();if(opener?.isConnected) opener.focus();});
    document.addEventListener('click',e=>{
      const button=e.target.closest('button');
      if(!button) return;
      if(button.id==='close-detail') closeDetail();
      if(button.dataset.tab) showTab(button.dataset.tab);
      if(button.hasAttribute('data-resource')) openDetail(button.dataset.resource);
      if(button.hasAttribute('data-topic')) {state.topic=button.dataset.topic;syncInputs();renderInventory();writeHash();}
      if(button.hasAttribute('data-reset')) reset();
      if(button.hasAttribute('data-needs-reset')) resetNeeds();
      if(button.dataset.need) openNeed(button.dataset.need);
      if(button.dataset.needContent) {reset();state.resourceNeed=button.dataset.needContent;syncInputs();renderInventory();showTab('inventory');}
      if(button.dataset.finding) {closeDetail();showTab('overlaps');document.getElementById('finding-'+button.dataset.finding).scrollIntoView({behavior:'smooth',block:'start'});}
      if(button.dataset.blueprint) {const card=$('blueprint-'+button.dataset.blueprint);card.scrollIntoView({behavior:'smooth',block:'center'});card.focus({preventScroll:true});}
      if(button.dataset.inventoryTopic) {reset();state.topic=button.dataset.inventoryTopic;syncInputs();renderInventory();showTab('inventory');}
    });
    const m=data.meta;
    $('snapshot-date').textContent=date(m.collectedAt);
    $('metrics').innerHTML=[[m.inventoryRecords,'inventoried resources'],[m.curatedRecords,'analyst-curated summaries'],[m.hostnames,'York hostnames'],[data.findings.length,'overlap & risk clusters'],[m.criticalClusters,'critical clusters to resolve']].map(([n,label])=>`<div class="metric"><strong>${n}</strong><span>${esc(label)}</span></div>`).join('');
    syncInputs();renderInventory();renderNeeds();renderSitemap();renderOverlaps();renderBlueprint();renderMethod();showTab(state.tab);
    if(state.tab==='needs' && state.need) focusNeed(state.need);
    if(state.resource) openDetail(state.resource);
  }
  init();
})();
