/* Work page: projects carousel. Swipe on phones, drag with a mouse, arrow keys, tabs and buttons.
   Every project stays in the page for screen readers. Respects reduced motion. */
(()=>{const c=document.querySelector('[data-pcar]');if(!c)return;
  const track=c.querySelector('.pcar-track'),slides=[...track.children],tabs=[...c.querySelectorAll('.pcar-tabs button')],
        ink=c.querySelector('.pcar-ink'),out=c.querySelector('output'),pv=c.querySelector('.pv'),nx=c.querySelector('.nx'),
        rm=matchMedia('(prefers-reduced-motion: reduce)').matches,n=slides.length;
  let cur=-1;
  const idx=()=>{const x=track.scrollLeft;let b=0,d=1e9;slides.forEach((s,i)=>{const k=Math.abs(s.offsetLeft-slides[0].offsetLeft-x);if(k<d){d=k;b=i}});return b;};
  const go=i=>{i=Math.max(0,Math.min(n-1,i));track.scrollTo({left:slides[i].offsetLeft-slides[0].offsetLeft,behavior:rm?'auto':'smooth'});};
  const set=i=>{if(i===cur)return;cur=i;
    slides.forEach((s,k)=>s.classList.toggle('on',k===i));
    tabs.forEach((t,k)=>t.setAttribute('aria-current',k===i?'true':'false'));
    const t=tabs[i];ink.style.width=t.offsetWidth+'px';ink.style.transform='translateX('+t.offsetLeft+'px)';
    const b=t.parentElement;b.scrollTo({left:t.offsetLeft-(b.clientWidth-t.offsetWidth)/2,behavior:rm?'auto':'smooth'});
    out.textContent=String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');
    pv.disabled=i===0;nx.disabled=i===n-1;c.style.setProperty('--prog',(i+1)/n);};
  tabs.forEach((t,k)=>t.addEventListener('click',()=>go(k)));
  pv.addEventListener('click',()=>go(idx()-1));nx.addEventListener('click',()=>go(idx()+1));
  track.addEventListener('scroll',()=>requestAnimationFrame(()=>set(idx())),{passive:true});
  track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'){e.preventDefault();go(idx()+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(idx()-1)}});
  addEventListener('resize',()=>{const i=cur;cur=-1;set(i<0?0:i)});
  /* drag with a mouse (touch screens already swipe natively) */
  let down=null,moved=false;
  track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;down={x:e.clientX,l:track.scrollLeft};moved=false;});
  addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;if(!moved&&Math.abs(dx)>6){moved=true;track.classList.add('drag');}
    if(moved){track.scrollLeft=down.l-dx;e.preventDefault();}});
  addEventListener('pointerup',e=>{if(!down)return;const dx=e.clientX-down.x,start=idx();down=null;
    if(moved){track.classList.remove('drag');const i=Math.abs(dx)>60?(dx<0?Math.max(start,cur+1):Math.min(start,cur-1)):cur;go(i);}});
  track.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;return;}
    /* tapping or clicking a card that is not in front brings it to the front */
    const s=e.target.closest('.ex');if(s&&!s.classList.contains('on')){e.preventDefault();e.stopPropagation();go(slides.indexOf(s));}},true);
  track.addEventListener('dragstart',e=>e.preventDefault());
  /* phones: an arrow in each card goes to the next project (the last one goes back to the first) */
  const R='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    B='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';
  slides.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='pnx';
    b.setAttribute('aria-label',i<n-1?'Next project':'Back to the first project');b.innerHTML=i<n-1?R:B;
    b.addEventListener('click',e=>{e.stopPropagation();const j=(i+1)%n;go(j);setTimeout(()=>slides[j].querySelector('.pnx').focus({preventScroll:true}),450);});
    s.querySelector('.copy').appendChild(b);});
  set(0);c.classList.add('ready');})();
