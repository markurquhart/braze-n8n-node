import { INodeProperties } from 'n8n-workflow';

export const segmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['segment'],
			},
		},
		options: [
			{
				name: 'List',
				value: 'list',
				description: 'Get a list of segments',
				action: 'List segments',
			},
			{
				name: 'Get Details',
				value: 'details',
				description: 'Get details of a specific segment',
				action: 'Get segment details',
			},
			{
				name: 'Get Analytics',
				value: 'analytics',
				description: 'Get analytics data for a segment',
				action: 'Get segment analytics',
			},
		],
		default: 'list',
	},
];

export const segmentFields: INodeProperties[] = [
	// List operation
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['segment'],
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
				resource: ['segment'],
				operation: ['list'],
			},
		},
		default: 100,
		description: 'Number of segments to return per page',
	},
	// Details and Analytics operations
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['details', 'analytics'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the segment',
	},
	// Analytics operation
	{
		displayName: 'Length',
		name: 'length',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['analytics'],
			},
		},
		default: 7,
		description: 'Number of days to include in the analytics',
	},
];
