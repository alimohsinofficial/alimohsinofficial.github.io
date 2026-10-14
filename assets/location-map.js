/* Custom orthographic globe: spherical coordinates, hemisphere clipping, native canvas. */
(() => {
  const rad=Math.PI/180,owner={latitude:23.8103,longitude:90.4125};
  const vector=([lon,lat])=>{lon*=rad;lat*=rad;return [Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)];};
  const contours=(window.PortfolioWorldContours||[]).map(ring=>ring.map(vector));
  class LocationGlobe extends HTMLElement {
    connectedCallback(){
      if(this.ready)return;this.ready=true;this.lon=owner.longitude;this.lat=owner.latitude;
      this.innerHTML='<div class="globe-chart"><canvas tabindex="0" role="img" aria-label="Globe centred on Dhaka. Drag or use arrow keys to rotate."></canvas></div><div class="globe-position">DHAKA / 23.8103° N · 90.4125° E</div><div class="globe-legend"><span>● DHAKA</span><span class="visitor-globe-state">● VISITOR / UNKNOWN</span></div><div class="globe-actions"><button type="button" data-location="owner">DHAKA</button><button type="button" data-location="visitor" disabled>VISITOR</button><small>DRAG / ARROW KEYS</small></div>';
      this.canvas=this.querySelector('canvas');this.ctx=this.canvas.getContext('2d');
      this.onVisitor=e=>this.setVisitor(e.detail);document.addEventListener('portfolio:visitor-location',this.onVisitor);
      this.addEventListener('click',e=>{const b=e.target.closest('[data-location]');if(!b)return;const p=b.dataset.location==='visitor'?this.visitor:owner;if(p){this.lon=p.longitude;this.lat=p.latitude;this.draw();}});
      this.canvas.addEventListener('pointerdown',e=>{this.drag=[e.clientX,e.clientY];this.canvas.setPointerCapture(e.pointerId);});
      this.canvas.addEventListener('pointermove',e=>{if(!this.drag)return;this.lon-=(e.clientX-this.drag[0])*.45;this.lat=Math.max(-85,Math.min(85,this.lat+(e.clientY-this.drag[1])*.45));this.drag=[e.clientX,e.clientY];this.draw();});
      for(const event of ['pointerup','pointercancel','lostpointercapture'])this.canvas.addEventListener(event,()=>this.drag=null);
      this.canvas.addEventListener('keydown',e=>{const moves={ArrowLeft:[-6,0],ArrowRight:[6,0],ArrowUp:[0,6],ArrowDown:[0,-6]};if(!moves[e.key])return;e.preventDefault();this.lon+=moves[e.key][0];this.lat=Math.max(-85,Math.min(85,this.lat+moves[e.key][1]));this.draw();});
      this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(this.querySelector('.globe-chart'));
      this.theme=new MutationObserver(()=>this.draw());this.theme.observe(document.documentElement,{attributes:true,attributeFilter:['theme']});this.draw();
    }
    project(v){const lon=this.lon*rad,lat=this.lat*rad,x=v[0]*Math.cos(lon)-v[2]*Math.sin(lon),z=v[0]*Math.sin(lon)+v[2]*Math.cos(lon);return [x,v[1]*Math.cos(lat)-z*Math.sin(lat),v[1]*Math.sin(lat)+z*Math.cos(lat)];}
    draw(){
      if(!this.ctx)return;const box=this.canvas.parentElement.getBoundingClientRect(),w=box.width,h=box.height;if(w<1||h<1)return;
      const dpr=Math.min(devicePixelRatio||1,1.5);if(this.canvas.width!==Math.round(w*dpr)||this.canvas.height!==Math.round(h*dpr)){this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);}
      const c=this.ctx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);const cx=w/2,cy=h/2,r=Math.min(w,h)*.46,light=document.documentElement.getAttribute('theme')==='light';
      const ocean=c.createRadialGradient(cx-r*.3,cy-r*.35,r*.1,cx,cy,r);ocean.addColorStop(0,light?'#dbeaf0':'#1d3b4a');ocean.addColorStop(1,light?'#6b91a6':'#071822');
      c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fillStyle=ocean;c.fill();c.save();c.clip();
      for(const ring of contours){
        const points=ring.map(v=>this.project(v)),clipped=[];
        for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(a[2]>=0)clipped.push(a);if((a[2]>=0)!==(b[2]>=0)){const t=a[2]/(a[2]-b[2]);clipped.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,0]);}}
        if(clipped.length<3)continue;c.beginPath();clipped.forEach((p,i)=>c[i?'lineTo':'moveTo'](cx+p[0]*r,cy-p[1]*r));c.closePath();c.fillStyle=light?'#7497a9':'#3e6477';c.fill();c.strokeStyle=light?'#c8dce4':'#122c39';c.lineWidth=.5;c.stroke();
      }
      c.strokeStyle=light?'rgba(35,65,80,.22)':'rgba(151,193,211,.2)';c.lineWidth=.5;
      const line=points=>{c.beginPath();let pen=false;for(const v of points){const p=this.project(vector(v));if(p[2]<0){pen=false;continue;}c[pen?'lineTo':'moveTo'](cx+p[0]*r,cy-p[1]*r);pen=true;}c.stroke();};
      for(let lat=-60;lat<=60;lat+=30)line(Array.from({length:181},(_,i)=>[-180+i*2,lat]));
      for(let lon=-180;lon<180;lon+=30)line(Array.from({length:91},(_,i)=>[lon,-90+i*2]));
      const marker=(p,color)=>{const v=this.project(vector([p.longitude,p.latitude]));if(v[2]<0)return;const x=cx+v[0]*r,y=cy-v[1]*r;c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=1;c.stroke();c.beginPath();c.arc(x,y,3.5,0,Math.PI*2);c.fillStyle=color;c.fill();};
      marker(owner,'#e9b94c');if(this.visitor)marker(this.visitor,'#b58ae8');c.restore();c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.strokeStyle=light?'#688699':'#537c90';c.lineWidth=1;c.stroke();
    }
    setVisitor(info){if(info?.unavailable)this.visitor=null;else if(Number.isFinite(info?.latitude)&&Number.isFinite(info?.longitude)&&Math.abs(info.latitude)<=90&&Math.abs(info.longitude)<=180)this.visitor=info;else return;this.querySelector('.visitor-globe-state').textContent=this.visitor?'● VISITOR / '+(this.visitor.source==='device'?'DEVICE':'IP ESTIMATE'):'● VISITOR / UNKNOWN';this.querySelector('[data-location="visitor"]').disabled=!this.visitor;this.draw();}
    disconnectedCallback(){this.resize?.disconnect();this.theme?.disconnect();document.removeEventListener('portfolio:visitor-location',this.onVisitor);this.ready=false;}
  }
  customElements.define('x-location-map',LocationGlobe);
})();
