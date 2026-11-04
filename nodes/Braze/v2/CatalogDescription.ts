import { INodeProperties } from 'n8n-workflow';

import { omitEmptyBody } from '../GenericFunctions';
import { buildCatalog, buildCatalogItem, catalogPath } from './requestBuilders';
import { get, http, jsonBody, operation, queryString, resourceLocator, show, omitEmptyQuery } from './shared';

const catalog = (operations: string[]) => show('catalog', operations);
const asyncItemOps = ['createItems', 'updateItems', 'deleteItems', 'replaceItems'];

export const catalogOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['catalog'] } },
		options: [
			operation('Create', 'create', 'Create catalog', 'Create a catalog.', {
				request: { method: 'POST', url: '/catalogs' },
				send: { preSend: [buildCatalog] },
			}),
			operation('Get Many', 'list', 'Get many catalogs', 'List catalogs in this workspace.', get('/catalogs')),
			operation('Delete', 'delete', 'Delete catalog', 'Permanently delete a catalog.', {
				request: { method: 'DELETE', url: '/catalogs' },
				send: { preSend: [catalogPath()] },
				output: {
					postReceive: [
						async function (items) {
							return items.map((item) => ({ json: { deleted: true, ...item.json }, pairedItem: item.pairedItem }));
						},
					],
				},
			}),
			operation('Create Items', 'createItems', 'Create catalog items', 'Create up to 50 catalog items asynchronously.', {
				...http('POST', '/catalogs'),
				send: { preSend: [catalogPath('/items'), omitEmptyBody] },
			}),
			operation('Update Items', 'updateItems', 'Update catalog items', 'Edit up to 50 catalog items asynchronously.', {
				...http('PATCH', '/catalogs'),
				send: { preSend: [catalogPath('/items'), omitEmptyBody] },
			}),
			operation('Replace Items', 'replaceItems', 'Replace catalog items', 'Replace up to 50 catalog items asynchronously.', {
				...http('PUT', '/catalogs'),
				send: { preSend: [catalogPath('/items/'), omitEmptyBody] },
			}),
			operation('Delete Items', 'deleteItems', 'Delete catalog items', 'Delete up to 50 catalog items asynchronously.', {
				...http('DELETE', '/catalogs'),
				send: { preSend: [catalogPath('/items'), omitEmptyBody] },
			}),
			operation('Get Many Items', 'getItems', 'Get many catalog items', 'List items in a catalog.', {
				...get('/catalogs'),
				send: { preSend: [catalogPath('/items'), omitEmptyQuery] },
			}),
			operation('Get Item', 'getItem', 'Get catalog item', 'Retrieve one catalog item.', {
				...get('/catalogs'),
				send: { preSend: [catalogPath('/items/{itemId}')] },
			}),
			operation('Create Item', 'createItem', 'Create catalog item', 'Create one catalog item synchronously.', {
				request: { method: 'POST', url: '/catalogs' },
				send: { preSend: [catalogPath('/items/{itemId}'), buildCatalogItem] },
			}),
			operation('Update Item', 'updateItem', 'Update catalog item', 'Edit one catalog item synchronously.', {
				request: { method: 'PATCH', url: '/catalogs' },
				send: { preSend: [catalogPath('/items/{itemId}'), buildCatalogItem] },
			}),
			operation('Replace Item', 'replaceItem', 'Replace catalog item', 'Replace one catalog item synchronously.', {
				request: { method: 'PUT', url: '/catalogs' },
				send: { preSend: [catalogPath('/items/{itemId}'), buildCatalogItem] },
			}),
			operation('Delete Item', 'deleteItem', 'Delete catalog item', 'Delete one catalog item synchronously.', {
				request: { method: 'DELETE', url: '/catalogs' },
				send: { preSend: [catalogPath('/items/{itemId}')] },
				output: {
					postReceive: [
						async function (items) {
							return items.map((item) => ({ json: { deleted: true, ...item.json }, pairedItem: item.pairedItem }));
						},
					],
				},
			}),
			operation('Create Fields', 'createFields', 'Create catalog fields', 'Add fields to a catalog.', {
				...http('POST', '/catalogs'),
				send: { preSend: [catalogPath('/fields/'), omitEmptyBody] },
			}),
			operation('Delete Field', 'deleteField', 'Delete catalog field', 'Delete a field from a catalog.', {
				request: { method: 'DELETE', url: '/catalogs' },
				send: { preSend: [catalogPath('/fields/{itemId}', 'fieldName')] },
			}),
		],
		default: 'list',
	},
];

export const catalogFields: INodeProperties[] = [
	{
		displayName: 'Bulk item changes are asynchronous. Braze accepts the request before every item has finished updating.',
		name: 'catalogAsyncNotice',
		type: 'notice',
		default: '',
		displayOptions: catalog(asyncItemOps),
	},
	resourceLocator({
		displayName: 'Catalog',
		name: 'catalogName',
		description: 'Catalog to use.',
		searchListMethod: 'searchCatalogs',
		placeholder: 'e.g. restaurants',
		displayOptions: catalog([
			'delete', 'createItems', 'updateItems', 'replaceItems', 'deleteItems',
			'getItems', 'getItem', 'createItem', 'updateItem', 'replaceItem', 'deleteItem',
			'createFields', 'deleteField',
		]),
	}),
	{
		displayName: 'Catalog Name',
		name: 'newCatalogName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. restaurants',
		description: 'Name of the catalog to create.',
		displayOptions: catalog(['create']),
	},
	{
		displayName: 'Description',
		name: 'catalogDescription',
		type: 'string',
		default: '',
		description: 'Description of the catalog.',
		displayOptions: catalog(['create']),
	},
	jsonBody(
		'Fields',
		'catalogFields',
		'fields',
		'Field definitions. Types are string, number, boolean, and time. Include an id field.',
		'[{"name": "id", "type": "string"}, {"name": "price", "type": "number"}]',
		catalog(['create']),
		true,
	),
	jsonBody(
		'Items',
		'catalogItems',
		'items',
		'Catalog item objects. Each item needs an id. Up to 50 items per request.',
		'[{"id": "item1", "title": "Product", "price": 29.99}]',
		catalog(asyncItemOps),
		true,
	),
	jsonBody(
		'Fields',
		'newCatalogFields',
		'fields',
		'Fields to add. Types are string, number, boolean, and time.',
		'[{"name": "color", "type": "string"}]',
		catalog(['createFields']),
		true,
	),
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. item1',
		description: 'ID of the catalog item.',
		displayOptions: catalog(['getItem', 'createItem', 'updateItem', 'replaceItem', 'deleteItem']),
	},
	{
		displayName: 'Field Name',
		name: 'fieldName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the catalog field to delete.',
		displayOptions: catalog(['deleteField']),
	},
	jsonBody(
		'Item',
		'item',
		'item',
		'Fields to write on this item. The item ID from the field above is sent as id.',
		'{"title": "Product", "price": 29.99}',
		catalog(['createItem', 'updateItem', 'replaceItem']),
		true,
		false,
	),
	queryString('Cursor', 'catalogCursor', 'cursor', 'Cursor from a previous item list response.', catalog(['getItems'])),
];
