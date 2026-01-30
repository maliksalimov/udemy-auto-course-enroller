const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config = require('./config');

puppeteer.use(StealthPlugin());

let history = {};
try {
    if (fs.existsSync(config.historyFile)) {
        history = JSON.parse(fs.readFileSync(config.historyFile, 'utf8'));
    }
} catch (e) {
    console.error('Error reading history:', e.message);
}

function saveHistory() {
    fs.writeFileSync(config.historyFile, JSON.stringify(history, null, 2));
}

function addToReport(text) {
    const timestamp = new Date().toISOString().split('T')[0];
    const logLine = `[${timestamp}] ${text}\n`;
    fs.appendFileSync(config.reportFile, logLine);
}

async function main() {
    console.log('Starting Udemy Course Scraper (Advanced Mode)...');
    console.log(`Config: Headless=${config.headless}, MaxPages=${config.maxPages}`);

    const browser = await puppeteer.launch({
        headless: config.headless,
        defaultViewport: null,
        executablePath: config.chromePath,
        args: ['--start-maximized'],
        userDataDir: config.userDataDir
    });

    let currentPage = config.startPage;
    let coursesProcessed = 0;

    try {
        while (true) {
            if (config.maxPages > 0 && currentPage > config.maxPages) {
                console.log(`Reached max pages limit (${config.maxPages}). Stopping.`);
                break;
            }

            const url = currentPage === 1
                ? config.baseUrl
                : `${config.baseUrl}/${currentPage}`;

            console.log(`\n=== Scraping Page ${currentPage}: ${url} ===`);

            const page = await browser.newPage();

            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
                console.log('Scrolling to load courses...');
                await autoScroll(page);

                console.log('Extracting course links...');
                const courses = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a.card-header'));
                    return links.map(link => ({
                        title: link.innerText.trim(),
                        detailsUrl: link.href
                    }));
                });

                console.log(`Found ${courses.length} courses on page ${currentPage}.`);

                if (courses.length === 0) {
                    console.log('No courses found on this page. Stopping.');
                    await page.close();
                    break;
                }

                for (const [index, course] of courses.entries()) {
                    console.log(`\n[P${currentPage} | ${index + 1}/${courses.length}] ${course.title}`);

                    if (history[course.detailsUrl]) {
                        console.log(`  Skipping: Already in history (${history[course.detailsUrl].status})`);
                        continue;
                    }

                    const status = await processCourse(browser, course);

                    history[course.detailsUrl] = {
                        title: course.title,
                        status: status,
                        date: new Date().toISOString()
                    };
                    saveHistory();
                    coursesProcessed++;
                }

            } catch (err) {
                console.error(`Error scraping page ${currentPage}: ${err.message}`);
            }

            await page.close();
            currentPage++;
        }
    } finally {
        console.log('\nClosing browser...');
        await browser.close();
        console.log(`Done! Processed ${coursesProcessed} new courses.`);
        addToReport(`Run finished. Processed ${coursesProcessed} new courses.`);
    }
}

async function processCourse(browser, course) {
    let resultStatus = 'failed';
    const contextPage = await browser.newPage();

    try {
        await contextPage.goto(course.detailsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        try {
            await contextPage.waitForSelector('a.discBtn', { timeout: 5000 });
        } catch (e) {
            console.log('  "Take Course" button not found.');
            await contextPage.close();
            return 'error_no_button';
        }

        const intermediateUrl = await contextPage.$eval('a.discBtn', el => el.href);
        console.log(`  Intermediate URL: ${intermediateUrl}`);

        await contextPage.goto(intermediateUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        let udemyUrl = '';
        try {
            await contextPage.waitForSelector('a.ui.green.button', { timeout: 10000 });
            udemyUrl = await contextPage.$eval('a.ui.green.button', el => el.href);
        } catch (e) {
            console.log('  Final link button not found.');
            await contextPage.close();
            return 'error_intermediate';
        }

        console.log(`  Final Udemy URL: ${udemyUrl}`);
        await contextPage.close();

        const enrollPage = await browser.newPage();
        try {
            await enrollPage.goto(udemyUrl, { waitUntil: 'networkidle2', timeout: 45000 });
            resultStatus = await processUdemyEnrollment(enrollPage);
        } catch (e) {
            console.log('  Enrollment process error: ' + e.message);
        } finally {
            if (!enrollPage.isClosed()) await enrollPage.close();
        }

    } catch (err) {
        console.error(`  Error processing: ${err.message}`);
        if (!contextPage.isClosed()) await contextPage.close();
        return 'error_exception';
    }

    addToReport(`${resultStatus.toUpperCase()}: ${course.title}`);
    return resultStatus;
}

async function processUdemyEnrollment(page) {
    try {
        await page.waitForSelector('[data-purpose="price-text-message"], [class*="price-text"], button', { timeout: 10000 });
    } catch (e) { }

    const isLoggedIn = await page.evaluate(() => {
        const userMenu = document.querySelector('div[class*="user-profile-dropdown"]');
        const myLearning = document.querySelector('a[href*="/home/my-courses/"]');
        return !!(userMenu || myLearning);
    });

    if (!isLoggedIn) console.log('  [Warning] User not logged in.');

    const isFree = await page.evaluate(() => {
        const priceContainer = document.querySelector('[data-purpose="price-text-message"]');
        if (priceContainer && (priceContainer.innerText.includes('Free') || priceContainer.innerText.includes('100% off'))) return true;

        const priceText = document.querySelectorAll('[data-purpose="course-price-text"] span');
        for (const span of priceText) {
            if (span.innerText.includes('Free') || span.innerText.includes('100% off')) return true;
        }

        const ctaButton = document.querySelector('[data-purpose="buy-this-course-button"]');
        if (ctaButton && ctaButton.innerText.includes('Enroll now')) return true;

        return false;
    });

    if (!isFree) {
        console.log('  Not free. Skipping.');
        return 'skipped_not_free';
    }

    const isEnrolled = await page.evaluate(() => {
        return !!Array.from(document.querySelectorAll('a, button')).find(el => {
            const text = el.innerText || '';
            return text.includes('Go to course') || text.includes('Start course');
        });
    });

    if (isEnrolled) {
        console.log('  Already enrolled (found "Go to course"). Skipping.');
        return 'skipped_already_enrolled';
    }

    console.log('  Searching for Enroll button...');
    const enrollBtnHandle = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(b => {
            const text = b.innerText || '';
            return text.includes('Enroll now') || text.includes('Add to cart');
        });
    });

    if (enrollBtnHandle.asElement()) {
        console.log('  Clicking Enroll...');
        await enrollBtnHandle.click();
        await page.waitForTimeout(5000);

        if (page.url().includes('/cart/checkout')) {
            console.log('  At checkout. Completing...');
            try { await page.waitForSelector('button', { timeout: 5000 }); } catch (e) { }
            const checkoutBtn = await page.evaluateHandle(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.find(b => b.innerText.includes('Checkout'));
            });
            if (checkoutBtn.asElement()) {
                await checkoutBtn.click();
                await page.waitForTimeout(5000);
            }
        }
        return 'enrolled';
    } else {
        console.log('  Enroll button not found (already enrolled?).');
        return 'skipped_already_enrolled';
    }
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

main();
