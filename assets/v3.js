/* v3.js: reveal on scroll, count-up numbers, process progress line. Respects reduced motion. */
(()=>{
  const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els=document.querySelectorAll('.rv');
  if(rm||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));}
  else{
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.18,rootMargin:'0px 0px -6% 0px'});
    els.forEach(e=>io.observe(e));
  }
  // count-up
  const fmt=(v,el)=>{const d=+el.dataset.dec||0,p=el.dataset.pre||'',s=el.dataset.suf||'';return p+v.toLocaleString('en-NZ',{minimumFractionDigits:d,maximumFractionDigits:d})+s;};
  const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,to=+el.dataset.count;cio.unobserve(el);
    if(rm){el.textContent=fmt(to,el);return;}const t0=performance.now(),D=1400;
    const step=t=>{const k=Math.min(1,(t-t0)/D),v=to*(1-Math.pow(1-k,3));el.textContent=fmt(v,el);if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);}),{threshold:.6});
  document.querySelectorAll('[data-count]').forEach(e=>cio.observe(e));
  // process progress
  const proc=document.querySelector('.steps');
  if(proc){const st=[...proc.querySelectorAll('.step')];
    const upd=()=>{const r=proc.getBoundingClientRect(),vh=innerHeight;let p=(vh*.75-r.top)/(r.height+vh*.25);p=Math.max(0,Math.min(1,p));
      if(rm)p=1;proc.style.setProperty('--p',p);st.forEach((s,i)=>s.classList.toggle('on',p>=i/st.length));};
    addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();}
})();
/* pipeline wires: connect nodes to the hub from their real positions */
(()=>{const box=document.querySelector('.flowbox');if(!box)return;const svg=box.querySelector('.wires');
  const src=[...box.querySelectorAll('.src .node')],out=[...box.querySelectorAll('.out .node')],hub=box.querySelector('.hub');
  const narrow=matchMedia('(max-width:860px)');
  const drawV=()=>{const b=box.getBoundingClientRect(),h=hub.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${b.width} ${b.height}`);
    const hx=h.left-b.left+h.width/2,ht=h.top-b.top,hb=h.bottom-b.top;
    src.forEach((n,i)=>{const r=n.getBoundingClientRect(),x=r.left-b.left+r.width/2,y=r.bottom-b.top,m=(y+ht)/2;svg.querySelector('#w'+(i+1)).setAttribute('d',`M${x} ${y} C${x} ${m} ${hx} ${m} ${hx} ${ht}`);});
    out.forEach((n,i)=>{const r=n.getBoundingClientRect(),x=r.left-b.left+r.width/2,y=r.top-b.top,m=(hb+y)/2;svg.querySelector('#w'+(i+5)).setAttribute('d',`M${hx} ${hb} C${hx} ${m} ${x} ${m} ${x} ${y}`);});};
  const draw=()=>{if(narrow.matches)return drawV();const b=box.getBoundingClientRect(),h=hub.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${b.width} ${b.height}`);
    const hl=h.left-b.left,hr=h.right-b.left,hy=h.top-b.top+h.height/2;
    src.forEach((n,i)=>{const r=n.getBoundingClientRect(),x=r.right-b.left,y=r.top-b.top+r.height/2,m=(x+hl)/2;svg.querySelector('#w'+(i+1)).setAttribute('d',`M${x} ${y} C${m} ${y} ${m} ${hy} ${hl} ${hy}`);});
    out.forEach((n,i)=>{const r=n.getBoundingClientRect(),x=r.left-b.left,y=r.top-b.top+r.height/2,m=(x+hr)/2;svg.querySelector('#w'+(i+5)).setAttribute('d',`M${hr} ${hy} C${m} ${hy} ${m} ${y} ${x} ${y}`);});};
  draw();addEventListener('resize',draw);document.fonts&&document.fonts.ready.then(draw);})();
/* header border on scroll + contact modal (pages without site.js) */
(()=>{const top=document.querySelector('.top');if(top){const f=()=>top.classList.toggle('scrolled',scrollY>20);addEventListener('scroll',f,{passive:true});f();}
  const cm=document.getElementById('cmodal');if(!cm||window.__siteJs)return;
  const form=document.getElementById('cmForm'),note=document.getElementById('cmNote'),send=form.querySelector('button[type="submit"]'),mbox=cm.querySelector('.mbox'),title=document.getElementById('cmTitle'),sub=mbox.querySelector('.msub'),t0=title.textContent,s0=sub.textContent;let last=null;
  const done=document.createElement('div');done.className='mdone';done.innerHTML='<button class="btn" type="button">Close</button>';mbox.appendChild(done);
  const open=()=>{last=document.activeElement;mbox.classList.remove('sent');title.textContent=t0;sub.textContent=s0;note.className='mnote';note.textContent='';cm.removeAttribute('inert');cm.classList.add('open');cm.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden';setTimeout(()=>document.getElementById('cmName').focus(),60);};
  const close=()=>{cm.classList.remove('open');cm.setAttribute('aria-hidden','true');cm.setAttribute('inert','');document.documentElement.style.overflow='';if(last)last.focus();};
  document.getElementById('cmClose').addEventListener('click',close);done.querySelector('button').addEventListener('click',close);
  cm.addEventListener('click',e=>{if(e.target===cm)close();});cm.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  form.addEventListener('submit',e=>{if(!window.fetch)return;e.preventDefault();send.disabled=true;note.textContent='Sending…';note.className='mnote on';
    fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw 0;form.reset();mbox.classList.add('sent');title.textContent='Message sent';sub.textContent="Thanks for getting in touch. I'll reply within 2 working days.";note.className='mnote';})
    .catch(()=>{note.textContent="Sorry, that didn't send. Please email me at hello@gabrielaolivera.nz.";note.className='mnote on err';}).finally(()=>{send.disabled=false;});});
  document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const t=a.textContent.trim();if(/^(Get in touch|Ask me|Got a different question)/.test(t)||(a.classList.contains('cta')&&location.pathname==='/')){e.preventDefault();open();}},true);
})();
/* header goes dark over dark sections (home + case study) */
(()=>{const top=document.querySelector('.top');if(!top||window.__siteJs)return;
  const dk=[...document.querySelectorAll('.proc,.close,.csnums,.site-foot')];
  const f=()=>{const y=top.offsetHeight/2;top.classList.toggle('dark',dk.some(s=>{const r=s.getBoundingClientRect();return r.top<=y&&r.bottom>y;}));};
  addEventListener('scroll',f,{passive:true});addEventListener('resize',f);f();})();
/* The MailerLite form injects an h4 after the section's h2; announce it as level 3 (we don't control its markup). */
(()=>{const host=document.querySelector('.ml-embedded');if(!host)return;
  const fix=()=>host.querySelectorAll('.ml-form-embedContent > h4').forEach(h=>h.setAttribute('aria-level','3'));
  fix();new MutationObserver(fix).observe(host,{childList:true,subtree:true});})();
/* back to top, with a ring that fills as you read (pages without site.js) */
(()=>{const b=document.getElementById('totop'),ring=document.getElementById('totopRing');if(!b||window.__siteJs)return;
  const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  b.addEventListener('click',()=>scrollTo({top:0,behavior:rm?'auto':'smooth'}));
  const f=()=>{const y=scrollY,max=Math.max(1,document.documentElement.scrollHeight-innerHeight);b.classList.toggle('show',y>600);ring&&ring.setAttribute('stroke-dashoffset',(213.6*(1-Math.min(1,y/max))).toFixed(1));};
  addEventListener('scroll',f,{passive:true});f();})();
/* carousels on phones: previous/next buttons and a "1 / 3" counter; all cards stay in the page for screen readers */
(()=>{document.querySelectorAll('[data-carousel]').forEach(c=>{
  const items=[...c.children],n=items.length;c.setAttribute('aria-roledescription','carousel');c.tabIndex=0;
  const ctl=document.createElement('div');ctl.className='cctl';
  ctl.innerHTML='<button type="button" aria-label="Previous">←</button><output aria-live="polite">1 / '+n+'</output><button type="button" aria-label="Next">→</button>';
  c.after(ctl);const [prev,out,next]=ctl.children;
  const idx=()=>{let b=0,d=1e9;items.forEach((it,i)=>{const x=Math.abs(it.getBoundingClientRect().left-c.getBoundingClientRect().left-parseFloat(getComputedStyle(c).paddingLeft));if(x<d){d=x;b=i}});return b;};
  const go=i=>{i=Math.max(0,Math.min(n-1,i));c.scrollTo({left:items[i].offsetLeft-items[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
  const upd=()=>{const i=idx();out.textContent=(i+1)+' / '+n;prev.disabled=i===0;next.disabled=i===n-1;};
  prev.addEventListener('click',()=>go(idx()-1));next.addEventListener('click',()=>go(idx()+1));
  c.addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});
  c.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(idx()+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(idx()-1)}});
  upd();});})();
/* questions on phones: cards sit on an arc as you swipe */
document.querySelectorAll('.arc').forEach(c=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const mq=matchMedia('(max-width:760px)'),cards=[...c.children];let raf=0;
  const upd=()=>{raf=0;if(!mq.matches){cards.forEach(k=>{k.style.removeProperty('--ay');k.style.removeProperty('--ar')});return;}
    const b=c.getBoundingClientRect(),mid=b.left+b.width/2;
    cards.forEach(k=>{const r=k.getBoundingClientRect(),d=Math.max(-1.6,Math.min(1.6,(r.left+r.width/2-mid)/r.width));
      k.style.setProperty('--ay',(d*d*34).toFixed(1)+'px');k.style.setProperty('--ar',(d*9).toFixed(2)+'deg');});};
  const q=()=>{if(!raf)raf=requestAnimationFrame(upd)};
  c.addEventListener('scroll',q,{passive:true});addEventListener('resize',q);mq.addEventListener('change',q);upd();});
/* question cards on phones: the arrow in each card moves to the next one */
(()=>{const c=document.querySelector('.qcards.arc');if(!c)return;const cards=[...c.children];
  c.querySelectorAll('.qnx').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.to;
    c.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    setTimeout(()=>cards[i].querySelector('.qnx').focus({preventScroll:true}),450);}));})();
/* phones: every carousel card gets its own arrow (next card; the last one goes back to the first), instead of separate buttons below */
(()=>{const R='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  B='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';
  document.querySelectorAll('[data-carousel]:not(.qcards)').forEach(c=>{const items=[...c.children],n=items.length;
    items.forEach((it,i)=>{const b=document.createElement('button');b.type='button';
      b.className='cnx'+(it.matches('.hero2,.rec')?' lt':'');b.setAttribute('aria-label',i<n-1?'Next':'Back to the first');b.innerHTML=i<n-1?R:B;
      b.addEventListener('click',()=>{const j=(i+1)%n;c.scrollTo({left:items[j].offsetLeft-items[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        setTimeout(()=>items[j].querySelector('.cnx').focus({preventScroll:true}),450);});
      it.appendChild(b);});});})();
