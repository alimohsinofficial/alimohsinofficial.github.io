/* Local Three.js + PixiJS visual enhancements. Content never depends on WebGL. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine)');
  const base=new URL('.',document.currentScript.src),libraries={};
  const enabled=()=>!motion.matches&&(window.PortfolioMotion?.enabled??true);
  const lowPower=()=>!fine.matches||navigator.connection?.saveData||navigator.deviceMemory<=4;
  const load=kind=>libraries[kind]||=(async()=>{for(const file of kind==='three'?['vendor/three/three.min.js']:['vendor/pixi/pixi.min.js','vendor/pixi/unsafe-eval.min.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(file,base).href;script.onload=resolve;script.onerror=reject;document.head.append(script);});})();
  const scenes=new Map(),pending=new Set(),observed=new Set();let frame=0,last=0;
  const rgb=(name,host)=>getComputedStyle(host||document.documentElement).getPropertyValue(name).trim();
  const palette=host=>({accent:rgb('--accent',host)||'#a44d36',ink:rgb('--ink',host)||'#263440',muted:rgb('--muted',host)||'#5c6b77'});
  const dossier=document.getElementById('dossier-modal');
  const active=s=>s.visible&&!document.hidden&&!s.lost&&!dossier?.open;
  const awake=()=>{if(!frame)frame=requestAnimationFrame(tick);};
  function tick(now){frame=0;if(now-last<32){awake();return;}last=now;let moving=false;
    for(const [host,s] of scenes){if(!host.isConnected){dispose(host);continue;}if(active(s)){s.draw(now/1000,enabled());moving=true;}}
    if(moving&&enabled())awake();
  }
  function dispose(host){const s=scenes.get(host);if(!s)return;s.destroy();scenes.delete(host);host.classList.remove('visual-ready');}
  function watchCanvas(host,canvas,state){canvas.setAttribute('aria-hidden','true');canvas.setAttribute('role','presentation');canvas.addEventListener('webglcontextlost',()=>{state.lost=true;host.classList.remove('visual-ready');});}
  function pointer(host,state){const area=host.closest('section,.hud-visual-stage')||host;
    const move=e=>{if(!fine.matches||!enabled())return;const r=area.getBoundingClientRect();state.pointer.x=(e.clientX-r.left)/r.width*2-1;state.pointer.y=(e.clientY-r.top)/r.height*2-1;awake();};
    const reset=()=>{state.pointer.x=state.pointer.y=0;};area.addEventListener('pointermove',move,{passive:true});area.addEventListener('pointerleave',reset);return()=>{area.removeEventListener('pointermove',move);area.removeEventListener('pointerleave',reset);};
  }
  function threeScene(host){
    if(!window.THREE)throw Error('Three.js unavailable');const T=THREE,type=host.dataset.threeScene,p=palette(host);
    const renderer=new T.WebGLRenderer({alpha:true,antialias:!lowPower(),powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower()?1:1.25));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,40);camera.position.z=6.7;
    const model=new T.Group();scene.add(model);const colored=[];
    scene.add(new T.HemisphereLight(0xe2efff,0x372016,2.3));const key=new T.DirectionalLight(0xffffff,3.5);key.position.set(3,4,4);scene.add(key);const rim=new T.DirectionalLight(0x8cb8ee,2);rim.position.set(-4,-1,3);scene.add(rim);
    const accentMaterial=new T.MeshStandardMaterial({color:p.accent,metalness:.2,roughness:.45});colored.push(accentMaterial);
    const inkMaterial=new T.MeshStandardMaterial({color:p.ink,metalness:.15,roughness:.55});inkMaterial.userData.palette='ink';colored.push(inkMaterial);
    const lineMaterial=new T.LineBasicMaterial({color:p.accent,transparent:true,opacity:.5});colored.push(lineMaterial);
    const connect=(a,b)=>model.add(new T.Line(new T.BufferGeometry().setFromPoints([a,b]),lineMaterial));
    if(type==='correction'){
      // Data nodes plus redundant checks: an explanatory concept, not a claimed device layout.
      const data=[];
      for(let z=0;z<3;z++)for(let x=0;x<3;x++){const node=new T.Mesh(new T.SphereGeometry(.09,12,8),inkMaterial);node.position.set((x-1)*.8,0,(z-1)*.8);model.add(node);data.push(node.position);}
      for(let z=0;z<2;z++)for(let x=0;x<2;x++){const check=new T.Mesh(new T.OctahedronGeometry(.12),accentMaterial);check.position.set((x-.5)*.8,.32,(z-.5)*.8);model.add(check);[z*3+x,z*3+x+1,(z+1)*3+x,(z+1)*3+x+1].forEach(i=>connect(check.position,data[i]));}
      model.rotation.x=.55;
    }else{
      // A data-to-product stack fits the owner's sensing, ML and software-delivery work.
      for(let layer=0;layer<3;layer++){
        const plate=new T.Mesh(new T.BoxGeometry(1.8,.12,1.05),layer===1?accentMaterial:inkMaterial);plate.position.y=(layer-1)*.6;model.add(plate);
        for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++){const node=new T.Mesh(new T.BoxGeometry(.1,.09,.1),accentMaterial);node.position.set(x*.55,plate.position.y+.11,z*.3);model.add(node);}
        if(layer<2)for(const x of [-.7,.7])connect(new T.Vector3(x,plate.position.y,0),new T.Vector3(x,plate.position.y+.6,0));
      }
      model.rotation.x=.35;
    }
    const state={visible:true,pointer:{x:0,y:0},lost:false,draw(time,moving){const progress=host.sceneProgress||0;const x=(type==='correction'?.8:.4)+this.pointer.y*.18+progress*.22,y=this.pointer.x*.32-.35;model.rotation.x+=(x-model.rotation.x)*.045;model.rotation.y+=(y-model.rotation.y)*.045;model.position.y=moving?Math.sin(time*.6)*.025:0;renderer.render(scene,camera);},paint(){const c=palette(host);colored.forEach(m=>m.color.set(c[m.userData.palette||'accent']));this.draw(0,false);},destroy(){resize.disconnect();unpointer();scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();}};
    const unpointer=pointer(host,state),resize=new ResizeObserver(()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=5.7/Math.min(1,camera.aspect);camera.updateProjectionMatrix();state.draw(0,false);awake();});resize.observe(host);host.append(renderer.domElement);watchCanvas(host,renderer.domElement,state);host.classList.add('visual-ready');return state;
  }
  async function pixiScene(host){
    if(!window.PIXI)throw Error('PixiJS unavailable');const app=new PIXI.Application();await app.init({backgroundAlpha:0,antialias:true,preference:'webgl',autoStart:false,resolution:Math.min(devicePixelRatio,lowPower()?1:1.25),autoDensity:true,resizeTo:host});
    if(!host.isConnected){app.destroy(true,{children:true});throw Error('Detached scene');}
    const graphics=new PIXI.Graphics();app.stage.addChild(graphics);const type=host.dataset.pixiScene;
    const color=value=>parseInt(value.replace('#',''),16);let colors=palette(host);
    const state={visible:true,pointer:{x:0,y:0},lost:false,draw(time,moving){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const t=(moving?time:0)+(host.sceneProgress||0)*5,accent=color(colors.accent),ink=color(colors.ink);graphics.clear();
      if(type==='acoustic'){
        for(let row=0;row<5;row++){for(let i=0;i<=48;i++){const x=i/48*w,envelope=Math.sin(i/48*Math.PI),y=h*(.25+row*.08)+Math.sin(i*.18-t*1.3+row*.5)*(15+row*2)*envelope+this.pointer.y*10*envelope;if(i===0)graphics.moveTo(x,y);else graphics.lineTo(x,y);}graphics.stroke({width:row===3?2:1,color:row===3?accent:ink,alpha:row===3?.8:.22});}
        for(let i=0;i<36;i++){const x=((i*.618*w+t*12)%w+w)%w,y=h*(.15+.7*((i*.381)%1));graphics.circle(x,y,i%7===0?2:1).fill({color:accent,alpha:.25});}
      }
      app.renderer.render(app.stage);
    },paint(){colors=palette(host);this.draw(0,false);},destroy(){resize.disconnect();unpointer();app.destroy(true,{children:true});}};
    const unpointer=pointer(host,state),resize=new ResizeObserver(()=>{app.resize();state.draw(0,false);awake();});resize.observe(host);host.append(app.canvas);watchCanvas(host,app.canvas,state);host.classList.add('visual-ready');return state;
  }
  async function ensure(host){
    if(!host._visualInView||!host.isConnected||scenes.has(host)||pending.has(host)||!enabled())return;
    pending.add(host);try{
      await load(host.hasAttribute('data-three-scene')?'three':'pixi');
      if(!host.isConnected||!host._visualInView||!enabled())return;
      const state=host.hasAttribute('data-three-scene')?threeScene(host):await pixiScene(host);
      if(!enabled()||!host.isConnected){state.destroy();host.classList.remove('visual-ready');return;}
      state.visible=host._visualInView;scenes.set(host,state);state.draw(0,enabled());awake();
    }catch{host.classList.remove('visual-ready');host.classList.add('visual-unavailable');}finally{pending.delete(host);}
  }
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){const host=entry.target;host._visualInView=entry.isIntersecting;const state=scenes.get(host);if(state){state.visible=entry.isIntersecting;if(state.visible){state.draw(0,enabled());awake();}}else ensure(host);}},{rootMargin:'0px'});
  function discover(){document.querySelectorAll('[data-three-scene],[data-pixi-scene]').forEach(host=>{if(!host._visualObserved){host._visualObserved=true;observed.add(host);observer.observe(host);}});for(const host of observed)if(!host.isConnected){observer.unobserve(host);observed.delete(host);dispose(host);}}
  new MutationObserver(discover).observe(document.body,{childList:true,subtree:true});new MutationObserver(()=>{scenes.forEach(s=>s.paint());awake();}).observe(document.documentElement,{attributes:true,attributeFilter:['theme']});
  const syncMotion=()=>{if(!enabled()){for(const host of [...scenes.keys()])dispose(host);if(frame)cancelAnimationFrame(frame);frame=0;}else{observed.forEach(ensure);awake();}};motion.addEventListener('change',syncMotion);document.addEventListener('portfolio:motion',syncMotion);if(dossier)new MutationObserver(awake).observe(dossier,{attributes:true,attributeFilter:['open']});document.addEventListener('visibilitychange',awake);window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;});window.addEventListener('pageshow',awake);discover();
})();
