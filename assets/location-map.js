/* Native Canvas 3D relief map. Local coastline data; no WebGL library or map service. */
(() => {
  const rad = angle => angle * Math.PI / 180;
  const owner = { latitude:23.8103, longitude:90.4125, label:'MOHSIN / DHAKA' };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  class LocationMap extends HTMLElement {
    connectedCallback() {
      if(this.ready)return;this.ready=true;
      this.camera={angle:-12,tilt:49,zoom:1,panX:0,panY:0};
      this.innerHTML=`<canvas aria-label="Interactive 3D world map with Mohsin Ali in Dhaka and your location when available"></canvas><div class="map-readout"><span>GEOGRAPHIC MAP / 3D</span><span class="map-heading">HEADING −12° / TILT 49°</span></div><div class="map-legend"><span><i class="owner-key"></i> MOHSIN / DHAKA</span><span><i class="visitor-key"></i> YOU / <b class="visitor-map-state">NOT LOCATED</b></span></div><div class="geo-map-controls"><button type="button" command="map-minus" aria-label="Zoom geographic map out">−</button><span class="map-zoom">1.0×</span><button type="button" command="map-plus" aria-label="Zoom geographic map in">+</button><button type="button" command="map-rotate" aria-label="Rotate geographic map">↻</button><button type="button" command="map-tilt" aria-label="Toggle flat and 3D map">3D</button><button type="button" command="map-fit" aria-label="Fit owner and visitor markers">FIT</button></div><div class="map-geography-credit">NATURAL EARTH / LOCAL COASTLINES · DRAG TO PAN</div><div class="map-owner-label" role="note"></div><div class="map-visitor-label" role="note" hidden></div>`;
      this.canvas=this.querySelector('canvas');this.context=this.canvas.getContext('2d');
      this.ownerLabel=this.querySelector('.map-owner-label');this.visitorLabel=this.querySelector('.map-visitor-label');
      this.ownerLabel.innerHTML='<small>01 / OWNER</small><b>MOHSIN ALI</b><span>DHAKA, BANGLADESH</span><em>23.8103° N / 90.4125° E</em>';
      this.addEventListener('click',event=>{
        const button=event.target.closest('button[command]');if(!button)return;
        switch(button.getAttribute('command')){
          case 'map-minus':this.camera.zoom=clamp(this.camera.zoom-.2,.6,2.4);break;
          case 'map-plus':this.camera.zoom=clamp(this.camera.zoom+.2,.6,2.4);break;
          case 'map-rotate':this.camera.angle=(this.camera.angle+15)%360;break;
          case 'map-tilt':this.camera.tilt=this.camera.tilt>0?0:49;button.textContent=this.camera.tilt?'3D':'2D';break;
          case 'map-fit':this.camera={angle:-12,tilt:49,zoom:1,panX:0,panY:0};this.querySelector('[command="map-tilt"]').textContent='3D';break;
        }
        this.draw();
      });
      this.canvas.addEventListener('pointerdown',event=>{this.drag={x:event.clientX,y:event.clientY,panX:this.camera.panX,panY:this.camera.panY};this.canvas.setPointerCapture(event.pointerId);this.canvas.classList.add('dragging');});
      this.canvas.addEventListener('pointermove',event=>{if(!this.drag)return;this.camera.panX=clamp(this.drag.panX+event.clientX-this.drag.x,-this.width*.4,this.width*.4);this.camera.panY=clamp(this.drag.panY+event.clientY-this.drag.y,-this.height*.35,this.height*.35);this.draw();});
      const end=()=>{this.drag=null;this.canvas.classList.remove('dragging');};this.canvas.addEventListener('pointerup',end);this.canvas.addEventListener('pointercancel',end);
      this.onVisitor=event=>this.setVisitor(event.detail);document.addEventListener('portfolio:visitor-location',this.onVisitor);
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this);
      this.themeObserver=new MutationObserver(()=>this.draw());this.themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['theme','mode']});
      this.resize();
    }
    disconnectedCallback(){this.resizeObserver?.disconnect();this.themeObserver?.disconnect();document.removeEventListener('portfolio:visitor-location',this.onVisitor);}
    setVisitor(info){
      if(info?.unavailable){this.visitor=null;this.visitorLabel.hidden=true;this.querySelector('.visitor-map-state').textContent='NOT LOCATED';this.draw();return;}
      if(!Number.isFinite(info?.latitude)||!Number.isFinite(info?.longitude)||Math.abs(info.latitude)>90||Math.abs(info.longitude)>180)return;
      this.visitor={...info,label:'YOU / '+(info.city||'DEVICE LOCATION')};
      this.visitorLabel.replaceChildren();
      [['small','02 / VISITOR'],['b','YOUR LOCATION'],['span',info.city||'DEVICE LOCATION'],['em',info.source==='device'?'DEVICE · ± '+Math.round(info.accuracy||0)+' m':'IP ESTIMATE · APPROXIMATE']].forEach(([tag,text])=>{const el=document.createElement(tag);el.textContent=text;this.visitorLabel.append(el);});
      this.visitorLabel.hidden=false;
      this.querySelector('.visitor-map-state').textContent=info.source==='device'?'DEVICE':'IP ESTIMATE';
      this.draw();
    }
    resize(){const box=this.getBoundingClientRect();if(box.width<1||box.height<1)return;this.width=box.width;this.height=box.height;this.camera.panX=clamp(this.camera.panX,-this.width*.4,this.width*.4);this.camera.panY=clamp(this.camera.panY,-this.height*.35,this.height*.35);const ratio=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(box.width*ratio);this.canvas.height=Math.round(box.height*ratio);this.context.setTransform(ratio,0,0,ratio,0,0);this.draw();}
    point(longitude,latitude,altitude=0){
      const x=longitude*2.5,y=-latitude*2.5;
      const a=rad(this.camera.angle),t=rad(this.camera.tilt);
      const u=x*Math.cos(a)-y*Math.sin(a),v=x*Math.sin(a)+y*Math.cos(a);
      const depth=v*Math.sin(t)+altitude*Math.cos(t);
      const perspective=1050/(1050+depth);
      return {x:this.width*.5+this.camera.panX+u*this.scale*perspective,y:this.height*.53+this.camera.panY+(v*Math.cos(t)-altitude*Math.sin(t))*this.scale*perspective};
    }
    polygon(ring,altitude){const ctx=this.context;ctx.beginPath();ring.forEach(([lng,lat],index)=>{const p=this.point(lng,lat,altitude);if(index)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();}
    line(points,altitude){const ctx=this.context;ctx.beginPath();points.forEach(([lng,lat],i)=>{const p=this.point(lng,lat,altitude);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.stroke();}
    draw(){
      if(!this.width||!this.context||document.documentElement.getAttribute('mode')!=='tactical')return;
      const ctx=this.context,w=this.width,h=this.height;ctx.clearRect(0,0,w,h);
      const light=document.documentElement.getAttribute('theme')==='light';
      const ink=light?'#57666e':'#91a1a5',amber=light?'#986e13':'#dcb653',visitorColor=light?'#397775':'#91c6bd';
      this.scale=Math.min(w/1070,h/540)*this.camera.zoom;
      // A perspective base plane, latitude/longitude grid, and elevated land surfaces.
      const board=[[-180,90],[180,90],[180,-90],[-180,-90],[-180,90]];
      this.polygon(board,-13);ctx.fillStyle=light?'#d1dadb':'#182225';ctx.fill();ctx.strokeStyle=light?'#a7b7bc':'#35464a';ctx.lineWidth=.7;ctx.stroke();
      ctx.strokeStyle=light?'#afbdc2':'#334348';ctx.lineWidth=.5;
      for(let lng=-180;lng<=180;lng+=30)this.line([[lng,-90],[lng,90]],-12);
      for(let lat=-90;lat<=90;lat+=30)this.line([[-180,lat],[180,lat]],-12);
      ctx.fillStyle=light?'#83999e':'#61777d';
      for(let lng=-170;lng<=170;lng+=10)for(let lat=-80;lat<=80;lat+=10){const p=this.point(lng,lat,-12);ctx.fillRect(p.x,p.y,.8,.8);}
      const rings=window.WorldLandRings||[];
      for(const ring of rings){
        this.polygon(ring,0);ctx.fillStyle=light?'#8b9fa3':'#3a4a4e';ctx.fill();
        this.polygon(ring,15);ctx.fillStyle=light?'#e8eceb':'#849195';ctx.fill();ctx.strokeStyle=light?'#9baeb4':'#b1bcbd';ctx.lineWidth=.5;ctx.stroke();
        // Dim contour lines offset in depth make the coastline relief legible.
        this.polygon(ring,7);ctx.strokeStyle=light?'#b9c8ca':'#586b70';ctx.lineWidth=.45;ctx.stroke();
      }
      ctx.strokeStyle=light?'#66828855':'#5e797d66';ctx.lineWidth=.5;
      for(let lng=-180;lng<=180;lng+=60)this.line([[lng,-85],[lng,85]],16);
      for(let lat=-60;lat<=60;lat+=30)this.line([[-180,lat],[180,lat]],16);
      if(this.visitor){
        ctx.strokeStyle=amber;ctx.lineWidth=1.2;ctx.setLineDash([3,5]);ctx.beginPath();
        for(let i=0;i<=64;i++){const t=i/64,lng=owner.longitude+(this.visitor.longitude-owner.longitude)*t,lat=owner.latitude+(this.visitor.latitude-owner.latitude)*t,alt=22+Math.sin(t*Math.PI)*100;const p=this.point(lng,lat,alt);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);}ctx.stroke();ctx.setLineDash([]);
      }
      this.drawPin(owner,amber,this.ownerLabel,light);
      if(this.visitor)this.drawPin(this.visitor,visitorColor,this.visitorLabel,light);
      else{ctx.font='9px Consolas,monospace';ctx.fillStyle=ink;ctx.textAlign='left';ctx.fillText('VISITOR POSITION / AWAITING LOCATION',18,h-63);}
      this.querySelector('.map-heading').textContent=`HEADING ${this.camera.angle}° / TILT ${this.camera.tilt}°`;
      this.querySelector('.map-readout>span:first-child').textContent='GEOGRAPHIC MAP / '+(this.camera.tilt?'3D':'2D');
      this.querySelector('.map-zoom').textContent=this.camera.zoom.toFixed(1)+'×';
    }
    drawPin(location,color,label,light){
      const ctx=this.context,ground=this.point(location.longitude,location.latitude,17),top=this.point(location.longitude,location.latitude,100);
      const nearby=this.visitor&&Math.abs(owner.longitude-this.visitor.longitude)<10&&Math.abs(owner.latitude-this.visitor.latitude)<10;
      const offset=location===owner&&nearby? -20 : 0;
      top.x+=offset;
      ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(ground.x,ground.y,10,5,rad(this.camera.angle),0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(ground.x,ground.y,18,9,rad(this.camera.angle),0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(ground.x,ground.y);ctx.lineTo(top.x,top.y);ctx.stroke();
      ctx.fillStyle=light?'#f5f7f3':'#151d20';ctx.beginPath();ctx.arc(top.x,top.y,7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.beginPath();ctx.arc(top.x,top.y,3,0,Math.PI*2);ctx.fill();
      const labelX=location===owner&&nearby?top.x-167:top.x+15;
      const labelY=nearby?(location===owner?top.y-100:top.y+15):top.y-48;
      const x=clamp(labelX,12,this.width-163),y=clamp(labelY,35,this.height-120);
      label.style.left=x+'px';label.style.top=y+'px';
    }
  }
  customElements.define('x-location-map',LocationMap);
})();
