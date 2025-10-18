import { INodeProperties } from 'n8n-workflow';

export const campaignOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
			},
		},
		options: [
			{
				name: 'Trigger',
				value: 'trigger',
				description: 'Send an API-triggered campaign to specified users',
				action: 'Trigger a campaign',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get a list of campaigns',
				action: 'List campaigns',
			},
			{
				name: 'Get Details',
				value: 'details',
				description: 'Get details of a specific campaign',
				action: 'Get campaign details',
			},
			{
				name: 'Get Analytics',
				value: 'analytics',
				description: 'Get analytics data for a campaign',
				action: 'Get campaign analytics',
			},
		],
		default: 'trigger',
	},
];

export const campaignFields: INodeProperties[] = [
	// Trigger operation
	{
		displayName: 'Campaign ID',
		name: 'campaignId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['trigger', 'details', 'analytics'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the campaign',
	},
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['trigger'],
			},
		},
		default: '[]',
		required: true,
		description: 'Array of recipient objects with user identifiers and optional trigger properties',
		placeholder: '[{"external_user_id": "user123", "trigger_properties": {"promo_code": "SAVE20"}}]',
	},
	{
		displayName: 'Broadcast',
		name: 'broadcast',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['trigger'],
			},
		},
		default: false,
		description: 'Whether to send to the entire segment that the campaign targets',
	},
	// List operation
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['list'],
			},
		},
		default: 0,
		description: 'Page number for pagination',
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['list'],
			},
		},
		default: 100,
		description: 'Number of campaigns to return per page',
	},
	// Analytics operation
	{
		displayName: 'Length',
		name: 'length',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['campaign'],
				operation: ['analytics'],
			},
		},
		default: 7,
		description: 'Number of days to include in the analytics',
	},
];
