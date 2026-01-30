module.exports = {
    headless: false,
    maxPages: 0,
    startPage: 1,

    baseUrl: 'https://www.couponami.com/all',

    enroll: true,

    userDataDir: './udemy_profile',
    chromePath: process.env.CHROME_PATH || undefined,

    historyFile: './history.json',
    reportFile: './enrollment_report.md'
};
