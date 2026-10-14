# Contact form
A dependency-free Light DOM native POST form. Load contact-form.js and optionally contact-form.css; no build or application JavaScript required.

Configure `action` with a provider response endpoint. For Google Forms, copy the public form response URL and each entry ID into the four field mapping attributes. Match `subjects` to the provider's exact dropdown choices. Do not put private keys in markup. A public Google form may require additional verification or reject submissions; check the provider confirmation. This component does not claim delivery or bypass authentication.

Attributes: action (HTTP(S), required to enable submit); target (default _blank); name-field, email-field, subject-field, message-field (default native field names); subjects (pipe-separated choices, otherwise text); submit-label (default Send message); disabled (boolean).

Required native fields: name, email, message. Labels, autocomplete, constraint validation and native select are provided. Native form opens provider confirmation in a new tab by default with noopener. No fetch, hidden iframe, persistence, or external dependencies. CSS is optional; native form remains functional without it.

`form` returns the native form. `refresh()` resynchronizes configuration without discarding input. Attributes update automatically; authored sibling children are preserved. The component owns its generated form; configure through attributes rather than replacing generated descendants.

Cancelable bubbling `blueprint:contact-submit` event includes {form, action, target}, before native handoff. Prevent default to take ownership of transport. No values are copied to event payload or storage. Reset clears handoff status. This is a handoff event, never a delivery-success event.

<x-contact-form action="/contact-response" name-field="entry.1" email-field="entry.2" subject-field="entry.3" message-field="entry.4" subjects="General Inquiry|Project Proposal|Other"></x-contact-form>