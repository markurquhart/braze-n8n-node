# n8n-nodes-braze

This is an n8n community node for integrating with [Braze](https://www.braze.com), a customer engagement platform.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-braze` in **Enter npm package name**
4. Agree to the risks and install

### Manual Installation

To install manually, navigate to your n8n installation directory and run:

```bash
npm install n8n-nodes-braze
```

## Credentials

To use this node, you'll need:

1. **API Key**: Your Braze REST API key
2. **REST Endpoint**: Your Braze instance REST endpoint URL (e.g., `https://rest.iad-01.braze.com`)

You can find your REST endpoint at: https://www.braze.com/docs/api/basics/#endpoints

## Operations

This node supports the following resources and operations:

### User
- **Track**: Record custom events, purchases, and update user attributes
- **Identify**: Identify an unidentified (alias-only) user
- **Delete**: Delete a user profile
- **Merge**: Merge two user profiles
- **Export**: Export user data by ID or segment
- **Create Alias**: Create a new user alias

### Campaign
- **Trigger**: Send an API-triggered campaign to specified users
- **List**: Get a list of campaigns
- **Get Details**: Get details of a specific campaign
- **Get Analytics**: Get analytics data for a campaign

### Canvas
- **Trigger**: Send an API-triggered Canvas to specified users
- **List**: Get a list of Canvases
- **Get Details**: Get details of a specific Canvas
- **Get Analytics**: Get analytics data for a Canvas

### Message
- **Send**: Send an immediate one-off message to specific users
- **Schedule**: Schedule a message to be sent at a specific time

### Segment
- **List**: Get a list of segments
- **Get Details**: Get details of a specific segment
- **Get Analytics**: Get analytics data for a segment

### Catalog
- **Create**: Create a new catalog
- **List**: Get a list of catalogs
- **Delete**: Delete a catalog
- **Create Item**: Create catalog items
- **Update Item**: Update catalog items
- **Delete Item**: Delete catalog items
- **Get Item**: Get a specific catalog item

## Development

To build and develop this node locally:

```bash
# Install dependencies
npm install

# Build the node
npm run build

# Create package for distribution
npm pack
```

### Local Testing with Docker

If you're running n8n in Docker, you can test the node locally:

1. Build the node: `npm run build`
2. Copy to your n8n custom nodes directory in the Docker volume
3. Restart n8n with the `N8N_CUSTOM_EXTENSIONS` environment variable

## Compatibility

Tested with n8n version 1.115.3+

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Braze API documentation](https://www.braze.com/docs/api/home)

## License

[MIT](LICENSE.md)
