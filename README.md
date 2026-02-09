# Udemy Course Enroller (Free Course Scraper)

This Node.js tool automatically scrapes free course listings from [Couponami](https://www.couponami.com/all) and enrolls you in them on Udemy.

It features:
*   **Smart Automation**: Bypasses redirects and finds valid coupons.
*   **Pagination**: Scrapes multiple pages of courses automatically.
*   **History Tracking**: Remembers enrolled courses to skip them in future runs.
*   **Safe Enrollment**: Strictly checks for "Free" price tags. Adds courses to your cart or enrolls you, but **stops before checkout** so you can review.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- Google Chrome (installed on your system)
*   A Udemy account
*   **NPM Packages** (installed via `npm install`):
    *   `puppeteer` & `puppeteer-extra`
    *   `puppeteer-extra-plugin-stealth`
    *   `puppeteer-extra-plugin-user-data-dir`

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/maliksalimov/udemy-auto-course-enroller.git
    cd udemy-auto-course-enroller
    ```
2.  Install dependencies (ensure you use Node 16+):
    ```bash
    nvm use 16
    npm install
    ```

## Configuration

1.  **Login**: The first time you run the tool (or the login helper), a Chrome window will open. You **must** log in to your Udemy account manually in this window. The session cookies will be saved to the local `udemy_profile` directory (which is git-ignored).

2.  **Environment Variables**:
    You usually need to tell Puppeteer where your Chrome executable is. You can set this via an environment variable or edit `config.js`.
    
    Mac Example:
    ```bash
    export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    ```

## Usage

Run the scraper:

```bash
# Ensure you are using Node 16+
nvm use 16

# Run the scraper
# Run the scraper (Default: All languages)
npm start
# OR: node get_courses.js

# Scrape specific language:
node get_courses.js -tr  # Turkish

# Scrape MULTIPLE languages (sequentially):
node get_courses.js -en -tr -de
# The above will scrape all English courses, then all Turkish, then all German.

### Supported Languages
| Flag | Language | URL Slug |
| :--- | :--- | :--- |
| `-en` | English | `english` |
| `-tr` | Turkish | `turkish` |
| `-de` | German | `german` |
| `-es` | Spanish | `spanish` |
| `-fr` | French | `french` |
| `-pt` | Portuguese | `portuguese` |
| `-it` | Italian | `Italian` |
| `-ru` | Russian | `russian` |
| `-ar` | Arabic | `arabic` |
| `-ja` | Japanese | `japanese` |
```

### Controlling the Script

- During execution, you can type `stop` and press Enter in the terminal to gracefully stop the script after it finishes the current page.
- This ensures the browser closes properly and the report is saved.

### Manual Login Helper
If you just want to log in and save the session without running the scraper:
```bash
npm run login
# OR: node login.js
```

## Disclaimer
This tool is for educational purposes only. Use it responsibly and respect Udemy's terms of service.
