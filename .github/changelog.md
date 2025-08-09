# Changelog

## [1.0.0] – 2025-08-09

### Added
- Initial public release of PatchMe.
- Central dashboard for all connected systems and their software versions.
- Baseline management: define and track minimum required versions for critical software components.
- Tagging and grouping: flexible tagging and filtering of systems.
- Activity log: full audit trail of changes and system events.
- API-first design: REST API for integration and automation.
- User and role management for access control.
- Modern, responsive UI with dark mode support.

### Security & Architecture
- Zero-trust principle: only a secured API route is exposed externally.
- No direct logins to target systems required – all management and monitoring is centralized.

### Automation
- Version ingestion can be automated via script and cronjob/systemd.
- Example script and API documentation included in the README.

### Installation
- Docker image available: `ghcr.io/tenbyte/patchme:latest`
- Quick start via Docker or manual installation (Node.js 18+ and pnpm).
- Supports SQLite (default), MariaDB, MySQL, and other Prisma-compatible databases.

### Development
- Frontend: Next.js, React, Tailwind CSS
- Backend: Prisma ORM, REST API

### Notes
- Configuration via environment variables (e.g., database, port, JWT secret).
- Open Source under MIT License.

## Disclaimer: 
PatchMe is provided without any warranty. No liability is assumed for damages resulting from the use, malfunction, or misconfiguration of the software. Use at your own risk. Please evaluate the suitability of PatchMe for your specific use case and ensure compliance with applicable security requirements before deployment.


---
