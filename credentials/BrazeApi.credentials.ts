import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BrazeApi implements ICredentialType {
	name = 'brazeApi';
	displayName = 'Braze API';
	documentationUrl = 'https://www.braze.com/docs/api/basics';
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
			description: 'The Braze REST API key',
		},
		{
			displayName: 'REST Endpoint',
			name: 'restEndpoint',
			type: 'string',
			default: 'https://rest.iad-01.braze.com',
			required: true,
			placeholder: 'https://rest.iad-01.braze.com',
			description: 'The REST API endpoint URL for your Braze instance. Find your endpoint at: https://www.braze.com/docs/api/basics/#endpoints',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=Bearer {{$credentials.apiKey}}',
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
				page_size: 1,
			},
		},
	};
}
