# PHP2Shell: the UK’s October cyber emergency, explained

Canonical page: https://alimohsinofficial.github.io/blog/uk-php2shell-cyber-emergency/

Author: Mohsin Ali. Content snapshot: 2026-10-26.

Security analysis / UK / October 2026


Two critical PHP flaws triggered urgent action across the UK. The useful story is what the evidence establishes, where early claims changed, and how organisations can prove that their response worked.

Mohsin Ali 26 Oct 202610 min read AI-assisted research & writing

**Scope and evidence date:** UK implications of the global PHP2Shell vulnerability emergency. Sources checked on 26 October 2026. This is an analysis of published evidence, not a claim that a single attacker breached the UK or that every affected website was compromised.

[![Response schematic: identify PHP dependencies, patch the runtime, verify the serving workers, then investigate the exposure window.](https://alimohsinofficial.github.io/assets/images/blog/php2shell-response.svg)](https://alimohsinofficial.github.io/assets/images/blog/php2shell-response.svg)

Original explanatory schematic. It represents a response process, not a map of compromised organisations.

## The one-minute briefing

- **The technical risk is real.** CVE-2026-109618 and CVE-2026-109619 can enable unauthenticated remote code execution in vulnerable PHP deployments.
- **Urgent UK action is documented.** The NCSC issued an alert on 21 October; NHS England and Ofcom published sector guidance.
- **Attempt counts do not establish a breach count.** Vendor telemetry, successful demonstrations and victim investigations answer different questions.
- **Recovery needs evidence.** Confirm the runtime serving each application, review the exposure window, and track subsequent advisories.

Primary references: [NCSC UK alert](https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php) and [NHS England alert CC-4875](https://digital.nhs.uk/cyber-alerts/2026/cc-4875).

## What happened in the UK?

On 21 October, the UK’s National Cyber Security Centre urged organisations to act on two critical flaws in [![](https://alimohsinofficial.github.io/assets/images/products/php.svg)PHP](https://www.php.net/), the software that generates dynamic pages on many web servers. Its response covered discovery, updating, temporary mitigation and, where necessary, taking an exposed system offline. The immediate problem was a shared software dependency with serious failure modes, rather than a publicly attributed campaign against Britain. [[NCSC]](https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php)

The UK consequences need to be described organisation by organisation. NHS Supply Chain said on 22 October that it had applied the recommended website updates. Its 23 October update reported no evidence of other customer-facing services being affected and no operational impact; it was also seeking assurance from suppliers. That is evidence of a defensive response and a stated service position, not evidence of a breach of NHS procurement operations. [[NHS Supply Chain]](https://www.supplychain.nhs.uk/news-article/php-website-cyber-security/)

Ofcom’s 23 October notice asked communications providers and relevant digital-infrastructure operators to give urgent consideration to NCSC guidance, and said it would engage with supervised services on remediation. This widened the response beyond individual websites to services people depend on. It did not identify a single attacker or announce a sector-wide compromise. [[Ofcom]](https://www.ofcom.org.uk/internet-based-services/network-security/php-cybersecurity-risk-to-regulated-services)

For readers following “the latest UK cyberattack”, this distinction matters. A maintenance page can reflect a deliberate containment decision. An urgent vulnerability alert establishes a risk. A claim that personal information was stolen requires separate incident evidence. Combining those into one dramatic story makes it harder to understand what actually needs fixing.

## A timeline with the corrections included

All times below are UTC where a source provides a time. Observation dates and publication dates are kept separate.

Public evidence reviewed on 26 October 2026

| Date | What the source establishes |
| --- | --- |
| 17 October | AWS later identified an exploitation attempt in its MadPot honeypot telemetry. This is an observation date, not the date of a confirmed UK breach. [AWS](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/) |
| 20 October | PHP announced a critical security release scheduled for 21 October at 14:00 UTC. [PHP announcement](https://www.php.net/archive/2026.php#2026-10-20-1) |
| 21 October | Emergency fixes and UK guidance were published. ENISA records update availability at 13:40 UTC; the advance notice had specified 14:00 UTC. [ENISA](https://www.enisa.europa.eu/news/joint-statement-on-critical-php-vulnerabilities) · [NCSC](https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php) |
| 22 October, 21:21 | Sophos corrected an earlier success claim: its customer telemetry showed scanning and failed attempts, with no successful compromise established in that update. [Sophos correction](https://www.sophos.com/en-us/blog/proof-of-concept-exploit-released-for-php-vulnerabilities-109618-109619) |
| 23 October | NCSC-NL lowered its assessment of the likelihood of large-scale exploitation while retaining urgent patching advice. PHP also published a separate session-handling advisory. [NCSC-NL](https://www.ncsc.nl/en/alerts/update-php-vulnerabilities-remain-a-reason-for-immediate-patching) · [PHP](https://www.php.net/archive/2026.php#2026-10-23-1) |
| 25 October | Unit 42 withdrew its 23 October attribution of initial access at a European government agency to these specific CVEs. [Unit 42 update](https://unit42.paloaltonetworks.com/cve-2026-109618-cve-2026-109619/) |
| 26 October | PHP announced refreshed Windows packages for a separate Brotli dependency vulnerability. Package rebuild identifiers and PHP runtime versions are therefore both relevant to verification. [PHP Windows update](https://www.php.net/archive/2026.php) |

## The flaw sits below your application

A login screen and an up-to-date content-management system do not, by themselves, resolve a vulnerability in the runtime underneath them. A team can finish updating [![](https://alimohsinofficial.github.io/assets/images/products/wordpress.svg)WordPress](https://wordpress.org/) or its plugins while the web-serving PHP process remains vulnerable. Cloudflare explicitly distinguishes application updates from the PHP runtime fix. [[Cloudflare]](https://blog.cloudflare.com/php-vulnerabilities-waf-protection/)

### CVE-2026-109618: failure during memory exhaustion

The first flaw concerns PHP’s handling of an out-of-memory error. Work can stop while request data is only partly initialised; cleanup can subsequently act on that invalid state. The upstream advisory describes a demonstrated Apache `mod_php` path that can be reached before application code starts. It also explains why other serving arrangements have different failure behaviour. A configuration difference can change the route to exploitation without removing the need to patch. [[Upstream advisory: OOM corruption]](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)

### CVE-2026-109619: a worker remembers memory it no longer owns

The second flaw involves request-owned memory referenced by state retained in a PHP worker. If that state survives cleanup, a later request handled by the same worker can use a reference to memory that has already been freed. The dangerous transition crosses the boundary between requests, which helps explain why a working demonstration in one environment does not establish identical behaviour across every installation. [[Upstream advisory: stale state]](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)

NHS England lists both flaws at CVSS v4.0 9.2. That is a severity assessment, not a measurement of how many organisations have been breached. The practical exposure still depends on the reachable service, its runtime and configuration, and what an attacker can make it do. [[NHS England]](https://digital.nhs.uk/cyber-alerts/2026/cc-4875)

## Read the evidence at the right level

AWS reported attempts against its sensors before disclosure, and said it remained unclear whether the analysed attempts would have succeeded against real-world systems. A honeypot is deliberately instrumented to observe hostile activity; its observations are valuable, but they are not a census of compromised UK organisations. [[AWS]](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/)

The corrections are equally valuable. Sophos revised a customer-compromise assessment to scanning and failed exploitation attempts. Unit 42 said it had seen post-compromise activity at a European government agency but could not confirm that these specific PHP2Shell vulnerabilities supplied the initial access. Neither correction makes the underlying software flaw harmless; both narrow what those investigations can support. [[Sophos]](https://www.sophos.com/en-us/blog/proof-of-concept-exploit-released-for-php-vulnerabilities-109618-109619) · [[Unit 42]](https://unit42.paloaltonetworks.com/cve-2026-109618-cve-2026-109619/)

On 23 October, the Dutch NCSC said exploitation was complex and large-scale exploitation appeared less likely than previously estimated. It still recommended immediate updating. The defensible position is to act on the severity while being precise about the evidence. [[NCSC-NL]](https://www.ncsc.nl/en/alerts/update-php-vulnerabilities-remain-a-reason-for-immediate-patching)

An evidence ladder for incident reporting

| Evidence | Reasonable conclusion | Still needs investigation |
| --- | --- | --- |
| An affected runtime is present | A service may be exposed. | Whether an attacker reached or exploited it. |
| A request matches an exploit pattern | Investigate a possible attempt. | Whether the request actually executed code. |
| A controlled exploit succeeds | The tested configuration has a viable attack path. | Which real organisations were compromised. |
| A victim has malicious process or file artefacts | Investigate a compromise. | The initial access route and the data affected. |

The ladder is an editorial framework, not an official incident-classification standard. This article does not infer a UK victim count, attacker identity or financial loss from scan volumes, demonstrations or unrelated compromise reports.

## The response should end with proof, not an “updated” checkbox

The following is an engineering checklist derived from the linked advisories. It is intended to help an application owner ask better questions of an infrastructure team or hosting provider; it does not replace that provider’s platform-specific update procedure.

### 1. Find every service that can invoke PHP

Inventory public applications, secondary domains, management tools, supplier-hosted services and the images they deploy. ENISA notes that products can include PHP without making that dependency obvious. Record an owner and an update path for each service; otherwise an incident team can finish patching the visible website while an overlooked service remains exposed. [[ENISA]](https://www.enisa.europa.eu/news/joint-statement-on-critical-php-vulnerabilities)

### 2. Verify the appropriate fixed build

Initial upstream fixes for the two original CVEs, released 21 October

| PHP branch | Initial fixed version | Operational check |
| --- | --- | --- |
| 8.2 | `8.2.35` | Use a supported, current vendor package. Confirm the exact package or image and the web-serving runtime for each application. |
| 8.3 | `8.3.36` |
| 8.4 | `8.4.27` |
| 8.5 | `8.5.12` |

These are the initial upstream fix levels for CVE-2026-109618 and CVE-2026-109619, not a promise that every later advisory is covered. NHS England advises migration from unsupported PHP 8.1 and older releases. Where an operating-system or commercial vendor supplies a backport, obtain its advisory and fixed package identifier rather than judging security from the upstream-looking version string alone. [[NHS England]](https://digital.nhs.uk/cyber-alerts/2026/cc-4875) · [[PHP]](https://www.php.net/archive/2026.php#2026-10-21-5)

### 3. Check what is actually serving requests

An installed package and a running service are separate things. As an operational acceptance test, identify the PHP handler for each virtual host, confirm the relevant workers were replaced or restarted through the supported procedure, and verify the deployed image where containers are used. A command-line version check can inspect a different installation from the one handling the website.

Keep verification within an authenticated administration channel; a publicly exposed diagnostic page can reveal unnecessary configuration. Record the package or image identifier, the serving environment, the change time and the person who verified it. These records make the recovery claim reviewable.

### 4. Treat filtering as a temporary layer

Cloudflare says its WAF protections supplement patching. Its updated notice also limits coverage for the later session issue to the default upload-progress field name. That is a useful example of why a dashboard saying “protected” should be checked against the application’s configuration and the traffic path to its origin. [[Cloudflare]](https://blog.cloudflare.com/php-vulnerabilities-waf-protection/)

When timely remediation is not possible, follow the NCSC’s advice on mitigation and whether a service should be taken offline. Give any temporary measure an owner, a documented limitation and an expiry or review time. Do not silently turn an emergency exception into the permanent architecture. [[NCSC]](https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php)

### 5. Investigate the exposure window

AWS recommends looking back to at least 17 October. CISA’s published bulletin highlights suspicious PHP-worker behaviour, including launching shells or downloading tools. Correlate network requests with host telemetry, unexpected file changes and outbound activity; an isolated indicator needs context. If compromise is suspected, coordinate containment and evidence preservation with incident responders before disruptive recovery actions. [[AWS]](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/) · [[CISA bulletin]](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/42ff5ac)

## Two follow-ups a patch table alone would miss

**Session handling, 23 October:** PHP identified CVE-2026-115560, a separate issue requiring unusual session settings and application behaviour. It recommends keeping `session.upload_progress.enabled=0` until the regular fix. Fixing the original pair does not close every subsequent advisory. [[PHP informational advisory]](https://www.php.net/archive/2026.php#2026-10-23-1)

**Windows packages, 26 October:** PHP’s `8.5.12-1`, `8.4.27-1`, `8.3.36-1` and `8.2.35-1` rebuilds address a separate Brotli dependency flaw, retaining the same runtime source versions. Verify the package revision too. [[PHP Windows rebuild notice]](https://www.php.net/archive/2026.php)

## The wider lesson: dependency response is a product capability

Public services and businesses can depend on the same low-level runtime even when their websites look unrelated. The resulting response problem crosses application teams, hosting providers, suppliers and business owners. Fast patching depends on decisions made before the incident: knowing what runs, who owns it, how changes are deployed and how service can continue during containment.

AWS also argues that AI-assisted analysis can shorten the path from an advisory or patch to exploit development. That is its assessment of a changing defender–attacker dynamic, not proof that AI caused a particular UK breach. The useful response is to shorten the time needed to understand and change your own estate, while keeping a high standard for claims about what attackers achieved. [[AWS assessment]](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/)

A credible recovery statement should answer four questions: which services were exposed, which serving runtimes were fixed, what evidence was reviewed, and what uncertainty remains. That standard is more useful than either an alarming headline or an unqualified assurance that everything is safe.

## Sources and research method

This article prioritises upstream maintainers, government agencies, affected organisations and security vendors describing their own telemetry. Dates and corrections were checked against the current source text on 26 October 2026. Vendor observations are attributed; the response checklist and evidence ladder are editorial analysis. New reports after this review are not automatically incorporated.

1. [NCSC UK — Critical security issue affecting PHP](https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php). UK response priorities; published 21 October.
2. [PHP — 2026 official news archive](https://www.php.net/archive/2026.php). Advance notice, security releases, 23 October session advisory and 26 October Windows rebuilds.
3. [PHP upstream — CVE-2026-109618 / OOM corruption](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w). Technical cause and serving-environment differences.
4. [PHP upstream — CVE-2026-109619 / stale global state](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp). Request-lifetime and worker-state failure.
5. [NHS England Digital — alert CC-4875](https://digital.nhs.uk/cyber-alerts/2026/cc-4875). Severity and initial fixed releases; published 21 October.
6. [NHS Supply Chain — PHP website cyber security](https://www.supplychain.nhs.uk/news-article/php-website-cyber-security/). Organisation’s own 22–23 October response and service-impact statements.
7. [Ofcom — PHP cybersecurity risk to regulated services](https://www.ofcom.org.uk/internet-based-services/network-security/php-cybersecurity-risk-to-regulated-services). UK sector notice; published 23 October.
8. [ENISA and partners — joint statement](https://www.enisa.europa.eu/news/joint-statement-on-critical-php-vulnerabilities). Release timing and indirect software dependencies.
9. [AWS — MadPot exploitation-attempt telemetry](https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/). Observation dates, uncertainty and investigation window.
10. [Sophos — evolving PHP2Shell research](https://www.sophos.com/en-us/blog/proof-of-concept-exploit-released-for-php-vulnerabilities-109618-109619). Explicit correction at 21:21 UTC on 22 October.
11. [Unit 42 — threat brief, updated 25 October](https://unit42.paloaltonetworks.com/cve-2026-109618-cve-2026-109619/). Retraction of its earlier initial-access attribution.
12. [NCSC-NL — updated risk assessment](https://www.ncsc.nl/en/alerts/update-php-vulnerabilities-remain-a-reason-for-immediate-patching). Exploit complexity and retained patching advice; updated 23 October.
13. [CISA — official 21 October bulletin](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/42ff5ac). Inventory, patching and suspicious worker behaviour. This dated bulletin is not treated as a live exploitation-status feed.
14. [Cloudflare — WAF protection and limitations](https://blog.cloudflare.com/php-vulnerabilities-waf-protection/). Supplementary filtering and the later session-field caveat.

**AI disclosure:** Research, drafting and the original explanatory diagram were prepared with AI assistance for this portfolio. This article reports public-source research; it does not claim a firsthand investigation, private telemetry or interviews with affected organisations.

[More from the notebook ↗](https://alimohsinofficial.github.io/blog/)
