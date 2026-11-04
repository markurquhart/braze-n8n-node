import { INodeProperties } from 'n8n-workflow';

import { buildSubscriptionUpdate, setRequestUrl } from './requestBuilders';
import {
	bodyString,
	csvBody,
	get,
	operation,
	pageFields,
	post,
	queryNumber,
	queryString,
	seriesFields,
	show,
} from './shared';

function operations(resource: string, options: INodeProperties['options'], defaultValue: string): INodeProperties {
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource] } },
		options,
		default: defaultValue,
	};
}

const on = (resource: string, operationNames: string[]) => show(resource, operationNames);

export const subscriptionOperations: INodeProperties[] = [
	operations('subscriptionGroup', [
		operation('Get Status', 'get', 'Get subscription status', 'Get one user\'s status in a subscription group.', get('/subscription/status/get')),
		operation('Get User Groups', 'userGroups', 'Get user subscription groups', 'List subscription groups a user has explicitly joined or left.', get('/subscription/user/status')),
		operation('Set Status', 'set', 'Set subscription status', 'Update up to 50 users in one subscription group.', {
			request: { method: 'POST', url: '/v2/subscription/status/set' },
			send: { preSend: [buildSubscriptionUpdate] },
		}),
	], 'get'),
];

export const subscriptionFields: INodeProperties[] = [
	queryString('Subscription Group ID', 'subscriptionGroupIdQuery', 'subscription_group_id', 'Subscription group to check.', on('subscriptionGroup', ['get']), true),
	{
		displayName: 'Identifier Type',
		name: 'subscriptionLookupType',
		type: 'options',
		options: [
			{ name: 'External ID', value: 'external_id' },
			{ name: 'Email', value: 'email' },
			{ name: 'Phone', value: 'phone' },
		],
		default: 'external_id',
		description: 'Which identifier to look up.',
		displayOptions: on('subscriptionGroup', ['get', 'userGroups']),
	},
	queryString('External ID', 'subscriptionExternalId', 'external_id', 'External ID to look up.', show('subscriptionGroup', ['get', 'userGroups'], { subscriptionLookupType: ['external_id'] }), true, 'e.g. user123'),
	queryString('Email', 'subscriptionEmail', 'email', 'Email address to look up.', show('subscriptionGroup', ['get', 'userGroups'], { subscriptionLookupType: ['email'] }), true, 'e.g. nathan@example.com'),
	queryString('Phone', 'subscriptionPhone', 'phone', 'Phone number to look up, in E.164 format.', show('subscriptionGroup', ['get', 'userGroups'], { subscriptionLookupType: ['phone'] }), true, 'e.g. +12125551212'),
	bodyString('Subscription Group ID', 'subscriptionGroupId', 'subscription_group_id', 'Subscription group to update.', on('subscriptionGroup', ['set']), true),
	{
		displayName: 'Subscription State',
		name: 'subscriptionState',
		type: 'options',
		options: [
			{ name: 'Subscribed', value: 'subscribed' },
			{ name: 'Unsubscribed', value: 'unsubscribed' },
		],
		default: 'subscribed',
		description: 'State to set for the users in this group.',
		displayOptions: on('subscriptionGroup', ['set']),
	},
	{
		displayName: 'Identifier Type',
		name: 'subscriptionIdentifierType',
		type: 'options',
		options: [
			{ name: 'External IDs', value: 'external_ids' },
			{ name: 'Emails', value: 'emails' },
			{ name: 'Phones', value: 'phones' },
		],
		default: 'external_ids',
		description: 'Identifier to update. A request can include only one type, up to 50 values.',
		displayOptions: on('subscriptionGroup', ['set']),
	},
	csvBody('Identifier Values', 'identifierValues', 'identifier_values', 'Comma-separated external IDs, emails, or phone numbers.', 'e.g. user123, user456', on('subscriptionGroup', ['set'])),
];

export const emailOperations: INodeProperties[] = [
	operations('email', [
		operation('Set Status', 'setStatus', 'Set email status', 'Set the email subscription state for up to 50 addresses.', post('/email/status')),
		operation('Get Hard Bounces', 'hardBounces', 'Get hard bounced emails', 'List addresses that hard bounced in a time window.', get('/email/hard_bounces')),
		operation('Get Unsubscribes', 'unsubscribes', 'Get unsubscribed emails', 'List addresses that unsubscribed in a time window.', get('/email/unsubscribes')),
		operation('Remove Hard Bounce', 'removeBounce', 'Remove hard bounce', 'Remove addresses from the hard bounce list.', post('/email/bounce/remove')),
		operation('Remove Spam', 'removeSpam', 'Remove spam complaint', 'Remove addresses from the spam list.', post('/email/spam/remove')),
		operation('Blocklist', 'blocklist', 'Blocklist email', 'Unsubscribe addresses and mark them as hard bounced.', post('/email/blacklist')),
	], 'setStatus'),
];

const emailWindow = ['hardBounces', 'unsubscribes'];

export const emailFields: INodeProperties[] = [
	{
		displayName: 'Blocklist unsubscribes the address and marks it as a hard bounce.',
		name: 'blocklistNotice',
		type: 'notice',
		default: '',
		displayOptions: on('email', ['blocklist']),
	},
	csvBody('Emails', 'statusEmails', 'email', 'Comma-separated email addresses.', 'e.g. nathan@example.com', on('email', ['setStatus', 'removeBounce', 'removeSpam', 'blocklist'])),
	{
		displayName: 'Subscription State',
		name: 'emailSubscriptionState',
		type: 'options',
		options: [
			{ name: 'Opted In', value: 'opted_in' },
			{ name: 'Subscribed', value: 'subscribed' },
			{ name: 'Unsubscribed', value: 'unsubscribed' },
		],
		default: 'subscribed',
		description: 'Email subscription state to set.',
		displayOptions: on('email', ['setStatus']),
		routing: { request: { body: { subscription_state: '={{ $value }}' } } },
	},
	queryString('Start Date', 'emailStartDate', 'start_date', 'Start of the window, as YYYY-MM-DD.', on('email', emailWindow), false, 'e.g. 2026-01-01'),
	queryString('End Date', 'emailEndDate', 'end_date', 'End of the window, as YYYY-MM-DD.', on('email', emailWindow), false, 'e.g. 2026-01-31'),
	queryNumber('Limit', 'emailLimit', 'limit', 'Maximum number of addresses to return.', on('email', emailWindow), 100, { typeOptions: { minValue: 1, maxValue: 500 } }),
	queryNumber('Offset', 'emailOffset', 'offset', 'Number of addresses to skip.', on('email', emailWindow), 0, { typeOptions: { minValue: 0 } }),
	queryString('Email', 'emailFilter', 'email', 'Return only this address when it appears in the result.', on('email', emailWindow), false, 'e.g. nathan@example.com'),
];

export const smsOperations: INodeProperties[] = [
	operations('sms', [
		operation('Get Invalid Numbers', 'invalidNumbers', 'Get invalid phone numbers', 'List phone numbers Braze marked invalid in a time window.', get('/sms/invalid_phone_numbers')),
		operation('Remove Invalid Numbers', 'removeInvalid', 'Remove invalid phone numbers', 'Clear the invalid flag so numbers can be used again.', post('/sms/invalid_phone_numbers/remove')),
	], 'invalidNumbers'),
];

export const smsFields: INodeProperties[] = [
	queryString('Start Date', 'smsStartDate', 'start_date', 'Start of the window, as YYYY-MM-DD.', on('sms', ['invalidNumbers']), false, 'e.g. 2026-01-01'),
	queryString('End Date', 'smsEndDate', 'end_date', 'End of the window, as YYYY-MM-DD.', on('sms', ['invalidNumbers']), false, 'e.g. 2026-01-31'),
	queryNumber('Limit', 'smsLimit', 'limit', 'Maximum number of numbers to return.', on('sms', ['invalidNumbers']), 100, { typeOptions: { minValue: 1, maxValue: 500 } }),
	queryNumber('Offset', 'smsOffset', 'offset', 'Number of records to skip.', on('sms', ['invalidNumbers']), 0, { typeOptions: { minValue: 0 } }),
	csvBody('Phone Numbers', 'smsPhoneNumbers', 'phone_numbers', 'Comma-separated phone numbers in E.164 format.', 'e.g. +12125551212', on('sms', ['removeInvalid'])),
];

export const contentBlockOperations: INodeProperties[] = [
	operations('contentBlock', [
		operation('Get Many', 'list', 'Get many content blocks', 'List Content Blocks.', get('/content_blocks/list')),
		operation('Get', 'get', 'Get content block', 'Retrieve one Content Block.', get('/content_blocks/info')),
		operation('Create', 'create', 'Create content block', 'Create an email Content Block.', post('/content_blocks/create')),
		operation('Update', 'update', 'Update content block', 'Update an email Content Block.', post('/content_blocks/update')),
	], 'list'),
];

export const contentBlockFields: INodeProperties[] = [
	queryNumber('Limit', 'contentBlockLimit', 'limit', 'Maximum number of Content Blocks to return.', on('contentBlock', ['list']), 100, { typeOptions: { minValue: 1, maxValue: 1000 } }),
	queryNumber('Offset', 'contentBlockOffset', 'offset', 'Number of Content Blocks to skip.', on('contentBlock', ['list']), 0, { typeOptions: { minValue: 0 } }),
	queryString('Modified After', 'contentBlockModifiedAfter', 'modified_after', 'Return Content Blocks modified after this time, as YYYY-MM-DDTHH:mm:ss.', on('contentBlock', ['list']), false, 'e.g. 2026-01-01T00:00:00'),
	queryString('Content Block ID', 'contentBlockIdQuery', 'content_block_id', 'Content Block to retrieve.', on('contentBlock', ['get']), true),
	bodyString('Content Block ID', 'contentBlockId', 'content_block_id', 'Content Block to update.', on('contentBlock', ['update']), true),
	bodyString('Name', 'contentBlockName', 'name', 'Name of the Content Block.', on('contentBlock', ['create', 'update']), true, 'e.g. Weekly Header'),
	bodyString('Description', 'contentBlockDescription', 'description', 'Description of the Content Block.', on('contentBlock', ['create', 'update'])),
	{
		displayName: 'Content',
		name: 'contentBlockContent',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		description: 'HTML content of the Content Block.',
		displayOptions: on('contentBlock', ['create', 'update']),
		routing: { request: { body: { content: '={{ $value }}' } } },
	},
	{
		displayName: 'State',
		name: 'contentBlockState',
		type: 'options',
		options: [
			{ name: 'Active', value: 'active' },
			{ name: 'Draft', value: 'draft' },
		],
		default: 'draft',
		description: 'Whether the Content Block is active or a draft.',
		displayOptions: on('contentBlock', ['create', 'update']),
		routing: { request: { body: { state: '={{ $value }}' } } },
	},
];

export const templateOperations: INodeProperties[] = [
	operations('template', [
		operation('Get Many', 'list', 'Get many email templates', 'List email templates.', get('/templates/email/list')),
		operation('Get', 'get', 'Get email template', 'Retrieve one email template.', get('/templates/email/info')),
		operation('Create', 'create', 'Create email template', 'Create an email template.', post('/templates/email/create')),
		operation('Update', 'update', 'Update email template', 'Update an email template.', post('/templates/email/update')),
	], 'list'),
];

export const templateFields: INodeProperties[] = [
	queryNumber('Limit', 'templateLimit', 'limit', 'Maximum number of templates to return.', on('template', ['list']), 100, { typeOptions: { minValue: 1, maxValue: 1000 } }),
	queryNumber('Offset', 'templateOffset', 'offset', 'Number of templates to skip.', on('template', ['list']), 0, { typeOptions: { minValue: 0 } }),
	queryString('Modified After', 'templateModifiedAfter', 'modified_after', 'Return templates modified after this time, as YYYY-MM-DDTHH:mm:ss.', on('template', ['list']), false, 'e.g. 2026-01-01T00:00:00'),
	queryString('Email Template ID', 'emailTemplateIdQuery', 'email_template_id', 'Template to retrieve.', on('template', ['get']), true),
	bodyString('Email Template ID', 'emailTemplateId', 'email_template_id', 'Template to update.', on('template', ['update']), true),
	bodyString('Template Name', 'templateName', 'template_name', 'Name of the email template.', on('template', ['create', 'update']), true, 'e.g. Weekly Newsletter'),
	bodyString('Subject', 'templateSubject', 'subject', 'Email subject line.', on('template', ['create', 'update']), true),
	{
		displayName: 'Body',
		name: 'templateBody',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		description: 'HTML body of the email template.',
		displayOptions: on('template', ['create', 'update']),
		routing: { request: { body: { body: '={{ $value }}' } } },
	},
	bodyString('Plaintext Body', 'plaintextBody', 'plaintext_body', 'Plaintext version of the email.', on('template', ['create', 'update'])),
	bodyString('Preheader', 'preheader', 'preheader', 'Inbox preview text.', on('template', ['create', 'update'])),
];

export const eventOperations: INodeProperties[] = [
	operations('customEvent', [
		operation('Get Many', 'list', 'Get many custom events', 'List custom event names.', get('/events/list')),
		operation('Get Details', 'details', 'Get custom event details', 'List custom events with descriptions and tags.', get('/events')),
		operation('Get Analytics', 'analytics', 'Get custom event analytics', 'Retrieve how often a custom event occurred.', get('/events/data_series')),
	], 'list'),
];

export const eventFields: INodeProperties[] = [
	...pageFields('customEvent', ['list', 'details'], false, false),
	queryString('Event Name', 'eventName', 'event', 'Custom event to measure.', on('customEvent', ['analytics']), true, 'e.g. session_start'),
	...seriesFields('customEvent', ['analytics'], true),
	queryString('App ID', 'eventAppId', 'app_id', 'Limit the series to one app.', on('customEvent', ['analytics'])),
	queryString('Segment ID', 'eventSegmentId', 'segment_id', 'Limit the series to one segment.', on('customEvent', ['analytics'])),
];

export const kpiOperations: INodeProperties[] = [
	operations('kpi', [
		operation('Get Daily Active Users', 'dau', 'Get daily active users', 'Retrieve unique active users per day.', get('/kpi/dau/data_series')),
		operation('Get Monthly Active Users', 'mau', 'Get monthly active users', 'Retrieve unique active users over a 30-day window.', get('/kpi/mau/data_series')),
		operation('Get New Users', 'newUsers', 'Get new users', 'Retrieve new users per day.', get('/kpi/new_users/data_series')),
		operation('Get Uninstalls', 'uninstalls', 'Get uninstalls', 'Retrieve uninstalls per day.', get('/kpi/uninstalls/data_series')),
	], 'dau'),
];

export const kpiFields: INodeProperties[] = [
	...seriesFields('kpi', ['dau', 'mau', 'newUsers', 'uninstalls']),
	queryString('App ID', 'kpiAppId', 'app_id', 'Limit the series to one app.', on('kpi', ['dau', 'mau', 'newUsers', 'uninstalls'])),
];

export const purchaseOperations: INodeProperties[] = [
	operations('purchase', [
		operation('Get Products', 'products', 'Get purchased products', 'List product IDs purchased in this workspace.', get('/purchases/product_list')),
		operation('Get Quantity', 'quantity', 'Get purchase quantity', 'Retrieve the number of purchases over time.', get('/purchases/quantity_series')),
		operation('Get Revenue', 'revenue', 'Get purchase revenue', 'Retrieve revenue over time.', get('/purchases/revenue_series')),
	], 'products'),
];

export const purchaseFields: INodeProperties[] = [
	...pageFields('purchase', ['products'], false, false),
	...seriesFields('purchase', ['quantity', 'revenue'], true),
	queryString('App ID', 'purchaseAppId', 'app_id', 'Limit the series to one app.', on('purchase', ['quantity', 'revenue'])),
	queryString('Product ID', 'productId', 'product', 'Limit the series to one product.', on('purchase', ['quantity', 'revenue']), false, 'e.g. sku1'),
];

export const sessionOperations: INodeProperties[] = [
	operations('session', [
		operation('Get Analytics', 'analytics', 'Get session analytics', 'Retrieve session counts over time.', get('/sessions/data_series')),
	], 'analytics'),
];

export const sessionFields: INodeProperties[] = [
	...seriesFields('session', ['analytics'], true),
	queryString('App ID', 'sessionAppId', 'app_id', 'Limit the series to one app.', on('session', ['analytics'])),
	queryString('Segment ID', 'sessionSegmentId', 'segment_id', 'Limit the series to one segment.', on('session', ['analytics'])),
];

export const preferenceOperations: INodeProperties[] = [
	operations('preferenceCenter', [
		operation('Get Many', 'list', 'Get many preference centers', 'List preference centers.', get('/preference_center/v1/list')),
		operation('Get', 'get', 'Get preference center', 'Retrieve one preference center.', {
			request: { method: 'GET', url: '/preference_center/v1' },
			send: { preSend: [setRequestUrl((context) => `/preference_center/v1/${encodeURIComponent(String(context.getNodeParameter('preferenceCenterId')))}`)] },
		}),
		operation('Get URL', 'url', 'Get preference center URL', 'Create a preference center link for a user.', {
			request: { method: 'GET', url: '/preference_center/v1' },
			send: {
				preSend: [setRequestUrl((context) => {
					const centerId = encodeURIComponent(String(context.getNodeParameter('preferenceCenterId')));
					const userId = encodeURIComponent(String(context.getNodeParameter('preferenceCenterUserId')));
					return `/preference_center/v1/${centerId}/url/${userId}`;
				})],
			},
		}),
	], 'list'),
];

export const preferenceFields: INodeProperties[] = [
	{
		displayName: 'Preference Center ID',
		name: 'preferenceCenterId',
		type: 'string',
		default: '',
		required: true,
		description: 'External ID of the preference center.',
		displayOptions: on('preferenceCenter', ['get', 'url']),
	},
	{
		displayName: 'User ID',
		name: 'preferenceCenterUserId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. user123',
		description: 'User ID to build the preference center link for.',
		displayOptions: on('preferenceCenter', ['url']),
	},
];

export const cdiOperations: INodeProperties[] = [
	operations('cdi', [
		operation('Get Many', 'list', 'Get many integrations', 'List Cloud Data Ingestion integrations.', get('/cdi/integrations')),
		operation('Sync', 'sync', 'Sync integration', 'Trigger a sync for a Cloud Data Ingestion integration.', {
			request: { method: 'POST', url: '/cdi/integrations' },
			send: { preSend: [setRequestUrl((context) => `/cdi/integrations/${encodeURIComponent(String(context.getNodeParameter('integrationId')))}/sync`)] },
		}),
		operation('Get Sync Status', 'status', 'Get integration sync status', 'List recent sync status for an integration.', {
			request: { method: 'GET', url: '/cdi/integrations' },
			send: { preSend: [setRequestUrl((context) => `/cdi/integrations/${encodeURIComponent(String(context.getNodeParameter('integrationId')))}/job_sync_status`)] },
		}),
	], 'list'),
];

export const cdiFields: INodeProperties[] = [
	{
		displayName: 'Integration ID',
		name: 'integrationId',
		type: 'string',
		default: '',
		required: true,
		description: 'Cloud Data Ingestion integration to sync or inspect.',
		displayOptions: on('cdi', ['sync', 'status']),
	},
];
