# Mohsin Ali — static portfolio

Only HTML, CSS, and browser JavaScript. No npm, Node.js, TypeScript, compiler, generator, installation, or build step.

Open `index.html` directly in a browser, or host this directory on any static host. Each page is maintained directly in its own `folder/index.html`. Hosted navigation uses pretty folder URLs; JavaScript resolves those same links to `index.html` when browsing local files. Assets and styles use relative paths. No fetch requests, database, or application server are needed.

## Views

- **Studio:** a personal portfolio led by the current profile photo, name, career, projects, and writing.
- **Tactical:** a full-screen surveillance-style dashboard with a navigation rail, identity panel, conceptual terrain/work atlas, notebook, engineering dossiers, research, and career timeline. The document reader uses previous/next pages instead of scrolling the whole page. It also has a focus control and atlas zoom/reset controls.
- Both views have Light/Dark controls using Blueprint UI. Preferences persist where browser local storage is available.
- The atlas is an original conceptual portfolio illustration, not live satellite imagery or telemetry.

## Edit directly

| File | Content |
| --- | --- |
| `index.html` | Studio portfolio overview |
| `about/index.html` | Profile and capabilities |
| `resume/index.html` | Web resume and print layout |
| `projects/index.html` and `projects/*/index.html` | Work and case studies |
| `research/index.html` | Publications |
| `contact/index.html` | Contact information |
| `blog/index.html` and `blog/*/index.html` | Notebook and articles |
| `assets/portfolio.js` | Shared dashboard identity, navigation, article/project summaries, and links |
| `assets/images/profile.png` | Current profile picture, used in both views |
| `assets/site.css`, `assets/portfolio.css` | Studio styling |
| `assets/console.css`, `assets/console.js` | Tactical dashboard component |

Tactical readers reuse the content already present in each page's HTML. The shared dashboard summaries are edited in `assets/portfolio.js`. This is ordinary browser JavaScript, not a build configuration.

## Add a blog article

1. Copy `blog/a-new-home/index.html` to `blog/your-slug/index.html`.
2. Edit its title, description, canonical/Open Graph URLs, JSON-LD, article heading, byline, date, and article body. Keep `body page="article"` and the relative assets unchanged at this folder depth.
3. Add an article card and category on `blog/index.html`, and add a summary/link to `assets/portfolio.js`.
4. Add its URL and publication details to `feed.xml` and `sitemap.xml`. Update the overview's featured article when appropriate.
5. Review AI-assisted writing and identify assistance in its byline. Keep drafts outside the public repository until ready.

Save the files. There is nothing to compile or regenerate.

## Update the component library

Copy the corresponding existing distribution files from your Blueprint UI library into `assets/vendor/blueprint/`:

- `dist/blueprint.js` and `dist/blueprint.css`
- `dist/components/segmented/`, `accordion/`, `copy-button/`, and `theme-toggle/`

Keep folder names intact. This portfolio loads those native web components directly. Its skin styles live separately, and the original library has not been modified. `snapshot.json` records the imported version.

## Preservation

The original WordPress mirror and local assets are preserved on `codex/legacy-portfolio-2026-10-14`. `docs/legacy-inventory.json` contains the original 66-page text/link/image inventory. See `docs/migration.md` for resume conflicts and source decisions.

Nothing in this local revision changes GitHub Pages settings or publishes remotely.
