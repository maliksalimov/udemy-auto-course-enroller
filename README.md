# Udemy Course Enroller (Free Course Scraper)

This Node.js tool automatically scrapes free course listings from [Couponami](https://www.couponami.com/all) and enrolls you in them on Udemy.

It features:
*   **Smart Automation**: Bypasses redirects and finds valid coupons.
*   **Pagination**: Scrapes multiple pages of courses automatically.
*   **History Tracking**: Remembers enrolled courses to skip them in future runs.
*   **Safe Enrollment**: Strictly checks for "Free" price tags to avoid accidental purchases.

## Prerequisites

*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   Google Chrome (installed on your system)
*   A Udemy account

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
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
node get_courses.js
```

### Manual Login Helper
If you just want to log in and save the session without running the scraper:
```bash
node login.js
```

## Disclaimer
This tool is for educational purposes only. Use it responsibly and respect Udemy's terms of service.
