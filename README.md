# Mohsin Ali — static portfolio

Plain HTML, CSS, and browser JavaScript. No npm, Node.js, TypeScript, compiler, installation, or build step. Open `index.html` directly, or publish this directory on a static host. Detail pages use `folder/index.html` pretty URLs. Local-file navigation resolves those folders to `index.html`.

## Two independent experiences

- `/` — **Studio**: full-width portfolio with a fixed identity/profile area on the left and an independently scrolling content area on the right. Flat sections, social SVG icons, concise summaries, and View All links to static detail pages. GSAP handles heading reveals, content entrances, experience counters, the career timeline, acoustic waveform reveal, and reading progress. Motion is disabled for reduced-motion preferences. On mobile, content scrolls naturally with fixed bottom tabs.
- `/tactical/` — **Tactical**: full-screen military HUD. QType Square headings, Consolas/Courier console text, dot/cross grids, profile, live local/Dhaka clocks, visitor information, and a small optional spherical globe. Hash navigation changes content in place; article/project/full-resume details open in native dialogs. Only individual content panels/dialogs may scroll; the dashboard page stays fixed. Mobile uses five bottom tabs and a More menu for resume, research, contact, and widgets.
- Switching experiences preserves the selected section or detail. Each experience remembers its light/dark preference independently.

## Edit content directly

| File | Purpose |
| --- | --- |
| `index.html` | Studio's brief landing content |
| `about/`, `resume/`, `projects/`, `research/`, `contact/`, `blog/` | Maintained static detail pages |
| `assets/portfolio.js` | Identity and project/article/research summaries shared with Tactical |
| `assets/documents.js` | Local HTML dossiers for Tactical modals; keep matching entries synchronized with edited detail pages |
| `assets/studio.css`, `assets/studio.js`, `assets/experience.css` | Studio layout, responsive shell, and GSAP motion |
| `assets/tactical.css`, `assets/tactical.js` | Independent HUD layout and in-place navigation |
| `assets/controls.css` | Site-specific theme-toggle fix: suppresses the generic `.switch` skin's extra pseudo-element knob |
| `assets/location-map.js` | Optional amCharts globe, owner/visitor markers, drag rotation, and recenter controls |
| `assets/visitor-info.js` | Local browser readouts and visitor-initiated location requests |
| `assets/images/profile.png` | The current portrait, used by both experiences |

Tactical dossiers are ordinary JavaScript strings containing HTML, not compiled output or runtime server responses. New content does not require fetching another page or reloading the dashboard.

## Add a blog article

1. Copy `blog/a-new-home/index.html` to `blog/your-slug/index.html`.
2. Edit the title, description, canonical/Open Graph URLs, Article JSON-LD, heading, byline, date, and body. Preserve the shell and relative asset paths at this folder depth.
3. Add a card to `blog/index.html` and an article summary to `assets/portfolio.js`.
4. Add `/blog/your-slug/` to `assets/documents.js`, with its title and article HTML. Use root-relative internal links/images in that HTML; Tactical resolves them for hosted and local-file viewing.
5. Update `feed.xml`, `sitemap.xml`, and the landing page's featured note if appropriate. Disclose AI assistance and review the final text.

Save the files. Nothing needs to be compiled or generated.

## Visitor information and geography

Browser/OS indication, viewport, language, timezone, pointer/touch capability, exposed logical-core count, and network status are read locally. Unsupported information is labelled unavailable.

**Look up IP & region** connects to [GeoJS](https://www.geojs.io/docs/v1/endpoints/geo/), which receives the visitor's public IP. IP positions are approximate and can be affected by VPNs. **Use device location** requests browser permission; its coordinates remain on the page and are not sent to a portfolio backend or GeoJS. Declined/unavailable results are explicitly labelled. The owner marker is Dhaka city centre, not a private address.

The portfolio does not persist visitor IP/location data. Tactical tab changes retain the current session readout because they do not reload the document. Leaving the experience or reloading clears that session data. Globe scripts load locally only when the widget is enabled; the globe does not fetch tiles or live satellite imagery.

## Libraries and references

- Blueprint UI is a manually copied native-component snapshot under `assets/vendor/blueprint/`. Update corresponding `dist/blueprint.js`, `dist/blueprint.css`, and the segmented/accordion/copy-button/theme-toggle distributions. Vendor source has not been changed.
- GSAP 3.15.0 and ScrollTrigger are self-hosted classic scripts under `assets/vendor/gsap/`. Copyright headers and the vendor's standard license page are retained.
- amCharts 5 and worldLow geography are self-hosted under `assets/vendor/amcharts5/`. Its original linkware LICENSE and built-in branding remain intact.
- QType Square was copied from the user's `site_html/assets/fonts/QTypeSquare/` reference. Tactical console text uses installed Consolas or a monospace fallback.
- The user's `site_html` grid, crosshair, ruler, border, font experiments, and `143play_site_mockup.pptx` were inspected for visual direction. Reference boilerplate was not imported as portfolio content.

The original site and local assets are preserved on `codex/legacy-portfolio-2026-10-14`. Original content inventory and resume decisions remain under `docs/`. This local revision does not publish remotely or alter GitHub Pages settings.

### Contact provider
Studio and Tactical use the standalone Blueprint `x-contact-form` component. Google Form endpoint and entry mappings are configured in HTML (and shared Tactical markup in assets/portfolio.js). No build, npm, backend, or per-page submission JavaScript is required. Native submission opens Google confirmation in a new tab; the component never claims delivery. Use the direct Google Form link if provider restrictions prevent a custom form handoff.
