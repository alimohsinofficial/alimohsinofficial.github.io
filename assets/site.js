/* Shared static-page utilities. Layout controllers are separate. */
(() => {
  if(location.protocol==='file:')document.querySelectorAll('a[href]').forEach(link=>{const u=new URL(link.getAttribute('href'),location.href);if(u.protocol==='file:'&&u.pathname.endsWith('/')){u.pathname+='index.html';link.href=u.href;}});
  const themeKey='portfolio-theme-'+(document.documentElement.dataset.experience||'studio');
  const appearance=window.PortfolioAppearance||{value:document.documentElement.getAttribute('theme')||'light'};
  let restoring=false;
  const restore=()=>{restoring=true;if(window.BlueprintThemeToggle)BlueprintThemeToggle.setTheme(appearance.value,false);else document.documentElement.setAttribute('theme',appearance.value);restoring=false;};
  // Component clicks are local choices; Blueprint's shared storage notifications are not.
  document.addEventListener('click',e=>{if(e.target.closest('x-theme-toggle'))appearance.userAction=true;},true);
  document.addEventListener('blueprint:theme',e=>{if(restoring)return;if(appearance.userAction){appearance.value=e.detail.theme;appearance.userAction=false;try{localStorage.setItem(themeKey,appearance.value);}catch{}}else if(e.detail.theme!==appearance.value)restore();});
  window.addEventListener('storage',e=>{if(e.key===themeKey&&['light','dark'].includes(e.newValue)){appearance.value=e.newValue;restore();}});
  restore();
  document.querySelectorAll('x-copy-button[copy-current-url]').forEach(b=>b.setAttribute('text',location.href));
  document.getElementById('print-resume')?.addEventListener('click',()=>window.print());
  let printState=[];
  window.addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('x-accordion details')].map(el=>[el,el.open]);printState.forEach(([el])=>el.open=true);});
  window.addEventListener('afterprint',()=>printState.forEach(([el,open])=>el.open=open));
  const search=document.getElementById('post-search'),category=document.getElementById('post-category');
  const filter=()=>{let count=0;document.querySelectorAll('.post-card').forEach(card=>{const show=card.textContent.toLowerCase().includes((search?.value||'').toLowerCase())&&(!category||category.value==='all'||category.value===card.getAttribute('category'));card.hidden=!show;if(show)count++;});const label=document.getElementById('result-count');if(label)label.textContent=count+' '+(count===1?'note':'notes');const empty=document.getElementById('no-results');if(empty)empty.hidden=count>0;};
  search?.addEventListener('input',filter);category?.addEventListener('blueprint:change',filter);
})();
