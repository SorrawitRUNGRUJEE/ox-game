# OX (Tic-tac-toe) - Web Application

Play tic-tac-toe against a bot. Players sign in with **Google (OAuth 2.0)**, earn or lose points per game, and an admin page lists every player's score.

## Tech stack

| Part | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, Passport (Google OAuth 2.0 + JWT) |
| Database | PostgreSQL 16 via Prisma |
| Run | Docker Compose |

## Quick start (Docker)

You need Docker with Docker Compose, and a Google OAuth client (below).

1. **Create a Google OAuth client** at <https://console.cloud.google.com/>
   1. Create a project, then open *APIs & Services > OAuth consent screen*. Choose **External**, fill in the app name and your email, and add the scopes `openid`, `email`, `profile`.
   2. While the app is in *Testing* mode only listed **test users** can sign in. Either add the reviewer's Google address as a test user, or click **Publish app**.
   3. Open *Credentials > Create credentials > OAuth client ID > Web application* and add this **Authorized redirect URI**:
      `http://localhost:3000/api/auth/google/callback`
   4. Copy the Client ID and Client Secret.
2. **Configure the environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: from step 1
   - `JWT_SECRET`: any long random string (for example `openssl rand -hex 32`)
   - `ADMIN_EMAILS`: Google emails that should be admins (comma-separated)
3. **Start everything**
   ```bash
   docker compose up --build
   ```
4. Open <http://localhost:3000>, click **Sign in with Google**, and play.

The admin page is at <http://localhost:3000/admin> (also linked as "All scores" in the header). Only emails listed in `ADMIN_EMAILS` can open it; the role is assigned when that user signs in.

To reset all data: `docker compose down -v`.

### Deploying to a public URL

Set these in `.env` using your real domain (HTTPS), add the same callback URL as an **Authorized redirect URI** in Google Cloud, and rebuild:

```
WEB_URL=https://your-domain.example
GOOGLE_CALLBACK_URL=https://your-domain.example/api/auth/google/callback
```

Only port 3000 needs to be public. The web app forwards `/api/*` to the backend inside the Docker network. With an `https` `WEB_URL`, cookies are marked `Secure`.

## Game rules and scoring

- You play **X and move first**; the bot plays **O**.
- **Win: +1 point. Loss: -1 point. Draw: 0 points.**
- Winning **3 games in a row** gives **+1 bonus point** (so that game is worth +2), and the win-streak counter then **starts again from 0**.
- A loss resets the streak to 0. A draw leaves the streak unchanged (the assignment does not say; this is the assumption made here).
- The bot plays a winning or blocking move or the centre 60% of the time, otherwise a random cell. It is intentionally beatable so that players can earn the bonus.

## How login works (OAuth 2.0 authorization code flow)

1. The browser opens `/api/auth/google`. The backend creates a random `state`, stores it in a short-lived httpOnly cookie, and redirects to Google.
2. The user approves on Google, which redirects back to `/api/auth/google/callback?code=...&state=...`.
3. The backend checks that `state` matches the cookie (CSRF protection), then exchanges the `code` for tokens **server-to-server** with the client secret, and reads the user's profile.
4. The user is created or updated in the database, and the backend sets its own session as a signed **JWT in an httpOnly cookie** (7 days). The client secret and Google tokens never reach the browser.

## Architecture

```
Browser --> web (Next.js :3000) --/api/*--> api (NestJS :4000) --> db (PostgreSQL)
```

The browser only talks to the Next.js origin, so the session cookie is same-origin (no CORS). The **whole game lives on the server**: the client only sends the cell it clicked, and the server applies the bot's reply and the scoring. Scores cannot be forged from the browser.

### API (all under `/api`)

| Method and path | Description |
|---|---|
| `GET /auth/google` | Start Google login |
| `GET /auth/google/callback` | Google redirects here; sets the session cookie |
| `GET /auth/me` | Current user (name, role, score, streak) |
| `POST /auth/logout` | Clear the session cookie |
| `POST /game/start` | Resume the unfinished game, or start a new one |
| `GET /game/state` | Current unfinished game and score |
| `POST /game/:id/move` | Body `{ "cell": 0-8 }`. Plays your move and the bot's reply |
| `GET /admin/players` | Admin only. All players with score, streak, wins, losses, draws |

### Project layout

```
api/   NestJS: src/auth, src/game (rules, bot, scoring), src/admin, prisma/schema.prisma
web/   Next.js: src/app (login, /game, /admin), src/components, src/lib
docker-compose.yml, .env.example
```

## Running without Docker (optional)

Requires Node 20 and a PostgreSQL database.

```bash
# backend
cd api
npm install
export DATABASE_URL=postgresql://user:pass@localhost:5432/ox   # plus the variables from .env
npx prisma generate && npx prisma db push
npm run build && npm start            # http://localhost:4000

# frontend (another terminal)
cd web
npm install
API_INTERNAL_URL=http://localhost:4000 npm run dev   # http://localhost:3000
```
