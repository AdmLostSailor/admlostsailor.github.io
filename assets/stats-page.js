/* ============================================================
   TERRAPIN OUROBOROS — On Stage (stats) page
   ============================================================ */
(function(){
const T=window.Terra, S=window.TERRAPIN_STATS, esc=T.esc;
if(!S){ document.querySelector('.wrap').insertAdjacentHTML('beforeend','<p style="color:var(--faint)">Statistics data not loaded.</p>'); return; }
const M=S.meta;
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');

/* ---- big numbers ---- */
document.getElementById('bignums').innerHTML=[
  [fmt(M.shows),'shows',''],
  [M.yearMin+'–'+M.yearMax,'years','yr'],
  [fmt(M.venues),'venues',''],
  [fmt(M.cities),'cities',''],
  [M.countries,'countries',''],
  [fmt(M.distinctSongs),'songs played','']
].map(([n,l,cls])=>`<div class="bn ${cls}"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');
document.getElementById('provenance').innerHTML=
  `Derived from <b>${fmt(M.shows)}</b> archived Grateful Dead setlists, ${M.yearMin}–${M.yearMax}. `+
  `<b>${M.matched}</b> of the project's ${T.CATALOG_COUNT} songs are matched to live performance counts.`;

/* ---- shows by year ---- */
(function(){
  const data=S.showsByYear, max=Math.max(...data.map(d=>d[1]));
  document.getElementById('timeline').innerHTML=data.map(([y,c])=>
    `<div class="tl-bar" style="height:${Math.max(3,Math.round(c/max*100))}%" title="${y}: ${c} shows"></div>`).join('');
  const first=data[0][0], last=data[data.length-1][0], mid=data[Math.floor(data.length/2)][0];
  document.getElementById('tlAxis').innerHTML=`<span>${first}</span><span>${mid}</span><span>${last}</span>`;
})();

/* ---- most played (toggle proj / raw) ---- */
function renderMostPlayed(mode){
  const el=document.getElementById('mostPlayed');
  if(mode==='raw'){
    const data=S.topRaw.slice(0,20), max=data[0].plays;
    el.innerHTML=data.map((d,i)=>{
      const hue=(i*26)%360;
      return `<div class="row"><div class="rlab" title="${esc(d.song)}">${esc(d.song)}</div>`+
        `<div class="rtrack"><div class="rfill" style="width:0%;background:linear-gradient(90deg,hsl(${hue} 80% 55%),hsl(${(hue+40)%360} 85% 60%))" data-w="${d.plays/max*100}"></div></div>`+
        `<div class="rval">${fmt(d.plays)}</div></div>`;
    }).join('');
  } else {
    const data=S.topSongs.slice(0,20), max=data[0].plays;
    el.innerHTML=data.map(d=>{
      const song=T.songByKey(d.key); const col=song?T.mvColorByName((song.primary_movements||[])[0]):'#f3c64f';
      return `<div class="row"><div class="rlab" title="${esc(d.title)}" onclick="Terra.openSong('${esc(d.key)}')">${esc(d.title)}</div>`+
        `<div class="rtrack"><div class="rfill" style="width:0%;background:linear-gradient(90deg,${col},color-mix(in oklab,${col} 60%,#fff))" data-w="${d.plays/max*100}"></div></div>`+
        `<div class="rval">${fmt(d.plays)}</div></div>`;
    }).join('');
  }
  animateBars(el);
}
document.getElementById('mpToggle').addEventListener('click',e=>{
  const b=e.target.closest('button[data-mode]'); if(!b)return;
  document.querySelectorAll('#mpToggle button').forEach(x=>x.classList.toggle('on',x===b));
  renderMostPlayed(b.dataset.mode);
});

/* ---- by movement ---- */
(function(){
  const data=S.byMovement, max=Math.max(...data.map(d=>d.plays));
  document.getElementById('byMovement').innerHTML=data.map(d=>{
    const col=T.mvColor(d.num-1);
    return `<div class="row"><div class="rlab" title="${esc(d.roman+' · '+d.mv)} — ${d.avg} avg/song" onclick="location.href='map.html#mv=${d.num-1}'">${esc(d.roman+' · '+d.mv)}</div>`+
      `<div class="rtrack"><div class="rfill" style="width:0%;background:linear-gradient(90deg,${col},color-mix(in oklab,${col} 55%,#fff))" data-w="${d.plays/max*100}"></div></div>`+
      `<div class="rval">${fmt(d.plays)}</div></div>`;
  }).join('');
  animateBars(document.getElementById('byMovement'));
})();

/* ---- by directionality + callout ---- */
(function(){
  const data=S.byDirection, max=Math.max(...data.map(d=>d.plays));
  const top=data[0], second=data[1];
  document.getElementById('oriCallout').innerHTML=
    `<p>The most-performed directionality across their entire career was <b>“${esc(T.dirLabel(top.dir))}”</b> — ${fmt(top.plays)} plays, ahead of <b>“${esc(T.dirLabel(second.dir))}.”</b> The songs that turn away from Terrapin are the ones they played the most.</p>`;
  document.getElementById('byOrientation').innerHTML=data.map(d=>{
    const col=T.dirColor(d.dir);
    return `<div class="row"><div class="rlab" title="${esc(T.dirLabel(d.dir))} — ${d.songs} songs">${esc(T.dirLabel(d.dir))}</div>`+
      `<div class="rtrack"><div class="rfill" style="width:0%;background:linear-gradient(90deg,${col},color-mix(in oklab,${col} 55%,#fff))" data-w="${d.plays/max*100}"></div></div>`+
      `<div class="rval">${fmt(d.plays)}</div></div>`;
  }).join('');
  animateBars(document.getElementById('byOrientation'));
})();

/* ---- show map ---- */
(function(){
  const cities=S.cities.filter(c=>c.lat!=null&&c.long!=null);
  const maxShows=Math.max(...cities.map(c=>c.shows));
  const topCity=cities.slice().sort((a,b)=>b.shows-a.shows)[0];
  const wrap=document.getElementById('mapwrap');
  document.getElementById('mapIntro').textContent=
    `Every city the band is recorded as having played, on a real map and sized by how many shows happened there. ${fmt(cities.length)} cities across ${M.countries} countries.`;
  document.getElementById('mapMost').innerHTML=
    `most-played city: <b style="color:var(--gold)">${esc(topCity.city)}</b> (${fmt(topCity.shows)} shows)`;

  function build(){
    if(!window.L){ wrap.insertAdjacentHTML('beforeend','<div class="map-fallback">Map tiles need an internet connection to load.</div>'); return; }
    const map=L.map(wrap,{zoomControl:true,scrollWheelZoom:false,attributionControl:true,worldCopyJump:true});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
      subdomains:'abcd', maxZoom:19,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);
    const latlngs=[];
    cities.sort((a,b)=>a.shows-b.shows).forEach(c=>{
      latlngs.push([c.lat,c.long]);
      const r=3+Math.sqrt(c.shows/maxShows)*16;
      const hue=((c.long*2.3+200)%360+360)%360;
      const col=`hsl(${hue} 85% 62%)`;
      // visible dot (non-interactive)
      L.circleMarker([c.lat,c.long],{radius:r,color:col,weight:1,opacity:.9,
        fillColor:col,fillOpacity:.45,className:'showdot',interactive:false}).addTo(map);
      // invisible, comfortably-large hit target on top
      const hit=L.circleMarker([c.lat,c.long],{radius:Math.max(r+4,13),color:col,weight:0,opacity:0,
        fillOpacity:0,className:'showhit',bubblingMouseEvents:false}).addTo(map);
      hit.bindTooltip(`<b>${esc(c.city)}</b>${c.state?', '+esc(c.state):''} · ${fmt(c.shows)} show${c.shows===1?'':'s'}<span class="tip-cta">click for setlists</span>`,{direction:'top',offset:[0,-r-2],className:'show-tip'});
      hit.on('click',()=>openCityDrawer(c.city+'|'+c.state+'|'+c.country, c));
    });
    if(latlngs.length) map.fitBounds(latlngs,{padding:[30,30]});
    setTimeout(()=>map.invalidateSize(),200);
  }
  if(window.L) build();
  else window.addEventListener('load',build);
})();

/* ---- rarest + never ---- */
(function(){
  const data=S.rarest, max=Math.max(...data.map(d=>d.plays));
  document.getElementById('rarest').innerHTML=data.map(d=>{
    const song=T.songByKey(d.key); const col=song?T.mvColorByName((song.primary_movements||[])[0]):'#a07bff';
    return `<div class="row"><div class="rlab" title="${esc(d.title)}" onclick="Terra.openSong('${esc(d.key)}')">${esc(d.title)}</div>`+
      `<div class="rtrack"><div class="rfill" style="width:0%;background:linear-gradient(90deg,${col},color-mix(in oklab,${col} 55%,#fff))" data-w="${Math.max(4,d.plays/max*100)}"></div></div>`+
      `<div class="rval">${fmt(d.plays)}</div></div>`;
  }).join('');
  animateBars(document.getElementById('rarest'));
  if(S.neverPlayed&&S.neverPlayed.length){
    document.getElementById('neverPlayed').innerHTML=
      `<b>Never performed live:</b> ${S.neverPlayed.map(esc).join(' · ')} — studio songs that stayed off the road.`;
  }
})();

/* ---- bar grow animation ---- */
function animateBars(scope){
  const fills=scope.querySelectorAll('.rfill[data-w]');
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(ents=>{ents.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.w+'%';io.unobserve(e.target);}})},{threshold:.1});
    fills.forEach(f=>io.observe(f));
  } else fills.forEach(f=>f.style.width=f.dataset.w+'%');
}

/* ============================================================
   DRILL-DOWNS
   ============================================================ */
const nrm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const nameToKey={}; T.SONGS.forEach(s=>{nameToKey[nrm(s.display_title)]=s.song_key_norm;});

/* ---- city → shows → setlist drawer ---- */
let _drawer;
function ensureDrawer(){
  if(_drawer) return _drawer;
  const d=document.createElement('div');
  d.id='cityDrawer'; d.className='drawer';
  d.innerHTML=`<div class="drawer-scrim"></div><aside class="drawer-panel"><button class="drawer-x" aria-label="Close">\u2715</button><div class="drawer-body" id="drawerBody"></div></aside>`;
  document.body.appendChild(d);
  d.querySelector('.drawer-scrim').addEventListener('click',closeDrawer);
  d.querySelector('.drawer-x').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});
  _drawer=d; return d;
}
function closeDrawer(){ if(_drawer)_drawer.classList.remove('open'); document.body.classList.remove('no-scroll'); }
function songSpan(name, key){
  return key?`<button class="sl-song link" onclick="Terra.openSong('${esc(key)}')">${esc(name)}</button>`:`<span class="sl-song">${esc(name)}</span>`;
}
function setlistHTML(sh){
  const SH=window.TERRAPIN_SHOWS; const DK=SH.dictKeys||[];
  return sh.sets.map(set=>`<div class="sl-set"><div class="sl-setname">${esc(set[0])}</div><div class="sl-songs">${set[1].map(i=>songSpan(SH.songs[i], DK[i])).join('<span class="sl-sep">\u203a</span>')}</div></div>`).join('');
}
function openCityDrawer(key,c){
  const SH=window.TERRAPIN_SHOWS; const d=ensureDrawer(); const body=d.querySelector('#drawerBody');
  const idxs=(SH&&SH.byCity[key])||[];
  const place=esc(c.city)+(c.state?', '+esc(c.state):'')+(c.country&&c.country!=='US'?' · '+esc(c.country):'');
  if(!idxs.length){
    body.innerHTML=`<div class="drawer-head"><div class="dh-kick">Show City</div><h3>${place}</h3><p class="dh-sub">${fmt(c.shows)} show${c.shows===1?'':'s'} on record — detailed setlists for this city aren\u2019t in the archive.</p></div>`;
  } else {
    const rows=idxs.map(i=>{const sh=SH.shows[i];const yr=sh.d.slice(0,4);
      return `<button class="show-row" data-i="${i}"><span class="sr-date">${esc(sh.d)}</span><span class="sr-venue">${esc(sh.v||'—')}</span><span class="sr-n">${sh.n} songs</span><span class="sr-caret">\u203a</span></button><div class="sr-setlist" id="sl-${i}"></div>`;}).join('');
    body.innerHTML=`<div class="drawer-head"><div class="dh-kick">Show City</div><h3>${place}</h3><p class="dh-sub">${fmt(idxs.length)} archived show${idxs.length===1?'':'s'} \u00b7 ${esc(SH.shows[idxs[0]].d.slice(0,4))}\u2013${esc(SH.shows[idxs[idxs.length-1]].d.slice(0,4))}. Tap a show for its setlist.</p></div><div class="show-list">${rows}</div>`;
    body.querySelectorAll('.show-row').forEach(r=>r.addEventListener('click',()=>{
      const i=r.dataset.i; const sl=document.getElementById('sl-'+i); const open=r.classList.contains('on');
      if(open){r.classList.remove('on');sl.style.display='none';sl.innerHTML='';}
      else{r.classList.add('on');sl.innerHTML=setlistHTML(SH.shows[i]);sl.style.display='block';}
    }));
  }
  d.classList.add('open'); document.body.classList.add('no-scroll'); body.scrollTop=0;
}
window.openCityDrawer=openCityDrawer;

/* ---- movement / orientation bar drill-down ---- */
function songRows(songs,col){
  const max=Math.max(1,...songs.map(s=>s.plays));
  return `<div class="bd-list">${songs.map(s=>`<button class="bd-row" onclick="Terra.openSong('${esc(s.key)}')"><span class="bd-t">${esc(s.title)}</span><span class="bd-bar"><i style="width:${Math.max(2,s.plays/max*100)}%;background:${col}"></i></span><span class="bd-n">${fmt(s.plays)}</span></button>`).join('')}</div>`;
}
(function(){
  const mvWrap=document.getElementById('byMovement');
  const mvDetail=document.createElement('div'); mvDetail.className='bar-detail'; mvWrap.after(mvDetail);
  mvWrap.querySelectorAll('.row').forEach((row,i)=>{ row.classList.add('drill');
    row.addEventListener('click',()=>{
      const m=S.byMovement[i], rows=mvWrap.querySelectorAll('.row');
      if(mvDetail.dataset.open===String(i)){mvDetail.innerHTML='';mvDetail.dataset.open='';rows.forEach(r=>r.classList.remove('on'));return;}
      rows.forEach(r=>r.classList.remove('on')); row.classList.add('on'); mvDetail.dataset.open=i;
      const mv=T.MOVEMENTS[m.num-1];
      const songs=(mv.songs||[]).map(e=>{const s=T.songByKey(e.key);if(!s)return null;const ss=S.songStats[s.song_key_norm];return {key:s.song_key_norm,title:s.display_title,plays:ss?ss.plays:0};}).filter(Boolean).sort((a,b)=>b.plays-a.plays);
      mvDetail.innerHTML=`<div class="bd-head" style="--c:${T.mvColor(m.num-1)}"><b>${esc(m.roman+' \u00b7 '+m.mv)}</b> \u00b7 ${fmt(m.plays)} plays across ${songs.length} songs \u00b7 ${m.avg} avg/song</div>`+songRows(songs,T.mvColor(m.num-1));
    });
  });
  const orWrap=document.getElementById('byOrientation');
  const orDetail=document.createElement('div'); orDetail.className='bar-detail'; orWrap.after(orDetail);
  orWrap.querySelectorAll('.row').forEach((row,i)=>{ row.classList.add('drill');
    row.addEventListener('click',()=>{
      const o=S.byOrientation[i], rows=orWrap.querySelectorAll('.row');
      if(orDetail.dataset.open===String(i)){orDetail.innerHTML='';orDetail.dataset.open='';rows.forEach(r=>r.classList.remove('on'));return;}
      rows.forEach(r=>r.classList.remove('on')); row.classList.add('on'); orDetail.dataset.open=i;
      const col=T.dirColor(o.dir);
      const songs=T.SONGS.filter(s=>s.directionality===o.dir).map(s=>{const ss=S.songStats[s.song_key_norm];return {key:s.song_key_norm,title:s.display_title,plays:ss?ss.plays:0};}).sort((a,b)=>b.plays-a.plays);
      orDetail.innerHTML=`<div class="bd-head" style="--c:${col}"><b>${esc(T.dirLabel(o.dir))}</b> \u00b7 ${fmt(o.plays)} plays across ${o.songs} songs \u00b7 ${o.avg} avg/song</div>`+songRows(songs.slice(0,40),col);
    });
  });
})();

renderMostPlayed('proj');
T.watchReveals();
})();
