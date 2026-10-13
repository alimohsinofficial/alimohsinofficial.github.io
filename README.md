# Mohsin Ali — static portfolio

Only HTML, CSS, and browser JavaScript. No npm, Node.js, TypeScript, compiler, generator, installation, or build step.

Open `index.html` directly in a browser, or host this directory on any static host. Each page is maintained directly in its own `folder/index.html`. Hosted navigation uses pretty folder URLs; JavaScript resolves those same links to `index.html` when browsing local files. Assets and styles use relative paths. The portfolio, geography, and browser readouts work without an application server. The visitor can optionally request an external IP/location lookup.

## Views

- **Studio:** the original portfolio's vCard structure, improved with a persistent portrait card, a compact vertical icon menu, and a separately scrolling content card. The profile remains visible on the notebook, project, research, and resume pages. Mobile uses a compact profile card above the content pane.
- **Tactical:** a full-screen military HUD based specifically on `ref/tactical/HUD Military Interface`. It has a dot-and-cross background, a tilted native Canvas geographic map, owner/visitor pins, a visitor readout, and local/Dhaka clocks updated every second. Long documents use previous/next pages in the frame. The map supports pan, zoom, rotate, flat/3D, and reset controls.
- Both views have Light/Dark controls using Blueprint UI. Preferences persist where browser local storage is available.
- Studio Light and Tactical Dark retain their earlier palettes; Studio Dark now uses warm charcoal, and Tactical Light uses cool grey-blue instrument surfaces.
- Geographic outlines are local [Natural Earth land data](https://www.naturalearthdata.com/about/terms-of-use/). The raised surface is a visual 3D extrusion, not measured terrain elevation or live satellite imagery.

## Visitor information

Browser/OS indication, viewport, language, timezone, touch/pointer support, exposed logical-core count, and online/effective-network status are read locally. Unsupported values are shown as unavailable.

**Look up IP & region** calls [GeoJS](https://www.geojs.io/docs/v1/endpoints/geo/), which receives the visitor's IP address. Returned locations are explicitly approximate, and VPNs may change them. The service can be unavailable; the local map and browser details still work.

**Use device location** requests the browser's geolocation permission. Received coordinates remain on the page and are not sent to GeoJS or a portfolio backend. Browser support and a permitted secure context determine availability. Declined or unavailable location is labelled; no visitor coordinate is invented. The owner marker uses Dhaka city-centre coordinates, not a private address.

No visitor IP or location data is saved by the portfolio. Navigating to a new page requires a new location lookup if desired. The clock uses the visitor's local timezone alongside the Dhaka clock.

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
| `assets/studio.css`, `assets/studio.js` | Portfolio card styling and menu icons |
| `assets/site.css`, `assets/portfolio.css` | Shared presentation styles |
| `assets/console.js`, `assets/hud-layout.js`, `assets/hud.css` | Tactical layout and document reader |
| `assets/location-map.js`, `assets/world-land.js` | Native 3D geographic rendering and local coastline data |
| `assets/visitor-info.js` | Local browser readout and opt-in location controls |

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
