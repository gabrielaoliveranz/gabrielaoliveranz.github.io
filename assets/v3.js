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
