# ISO-Connect
Consultants Platform

## Local run

```bash
cd app
npm install
npm run dev
```

## Build

```bash
cd app
npm run build
```

## Env vars

See `.env.example` in the `app` directory for required environment variables. The application will exit with a clear error message if any are missing.

## Health check

The endpoint `/api/healthz` returns `{"status":"ok"}` when the service is running.
