import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
} from 'n8n-workflow';

import { searchCampaigns, searchCanvases, searchCatalogs, searchSegments } from './GenericFunctions';
import { campaignFields, campaignOperations } from './v2/CampaignDescription';
import { canvasFields, canvasOperations } from './v2/CanvasDescription';
import { catalogFields, catalogOperations } from './v2/CatalogDescription';
import { messageFields, messageOperations } from './v2/MessageDescription';
import { segmentFields, segmentOperations } from './v2/SegmentDescription';
import { userFields, userOperations } from './v2/UserDescription';
import {
	cdiFields,
	cdiOperations,
	contentBlockFields,
	contentBlockOperations,
	emailFields,
	emailOperations,
	eventFields,
	eventOperations,
	kpiFields,
	kpiOperations,
	preferenceFields,
	preferenceOperations,
	purchaseFields,
	purchaseOperations,
	sessionFields,
	sessionOperations,
	smsFields,
	smsOperations,
	subscriptionFields,
	subscriptionOperations,
	templateFields,
	templateOperations,
} from './v2/WorkspaceDescription';

export class Braze implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Braze',
		name: 'braze',
		icon: { light: 'file:braze.png', dark: 'file:braze.png' },
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the Braze REST API',
		documentationUrl: 'https://www.braze.com/docs/api/home/',
		defaults: {
			name: 'Braze',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'brazeApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.restEndpoint}}',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			json: true,
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Campaign', value: 'campaign' },
					{ name: 'Canvas', value: 'canvas' },
					{ name: 'Catalog', value: 'catalog' },
					{ name: 'Cloud Data Ingestion', value: 'cdi' },
					{ name: 'Content Block', value: 'contentBlock' },
					{ name: 'Custom Event', value: 'customEvent' },
					{ name: 'Email', value: 'email' },
					{ name: 'KPI', value: 'kpi' },
					{ name: 'Message', value: 'message' },
					{ name: 'Preference Center', value: 'preferenceCenter' },
					{ name: 'Purchase', value: 'purchase' },
					{ name: 'Segment', value: 'segment' },
					{ name: 'Session', value: 'session' },
					{ name: 'SMS', value: 'sms' },
					{ name: 'Subscription Group', value: 'subscriptionGroup' },
					{ name: 'Template', value: 'template' },
					{ name: 'User', value: 'user' },
				],
				default: 'user',
			},
			...userOperations,
			...userFields,
			...campaignOperations,
			...campaignFields,
			...canvasOperations,
			...canvasFields,
			...catalogOperations,
			...catalogFields,
			...messageOperations,
			...messageFields,
			...segmentOperations,
			...segmentFields,
			...subscriptionOperations,
			...subscriptionFields,
			...emailOperations,
			...emailFields,
			...smsOperations,
			...smsFields,
			...contentBlockOperations,
			...contentBlockFields,
			...templateOperations,
			...templateFields,
			...eventOperations,
			...eventFields,
			...kpiOperations,
			...kpiFields,
			...purchaseOperations,
			...purchaseFields,
			...sessionOperations,
			...sessionFields,
			...preferenceOperations,
			...preferenceFields,
			...cdiOperations,
			...cdiFields,
		],
	};

	methods = {
		listSearch: {
			searchCampaigns,
			searchCanvases,
			searchCatalogs,
			searchSegments,
		},
	};
}
