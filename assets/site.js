/* Plain browser JavaScript. Works from disk and on a static host. */
(() => {
  // Static hosts use pretty folder URLs; local files resolve those folders to index.html.
  if(location.protocol==='file:')document.querySelectorAll('a[href]').forEach(link=>{
    const url=new URL(link.getAttribute('href'),location.href);
    if(url.protocol==='file:' && url.pathname.endsWith('/')){url.pathname+='index.html';link.href=url.href;}
  });
  document.querySelectorAll('x-copy-button[copy-current-url]').forEach(button=>button.setAttribute('text',location.href));
  const root = document.documentElement;
  const consoleView = document.querySelector('x-portfolio-console');
  const normalView = document.querySelector('.site-wrap');
  function applyMode(mode, save = false) {
    if (!['studio','tactical'].includes(mode)) return;
    root.setAttribute('mode', mode);
    document.querySelectorAll('x-segmented.visual-mode,x-segmented.console-mode').forEach(control => { control.value = mode; });
    if(normalView)normalView.inert = mode === 'tactical';
    if(consoleView)consoleView.inert = mode !== 'tactical';
    document.querySelectorAll('.view-label').forEach(el => { el.textContent = `${mode.toUpperCase()} / PERSONAL PORTFOLIO`; });
    if(save)try { localStorage.setItem('portfolio-mode',mode); } catch {}
  }
  document.addEventListener('blueprint:change',event=>{
    if(event.target.matches('x-segmented.visual-mode,x-segmented.console-mode')){
      applyMode(event.detail.value,true);
      const destination = event.detail.value === 'tactical' ? consoleView?.querySelector('x-segmented button[value="tactical"]') : document.querySelector('.visual-mode button[value="studio"]');
      destination?.focus({preventScroll:true});
    }
  });
  applyMode(root.getAttribute('mode') || 'studio');
  window.addEventListener('storage',event=>{if(event.key==='portfolio-mode')applyMode(event.newValue || 'studio');});
  const clock=document.getElementById('local-time');
  const updateClock=()=>{if(clock)clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())+' / DHAKA';};
  updateClock();setInterval(updateClock,60000);
  document.getElementById('print-resume')?.addEventListener('click',()=>window.print());
  let printState=[];
  window.addEventListener('beforeprint',()=>{
    printState=[...document.querySelectorAll('x-accordion details')].map(el=>[el,el.open]);
    printState.forEach(([el])=>{el.open=true;});
    if(normalView)normalView.inert=false;
  });
  window.addEventListener('afterprint',()=>{printState.forEach(([el,open])=>{el.open=open;});applyMode(root.getAttribute('mode'));});
  const search=document.getElementById('post-search');
  const category=document.getElementById('post-category');
  const cards=[...document.querySelectorAll('.post-card')];
  const filter=()=>{
    const query=(search?.value || '').trim().toLowerCase();
    const selected=category?.value || 'all';let count=0;
    for(const card of cards){const show=card.textContent.toLowerCase().includes(query)&&(selected==='all'||card.getAttribute('category')===selected);card.hidden=!show;if(show)count++;}
    const label=document.getElementById('result-count');if(label)label.textContent=`${count} ${count===1?'note':'notes'}`;
    const empty=document.getElementById('no-results');if(empty)empty.hidden=count>0;
  };
  search?.addEventListener('input',filter);category?.addEventListener('blueprint:change',filter);
})();
