# ExpenseCalc

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-green.svg)](CHANGELOG.md)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](index.html)

A lightweight, high-performance travel and expense calculator designed for field technicians, contractors, and transport drivers. Optimized for rapid calculations and low-light environments (vehicle cabs).

---

## 🌟 Features

- **Route Auto-Calculator:** Automatically calculates driving mileage and travel time using [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) for geocoding and [Project-OSRM](https://project-osrm.org/) for routing.
- **Round-Trip & Deductible Rules:** 
  - Automatically calculates round-trip totals (One Way × 2).
  - Automatically subtracts non-billable deductible miles (standard 30-mile deductible with smart capping).
  - Applies 0.81 driving time adjustment factor for realistic routing estimates.
- **Custom Rates:** Configure custom mileage rates (e.g. `$0.725/mi`) and hourly labor rates (e.g. `$37.50/hr`), saved automatically in `localStorage`.
- **Default Start Address:** Save your home depot or dispatch location with cached coordinates to instantly route jobs without re-entering your starting location.
- **Additional Expenses:** Add customizable itemized receipts (tolls, parking, parts, meals) with instant live recalculation.
- **Security Sanitization:** Built-in XSS escaping prevents malicious input injection from expense item labels.
- **Cab-Friendly Night Mode:** High-contrast Dark Mode with an immediate `<head>` script check to prevent white-flash glare when opening on mobile screens in vehicle cabs.
- **Mobile Sticky Summary Bar:** On mobile viewports (< 820px), a persistent bottom action bar keeps the Grand Total and Copy button accessible without scrolling down.
- **One-Click Ledger Copy:** Formats clean, auditable receipt text ready to paste into emails, invoices, or expense reports.
- **Zero Dependencies:** Pure vanilla HTML5, CSS3, and JavaScript — runs offline (for manual calculations) or hosted as a static website on GitHub Pages.

---

## 🚀 Live Demo & Usage

1. Open `index.html` in any modern web browser or visit the hosted GitHub Pages URL.
2. **Auto-Route:** Enter a Start location (or load your saved default) and a Destination, then click **Calculate Route**.
3. **Manual Entry:** Alternatively, type miles and driving hours directly into the manual inputs.
4. **Additional Items:** Click **+ Add Expense Item** for tolls, parking, or fees.
5. **Copy Receipt:** Click **Copy to Clipboard** to get a formatted ledger breakdown.

---

## 📁 Repository Structure & Version Archive

Each iteration is versioned and archived so past releases are preserved:

| File | Description | Status |
| :--- | :--- | :--- |
| [`index.html`](index.html) | Production application (serves the latest version) | **Current (v1.1)** |
| [`ExpenseCalc_v1.1.html`](ExpenseCalc_v1.1.html) | Release v1.1 standalone archive | **Archived** |
| [`ExpenseCalc_v1.0.html`](ExpenseCalc_v1.0.html) | Release v1.0 initial build archive | **Archived** |
| [`CHANGELOG.md`](CHANGELOG.md) | Full detailed version history and release notes | Active |
| [`bump-version.js`](bump-version.js) | Automated versioning and archiving script | Active |

---

## 🔄 Automated Versioning Script

To automatically bump the version, archive the previous release, and update the changelog:

```bash
# Usage: node bump-version.js <new_version> "[optional changelog notes]"
node bump-version.js 1.2 "Added PDF export and refreshed dark theme"
```

### What `bump-version.js` Does Automatically:
1. Detects the current active version from `index.html`.
2. Archives the current version as `ExpenseCalc_v{old}.html` (if not already archived).
3. Updates the version tag and page title inside `index.html`.
4. Saves a duplicate snapshot as `ExpenseCalc_v{new}.html`.
5. Prepend the new release notes to `CHANGELOG.md` and updates `README.md`.

---

## 📜 Changelog Summary

### [v1.1.0] — 2026-09-24
- **Security:** Added HTML entity escaping (`escapeHtml()`) to prevent XSS in itemized expenses.
- **Keyboard Navigation:** Fixed circular index wrapping on autocomplete suggestions without negative modulo errors.
- **Performance:** Scoped `debounceTimer` and `AbortController` per input field; added `sessionStorage` geocoding cache.
- **UI/UX:** Added mobile sticky bottom summary bar, structured empty receipt preview, field icons, and animated settings chevron.
- **Architecture:** Centralized calculation logic in `calculateTotals()` to ensure 100% synchronization between live UI and copied ledger text.

### [v1.0.0] — 2026-09-24
- Initial release with OpenStreetMap Nominatim and OSRM routing.
- Roundtrip calculation with 30-mile deductible rules.
- LocalStorage persistence for user rates and default start location.
- High-contrast vehicle dark theme.

For full release details, see [CHANGELOG.md](CHANGELOG.md).
