/* One preference governs decorative motion in both experiences. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let requested;
 try{requested=localStorage.getItem('portfolio-motion');}catch{}
 if(requested===null||requested===undefined)requested=navigator.connection?.saveData?'off':'on';
 const state=window.PortfolioMotion={enabled:false};
 const sync=()=>{state.enabled=requested!=='off'&&!reduced.matches;document.documentElement.dataset.motion=state.enabled?'on':'off';document.querySelectorAll('.motion-toggle').forEach(b=>{b.hidden=false;b.disabled=reduced.matches;b.setAttribute('aria-pressed',String(state.enabled));b.setAttribute('aria-label',reduced.matches?'Animation disabled by reduced-motion preference':state.enabled?'Pause decorative animation':'Enable decorative animation');b.title=b.getAttribute('aria-label');b.querySelector('span').textContent=state.enabled?'Motion on':'Motion off';});document.dispatchEvent(new CustomEvent('portfolio:motion',{detail:{enabled:state.enabled}}));};
 document.querySelectorAll('.motion-toggle').forEach(b=>b.addEventListener('click',()=>{requested=state.enabled?'off':'on';try{localStorage.setItem('portfolio-motion',requested);}catch{}sync();}));reduced.addEventListener('change',sync);sync();
})();
