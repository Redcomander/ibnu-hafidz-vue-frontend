# Frontend testing

Use Node.js 22 or newer. From the frontend root:

```sh
npm install
npx playwright install chromium
npm run test:all
```

`npm test` runs the existing Node session concurrency test. `npm run test:e2e`
starts Vite automatically on port 4173 and runs Playwright in desktop Chromium
and mobile Chromium (Pixel 7 viewport/touch emulation). No Go server, database,
credentials, or production data are required. API responses are intercepted;
unmatched API calls receive 401 instead of reaching a real backend.

## Coverage

- Protected deep links and login redirect destination.
- Required login fields, rejected credentials, successful login request/navigation.
- Cookie-session restoration through the refresh endpoint and permission guards.
- Expired access-token refresh and retry with the replacement bearer token.
- Maintenance page, retry/recovery, scope enforcement, admin settings and API-driven redirects.
- Production diagnostics, temporary debug controls, incident resolution, role restrictions and report IDs.
- Notification unread totals, pagination, reconnect/poll recovery, deduplication, read failures and logout races.
- Unknown routes and public article search/empty results.
- Existing browser regression harnesses: article HTML sanitization, diniyyah
  schedules, halaqoh membership/approval dialogs, and mobile substitute attendance.

These are frontend tests with controlled responses, not backend integration tests.
They do not prove real server authorization, cookie issuance, or database writes.

## Debugging and adding tests

```sh
npm run test:e2e -- --project=chromium
npm run test:e2e -- --grep "article search"
npm run test:e2e:ui
npm run test:e2e:report
```

Failures retain screenshots and Playwright traces in the ignored test output
folders. The HTML report links to these artifacts. CI uploads both folders for
14 days and also runs the Node tests and production build.

## Deployment gate

The [cPanel deployment workflow](../.github/workflows/deploy-cpanel.yml) calls the
[reusable test workflow](../.github/workflows/frontend-tests.yml) before its SSH
deployment job. Failed or cancelled checks prevent that job from running.
Pushes to other branches and pull requests run checks without deploying. Manual
deployment also runs checks and only deploys when started against `main`.

The server checks that `main` still points to the tested commit, then resets to
that exact SHA and builds with `npm ci`. If `main` has advanced, the older run
skips publication. This gate applies to GitHub Actions; direct server commands
or cPanel's own deployment mechanism are separate entry points.

Add Playwright specs under [e2e](./e2e). Prefer visible roles/text and observable
network behavior; avoid fixed sleeps. Mock each endpoint a scenario needs with
realistic response shapes. Keep unrelated API calls blocked. The legacy HTML
harnesses are wrapped by [regressions.spec.js](./e2e/regressions.spec.js), which
requires their PASS result and rejects uncaught browser errors.
