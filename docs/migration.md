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

The new opening notebook item is an explicitly labelled AI-assisted site note based on the rebuild brief. Other planned topics are labelled upcoming, not represented as existing articles. Draft and future-dated articles are excluded by the generator.

## Technical decisions

- Dependency-free static output with a Node authoring script; checked-in root HTML supports current GitHub Pages root hosting.
- Real directory/index URLs, no client router or backend contact form.
- Blueprint core plus segmented, theme-toggle, accordion, and copy-button; vendored distribution updated by an explicit sync command.
- Shared templates/content across Studio/Tactical and Light/Dark; no duplicate article trees.
- SEO metadata, canonical links, Person/BlogPosting schema, RSS, sitemap, accessible navigation, reduced-motion support, print resume.

## Validation

- `node scripts/build.mjs`: 13 generated static pages, one published site note, RSS and sitemap.
- `node scripts/check.mjs`: all 388 generated internal references resolve; draft template excluded; legacy template metadata absent.
- Syntax checks passed for generator, local server, and site behaviour scripts.
- Local HTTP request to `/resume/` returned 200.
- In-app browser review covered Studio and Tactical in both Light and Dark, desktop (1366 px) and mobile (390 px), saved preferences across navigation, article category controls, search matching/empty state, and native skill disclosure using Enter.
- Browser console inspection reported no warnings or errors during the exercised pages. Mobile homepage and resume had document width within the viewport.
- Print styles and before/after-print disclosure restoration were implemented and reviewed; an exported browser PDF was not visually verified.
- Remote push, existing GitHub Pages settings, and deployment are not included in this local rebuild. External publication URLs were preserved from the sources and were not independently revalidated.
