# Welcome Email / Web Payments / Magic Link — Web Tracker

Tracks this repo's piece of: mobile verifies email → backend sends a welcome email with
subscription plans + a one-time login link → **user pays here, on the web app** → web app
redirects back to the mobile app. Scope: **dev environment**.

Companion docs (workspace root, not committed to any repo): `diagrams/welcome-email-payments-infra.md`
and `diagrams/dev-pending-items-devops-vs-developer.md`.

Last verified: 2026-10-23, against the live `dev.mypapervault.com` deployment.

---

## ✅ Done

- `infra/custom-domain-tls` (PR #1, merged) — `dev.mypapervault.com` custom domain on CloudFront, ACM cert
- `ci/mobile-return-url` (PR #2, merged) — `VITE_MOBILE_RETURN_URL=mypapervault://subscription/success` added to `deploy-dev.yml`'s build step. Fixed literal value, not a secret
- `docs/api-domain-cutover-note` (PR #3, merged) — `.env.example` documents the pre-cutover raw API URL as a comment, so it isn't silently lost when `VITE_API_URL` is repointed

## ⚠️ Pending — in progress, not finished

**`VITE_API_URL` cutover to `api.dev.mypapervault.com`** (the backend's new custom domain, live
since `infra/api-custom-domain` deployed — see the backend tracker). This exists specifically to
stop Safari treating the refresh-token cookie as third-party and logging users out hourly.

- A rebuild-trigger commit (`4b126cd`, "chore: trigger rebuild for VITE_API_URL cutover") was
  pushed to `dev` — **but verified today that the live build still resolves to the old raw
  `execute-api.us-east-1.amazonaws.com` URL.** This confirms the `DEV_VITE_API_URL` GitHub Actions
  secret itself was never actually updated — only a rebuild ran against the still-unchanged secret.
- **To finish**: update the `DEV_VITE_API_URL` secret (repo Settings → Secrets and variables →
  Actions) to `https://api.dev.mypapervault.com/api/v1`, then trigger another rebuild (push to
  `dev`, or another empty commit). **Needs a human with GitHub repo-admin access** — not something
  that can be done via this environment's tooling.
- Verify after: `curl -s https://dev.mypapervault.com/ | grep -oE '/assets/errorHandler[a-zA-Z0-9_.-]*\.js'`
  — note the new filename (will differ from `errorHandler-y83GYjfW.js`), then fetch that asset and
  grep for `api.dev.mypapervault.com` to confirm it's baked in.

## ❌ Not started — application code

- Nothing in `src/` reads `VITE_MOBILE_RETURN_URL` yet. `src/config/env.ts` only exposes
  `apiUrl` today — the var exists in the CI build, but nothing redirects the user to it after a
  successful payment. This is the piece that actually closes the loop back to the mobile app.
- No magic-link login page/flow exists yet to receive the one-time link from the welcome email —
  confirm with the backend team what the expected URL shape/params are once their magic-link logic
  is written (not started on their side either — see the backend tracker).
- Whatever payment UI consumes the backend's `/payments/*` routes (also not started backend-side).

---

## For Prod

No prod web stack deployed (`mypapervault-prod-web` does not exist). `infra/config/prod.ts` has
real values (`domain: www.mypapervault.com`) written but unapplied. Deferred until dev is finished
and signed off.
