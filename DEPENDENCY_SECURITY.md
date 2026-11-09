# Frontend dependency security fixes

Audit date: 9 November 2026.

The initial npm audit reported five affected package entries: three high and two
moderate. Compatible updates resolved them without changing the Vue, Tailwind,
or Vite major versions.

| Package | Before | Installed fix |
| --- | --- | --- |
| vite | 6.4.3 | 6.4.6 |
| follow-redirects | 1.16.0 | 1.16.3 |
| source-map-js | 1.2.1 | 1.2.2 |
| postcss-selector-parser | 6.0.10 / 6.1.4 | 6.1.6 |

`@tailwindcss/typography` 0.5.20 pins `postcss-selector-parser` to 6.0.10. The
package.json override replaces parser versions below 6.1.5 with patched 6.x
versions, including the copies used by Tailwind and postcss-nested. This avoids
downgrading Typography or performing a Tailwind major migration. Retain the
override until all parent dependencies resolve a patched parser themselves.

Vite's minimum version is raised to 6.4.4, the patched 6.x release for the
reviewed launch-editor advisories. The lockfile resolves the newer 6.4.6 patch.

References:
- https://github.com/advisories/GHSA-587h-7wmj-h5pm
- https://github.com/advisories/GHSA-mrwp-f3q8-3g9p
- https://github.com/advisories/GHSA-68fv-2mgg-jv7q
- https://github.com/advisories/GHSA-rj75-hqrm-r3gf

Verification uses a clean `npm ci`, `npm audit`, `npm audit --omit=dev`,
`npm test`, the production build, and the existing browser regression pages.
Both audits report zero known vulnerabilities at the audit date. This result
describes npm's current advisory database, not a guarantee against unknown flaws.

Clean installation, unit tests, production build, and all three browser
regressions passed. When checked in isolation, the dependency updates produced
CSS byte-identical to the pre-update build.
The pre-existing CSS minification warning remains and is unrelated to these
dependency changes.
