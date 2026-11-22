# AZ-104 lab: App Service demo app

This is a learning project. It is the deployable web app for the App Service and autoscaling step of the [azure-az104-lab](https://github.com/tttaufiqqq/azure-az104-lab) project, where it demonstrates deployment slots, slot-swap settings, autoscaling, and backup on Azure App Service.

> [!NOTE]
> This is a personal learning implementation. It is not official Microsoft guidance.

The app itself is intentionally trivial: a single zero-dependency Node.js HTTP server that renders a coloured page showing its version, slot, and environment settings. The point of the project isn't the app — it's what Azure does with it.

## 1. Why this app exists

App Service deployment slots and slot settings are easiest to understand when you can *see* the difference between slots and watch what survives a swap. This app renders:

- A version number and background colour (different per branch, so slots are visually distinct)
- Which slot it's running in, derived from the host name
- A sticky setting (`SLOT_LABEL`) that stays with the slot across a swap
- A swapping setting (`APP_MESSAGE`) that moves with the app across a swap
- A `/health` endpoint for health checks

## 2. How it's used

| Branch | Version | Colour | Deployed to |
|---|---|---|---|
| `main` | v1 | Blue (`#1e6bd6`) | Production slot |
| `staging` | v2 | Green (`#1f9d55`) | Staging slot |

Deployed via GitHub Actions ([`.github/workflows/main_app-lab-1612.yml`](.github/workflows/main_app-lab-1612.yml)), which builds and pushes to the Azure Web App `app-lab-1612` on every push to `main`. The staging slot deploys from the `staging` branch through its own Deployment Center connection.

Swapping the slots exchanges the running code (and any slot setting), so production starts serving `v2` green while staging serves `v1` blue — but each slot keeps its own `SLOT_LABEL`, and each slot's `APP_MESSAGE` moves with the swap. See [azure-az104-lab/06-app-service](https://github.com/tttaufiqqq/azure-az104-lab/tree/main/06-app-service) for the full walkthrough, screenshots, and what actually happened during the swap.

## 3. Environment variables

| Variable | Set as | Purpose |
|---|---|---|
| `APP_MESSAGE` | Regular app setting | Shown on the page; moves with the app on a slot swap |
| `SLOT_LABEL` | Deployment slot setting (sticky) | Shown on the page; stays with the slot on a swap |
| `PORT` | Platform-provided | Port the server listens on (defaults to `8080`) |
| `WEBSITE_HOSTNAME` | Platform-provided | Used to infer which slot is serving the request, since `WEBSITE_SLOT_NAME` isn't set on this Linux plan |

## 4. Running it locally

Requires Node.js 20 or later.

```bash
npm install
npm start
```

Visit `http://localhost:8080`. Without `APP_MESSAGE` or `SLOT_LABEL` set, the page shows `(not set)` for both, and the slot shows as `local`.

```bash
curl http://localhost:8080/health
# ok
```

## 5. What I learned

- A slot setting (marked "deployment slot setting" in App Service Configuration) stays with the slot on a swap; a regular setting moves with the app.
- On Linux App Service, `WEBSITE_SLOT_NAME` isn't populated — the slot has to be inferred some other way, here from `WEBSITE_HOSTNAME`.
- A slot swap moves the running process rather than restarting it fresh, so values captured at process start (like the inferred slot name) can lag behind the swap until the process restarts.
- Deployment slots don't change which Git branch each slot tracks — a later push to `main` would redeploy over a swapped slot.

## 6. Related resources

- [azure-az104-lab](https://github.com/tttaufiqqq/azure-az104-lab): the full AZ-104 lab, including the App Service step this app supports
- [azure-az104-lab/06-app-service](https://github.com/tttaufiqqq/azure-az104-lab/tree/main/06-app-service): deployment slots, autoscale, and backup walkthrough with screenshots
