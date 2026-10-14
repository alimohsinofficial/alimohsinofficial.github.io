/* GSAP is progressive enhancement. No hidden content or required build step. */
(() => {
  if(!document.body.classList.contains('studio-landing'))return;
  if(window.gsap&&window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add({desktop:'(min-width: 901px)',mobile:'(max-width: 900px)',motion:'(prefers-reduced-motion: no-preference)'},context=>{
    if(!context.conditions.motion)return;
    ScrollTrigger.defaults({scroller:context.conditions.desktop?'.studio-scroll':window});
    gsap.timeline({defaults:{ease:'power3.out'}})
      .from('.hero-name span',{yPercent:115,rotate:4,duration:1.2,stagger:.12})
      .from('.portrait-sculpture',{opacity:0,duration:1},.15)
      .from('.hero-caption,.hero-bottom',{y:24,opacity:0,duration:.8,stagger:.12},.65);
    document.querySelectorAll('.reveal,.notebook-object').forEach(el=>gsap.from(el,{y:35,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',toggleActions:'play none none none'}}));
    document.querySelectorAll('.work-card').forEach(el=>gsap.from(el,{y:45,opacity:0,duration:.8,scrollTrigger:{trigger:el,start:'top 92%'}}));
    gsap.from('.sound-art i',{scaleY:.05,transformOrigin:'center',stagger:.03,ease:'none',scrollTrigger:{trigger:'.sound-art',start:'top 90%',end:'center 60%',scrub:1}});
    gsap.from('.sensor-core',{rotateY:-40,rotateX:20,opacity:0,duration:1,ease:'power2.out',scrollTrigger:{trigger:'.sensor-core',start:'top 90%'}});
    document.querySelectorAll('.intro-facts b').forEach(el=>{const original=el.textContent,target=parseInt(original,10),value={count:0};gsap.to(value,{count:target,duration:1.1,delay:.45,ease:'power2.out',onUpdate:()=>{el.textContent=(original.startsWith('0')?String(Math.round(value.count)).padStart(2,'0'):Math.round(value.count))+(original.includes('+')?'+':'');},onComplete:()=>el.textContent=original});});
    gsap.from('.career-line span',{scaleX:0,transformOrigin:'left',ease:'none',scrollTrigger:{trigger:'.studio-profile-section',start:'top 80%',end:'bottom 55%',scrub:1}});
    gsap.to('.scroll-progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
  });
  }
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
