#!/usr/bin/env node
/**
 * bump-version.js
 * Automatically bumps version across ExpenseCalc files, archives previous version,
 * and updates CHANGELOG.md and README.md.
 *
 * Usage:
 *   node bump-version.js <new_version> "[optional release notes]"
 *   e.g.: node bump-version.js 1.2 "Added dark mode enhancements and export options"
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const indexPath = path.join(rootDir, 'index.html');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');
const readmePath = path.join(rootDir, 'README.md');

if (!fs.existsSync(indexPath)) {
    console.error('Error: index.html not found in ' + rootDir);
    process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');

// 1. Detect current version
const versionMetaMatch = indexContent.match(/<meta\s+name=["']version["']\s+content=["']([^"']+)["']/i);
const currentVersion = versionMetaMatch ? versionMetaMatch[1] : '1.1';

// 2. Determine target version
let targetVersion = process.argv[2];
let notes = process.argv.slice(3).join(' ').trim();

if (!targetVersion) {
    const parts = currentVersion.split('.');
    if (parts.length >= 2) {
        parts[parts.length - 1] = parseInt(parts[parts.length - 1], 10) + 1;
        targetVersion = parts.join('.');
    } else {
        targetVersion = currentVersion + '.1';
    }
    console.log(`No version specified. Auto-incrementing from v${currentVersion} to v${targetVersion}`);
}

targetVersion = targetVersion.replace(/^v/i, '');

if (targetVersion === currentVersion) {
    console.error(`Target version (${targetVersion}) matches current version (${currentVersion}). Specify a new version.`);
    process.exit(1);
}

console.log(`\n========================================`);
console.log(`  ExpenseCalc Version Bump: v${currentVersion} -> v${targetVersion}`);
console.log(`========================================\n`);

// 3. Archive current version if not already archived
const currentArchiveFile = path.join(rootDir, `ExpenseCalc_v${currentVersion}.html`);
if (!fs.existsSync(currentArchiveFile)) {
    fs.copyFileSync(indexPath, currentArchiveFile);
    console.log(`✓ Archived previous version: ExpenseCalc_v${currentVersion}.html`);
} else {
    console.log(`ℹ Previous version already archived: ExpenseCalc_v${currentVersion}.html`);
}

// 4. Update index.html
let newIndexContent = indexContent;

// Update meta version
newIndexContent = newIndexContent.replace(
    /(<meta\s+name=["']version["']\s+content=["'])[^"']+([^>]*>)/i,
    `$1${targetVersion}$2`
);

// Update title
newIndexContent = newIndexContent.replace(
    /(<title>Cost Calculator)(?: v[^<]*)?(<\/title>)/i,
    `$1 v${targetVersion}$2`
);

// Update h1 version badge
newIndexContent = newIndexContent.replace(
    /(<span\s+class=["']version-tag["'][^>]*>)[^<]*(<\/span>)/i,
    `$1v${targetVersion}$2`
);

// Update APP_VERSION constant
newIndexContent = newIndexContent.replace(
    /(const\s+APP_VERSION\s*=\s*["'])[^"']+(["'];)/i,
    `$1${targetVersion}$2`
);

fs.writeFileSync(indexPath, newIndexContent, 'utf8');
console.log(`✓ Updated index.html with version v${targetVersion}`);

// 5. Create new version snapshot file
const newArchiveFile = path.join(rootDir, `ExpenseCalc_v${targetVersion}.html`);
fs.copyFileSync(indexPath, newArchiveFile);
console.log(`✓ Created new release snapshot: ExpenseCalc_v${targetVersion}.html`);

// 6. Update CHANGELOG.md
const today = new Date().toISOString().split('T')[0];
if (fs.existsSync(changelogPath)) {
    const changelogContent = fs.readFileSync(changelogPath, 'utf8');
    const newEntry = `## [${targetVersion}] - ${today}\n\n${notes ? `### Notes\n- ${notes}\n` : '### Changed\n- Version update.\n'}\n`;
    
    // Insert after "---" separator
    const separatorIdx = changelogContent.indexOf('---');
    if (separatorIdx !== -1) {
        const updatedChangelog = changelogContent.slice(0, separatorIdx + 3) + '\n\n' + newEntry + changelogContent.slice(separatorIdx + 3);
        fs.writeFileSync(changelogPath, updatedChangelog, 'utf8');
        console.log(`✓ Added v${targetVersion} entry to CHANGELOG.md`);
    } else {
        fs.writeFileSync(changelogPath, changelogContent + '\n\n' + newEntry, 'utf8');
        console.log(`✓ Appended v${targetVersion} entry to CHANGELOG.md`);
    }
}

// 7. Update README.md
if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Update badge version
    readmeContent = readmeContent.replace(
        /(version-)[0-9.]+(-green\.svg)/i,
        `$1${targetVersion}$2`
    );

    // Update table status
    readmeContent = readmeContent.replace(
        /(`index\.html`[^|]*\|[^|]*\|)\s*\*\*Current[^*]*\*\*/i,
        `$1 **Current (v${targetVersion})**`
    );

    // Add row to version archive table if not present
    const tablePattern = /\|\s*\[`index\.html`\]\([^\)]+\)[^|]*\|[^|]*\|[^\n]*\n/;
    const tableMatch = readmeContent.match(tablePattern);
    if (tableMatch) {
        const newRow = `| [\`ExpenseCalc_v${targetVersion}.html\`](ExpenseCalc_v${targetVersion}.html) | Release v${targetVersion} standalone archive | **Current** |\n`;
        // Ensure previous row is marked archived
        readmeContent = readmeContent.replace(
            new RegExp(`(\\|\\s*\\[\`ExpenseCalc_v${currentVersion}\\.html\`\\][^\n]*\\*\\*)Current(\\b[^\n]*\\n)`, 'i'),
            `$1Archived$2`
        );
        if (!readmeContent.includes(`ExpenseCalc_v${targetVersion}.html`)) {
            readmeContent = readmeContent.replace(tableMatch[0], tableMatch[0] + newRow);
        }
    }

    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log(`✓ Updated version references in README.md`);
}

console.log(`\n🎉 Success! Version bumped to v${targetVersion}`);
console.log(`To commit and push these changes:\n`);
console.log(`  git add .`);
console.log(`  git commit -m "Bump version to v${targetVersion}"`);
console.log(`  git push origin main\n`);
