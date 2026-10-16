// Site script, ported from the October 2026 prototype. Each page runs only the
// parts whose markup it has: see CLAUDE.md, "The October 2026 redesign".
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), sm=t=>t*t*(3-2*t), ease=t=>1-Math.pow(1-t,3);
  const vh=()=>innerHeight;
  const inView=el=>{const r=el.getBoundingClientRect(); return r.bottom>0 && r.top<vh();};
  let seed=11; const rnd=()=>{seed=(seed*16807)%2147483647; return (seed-1)/2147483646;};
  function fit(c){const r=c.getBoundingClientRect(), d=Math.min(2,devicePixelRatio||1); c.width=Math.max(1,r.width*d); c.height=Math.max(1,r.height*d); const x=c.getContext('2d'); x.setTransform(d,0,0,d,0,0); return {x,w:r.width,h:r.height};}
  const mobile=()=>innerWidth<=860;
  const isHome=!!document.getElementById('heroField'), isBiz=!!document.getElementById('bizField');

  /* nav, reading progress and the active link */
  const nav=document.getElementById('nav'), bar=document.getElementById('progress');
  const navLinks=[...document.querySelectorAll('.nav ul a')].filter(a=>a.getAttribute('href').charAt(0)==='#');
  const darkSecs=[...document.querySelectorAll('#how-i-work,#contact,.tl,#bizContact')];
  function navFrame(){
    const y=scrollY;
    bar.style.transform=`scaleX(${clamp(y/Math.max(1,document.documentElement.scrollHeight-vh()),0,1)})`;
    nav.classList.toggle('solid',y>40);
    nav.classList.toggle('dark',darkSecs.some(s=>{const r=s.getBoundingClientRect(); return r.top+56<30 && r.bottom>60;}));
    let cur=null; navLinks.forEach(a=>{ const t=document.querySelector(a.getAttribute('href')); if(!t) return; const r=t.getBoundingClientRect(); if(r.top<vh()*.4 && r.bottom>vh()*.4) cur=a; });
    navLinks.forEach(a=>a.classList.toggle('on',a===cur));
    requestAnimationFrame(navFrame);
  }
  requestAnimationFrame(navFrame);

  /* back to top, with a ring that fills as you read */
  const totop=document.getElementById('totop'), ring=document.getElementById('totopRing');
  totop.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));
  function topFrame(){ const y=scrollY, max=Math.max(1,document.documentElement.scrollHeight-vh()); totop.classList.toggle('show',y>600); ring.setAttribute('stroke-dashoffset',(213.6*(1-clamp(y/max,0,1))).toFixed(1)); requestAnimationFrame(topFrame); }
  requestAnimationFrame(topFrame);

  /* floating artifacts: drift with the cursor and the scroll, each at its own depth */
  const floatSets=[...document.querySelectorAll('.floats')].map(set=>({set,items:[...set.querySelectorAll('.fl')].map(el=>({el,d:+el.dataset.depth,x:0,y:0})),mx:0,my:0}));
  floatSets.forEach(fs=>{ const host=fs.set.parentElement; host.addEventListener('pointermove',e=>{ const r=host.getBoundingClientRect(); fs.mx=(e.clientX-r.left)/r.width-.5; fs.my=(e.clientY-r.top)/r.height-.5; }); host.addEventListener('pointerleave',()=>{fs.mx=0;fs.my=0;}); });
  function floatFrame(){
    floatSets.forEach(fs=>{ const r=fs.set.getBoundingClientRect(); if(r.bottom<0||r.height===0||reduce) return;
      fs.items.forEach(it=>{ const tx=-fs.mx*28*it.d, ty=-fs.my*22*it.d + r.top*.22*it.d; it.x+=(tx-it.x)*.08; it.y+=(ty-it.y)*.08; it.el.style.setProperty('--fx',it.x.toFixed(1)+'px'); it.el.style.setProperty('--fy',it.y.toFixed(1)+'px'); }); });
    requestAnimationFrame(floatFrame);
  }
  requestAnimationFrame(floatFrame);

  /* contact modal: every "Get in touch" opens it and the form posts to Formspree.
     Without JS the links are plain mailto: links and the form is a normal POST. */
  const cm=document.getElementById('cmodal');
  if(cm){
    const cmForm=document.getElementById('cmForm'), cmMsg=document.getElementById('cmMsg'), cmNote=document.getElementById('cmNote'), cmSend=cmForm.querySelector('button[type="submit"]');
    let lastFocus=null; window.__askedQ='';
    const note=(t,err)=>{ cmNote.textContent=t; cmNote.className='mnote on'+(err?' err':''); };
    /* after a successful send the box switches to a clear "Message sent" view */
    const mbox=cm.querySelector('.mbox'), cmTitle=document.getElementById('cmTitle'), cmSub=mbox.querySelector('.msub'), mmark=mbox.querySelector('.mmark');
    const title0=cmTitle.textContent, sub0=cmSub.textContent;
    const check=document.createElement('span'); check.className='mcheck'; check.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; mmark.appendChild(check);
    const done=document.createElement('div'); done.className='mdone'; done.innerHTML='<button class="btn" type="button">Close</button>'; mbox.appendChild(done);
    function showSent(){ mbox.classList.add('sent'); cmTitle.textContent='Message sent'; cmSub.textContent="Thanks for getting in touch. I'll reply within 2 working days."; cmNote.className='mnote'; cmNote.textContent=''; mbox.scrollTop=0; cmTitle.setAttribute('tabindex','-1'); cmTitle.focus(); }
    function resetSent(){ if(!mbox.classList.contains('sent')) return; mbox.classList.remove('sent'); cmTitle.textContent=title0; cmSub.textContent=sub0; cmTitle.removeAttribute('tabindex'); }
    function openModal(prefill){
      lastFocus=document.activeElement; resetSent(); cmNote.className='mnote'; cmNote.textContent='';
      if(prefill){ cmMsg.value='Hi Gabriela, I\'d like to know: '+prefill+'\n\nA bit about my business: '; cmMsg.classList.remove('pre'); void cmMsg.offsetWidth; cmMsg.classList.add('pre'); }
      cm.removeAttribute('inert'); cm.classList.add('open'); cm.setAttribute('aria-hidden','false'); document.documentElement.style.overflow='hidden';
      setTimeout(()=>document.getElementById('cmName').focus(),60);
    }
    function closeModal(){ cm.classList.remove('open'); cm.setAttribute('aria-hidden','true'); cm.setAttribute('inert',''); document.documentElement.style.overflow=''; if(lastFocus) lastFocus.focus(); }
    document.getElementById('cmClose').addEventListener('click',closeModal);
    done.querySelector('button').addEventListener('click',closeModal);
    cm.addEventListener('click',e=>{ if(e.target===cm) closeModal(); });
    cm.addEventListener('keydown',e=>{
      if(e.key==='Escape') return closeModal();
      if(e.key!=='Tab') return; const f=[...cm.querySelectorAll('button,input:not([tabindex="-1"]),textarea')].filter(x=>x.offsetParent!==null), first=f[0], last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    cmForm.addEventListener('submit',e=>{
      if(!window.fetch||!window.FormData) return; e.preventDefault(); cmSend.disabled=true; note('Sending…');
      fetch(cmForm.action,{method:'POST',body:new FormData(cmForm),headers:{Accept:'application/json'}})
        .then(r=>{ if(!r.ok) throw new Error(r.status); cmForm.reset(); showSent(); })
        .catch(()=>{ note("Sorry, that didn't send. Please email me at hello@gabrielaolivera.nz.",true); cmNote.scrollIntoView({block:'nearest'}); })
        .finally(()=>{ cmSend.disabled=false; });
    });
    document.addEventListener('click',e=>{
      const a=e.target.closest('a'); if(!a) return;
      const txt=a.textContent.trim();
      if(a.dataset.ask){ e.preventDefault(); e.stopImmediatePropagation(); openModal(window.__askedQ); return; }
      if(/^(Get in touch|Ask me)/.test(txt)){ e.preventDefault(); e.stopImmediatePropagation(); openModal(isBiz?window.__askedQ:''); }
    },true);
  }

  if(isHome){
  /* hero: loose dots that find each other around the cursor */
  const hc=document.getElementById('heroField'); let H=fit(hc);
  const HN=mobile()?90:190;
  const hp=[...Array(HN)].map(()=>({x:rnd(),y:rnd(),vx:(rnd()-.5)*.0003,vy:(rnd()-.5)*.0003,r:1.4+rnd()*2.2}));
  const mouse={x:-1,y:-1,on:false};
  const heroSec=hc.parentElement;
  heroSec.addEventListener('pointermove',e=>{const r=hc.getBoundingClientRect(); mouse.x=(e.clientX-r.left)/r.width; mouse.y=(e.clientY-r.top)/r.height; mouse.on=true;});
  heroSec.addEventListener('pointerleave',()=>mouse.on=false);
  function heroDraw(){
    const {x,w,h}=H; x.clearRect(0,0,w,h);
    for(const p of hp){
      if(!reduce){ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>1)p.vx*=-1; if(p.y<0||p.y>1)p.vy*=-1; }
      let px=p.x*w, py=p.y*h;
      if(mouse.on){ const dx=px-mouse.x*w, dy=py-mouse.y*h, d=Math.hypot(dx,dy); if(d<150){ const f=(150-d)/150*20; px+=dx/(d||1)*f; py+=dy/(d||1)*f; } }
      p.sx=px; p.sy=py;
      x.fillStyle='rgba(26,74,130,.30)'; x.beginPath(); x.arc(px,py,p.r,0,6.283); x.fill();
    }
    if(mouse.on){
      const near=hp.filter(p=>Math.hypot(p.sx-mouse.x*w,p.sy-mouse.y*h)<220);
      x.lineWidth=1;
      for(let i=0;i<near.length;i++)for(let j=i+1;j<near.length;j++){const a=near[i],b=near[j],d=Math.hypot(a.sx-b.sx,a.sy-b.sy); if(d<115){x.strokeStyle=`rgba(46,111,176,${.4*(1-d/115)})`; x.beginPath(); x.moveTo(a.sx,a.sy); x.lineTo(b.sx,b.sy); x.stroke();}}
      near.forEach(p=>{x.fillStyle='rgba(26,74,130,.8)'; x.beginPath(); x.arc(p.sx,p.sy,p.r+.7,0,6.283); x.fill();});
    }
  }

  /* marquee driven by scroll speed */
  const words=['SQL','Python','Power BI','R','Excel','Power Query','ETL','Data quality','Git'];
  const marq=document.getElementById('marq');
  const one=words.map((w,i)=>`<span class="${i%3===0?'f':''}">${w}</span><span>·</span>`).join('');
  marq.innerHTML=one+one+one;
  let mx=0, lastY=scrollY, vel=0;

  /* statement: words light up as you read */
  const q=document.getElementById('quote');
  { const t=q.textContent.trim(); q.innerHTML='<span class="sr-only">'+t+'</span><span aria-hidden="true">'+t.split(' ').map(w=>`<span class="w${/useful/.test(w)?' k':''}${reduce?' on':''}">${w}</span>`).join(' ')+'</span>'; }
  const qw=[...q.querySelectorAll('.w')];

  /* counters */
  const counted=new WeakSet();
  function countUp(el){ if(counted.has(el))return; counted.add(el); if(reduce)return; const end=+el.dataset.count, suf=el.dataset.suffix||'', t0=performance.now();
    (function f(t){const p=Math.min(1,(t-t0)/1300); el.textContent=Math.round(end*ease(p)).toLocaleString('en-NZ')+suf; if(p<1) requestAnimationFrame(f);})(t0); }

  /* how I work: full-screen story */
  const track=document.getElementById('howTrack'), hcv=document.getElementById('howField'); let S=fit(hcv);
  const steps=[...document.querySelectorAll('.step')], ticks=[...document.querySelectorAll('#ticks span')], ghost=document.getElementById('ghost');
  const N=mobile()?150:280;
  const base=[...Array(N)].map(()=>({x:rnd(),y:rnd(),ph:rnd()*6.283,sp:.5+rnd()}));
  const order=[...Array(N).keys()].sort((a,b)=>base[a].x-base[b].x);
  let L={};
  function layouts(){
    const m=mobile();
    const bx=m?[.08,.92]:[.40,.95], by=m?[.18,.52]:[.20,.78];
    const W=bx[1]-bx[0], Hh=by[1]-by[0];
    const cols=m?15:20, rows=Math.ceil(N/cols);
    const grid=base.map((_,i)=>({x:bx[0]+(i%cols)/(cols-1)*W, y:by[0]+Math.floor(i/cols)/(rows-1)*Hh}));
    const sig=Array(N); order.forEach((idx,k)=>{const t=k/(N-1); sig[idx]={x:bx[0]+t*W, y:by[1]-t*Hh*.85-Math.sin(t*9)*Hh*.05+(base[idx].y-.5)*Hh*.14};});
    const hts=[5,7,6,9,10,12,15,19], tot=hts.reduce((a,b)=>a+b,0), per=hts.map(h=>Math.round(h/tot*N)); per[7]+=N-per.reduce((a,b)=>a+b,0);
    const bars=Array(N); let k=0; const perCol=m?3:4, bw=W/8, dx=bw*.8/perCol;
    const maxRows=Math.ceil(per[7]/perCol), dy=Hh*.95/maxRows;
    for(let b=0;b<8;b++) for(let j=0;j<per[b];j++){ const idx=order[k++]; bars[idx]={x:bx[0]+b*bw+(j%perCol)*dx+dx/2, y:by[1]-Math.floor(j/perCol)*dy, hot:b===7}; }
    L={noise:base,grid,sig,bars,bx,by,topHot:by[1]-(maxRows-1)*dy,hotX:bx[0]+7*bw+bw*.4};
  }
  layouts();
  let lastActive=-1;
  function howDraw(time){
    const r=track.getBoundingClientRect(), total=r.height-vh();
    const p=clamp(-r.top/Math.max(1,total),0,1), seg=Math.min(3.999,p*4), s=Math.floor(seg), u=seg-s;
    const st=reduce?s:(s===0?0:(u<.5?(s-1)+sm(u/.5):s));
    if(s!==lastActive){ steps.forEach((e,i)=>e.classList.toggle('on',i===s)); ticks.forEach((e,i)=>e.classList.toggle('on',i===s)); ghost.textContent='0'+(s+1); lastActive=s; }
    const {x,w,h}=S; x.clearRect(0,0,w,h);
    const st4=[L.noise,L.grid,L.sig,L.bars], a=Math.floor(st), b=Math.min(3,a+1), t=st-a;
    const ga=clamp(1-Math.abs(st-1)*1.4,0,1);
    if(ga>0){ x.strokeStyle=`rgba(127,163,201,${.08*ga})`; x.lineWidth=1; for(let gx=0;gx<=w;gx+=48){x.beginPath();x.moveTo(gx,0);x.lineTo(gx,h);x.stroke();} for(let gy=0;gy<=h;gy+=48){x.beginPath();x.moveTo(0,gy);x.lineTo(w,gy);x.stroke();} }
    const la=clamp((st-1.5)*2,0,1)*(st<=2?1:clamp(1-(st-2)*3,0,1));
    if(la>0){ x.strokeStyle=`rgba(79,195,255,${.85*la})`; x.lineWidth=3; x.beginPath(); x.moveTo(L.bx[0]*w,L.by[1]*h); x.lineTo(L.bx[1]*w,(L.by[1]-(L.by[1]-L.by[0])*.85)*h); x.stroke(); }
    const ba=clamp((st-2.3)/.7,0,1);
    if(ba>0){ x.strokeStyle=`rgba(127,163,201,${.45*ba})`; x.lineWidth=1.5; x.beginPath(); x.moveTo(L.bx[0]*w,(L.by[1]+.025)*h); x.lineTo(L.bx[1]*w,(L.by[1]+.025)*h); x.stroke(); }
    const jit=reduce?0:clamp(1-st,0,1), hot=clamp((st-2.4)/.6,0,1);
    for(let i=0;i<N;i++){
      const A=st4[a][i], B=st4[b][i];
      let px=A.x+(B.x-A.x)*t, py=A.y+(B.y-A.y)*t;
      if(jit>0){ px+=Math.sin(time/1400*base[i].sp+base[i].ph)*.012*jit; py+=Math.cos(time/1700*base[i].sp+base[i].ph)*.012*jit; }
      const isHot=L.bars[i].hot && hot>0;
      const rad=(isHot?3.6:2.6)*(mobile()?.9:1)+(1-clamp(st,0,1))*base[i].sp*1.2;
      x.fillStyle=isHot?`rgba(79,195,255,${.4+.6*hot})`:`rgba(127,163,201,${.55+.35*clamp(st,0,1)})`;
      x.beginPath(); x.arc(px*w,py*h,rad,0,6.283); x.fill();
      if(isHot && hot>.5){ x.fillStyle=`rgba(79,195,255,${.12*hot})`; x.beginPath(); x.arc(px*w,py*h,rad*3,0,6.283); x.fill(); }
    }
    if(hot>.65){ const al=(hot-.65)/.35, hx=L.hotX*w, hy=L.topHot*h-26;
      x.font=`800 ${Math.max(14,Math.min(22,w*.016))}px Archivo, sans-serif`; x.textAlign='center'; x.fillStyle=`rgba(231,238,246,${al})`; x.fillText('Act here',hx,hy-12);
      x.strokeStyle=`rgba(79,195,255,${al})`; x.lineWidth=2; x.beginPath(); x.moveTo(hx,hy-4); x.lineTo(hx,hy+12); x.stroke(); }
  }

  /* data quality: a dot travels the pipeline */
  const pipe=document.getElementById('pipe'), fill=document.getElementById('pipeFill'), lbls=[...document.querySelectorAll('#pipeLbls div')];
  const svg=pipe&&pipe.querySelector('svg');
  const nodes=!svg?[]:[125,375,625,875].map(cx=>{const c=document.createElementNS('http://www.w3.org/2000/svg','circle'); c.setAttribute('cx',cx); c.setAttribute('cy',40); c.setAttribute('r',9); c.setAttribute('fill','#e8e8e3'); c.setAttribute('stroke','#c9c6bd'); c.setAttribute('stroke-width','2'); c.setAttribute('vector-effect','non-scaling-stroke'); svg.appendChild(c); return c;});
  const runner=document.createElementNS('http://www.w3.org/2000/svg','circle'); runner.setAttribute('cy',40); runner.setAttribute('r',7); runner.setAttribute('fill','#4fc3ff'); if(svg) svg.appendChild(runner);

  /* small business: dashboard tilts flat and builds itself */
  const dash=document.getElementById('dash'), cols=document.getElementById('cols');
  if(cols) [38,46,42,55,60,57,66,72,64,78,84,94].forEach(h=>{const i=document.createElement('i'); i.style.height=h+'%'; cols.appendChild(i);});
  const colEls=cols?[...cols.children]:[], tiles=dash?[...dash.querySelectorAll('.tile')]:[], band=dash&&dash.querySelector('.band'), hb=[...document.querySelectorAll('#hbars i')];

  /* contact: every dot converges on one */
  const ec=document.getElementById('endField'); let E=fit(ec);
  const EN=mobile()?80:160;
  const ep=[...Array(EN)].map(()=>({x:rnd(),y:rnd(),a:rnd()*6.283}));
  function endDraw(time){
    const r=ec.parentElement.getBoundingClientRect();
    const p=reduce?1:clamp((vh()-r.top)/(vh()*.95),0,1), k=ease(p);
    const {x,w,h}=E; x.clearRect(0,0,w,h);
    const cx=mobile()?w*.82:w*.86, cy=h*.28;
    for(const d of ep){
      const sx=d.x*w, sy=d.y*h, sp=(1-k)*60;
      const px=sx+(cx-sx)*k+Math.cos(d.a+time/2000)*sp*.3, py=sy+(cy-sy)*k+Math.sin(d.a+time/2000)*sp*.3;
      x.fillStyle=`rgba(127,163,201,${.45*(1-k)+.05})`; x.beginPath(); x.arc(px,py,2.2,0,6.283); x.fill();
    }
    const g=clamp((p-.8)/.2,0,1);
    if(g>0){ const pr=reduce?0:Math.sin(time/500)*2; x.fillStyle=`rgba(79,195,255,${.18*g})`; x.beginPath(); x.arc(cx,cy,(34+pr*2)*g,0,6.283); x.fill(); x.fillStyle=`rgba(79,195,255,${g})`; x.beginPath(); x.arc(cx,cy,(12+pr)*g,0,6.283); x.fill(); }
  }


  const shots=[...document.querySelectorAll('.reveal-shot')];
  function homeFrame(time){
    const y=scrollY; vel=vel*.9+(y-lastY)*.1; lastY=y;
    if(inView(hc)) heroDraw();
    if(!reduce){ mx-=.8+Math.min(30,Math.abs(vel)*.4); const third=marq.scrollWidth/3; if(-mx>third) mx+=third; marq.style.transform=`translateX(${mx}px)`; }

    if(inView(q)){ const r=q.getBoundingClientRect(); const p=reduce?1:clamp((vh()*.85-r.top)/(r.height+vh()*.35),0,1); const n=Math.round(p*qw.length); qw.forEach((w,i)=>w.classList.toggle('on',i<n)); }

    shots.forEach(s=>{ if(!inView(s))return; const r=s.getBoundingClientRect(); const p=reduce?1:clamp((vh()-r.top)/(vh()*.7),0,1); s.style.setProperty('--c',((1-ease(p))*100).toFixed(1)+'%'); s.style.setProperty('--py',((r.top+r.height/2-vh()/2)*-.06).toFixed(1)+'px'); if(p>.4) s.closest('.ex').querySelectorAll('[data-count]').forEach(countUp); });

    if(inView(track)) howDraw(time);

    if(pipe&&inView(pipe)){ const r=pipe.getBoundingClientRect(); const p=reduce?1:clamp((vh()*.85-r.top)/(vh()*.55),0,1); const xx=125+750*p; fill.setAttribute('x2',xx); runner.setAttribute('cx',xx); nodes.forEach((n,i)=>{const on=p>=i/3-.001; n.setAttribute('fill',on?'#1a4a82':'#e8e8e3'); n.setAttribute('stroke',on?'#1a4a82':'#c9c6bd'); lbls[i].classList.toggle('on',on);}); }

    if(dash&&inView(dash)){ const r=dash.getBoundingClientRect(); const p=reduce?1:clamp((vh()-r.top)/(vh()*.8),0,1);
      dash.style.setProperty('--t',(1-ease(clamp(p*1.3,0,1))).toFixed(3));
      tiles.forEach((t,i)=>t.style.setProperty('--o',clamp((p-.15-i*.06)/.2,0,1).toFixed(3)));
      band.style.setProperty('--b',clamp((p-.35)/.25,0,1).toFixed(3));
      colEls.forEach((c,i)=>c.style.transform=`scaleY(${Math.max(.04,clamp((p-.45-i*.025)/.25,0,1)).toFixed(3)})`);
      hb.forEach((c,i)=>c.style.transform=`scaleX(${Math.max(.04,clamp((p-.55-i*.05)/.25,0,1)).toFixed(3)})`);
    }
    if(inView(ec)) endDraw(time);
    requestAnimationFrame(homeFrame);
  }
  addEventListener('resize',()=>{H=fit(hc); S=fit(hcv); E=fit(ec); layouts();});
  requestAnimationFrame(homeFrame);
  }

  if(isBiz){
  /* question carousel */
  (function(){
    // Q1 paths: a noisy monthly line and the trend under it
    const raw=[], tr=[];
    for(let i=0;i<24;i++){ const x=36+i*16.3; const base=236-i*6.2; const seas=Math.sin(i/12*6.283+.8)*26; const spike=(i===7?-48:0)+(i===16?-40:0)+(i===11?30:0); raw.push([x,base+seas+spike]); tr.push([x,base]); }
    const d=pts=>pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    document.getElementById('q1raw').setAttribute('d',d(raw));
    document.getElementById('q1trend').setAttribute('d','M'+tr[0][0]+' '+tr[0][1]+' L'+tr[23][0].toFixed(1)+' '+tr[23][1].toFixed(1));
    document.querySelector('#q1trend').parentNode.querySelector('circle').setAttribute('cx',tr[23][0].toFixed(1));
    document.querySelector('#q1trend').parentNode.querySelector('circle').setAttribute('cy',tr[23][1].toFixed(1));

    const car=document.getElementById('car'), slides=[...car.querySelectorAll('.slide')], segs=[...document.querySelectorAll('#carBar button')], count=document.getElementById('carCount');
    let cur=-1;
    function setActive(i){
      if(i===cur) return; cur=i;
      slides.forEach((s,k)=>{ s.classList.toggle('on',k===i); s.setAttribute('aria-hidden',k===i?'false':'true'); s.querySelectorAll('a,button').forEach(el=>el.tabIndex=k===i?0:-1); if(k===i && !reduce){ s.classList.remove('play'); void s.offsetWidth; s.classList.add('play'); } });
      segs.forEach((b,k)=>{ b.classList.toggle('on',k===i); b.classList.toggle('done',k<i); });
      count.textContent=String(i+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
    }
    function centerOf(i){ const s=slides[i]; return s.offsetLeft - (car.clientWidth - s.offsetWidth)/2; }
    function go(i){ i=Math.max(0,Math.min(slides.length-1,i)); car.scrollTo({left:centerOf(i),behavior:reduce?'auto':'smooth'}); }
    function nearest(){ const mid=car.scrollLeft+car.clientWidth/2; let best=0,bd=1e9; slides.forEach((s,k)=>{const c=s.offsetLeft+s.offsetWidth/2, dd=Math.abs(c-mid); if(dd<bd){bd=dd;best=k;}}); return best; }
    car.addEventListener('scroll',()=>setActive(nearest()),{passive:true});
    document.getElementById('carPrev').addEventListener('click',()=>go(cur-1));
    document.getElementById('carNext').addEventListener('click',()=>go(cur+1));
    segs.forEach((b,k)=>b.addEventListener('click',()=>go(k)));
    car.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'){e.preventDefault();go(cur+1);} if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1);} });
    slides.forEach((s,k)=>s.addEventListener('click',()=>{ if(k!==cur && !moved) go(k); }));
    // drag with the mouse on desktop; touch uses native swipe
    let down=false, sx=0, sl=0, moved=false;
    car.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') return; down=true; moved=false; sx=e.clientX; sl=car.scrollLeft; });
    addEventListener('pointermove',e=>{ if(!down) return; const dx=e.clientX-sx; if(Math.abs(dx)>4){ moved=true; car.classList.add('drag'); } car.scrollLeft=sl-dx; });
    addEventListener('pointerup',()=>{ if(!down) return; down=false; car.classList.remove('drag'); go(nearest()); setTimeout(()=>moved=false,50); });
    // replay the first slide when the carousel scrolls into view
    new IntersectionObserver(es=>{ if(es[0].isIntersecting){ const s=slides[cur]; if(s && !reduce){ s.classList.remove('play'); void s.offsetWidth; s.classList.add('play'); } } },{threshold:.4}).observe(car);
    setActive(0);
    addEventListener('resize',()=>go(cur));
  })();


  /* ---------- small business: hero field ---------- */
  const bc=document.getElementById('bizField'); let BH=fit(bc);
  const bp=[...Array(mobile()?80:170)].map(()=>({x:rnd(),y:rnd(),vx:(rnd()-.5)*.0003,vy:(rnd()-.5)*.0003,r:1.4+rnd()*2.2}));
  const bm={x:-1,y:-1,on:false};
  bc.parentElement.addEventListener('pointermove',e=>{const r=bc.getBoundingClientRect(); bm.x=(e.clientX-r.left)/r.width; bm.y=(e.clientY-r.top)/r.height; bm.on=true;});
  bc.parentElement.addEventListener('pointerleave',()=>bm.on=false);
  function bizHero(){
    const {x,w,h}=BH; x.clearRect(0,0,w,h);
    for(const p of bp){ if(!reduce){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;}
      let px=p.x*w,py=p.y*h; if(bm.on){const dx=px-bm.x*w,dy=py-bm.y*h,d=Math.hypot(dx,dy); if(d<150){const f=(150-d)/150*20;px+=dx/(d||1)*f;py+=dy/(d||1)*f;}}
      p.sx=px;p.sy=py; x.fillStyle='rgba(26,74,130,.28)'; x.beginPath(); x.arc(px,py,p.r,0,6.283); x.fill(); }
    if(bm.on){ const near=bp.filter(p=>Math.hypot(p.sx-bm.x*w,p.sy-bm.y*h)<220); x.lineWidth=1;
      for(let i=0;i<near.length;i++)for(let j=i+1;j<near.length;j++){const a=near[i],b=near[j],d=Math.hypot(a.sx-b.sx,a.sy-b.sy); if(d<115){x.strokeStyle=`rgba(46,111,176,${.4*(1-d/115)})`;x.beginPath();x.moveTo(a.sx,a.sy);x.lineTo(b.sx,b.sy);x.stroke();}}
      near.forEach(p=>{x.fillStyle='rgba(26,74,130,.8)';x.beginPath();x.arc(p.sx,p.sy,p.r+.7,0,6.283);x.fill();}); }
  }

  /* statement words */
  const bq=document.getElementById('bizQuote');
  { const t=bq.textContent.trim(); bq.innerHTML='<span class="sr-only">'+t+'</span><span aria-hidden="true">'+t.split(' ').map(w=>`<span class="w${/decision|act/.test(w)?' k':''}${reduce?' on':''}">${w}</span>`).join(' ')+'</span>'; }
  const bqw=[...bq.querySelectorAll('.w')];

  /* plans replay their animation when they come into view */
  const plans=[...document.querySelectorAll('.plan')];
  const planIO=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.remove('play'); void en.target.offsetWidth; en.target.classList.add('play'); } }),{threshold:.45});
  if(!reduce) plans.forEach(p=>planIO.observe(p));

  /* timeline */
  const tlTrack=document.getElementById('tlTrack'), tlStrip=document.getElementById('tlStrip'), tlFill=document.getElementById('tlFill'), stops=[...tlStrip.querySelectorAll('.stop')];

  /* privacy */
  const lock=document.getElementById('lock'), privItems=[...document.querySelectorAll('#privList li')];

  /* closing field */
  const be=document.getElementById('bizEnd'); let BE=fit(be);
  const bep=[...Array(mobile()?80:160)].map(()=>({x:rnd(),y:rnd(),a:rnd()*6.283}));
  function bizEnd(time){
    const r=be.parentElement.getBoundingClientRect(); const p=reduce?1:clamp((vh()-r.top)/(vh()*.95),0,1), k=ease(p);
    const {x,w,h}=BE; x.clearRect(0,0,w,h); const cx=mobile()?w*.82:w*.86, cy=h*.28;
    for(const d of bep){ const sx=d.x*w, sy=d.y*h, sp=(1-k)*60; const px=sx+(cx-sx)*k+Math.cos(d.a+time/2000)*sp*.3, py=sy+(cy-sy)*k+Math.sin(d.a+time/2000)*sp*.3; x.fillStyle=`rgba(127,163,201,${.45*(1-k)+.05})`; x.beginPath(); x.arc(px,py,2.2,0,6.283); x.fill(); }
    const g=clamp((p-.8)/.2,0,1); if(g>0){ const pr=reduce?0:Math.sin(time/500)*2; x.fillStyle=`rgba(79,195,255,${.18*g})`; x.beginPath(); x.arc(cx,cy,(34+pr*2)*g,0,6.283); x.fill(); x.fillStyle=`rgba(79,195,255,${g})`; x.beginPath(); x.arc(cx,cy,(12+pr)*g,0,6.283); x.fill(); }
  }

  addEventListener('resize',()=>{ BH=fit(bc); BE=fit(be); });
  function bizFrame(time){
    {
      if(inView(bc)) bizHero();
      if(inView(bq)){ const r=bq.getBoundingClientRect(); const p=reduce?1:clamp((vh()*.85-r.top)/(r.height+vh()*.35),0,1); const n=Math.round(p*bqw.length); bqw.forEach((w,i)=>w.classList.toggle('on',i<n)); }
      if(!mobile() && inView(tlTrack)){
        const r=tlTrack.getBoundingClientRect(), total=r.height-vh(); const p=clamp(-r.top/Math.max(1,total),0,1);
        const max=Math.max(0,tlStrip.scrollWidth-innerWidth); tlStrip.style.transform=`translateX(${(-max*p).toFixed(1)}px)`;
        const span=tlStrip.scrollWidth; tlFill.style.width=Math.max(0,(span*.08)+(span*.84)*p)+'px';
        stops.forEach((s,i)=>s.classList.toggle('on',p>=i/(stops.length-1)*.98-.02));
      } else if(mobile()) stops.forEach(s=>s.classList.add('on'));
      const pl=document.querySelector('.priv');
      if(inView(pl)){ const r=pl.getBoundingClientRect(); const p=reduce?1:clamp((vh()*.8-r.top)/(vh()*.6),0,1);
        lock.classList.toggle('open',p<.5);
        privItems.forEach((li,i)=>li.style.setProperty('--o',clamp((p-i*.09)/.35,0,1).toFixed(3))); }
      if(inView(be)) bizEnd(time);
    }
    requestAnimationFrame(bizFrame);
  }
  requestAnimationFrame(bizFrame);


  /* ask your numbers: plain keyword matching in the page, nothing is sent anywhere */
  (function(){
    const form=document.getElementById('askForm'), input=document.getElementById('askInput'), out=document.getElementById('askOut');
    const Q=[
      {i:0,t:'Are sales actually growing, or does it just feel that way?',a:'Your sales by month, with seasonality and one-off spikes taken out, so you see the real direction.',w:['sale','sales','revenue','turnover','grow','growing','growth','trend','season','busy','quiet','month','income','up','down','selling']},
      {i:1,t:'Which customers have quietly started ordering less?',a:'Every customer compared with the same period last year, with the ones drifting away flagged early.',w:['customer','customers','client','clients','ordering','order','orders','stopped','losing','lost','regular','repeat','loyal','churn','drift','left','buy','buying']},
      {i:2,t:'Which products or customers are actually making you money?',a:'Profit by product and by customer, not just revenue, so you know what really pays.',w:['profit','profitable','margin','margins','money','earn','earning','product','products','price','pricing','best','worst','range','line','cost of']},
      {i:3,t:'Why is delivery costing more than it used to?',a:'Cost per order, per route and per customer, so you can see exactly where it is coming from.',w:['delivery','deliveries','freight','transport','route','routes','courier','shipping','fuel','truck','drivers','logistics','dispatch','postage']}
    ];
    const P={snap:{n:'Snapshot Report',why:'A one-off look at where things stand today. The easiest place to start.'},
             q:{n:'Quarterly Check-in',why:'You want someone keeping an eye on this regularly, rebuilt every quarter.'},
             g:{n:'Growth Dashboard',why:'You want to see where things are heading, with a simple forecast, not just where they have been.'}};
    function plan(s){ if(/forecast|predict|next year|next season|future|heading|plan ahead|budget|will be|going to/.test(s)) return 'g';
      if(/every month|monthly|quarter|regular|ongoing|keep an eye|track|always|each month/.test(s)) return 'q'; return 'snap'; }
    function match(s){ const words=s.toLowerCase(); let best=null,score=0; Q.forEach(q=>{ let sc=0; q.w.forEach(w=>{ if(new RegExp('\\b'+w).test(words)) sc+=w.length>5?2:1; }); if(sc>score){score=sc;best=q;} }); return best; }
    function esc(t){ const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }
    function answer(text){
      text=text.trim(); if(!text){ input.focus(); return; }
      out.innerHTML='<div class="thinking"><i></i><i></i><i></i>&nbsp;LOOKING AT YOUR QUESTION</div>';
      setTimeout(()=>{
        const s=text.toLowerCase(), q=match(s), p=P[plan(s)];
        const left = q ? `<span class="lab">YOUR NUMBERS CAN ANSWER THIS</span><h3>${esc(q.t)}</h3><p>${esc(q.a)}</p><div class="acts"><button type="button" class="btn btn-light" data-slide="${q.i}">See this question →</button></div>`
                       : `<span class="lab">GOOD QUESTION</span><h3>That one needs a quick chat.</h3><p>If your numbers can answer it, I'll tell you how, and what it would take.</p>`;
        out.innerHTML=`<div class="res"><div class="l">${left}</div><div class="r"><span class="lab">BEST FIT</span><div class="plan-n">${esc(p.n)}</div><p>${esc(p.why)}</p><div class="acts"><a class="btn btn-light" href="#bizContact" data-ask="1">Ask me this →</a><a class="btn btn-ghost" href="#plans">Compare plans</a></div></div></div>`;
        const go=out.querySelector('[data-slide]'); if(go) go.addEventListener('click',()=>{ const car=document.getElementById('car'); document.getElementById('questions').scrollIntoView({behavior:reduce?'auto':'smooth'}); setTimeout(()=>document.querySelectorAll('#carBar button')[+go.dataset.slide].click(),reduce?0:500); });
      }, reduce?0:700);
    }
    form.addEventListener('submit',e=>{ e.preventDefault(); answer(input.value); });
    document.querySelectorAll('#askSugg button').forEach(b=>b.addEventListener('click',()=>{ input.value=b.textContent; answer(b.textContent); }));
    // the placeholder cycles through real questions
    const ph=['Are my sales actually growing?','Who stopped ordering from us?','Is our best seller really our most profitable?','Why is freight costing more this year?','Where will sales be next season?'];
    let pi=0; if(!reduce) setInterval(()=>{ if(document.activeElement!==input && !input.value){ pi=(pi+1)%ph.length; input.placeholder=ph[pi]; } },2800);
  })();

    const af=document.getElementById('askForm');
    if(af){ af.addEventListener('submit',()=>{ window.__askedQ=document.getElementById('askInput').value.trim(); }); document.querySelectorAll('#askSugg button').forEach(b=>b.addEventListener('click',()=>{ window.__askedQ=b.textContent.trim(); })); }
  /* live demo dashboard: invented business, invented numbers, everything computed here. Mirrors the Excel Snapshot template */
  (function(){
    const M=['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
    const SEAS=[.8,.75,.85,.95,1,.7,.8,1.1,1.35,1.4,1.2,.9];
    const R={'Tauranga':{w:.45,g:1.11,s:3},'Te Puke':{w:.33,g:1.09,s:7},'Katikati':{w:.22,g:.96,s:11}};
    const nz=(k)=>{const x=Math.sin(k*12.9898)*43758.5453; return x-Math.floor(x);};
    const sales=(r,y,m)=>{const o=R[r]; return 100000*o.w*SEAS[m]*(y===2026?o.g:1)*(.92+nz(o.s*100+m*7+y)*.16);};
    const CUST=[['Bayview Packhouse','Tauranga',148,166],['Coastal Growers','Tauranga',121,131],['Harbour Produce','Tauranga',96,58],['Te Puke Fresh','Te Puke',134,151],['Rangiuru Farms','Te Puke',88,92],['Kaimai Orchards','Te Puke',77,41],['Omokoroa Fruit Co','Katikati',92,70],['Aongatete Growers','Katikati',64,49]];
    const PROD=[['Picking bins',.31,.18],['Orchard netting',.22,.34],['Packing liners',.17,.12],['Pruning tools',.12,.41],['Irrigation fittings',.11,.29],['Protective wear',.07,.38]];
    const ROUTE=[['Route A','Tauranga',18.4,520],['Route B','Tauranga',21.1,410],['Route C','Te Puke',24.9,380],['Route D','Te Puke',29.7,260],['Route E','Katikati',36.2,240],['Route F','Katikati',41.8,150]];
    let tab='sales', reg='all';
    const regs=()=>reg==='all'?Object.keys(R):[reg];
    const k=v=>v>=1e6?'$'+(v/1e6).toFixed(2)+'m':'$'+Math.round(v/1000)+'k';
    const pc=v=>(Math.abs(v)*100).toFixed(1)+'%';
    const list=a=>a.length>1?a.slice(0,-1).join(', ')+' and '+a[a.length-1]:a[0];
    const $=id=>document.getElementById(id);
    const elK=$('dKpis'), elC=$('dChart'), elT=$('dTitle'), elL=$('dLegend'), elS=$('dSoWhat'), elF=$('dFind'), elNo=$('dChartNo'), elReg=$('dRegLbl');
    const spark=(a,hi,bars)=>{ if(!a) return ''; const mn=Math.min(...a), mx=Math.max(...a), w=100/a.length, y=v=>24-(mx===mn?.5:(v-mn)/(mx-mn))*20;
      if(bars) return `<svg class="sp" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">${a.map((v,i)=>`<rect class="grow" style="animation-delay:${200+i*25}ms" x="${(i*w+w*.18).toFixed(2)}" y="${y(v).toFixed(1)}" width="${(w*.64).toFixed(2)}" height="${(26-y(v)).toFixed(1)}" rx=".8" fill="${i===hi?'#4fc3ff':'#c9d6e4'}"/>`).join('')}</svg>`;
      const pts=a.map((v,i)=>[(i*(100/(a.length-1))).toFixed(2),y(v).toFixed(1)]); const line=pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');
      return `<svg class="sp" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true"><path d="${line} L100 26 L0 26Z" fill="#e1e8ef"/><path d="${line}" fill="none" stroke="#1a4a82" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`; };
    const kpi=(l,q,v,d,up,sp)=>`<div class="kpi"><span>${l}</span><em>${q}</em><b${/[a-z]{3}/.test(String(v))&&String(v).length>5?' class="t"':''}>${v}</b><i class="${up===false?'dn':''}">${d||'&nbsp;'}</i>${sp||''}</div>`;
    let W=760,H=280,P={l:52,r:16,t:16,b:34}; const lab=(t,bw)=>bw<34?t[0]:bw<96?t.split(' ')[0]:t;
    const txt=(x,y,t,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" font-size="${o.s||11}" ${o.b?'font-weight="700"':''} fill="${o.c||'#5c564a'}" font-family="${o.b?'Archivo':'Source Sans 3'}, sans-serif">${t}</text>`;
    const axisY=(max,fmt)=>{let s='';for(let i=0;i<=4;i++){const y=P.t+(H-P.t-P.b)*(1-i/4);s+=`<line x1="${P.l}" x2="${W-P.r}" y1="${y}" y2="${y}" stroke="#e3e1da"/>`+txt(P.l-8,y+4,fmt(max*i/4),{a:'end'});}return s;};

    /* the numbers, worked out once per region */
    function calc(){
      const rs=regs();
      const ty=M.map((_,m)=>rs.reduce((a,r)=>a+sales(r,2026,m),0)), ly=M.map((_,m)=>rs.reduce((a,r)=>a+sales(r,2025,m),0));
      const T=ty.reduce((a,b)=>a+b), L=ly.reduce((a,b)=>a+b), ch=T/L-1, aov=420+(reg==='Katikati'?-35:reg==='Tauranga'?25:0);
      const best=ty.indexOf(Math.max(...ty)), gm=ty.map((v,i)=>v-ly[i]), top2=[...gm.keys()].sort((a,b)=>ch>=0?gm[b]-gm[a]:gm[a]-gm[b]).slice(0,2).sort((a,b)=>a-b);
      const cs=CUST.filter(c=>reg==='all'||c[1]===reg).map(c=>({n:c[0],l:c[2],t:c[3],d:c[3]/c[2]-1}));
      const less=cs.filter(c=>c.d<=-.2).sort((a,b)=>a.d-b.d), topC=[...cs].sort((a,b)=>b.t-a.t)[0], totC=cs.reduce((a,c)=>a+c.t,0);
      const ps=PROD.map((p,i)=>({n:p[0],rev:T*p[1]*(1+(reg!=='all'?(nz(i+R[reg].s)-.5)*.2:0)),mg:p[2]}));
      const gp=ps.reduce((a,p)=>a+p.rev*p.mg,0), rv=ps.reduce((a,p)=>a+p.rev,0), bestM=[...ps].sort((a,b)=>b.mg-a.mg)[0], topR=[...ps].sort((a,b)=>b.rev-a.rev)[0];
      const rt=ROUTE.filter(r=>reg==='all'||r[1]===reg).map(r=>({n:r[0],reg:r[1],c:r[2],d:r[3]}));
      const dv=rt.reduce((a,r)=>a+r.d,0), cost=rt.reduce((a,r)=>a+r.c*r.d,0), worst=[...rt].sort((a,b)=>b.c-a.c)[0], cheap=Math.min(...rt.map(r=>r.c)), ratio=worst.c/(cost/dv);
      return {ty,ly,T,ch,aov,orders:Math.round(T/aov),best,top2,cs,less,topC,totC,ps,gp,rv,bestM,topR,rt,dv,cost,worst,cheap,ratio};
    }

    /* "Three things worth acting on", same strip as the Excel template */
    function findings(d){
      const f1=(d.ch>=0?`Sales are up ${pc(d.ch)} on last year`:`Sales are down ${pc(d.ch)} on last year`)+`, with the biggest ${d.ch>=0?'gains':'drops'} in ${M[d.top2[0]]} and ${M[d.top2[1]]}.`;
      const f2=d.less.length?`${d.less.length} ${d.less.length>1?'customers are':'customer is'} ordering 20% less or more. Start with ${d.less[0].n}.`:`No customer has dropped by 20% or more. ${d.topC.n} is ${Math.round(d.topC.t/d.totC*100)}% of sales, so keep them close.`;
      const f3=d.ratio>=1.3?`${d.worst.n} costs ${d.ratio.toFixed(1)} times the average delivery. Group those orders into fewer runs.`:`${d.bestM.n} keep ${Math.round(d.bestM.mg*100)}% of every dollar. Push them harder before adding new lines.`;
      const on={sales:0,cust:1,prod:2,deliv:2}[tab];
      elF.innerHTML=[f1,f2,f3].map((t,i)=>`<li class="${i===on?'on':''}"><b>${i+1}</b><span>${t}</span></li>`).join('');
    }

    function render(){
      const d=calc(); W=Math.max(300,Math.round(elC.clientWidth||760)); H=W<560?220:300; P={l:W<560?40:52,r:12,t:16,b:34};
      elReg.textContent=reg==='all'?'All regions':reg; findings(d);
      let s='';
      if(tab==='sales'){
        elNo.textContent='CHART 1 · SALES TREND';
        elK.innerHTML=kpi('Total sales','How much did we sell?',k(d.T),(d.ch>0?'▲ ':'▼ ')+pc(d.ch)+' vs last year',d.ch>0,spark(d.ty))+kpi('Orders','How many orders came in?',d.orders.toLocaleString('en-NZ'),'',null,spark(d.ty.map((v,i)=>v/(d.aov*(.96+nz(i+3)*.08)))))+kpi('Average order','How much is each order worth?','$'+d.aov,'',null,spark(M.map((_,i)=>d.aov*(.93+i*.006+nz(i+9)*.06))))+kpi('Busiest month','When do we need the most stock?',M[d.best],'',null,spark(d.ty,d.best,1));
        elT.textContent='How are sales tracking month by month?';
        elL.innerHTML='<span><i style="background:#1a4a82"></i>This year</span><span><i style="background:transparent;border-top:2px dashed #8a8478;height:0;width:16px"></i>Last year</span>';
        const max=Math.max(...d.ty,...d.ly)*1.1, bw=(W-P.l-P.r)/12; s=axisY(max,v=>'$'+Math.round(v/1000)+'k');
        d.ty.forEach((v,i)=>{const h=(H-P.t-P.b)*v/max; s+=`<rect class="grow" style="animation-delay:${i*35}ms" x="${P.l+i*bw+bw*.18}" y="${H-P.b-h}" width="${bw*.64}" height="${h}" rx="3" fill="${i===d.best?'#4fc3ff':'#1a4a82'}"/>`+txt(P.l+i*bw+bw/2,H-12,lab(M[i],bw));});
        s+=`<path class="linein" pathLength="1" d="${d.ly.map((v,i)=>(i?'L':'M')+(P.l+i*bw+bw/2).toFixed(1)+' '+(H-P.b-(H-P.t-P.b)*v/max).toFixed(1)).join(' ')}" fill="none" stroke="#8a8478" stroke-width="2" stroke-dasharray="5 4"/>`;
        elC.setAttribute('aria-label','Monthly sales this year against last year');
        elS.textContent=`${M[d.best]} is the busiest month, so that's when stock and staff matter most. Plan orders with suppliers a month ahead.`;
      }
      if(tab==='cust'){
        elNo.textContent='CHART 3 · CUSTOMERS';
        elK.innerHTML=kpi('Active customers','How many customers bought?',d.cs.length,'')+kpi('Ordering less','Who is drifting away?',d.less.length,d.less.length?'down 20% or more':'',false)+kpi('Top customer','Who buys the most?',d.topC.n,'')+kpi('Top customer share','How much rides on them?',Math.round(d.topC.t/d.totC*100)+'%','');
        elT.textContent='Which customers have quietly started ordering less?';
        elL.innerHTML='<span><i style="background:#1a4a82"></i>Ordering more</span><span><i style="background:#4fc3ff"></i>Ordering 20% less or more</span><span><i style="background:#c9c6bd"></i>Slightly less</span>';
        const sorted=[...d.cs].sort((a,b)=>a.d-b.d); H=Math.max(150,sorted.length*34+20);
        const nameW=W<560?118:170, mn=Math.max(.05,...sorted.map(c=>-c.d)), mx=Math.max(.05,...sorted.map(c=>c.d)), mid=nameW+(W-nameW)*mn/(mn+mx), sc=Math.min((mid-nameW-44)/mn,(W-mid-44)/mx);
        s=`<line x1="${mid}" x2="${mid}" y1="6" y2="${H-6}" stroke="#8a8478"/>`;
        sorted.forEach((c,i)=>{const y=12+i*34, w=Math.abs(c.d)*sc, x=c.d<0?mid-w:mid, col=c.d<=-.2?'#4fc3ff':c.d<0?'#c9c6bd':'#1a4a82';
          s+=txt(4,y+15,W<560&&c.n.length>14?c.n.slice(0,13)+'…':c.n,{a:'start',s:W<560?11:12.5,b:1,c:'#201c17'})+`<rect class="growx" style="animation-delay:${i*50}ms;transform-origin:${c.d<0?'right':'left'}" x="${x}" y="${y+2}" width="${w}" height="18" rx="3" fill="${col}"/>`+txt(c.d<0?x-6:x+w+6,y+15,(c.d>0?'+':'')+Math.round(c.d*100)+'%',{a:c.d<0?'end':'start',s:12,b:1,c:'#12274a'});});
        elC.setAttribute('aria-label','Change in sales by customer against last year');
        elS.textContent=d.less.length?`Call ${list(d.less.map(c=>c.n))} this month, before they're gone for good.`:'Nobody is drifting away here. A good month to ask your best customers what else they need.';
      }
      if(tab==='prod'){
        elNo.textContent='CHART 4 · PRODUCTS';
        elK.innerHTML=kpi('Gross margin','How much of each dollar do we keep?',(d.gp/d.rv*100).toFixed(1)+'%','',null,spark(M.map((_,i)=>.24+nz(i+21)*.03+i*.001)))+kpi('Gross profit','What is left after product costs?',k(d.gp),'',null,spark(d.ty.map((v,i)=>v*(.24+nz(i+21)*.03))))+kpi('Top seller','What sells the most?',d.topR.n,Math.round(d.topR.rev/d.rv*100)+'% of sales')+kpi('Best margin','What pays the best?',d.bestM.n,Math.round(d.bestM.mg*100)+'% margin');
        elT.textContent='Which products are actually making you money?';
        elL.innerHTML='<span><i style="background:#c9c6bd"></i>Sales</span><span><i style="background:#1a4a82"></i>Gross profit</span>';
        const max=Math.max(...d.ps.map(p=>p.rev))*1.12, bw=(W-P.l-P.r)/d.ps.length; s=axisY(max,v=>'$'+Math.round(v/1000)+'k');
        d.ps.forEach((p,i)=>{const h1=(H-P.t-P.b)*p.rev/max, h2=(H-P.t-P.b)*p.rev*p.mg/max, x=P.l+i*bw+bw*.2;
          s+=`<rect class="grow" style="animation-delay:${i*60}ms" x="${x}" y="${H-P.b-h1}" width="${bw*.6}" height="${h1}" rx="3" fill="#c9c6bd"/><rect class="grow" style="animation-delay:${300+i*60}ms" x="${x}" y="${H-P.b-h2}" width="${bw*.6}" height="${h2}" fill="${p===d.bestM?'#4fc3ff':'#1a4a82'}"/>`+txt(x+bw*.3,H-P.b-h1-6,Math.round(p.mg*100)+'%',{s:11.5,b:1,c:'#12274a'})+txt(x+bw*.3,H-12,lab(p.n,bw));});
        elC.setAttribute('aria-label','Sales and gross profit by product');
        elS.textContent=`${d.topR.n} bring in the most sales, but only ${Math.round(d.topR.mg*100)}% of it is margin. ${d.bestM.n} keep ${Math.round(d.bestM.mg*100)}% of every dollar.`;
      }
      if(tab==='deliv'){
        elNo.textContent='CHART 5 · DELIVERY COST';
        elK.innerHTML=kpi('Cost per delivery','What does each drop really cost?','$'+(d.cost/d.dv).toFixed(2),'',null,spark(M.map((_,i)=>(d.cost/d.dv)*(.9+i*.017+nz(i+31)*.04))))+kpi('Freight % of sales','How much of sales goes on freight?',(d.cost/d.T*100).toFixed(1)+'%','',null,spark(M.map((_,i)=>.9+i*.015+nz(i+41)*.06)))+kpi('Deliveries','How many drops did we make?',d.dv.toLocaleString('en-NZ'),'',null,spark(SEAS,null,1))+kpi('Costliest route','Where is the money going?',d.worst.n,'$'+d.worst.c.toFixed(2)+' a drop');
        elT.textContent='What does each delivery really cost?';
        elL.innerHTML='<span><i style="background:#1a4a82"></i>Cost per delivery</span><span><i style="background:#4fc3ff"></i>Costliest route</span>';
        const max=Math.max(...d.rt.map(r=>r.c))*1.15, bw=(W-P.l-P.r)/d.rt.length; s=axisY(max,v=>'$'+Math.round(v));
        d.rt.forEach((r,i)=>{const h=(H-P.t-P.b)*r.c/max, x=P.l+i*bw+bw*.22; s+=`<rect class="grow" style="animation-delay:${i*60}ms" x="${x}" y="${H-P.b-h}" width="${bw*.56}" height="${h}" rx="3" fill="${r===d.worst?'#4fc3ff':'#1a4a82'}"/>`+txt(x+bw*.28,H-P.b-h-6,'$'+r.c.toFixed(2),{s:11.5,b:1,c:'#12274a'})+txt(x+bw*.28,H-12,bw<150?r.n:r.n+' · '+r.reg);});
        elC.setAttribute('aria-label','Cost per delivery by route');
        elS.textContent=d.ratio>=1.3?`${d.worst.n} costs $${d.worst.c.toFixed(2)} a delivery on only ${d.worst.d} drops. That's the route worth a second look.`:`Routes here cost between $${d.cheap.toFixed(2)} and $${d.worst.c.toFixed(2)} a delivery, so none really stands out. Freight looks under control.`;
      }
      elC.innerHTML=`<svg viewBox="0 0 ${W} ${H}">${s}</svg>`;
    }
    document.querySelectorAll('#dTabs button').forEach(b=>b.addEventListener('click',()=>{ tab=b.dataset.tab; document.querySelectorAll('#dTabs button').forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false')); render(); }));
    document.querySelectorAll('#dRegion button').forEach(b=>b.addEventListener('click',()=>{ reg=b.dataset.r; document.querySelectorAll('#dRegion button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false')); render(); }));
    render(); let rzT; addEventListener('resize',()=>{ clearTimeout(rzT); rzT=setTimeout(()=>{ if(elC.offsetParent) render(); },200); });
  })();


  /* demo stage tilt + works flow reveal */
  (function(){
    const st=document.getElementById('dStage'), box=document.getElementById('dbx'), flow=document.getElementById('worksFlow');
    let last=-1;
    function tick(){
      if(st.offsetParent){ const r=st.getBoundingClientRect(), H=innerHeight; const p=reduce?1:Math.min(1,Math.max(0,(H-r.top)/(H*.78))); const e=1-Math.pow(1-p,3);
        if(Math.abs(e-last)>.0005){ last=e; box.style.transform=e>.998?'none':`rotateX(${((1-e)*26).toFixed(2)}deg) scale(${(.9+.1*e).toFixed(4)}) translateY(${((1-e)*40).toFixed(1)}px)`; st.style.setProperty('--glow',(1-e*.55).toFixed(3)); } }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    new IntersectionObserver((es,o)=>es.forEach(en=>{ if(en.isIntersecting){ flow.classList.add('on'); o.disconnect(); setTimeout(()=>flow.querySelectorAll('.grp span').forEach(c=>c.style.transitionDelay=''),1600); } }),{threshold:.25}).observe(flow);
    flow.querySelectorAll('.grp span').forEach((c,i)=>c.style.transitionDelay=(i*45)+'ms');
  })();

  /* FAQ as a conversation */
  (function(){
    const G=[['GETTING STARTED',[0,1,2]],['TIME AND MONEY',[3,4,6]],['THE FINE PRINT',[5,7]]];
    const F=[
      {q:'What data do I need to send?',a:'Usually exports you already have: sales by item or customer from Xero, and the spreadsheets you keep. Before we start, I send you a checklist of exactly what to pull together and where to find it.',v:'<div class="fq-vis"><span class="c">Sales by item</span><span class="c">Sales by customer</span><span class="c">Your spreadsheets</span><span class="c me">+ a checklist from me</span></div>'},
      {q:'Do I need Xero?',a:'No. Xero exports make things easier, but spreadsheets and CSV exports from other systems work too. I work with your data in its existing format.',v:'<div class="fq-vis"><span class="c ok">Xero</span><span class="c ok">MYOB</span><span class="c ok">CSV exports</span><span class="c ok">Plain spreadsheets</span></div>'},
      {q:'My data is messy. Is that a problem?',a:'No. Cleaning and consolidating your data is part of every plan. Handwritten or photographed paper records need data entry first, which is quoted separately.',v:''},
      {q:'How long does it take?',a:"Once I have all your data, first findings within a week and the final dashboard within 2 weeks. A Growth Dashboard, built in Power BI with a forecast, can take up to 4 weeks. A month after handover, I check in to make sure it's still answering your questions.",v:'<div class="fq-vis"><div class="fq-tl"><div><b>START</b>Your data in</div><div><b>WEEK 1</b>First findings</div><div><b>WEEK 2</b>Dashboard</div><div><b>+1 MONTH</b>Check-in</div></div></div>'},
      {q:'How much does it cost?',a:'Every plan has a fixed price, confirmed in writing before any work starts. It depends on how many data sources you send and how much preparation they need.',v:'<div class="fq-vis"><span class="c ok">Fixed price</span><span class="c ok">In writing</span><span class="c ok">Before any work starts</span></div>'},
      {q:'What software will I need?',a:'Excel for the Snapshot Report and Quarterly Check-in. The Growth Dashboard is built in Power BI, and you get the file or a PDF and video walkthrough.',v:'<div class="fq-vis"><span class="c">Excel · Snapshot, Quarterly</span><span class="c">Power BI · Growth</span></div>'},
      {q:'Can I cancel an ongoing plan?',a:'Yes, any time, with written notice.',v:''},
      {q:"What's not included?",a:'Bookkeeping, accounting, tax, legal or financial advice, data entry of paper records, software licences and hardware.',v:'<div class="fq-vis"><span class="c no">Bookkeeping</span><span class="c no">Tax or legal advice</span><span class="c no">Paper data entry</span><span class="c no">Software licences</span></div>'}
    ];
    const groups=document.getElementById('fqGroups'), chat=document.getElementById('fqChat'); let cur=-1, t; const O=G.flatMap(g=>g[1]), num=i=>String(O.indexOf(i)+1).padStart(2,'0');
    groups.innerHTML=G.map(([n,ids])=>`<div><small>${n}</small><div class="pills">${ids.map(i=>`<button type="button" aria-pressed="false" data-i="${i}"><i>${num(i)}</i>${F[i].q}</button>`).join('')}</div></div>`).join('');
    const btns=[...groups.querySelectorAll('button')];
    function show(i,scroll){
      cur=i; clearTimeout(t); btns.forEach(b=>b.setAttribute('aria-pressed',+b.dataset.i===i?'true':'false'));
      const f=F[i], next=O[(O.indexOf(i)+1)%O.length];
      chat.innerHTML=`<div class="fq-top"><span><i class="ldot" aria-hidden="true"></i>GABRIELA · PLAIN ENGLISH</span><span>${num(i)} / 08</span></div><div class="fq-q">${f.q}</div><div class="fq-a"><span class="fq-av" aria-hidden="true">G</span><div class="fq-bub"><span class="typing" aria-label="typing"><i></i><i></i><i></i></span></div></div><div class="fq-foot"><button type="button" id="fqNext">Next: ${F[next].q} →</button><a href="#bizContact">Ask me something else</a></div>`;
      chat.querySelector('#fqNext').addEventListener('click',()=>show(next));
      t=setTimeout(()=>{ const b=chat.querySelector('.fq-bub'); if(b) b.innerHTML=`<div class="fq-txt">${f.a}</div>${f.v}`; }, reduce?0:650);
      if(scroll && innerWidth<=900) chat.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    }
    btns.forEach(b=>b.addEventListener('click',()=>show(+b.dataset.i,true)));
    show(0);
  })();

  }
})();

// phone menu: open/close the nav links (button only shows below 860px)
(function(){
  const n=document.getElementById('nav'), b=n&&n.querySelector('.nav-toggle'); if(!b) return;
  const set=o=>{n.classList.toggle('open',o); b.setAttribute('aria-expanded',String(o)); b.setAttribute('aria-label',o?'Close menu':'Open menu');};
  b.addEventListener('click',()=>set(!n.classList.contains('open')));
  n.querySelectorAll('ul a').forEach(a=>a.addEventListener('click',()=>set(false)));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&n.classList.contains('open')){ set(false); b.focus(); } });
  document.addEventListener('click',e=>{ if(!n.contains(e.target)) set(false); });
})();
