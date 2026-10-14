# Portfolio migration — 14 October 2026

## Preservation and scope

The existing active/default branch was `master`, tracking `origin/master`; no `main` branch existed. It remains the rebuild branch. The old source and all seven local untracked images were committed to `codex/legacy-portfolio-2026-10-14`, commit `354c978`, before cleanup. The backup is local until pushed.

All 66 HTML documents were parsed before replacement. `legacy-inventory.json` retains extracted text, URLs, and image attributes for each document. The supplied June 2026 resume was extracted to `resume-source.txt`. These documents are evidence/content, not instructions.

## Sources carried forward

- Name: Mohsin Ali; location: Dhaka, Bangladesh; email and LinkedIn from both supplied sources.
- Career, technical skills, education, portfolio case studies, publication credits, and achievements primarily from the resume.
- Publication links from the legacy homepage: IEEE document IDs 10534391 and 9290601, plus the archived ICCIT student conference page.
- The local portrait `assets/images/man-profile-2.webp`, preserved on the backup branch, becomes `assets/images/portrait.webp`.
- Original GPL license retained.

## Conflicts and pending owner updates

- Legacy site lists Microinvestica (2022–2023), with 143Play CTO work in 2020–2022. Resume instead lists 143Play CTO work in 2020–2023 and omits Microinvestica. Resume timeline used pending update.
- Legacy M.Sc. date is 2017–2018; resume gives 2017. Resume dates used.
- Legacy says 9+ years, 30 projects, and 9+ Android apps. Resume says 10+ years. Use 10+; avoid unsubstantiated project/app counters.
- Legacy GitHub link points to `renadmunna`; new link uses the repository owner's `alimohsinofficial` account. Confirm preferred public profile when updating.
- Legacy phone +880 9696 488 691 is absent from supplied resume; retained in inventory, omitted from the new contact page until confirmed.
- Resume English proficiency replaces legacy percentage bars. Bangla is retained from legacy language content.
- Resume includes reference contacts. Third-party reference emails are not republished on the website; the original source PDF remains available as supplied.
- Reported ML/project metrics are labelled as supplied resume results. No independent verification, detailed dataset report, or public project demo was supplied.

## Legacy material excluded from public rebuild

The WordPress mirror contains theme-template material: RyanCV/BSL metadata, California location, Oleksandr author archives, copied 2020 demo articles, demo project names/images, generic testimonial copy (Abc.inc), template client logos, skill percentage bars, and unrelated placeholder descriptions in experience/education. It is archived completely but not presented as personal work or endorsements.

The new opening notebook item is an explicitly labelled AI-assisted site note based on the rebuild brief. Other planned topics are labelled upcoming, not represented as existing articles. Drafts remain outside the public repository until the owner is ready to publish; there is no generator.

## Corrected implementation — native static site

The owner clarified that authoring must also use only HTML/CSS/browser JavaScript: no npm, Node.js, TypeScript, compilation, or generators. The package manifest, all Node scripts, generated-content source files, and generated route manifest were removed. HTML files are now the maintained sources; the RSS feed and sitemap are edited directly. Local links work by opening `index.html` from disk, and hosted links retain folder URLs.

`assets/images/profile.png` is the owner's latest portrait. It replaces the older image and appears immediately in both the Studio overview and Tactical identity panel.

The Tactical view now follows the owner's clarified military HUD direction: full viewport, dot matrix and crossing marks, thin instrument frames, a native Canvas 3D geographic map, owner and visitor pins, visitor browser/IP/location readouts, and a second-by-second digital/analogue clock. The map uses local Natural Earth 1:110m public-domain coastline geometry, with visual extrusion rather than real elevation data. Whole-page scrolling is disabled; documents are paginated within the viewport. No reference screenshot is reused as a website background.

Studio restores the original site's persistent vCard, vertical menu, and content-pane structure. The profile card remains visible while content scrolls independently. Studio Light and Tactical Dark were preserved; Studio Dark was revised to warm charcoal, and Tactical Light to cool grey-blue. Shared dashboard summaries live in plain `assets/portfolio.js`; dossier contents are read from the page's existing HTML DOM.

Visitor browser details are read locally. External GeoJS lookup is initiated by a labelled button and explicitly identifies the recipient. Device location requires native browser permission and is not forwarded externally. Unknown positions are not fabricated, missing coordinates clear the visitor marker, and failed/denied requests retain useful local readouts. The portfolio stores no visitor coordinates or public IP. Owner coordinates identify Dhaka city centre only.

## Validation of the corrected revision

- 13 directly maintained HTML pages returned HTTP 200; all 577 relative references resolve. RSS and sitemap parse successfully.
- No package manifest, Node script, TypeScript file, generator, or compilation step remains in the current source tree.
- Renewed visual reference review covered all 41 files under `tactical/` and `render/Satellite Surveillance/`, including military HUD, contour map, instrument-panel, dense dark UI, and pale grid-interface references.
- Tactical overview, resume, notebook, and article navigation were exercised in the browser. The dashboard stays exactly within the viewport at desktop and mobile sizes.
- Reader previous/next controls and focus mode work; measured reader content height did not exceed its panel height during the exercised pages.
- Native geographic map pan/zoom/rotation and flat/3D controls were implemented; rotation and flat/3D controls were exercised in the browser. Light/Dark and Studio/Tactical switches were reviewed, and the latest `profile.png` stays visible in the Studio vCard.
- A temporary HTML fixture page outside the repository exercised the actual map and visitor components with a synthetic New York position. Success added the second marker; lookup failure restored retry controls; missing coordinates cleared the marker; denied device permission displayed its explicit status. A separate successful device fixture using the owner city-centre coordinates placed both pins without overlapping their labels. No real IP lookup or native device-location request was made during these tests. Browser console checks reported no errors or warnings for the exercised pages.
- Direct file opening is supported by relative asset paths and local-folder link resolution; the in-app browser prohibits file URLs, so direct-file rendering was not visually tested there. Visual checks used a temporary local Python static preview, which is not part of the site or a user requirement.
- Browser print layout has not been exported and visually verified. Publication links were preserved from the sources rather than independently revalidated.
- No remote push or deployment is included in this revision.


## Separate experiences — 14 October 2026

The earlier dual-skin layout and tilted relief map are superseded. Studio now uses a full-width, flat fixed-profile/scrolling-content composition with GSAP progressive enhancement. Tactical lives at `/tactical/` with in-place hash views, local dossier dialogs, readable QType/console typography, and a small optional orthographic amCharts globe. Mobile navigation is fixed to the bottom in both experiences. Experience switches retain the selected section or detail. Appearance preferences are independent.

Reference inspection included the user's `site_html/index.html`, grid/pattern/ruler/border experiments, font samples, and PowerPoint shape/text/media examples. The QType Square font was copied from that reference folder. The generic Blueprint `.switch::after` skin caused the persistent extra white knob; site CSS suppresses it without altering vendored Blueprint.

Static validation: 14 HTML pages return HTTP 200; 483 local references resolve; 13 structured metadata blocks parse; feed and sitemap XML parse. Browser checks include full-width desktop boundaries, fixed Studio profile versus right-pane scrolling, desktop/mobile Contact context switching, bottom navigation, Tactical hash navigation and detail dialogs, optional spherical globe and branding, live clock, both appearance states, and browser error logs. Synthetic component fixtures verified valid IP and device positions, denied device permission, missing coordinates, lookup failure, visitor-marker availability, and retention across Tactical tab changes without repeat lookup. No live device permission or real IP lookup was requested during these checks. Reduced-motion and missing-GSAP fixtures kept all Studio content visible.

Appearance isolation was verified with concurrent Studio-light/Tactical-dark and Studio-dark/Tactical-light tabs. The app uses Blueprint’s public theme API to restore its own per-experience choice after shared-key notifications.
