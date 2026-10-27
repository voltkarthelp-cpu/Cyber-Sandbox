# Deploying CyberSandbox to Render.com

This guide provides the exact settings and commands required to deploy this React + Vite application to [Render](https://render.com).

---

## ⚡ Option 1: Static Site (Recommended — 100% Free Forever)

Render Static Sites are **free**, backed by a global CDN edge cache, have **zero cold starts**, and don't sleep after inactivity.

### Step-by-Step Instructions:

1. **Push your code to GitHub / GitLab**.
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → Select **Static Site**.
4. Connect your Git repository.
5. Configure the following fields:

| Setting | Value | Note |
|---|---|---|
| **Name** | `cybersandbox-game` | Any name of your choice |
| **Branch** | `main` | Or your default branch |
| **Root Directory** | *(leave blank)* | Root of repository |
| **Build Command** | `npm install --legacy-peer-deps && npm run build` | Includes `--legacy-peer-deps` to guarantee clean installation |
| **Publish Directory** | `dist` | Vite outputs build to `dist/` |

6. **Add SPA Redirect/Rewrite Rule (Crucial for Single Page Apps)**:
   In your Render static site dashboard under **Redirects/Rewrites**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`

7. Click **Create Static Site**. Render will build and deploy your app in under 1 minute with a free `*.onrender.com` URL and automatic HTTPS.

---

## 🚀 Option 2: Render Blueprint (`render.yaml`)

We have pre-configured a `render.yaml` file in the repository root.

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → Select **Blueprint**.
3. Connect your repository.
4. Render will automatically read `render.yaml` and configure the **Build Command**, **Publish Directory**, and **SPA Rewrite rules** with a single click.

---

## 💻 Option 3: Web Service (Node.js)

If you prefer to deploy as a Node.js Web Service rather than a static site:

| Setting | Value |
|---|---|
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

*(The `npm start` script in `package.json` runs `vite preview --host 0.0.0.0 --port ${PORT:-3000}`, binding automatically to Render's assigned `$PORT`)*.

---

## 🔍 Troubleshooting & Key Notes

- **Node Version**: Render uses Node 20+ by default. If needed, you can specify Node version by setting an environment variable in Render: `NODE_VERSION=20.18.0`.
- **404 on page refresh**: Ensure the Rewrite rule (`/*` → `/index.html`) is set so direct URLs route to the single page app.
