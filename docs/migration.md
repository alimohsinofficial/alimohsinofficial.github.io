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

## Corrected implementation — native static site

The owner clarified that authoring must also use only HTML/CSS/browser JavaScript: no npm, Node.js, TypeScript, compilation, or generators. The package manifest, all Node scripts, generated-content source files, and generated route manifest were removed. HTML files are now the maintained sources; the RSS feed and sitemap are edited directly. Local links work by opening `index.html` from disk, and hosted links retain folder URLs.

`assets/images/profile.png` is the owner's latest portrait. It replaces the older image and appears immediately in both the Studio overview and Tactical identity panel.

The Tactical view was rebuilt as a full-viewport dashboard based on renewed review of the supplied tactical/HUD and satellite-surveillance references. It has a navigation rail, portrait/identity panel, notebook panel, original conceptual terrain atlas, project dossiers, research readout, career timeline, and a paged document reader. Whole-page scrolling is disabled; document content is paginated within the viewport. No reference screenshot is reused as a website background.

Studio now starts with the owner's name and portrait rather than a generic orbital marketing hero. Shared dashboard summaries live in plain `assets/portfolio.js`, and page-specific dossier contents are read directly from the existing HTML DOM without network requests.

## Validation of the corrected revision

- 13 directly maintained HTML pages; all 438 relative asset/navigation references resolve.
- No package manifest, Node script, TypeScript file, generator, or compilation step remains in the current source tree.
- Renewed visual reference review covered all 41 files under `tactical/` and `render/Satellite Surveillance/`, including military HUD, contour map, instrument-panel, dense dark UI, and pale grid-interface references.
- Tactical overview, resume, notebook, and article navigation were exercised in the browser. The dashboard stays exactly within the viewport at desktop and mobile sizes.
- Reader previous/next controls and focus mode work; measured reader content height did not exceed its panel height during the exercised pages.
- Atlas zoom works, and Light/Dark and Studio/Tactical switches were reviewed. The latest `profile.png` loads in the first frame of both views.
- Direct file opening is supported by relative asset paths and local-folder link resolution; the in-app browser prohibits file URLs, so direct-file rendering was not visually tested there. Visual checks used a temporary local Python static preview, which is not part of the site or a user requirement.
- Browser print layout has not been exported and visually verified. Publication links were preserved from the sources rather than independently revalidated.
- No remote push or deployment is included in this revision.
