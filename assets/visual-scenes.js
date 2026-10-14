/* Local Three.js + PixiJS visual enhancements. Content never depends on WebGL. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer: fine)');
  const scenes=new Map(),pending=new Set(),observed=new Set();let frame=0,last=0;
  const rgb=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const palette=()=>({accent:rgb('--accent')||'#a44d36',ink:rgb('--ink')||'#263440',muted:rgb('--muted')||'#5c6b77'});
  const active=s=>s.visible&&!document.hidden&&!s.lost;
  const awake=()=>{if(!frame)frame=requestAnimationFrame(tick);};
  function tick(now){frame=0;if(now-last<32){awake();return;}last=now;let moving=false;
    for(const [host,s] of scenes){if(!host.isConnected){dispose(host);continue;}if(active(s)){s.draw(now/1000,!motion.matches);moving=true;}}
    if(moving&&!motion.matches)awake();
  }
  function dispose(host){const s=scenes.get(host);if(!s)return;s.destroy();scenes.delete(host);host.classList.remove('visual-ready');}
  function watchCanvas(host,canvas,state){canvas.setAttribute('aria-hidden','true');canvas.setAttribute('role','presentation');canvas.addEventListener('webglcontextlost',()=>{state.lost=true;host.classList.remove('visual-ready');});}
  function pointer(host,state){const area=host.closest('section,.hud-visual-stage')||host;
    const move=e=>{if(!fine.matches||motion.matches)return;const r=area.getBoundingClientRect();state.pointer.x=(e.clientX-r.left)/r.width*2-1;state.pointer.y=(e.clientY-r.top)/r.height*2-1;awake();};
    const reset=()=>{state.pointer.x=state.pointer.y=0;};area.addEventListener('pointermove',move,{passive:true});area.addEventListener('pointerleave',reset);return()=>{area.removeEventListener('pointermove',move);area.removeEventListener('pointerleave',reset);};
  }
  function threeScene(host){
    if(!window.THREE)throw Error('Three.js unavailable');const T=THREE,type=host.dataset.threeScene,p=palette();
    const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,40);camera.position.z=6.7;
    const model=new T.Group();scene.add(model);const colored=[];
    scene.add(new T.HemisphereLight(0xe2efff,0x372016,2.3));const key=new T.DirectionalLight(0xffffff,3.5);key.position.set(3,4,4);scene.add(key);const rim=new T.DirectionalLight(0x8cb8ee,2);rim.position.set(-4,-1,3);scene.add(rim);
    if(type==='sculpture'){
      const material=new T.MeshPhysicalMaterial({color:p.accent,metalness:.55,roughness:.22,clearcoat:1,clearcoatRoughness:.2});colored.push(material);
      const knot=new T.Mesh(new T.TorusKnotGeometry(.92,.23,140,20,2,3),material);model.add(knot);
      for(let i=0;i<3;i++){const m=new T.MeshPhysicalMaterial({color:p.ink,metalness:.8,roughness:.22});const satellite=new T.Mesh(new T.SphereGeometry(.09+i*.025,20,12),m);satellite.position.set(Math.cos(i*2.1)*1.65,Math.sin(i*2.1)*1.65,0);model.add(satellite);m.userData.palette='ink';colored.push(m);}
      const orbitMaterial=new T.MeshBasicMaterial({color:p.ink,transparent:true,opacity:.22});orbitMaterial.userData.palette='ink';colored.push(orbitMaterial);const orbit=new T.Mesh(new T.TorusGeometry(1.65,.008,6,120),orbitMaterial);orbit.rotation.x=.9;model.add(orbit);model.rotation.z=.2;
    }else if(type==='orbital'){
      const coreMaterial=new T.MeshPhysicalMaterial({color:p.accent,metalness:.5,roughness:.2});colored.push(coreMaterial);model.add(new T.Mesh(new T.IcosahedronGeometry(.35,1),coreMaterial));
      for(let i=0;i<3;i++){const group=new T.Group();group.rotation.set(.7+i*.7,i*.8,i*.5);const material=new T.MeshBasicMaterial({color:p.accent,transparent:true,opacity:.6});colored.push(material);group.add(new T.Mesh(new T.TorusGeometry(1.45,.008,5,100),material));const electronMaterial=new T.MeshBasicMaterial({color:p.ink});electronMaterial.userData.palette='ink';colored.push(electronMaterial);const electron=new T.Mesh(new T.SphereGeometry(.075,16,10),electronMaterial);electron.position.x=1.45;group.add(electron);group.userData.orbit=i;model.add(group);}
    }else{
      const geometry=new T.IcosahedronGeometry(1.25,1),wireMaterial=new T.LineBasicMaterial({color:p.accent,transparent:true,opacity:.55});colored.push(wireMaterial);model.add(new T.LineSegments(new T.WireframeGeometry(geometry),wireMaterial));
      const vertices=geometry.getAttribute('position'),seen=new Set(),dotsMaterial=new T.MeshBasicMaterial({color:p.accent});colored.push(dotsMaterial);
      for(let i=0;i<vertices.count;i++){const v=new T.Vector3().fromBufferAttribute(vertices,i);const k=v.toArray().map(n=>n.toFixed(3)).join();if(seen.has(k))continue;seen.add(k);const dot=new T.Mesh(new T.SphereGeometry(.025,8,6),dotsMaterial);dot.position.copy(v);model.add(dot);}geometry.dispose();camera.position.z=5.4;
    }
    const state={visible:true,pointer:{x:0,y:0},lost:false,draw(time,moving){const progress=host.sceneProgress||0;const x=this.pointer.y*.22+progress*.45,y=this.pointer.x*.32+(moving?time*.07:0);model.rotation.x+=(x-model.rotation.x)*.045;model.rotation.y+=(y-model.rotation.y)*.045;model.position.y=moving?Math.sin(time*.7)*.06:0;if(type==='orbital'&&moving)model.children.forEach(child=>{if(child.userData.orbit!==undefined)child.rotation.z=time*.16+child.userData.orbit;});renderer.render(scene,camera);},paint(){const c=palette();colored.forEach(m=>m.color.set(c[m.userData.palette||'accent']));this.draw(0,false);},destroy(){resize.disconnect();unpointer();scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();}};
    const unpointer=pointer(host,state),resize=new ResizeObserver(()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=(type==='topology'?5.4:6.7)/Math.min(1,camera.aspect);camera.updateProjectionMatrix();state.draw(0,false);awake();});resize.observe(host);host.append(renderer.domElement);watchCanvas(host,renderer.domElement,state);host.classList.add('visual-ready');return state;
  }
  async function pixiScene(host){
    if(!window.PIXI)throw Error('PixiJS unavailable');const app=new PIXI.Application();await app.init({backgroundAlpha:0,antialias:true,preference:'webgl',autoStart:false,resolution:Math.min(devicePixelRatio,1.5),autoDensity:true,resizeTo:host});
    if(!host.isConnected){app.destroy(true,{children:true});throw Error('Detached scene');}
    const graphics=new PIXI.Graphics();app.stage.addChild(graphics);const type=host.dataset.pixiScene;
    const color=value=>parseInt(value.replace('#',''),16);let colors=palette();
    const state={visible:true,pointer:{x:0,y:0},lost:false,draw(time,moving){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const t=(moving?time:0)+(host.sceneProgress||0)*5,accent=color(colors.accent),ink=color(colors.ink);graphics.clear();
      if(type==='acoustic'){
        for(let row=0;row<7;row++){for(let i=0;i<=80;i++){const x=i/80*w,envelope=Math.sin(i/80*Math.PI),y=h*(.25+row*.08)+Math.sin(i*.18-t*1.3+row*.5)*(15+row*2)*envelope+this.pointer.y*10*envelope;if(i===0)graphics.moveTo(x,y);else graphics.lineTo(x,y);}graphics.stroke({width:row===3?2:1,color:row===3?accent:ink,alpha:row===3?.8:.22});}
        for(let i=0;i<70;i++){const x=((i*.618*w+t*12)%w+w)%w,y=h*(.15+.7*((i*.381)%1));graphics.circle(x,y,i%7===0?2:1).fill({color:accent,alpha:.25});}
      }else if(type==='field'){
        const cx=w*(.5+this.pointer.x*.15),cy=h*(.5+this.pointer.y*.15);
        for(let i=0;i<110;i++){const angle=i*2.399+t*.035,r=Math.sqrt(i/110)*Math.min(w,h)*.7;const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r;graphics.circle(x,y,1.2+(i%9===0?1:0)).fill({color:accent,alpha:.12+(i%5)*.04});if(i%5===0){graphics.moveTo(x-5,y);graphics.lineTo(x+5,y);graphics.moveTo(x,y-5);graphics.lineTo(x,y+5);graphics.stroke({color:ink,width:1,alpha:.1});}}
      }else{
        const cx=w*.5,cy=h*.5,r=Math.min(w,h)*.42;
        for(let i=1;i<=3;i++)graphics.circle(cx,cy,r*i/3).stroke({color:accent,width:1,alpha:.2});graphics.moveTo(cx-r,cy).lineTo(cx+r,cy).moveTo(cx,cy-r).lineTo(cx,cy+r).stroke({color:accent,width:1,alpha:.2});
        const angle=t*.6;graphics.moveTo(cx,cy).lineTo(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r).stroke({color:accent,width:1.5,alpha:.7});
        for(let i=0;i<16;i++){const a=i*2.399,d=r*(.2+((i*.37)%1)*.7);graphics.circle(cx+Math.cos(a)*d,cy+Math.sin(a)*d,1.5).fill({color:accent,alpha:.25+Math.max(0,Math.cos(a-angle))*.55});}
      }
      app.renderer.render(app.stage);
    },paint(){colors=palette();this.draw(0,false);},destroy(){resize.disconnect();unpointer();app.destroy(true,{children:true});}};
    const unpointer=pointer(host,state),resize=new ResizeObserver(()=>{app.resize();state.draw(0,false);awake();});resize.observe(host);host.append(app.canvas);watchCanvas(host,app.canvas,state);host.classList.add('visual-ready');return state;
  }
  const observer=new IntersectionObserver(async entries=>{for(const entry of entries){const host=entry.target;host._visualInView=entry.isIntersecting;const state=scenes.get(host);if(state){state.visible=entry.isIntersecting;if(state.visible){state.draw(0,!motion.matches);awake();}continue;}if(!entry.isIntersecting||pending.has(host))continue;pending.add(host);try{const s=host.hasAttribute('data-three-scene')?threeScene(host):await pixiScene(host);s.visible=host._visualInView;scenes.set(host,s);s.draw(0,!motion.matches);awake();}catch{host.classList.remove('visual-ready');host.classList.add('visual-unavailable');}finally{pending.delete(host);}}},{rootMargin:'80px'});
  function discover(){document.querySelectorAll('[data-three-scene],[data-pixi-scene]').forEach(host=>{if(!host._visualObserved){host._visualObserved=true;observed.add(host);observer.observe(host);}});for(const host of observed)if(!host.isConnected){observer.unobserve(host);observed.delete(host);dispose(host);}}
  new MutationObserver(discover).observe(document.body,{childList:true,subtree:true});new MutationObserver(()=>{scenes.forEach(s=>s.paint());awake();}).observe(document.documentElement,{attributes:true,attributeFilter:['theme']});
  motion.addEventListener('change',()=>{scenes.forEach(s=>s.draw(0,false));awake();});document.addEventListener('visibilitychange',awake);window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);frame=0;});window.addEventListener('pageshow',awake);discover();
})();
