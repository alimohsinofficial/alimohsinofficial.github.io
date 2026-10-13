(() => {
  const root = document.documentElement;
  const modeControl = document.getElementById('view-mode');
  const applyMode = mode => {
    if (!['studio','tactical'].includes(mode)) return;
    root.setAttribute('mode', mode);
    if (modeControl) modeControl.value = mode;
    document.querySelectorAll('.view-label').forEach(el => el.textContent = `${mode.toUpperCase()} VIEW / PERSONAL PORTFOLIO`);
  };
  applyMode(root.getAttribute('mode'));
  modeControl?.addEventListener('blueprint:change', e => {
    applyMode(e.detail.value);
    try { localStorage.setItem('portfolio-mode', e.detail.value); } catch {}
  });
  window.addEventListener('storage', e => { if (e.key === 'portfolio-mode') applyMode(e.newValue || 'studio'); });
  const clock = document.getElementById('local-time');
  const updateClock = () => { if (clock) clock.textContent = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()) + ' / DHAKA'; };
  updateClock();setInterval(updateClock,60000);
  document.getElementById('print-resume')?.addEventListener('click', () => window.print());
  let printState = [];
  window.addEventListener('beforeprint', () => {
    printState = [...document.querySelectorAll('x-accordion details')].map(el => [el, el.open]);
    printState.forEach(([el]) => { el.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printState.forEach(([el, open]) => { el.open = open; });
  });
  const search=document.getElementById('post-search');
  const category=document.getElementById('post-category');
  const cards=[...document.querySelectorAll('.post-card')];
  const filter=()=>{
    const query=(search?.value || '').trim().toLowerCase();const selected=category?.value || 'all';let count=0;
    for(const card of cards){const show=card.textContent.toLowerCase().includes(query)&&(selected==='all'||card.getAttribute('category')===selected);card.hidden=!show;if(show)count++;}
    const label=document.getElementById('result-count');if(label)label.textContent=`${count} ${count===1?'note':'notes'}`;
    const empty=document.getElementById('no-results');if(empty)empty.hidden=count>0;
  };
  search?.addEventListener('input',filter);category?.addEventListener('blueprint:change',filter);
})();
