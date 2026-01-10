# Islamic Finance App

Islamic finance tools built on Quran and Sunnah.

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) 2.49
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1
- **Database**: [PostgreSQL](https://www.postgresql.org/) 17
- **Database Driver**:
  - [Neon Serverless](https://neon.tech/) (production),
  - [node-postgres](https://node-postgres.com/) (development)
- **ORM**: [Drizzle](https://orm.drizzle.team/) 0.45
- **Testing**: [Vitest](https://vitest.dev/) 4.0

## Quick Start

### Prerequisites

- [Node.js v22 LTS](https://nodejs.org/) (managed via NVM)
- [PNPM](https://pnpm.io/) (managed via Corepack)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Cursor Editor](https://cursor.com/) (recommended for multi-root workspace)

```bash
# Install Node.js v22 LTS via NVM
nvm install 22 --lts
nvm alias default node

# Enable Corepack for PNPM
corepack enable
```

### Setup

Install dependencies:

```bash
pnpm install
```

Set up environment variables:

```bash
cp .env.example .env
```

Configure hosts file:

Add `db.localtest.me` to our hosts file (required for Neon Proxy):

**macOS / Linux:**

```bash
sudo nano /etc/hosts
```

Add: `127.0.0.1 localhost db.localtest.me`

**Windows:**

Open `C:\Windows\System32\drivers\etc\hosts` as Administrator and add: `127.0.0.1 localhost db.localtest.me`

**Note:** Flush DNS cache after editing:

- **macOS**: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
- **Linux**: `sudo systemd-resolve --flush-caches`
- **Windows**: `ipconfig /flushdns`

### Development

```bash
# Start infrastructure (PostgreSQL, Neon Proxy)
pnpm dev:up

# Start development server
pnpm dev

# Stop infrastructure
pnpm dev:down
```

Visit http://localhost:5173 to see the site.

### Code Quality

```bash
# Check for errors and warnings
pnpm check

# Format code
pnpm format

# Check format and lint code
pnpm lint

# Format and fix lint issues
pnpm lint:fix
```

### Database Management

The project uses PostgreSQL in Docker for local development. Use these commands to manage our database:

```bash
# Push schema changes
pnpm db:push

# Reset database
pnpm db:reset

# Open Drizzle Studio
pnpm db:admin
```

### Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to ensure code quality:

- **Pre-commit**: Automatically formats and lints staged files, then runs type checking
- **Commit-msg**: Validates commit message format (conventional commits)

The pre-commit hook runs the following:

1. **Format & Lint** (on staged files only):
   - Prettier formatting (JS, TS, Svelte, JSON, MD, CSS)
   - ESLint with auto-fix (JS, TS, Svelte)
2. **Typecheck**: TypeScript type checking across the project

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat: add new feature`
- `fix: fix bug`
- `docs: update documentation`
- `style: format code`
- `refactor: restructure code`
- `test: add tests`
- `chore: maintenance tasks`

## 🐳 Local Services

The development environment includes:

- **Vite Dev Server**: SvelteKit development server (localhost:5173)
- **PostgreSQL 17**: Main database (localhost:5432)
- **Neon Proxy**: Enables Neon serverless driver with local PostgreSQL (localhost:4444)
