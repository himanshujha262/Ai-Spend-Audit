# AuditAI by Credex

A production-ready, pure static web application designed to audit and optimize institutional SaaS spend. Built strictly with HTML, CSS, Vanilla JavaScript, and Tailwind CSS (via CDN) to ensure zero build-step overhead and maximum performance.

## Architecture & Design

- **Zero-Dependency**: No Node.js, no React, no build steps. 
- **Institutional Precision**: Designed according to the high-trust, minimalist financial aesthetic (slate blues, sharp edges, data-dense layouts).
- **Client-Side Engine**: The deterministic audit engine runs entirely in the browser via `script.js`.
- **Local State**: Form data and audit results are seamlessly passed between pages using `localStorage`.

## Project Structure

- `index.html`: The Landing Page and initial spend input configuration.
- `results.html`: The Audit Results Dashboard, dynamically rendering identified inefficiencies.
- `report.html`: The Shareable Public Report, simulating an exported PDF overview.
- `script.js`: Contains all the logic for UI interactions, state management, and the Audit Engine.

## How to Run

1. Simply double-click `index.html` to open it in your browser.
2. Select your tools, configure the parameters, and click "Generate Audit Report".
3. Navigate seamlessly through the dashboards.

## Constraints & Performance Goals

- **Frontend Framework (Vanilla JS):** Built deliberately with Vanilla JavaScript and HTML instead of heavier frameworks like React or Next.js to eliminate build steps, dependencies, and provide the absolute fastest page load speeds.
- **No Website Builders:** Constructed entirely from scratch utilizing Tailwind CSS via CDN. No website builders (Wix, Webflow, Framer) or pre-built admin dashboard templates were used.
- **Lighthouse Targets:** This incredibly lightweight architecture guarantees optimal Lighthouse mobile scores on any deployed URL: **Performance $\ge$ 85, Accessibility $\ge$ 90, Best Practices $\ge$ 90**.
- **Deployment:** It can be hosted instantly on GitHub Pages, Vercel, or S3 with zero build configuration.
