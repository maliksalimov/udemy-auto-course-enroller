const config = require('./config');
const fs = require('fs');

console.log('--- Debugging Chrome Path ---');
console.log('Resolved config.chromePath:', config.chromePath);

const commonPaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/usr/bin/google-chrome-stable'
];

console.log('\nChecking common paths manually:');
commonPaths.forEach(p => {
    console.log(`"${p}": ${fs.existsSync(p) ? 'FOUND' : 'MISSING'}`);
});
console.log('-----------------------------');
