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

## Usage: 

![Screenshot Dashboard](./.github/ingestapi.png)


To start monitoring a system, first create a new system entry in the PatchMe dashboard. Once the system is registered, you can report its software versions by sending a JSON payload to the `/api/ingest` endpoint.

For Linux environments, this is typically automated using a script and a scheduled task (e.g., with `cron` or `systemd` timer). The script collects version information and sends it to PatchMe via a simple `curl` command:

```bash
curl -X POST https://your-patchme-instance/api/ingest \
  -H "Authorization: Bearer <YOUR_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "systemId": "<SYSTEM_ID>",
    "software": [
      { "name": "openssl", "version": "1.1.1w" },
      { "name": "nginx", "version": "1.24.0" }
    ]
  }'
```

You can automate this process to run daily, ensuring PatchMe always has up-to-date version data for all your systems.


## Installation: Getting Started

### Prerequisites

- Docker (recommended) or Node.js 18+
- A mariadb / mysql database

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
- Database: Only MariaDB / MySQL are supported

## Contributing

Pull requests, bug reports, and feature requests are welcome!

## License

MIT License – see [LICENSE](./LICENSE) for details.

## Disclaimer
PatchMe is provided without any warranty. No liability is assumed for damages resulting from the use, malfunction, or misconfiguration of the software. Use at your own risk. Please evaluate the suitability of PatchMe for your specific use case and ensure compliance with applicable security requirements before deployment.

---