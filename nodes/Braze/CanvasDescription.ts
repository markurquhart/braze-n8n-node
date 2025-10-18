import { INodeProperties } from 'n8n-workflow';

export const canvasOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['canvas'],
			},
		},
		options: [
			{
				name: 'Trigger',
				value: 'trigger',
				description: 'Send an API-triggered Canvas to specified users',
				action: 'Trigger a canvas',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get a list of Canvases',
				action: 'List canvases',
			},
			{
				name: 'Get Details',
				value: 'details',
				description: 'Get details of a specific Canvas',
				action: 'Get canvas details',
			},
			{
				name: 'Get Analytics',
				value: 'analytics',
				description: 'Get analytics data for a Canvas',
				action: 'Get canvas analytics',
			},
		],
		default: 'trigger',
	},
];

export const canvasFields: INodeProperties[] = [
	// Trigger operation
	{
		displayName: 'Canvas ID',
		name: 'canvasId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['canvas'],
				operation: ['trigger', 'details', 'analytics'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the Canvas',
	},
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['canvas'],
				operation: ['trigger'],
			},
		},
		default: '[]',
		required: true,
		description: 'Array of recipient objects with user identifiers and optional canvas entry properties',
		placeholder: '[{"external_user_id": "user123", "canvas_entry_properties": {"source": "api"}}]',
	},
	{
		displayName: 'Broadcast',
		name: 'broadcast',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['canvas'],
				operation: ['trigger'],
			},
		},
		default: false,
		description: 'Whether to send to the entire segment that the Canvas targets',
	},
	// List operation
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['canvas'],
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
				resource: ['canvas'],
				operation: ['list'],
			},
		},
		default: 100,
		description: 'Number of Canvases to return per page',
	},
	// Analytics operation
	{
		displayName: 'Length',
		name: 'length',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['canvas'],
				operation: ['analytics'],
			},
		},
		default: 7,
		description: 'Number of days to include in the analytics',
	},
];
