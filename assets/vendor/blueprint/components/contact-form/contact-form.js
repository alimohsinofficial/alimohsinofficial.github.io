/* Blueprint UI: declarative native contact form; no transport dependencies. */
(function(global){'use strict';
let uid=0;const B=global.Blueprint||{};
class ContactForm extends HTMLElement {
 static get observedAttributes(){return ['action','target','name-field','email-field','subject-field','message-field','subjects','submit-label','disabled'];}
 connectedCallback(){if(!this._form)this.build();this.refresh();}
 attributeChangedCallback(){if(this._form)this.refresh();}
 build(){
 const id='blueprint-contact-'+(++uid);const form=this._form=document.createElement('form');form.method='post';form.rel='noopener';
 const fields=document.createElement('fieldset');this._fields=fields;const legend=document.createElement('legend');legend.textContent='Contact details';fields.append(legend);this._controls={};
 for(const [key,label] of [['name','Full name'],['email','Email address'],['subject','Subject'],['message','Message']]){
 const wrap=document.createElement('label');wrap.className='contact-field contact-'+key;wrap.htmlFor=id+'-'+key;const title=document.createElement('span');title.textContent=label;wrap.append(title);
 const input=document.createElement(key==='message'?'textarea':'input');input.id=id+'-'+key;if(key==='email'){input.type='email';input.autocomplete='email';}else if(key==='name')input.autocomplete='name';
 if(key==='message')input.rows=5;input.required=key!=='subject';wrap.append(input);fields.append(wrap);this._controls[key]=input;
 }
 const button=this._submit=document.createElement('button');button.type='submit';button.className='contact-submit';fields.append(button);form.append(fields);
 const note=document.createElement('p');note.className='contact-handoff';note.textContent='Your message is submitted to the configured form provider. Check its confirmation before closing its confirmation.';form.append(note);
 this._status=document.createElement('p');this._status.className='contact-status';this._status.setAttribute('role','status');form.append(this._status);
 form.addEventListener('submit',e=>{const detail={form,action:form.action,target:form.target};const accepted=B.emit?B.emit(this,'contact-submit',detail):this.dispatchEvent(new CustomEvent('blueprint:contact-submit',{bubbles:true,cancelable:true,detail}));if(!accepted){e.preventDefault();return;}this._status.textContent=form.target==='_blank'?'Continue in the new tab to check submission confirmation.':'Continue to the form provider to check submission confirmation.';});
 form.addEventListener('reset',()=>{this._status.textContent='';});this.append(form);
 }
 refresh(){
 let action='';try{if(this.getAttribute('action')){const u=new URL(this.getAttribute('action'),document.baseURI);if(['http:','https:'].includes(u.protocol))action=u.href;}}catch{}
 this._form.action=action||document.baseURI;this._form.target=this.getAttribute('target')||'_blank';this._fields.disabled=this.hasAttribute('disabled');this._submit.disabled=!action;this._submit.textContent=this.getAttribute('submit-label')||'Send message';
 const options=(this.getAttribute('subjects')||'').split('|').map(s=>s.trim()).filter(Boolean);let subject=this._controls.subject;
 if((options.length>0)!==(subject.tagName==='SELECT')){const next=document.createElement(options.length?'select':'input');next.id=subject.id;next.value=subject.value;subject.replaceWith(next);subject=this._controls.subject=next;}
 if(options.length&&subject._options!==options.join('|')){const value=subject.value;subject.replaceChildren(...options.map(value=>{const o=document.createElement('option');o.value=value;o.textContent=value;return o;}));if(options.includes(value))subject.value=value;subject._options=options.join('|');}
 for(const key of ['name','email','subject','message'])this._controls[key].name=this.getAttribute(key+'-field')||key;
 if(!action)this._status.textContent='Contact form is not configured yet.';else if(this._status.textContent==='Contact form is not configured yet.')this._status.textContent='';
 }
 get form(){return this._form||null;}
}
if(!customElements.get('x-contact-form'))customElements.define('x-contact-form',ContactForm);
if(typeof B.register==='function')B.register('contact-form',{init(root){root.querySelectorAll('x-contact-form').forEach(el=>el.refresh());}});
})(window);
