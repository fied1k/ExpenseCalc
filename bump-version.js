#!/usr/bin/env node
/**
 * bump-version.js
 * Automatically bumps version across ExpenseCalc files:
 * 1. Archives the previous version as ExpenseCalc_v{old}.html
 * 2. Saves the new release snapshot as ExpenseCalc_v{new}.html
 * 3. Copies the latest version to index.html (overwriting current index.html)
 * 4. Updates CHANGELOG.md and README.md
 * 5. Automatically commits and uploads to GitHub (overwriting remote index.html)
 *
 * Usage:
 *   node bump-version.js <new_version> "[optional release notes]" [--no-push]
 *   e.g.: node bump-version.js 1.2 "Added PDF export and refreshed dark theme"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const indexPath = path.join(rootDir, 'index.html');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');
const readmePath = path.join(rootDir, 'README.md');

if (!fs.existsSync(indexPath)) {
    console.error('Error: index.html not found in ' + rootDir);
    process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');

// 1. Detect current version from index.html
const versionMetaMatch = indexContent.match(/<meta\s+name=["']version["']\s+content=["']([^"']+)["']/i);
const currentVersion = versionMetaMatch ? versionMetaMatch[1] : '1.1';

// 2. Parse arguments
const args = process.argv.slice(2).filter(arg => arg !== '--no-push');
const noPush = process.argv.includes('--no-push');

let targetVersion = args[0];
let notes = args.slice(1).join(' ').trim();

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

console.log(`\n======================================================`);
console.log(`  ExpenseCalc Version Bump: v${currentVersion} -> v${targetVersion}`);
console.log(`======================================================\n`);

// 3. Save previous version archive if not already archived
const currentArchiveFile = path.join(rootDir, `ExpenseCalc_v${currentVersion}.html`);
if (!fs.existsSync(currentArchiveFile)) {
    fs.copyFileSync(indexPath, currentArchiveFile);
    console.log(`✓ Archived previous version: ExpenseCalc_v${currentVersion}.html`);
} else {
    console.log(`ℹ Previous version already archived: ExpenseCalc_v${currentVersion}.html`);
}

// 4. Update markup and script constants in memory
let newContent = indexContent;

// Update meta version
newContent = newContent.replace(
    /(<meta\s+name=["']version["']\s+content=["'])[^"']+([^>]*>)/i,
    `$1${targetVersion}$2`
);

// Update title
newContent = newContent.replace(
    /(<title>Cost Calculator)(?: v[^<]*)?(<\/title>)/i,
    `$1 v${targetVersion}$2`
);

// Update h1 version badge
newContent = newContent.replace(
    /(<span\s+class=["']version-tag["'][^>]*>)[^<]*(<\/span>)/i,
    `$1v${targetVersion}$2`
);

// Update APP_VERSION constant
newContent = newContent.replace(
    /(const\s+APP_VERSION\s*=\s*["'])[^"']+(["'];)/i,
    `$1${targetVersion}$2`
);

// 5. Save the latest version snapshot as ExpenseCalc_v{targetVersion}.html
const newArchiveFile = path.join(rootDir, `ExpenseCalc_v${targetVersion}.html`);
fs.writeFileSync(newArchiveFile, newContent, 'utf8');
console.log(`✓ Saved latest version snapshot: ExpenseCalc_v${targetVersion}.html`);

// 6. Make a copy named index.html overwriting the current one
fs.copyFileSync(newArchiveFile, indexPath);
console.log(`✓ Copied latest version to index.html (overwriting current index.html)`);

// 7. Update CHANGELOG.md
const today = new Date().toISOString().split('T')[0];
if (fs.existsSync(changelogPath)) {
    const changelogContent = fs.readFileSync(changelogPath, 'utf8');
    const newEntry = `## [${targetVersion}] - ${today}\n\n${notes ? `### Notes\n- ${notes}\n` : '### Changed\n- Version update.\n'}\n`;
    
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

// 8. Update README.md
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

// 9. Upload to GitHub overwriting remote index.html
if (!noPush) {
    try {
        console.log(`\nUploading latest index.html and archives to GitHub...`);
        execSync('git add index.html ExpenseCalc_v*.html CHANGELOG.md README.md bump-version.js', { stdio: 'inherit' });
        execSync(`git commit -m "Release v${targetVersion}: update index.html and archive ExpenseCalc_v${targetVersion}.html"`, { stdio: 'inherit' });
        execSync('git push origin main', { stdio: 'inherit' });
        console.log(`\n🎉 Successfully uploaded! Remote index.html has been overwritten with v${targetVersion}.`);
    } catch (gitErr) {
        console.warn(`\n⚠ Git auto-upload encountered an issue: ${gitErr.message}`);
        console.log(`You can manually push using:`);
        console.log(`  git add .`);
        console.log(`  git commit -m "Release v${targetVersion}"`);
        console.log(`  git push origin main`);
    }
} else {
    console.log(`\nℹ Skipped GitHub upload (--no-push flag detected).`);
    console.log(`To commit and push manually:`);
    console.log(`  git add .`);
    console.log(`  git commit -m "Release v${targetVersion}"`);
    console.log(`  git push origin main\n`);
}
