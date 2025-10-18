import { INodeProperties } from 'n8n-workflow';

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{
				name: 'Send',
				value: 'send',
				description: 'Send an immediate one-off message to specific users',
				action: 'Send a message',
			},
			{
				name: 'Schedule',
				value: 'schedule',
				description: 'Schedule a message to be sent at a specific time',
				action: 'Schedule a message',
			},
		],
		default: 'send',
	},
];

export const messageFields: INodeProperties[] = [
	// Send operation
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
			},
		},
		default: '[]',
		required: true,
		description: 'Array of recipient objects with user identifiers',
		placeholder: '[{"external_user_id": "user123"}]',
	},
	{
		displayName: 'Messages',
		name: 'messages',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send', 'schedule'],
			},
		},
		default: '{}',
		required: true,
		description: 'Message content object containing the message to send',
		placeholder: '{"apple_push": {"alert": "Hello!", "badge": 1}}',
	},
	// Schedule operation
	{
		displayName: 'Send At',
		name: 'sendAt',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['schedule'],
			},
		},
		default: '',
		required: true,
		description: 'ISO 8601 datetime string for when to send the message',
		placeholder: '2024-01-01T12:00:00Z',
	},
	{
		displayName: 'Segment',
		name: 'segment',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['schedule'],
			},
		},
		default: '{}',
		description: 'Optional segment object to target. Include segment_id to send to a segment.',
		placeholder: '{"segment_id": "segment_identifier"}',
	},
];
