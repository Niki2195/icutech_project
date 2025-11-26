# icutech-test

Interview task solution: Bootstrap single-page (two pages: login/register), SOAP proxy via Netlify Functions.

## Deploy to Netlify (recommended)
1. Push this repo to GitHub.
2. In Netlify: New site -> Import from Git -> select repo.
3. Build settings: no build command. Publish directory: `/`.
4. Deploy — Netlify will detect functions and install dependencies from package.json.

## Notes
- Frontend posts to `/.netlify/functions/soap-proxy` which forwards to the SOAP endpoint.
- Use Register page to create a test user first, then Login page to authenticate.
