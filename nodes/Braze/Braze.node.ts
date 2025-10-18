import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	brazeApiRequest,
} from './GenericFunctions';

import {
	userOperations,
	userFields,
} from './UserDescription';

import {
	campaignOperations,
	campaignFields,
} from './CampaignDescription';

import {
	canvasOperations,
	canvasFields,
} from './CanvasDescription';

import {
	messageOperations,
	messageFields,
} from './MessageDescription';

import {
	segmentOperations,
	segmentFields,
} from './SegmentDescription';

import {
	catalogOperations,
	catalogFields,
} from './CatalogDescription';

export class Braze implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Braze',
		name: 'braze',
		icon: 'file:braze.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Braze customer engagement platform',
		defaults: {
			name: 'Braze',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'brazeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Campaign',
						value: 'campaign',
					},
					{
						name: 'Canvas',
						value: 'canvas',
					},
					{
						name: 'Catalog',
						value: 'catalog',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Segment',
						value: 'segment',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'user',
			},
			...userOperations,
			...userFields,
			...campaignOperations,
			...campaignFields,
			...canvasOperations,
			...canvasFields,
			...messageOperations,
			...messageFields,
			...segmentOperations,
			...segmentFields,
			...catalogOperations,
			...catalogFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				if (resource === 'user') {
					// User operations
					if (operation === 'track') {
						const events = this.getNodeParameter('events', i, []) as any[];
						const attributes = this.getNodeParameter('attributes', i, []) as any[];
						const purchases = this.getNodeParameter('purchases', i, []) as any[];

						const body: any = {};
						if (events.length > 0) body.events = events;
						if (attributes.length > 0) body.attributes = attributes;
						if (purchases.length > 0) body.purchases = purchases;

						responseData = await brazeApiRequest.call(this, 'POST', '/users/track', body);
					} else if (operation === 'identify') {
						const aliasesToIdentify = this.getNodeParameter('aliasesToIdentify', i) as any[];
						const body = { aliases_to_identify: aliasesToIdentify };
						responseData = await brazeApiRequest.call(this, 'POST', '/users/identify', body);
					} else if (operation === 'delete') {
						const externalIds = this.getNodeParameter('externalIds', i, '') as string;
						const body: any = {};
						if (externalIds) {
							body.external_ids = externalIds.split(',').map(id => id.trim());
						}
						responseData = await brazeApiRequest.call(this, 'POST', '/users/delete', body);
					} else if (operation === 'merge') {
						const identifierField = this.getNodeParameter('identifierField', i) as string;
						const identifierValue = this.getNodeParameter('identifierValue', i) as string;
						const mergeIdentifierField = this.getNodeParameter('mergeIdentifierField', i) as string;
						const mergeIdentifierValue = this.getNodeParameter('mergeIdentifierValue', i) as string;

						const body = {
							merge_updates: [
								{
									identifier_to_merge: { [identifierField]: identifierValue },
									identifier_to_keep: { [mergeIdentifierField]: mergeIdentifierValue },
								},
							],
						};
						responseData = await brazeApiRequest.call(this, 'POST', '/users/merge', body);
					} else if (operation === 'export') {
						const exportType = this.getNodeParameter('exportType', i) as string;
						let endpoint = '';
						const body: any = {};

						if (exportType === 'byId') {
							endpoint = '/users/export/ids';
							const externalIds = this.getNodeParameter('externalIds', i, '') as string;
							if (externalIds) {
								body.external_ids = externalIds.split(',').map(id => id.trim());
							}
						} else if (exportType === 'bySegment') {
							endpoint = '/users/export/segment';
							const segmentId = this.getNodeParameter('segmentId', i) as string;
							body.segment_id = segmentId;
						}

						responseData = await brazeApiRequest.call(this, 'POST', endpoint, body);
					} else if (operation === 'alias') {
						const userAliases = this.getNodeParameter('userAliases', i) as any[];
						const body = { user_aliases: userAliases };
						responseData = await brazeApiRequest.call(this, 'POST', '/users/alias/new', body);
					}
				} else if (resource === 'campaign') {
					// Campaign operations
					if (operation === 'trigger') {
						const campaignId = this.getNodeParameter('campaignId', i) as string;
						const recipients = this.getNodeParameter('recipients', i) as any[];
						const body: any = {
							campaign_id: campaignId,
							recipients,
						};
						const broadcast = this.getNodeParameter('broadcast', i, false) as boolean;
						if (broadcast) body.broadcast = true;

						responseData = await brazeApiRequest.call(this, 'POST', '/campaigns/trigger/send', body);
					} else if (operation === 'list') {
						const qs: any = {
							page: this.getNodeParameter('page', i, 0),
							page_size: this.getNodeParameter('pageSize', i, 100),
						};
						responseData = await brazeApiRequest.call(this, 'GET', '/campaigns/list', {}, qs);
					} else if (operation === 'details') {
						const campaignId = this.getNodeParameter('campaignId', i) as string;
						const qs = { campaign_id: campaignId };
						responseData = await brazeApiRequest.call(this, 'GET', '/campaigns/details', {}, qs);
					} else if (operation === 'analytics') {
						const campaignId = this.getNodeParameter('campaignId', i) as string;
						const qs: any = { campaign_id: campaignId };
						const length = this.getNodeParameter('length', i, 7) as number;
						qs.length = length;

						responseData = await brazeApiRequest.call(this, 'GET', '/campaigns/data_series', {}, qs);
					}
				} else if (resource === 'canvas') {
					// Canvas operations
					if (operation === 'trigger') {
						const canvasId = this.getNodeParameter('canvasId', i) as string;
						const recipients = this.getNodeParameter('recipients', i) as any[];
						const body: any = {
							canvas_id: canvasId,
							recipients,
						};
						const broadcast = this.getNodeParameter('broadcast', i, false) as boolean;
						if (broadcast) body.broadcast = true;

						responseData = await brazeApiRequest.call(this, 'POST', '/canvas/trigger/send', body);
					} else if (operation === 'list') {
						const qs: any = {
							page: this.getNodeParameter('page', i, 0),
							page_size: this.getNodeParameter('pageSize', i, 100),
						};
						responseData = await brazeApiRequest.call(this, 'GET', '/canvas/list', {}, qs);
					} else if (operation === 'details') {
						const canvasId = this.getNodeParameter('canvasId', i) as string;
						const qs = { canvas_id: canvasId };
						responseData = await brazeApiRequest.call(this, 'GET', '/canvas/details', {}, qs);
					} else if (operation === 'analytics') {
						const canvasId = this.getNodeParameter('canvasId', i) as string;
						const qs: any = { canvas_id: canvasId };
						const length = this.getNodeParameter('length', i, 7) as number;
						qs.length = length;

						responseData = await brazeApiRequest.call(this, 'GET', '/canvas/data_series', {}, qs);
					}
				} else if (resource === 'message') {
					// Message operations
					if (operation === 'send') {
						const recipients = this.getNodeParameter('recipients', i) as any[];
						const messages = this.getNodeParameter('messages', i) as any;
						const body: any = {
							recipients,
							messages,
						};
						responseData = await brazeApiRequest.call(this, 'POST', '/messages/send', body);
					} else if (operation === 'schedule') {
						const sendAt = this.getNodeParameter('sendAt', i) as string;
						const messages = this.getNodeParameter('messages', i) as any;
						const segment = this.getNodeParameter('segment', i, {}) as any;
						const body: any = {
							send_at: sendAt,
							messages,
						};
						if (segment && Object.keys(segment).length > 0) {
							body.segment_id = segment.segment_id;
						}
						responseData = await brazeApiRequest.call(this, 'POST', '/messages/schedule/create', body);
					}
				} else if (resource === 'segment') {
					// Segment operations
					if (operation === 'list') {
						const qs: any = {
							page: this.getNodeParameter('page', i, 0),
							page_size: this.getNodeParameter('pageSize', i, 100),
						};
						responseData = await brazeApiRequest.call(this, 'GET', '/segments/list', {}, qs);
					} else if (operation === 'details') {
						const segmentId = this.getNodeParameter('segmentId', i) as string;
						const qs = { segment_id: segmentId };
						responseData = await brazeApiRequest.call(this, 'GET', '/segments/details', {}, qs);
					} else if (operation === 'analytics') {
						const segmentId = this.getNodeParameter('segmentId', i) as string;
						const qs: any = { segment_id: segmentId };
						const length = this.getNodeParameter('length', i, 7) as number;
						qs.length = length;

						responseData = await brazeApiRequest.call(this, 'GET', '/segments/data_series', {}, qs);
					}
				} else if (resource === 'catalog') {
					// Catalog operations
					if (operation === 'create') {
						const catalogName = this.getNodeParameter('catalogName', i) as string;
						const description = this.getNodeParameter('description', i, '') as string;
						const fields = this.getNodeParameter('fields', i, []) as any[];
						const body: any = {
							catalogs: [
								{
									name: catalogName,
									description,
									fields,
								},
							],
						};
						responseData = await brazeApiRequest.call(this, 'POST', '/catalogs', body);
					} else if (operation === 'list') {
						responseData = await brazeApiRequest.call(this, 'GET', '/catalogs');
					} else if (operation === 'delete') {
						const catalogName = this.getNodeParameter('catalogName', i) as string;
						responseData = await brazeApiRequest.call(this, 'DELETE', `/catalogs/${catalogName}`);
					} else if (operation === 'createItem') {
						const catalogName = this.getNodeParameter('catalogName', i) as string;
						const items = this.getNodeParameter('items', i) as any[];
						const body = { items };
						responseData = await brazeApiRequest.call(this, 'POST', `/catalogs/${catalogName}/items`, body);
					} else if (operation === 'updateItem') {
						const catalogName = this.getNodeParameter('catalogName', i) as string;
						const items = this.getNodeParameter('items', i) as any[];
						const body = { items };
						responseData = await brazeApiRequest.call(this, 'PATCH', `/catalogs/${catalogName}/items`, body);
					} else if (operation === 'deleteItem') {
						const catalogName = this.getNodeParameter('catalogName', i) as string;
						const items = this.getNodeParameter('items', i) as any[];
						const body = { items };
						responseData = await brazeApiRequest.call(this, 'DELETE', `/catalogs/${catalogName}/items`, body);
					} else if (operation === 'getItem') {
						const catalogName = this.getNodeParameter('catalogName', i) as string;
						const itemId = this.getNodeParameter('itemId', i) as string;
						responseData = await brazeApiRequest.call(this, 'GET', `/catalogs/${catalogName}/items/${itemId}`);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as any),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
