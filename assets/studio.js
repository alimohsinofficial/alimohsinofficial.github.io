/* GSAP is progressive enhancement. No hidden content or required build step. */
(() => {
  if(!document.body.classList.contains('studio-landing'))return;
  const counterText=new Map([...document.querySelectorAll('.intro-facts b')].map(el=>[el,el.textContent]));
  let scrollMotion;
  const setupMotion=()=>{scrollMotion?.revert();counterText.forEach((text,el)=>el.textContent=text);if(window.PortfolioMotion?.enabled===false)return;
  if(window.gsap&&window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  scrollMotion=gsap.matchMedia();scrollMotion.add({desktop:'(min-width: 901px)',mobile:'(max-width: 900px)',motion:'(prefers-reduced-motion: no-preference)'},context=>{
    if(!context.conditions.motion)return;
    ScrollTrigger.defaults({scroller:context.conditions.desktop?'.studio-scroll':window});
    gsap.timeline({defaults:{ease:'power3.out'}})
      .from('.hero-name span',{yPercent:115,rotate:4,duration:1.2,stagger:.12})
      .from('.portrait-sculpture',{opacity:0,duration:1},.15)
      .from('.hero-caption,.hero-bottom',{y:24,opacity:0,duration:.8,stagger:.12},.65);
    document.querySelectorAll('.reveal').forEach(el=>gsap.from(el,{y:35,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',toggleActions:'play none none none'}}));
    document.querySelectorAll('.work-card').forEach(el=>gsap.from(el,{y:45,opacity:0,duration:.8,scrollTrigger:{trigger:el,start:'top 92%'}}));
    gsap.from('.sensor-core',{rotateY:-40,rotateX:20,opacity:0,duration:1,ease:'power2.out',scrollTrigger:{trigger:'.sensor-core',start:'top 90%'}});
    document.querySelectorAll('.intro-facts b').forEach(el=>{const original=el.textContent,target=parseInt(original,10),value={count:0};gsap.to(value,{count:target,duration:1.1,delay:.45,ease:'power2.out',onUpdate:()=>{el.textContent=(original.startsWith('0')?String(Math.round(value.count)).padStart(2,'0'):Math.round(value.count))+(original.includes('+')?'+':'');},onComplete:()=>el.textContent=original});});
    gsap.from('.career-line span',{scaleX:0,transformOrigin:'left',ease:'none',scrollTrigger:{trigger:'.studio-profile-section',start:'top 80%',end:'bottom 55%',scrub:1}});
    // Use plain animation state so CSSPlugin never treats scene progress as CSS.
    const sceneScroll=(selector,trigger,to,start,end)=>{const host=document.querySelector(selector),state={progress:0};if(host)gsap.to(state,{progress:to,ease:'none',onUpdate:()=>host.sceneProgress=state.progress,scrollTrigger:{trigger,start,end,scrub:1}});};
    // Each section has its own scroll choreography; the identity column stays fixed.
    gsap.to('.hero-sculpture',{y:-45,scale:.92,ease:'none',scrollTrigger:{trigger:'#intro',start:'top top',end:'bottom top',scrub:1}});
    sceneScroll('#intro [data-three-scene]','#intro',1,'top top','bottom top');
    gsap.from('.notebook-object',{opacity:0,duration:.8,scrollTrigger:{trigger:'.notebook-object',start:'top 90%'}});
    gsap.fromTo('.notebook-object',{'--page-angle':'-3deg'},{'--page-angle':'0deg',ease:'none',scrollTrigger:{trigger:'#notebook',start:'top 85%',end:'center 45%',scrub:1}});
    gsap.to('.section-glyph',{y:-35,ease:'none',scrollTrigger:{trigger:'#notebook',start:'top bottom',end:'bottom top',scrub:1}});
    document.querySelectorAll('.work-art').forEach(el=>gsap.fromTo(el,{clipPath:'inset(12% 0 12% 0)'},{clipPath:'inset(0% 0 0% 0)',ease:'none',scrollTrigger:{trigger:el,start:'top 88%',end:'center 62%',scrub:.7}}));
    sceneScroll('.sound-art [data-pixi-scene]','.sound-art',1,'top bottom','bottom top');
    gsap.to('.profile-watermark',{y:-110,ease:'none',scrollTrigger:{trigger:'#profile',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.from('.statement-line',{yPercent:60,opacity:.2,stagger:.12,ease:'none',scrollTrigger:{trigger:'.profile-statement',start:'top 85%',end:'bottom 45%',scrub:.7}});
    sceneScroll('.research-orbit [data-three-scene]','#research',1.7,'top bottom','bottom top');
    gsap.from('.studio-research-list a',{x:25,opacity:0,stagger:.16,duration:.8,scrollTrigger:{trigger:'.studio-research-list',start:'top 85%'}});
    gsap.from('.studio-contact>h2 em',{opacity:.3,duration:.9,scrollTrigger:{trigger:'#contact',start:'top 75%'}});
    gsap.to('.scroll-progress' ,{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
  });
  }
  };setupMotion();document.addEventListener('portfolio:motion',setupMotion);
  const pointerEffects=matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
  const interactive=[...document.querySelectorAll('.portrait-sculpture,.notebook-object,.studio-landing .text-link,.studio-landing .pill-link')];
  interactive.forEach(el=>{
    const tilt=el.matches('.portrait-sculpture,.notebook-object');
    el.addEventListener('pointermove',e=>{if(!pointerEffects.matches||window.PortfolioMotion?.enabled===false)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      if(tilt){el.style.setProperty('--tilt-x',(-y*4)+'deg');el.style.setProperty('--tilt-y',(x*5)+'deg');}
      else{el.style.setProperty('--mouse-x',(x*7)+'px');el.style.setProperty('--mouse-y',(y*5)+'px');}
    },{passive:true});
    const reset=()=>{['--tilt-x','--tilt-y','--mouse-x','--mouse-y'].forEach(name=>el.style.removeProperty(name));};
    el.addEventListener('pointerleave',reset);pointerEffects.addEventListener('change',reset);document.addEventListener('portfolio:motion',reset);
  });
  const links=[...document.querySelectorAll('.studio-header nav a[href^="#"],.studio-bottom-nav a[href^="#"]')];
  const views={intro:'overview',notebook:'blog',work:'projects',profile:'about',research:'research',contact:'contact'};
  const setSection=id=>{if(!views[id])return;links.forEach(a=>{if(a.hash==='#'+id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});document.querySelectorAll('a[href*="tactical/"]').forEach(a=>{a.href=a.href.split('#')[0]+'#'+views[id];});};
  const scroller=document.querySelector('.studio-scroll'),sections=[...document.querySelectorAll('main>section[id]')];
  let scheduled=false,intendedSection=null;
  const updateSection=()=>{scheduled=false;if(intendedSection){setSection(intendedSection);return;}const desktop=matchMedia('(min-width:901px)').matches;const height=desktop?scroller.clientHeight:innerHeight;const top=desktop?scroller.getBoundingClientRect().top:68;const threshold=top+Math.min(200,height*.3);let active=sections[0];sections.forEach(el=>{if(el.getBoundingClientRect().top<=threshold)active=el;});const end=desktop?scroller.scrollTop+height>=scroller.scrollHeight-3:scrollY+height>=document.documentElement.scrollHeight-80;if(end)active=sections.at(-1);if(active)setSection(active.id);};
  const track=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateSection);}};
  scroller.addEventListener('scroll',track,{passive:true});window.addEventListener('scroll',track,{passive:true});window.addEventListener('resize',track);
  const selectSection=id=>{if(!views[id])return;intendedSection=id;setSection(id);};
  links.forEach(a=>a.addEventListener('click',()=>selectSection(a.hash.slice(1))));
  const settle=()=>{if(intendedSection){const target=document.getElementById(intendedSection);const top=matchMedia('(min-width:901px)').matches?scroller.getBoundingClientRect().top:68;if(target&&target.getBoundingClientRect().top>top+200)return;}intendedSection=null;updateSection();};scroller.addEventListener('scrollend',settle);window.addEventListener('scrollend',settle);
  scroller.addEventListener('wheel',()=>intendedSection=null,{passive:true});window.addEventListener('touchmove',()=>intendedSection=null,{passive:true});
  window.addEventListener('hashchange',()=>selectSection(location.hash.slice(1)));setSection(location.hash.slice(1)||'intro');
})();
