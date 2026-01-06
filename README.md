# Redhunt

Automated Reddit monitoring with keyword matching and AI-powered intent scoring.

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

The project uses PostgreSQL in Docker for local development. Use these commands to manage your database:

```bash
# Push schema changes
pnpm db:push

# Reset database
pnpm db:reset

# Open Drizzle Studio
pnpm db:admin
```
