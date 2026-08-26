# sihe-assets

Public asset archive for the Satcher Health Leadership Institute (SHLI). Published via GitHub Pages at:

**https://satcherinstitute.github.io/sihe-assets/**

## What this is for

A permanent, independent home for files that were originally hosted elsewhere (e.g. Constant Contact) and are at risk of link rot. Files here get a stable URL that isn't tied to a third-party platform's retention policy.

## Structure

```
sihe-assets/
└── newsletters/
    ├── 2024-01_End-the-Epidemic-Newsletter.html
    ├── 2024-02_End-the-Epidemic-Newsletter.html
    ├── ...
    └── 2025-12_End-the-Epidemic-Newsletter.html
```

Each subfolder here represents one category of archived asset. Right now there's just `newsletters/`, but future categories (e.g. `resources/`, `reports/`) should follow the same pattern — one folder per type, flat files inside, no further nesting.

## Newsletters

Monthly "End the Epidemic" newsletters from the Georgia Thrives / Ending the HIV Epidemic (EHE) campaign, originally sent via Constant Contact.

**Naming convention:** `YYYY-MM_End-the-Epidemic-Newsletter.html`

Example: `2025-12_End-the-Epidemic-Newsletter.html` → **December 2025** issue.

**Adding a new month:**
1. Save the newsletter as a standalone `.html` file (export or "Save As Webpage" from the original email/campaign).
2. Name it following the convention above.
3. Upload it into `newsletters/`.
4. The published URL will automatically be:
   `https://satcherinstitute.github.io/sihe-assets/newsletters/YYYY-MM_End-the-Epidemic-Newsletter.html`
5. Update the corresponding Newsletter item in the Webflow CMS (Satcher Institute site) with that URL in the **External URL** field.

## Enabling / confirming GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → Branch: **main** → Folder: **/ (root)**. No build step needed since these are static HTML files.
