# Architecture

## Constraints & Technology Choices

- **Frontend Framework (Vanilla JavaScript):** This application is built strictly using Vanilla JavaScript, raw HTML, and CSS. This choice was made deliberately over heavier frameworks (like React or Next.js) to ensure absolute zero build-step overhead, eliminate dependency bloat (no Node.js or `node_modules` required), and guarantee the fastest possible page load times and maximum portability. It can be hosted immediately on any basic static file server.
- **Styling:** Tailwind CSS (via CDN) is utilized to enforce the "Institutional Precision" aesthetic (slate blues, data-dense layouts) rapidly without necessitating a complex frontend compilation toolchain.
- **State Management & Audit Logic:** The deterministic audit engine and multi-step form state are managed entirely client-side within `script.js`. This eliminates the need for server-side processing, ensuring instantaneous cost-savings calculations directly in the user's browser.
- **Performance:** Because the application is purely static files, it is inherently optimized to hit exceptional Lighthouse scores (Performance $\ge$ 85, Accessibility $\ge$ 90, and Best Practices $\ge$ 90) with minimal optimization effort.
