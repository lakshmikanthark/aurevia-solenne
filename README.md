# AUREVIA — Maison Solenne

A cinematic real-estate website concept by **Lakshmikantha R K**, created to demonstrate the kind of complete website experience available for a property business: discover the setting, explore homes, compare choices and carry a selected residence into an enquiry preview.

**AUREVIA** is the brand. **Maison Solenne** is the fictional residential development.

## Explore the experience

- Animated architectural storytelling and Day / Night presentation
- 18 fictional residences across Courtyard, Belvedere and Atelier collections
- Residence filters, sorting, quick views and comparisons of up to three homes
- Detailed residence pages and a sample viewing journey
- Image gallery, journal, setting, vision, studio and project case study
- Responsive layouts, keyboard controls and reduced-motion support

The residence data, prices, availability and architectural scenes are illustrative. The viewing form is a local demonstration: it does not send, save or book an enquiry. This project is an independent concept, not a client commission. No commercial results are claimed.

The case study explains the design decisions, contribution, AI assistance and creative references.

## Publish on GitHub Pages

Suggested repository name: **aurevia-solenne**.

1. Create a new public repository under `lakshmikanthark` named `aurevia-solenne`.
2. Extract the supplied ZIP on your computer.
3. Upload the extracted files and folders to the repository root and commit them to `main`. Upload the contents, not the ZIP itself or an extra enclosing folder. `index.html`, `assets/`, `residences/` and `.nojekyll` should sit at the top level.
4. Open **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/(root)**, then save.
5. Wait for deployment to finish. Return to Pages and use **Visit site** to obtain the confirmed live URL.
6. Add that live URL to the repository's About / Website field and to the Solenne project in the portfolio.

For the suggested repository name, the expected address after successful deployment is `https://lakshmikanthark.github.io/aurevia-solenne/`. This address is a deployment target; the package does not create the repository or publish it automatically.

No npm installation or build command is required. The site uses native HTML, CSS and JavaScript with local images and fonts. Relative paths support a repository subdirectory. `.nojekyll` instructs Pages to serve the static files without a Jekyll build.

Official instructions: [Create a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) · [Configure the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Preview locally

From the extracted folder:

```sh
python -m http.server 4173
```

Open `http://localhost:4173/`.

## Checks completed for this package

- All 87 original archive files are preserved byte for byte.
- Local HTML file and asset references resolved in the supplied source.
- Browser checks at 1440 × 900 and 390 × 844 covered the menu, residence filters, comparison dialog and sample viewing confirmation.
- Those checks reported no JavaScript page errors or horizontal overflow on the home page.
- The home page was also opened with normal motion on desktop and mobile. These are local checks, not a full animation audit or a live GitHub Pages deployment test.

The original fictional demo's `noindex` directives remain in place. Visitors can use the direct public link after deployment; these directives ask search engines not to index the demonstration pages.

## Structure

- `index.html` — main experience
- `assets/` — styles, motion, scripts, fonts and architectural imagery
- `residences/` — finder and individual residence pages
- `private-viewing/` — sample enquiry journey
- `case-study/` — design reasoning and contribution
- `gallery/`, `vision/`, `setting/`, `experiences/`, `journal/`, `studio/` — supporting pages
- `privacy/`, `terms/`, `LICENSE.txt` — demonstration terms and credits

## Credits and usage

Strategy, identity, visual direction and frontend implementation by Lakshmikantha, with AI assistance in development and writing. Generated architectural scenes and reference credits are disclosed in the website.

The project retains its original proprietary portfolio license in `LICENSE.txt`; publishing the source does not make it open source. Font license and attribution files remain included.

[Creator's portfolio](https://lakshmikantha.in/)
