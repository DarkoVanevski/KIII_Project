# Invoice App — CI/CD course project

A multi-user invoicing app built as the project for the *Continuous Integration and
Delivery* elective, using Laravel (Inertia + React) with a MySQL database and a
queue worker for async invoice emailing.

## Architecture

```
┌──────────────────────────┐        ┌────────────┐
│   app (Deployment x2)    │──────► │     db     │
│  Laravel + Inertia/React │        │ (MySQL 8,  │
│  same image as worker,   │        │ StatefulSet)│
│  args: ["web"]           │        └────────────┘
└──────────────────────────┘               ▲
             ▲                              │
             │ shares DB (jobs/cache/sessions tables)
┌──────────────────────────┐               │
│   worker (Deployment)    │───────────────┘
│  same image, different   │
│  command: args: ["worker"]│
│  processes queued jobs   │
│  (e.g. emailing invoice  │
│   PDFs to clients)       │
└──────────────────────────┘
```

Unlike a typical split-frontend/backend app, Laravel + Inertia serves the React UI
and the API from one codebase — so the natural "third service" (beyond app +
database) is the **queue worker**: sending an invoice dispatches a queued job that
renders the PDF and emails it, processed by a dedicated worker container/pod
completely separate from the web process. Same Docker image, different `command`/
`args` per role.

MySQL was chosen over SQLite specifically so the database is a real, independently
deployable service — it gets its own container, its own Kubernetes StatefulSet with
a PersistentVolumeClaim, and its own ConfigMap/Secret, none of which would make
sense for an embedded SQLite file.

## Running locally with Docker Compose

```bash
docker compose up --build
```

Then open http://localhost:8080. Three containers: `app` (web, port 8080→80),
`worker` (queue processor, no exposed port), `db` (MySQL 8.4, persisted in the
`db-data` named volume). Both `app` and `worker` run migrations on startup and wait
for MySQL to be reachable first, so give it a few seconds on first boot.

Env vars are documented in [.env.docker.example](.env.docker.example) — the actual
values used locally are inlined in `docker-compose.yml` via a shared YAML anchor
(`&app-env` / `*app-env`) so `app` and `worker` always stay in sync. These are dev
placeholders (`dev-db-password-change-me` etc.) — swap them before using this
anywhere that matters.

## Running without Docker (dev)

```bash
composer install && npm install
cp .env.example .env && php artisan key:generate
php artisan migrate
composer run dev   # runs the Laravel server, Vite, and a queue listener together
```

Defaults to SQLite for zero-setup local dev — this is independent of the Docker
setup, which always uses MySQL.

## Kubernetes

See [k8s/README.md](k8s/README.md) for full instructions (namespace, image
placeholders, apply order, access via Ingress or port-forward, teardown). Short
version:

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -R -f k8s/
kubectl get all -n invoices
```

Works against Docker Desktop's built-in single-node Kubernetes — no cloud cluster
needed for the demo (enable it in Docker Desktop settings if it isn't already).

## CI/CD

[.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) runs on every push to
`main`:

1. **test**: installs PHP/Node deps, runs the Pest suite (against in-memory
   SQLite), lints and builds the frontend.
2. **build-and-push**: builds the single Docker image and pushes it to Docker Hub,
   tagged `:latest` and `:<commit-sha>`.
3. **deploy** (bonus CD, self-hosted runner): pulls the freshly-pushed image and
   runs `docker compose up -d` — but only executes wherever a *self-hosted* GitHub
   Actions runner is registered and online, since GitHub's own cloud runners can't
   reach your local Docker Desktop. If none is registered, this job just stays
   queued; it doesn't fail and doesn't block the build/push job.

### One-time setup to make CI/CD actually run

1. **Docker Hub**: create a repo access token, then add `DOCKERHUB_USERNAME` and
   `DOCKERHUB_TOKEN` as GitHub Actions secrets on this repo (Settings → Secrets and
   variables → Actions).
2. **Self-hosted runner** (bonus CD step): Settings → Actions → Runners → New
   self-hosted runner, follow GitHub's generated `config.cmd`/`run.cmd` steps on
   your own PC, and leave `run.cmd` running (or install it as a Windows service) so
   it's online when you push.

## Elaborat / rubric mapping

| Requirement | Where |
|---|---|
| Public git repo | this repo |
| Dockerized app | `Dockerfile` (multi-stage: Node build → Composer install → PHP/Apache runtime), `docker/entrypoint.sh` |
| Docker Compose orchestration | `docker-compose.yml` |
| CI pipeline → image to registry | `.github/workflows/ci-cd.yml` (`test` + `build-and-push` jobs) |
| Bonus CD → deploy to an environment | `.github/workflows/ci-cd.yml` (`deploy` job, self-hosted runner + `docker compose`) |
| Deployment (ConfigMap/Secret) | `k8s/app/`, `k8s/worker/` |
| Service | `k8s/app/service.yaml`, `k8s/db/service.yaml` |
| Ingress | `k8s/ingress.yaml` |
| StatefulSet for the DB (ConfigMap/Secret) | `k8s/db/statefulset.yaml`, `configmap.yaml`, `secret.yaml` |
| Dedicated namespace, demonstrated running | `k8s/00-namespace.yaml`, see `k8s/README.md` for the demo commands |
