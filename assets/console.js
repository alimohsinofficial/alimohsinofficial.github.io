/* Native portfolio console. No framework or build dependencies. */
(() => {
  const P = window.Portfolio;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    dashboard:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    notebook:'<path d="M6 3h14v18H6zM3 6h5M3 11h5M3 16h5M11 7h5M11 11h5M11 15h3"/>',
    layers:'<path d="m12 3 10 6-10 6L2 9zM2 14l10 6 10-6M2 18l10 6 10-6"/>',
    person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    file:'<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8"/>',
    orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(35 12 12)"/>',
    signal:'<circle cx="12" cy="12" r="2"/><path d="M6 6a8 8 0 0 0 0 12M18 6a8 8 0 0 1 0 12M3 3a13 13 0 0 0 0 18M21 3a13 13 0 0 1 0 18"/>',
    arrow:'<path d="M5 19 19 5M5 5h14v14"/>',
    home:'<path d="m3 11 9-8 9 8v10H3zM9 21v-8h6v8"/>',
    plus:'<path d="M12 4v16M4 12h16"/>',
    minus:'<path d="M4 12h16"/>',
    target:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${paths[name] || paths.target}</svg>`;
  const frameTitle = (code, text, extra='') => `<div class="instrument-heading"><span><b>${code}</b> ${text}</span>${extra || '<span class="frame-mark">⌖</span>'}</div>`;
  const route = () => document.body.getAttribute('page') || 'overview';
  const readableText = element => {
    if(!element)return '';
    const copy=element.cloneNode(true);
    copy.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
    return copy.textContent.replace(/\s+/g,' ').trim();
  };

  function readerBlocks(page) {
    const main=document.getElementById('main');const blocks=[];
    const add=(tag,text)=>{if(!text?.trim())return;const el=document.createElement(tag);el.textContent=text.trim();blocks.push(el);};
    const clone=el=>{if(!el)return;const copy=el.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));blocks.push(copy);};
    if(page==='article') {
      main.querySelectorAll('.article-body > *').forEach(clone);
    } else if(page==='project') {
      main.querySelectorAll('.case-body > *').forEach(el=>{
        if(el.matches('.metrics')){add('h3','Reported outcomes');el.querySelectorAll('.metric').forEach(m=>add('p',m.textContent));}
        else clone(el);
      });
    } else if(page==='resume') {
      add('h2','Profile');clone(main.querySelector('.resume-summary p'));
      add('h2','Experience');
      main.querySelectorAll('.career-row').forEach(el=>{add('h3',el.querySelector('.period').textContent+' / '+el.querySelector('h3').textContent);el.querySelectorAll('p,li').forEach(n=>add('p',n.textContent));});
      add('h2','Skills');
      main.querySelectorAll('x-accordion details').forEach(el=>{add('h3',el.querySelector('summary').textContent);add('p',[...el.querySelectorAll('.tags span')].map(n=>n.textContent).join(' · '));});
      add('h2','Education');main.querySelectorAll('.education-row').forEach(el=>add('p',el.textContent));
      add('h2','Publications');main.querySelectorAll('.research-row').forEach(el=>{clone(el.querySelector('h3'));clone(el.querySelector('.text-link'));});
      add('h2','Achievements');main.querySelectorAll('.achievement-list li').forEach(el=>add('p',el.textContent));
      const language=main.querySelector('.achievement-list')?.parentElement.querySelector('h3 + p');if(language)add('p',language.textContent);
    } else if(page==='blog') {
      P.articles.forEach(p=>{const el=document.createElement('a');el.className='reader-record';el.href=P.url(p.path);el.innerHTML=`<small>${escape(p.category)} / ${escape(p.date)}</small><h2>${escape(p.title)}</h2><p>${escape(p.kind)} · Open note ↗</p>`;blocks.push(el);});
      add('h3','Writing focus');add('p','AI and machine learning, agent-assisted software development, deep-tech research, and the process of building.');
      const feed=document.createElement('a');feed.href=P.url('/feed.xml');feed.textContent='Subscribe via RSS ↗';blocks.push(feed);
    } else if(page==='projects') {
      P.projects.forEach(p=>{const el=document.createElement('a');el.className='reader-record';el.href=P.url(p.path);el.innerHTML=`<small>${escape(p.category)}</small><h2>${escape(p.title)}</h2><p>${escape(p.text)}</p><span>${escape(p.value)} / ${escape(p.label)} · Open dossier ↗</span>`;blocks.push(el);});
    } else if(page==='research') {
      main.querySelectorAll('.research-row').forEach(el=>{clone(el.querySelector('.eyebrow'));clone(el.querySelector('h3'));el.querySelectorAll('p:not(.eyebrow),a').forEach(clone);});
    } else if(page==='about') {
      main.querySelectorAll('.about-full h2,.about-full p').forEach(clone);
      add('h2','Capabilities');main.querySelectorAll('.service-card').forEach(el=>{clone(el.querySelector('h3'));clone(el.querySelector('p'));});
      main.querySelectorAll('x-accordion details').forEach(el=>{add('h3',el.querySelector('summary').textContent);add('p',[...el.querySelectorAll('.tags span')].map(n=>n.textContent).join(' · '));});
    } else if(page==='contact') {
      add('h2','Start a conversation');add('p','Engineering, research collaboration, or turning an idea into a working system.');
      main.querySelectorAll('.email-link,.social-link').forEach(clone);add('p','Dhaka, Bangladesh · UTC +06:00');
    } else { main.querySelectorAll('h1,p,a.button').forEach(clone); }
    return blocks;
  }

  class PortfolioConsole extends HTMLElement {
    connectedCallback() {
      if(this.ready)return;this.ready=true;this.currentPage=0;this.zoom=1;
      const page=route();const navPage=['article'].includes(page)?'blog':page==='project'?'projects':page;
      const isOverview=page==='overview';
      const title=readableText(document.querySelector('#main h1')) || 'Portfolio';
      this.innerHTML=window.PortfolioHudLayout({P,page,title,icon,escape,frameTitle});
      if(!isOverview)this.querySelector('x-location-map').inert=true;
      this.addEventListener('click',event=>{
        const button=event.target.closest('button[command]');if(!button)return;
        const command=button.getAttribute('command');
        if(command==='next-page')this.showPage(this.currentPage+1);
        if(command==='previous-page')this.showPage(this.currentPage-1);
        if(command==='toggle-focus'){
          const active=this.classList.toggle('focus-view');button.setAttribute('aria-pressed',String(active));
        }
      });
      if(page==='article'){
        const byline=document.querySelector('.article-byline');
        if(byline){const meta=document.createElement('p');meta.className='reader-meta';meta.textContent=[...byline.children].map(readableText).join(' / ');this.querySelector('.reader-heading').append(meta);}
      }
      if(!isOverview){this.blocks=readerBlocks(page);this.resizeObserver=new ResizeObserver(()=>this.paginate());this.resizeObserver.observe(this.querySelector('.reader-content'));}
      this.tick();this.timer=setInterval(()=>this.tick(),1000);
    }
    tick(){
      const now=new Date();
      const local=this.querySelector('.hud-local-clock');
      if(local)local.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
      const date=this.querySelector('.hud-local-date');
      if(date)date.textContent=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(now).toUpperCase();
      const dhaka=this.querySelector('.console-clock');
      if(dhaka)dhaka.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
      const rotations={'.clock-hour':(now.getHours()%12)*30+now.getMinutes()/2,'.clock-minute':now.getMinutes()*6+now.getSeconds()/10,'.clock-second':now.getSeconds()*6};
      Object.entries(rotations).forEach(([selector,angle])=>this.querySelector(selector)?.setAttribute('transform',`rotate(${angle} 50 50)`));
    }
    disconnectedCallback(){clearInterval(this.timer);this.resizeObserver?.disconnect();}
    paginate(){
      const area=this.querySelector('.reader-content');if(!area||area.clientHeight<50)return;
      const previous=this.currentPage;this.pages=[[]];area.replaceChildren();
      const queue=this.blocks.map(el=>el.cloneNode(true));
      let current=this.pages[0];
      while(queue.length){
        const el=queue.shift();area.append(el);
        if(area.scrollHeight>area.clientHeight+1){
          el.remove();
          if(current.length){current=[];this.pages.push(current);area.replaceChildren();queue.unshift(el);continue;}
          // Break long paragraphs and lists into readable pages, without losing content.
          if(el.matches('p,li,ul,pre')){
            if(el.matches('ul')){queue.unshift(...[...el.children].map(n=>{const p=document.createElement('p');p.textContent='• '+n.textContent;return p;}));continue;}
            const words=el.textContent.split(/\s+/);
            if(words.length>12){const mid=Math.ceil(words.length/2);const a=document.createElement('p'),b=document.createElement('p');a.textContent=words.slice(0,mid).join(' ');b.textContent=words.slice(mid).join(' ');queue.unshift(a,b);continue;}
          }
          // Small viewports get a compact block presentation, never page scrolling.
          el.classList.add('compact-record');area.append(el);
        }
        current.push(el.cloneNode(true));
      }
      this.showPage(Math.min(previous,this.pages.length-1),false);
    }
    showPage(index,focus=true){
      if(!this.pages||index<0||index>=this.pages.length)return;
      this.currentPage=index;
      const area=this.querySelector('.reader-content');area.replaceChildren(...this.pages[index].map(el=>el.cloneNode(true)));
      this.querySelector('.reader-page-count').textContent=`PAGE ${String(index+1).padStart(2,'0')} / ${String(this.pages.length).padStart(2,'0')}`;
      this.querySelector('[command="previous-page"]').disabled=index===0;
      this.querySelector('[command="next-page"]').disabled=index===this.pages.length-1;
      if(focus)area.focus({preventScroll:true});
    }
  }
  customElements.define('x-portfolio-console',PortfolioConsole);
})();
