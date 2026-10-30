/* Mobile menu: close the panel after a link is chosen, on Escape, or on a tap outside. */
(()=>{const d=document.querySelector('.mnav');if(!d)return;
  d.addEventListener('click',e=>{if(e.target.closest('.mpanel a'))d.removeAttribute('open');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')d.removeAttribute('open');});
  document.addEventListener('click',e=>{if(!d.contains(e.target))d.removeAttribute('open');});})();
