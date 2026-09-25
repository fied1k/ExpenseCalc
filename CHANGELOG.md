# Changelog

All notable changes to the **ExpenseCalc** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-09-24

### Security & Safety
- **XSS Sanitization:** Implemented `escapeHtml()` sanitizer for dynamic expense item descriptions before injection into the receipt DOM.
- **Credential Protection:** Ensured Git remote URLs and repository configurations keep personal access tokens out of plaintext configs.

### Fixed
- **Circular Keyboard Navigation:** Fixed negative modulo indexing bug on autocomplete dropdowns (`ArrowUp` / `ArrowDown`), preventing `TypeError` on out-of-bound list items.
- **Race Condition in Autocomplete:** Replaced global shared debounce timer and `AbortController` with per-input scoped controllers (`startLoc`, `endLoc`, `defaultStartInput`), preventing input collisions.
- **Dropdown Scroll Dismissal:** Fixed document-level click handler to check `!e.target.closest('.autocomplete-container')`, allowing users to drag and click dropdown scrollbars without prematurely dismissing suggestions.
- **Divergent Math & Deduction Logic:** Unified the calculation engine under a single `calculateTotals(state)` function so the live UI receipt and copied clipboard text always match 100%.

### Added
- **Cab-Friendly Mobile Sticky Summary Bar:** Added a high-contrast sticky bottom summary bar (`Grand Total` + `Copy` button) on viewports < 820px so drivers in dark vehicle cabs do not have to scroll down to view totals.
- **Live Receipt Empty State:** Replaced the plain text empty notice with a structured receipt preview showing `$0.00` line items and awaiting status.
- **Visual Input Cues:** Added iconography to input fields (📍 Start, 🏁 Destination, 🚗 Miles, ⏱️ Hours).
- **Settings Toggle Indicator:** Added an animated chevron indicator (`▾` / `▴`) to the settings toggle button.
- **Loading State:** Added an inline animated CSS spinner to the "Calculate Route" button during active API queries.
- **Persistent Location Coordinates:** Default start address now saves `costCalc_startLat` and `costCalc_startLon` in `localStorage`, eliminating repeated geocoding lookups for the saved home address.
- **Session Geocode Cache:** Autocomplete and lookup queries are now cached across page reloads in `sessionStorage` to avoid redundant Nominatim API hits.

### Changed
- Preserved previous version archive as `ExpenseCalc_v1.0.html`.

---

## [1.0.0] - 2026-09-24

### Added
- Initial release of the single-page Cost Calculator (`ExpenseCalc`).
- OpenStreetMap Nominatim address autocomplete and geocoding.
- Project-OSRM driving distance and duration route calculation.
- 30-mile deductible deduction and 0.81 driving time adjustment factor.
- Custom mileage rate and hourly rate configuration with `localStorage` persistence.
- High-contrast night / dark mode with instant pre-render theme check to prevent white flash in vehicle cabs.
- Dynamic line-item additional expenses table.
- One-click copy formatted receipt to clipboard.
