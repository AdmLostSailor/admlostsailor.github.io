/* ============================================================
   TERRAPIN OUROBOROS — shared runtime (v2 · DuckDB model)
   Depends on data/terrapin_data.js (window.TERRAPIN_DATA).
   Exposes window.Terra.
   ============================================================ */
(function(){
const D = window.TERRAPIN_DATA || {};
const SONGS = D.songs || [];
const CATALOG_SONGS = SONGS.filter(s=>s.tier!=='SUITE');
const CATALOG_COUNT = CATALOG_SONGS.length;
const MOVEMENTS = D.movements || [];
const REFS = D.refs || {tmi:{},propp:{},atu:{}};
const STATS = window.TERRAPIN_STATS || {};

/* ---- 13 movement colors (warm → cool → warm, completing the circle) ---- */
const MV_COLORS = ['#ff9b45','#ffb24d','#f3c64f','#cfd24a','#8ed94f','#4ee0c6','#4ec5e0','#4f9bea','#6f8cff','#a07bff','#c45cff','#f2638f','#ff7a6b'];
const mvIndex = name => MOVEMENTS.findIndex(m=>m.name===name);
const mvNumOf = name => { const m=MOVEMENTS.find(x=>x.name===name); return m?m.num:0; };
const mvColor = i => MV_COLORS[((i%MV_COLORS.length)+MV_COLORS.length)%MV_COLORS.length];
const mvColorByName = name => { const i=mvIndex(name); return i>=0?mvColor(i):'#b9acd6'; };

/* ---- 5 directionalities ---- */
const DIR_META = {
  toward:      {label:'Toward Terrapin',      color:'#4ee0c6', pole:'true'},
  within:      {label:'Within Terrapin',      color:'#f3c64f', pole:'true'},
  away:        {label:'Away from Terrapin',   color:'#ff7a3d', pole:'false'},
  ambiguous:   {label:'Ambiguous',            color:'#a07bff', pole:null},
  instrumental:{label:'Instrumental',         color:'#6f8cff', pole:null}
};
const dirColor = d => (DIR_META[d]||{}).color || '#b9acd6';
const dirLabel = d => (DIR_META[d]||{}).label || d;

const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short = (s,n=120)=>{s=String(s||'');return s.length>n?s.slice(0,n-1).trim()+'…':s;};
const firstSentence = s => { s=String(s||''); const m=s.match(/^[^.!?]+[.!?]/); return (m?m[0]:s).trim(); };
const songByKey = k => SONGS.find(s=>s.song_key_norm===k);
const polar=(cx,cy,rx,ry,a)=>({x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a)});
const cap = s => String(s||'').replace(/\b\w/g,c=>c.toUpperCase());

/* ---------------- SKY + NAV injection ---------------- */
function injectSky(){
  if(document.querySelector('.sky')) return;
  const sky=document.createElement('div');
  sky.className='sky';
  sky.innerHTML='<div class="sky-rays"></div><div class="sky-neb"></div><div class="sky-stars"></div>';
  document.body.insertBefore(sky,document.body.firstChild);
}
const PAGES=[['index.html','Portal'],['map.html','Ouroboros Map'],['songs.html','Song Library'],['movements.html','The Terrapin Suite'],['compass.html','Compass'],['cast.html','The Cast'],['segues.html','Segues'],['stats.html','On Stage'],['about.html','About']];
function injectNav(){
  if(document.querySelector('.nav')) return;
  let here=(location.pathname.split('/').pop()||'index.html');
  if(!here) here='index.html';
  const nav=document.createElement('header');
  nav.className='nav';
  nav.innerHTML=
    `<a class="brand" href="index.html"><span class="seal"></span>Terrapin <b>Ouroboros</b></a>`+
    `<button class="burger" aria-label="Menu">☰</button>`+
    `<nav class="links">`+
    PAGES.map(([h,l])=>`<a href="${h}" class="${h===here?'active':''}">${l}</a>`).join('')+
    `<button class="settings-btn" title="Vibe settings" aria-label="Settings">✦ Vibe</button>`+
    `</nav>`;
  document.body.insertBefore(nav,document.body.firstChild.nextSibling);
  const burger=nav.querySelector('.burger'), links=nav.querySelector('.links');
  burger.addEventListener('click',()=>links.classList.toggle('open'));
  nav.querySelector('.settings-btn').addEventListener('click',openSettings);
}

/* ---------------- Settings (vibe) ---------------- */
function applySettings(){
  const motion=localStorage.getItem('terra-motion')||'on';
  const type=localStorage.getItem('terra-type')||'elegant';
  document.body.classList.toggle('reduce-motion',motion==='off');
  document.documentElement.setAttribute('data-type',type);
}
function openSettings(){
  let pop=document.getElementById('settingsPop');
  if(pop){pop.remove();return;}
  pop=document.createElement('div');
  pop.id='settingsPop';
  pop.className='settings-pop panel';
  const motion=localStorage.getItem('terra-motion')||'on';
  const type=localStorage.getItem('terra-type')||'elegant';
  pop.innerHTML=`
    <h4>Vibe</h4>
    <div class="set-row"><span>Headline type</span>
      <div class="seg"><button data-k="type" data-v="elegant" class="${type==='elegant'?'on':''}">Elegant</button>
      <button data-k="type" data-v="groovy" class="${type==='groovy'?'on':''}">Groovy</button></div></div>
    <div class="set-row"><span>Motion</span>
      <div class="seg"><button data-k="motion" data-v="on" class="${motion==='on'?'on':''}">On</button>
      <button data-k="motion" data-v="off" class="${motion==='off'?'on':''}">Calm</button></div></div>
    <p class="set-note">Eclipse Dawn × After Dark. Your choice is remembered across pages.</p>`;
  document.body.appendChild(pop);
  pop.addEventListener('click',e=>{
    const b=e.target.closest('button[data-k]'); if(!b) return;
    localStorage.setItem('terra-'+b.dataset.k, b.dataset.v);
    applySettings();
    pop.querySelectorAll(`button[data-k="${b.dataset.k}"]`).forEach(x=>x.classList.toggle('on',x===b));
  });
  setTimeout(()=>document.addEventListener('click',function off(ev){
    if(!ev.target.closest('#settingsPop')&&!ev.target.closest('.settings-btn')){pop.remove();document.removeEventListener('click',off);}
  }),0);
}

/* ---------------- chips ---------------- */
function dirChip(d){if(!d)return '';return `<span class="chip ori info" data-cat="directionality" data-val="${esc(d)}" style="border-color:${dirColor(d)};color:${dirColor(d)}"><span class="swatch" style="background:${dirColor(d)}"></span>${esc(dirLabel(d))}</span>`;}
function mvChip(m){return `<span class="chip mv info" data-cat="movement" data-val="${esc(m)}" style="border-color:${mvColorByName(m)}88"><span class="swatch" style="background:${mvColorByName(m)}"></span>${esc(m)}</span>`;}
function folkChip(f){return `<span class="chip info folk-${esc(f.t.toLowerCase())}" data-cat="folklore" data-val="${esc(f.t+'|'+f.code)}">${esc(f.label||f.code)}</span>`;}
function plainChips(arr){return (arr||[]).filter(Boolean).map(x=>`<span class="chip">${esc(x)}</span>`).join('');}

/* ---------------- SONG MODAL ---------------- */
function ensureModal(){
  let m=document.getElementById('songModal');
  if(m) return m;
  m=document.createElement('div');
  m.id='songModal'; m.className='modal';
  m.innerHTML=`<div class="modal-box"><div class="modal-head">
      <div><div class="mh-title" id="mhTitle"></div><div class="mh-mv" id="mhMv"></div></div>
      <button class="modal-x" id="mhX" aria-label="Close">✕</button>
    </div><div class="modal-body" id="mhBody"></div></div>`;
  document.body.appendChild(m);
  m.querySelector('#mhX').addEventListener('click',closeSong);
  m.addEventListener('click',e=>{if(e.target===m)closeSong();});
  return m;
}
function onStageStrip(s){
  const ss=(STATS.songStats||{})[s.song_key_norm];
  const col=mvColorByName((s.primary_movements||[])[0]);
  if(!ss||!ss.plays){
    return `<div class="onstage never" style="--oc:${col}"><span class="os-head">On Stage</span><p class="os-never">Never performed live — a studio recording that stayed off the road.</p></div>`;
  }
  const yMin=STATS.meta.yearMin, yMax=STATS.meta.yearMax;
  const by={}; (ss.byYear||[]).forEach(p=>by[p[0]]=p[1]);
  const max=Math.max(1,...Object.values(by));
  let bars='';
  for(let y=yMin;y<=yMax;y++){ const c=by[y]||0; const h=c?Math.max(7,Math.round(c/max*100)):0;
    bars+=`<span class="os-bar${c?'':' empty'}" style="height:${h}%" title="${y}: ${c} play${c===1?'':'s'}"></span>`; }
  const span = ss.first===ss.last ? String(ss.first) : (ss.first+'\u2013'+String(ss.last).slice(2));
  const cells=[['plays',ss.plays,'times played'],['span',span,'years live'],['rank',ss.rank?('#'+ss.rank):'\u2014','rarity rank'],['opener',ss.opener||0,'opened show'],['closer',ss.closer||0,'closed show'],['encore',ss.encore||0,'encore']];
  return `<div class="onstage" style="--oc:${col}">
    <div class="os-top"><span class="os-head">On Stage</span><span class="os-sub">Grateful Dead live · ${yMin}–${yMax}</span></div>
    <div class="os-cells">${cells.map(c=>`<div class="os-cell"><span class="os-num">${esc(String(c[1]))}</span><span class="os-lbl">${esc(c[2])}</span></div>`).join('')}</div>
    <div class="os-spark"><div class="os-bars">${bars}</div><div class="os-axis"><span>${yMin}</span><span>plays per year</span><span>${yMax}</span></div></div>
  </div>`;
}
function characterCard(c){
  const ft=c.ft&&c.ft.d, tt=c.tt&&c.tt.d;
  const traits=[['Wound',c.wound],['Lacks',c.lack],['Seeks',c.seek],['Love',c.love]].filter(t=>t[1]&&t[1].trim());
  return `<div class="char-card">
    <div class="cc-head"><span class="cc-name">${esc(c.name||'—')}</span>${c.archetype?`<span class="cc-arch">${esc(c.archetype)}</span>`:''}</div>
    ${c.role?`<p class="cc-role">${esc(c.role)}</p>`:''}
    ${traits.length?`<div class="cc-traits">${traits.map(t=>`<div class="cc-trait"><span>${t[0]}</span>${esc(t[1])}</div>`).join('')}</div>`:''}
    ${(ft||tt)?`<div class="cc-poles">${ft?`<div class="cc-pole pf"><b>False Terrapin</b>${esc(c.ft.d)}</div>`:''}${tt?`<div class="cc-pole pt"><b>True Terrapin</b>${esc(c.tt.d)}</div>`:''}</div>`:''}
  </div>`;
}
function openSong(key){
  const s=songByKey(key); if(!s) return;
  const m=ensureModal();
  m.querySelector('#mhTitle').textContent=s.display_title;
  const mv=(s.primary_movements||[]); const num=mvNumOf(mv[0]);
  m.querySelector('#mhMv').innerHTML=mv.length?`<span style="color:${mvColorByName(mv[0])}">●</span> Movement ${num} · ${esc(mv.join(' · '))}`:'';

  const chars=s.characters||[];
  const folk=s.folklore||[];
  const dodd=s.dodd_annotations||[];
  const essay=s.essay||'';
  const essayLong=essay.length>520;
  // adaptive character columns: 1-col <=2, 2-col <=6, 3-col 7+
  const charCols=chars.length<=2?1:chars.length<=6?2:3;

  m.querySelector('#mhBody').innerHTML=`
    <div class="os-wrap">${onStageStrip(s)}</div>

    <div class="m-row-2">
      <div class="m-cell">
        <div class="msec"><h4>Lyrics</h4>${s.lyrics?`<div class="lyrics">${esc(s.lyrics)}</div>${s.lyrics_source?`<p class="src-line">Lyrics · ${esc(s.lyrics_source)}</p>`:''}`:'<p style="color:var(--faint)">No lyrics on file.</p>'}</div>
      </div>
      <div class="m-cell">
        ${essay?`<div class="msec"><h4>The Reading</h4><div class="essay${essayLong?' clamp':''}" id="essayBox">${esc(essay).replace(/\n+/g,'</p><p>').replace(/^/,'<p>').replace(/$/,'</p>')}</div>${essayLong?`<button class="essay-toggle" id="essayToggle">Read full essay \u2193</button>`:''}</div>`:s.interpretive_summary?`<div class="msec"><h4>Interpretive Summary</h4><p class="lead">${esc(s.interpretive_summary)}</p></div>`:''}
        ${dodd.length?`<div class="msec"><h4>David Dodd · Annotations</h4>${dodd.map(d=>`<div class="ann"><b>${esc(d.title||'')}</b>${(d.words_by||d.music_by)?`<p class="ann-cred">${d.words_by?'Words: '+esc(d.words_by):''}${d.words_by&&d.music_by?' · ':''}${d.music_by?'Music: '+esc(d.music_by):''}</p>`:''}${d.keywords?`<p class="ann-kw">${esc(d.keywords)}</p>`:''}</div>`).join('')}</div>`:''}
      </div>
    </div>

    ${essay&&false?`<div class="m-full"><div class="msec"><h4>The Reading</h4><div class="essay${essayLong?' clamp':''}" id="essayBox">${esc(essay).replace(/\n+/g,'</p><p>').replace(/^/,'<p>').replace(/$/,'</p>')}</div>${essayLong?`<button class="essay-toggle" id="essayToggle">Read full essay ↓</button>`:''}</div></div>`:''}

    <div class="m-full"><div class="msec"><h4>Movement &amp; Directionality</h4><div class="chips">${mv.map(mvChip).join('')}${dirChip(s.directionality)}</div>${s.movement_rationale?`<p class="rationale">${esc(s.movement_rationale)}</p>`:''}</div></div>

    ${(s.false_terrapin||s.true_terrapin)?`<div class="m-full"><div class="msec"><h4>False Terrapin ⟷ True Terrapin</h4><div class="dip">${s.false_terrapin?`<div class="dip-col dip-false info" data-cat="terrapin" data-val="false"><span class="dip-lbl">False Terrapin · the counterfeit</span><p>${esc(s.false_terrapin)}</p></div>`:''}${s.true_terrapin?`<div class="dip-col dip-true info" data-cat="terrapin" data-val="true"><span class="dip-lbl">True Terrapin · the homecoming</span><p>${esc(s.true_terrapin)}</p></div>`:''}</div></div></div>`:''}

    ${folk.length?`<div class="m-full"><div class="msec"><h4>Folklore &amp; Story Type</h4><div class="chips">${folk.map(folkChip).join('')}</div></div></div>`:''}

    ${chars.length?`<div class="m-full"><div class="msec"><h4>The Cast <span class="h4-n">${chars.length}</span></h4><div class="char-grid" style="grid-template-columns:repeat(${charCols},1fr)">${chars.map(characterCard).join('')}</div></div></div>`:''}`;

  const et=m.querySelector('#essayToggle');
  if(et) et.addEventListener('click',()=>{const b=m.querySelector('#essayBox');b.classList.toggle('clamp');et.textContent=b.classList.contains('clamp')?'Read full essay ↓':'Show less ↑';});
  wireModalInfo(m, s.song_key_norm);
  m.classList.add('open'); document.body.classList.add('no-scroll');
  m.querySelector('#mhBody').scrollTop=0;
  history.replaceState(null,'',location.pathname+'#song='+encodeURIComponent(key));
}
function closeSong(){
  const m=document.getElementById('songModal'); if(m)m.classList.remove('open');
  document.body.classList.remove('no-scroll');
  hideInfo(true);
  history.replaceState(null,'',location.pathname);
}

/* ---------------- hover info panel ---------------- */
let _infoPanel, _infoHideT, _infoCurKey;
function infoPanel(){
  if(_infoPanel) return _infoPanel;
  const p=document.createElement('div');
  p.id='infoPanel'; p.className='info-pop';
  p.addEventListener('mouseenter',()=>{clearTimeout(_infoHideT);});
  p.addEventListener('mouseleave',()=>hideInfo());
  p.addEventListener('click',e=>{
    const a=e.target.closest('[data-song]'); if(a){ openSong(a.getAttribute('data-song')); }
  });
  document.body.appendChild(p);
  _infoPanel=p; return p;
}
function hideInfo(now){
  clearTimeout(_infoHideT);
  const go=()=>{ if(_infoPanel) _infoPanel.classList.remove('show'); };
  if(now) go(); else _infoHideT=setTimeout(go,200);
}
function songChips(list){
  if(!list||!list.length) return '<span class="info-empty">No other songs share this.</span>';
  const shown=list.slice(0,14);
  return `<div class="info-songs">${shown.map(r=>`<button class="info-song" data-song="${esc(r.key)}">${esc(r.title)}</button>`).join('')}</div>${list.length>shown.length?`<div class="info-more">+${list.length-shown.length} more in the library</div>`:''}`;
}
function relatedByField(field,val,excludeKey){
  const out=[];
  SONGS.forEach(s=>{ if(s.song_key_norm===excludeKey)return;
    const v=s[field]; const has=Array.isArray(v)?v.includes(val):v===val;
    if(field==='folklore'){ if((s.folklore||[]).some(f=>f.t+'|'+f.code===val)) out.push({key:s.song_key_norm,title:s.display_title}); }
    else if(has) out.push({key:s.song_key_norm,title:s.display_title}); });
  return out;
}
function buildInfo(cat,val,songKey){
  let d={}, related=[], showSongs=true;
  if(cat==='directionality'){
    const meta=DIR_META[val]||{};
    d={title:dirLabel(val), kicker:'Terrapin Directionality', pole:meta.pole, body:DIR_DEFS[val]||''};
    related=relatedByField('directionality',val,songKey);
  } else if(cat==='movement'){
    d=defineMovement(val); related=relatedByField('primary_movements',val,songKey);
  } else if(cat==='terrapin'){
    d=defineTerrapin(val); showSongs=false;
  } else if(cat==='folklore'){
    d=defineFolklore(val); related=relatedByField('folklore',val,songKey);
  } else return '';
  const poleCls=d.pole?(' pole-'+d.pole):'';
  let h=`<div class="info-card${poleCls}">`;
  if(d.kicker) h+=`<div class="info-kicker">${esc(d.kicker)}</div>`;
  h+=`<div class="info-title">${esc(d.title||val)}</div>`;
  if(d.body) h+=`<p class="info-body">${esc(d.body)}</p>`;
  if(d.foot) h+=`<p class="info-echo">${esc(d.foot)}</p>`;
  if(showSongs){ h+=`<div class="info-sub">Also in</div>`+songChips(related); }
  h+=`</div>`;
  return h;
}
/* ---- definitions ---- */
const DIR_DEFS={
  toward:"The song moves toward Terrapin — drawn by longing toward harmony, homecoming, and recognition. The compass needle has found its north, even if the station is still far off.",
  within:"The song dwells within Terrapin — already at or near the still center, inhabiting the recognition and repair the whole circle reaches for.",
  away:"The song turns away from Terrapin — fleeing, drifting, or driven from harmony toward exile, counterfeit, or dissolution. The needle points home, but the figure's back is turned.",
  ambiguous:"The song holds an ambiguous orientation — suspended between toward and away, its compass wavering, refusing a single direction.",
  instrumental:"An instrumental — it carries the journey without words, its directionality lived in melody and motion rather than narrated."
};
function defineMovement(name){
  const mv=MOVEMENTS.find(m=>m.name===name);
  const idx=mvIndex(name);
  return {title:name, kicker:'Movement '+(mv?mv.roman:'')+' of the Terrapin Suite'+(mv?' · '+mv.song_count+' songs':''),
    body: MOVEMENT_DEFS[name]||'One of the thirteen movements that complete the Terrapin suite — the serpent\u2019s circle.',
    pole: idx<6?'true':(idx>=10?'false':null)};
}
const MOVEMENT_DEFS={
  'Lady With A Fan':"The overture — the storyteller takes up the tale, the lady with her fan, the sailor and the soldier. The wager that opens the whole journey: which face will you turn to the world?",
  'Terrapin Station':"The naming of the destination — the still point the whole songworld points toward. Terrapin as the harmony, home, and recognition that the road is for.",
  'Terrapin':"The bare center itself — the place beneath the name, the ground of arrival.",
  'Terrapin Transit':"The passage through — transit, threshold, the eye of the needle crossed on the way to rebirth.",
  'At A Siding':"The stall — the broken pilgrim halted between departure and return, waiting at the siding for the repair that lets the journey resume.",
  'Terrapin Flyer':"The vehicle of passage — the flyer that carries the soul across the dark interval, motion in service of homecoming.",
  'The Wind Blows High':"The exposed reach — the high wind, the precarious height, the testing of the traveler against the elements.",
  'Return To Terrapin':"The homeward turn — the wanderer bends back toward the center, no longer the one who left.",
  'Ivory Wheels / Rosewood Track':"The machinery of fate — ivory wheels on rosewood track, the turning mechanism that carries the circle onward.",
  'And I Know You':"Recognition dawning — the beloved and the self seen truly, the moment the long road has been reaching toward.",
  "Jack O'Roses":"The figure of the singer-king — Jack o' Roses, the bard who carries the whole tale, garlanded and bound to it.",
  'Leaving Terrapin':"The departure renewed — leaving the station again, the circle's outward turn that keeps the ouroboros alive.",
  'Recognition':"The closing chord — full recognition, the circle complete, the serpent's mouth meeting its tail and opening into the spiral."
};
function defineTerrapin(which){
  if(which==='false') return {title:'The False Terrapin', kicker:'The counterfeit', pole:'false',
    body:"The False Terrapin wears Terrapin\u2019s face without its substance — charm mistaken for recognition, motion mistaken for arrival, the counterfeit that offers the feeling of home while withholding the thing itself. The closed loop of the ouroboros that mimics wholeness but never opens into the spiral."};
  return {title:'The True Terrapin', kicker:'The homecoming', pole:'true',
    body:"The True Terrapin is the genuine thing the counterfeit imitates — harmony, peace, love, homecoming, recognition, and repair. Mutual recognition rather than possession, honest mourning rather than denial: the homecoming that changes the one who arrives, and breaks the circle open into a spiral."};
}
function defineFolklore(val){
  const [type,code]=String(val).split('|');
  if(type==='TMI'){ const r=REFS.tmi[code]||{};
    return {title:r.name||code, kicker:'Thompson Motif · '+code, body:r.chapter?('From the folklore chapter: '+r.chapter+'. A recurring narrative motif catalogued across world folktale.'):'A motif from the Thompson Motif-Index of folk literature.'};}
  if(type==='Propp'){ const r=REFS.propp[code]||{};
    return {title:r.fn||code, kicker:'Propp Function · '+code, body:r.def||'One of Vladimir Propp\u2019s thirty-one narrative functions — the deep grammar of the folktale.'};}
  if(type==='ATU'){ const r=REFS.atu[code]||{};
    return {title:r.name||code, kicker:'ATU Tale Type · '+code, body:'A recurring tale-type from the Aarne\u2013Thompson\u2013Uther index — a whole plot architecture found across many cultures.'};}
  return {title:code, kicker:type};
}
function positionInfo(p, anchor){
  const r=anchor.getBoundingClientRect();
  const vw=window.innerWidth, vh=window.innerHeight;
  p.style.maxHeight=Math.min(440, vh-24)+'px';
  const pr=p.getBoundingClientRect();
  let left=r.left+r.width/2-pr.width/2;
  left=Math.max(12,Math.min(left,vw-pr.width-12));
  let top=r.bottom+10;
  if(top+pr.height>vh-12) top=r.top-pr.height-10;
  if(top<12) top=12;
  p.style.left=left+'px'; p.style.top=top+'px';
}
function wireModalInfo(m, songKey){ wireInfo(m, songKey); }
function wireInfo(scope, songKey){
  const p=infoPanel();
  scope.querySelectorAll('.info').forEach(el=>{
    if(el.__wired) return; el.__wired=true;
    el.addEventListener('mouseenter',()=>{
      _infoCurKey = songKey || null;
      clearTimeout(_infoHideT);
      const html=buildInfo(el.dataset.cat, el.dataset.val, _infoCurKey);
      if(!html) return;
      p.innerHTML=html; p.style.left='0px'; p.style.top='0px'; p.classList.add('show');
      positionInfo(p, el);
    });
    el.addEventListener('mouseleave',()=>hideInfo());
  });
}

/* ---------------- Universe wheel (13 nodes) ---------------- */
let _floatLbl;
function floatLabel(){ if(!_floatLbl){_floatLbl=document.createElement('div');_floatLbl.className='floatlbl';document.body.appendChild(_floatLbl);} return _floatLbl; }
function universeWheel(container, opts){
  opts=opts||{};
  const size=opts.size||620;
  const interactive=opts.interactive!==false;
  const visible=opts.visibleKeys||null;
  const cx=size/2, cy=size/2, rx=size*0.375, ry=size*0.375;
  const wheel=document.createElement('div');
  wheel.className='wheel'+(opts.rotate?' rotate':'');
  wheel.style.width=size+'px'; wheel.style.height=size+'px';
  const hub=size*0.18, corona=size*0.40;
  let h='<div class="ring"></div><div class="ring2"></div>';
  h+=`<div class="corona" style="width:${corona}px;height:${corona}px"></div>`;
  const N=MOVEMENTS.length;
  MOVEMENTS.forEach((m,i)=>{
    const a=-Math.PI/2+2*Math.PI*i/N;
    const p=polar(cx,cy,rx,ry,a);
    const cnt=(m.songs||[]).length;
    const r=size*0.044 + Math.min(cnt,67)/67*size*0.05;
    const dx=p.x-cx,dy=p.y-cy,len=Math.hypot(dx,dy),ang=Math.atan2(dy,dx)*180/Math.PI;
    h+=`<div class="spoke" style="left:${cx}px;top:${cy}px;width:${len}px;transform:rotate(${ang}deg)"></div>`;
    (m.songs||[]).forEach((ss,j)=>{
      const vis = !visible || visible.has(ss.key);
      const aa=a+(j-cnt/2)*0.16;
      const rr=r*0.62+Math.sqrt(j+1)*size*0.012;
      const pp={x:p.x+rr*Math.cos(aa),y:p.y+rr*0.8*Math.sin(aa)};
      const ds=size*0.011;
      h+=`<div class="dot" data-song="${esc(ss.key)}" data-lbl="${esc(ss.title)}" title="${esc(ss.title)}" style="left:${pp.x}px;top:${pp.y}px;width:${ds}px;height:${ds}px;background:${mvColor(i)};opacity:${vis?.85:.12}"></div>`;
    });
    h+=`<div class="mv" data-mv="${i}" data-lbl="${esc(m.name)}" style="left:${p.x}px;top:${p.y}px;width:${r}px;height:${r}px;background:${mvColor(i)};font-size:${size*0.022}px"><span class="mvc">${m.roman}</span></div>`;
    const lx=p.x+(r*0.6+size*0.052)*Math.cos(a), ly=p.y+(r*0.6+size*0.04)*Math.sin(a);
    h+=`<div class="mvlbl" style="left:${lx}px;top:${ly}px;font-size:${Math.max(9,size*0.016)}px">${esc(m.name)}</div>`;
  });
  h+=`<div class="hub" data-hub="1" style="width:${hub}px;height:${hub}px;font-size:${size*0.042}px;line-height:1.04">Terrapin<span style="font-size:${size*0.022}px;font-family:var(--ui);font-weight:500;color:var(--warm);letter-spacing:.1em">STATION</span></div>`;
  wheel.innerHTML=h;
  container.appendChild(wheel);
  if(interactive){
    const lbl=floatLabel();
    wheel.querySelectorAll('.mv,.dot').forEach(el=>{
      el.addEventListener('mouseenter',ev=>{
        wheel.classList.add('dim'); el.classList.add('hot');
        lbl.textContent=el.dataset.lbl; lbl.classList.add('show');
        const r=el.getBoundingClientRect(); lbl.style.left=(r.left+r.width/2)+'px'; lbl.style.top=r.top+'px';
        if(opts.onHover) opts.onHover(el.dataset.mv!=null?{type:'movement',idx:+el.dataset.mv}:{type:'song',key:el.dataset.song});
      });
      el.addEventListener('mouseleave',()=>{wheel.classList.remove('dim');el.classList.remove('hot');lbl.classList.remove('show');if(opts.onLeave)opts.onLeave();});
    });
    wheel.querySelectorAll('.mv').forEach(el=>el.addEventListener('click',()=>opts.onMovement?opts.onMovement(+el.dataset.mv):null));
    wheel.querySelectorAll('.dot').forEach(el=>el.addEventListener('click',()=>(opts.onSong||openSong)(el.dataset.song)));
    const hubEl=wheel.querySelector('.hub'); if(hubEl)hubEl.addEventListener('click',()=>opts.onHub&&opts.onHub());
  }
  return wheel;
}

/* ---------------- reveal-on-scroll ---------------- */
function watchReveals(){
  const els=document.querySelectorAll('.reveal:not(.in)');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io=new IntersectionObserver((ents)=>{ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.12});
  els.forEach(e=>io.observe(e));
}

/* ---------------- boot ---------------- */
function boot(){
  injectSky(); injectNav(); applySettings(); ensureModal(); watchReveals();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSong();});
  const mm=location.hash.match(/song=([^&]+)/);
  if(mm){ try{openSong(decodeURIComponent(mm[1]));}catch(e){} }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();

window.Terra={D,SONGS,CATALOG_SONGS,CATALOG_COUNT,MOVEMENTS,REFS,STATS,MV_COLORS,DIR_META,
  mvColor,mvColorByName,mvIndex,mvNumOf,dirColor,dirLabel,
  esc,short,firstSentence,cap,songByKey,polar,
  dirChip,mvChip,folkChip,plainChips,wireInfo,
  movementDef:defineMovement, dirDef:(d)=>DIR_DEFS[d]||'',
  openSong,closeSong,universeWheel,watchReveals,injectSky,injectNav,floatLabel};
})();
