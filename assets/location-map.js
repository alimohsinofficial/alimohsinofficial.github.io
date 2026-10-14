/* Small orthographic globe, using locally bundled amCharts classic scripts. */
(() => {
  let libraries;
  const load=()=>libraries||=(async()=>{for(const file of ['index.js','map.js','worldLow.js'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=Portfolio.url('/assets/vendor/amcharts5/'+file);s.onload=resolve;s.onerror=reject;document.head.append(s);});})();
  class LocationGlobe extends HTMLElement {
    connectedCallback(){
      if(this.ready)return;this.ready=true;
      this.innerHTML='<div class="globe-chart" aria-label="Interactive spherical globe. Drag to rotate; hover a country for its name."></div><div class="globe-position">DHAKA / 23.8103° N · 90.4125° E</div><div class="globe-legend"><span>● DHAKA</span><span class="visitor-globe-state">● VISITOR / UNKNOWN</span></div><div class="globe-actions"><button type="button" data-location="owner">DHAKA</button><button type="button" data-location="visitor" disabled>VISITOR</button><small>DRAG TO ROTATE</small></div>';
      this.onVisitor=e=>this.setVisitor(e.detail);document.addEventListener('portfolio:visitor-location',this.onVisitor);
      this.addEventListener('click',e=>{const b=e.target.closest('[data-location]');if(!b||!this.chart)return;const p=b.dataset.location==='visitor'?this.visitor:{latitude:23.8103,longitude:90.4125};if(p){this.drift?.stop();this.chart.setAll({rotationX:-p.longitude,rotationY:-p.latitude});}});
      this.resizeObserver=new ResizeObserver(entries=>{if(entries.some(e=>e.contentRect.width>0&&e.contentRect.height>0))this.open();});this.resizeObserver.observe(this);
      this.themeObserver=new MutationObserver(()=>this.paint());this.themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['theme']});
    }
    async open(){
      if(this.root||this.loading)return;this.loading=true;
      try{
        await load();if(!this.isConnected)return;
        const root=this.root=am5.Root.new(this.querySelector('.globe-chart'));
        const chart=this.chart=root.container.children.push(am5map.MapChart.new(root,{projection:am5map.geoOrthographic(),panX:'rotateX',panY:'rotateY',rotationX:-90.4125,rotationY:-23.8103,homeRotationX:-90.4125,homeRotationY:-23.8103,wheelY:'none',paddingTop:4,paddingBottom:4,paddingLeft:4,paddingRight:4}));
        this.ocean=chart.series.push(am5map.MapPolygonSeries.new(root,{}));this.ocean.data.push({geometry:am5map.getGeoRectangle(90,180,-90,-180)});
        this.land=chart.series.push(am5map.MapPolygonSeries.new(root,{geoJSON:am5geodata_worldLow}));this.land.mapPolygons.template.setAll({tooltipText:'{name}',interactive:true,strokeWidth:.5});
        this.shade=chart.series.push(am5map.MapPolygonSeries.new(root,{affectsBounds:false}));
        this.shade.mapPolygons.template.setAll({interactive:false,strokeOpacity:0});
        this.shade.data.push({geometry:am5map.getGeoRectangle(90,180,-90,-180)});
        this.shading=am5.RadialGradient.new(root,{stops:[{color:am5.color(0x06121c),opacity:0,offset:0},{color:am5.color(0x06121c),opacity:.05,offset:.65},{color:am5.color(0x06121c),opacity:.48,offset:1}]});
        this.shade.mapPolygons.template.set('fillGradient',this.shading);
        this.grid=chart.series.push(am5map.GraticuleSeries.new(root,{}));this.grid.mapLines.template.setAll({strokeOpacity:.18,strokeWidth:.5});
        this.points=chart.series.push(am5map.MapPointSeries.new(root,{}));this.points.bullets.push((root,series,item)=>am5.Bullet.new(root,{sprite:am5.Circle.new(root,{radius:4,fill:am5.color(item.dataContext.color),stroke:am5.color(0xffffff),strokeWidth:1,tooltipText:item.dataContext.title})}));
        this.paint();this.updatePoints();
        this.motion=matchMedia('(prefers-reduced-motion: reduce)');
        if(!this.motion.matches){chart.appear(700);this.startDrift();}
        this.onMotion=()=>{this.drift?.stop();if(!this.motion.matches)this.startDrift();};this.motion.addEventListener('change',this.onMotion);
        this.onInteract=()=>{this.drift?.stop();};this.addEventListener('pointerdown',this.onInteract);

      }catch{this.querySelector('.globe-chart').textContent='Globe unavailable. Portfolio content remains accessible.';this.loading=false;}
    }
    startDrift(){
      if(!this.chart||this.motion?.matches)return;
      // Small azimuth sweep keeps the owner marker in view. Drag or locate stops it.
      this.drift=this.chart.animate({key:'rotationX',from:this.chart.get('rotationX'),to:-78.4125,duration:18000,easing:am5.ease.inOut(am5.ease.sine)});
    }
    paint(){if(!this.root)return;const light=document.documentElement.getAttribute('theme')==='light';
      this.ocean.mapPolygons.template.setAll({fill:am5.color(light?0xd5e5ec:0x102630),stroke:am5.color(light?0x6e96a9:0x558197),strokeWidth:1});
      this.land.mapPolygons.template.setAll({fill:am5.color(light?0x789eaf:0x456879),stroke:am5.color(light?0xd9e8ef:0x18333f)});
      this.land.mapPolygons.template.states.create('hover',{fill:am5.color(0x987ac4)});this.grid.mapLines.template.set('stroke',am5.color(light?0x475969:0xc4ced5));
    }
    setVisitor(info){if(info?.unavailable)this.visitor=null;else if(Number.isFinite(info?.latitude)&&Number.isFinite(info?.longitude)&&Math.abs(info.latitude)<=90&&Math.abs(info.longitude)<=180)this.visitor=info;else return;
      this.querySelector('.visitor-globe-state').textContent=this.visitor?'● VISITOR / '+(this.visitor.source==='device'?'DEVICE':'IP ESTIMATE'):'● VISITOR / UNKNOWN';this.querySelector('[data-location="visitor"]').disabled=!this.visitor;this.updatePoints();
    }
    updatePoints(){if(!this.points)return;const data=[{longitude:90.4125,latitude:23.8103,title:'Mohsin Ali / Dhaka city centre',color:0xdcb653}];if(this.visitor)data.push({longitude:this.visitor.longitude,latitude:this.visitor.latitude,title:'Visitor / '+(this.visitor.source==='device'?'device position':'approximate IP location'),color:0xad80de});this.points.data.setAll(data);}
    disconnectedCallback(){this.drift?.stop();this.motion?.removeEventListener('change',this.onMotion);this.removeEventListener('pointerdown',this.onInteract);this.resizeObserver?.disconnect();this.root?.dispose();this.root=null;this.ready=false;this.loading=false;this.themeObserver?.disconnect();document.removeEventListener('portfolio:visitor-location',this.onVisitor);}
  }
  customElements.define('x-location-map',LocationGlobe);
})();
