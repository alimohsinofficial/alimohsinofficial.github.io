/* Search static logo markup; no fetch, dependency, or index build at runtime. */
(() => {
 const initialized=new WeakSet(),normalize=s=>String(s).normalize('NFKC').toLocaleLowerCase('en');
 const queryFrom=el=>el.closest('main,.dossier-content')?.querySelector('.logo-search-input')?.value||'';
 function init(root=document,options={}){root.querySelectorAll('.logo-search-controls').forEach(controls=>{if(initialized.has(controls))return;initialized.add(controls);const scope=controls.parentElement,input=controls.querySelector('.logo-search-input'),year=controls.querySelector('.logo-year-select'),status=controls.querySelector('.logo-result-count'),empty=scope.querySelector('.logo-empty'),items=[...scope.querySelectorAll('.logo-search-item')].map(el=>({el,text:normalize(el.dataset.search),years:el.dataset.years.split(' ')}));
  input.value=options.query??(root===document?new URL(location.href).searchParams.get('q')||'':'');
  const filter=()=>{const terms=normalize(input.value).trim().split(/\s+/).filter(Boolean);let count=0;items.forEach(item=>{const show=terms.every(term=>item.text.includes(term))&&(!year.value||item.years.includes(year.value));item.el.hidden=!show;if(show)count++;});status.textContent=count+' '+(scope.querySelector('.logo-project-grid')?'projects':'variants');if(empty)empty.hidden=count>0;const switcher=scope.closest('dialog')?.querySelector('#dossier-studio-link')||document.querySelector('.experience-link,.studio-switch');if(switcher){const url=new URL(switcher.href);if(input.value.trim())url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');switcher.href=url.href;}};
  input.addEventListener('input',filter);year.addEventListener('change',filter);filter();
  scope.querySelectorAll('.logo-project').forEach(link=>link.addEventListener('click',()=>{if(document.documentElement.dataset.experience==='tactical')return;const url=new URL(link.href);if(input.value.trim())url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');link.href=url.href;}));
 });}
 window.PortfolioLogoSearch={init,queryFrom};init();
})();
