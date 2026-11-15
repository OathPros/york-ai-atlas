# York AI Atlas

An independent, interactive audit of AI information published across York University websites. It maps resources, atomic user needs, overlapping answers and a proposed consolidated AI @ York front door.

**Not an official York University publication.** The visual theme uses York red (`#E31837`), charcoal and neutral greys, without a logo or monogram. Darker red is used for small link text to preserve contrast.

## Explore

Open `index.html` or the self-contained `York-AI-Atlas.html` in a browser. No server, sign-in or network connection is needed to explore the packaged snapshot; original source links require internet access.

The atlas includes 179 grouped resources, 46 analyst-inferred atomic needs, 160 need-to-content relationships, 12 overlap/risk clusters and a seven-section proposed hub. These counts describe the captured audit, not a complete census. Coverage judgements and potential gaps need institutional owner and user validation. Multiple answers are not automatically redundant.

The interface supports search, combined filters, sorting, shareable URL fragments, source drill-through and CSV export. `briefing.html` provides a printable summary. Full CSV, structured data and evidence files accompany the report.

## Turn on GitHub Pages when ready

Pages is deliberately **not enabled**, and publication does not run on push.

1. In this repository, open **Settings > Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Open **Actions > Deploy atlas to GitHub Pages > Run workflow**, select `main`, and run it.
4. After the deployment succeeds, visit **https://oathpros.github.io/york-ai-atlas/**.

Updates are also manual: push changes, then run that workflow again. The separate **Validate atlas** workflow checks pushes and pull requests but never publishes. No custom domain or third-party hosting is required.

## Build and test

Requires Node.js 24 or newer. From the repository directory:

```shell
npm ci --ignore-scripts
npm run check
npm run build
npm test
```

`npm run build` rebuilds the data, bundled report and briefing from the checked-in evidence snapshot, then stages an explicit allowlist of public site files in `dist`. It does **not** crawl York websites, change the evidence date, or deploy anything. GitHub Pages uploads only `dist`, not dependencies, research scripts or browser profiles.

`npm test` checks the evidence and interface, then serves the staged site locally under `/york-ai-atlas/` to verify asset loading, deep links and download paths for project Pages.

For real-browser offline, mobile, keyboard, navigation and CSV-download checks:

```shell
npm run test:browser
```

The browser check defaults to Microsoft Edge's standard Windows installation. For another installed Chromium browser, set `YORK_AUDIT_BROWSER` to its executable path. It uses a dedicated temporary profile and closes only its own browser instance.

## Source snapshot and maintenance

`curation.cjs` holds reviewed resource summaries and consolidation findings. `needs.cjs` defines atomic needs, source mappings, coverage judgements and bounded gap hypotheses. Generated deliverables should be rebuilt after changing these sources.

`sources.json`, `pdf-evidence.json` and `supplemental-evidence.json` retain the public-source extraction evidence. Evidence excerpts, URLs and retrieval metadata support the audit; source materials remain attributable to their original publishers. No licence to York source content or branding is granted by this repository.

Collection scripts are provided separately for deliberate refreshes: `collect.cjs` requires Node.js and jsdom; `extract_pdfs.py` requires Python and pypdf. **The collector overwrites `sources.json`**. Preserve dated evidence before refreshing, then review changed content and coverage judgements before rebuilding. A rebuild alone is not a new verification of York's current guidance.
