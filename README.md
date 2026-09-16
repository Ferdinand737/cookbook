# cookbook

Recipe app for VM 104 (private-apps). Recipes are written in a custom DSL ("food-lang", see `packages/food-lang`) and stored in postgres — the `Recipe.food` column holds the DSL source, `filename` the display name. Monaco editor UI. NextAuth (credentials, bcryptjs-12) + Prisma 5.22.

- URL: http://192.168.1.70:3006 (LAN) / `private-apps.netbird.selfhosted:3006` (tailnet — note `NEXTAUTH_URL` is pinned to the LAN IP, so login via a different host may hit CSRF mismatch)
- DB: `cookbook-db` (postgres:16-alpine, user/pass `cookbook`/`cookbook` — weak creds and port 5432 is published to the LAN; hardening TODO). Data in volume `cookbook_cookbook-db`. Schema sync via `npx prisma db push` on every container boot (no migrations dir — schema changes must be non-destructive or db push fails).
- `NEXTAUTH_SECRET` lives in `~/cookbook/.env` on the VM (gitignored); compose reads it via interpolation.

## CD

Auto-deploys on push to `main` via the self-hosted runner on box1 → VM 104 at `~/cookbook` (`git pull && ./deploy.sh` = `docker compose up -d --build`). The repo's `docker-compose.yml` defines the **full stack** (db + app) and the root `Dockerfile` is committed — before 2026-09-16 both lived only on the VM, so CD ran green for weeks while the app never rebuilt (see HOMELAB.md lesson #22).

## History note

The DB was empty from creation (2026-08-16) — whatever recipes existed before that were lost when the stack was freshly redeployed on Aug 16 (no backups existed, no dead tuples to recover). A fresh account was created 2026-09-16 for ferdinand@haaben.net with a temporary password (set via the register API; there is **no in-app change-password feature** — password changes = `UPDATE "User" SET "passwordHash"` with a bcryptjs-12 hash).
