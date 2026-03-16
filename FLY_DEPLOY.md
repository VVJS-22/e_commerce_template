# Fly.io Deployment Guide

## Prerequisites

1. Install the Fly CLI:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Sign up / log in:
   ```bash
   fly auth signup   # first time
   fly auth login    # returning user
   ```

## Initial Setup

### 1. Launch the app

From the project root:

```bash
fly launch --no-deploy
```

> This reads the existing `fly.toml`. When prompted, confirm the app name or pick a new one. Choose a region close to your users (default: `iad` — Ashburn, Virginia).

### 2. Set secrets (environment variables)

```bash
# Required
fly secrets set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ecom"
fly secrets set JWT_SECRET="your-strong-jwt-secret"
fly secrets set JWT_EXPIRE="7d"
fly secrets set FRONTEND_URL="https://crazy-wheelz-diecast.fly.dev"

# Email (Gmail SMTP)
fly secrets set EMAIL_HOST="smtp.gmail.com"
fly secrets set EMAIL_PORT="465"
fly secrets set EMAIL_USER="your-email@gmail.com"
fly secrets set EMAIL_PASSWORD="your-app-password"
fly secrets set EMAIL_FROM="your-email@gmail.com"
fly secrets set ADMIN_EMAIL="admin@example.com"

# Cloudinary
fly secrets set CLOUDINARY_CLOUD_NAME="your-cloud-name"
fly secrets set CLOUDINARY_API_KEY="your-api-key"
fly secrets set CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Deploy

```bash
fly deploy
```

## Useful Commands

| Command                  | Description                     |
| ------------------------ | ------------------------------- |
| `fly status`             | App status & machine info       |
| `fly logs`               | Stream live logs                |
| `fly ssh console`        | SSH into the running machine    |
| `fly secrets list`       | List configured secrets         |
| `fly deploy`             | Build & deploy latest code      |
| `fly scale memory 1024`  | Increase memory to 1 GB         |
| `fly scale count 2`      | Run 2 machines (horizontal)     |
| `fly open`               | Open the app in your browser    |

## Architecture

The app deploys as a **single service**: the Node.js backend serves both the API (`/api/*`) and the React frontend (static files from `frontend/dist`).

```
┌─────────────────────────────────────┐
│  Fly.io Machine (shared-cpu-1x)     │
│                                     │
│  Node.js (Express)                  │
│  ├── /api/*          → API routes   │
│  ├── /health         → Health check │
│  └── /*              → React SPA    │
│       (frontend/dist)               │
└─────────────────────────────────────┘
```

## Custom Domain

```bash
fly certs add yourdomain.com
```

Then add the DNS records Fly.io provides to your domain registrar. After DNS propagates, TLS is provisioned automatically.

Update `FRONTEND_URL` to the custom domain:
```bash
fly secrets set FRONTEND_URL="https://yourdomain.com"
```

## Scaling

**Vertical** (more CPU/memory):
```bash
fly scale vm shared-cpu-2x --memory 1024
```

**Horizontal** (more machines):
```bash
fly scale count 2
```

> With multiple machines, Fly.io automatically load-balances traffic across regions.

## Costs

- **Free tier**: 3 shared-cpu-1x VMs with 256 MB. Enough to run this app.
- The `auto_stop_machines = "stop"` setting in `fly.toml` stops the machine when idle, saving resources.
- Machines auto-start on incoming requests.
