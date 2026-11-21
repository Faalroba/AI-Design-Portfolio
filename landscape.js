(() => {
  'use strict';
  const header=document.querySelector('.portfolio-header'),toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#portfolio-nav');
  const closeMenu=()=>{header?.classList.remove('menu-open');toggle?.setAttribute('aria-expanded','false');};
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));header.classList.toggle('menu-open',open);});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{closeMenu();nav.querySelectorAll('details').forEach(d=>d.open=false);}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const wasOpen=toggle?.getAttribute('aria-expanded')==='true';closeMenu();nav?.querySelectorAll('details').forEach(d=>d.open=false);if(wasOpen)toggle.focus();}});
  document.addEventListener('click',event=>{if(header&&!header.contains(event.target)){closeMenu();nav.querySelectorAll('details').forEach(d=>d.open=false);}});
  const landscape=document.querySelector('.landscape-hero');if(!landscape)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,latest,touchReset=0;
  const paint=()=>{frame=0;if(!latest||reduced.matches)return;const r=landscape.getBoundingClientRect();const x=Math.max(0,Math.min(1,(latest.x-r.left)/r.width)),y=Math.max(0,Math.min(1,(latest.y-r.top)/r.height));landscape.style.setProperty('--mx',(x-.5).toFixed(3));landscape.style.setProperty('--my',(y-.5).toFixed(3));landscape.style.setProperty('--pointer-x',`${x*100}%`);landscape.style.setProperty('--pointer-y',`${y*100}%`);landscape.classList.add('is-exploring');};
  const respond=event=>{clearTimeout(touchReset);if(reduced.matches)return;latest={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(paint);};
  const reset=()=>{clearTimeout(touchReset);cancelAnimationFrame(frame);frame=0;landscape.classList.remove('is-exploring');landscape.style.setProperty('--mx','0');landscape.style.setProperty('--my','0');};
  landscape.addEventListener('pointermove',respond,{passive:true});landscape.addEventListener('pointerdown',respond,{passive:true});landscape.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch')reset();});landscape.addEventListener('pointerup',event=>{if(event.pointerType==='touch')touchReset=setTimeout(reset,1600);});reduced.addEventListener('change',reset);
})();
