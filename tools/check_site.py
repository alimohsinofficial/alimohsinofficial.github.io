"""Optional stdlib-only checks. Does not build or modify the static site."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import base64, hashlib, json, re, sys, xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://alimohsinofficial.github.io'
errors = []
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.tags=[]; self.scripts=[]; self.current=None; self.ids=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs); self.tags.append((tag,attrs))
        if 'id' in attrs:self.ids.append(attrs['id'])
        if tag=='script' and 'src' not in attrs:self.current=[attrs,[]]
    def handle_data(self, data):
        if self.current:self.current[1].append(data)
    def handle_endtag(self, tag):
        if tag=='script' and self.current:
            self.scripts.append((self.current[0],''.join(self.current[1])));self.current=None

def local_target(page,value):
    u=urlparse(value)
    if u.scheme and (u.scheme not in ['http','https'] or u.netloc!=urlparse(ORIGIN).netloc):return None
    if not u.path:return None
    path=ROOT/unquote(u.path).lstrip('/') if u.path.startswith('/') or u.netloc else page.parent/unquote(u.path)
    path=path.resolve()
    if u.path.endswith('/'):path/= 'index.html'
    return path

pages=[p for p in ROOT.rglob('*.html') if 'assets' not in p.relative_to(ROOT).parts]
refs=0;schemas=0;hashes=[];canonical=set()
for file in pages:
    label=str(file.relative_to(ROOT));text=file.read_text(encoding='utf-8');page=Page();page.feed(text)
    policies=[a.get('content','') for t,a in page.tags if t=='meta' and a.get('http-equiv','').lower()=='content-security-policy']
    if len(policies)!=1:errors.append(label+': expected one CSP')
    policy=policies[0] if policies else ''
    if "'unsafe-eval'" in policy or "script-src 'unsafe-inline'" in policy:errors.append(label+': weakened script policy')
    if "object-src 'none'" not in policy or "base-uri 'none'" not in policy:errors.append(label+': missing embedding/base protection')
    if len(page.ids)!=len(set(page.ids)):errors.append(label+': duplicate IDs')
    for attrs,data in page.scripts:
        if attrs.get('type')!='application/ld+json':errors.append(label+': inline executable script')
        else:
            schemas+=1
            try:json.loads(data)
            except ValueError:errors.append(label+': invalid JSON-LD')
            h="'sha256-"+base64.b64encode(hashlib.sha256(data.encode()).digest()).decode()+"'";hashes.append(h)
            if h not in policy:errors.append(label+': inline JSON-LD CSP hash mismatch')
    head=text.split('</head>',1)[0]
    if head.find('Content-Security-Policy')>head.find('<script'):errors.append(label+': CSP appears after a script')
    for tag,attrs in page.tags:
        for attr,value in attrs.items():
            if attr.startswith('on'):errors.append(label+': inline handler '+attr)
        if tag=='img' and 'alt' not in attrs:errors.append(label+': missing image alt')
        if tag=='a' and attrs.get('target')=='_blank' and not {'noopener','noreferrer'}<=set(attrs.get('rel','').split()):errors.append(label+': unsafe new-tab link')
        if tag=='link' and attrs.get('rel')=='canonical':canonical.add(attrs.get('href'))
        if tag=='link' and attrs.get('type')=='text/markdown' and attrs.get('title')=='Markdown version':
            if local_target(file,attrs['href'])!=file.with_suffix('.md'):errors.append(label+': Markdown points to wrong page')
        for attr in ['href','src']:
            if attr in attrs:
                value=attrs[attr]
                if 'feed.xml' in value or 'application/rss+xml'==attrs.get('type'):errors.append(label+': RSS remains')
                target=local_target(file,value)
                if target:
                    refs+=1
                    if not target.exists():errors.append(label+': missing '+str(target))
    if not any(t=='meta' and a.get('name')=='description' for t,a in page.tags):errors.append(label+': missing description')
    if file.name=='404.html' and not any(t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','') for t,a in page.tags):errors.append('404 must be noindex')
manifest=json.loads((ROOT/'agents/site.json').read_text(encoding='utf-8'))
for record in manifest['pages']:
    for key in ['url','markdown']:
        if not local_target(ROOT/'index.html',record[key]).exists():errors.append('Missing manifest target '+record[key])
urls=[el.text for el in ET.parse(ROOT/'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
if len(urls)!=len(set(urls)):errors.append('Duplicate sitemap URLs')
if set(urls)!={r['url'] for r in manifest['pages']}:errors.append('Sitemap and canonical manifest differ')
if ORIGIN+'/tactical/' in urls:errors.append('Alternate Tactical URL should not be in canonical sitemap')
if not all(u in canonical for u in urls):errors.append('Sitemap URL without a canonical page')
if not all(h in (ROOT/'_headers').read_text(encoding='utf-8') for h in hashes):errors.append('Optional host header template lacks a JSON-LD hash')
if (ROOT/'feed.xml').exists():errors.append('RSS feed file still exists')
for p in ROOT.glob('assets/*.js'):
    if 'feed.xml' in p.read_text(encoding='utf-8'):errors.append(str(p.relative_to(ROOT))+': RSS reference')
print(json.dumps({'HTML_pages':len(pages),'local_references':refs,'JSON_LD_graphs':schemas,'Markdown_pages':len(manifest['pages']),'sitemap_URLs':len(urls),'CSP_hashes':'valid' if not errors else 'see errors','errors':errors},indent=2))
sys.exit(bool(errors))
