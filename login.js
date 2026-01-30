const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const config = require('./config');

async function login() {
    console.log('Launching browser for login...');
    console.log('Please log in to Udemy in the opened window.');
    console.log('The script will wait for you to close the browser manually.');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: config.chromePath,
        args: ['--start-maximized'],
        userDataDir: config.userDataDir
    });

    const page = await browser.newPage();
    await page.goto('https://www.udemy.com/join/login-popup/', { waitUntil: 'networkidle2' });

    browser.on('disconnected', () => {
        console.log('Browser closed. Session saved.');
        process.exit(0);
    });
}

login();
