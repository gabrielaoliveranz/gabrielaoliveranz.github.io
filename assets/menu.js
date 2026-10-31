/* Mobile menu: close the panel after a link is chosen, on Escape, or on a tap outside. */
(()=>{const d=document.querySelector('.mnav');if(!d)return;
  d.addEventListener('click',e=>{if(e.target.closest('.mpanel a'))d.removeAttribute('open');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')d.removeAttribute('open');});
  document.addEventListener('click',e=>{if(!d.contains(e.target))d.removeAttribute('open');});})();
/* Header takes the colour of the section under it (31 Oct 2026), with a lighter pill for the buttons.
   It also decides light or dark text from that colour, so every section on every page matches. */
(()=>{const top=document.getElementById('nav');if(!top||!document.elementFromPoint)return;
  const rgb=c=>{const m=c&&c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const v=m[1].split(',').map(parseFloat);return (v.length>3&&v[3]<.5)?null:v;};
  const under=()=>{const y=top.getBoundingClientRect().bottom+2;let el=document.elementFromPoint(6,y);
    /* only full-width blocks count, so a card or image inside a section never colours the header */
    while(el&&el!==document.documentElement){if(!top.contains(el)&&el.getBoundingClientRect().width>=innerWidth*.9){const v=rgb(getComputedStyle(el).backgroundColor);if(v)return v;}el=el.parentElement;}
    return rgb(getComputedStyle(document.body).backgroundColor)||[250,248,243];};
  let raf=0;const f=()=>{raf=0;const v=under();const lum=(0.2126*v[0]+0.7152*v[1]+0.0722*v[2])/255;
    top.style.setProperty('--hbg',`rgb(${v[0]},${v[1]},${v[2]})`);top.classList.add('tint');top.classList.toggle('dark',lum<.45);};
  const q=()=>{if(!raf)raf=requestAnimationFrame(f);};
  addEventListener('scroll',q,{passive:true});addEventListener('resize',q);addEventListener('load',q);setTimeout(q,60);})();
