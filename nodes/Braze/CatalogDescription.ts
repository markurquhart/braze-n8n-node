import { INodeProperties } from 'n8n-workflow';

export const catalogOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['catalog'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new catalog',
				action: 'Create a catalog',
			},
			{
				name: 'List',
				value: 'list',
				description: 'Get a list of catalogs',
				action: 'List catalogs',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a catalog',
				action: 'Delete a catalog',
			},
			{
				name: 'Create Item',
				value: 'createItem',
				description: 'Create catalog items',
				action: 'Create catalog items',
			},
			{
				name: 'Update Item',
				value: 'updateItem',
				description: 'Update catalog items',
				action: 'Update catalog items',
			},
			{
				name: 'Delete Item',
				value: 'deleteItem',
				description: 'Delete catalog items',
				action: 'Delete catalog items',
			},
			{
				name: 'Get Item',
				value: 'getItem',
				description: 'Get a specific catalog item',
				action: 'Get a catalog item',
			},
		],
		default: 'list',
	},
];

export const catalogFields: INodeProperties[] = [
	// Catalog name field (used by multiple operations)
	{
		displayName: 'Catalog Name',
		name: 'catalogName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['create', 'delete', 'createItem', 'updateItem', 'deleteItem', 'getItem'],
			},
		},
		default: '',
		required: true,
		description: 'The name of the catalog',
	},
	// Create catalog fields
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Description of the catalog',
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['create'],
			},
		},
		default: '[]',
		required: true,
		description: 'Array of field objects that define the catalog schema',
		placeholder: '[{"name": "id", "type": "string"}, {"name": "price", "type": "number"}]',
	},
	// Item operations
	{
		displayName: 'Items',
		name: 'items',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['createItem', 'updateItem', 'deleteItem'],
			},
		},
		default: '[]',
		required: true,
		description: 'Array of catalog item objects',
		placeholder: '[{"id": "item_001", "title": "Product Name", "price": 29.99}]',
	},
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['getItem'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the catalog item to retrieve',
	},
];
