# @markurquhart/n8n-nodes-braze

n8n community node for the [Braze](https://www.braze.com) REST API.

[n8n](https://n8n.io/) is a workflow automation platform. This package follows n8n's current community-node guidance: a declarative REST node, credential test, no runtime dependencies, and `usableAsTool` so the node can be called by an AI Agent.

## Installation

The package is not published to npm yet, so the only working setup right now is running this repo locally. See [Run n8n locally with this node](#run-n8n-locally-with-this-node).

Once the package is published, self-hosted n8n users can install it from **Settings > Community Nodes**: select **Install**, enter `@markurquhart/n8n-nodes-braze`, and agree to the risks. See the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

Create a Braze REST API key under **Settings > APIs and Identifiers > API Keys**, and choose the instance that matches your dashboard.

| Dashboard | REST endpoint |
| --- | --- |
| US-01 `dashboard-01.braze.com` | `https://rest.iad-01.braze.com` |
| US-02 through US-08 | `https://rest.iad-02.braze.com` through `https://rest.iad-08.braze.com` |
| US-10 `dashboard.us-10.braze.com` | `https://rest.us-10.braze.com` |
| EU-01 `dashboard-01.braze.eu` | `https://rest.fra-01.braze.eu` |
| EU-02 `dashboard-02.braze.eu` | `https://rest.fra-02.braze.eu` |
| AU-01, ID-01, JP-01, KR-01 | `https://rest.au-01.braze.com`, `https://rest.id-01.braze.com`, `https://rest.jp-01.braze.com`, `https://rest.kr-01.braze.com` |

The full list is in the [Braze API overview](https://www.braze.com/docs/api/basics/#endpoints). The credential test calls `GET /campaigns/list`, so the key needs the `campaigns.list` permission. Other operations need the permission for that endpoint. A key cannot be edited after it is created.

Requests send the key as `Authorization: Bearer <REST API key>`.

## Operations

This is a single declarative node. It covers the resources below and matches the current Braze REST API:

- User alias update, external ID rename and remove, and track status
- User delete and export by Braze ID, alias, email, phone, or device ID
- User merge when one side is a user alias
- Canvas summary, and schedule create, update, and delete for campaigns and Canvases
- Transactional campaign send, send IDs, and send analytics
- Message schedule update and delete, scheduled broadcasts, and Live Activity updates
- Synchronous catalog item reads and writes, plus asynchronous bulk item calls
- Subscription groups (status v2), email subscription state, bounces, spam, and blocklist
- SMS invalid numbers, Content Blocks, email templates, and preference center links
- Custom events, purchases, sessions, KPIs, and Cloud Data Ingestion sync

List endpoints no longer send `page_size`. Braze returns a fixed page (usually 100) and uses `page`. Scheduled messages now send Braze's `schedule` object and a campaign ID. `POST /messages/schedule/create` requires that campaign ID.

Campaign, Canvas, segment, and catalog pickers can load a list from the API or take an ID directly.

Bulk catalog item calls (`Create Items`, `Update Items`, `Replace Items`, `Delete Items`) are asynchronous. Braze accepts the request before every item has finished updating. Use the single-item operations when you need a synchronous result.

## Development

```bash
npm install
npm run build   # n8n-node build
npm run lint    # n8n-node lint (strict community-node rules)
```

The project uses the [`n8n-node` CLI](https://docs.n8n.io/connect/create-nodes/build-your-node/using-the-n8n-node-tool/). `cloud-support` is enabled, so `npm run lint` checks the package against n8n Cloud rules. Verification guidelines are in [technical](https://docs.n8n.io/connect/create-nodes/build-your-node/reference/verification-guidelines/) and [UX](https://docs.n8n.io/connect/create-nodes/build-your-node/reference/ux-guidelines/) form.

### Run n8n locally with this node

You need **Node.js 24 or newer** and npm. Docker is not required. n8n and its database stay outside this repository.

`npm run dev` is supposed to install `n8n@latest` and start it. That fails on macOS with current n8n releases: `n8n-nodes-base` 2.46 and newer depends on `@napi-rs/canvas-linux-arm64-musl`, which npm will not install on macOS. Use n8n **2.45.6** until that is fixed.

**Terminal 1**, from this repository. This compiles on save and links the node into `~/.n8n-node-cli`:

```bash
npm install
npm run dev -- --external-n8n
```

**Terminal 2.** This installs n8n in its own folder and loads the linked node:

```bash
mkdir -p ~/n8n-demo && cd ~/n8n-demo
npm install n8n@2.45.6
N8N_DEV_RELOAD=true N8N_USER_FOLDER="$HOME/.n8n-node-cli" DB_SQLITE_POOL_SIZE=10 npx n8n
```

Start terminal 1 first. Open the URL n8n prints (usually http://localhost:5678), create the owner account, then add a Braze API credential and use the Braze node.

Leave `~/n8n-demo` and `~/.n8n-node-cli` uncommitted. The second folder holds the n8n database, workflows, and saved credentials.

## Releasing

Releases publish from GitHub Actions with an npm provenance statement (`.github/workflows/publish.yml`). This is required for n8n Cloud verification.

1. In npm, add a Trusted Publisher for this package: GitHub Actions, owner `markurquhart`, repository `braze-n8n-node`, workflow `publish.yml`.
2. Run `npm run release` locally. It bumps the version, tags it, and pushes.
3. The tag push runs the workflow, which publishes to npm.

## Installing on n8n Cloud

n8n Cloud installs only **verified** community nodes from the Nodes panel. This package is not published or verified yet, so it is not available on Cloud. Once it is verified, enable **Verified community nodes** under Instance settings → Runtime and install it from the Nodes panel. Self-hosted instances can install it from Settings → Community Nodes after it is published.

## Compatibility

Runs on n8n 1.x and 2.x. Local development currently uses n8n 2.45.6, which requires Node.js 24 or newer. `usableAsTool` requires n8n 1.79 or newer. Verified installs on Cloud require n8n 1.94 or newer. The package has no runtime dependencies.

## Resources

- [n8n community nodes](https://docs.n8n.io/integrations/community-nodes/building-community-nodes/)
- [Build a node](https://docs.n8n.io/connect/create-nodes/)
- [Braze API guide](https://www.braze.com/docs/api/home/)
- [Braze endpoint glossary](https://www.braze.com/docs/api/endpoints/)

## License

[MIT](LICENSE.md)
