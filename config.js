module.exports = {
    headless: false,
    maxPages: 0,
    startPage: 1,

    baseUrl: 'https://www.couponami.com/all',

    enroll: true,

    userDataDir: './udemy_profile',
    chromePath: getChromePath(),

    historyFile: './history.json',
    reportFile: './enrollment_report.md'
};

function getChromePath() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

    const fs = require('fs');
    const commonPaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        '/usr/bin/google-chrome-stable'
    ];

    for (const path of commonPaths) {
        if (fs.existsSync(path)) return path;
    }
    return undefined;
}
