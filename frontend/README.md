# Frontend

React and TypeScript web client, built and served locally with Vite.

## Requirements

- Node.js and npm

## Setup

From this directory, install dependencies and create a local environment file:

```sh
npm ci
cp .env.example .env
```

Set these values in `.env` as needed:

- `VITE_API_BASE_URL` - Backend base URL (default: `http://localhost:8080`)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Run locally

```sh
npm run dev
```

Vite prints the local URL when the development server starts.

## Build and checks

```sh
npm run build
npm test
npm run lint
```
