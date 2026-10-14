/* Browser-only session readouts. Network lookup and device location are visitor-initiated. */
(() => {
  function browserName(){const ua=navigator.userAgent;if(/Edg\//.test(ua))return 'Edge';if(/Firefox\//.test(ua))return 'Firefox';if(/OPR\//.test(ua))return 'Opera';if(/Chrome\//.test(ua))return 'Chromium';if(/Safari\//.test(ua))return 'Safari';return 'Browser';}
  class VisitorInfo extends HTMLElement {
    connectedCallback(){
      if(this.ready)return;this.ready=true;
      this.setAttribute('info-page','network');
      this.innerHTML=`<x-segmented class="visitor-field-tabs" value="network" label="Visitor information"><button value="network">Network</button><button value="device">Device</button></x-segmented><dl class="visitor-fields">${[['ip','PUBLIC IP'],['region','REGION'],['position','POSITION'],['network','NETWORK'],['browser','BROWSER / OS'],['viewport','VIEWPORT'],['language','LANGUAGE'],['timezone','TIME ZONE'],['device','DEVICE']].map(([key,label])=>`<div><dt>${label}</dt><dd field="${key}"></dd></div>`).join('')}</dl><div class="visitor-actions"><button type="button" command="lookup-ip">LOOK UP IP & REGION ↗</button><button type="button" command="device-location">USE DEVICE LOCATION ⌖</button></div><p class="visitor-disclosure">Optional IP lookup: <a href="https://www.geojs.io/" target="_blank" rel="noopener noreferrer">GeoJS</a> receives your IP; location is approximate.</p><p class="visitor-status" role="status">Local browser details. Location not requested.</p>`;
      this.values={ip:'NOT QUERIED',region:'NOT LOCATED',position:'—'};this.paintLocal();this.paintValues();
      this.onResize=()=>this.paintLocal();this.onNetwork=()=>this.paintLocal();window.addEventListener('resize',this.onResize);window.addEventListener('online',this.onNetwork);window.addEventListener('offline',this.onNetwork);
      this.addEventListener('click',event=>{const command=event.target.closest('button[command]')?.getAttribute('command');if(command==='lookup-ip')this.lookup();if(command==='device-location')this.locate();});
      this.addEventListener('blueprint:change',event=>{if(event.target.matches('.visitor-field-tabs'))this.setAttribute('info-page',event.detail.value);});
    }
    disconnectedCallback(){window.removeEventListener('resize',this.onResize);window.removeEventListener('online',this.onNetwork);window.removeEventListener('offline',this.onNetwork);this.request?.abort();}
    field(name,value){const el=this.querySelector(`[field="${name}"]`);if(el)el.textContent=value;}
    status(text){this.querySelector('.visitor-status').textContent=text;}
    paintValues(){Object.entries(this.values).forEach(([key,value])=>this.field(key,value));}
    paintLocal(){
      const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
      this.field('network',(navigator.onLine?'ONLINE':'OFFLINE')+(connection?.effectiveType?' / '+connection.effectiveType.toUpperCase():''));
      this.field('browser',browserName()+' / '+(navigator.userAgentData?.platform||navigator.platform||'NOT EXPOSED'));
      this.field('viewport',window.innerWidth+' × '+window.innerHeight+' / '+(devicePixelRatio||1).toFixed(1)+'×');
      this.field('language',navigator.language||'NOT EXPOSED');
      this.field('timezone',Intl.DateTimeFormat().resolvedOptions().timeZone||'LOCAL');
      this.field('device',(navigator.maxTouchPoints>0?'TOUCH':'POINTER')+(navigator.hardwareConcurrency?' / '+navigator.hardwareConcurrency+' LOGICAL CORES':''));
    }
    async lookup(){
      const button=this.querySelector('[command="lookup-ip"]');if(button.disabled)return;button.disabled=true;this.status('Looking up public IP and approximate region…');
      this.request=new AbortController();const timeout=setTimeout(()=>this.request.abort(),10000);
      try{
        const response=await fetch('https://get.geojs.io/v1/ip/geo.json',{signal:this.request.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
        if(!response.ok)throw new Error('Lookup failed');const info=await response.json();
        const coordinate=value=>typeof value==='number'||typeof value==='string'&&value.trim()!==''?Number(value):NaN;
        const latitude=coordinate(info.latitude),longitude=coordinate(info.longitude);
        this.values.ip=typeof info.ip==='string'?info.ip:'UNAVAILABLE';
        this.values.region=[info.city,info.country].filter(value=>typeof value==='string'&&value).join(', ')||'UNKNOWN';
        if(Number.isFinite(latitude)&&Number.isFinite(longitude)&&Math.abs(latitude)<=90&&Math.abs(longitude)<=180){
          this.values.position=latitude.toFixed(3)+' / '+longitude.toFixed(3)+' · IP';
          document.dispatchEvent(new CustomEvent('portfolio:visitor-location',{detail:{latitude,longitude,city:this.values.region,source:'ip',accuracy:Number(info.accuracy)||null}}));
          this.status('IP-based estimate'+(info.accuracy!=null&&Number.isFinite(Number(info.accuracy))?' · accuracy radius ~'+Number(info.accuracy)+' km':'')+'. A VPN can change this location.');
        }else{this.values.position='UNAVAILABLE';document.dispatchEvent(new CustomEvent('portfolio:visitor-location',{detail:{unavailable:true}}));this.status('IP detected; a location estimate was not supplied.');}
        this.paintValues();button.textContent='REFRESH IP & REGION ↗';
      }catch{this.status('IP lookup is unavailable. Browser details still work; retry or use device location.');}
      finally{clearTimeout(timeout);button.disabled=false;}
    }
    locate(){
      if(!navigator.geolocation){this.status('Device location is not exposed by this browser.');return;}
      this.status('Waiting for device location permission…');
      navigator.geolocation.getCurrentPosition(position=>{
        const {latitude,longitude,accuracy}=position.coords;
        this.values.position=latitude.toFixed(4)+' / '+longitude.toFixed(4)+' · DEVICE';this.values.region='DEVICE POSITION';this.paintValues();
        document.dispatchEvent(new CustomEvent('portfolio:visitor-location',{detail:{latitude,longitude,accuracy,city:'DEVICE LOCATION',source:'device'}}));
        this.status('Device location received · accuracy ±'+Math.round(accuracy)+' m. Coordinates stay on this page.');
      },error=>{if(this.values.region==='DEVICE POSITION'){this.values.position='UNAVAILABLE';this.values.region='NOT LOCATED';this.paintValues();document.dispatchEvent(new CustomEvent('portfolio:visitor-location',{detail:{unavailable:true}}));}this.status(error.code===1?'Device location was declined. No device position is shown.':'Device location is unavailable. Try the approximate IP lookup.');},{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
    }
  }
  customElements.define('x-visitor-info',VisitorInfo);
})();
