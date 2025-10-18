import { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Track',
				value: 'track',
				description: 'Record custom events, purchases, and update user profile attributes',
				action: 'Track a user',
			},
			{
				name: 'Identify',
				value: 'identify',
				description: 'Identify an unidentified (alias-only) user',
				action: 'Identify a user',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a user profile',
				action: 'Delete a user',
			},
			{
				name: 'Merge',
				value: 'merge',
				description: 'Merge two user profiles',
				action: 'Merge users',
			},
			{
				name: 'Export',
				value: 'export',
				description: 'Export user data by ID or segment',
				action: 'Export users',
			},
			{
				name: 'Create Alias',
				value: 'alias',
				description: 'Create a new user alias',
				action: 'Create user alias',
			},
		],
		default: 'track',
	},
];

export const userFields: INodeProperties[] = [
	// Track operation
	{
		displayName: 'Events',
		name: 'events',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['track'],
			},
		},
		default: '[]',
		description: 'Array of event objects to track. Each event should have external_id, name, and time.',
		placeholder: '[{"external_id": "user123", "name": "event_name", "time": "2024-01-01T00:00:00Z"}]',
	},
	{
		displayName: 'Attributes',
		name: 'attributes',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['track'],
			},
		},
		default: '[]',
		description: 'Array of user attribute objects to update',
		placeholder: '[{"external_id": "user123", "first_name": "John", "email": "john@example.com"}]',
	},
	{
		displayName: 'Purchases',
		name: 'purchases',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['track'],
			},
		},
		default: '[]',
		description: 'Array of purchase objects to track',
		placeholder: '[{"external_id": "user123", "product_id": "prod_123", "currency": "USD", "price": 12.34, "time": "2024-01-01T00:00:00Z"}]',
	},
	// Identify operation
	{
		displayName: 'Aliases to Identify',
		name: 'aliasesToIdentify',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['identify'],
			},
		},
		default: '[]',
		required: true,
		description: 'Array of alias objects to identify',
		placeholder: '[{"external_id": "user123", "user_alias": {"alias_name": "device_id_123", "alias_label": "device_id"}}]',
	},
	// Delete operation
	{
		displayName: 'External IDs',
		name: 'externalIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['delete'],
			},
		},
		default: '',
		required: true,
		description: 'Comma-separated list of external user IDs to delete',
		placeholder: 'user123, user456, user789',
	},
	// Merge operation
	{
		displayName: 'Identifier Field',
		name: 'identifierField',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['merge'],
			},
		},
		options: [
			{
				name: 'External ID',
				value: 'external_id',
			},
			{
				name: 'User Alias',
				value: 'user_alias',
			},
			{
				name: 'Braze ID',
				value: 'braze_id',
			},
		],
		default: 'external_id',
		required: true,
		description: 'The type of identifier to merge from',
	},
	{
		displayName: 'Identifier Value',
		name: 'identifierValue',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['merge'],
			},
		},
		default: '',
		required: true,
		description: 'The identifier value to merge from (this user will be merged and deleted)',
	},
	{
		displayName: 'Merge Identifier Field',
		name: 'mergeIdentifierField',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['merge'],
			},
		},
		options: [
			{
				name: 'External ID',
				value: 'external_id',
			},
			{
				name: 'User Alias',
				value: 'user_alias',
			},
			{
				name: 'Braze ID',
				value: 'braze_id',
			},
		],
		default: 'external_id',
		required: true,
		description: 'The type of identifier to merge into',
	},
	{
		displayName: 'Merge Identifier Value',
		name: 'mergeIdentifierValue',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['merge'],
			},
		},
		default: '',
		required: true,
		description: 'The identifier value to merge into (this user will be kept)',
	},
	// Export operation
	{
		displayName: 'Export Type',
		name: 'exportType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['export'],
			},
		},
		options: [
			{
				name: 'By ID',
				value: 'byId',
			},
			{
				name: 'By Segment',
				value: 'bySegment',
			},
		],
		default: 'byId',
		required: true,
		description: 'How to export users',
	},
	{
		displayName: 'External IDs',
		name: 'externalIds',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['export'],
				exportType: ['byId'],
			},
		},
		default: '',
		required: true,
		description: 'Comma-separated list of external user IDs to export',
		placeholder: 'user123, user456',
	},
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['export'],
				exportType: ['bySegment'],
			},
		},
		default: '',
		required: true,
		description: 'The segment ID to export users from',
	},
	// Alias operation
	{
		displayName: 'User Aliases',
		name: 'userAliases',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['alias'],
			},
		},
		default: '[]',
		required: true,
		description: 'Array of user alias objects to create',
		placeholder: '[{"external_id": "user123", "alias_name": "device_id_123", "alias_label": "device_id"}]',
	},
];
