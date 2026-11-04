import { INodeProperties } from 'n8n-workflow';

import { omitEmptyBody } from '../GenericFunctions';
import {
	buildScheduleDelete,
	buildTransactionalSend,
	buildTriggeredSchedule,
	placeId,
} from './requestBuilders';
import {
	bodyBoolean,
	bodyString,
	get,
	jsonBody,
	operation,
	pageFields,
	post,
	queryString,
	resourceLocator,
	seriesFields,
	show,
} from './shared';

const campaign = (operations: string[]) => show('campaign', operations);
const campaignId = (operations: string[]) => resourceLocator({
	displayName: 'Campaign',
	name: 'campaignId',
	description: 'Campaign to use. From List loads campaigns visible to this API key.',
	searchListMethod: 'searchCampaigns',
	placeholder: 'e.g. 01234567-89ab-cdef-0123-456789abcdef',
	displayOptions: campaign(operations),
});

export const campaignOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['campaign'] } },
		options: [
			operation('Trigger', 'trigger', 'Trigger campaign', 'Send an API-triggered campaign.', {
				...post('/campaigns/trigger/send'),
				send: { preSend: [placeId('campaignId', 'body', 'campaign_id'), omitEmptyBody] },
			}),
			operation('Get Many', 'list', 'Get many campaigns', 'List campaigns in this workspace.', get('/campaigns/list')),
			operation('Get', 'details', 'Get campaign', 'Retrieve one campaign.', {
				...get('/campaigns/details'),
				send: { preSend: [placeId('campaignId', 'query', 'campaign_id')] },
			}),
			operation('Get Analytics', 'analytics', 'Get campaign analytics', 'Retrieve a daily stats series for a campaign.', {
				...get('/campaigns/data_series'),
				send: { preSend: [placeId('campaignId', 'query', 'campaign_id')] },
			}),
			operation('Schedule', 'schedule', 'Schedule campaign', 'Schedule an API-triggered campaign.', {
				request: { method: 'POST', url: '/campaigns/trigger/schedule/create' },
				send: { preSend: [buildTriggeredSchedule({ idParameter: 'campaignId', idKey: 'campaign_id' })] },
			}),
			operation('Update Schedule', 'updateSchedule', 'Update scheduled campaign', 'Update a scheduled API-triggered campaign.', {
				request: { method: 'POST', url: '/campaigns/trigger/schedule/update' },
				send: { preSend: [buildTriggeredSchedule({ idParameter: 'campaignId', idKey: 'campaign_id', requireScheduleId: true })] },
			}),
			operation('Delete Schedule', 'deleteSchedule', 'Delete scheduled campaign', 'Cancel a scheduled API-triggered campaign before it sends.', {
				request: { method: 'POST', url: '/campaigns/trigger/schedule/delete' },
				send: { preSend: [buildScheduleDelete('campaignId', 'campaign_id')] },
				output: {
					postReceive: [
						async function (items) {
							return items.map((item) => ({ json: { deleted: true, ...item.json }, pairedItem: item.pairedItem }));
						},
					],
				},
			}),
			operation('Get Send Analytics', 'sendAnalytics', 'Get campaign send analytics', 'Retrieve daily stats for a tracked send ID.', {
				...get('/sends/data_series'),
				send: { preSend: [placeId('campaignId', 'query', 'campaign_id')] },
			}),
			operation('Create Send ID', 'createSendId', 'Create campaign send ID', 'Create a send ID for tracking a message blast.', {
				...post('/sends/id/create'),
				send: { preSend: [placeId('campaignId', 'body', 'campaign_id'), omitEmptyBody] },
			}),
			operation('Send Transactional', 'transactional', 'Send transactional campaign', 'Send one transactional message to a single external user ID.', {
				request: { method: 'POST', url: '/transactional/v1/campaigns/send' },
				send: { preSend: [buildTransactionalSend] },
			}),
		],
		default: 'trigger',
	},
];

const scheduleOps = ['schedule', 'updateSchedule'];

export const campaignFields: INodeProperties[] = [
	campaignId(['trigger', 'details', 'analytics', 'schedule', 'updateSchedule', 'deleteSchedule', 'sendAnalytics', 'createSendId', 'transactional']),
	jsonBody('Recipients', 'recipients', 'recipients', 'Recipient objects. Each can include an external user ID, user alias, trigger properties, and attributes.', '[{"external_user_id": "user123", "trigger_properties": {"promo_code": "SAVE20"}}]', campaign(['trigger', 'schedule', 'updateSchedule'])),
	bodyBoolean('Broadcast', 'broadcast', 'broadcast', 'Whether to send to the whole audience defined on the campaign. Leave this off unless that is intentional.', campaign(['trigger', 'schedule'])),
	{
		displayName: 'Broadcast sends to the whole audience on this campaign. Confirm that audience before running the node.',
		name: 'broadcastNotice',
		type: 'notice',
		default: '',
		displayOptions: show('campaign', ['trigger', 'schedule'], { broadcast: [true] }),
	},
	jsonBody('Trigger Properties', 'triggerProperties', 'trigger_properties', 'Personalization properties shared by every recipient.', '{"promo_code": "SAVE20"}', campaign(['trigger']), false, false),
	jsonBody('Audience', 'audience', 'audience', 'Connected audience object. Use this instead of recipients when you need an ad hoc audience.', '{"AND": [{"custom_attribute": {"custom_attribute_name": "vip", "comparison": "equals", "value": true}}]}', campaign(['trigger']), false, false),
	bodyString('Send ID', 'sendId', 'send_id', 'Existing send ID to attach to this trigger, or a custom send ID to create.', campaign(['trigger', 'createSendId'])),
	...pageFields('campaign', ['list'], true),
	...seriesFields('campaign', ['analytics', 'sendAnalytics']),
	queryString('Send ID', 'sendIdQuery', 'send_id', 'Send ID whose analytics should be returned.', campaign(['sendAnalytics']), true),
	{
		displayName: 'Send At',
		name: 'sendAt',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'Time to send the campaign. API-triggered schedules can be up to 90 days out.',
		displayOptions: campaign(scheduleOps),
	},
	bodyBoolean('In Local Time', 'inLocalTime', 'in_local_time', 'Whether to send at the chosen time in each user\'s local time.', campaign(scheduleOps)),
	bodyBoolean('At Optimal Time', 'atOptimalTime', 'at_optimal_time', 'Whether to send at Braze intelligent timing.', campaign(scheduleOps)),
	{
		displayName: 'Schedule ID',
		name: 'scheduleId',
		type: 'string',
		default: '',
		required: true,
		description: 'Schedule ID returned when the campaign was scheduled.',
		displayOptions: campaign(['updateSchedule', 'deleteSchedule']),
	},
	bodyString('External User ID', 'externalUserId', 'external_user_id', 'External ID of the single recipient.', campaign(['transactional']), true, 'e.g. user123'),
	jsonBody('Attributes', 'attributes', 'attributes', 'Attributes to set on the recipient as part of the transactional send.', '{"first_name": "Nathan"}', campaign(['transactional']), false, false),
	bodyString('External Send ID', 'externalSendId', 'external_send_id', 'Your identifier for this transactional send, used for deduplication.', campaign(['transactional'])),
];
