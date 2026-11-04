import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

const instances: Array<{ name: string; value: string }> = [
	{ name: 'US-01', value: 'https://rest.iad-01.braze.com' },
	{ name: 'US-02', value: 'https://rest.iad-02.braze.com' },
	{ name: 'US-03', value: 'https://rest.iad-03.braze.com' },
	{ name: 'US-04', value: 'https://rest.iad-04.braze.com' },
	{ name: 'US-05', value: 'https://rest.iad-05.braze.com' },
	{ name: 'US-06', value: 'https://rest.iad-06.braze.com' },
	{ name: 'US-07', value: 'https://rest.iad-07.braze.com' },
	{ name: 'US-08', value: 'https://rest.iad-08.braze.com' },
	{ name: 'US-10', value: 'https://rest.us-10.braze.com' },
	{ name: 'EU-01', value: 'https://rest.fra-01.braze.eu' },
	{ name: 'EU-02', value: 'https://rest.fra-02.braze.eu' },
	{ name: 'AU-01', value: 'https://rest.au-01.braze.com' },
	{ name: 'ID-01', value: 'https://rest.id-01.braze.com' },
	{ name: 'JP-01', value: 'https://rest.jp-01.braze.com' },
	{ name: 'KR-01', value: 'https://rest.kr-01.braze.com' },
];

export class BrazeApi implements ICredentialType {
	name = 'brazeApi';

	displayName = 'Braze API';

	icon: Icon = { light: 'file:braze.png', dark: 'file:braze.png' };

	documentationUrl = 'https://www.braze.com/docs/api/basics/#endpoints';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Braze REST API key from Settings > APIs and Identifiers. The key needs permission for each endpoint this node calls.',
		},
		{
			displayName: 'Instance',
			name: 'restEndpoint',
			type: 'options',
			options: instances.map((instance) => ({
				name: `${instance.name} (${instance.value})`,
				value: instance.value,
			})),
			default: 'https://rest.iad-01.braze.com',
			description: 'REST endpoint for your Braze instance. Match it to the dashboard URL, or copy it from Settings > APIs and Identifiers > API Keys. The credential test calls GET /campaigns/list, so the key needs the campaigns.list permission.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.restEndpoint}}',
			url: '/campaigns/list',
			method: 'GET',
			qs: {
				page: 0,
			},
		},
	};
}
