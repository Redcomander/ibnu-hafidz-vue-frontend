# Public Android download page

Share `https://ibnuhafidz.ponpes.id/download-app` instead of a release-specific `/api/app/download/{id}` URL.

The public page requires no login. It loads the published release through `/api/app/version?version_code=0` and checks again when Download is pressed, so an open page also picks up a newly published build. Empty release and failed requests show a message instead of a broken download button. The release management copy action derives the public origin from the API and copies this permanent page URL.

Deploy the frontend build using the existing production publishing procedure. Preserve the production `.htaccess` API proxy and SPA fallback so direct visits and reloads of `/download-app` resolve to `index.html`. No backend changes or database migrations are required. Previously shared release-specific URLs are unchanged; share the new permanent page going forward.

Validation: production build and Playwright desktop/mobile release-management and public-download tests, including a release change between page load and download, clipboard fallback, unavailable API, and no published release.
