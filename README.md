# PatchMe

![Screenshot Dashboard](./.github/dash.png)

PatchMe is a minmal system version monitoring tool. It provides a central overview of system states, software versions, and compliance status, helping you identify vulnerabilities and outdated software early. The core idea of PatchMe is the implementation of the Zero Trust principle: Only a single, secured API route is exposed externally. All systems send their version information exclusively to this endpoint. This eliminates the need for direct logins or access to individual systems—management and monitoring are handled centrally, securely, and with minimal attack surface.

## Features

- **Central Dashboard:** Overview of all connected systems and their software states.
- **Baseline Management:** Define minimum versions (baselines) for critical software components.
- **Tagging & Grouping:** Flexibly tag and filter systems.
- **Activity Log:** Traceable history of all changes and system messages.
- **API-first:** Easy integration and automation via REST API.
- **User & Role Management:** Access control for different user groups.
- **Dark Mode & Responsive UI:** Modern, customizable interface.


## Getting Started

### Prerequisites

- Docker (recommended) or Node.js 18+
- A database (e.g. SQLite, PostgreSQL – default: SQLite)

### Quickstart with Docker

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@127.0.0.1:3306/patchme"\
  -e JWT_SECRET="your-secret-password" \
  -v patchme-data:/data \
  ghcr.io/tenbyte/patchme:latest
```

Or with `docker-compose`:

```bash
git clone https://github.com/tenbyte/patchme.git
cd patchme
cp .env.example .env
docker-compose up -d
```

### Manual Installation (Development)

```bash
git clone https://github.com/tenbyte/patchme.git
cd patchme
pnpm install
cp .env.example .env
pnpm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Configuration

All configuration options can be set via environment variables:

| Variable       | Description                        | Default value         |
|----------------|------------------------------------|----------------------|
| DATABASE_URL   | Database URL (e.g. SQLite, Postgres) | file:./patchme.db    |
| JWT_SECRET     | Secret for authentication           | (must be set)        |
| PORT           | Port for the web server             | 3000                 |

See [DOCKER.md](./DOCKER.md) for more details.


## Images & Releases

- Docker: [`ghcr.io/tenbyte/patchme:latest`](https://ghcr.io/tenbyte/patchme)
- GitHub: [github.com/tenbyte/patchme](https://github.com/tenbyte/patchme)

## Development

- Frontend: Next.js, React, Tailwind CSS
- Backend: Prisma ORM, REST API
- Database: mariadb / mysql, most prisma db connections possible

## Contributing

Pull requests, bug reports, and feature requests are welcome!

## License

MIT License – see [LICENSE](./LICENSE) for details.

---