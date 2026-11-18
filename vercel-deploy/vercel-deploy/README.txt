VERCEL DEPLOYMENT

This is the static website only. It includes the animated AWS architecture walkthrough and employee dashboard demo. The demo stores sample employee entries in this browser.

Deploy using Vercel CLI:
1. Install Node.js on your computer if it is not installed.
2. Extract this ZIP.
3. Open a terminal in the extracted vercel-deploy folder.
4. Run: npx vercel
5. Follow the prompts and choose the default settings for a static website.
6. To publish the production URL, run: npx vercel --prod

The Flask API and SQLite database are separate from this static site. The current demo runs in browser mode. To connect it to your EC2 API, configure Vercel rewrites for /api/* to your public Nginx URL after the API is deployed and reachable over HTTPS.
