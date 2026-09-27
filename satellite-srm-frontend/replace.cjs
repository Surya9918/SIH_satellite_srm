const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.match(/\.(tsx|ts|jsx|js|css|html)$/)) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
let totalFound = 0;
let totalReplaced = 0;
let modifiedFiles = [];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace text-muted with text-muted-foreground
    // Negative lookahead to prevent replacing text-muted-foreground
    // Negative lookbehind to prevent replacing non-text usage like bg-text-muted (if it existed) or similar, though text-muted is specifically what we want.
    // We want to replace exact matches of `text-muted` as a CSS class or word, not inside a variable name unless it's a string.
    const regex = /text-muted(?!\-foreground)/g;
    
    const matches = content.match(regex);
    if (matches) {
        // Double check it's not a CSS variable definition like --text-muted
        const newContent = content.replace(regex, (match, offset, string) => {
            const before = string.slice(Math.max(0, offset - 2), offset);
            if (before === '--') {
                return match; // Don't replace --text-muted
            }
            return 'text-muted-foreground';
        });
        
        // Count actual replacements made
        const actualMatches = content.length !== newContent.length;
        if (actualMatches) {
            // Count how many were actually replaced
            let replacedCount = 0;
            let tempContent = content;
            tempContent.replace(regex, (match, offset, string) => {
                const before = string.slice(Math.max(0, offset - 2), offset);
                if (before !== '--') replacedCount++;
                return match;
            });
            
            if (replacedCount > 0) {
                fs.writeFileSync(file, newContent, 'utf8');
                totalFound += replacedCount;
                totalReplaced += replacedCount;
                modifiedFiles.push(file.replace(__dirname + '\\', ''));
            }
        }
    }
});

console.log(JSON.stringify({ totalFound, totalReplaced, modifiedFiles }, null, 2));
