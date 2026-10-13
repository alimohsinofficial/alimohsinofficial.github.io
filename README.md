# Mohsin Ali — portfolio & field notebook

Static HTML, CSS, JavaScript, and a pinned local Blueprint UI snapshot. Production has no runtime dependencies. Generated pages are committed in the repository root so the existing GitHub Pages branch deployment can continue to use `master` / root.

## Develop

Requires Node.js only for authoring and generation; visitors need no Node runtime.

```sh
npm run build
npm run check
npm run dev
```

Open http://127.0.0.1:4173/. Every content route uses a directory with `index.html`, including articles and project case studies. `404.html` is the static-host error document.

## Update content

- `content/profile.json`: career, education, skills, links, and research.
- `content/projects.json`: case studies and reported outcomes.
- `content/posts/*.md`: articles. Copy `_template.md`; choose a unique lowercase hyphenated slug. Use `status: draft` while preparing and reviewing. Set `status: published` to include it in pages, RSS, and sitemap. Future dates stay unpublished until rebuilt on or after that date in Asia/Dhaka. The parser supports paragraphs, headings, unordered lists, code fences, inline code, bold, and Markdown links. Raw HTML is escaped.
- AI-assisted writing should use `ai_assisted: true`. Review factual claims and add sources before publishing. The initial article is explicitly labelled an AI-assisted site note.

Run `npm run build` after content changes, then commit the generated HTML, feed, and sitemap with source. Publication is through the repository's GitHub Pages configuration; this task does not change remote deployment settings.

## Update Blueprint UI

```sh
npm run sync:blueprint -- "E:/WorkSpace/my/projects/blueprint_lib/gemini-blueprint-ui"
npm run build
npm run check
```

The sync script copies the library's existing distribution core and four selected components. Rebuild that library's distribution first if its component source has changed. Portfolio styles are separate in `assets/site.css`; the original library is not modified. Snapshot provenance lives in `assets/vendor/blueprint/snapshot.json`.

## Appearances

Studio and Tactical modes share content. Each supports Light and Dark. Blueprint's theme control and the style selector persist choices in browser local storage. The resume has print styles for browser Save as PDF; the source PDF is separately linked and labelled.

## Migration

The complete original site and seven previously untracked image assets are preserved on `codex/legacy-portfolio-2026-10-14` (commit `354c978`). Read `docs/migration.md` for source decisions and unresolved differences. `docs/legacy-inventory.json` contains extracted text, links, and image references from all 66 original HTML documents.
