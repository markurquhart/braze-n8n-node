import { INodeProperties } from 'n8n-workflow';

import { omitEmptyBody } from '../GenericFunctions';
import { buildScheduleDelete, buildTriggeredSchedule, placeId } from './requestBuilders';
import {
	bodyBoolean,
	get,
	jsonBody,
	operation,
	pageFields,
	post,
	queryBoolean,
	queryDate,
	resourceLocator,
	seriesFields,
	show,
} from './shared';

const canvas = (operations: string[]) => show('canvas', operations);

export const canvasOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['canvas'] } },
		options: [
			operation('Trigger', 'trigger', 'Trigger canvas', 'Send an API-triggered Canvas.', {
				...post('/canvas/trigger/send'),
				send: { preSend: [placeId('canvasId', 'body', 'canvas_id'), omitEmptyBody] },
			}),
			operation('Get Many', 'list', 'Get many canvases', 'List Canvases in this workspace.', get('/canvas/list')),
			operation('Get', 'details', 'Get canvas', 'Retrieve one Canvas.', {
				...get('/canvas/details'),
				send: { preSend: [placeId('canvasId', 'query', 'canvas_id')] },
			}),
			operation('Get Analytics', 'analytics', 'Get canvas analytics', 'Retrieve a time series for a Canvas.', {
				...get('/canvas/data_series'),
				send: { preSend: [placeId('canvasId', 'query', 'canvas_id')] },
			}),
			operation('Get Summary', 'summary', 'Get canvas summary', 'Retrieve rolled-up Canvas analytics.', {
				...get('/canvas/data_summary'),
				send: { preSend: [placeId('canvasId', 'query', 'canvas_id')] },
			}),
			operation('Schedule', 'schedule', 'Schedule canvas', 'Schedule an API-triggered Canvas.', {
				request: { method: 'POST', url: '/canvas/trigger/schedule/create' },
				send: { preSend: [buildTriggeredSchedule({
					idParameter: 'canvasId',
					idKey: 'canvas_id',
					sendAtParameter: 'canvasSendAt',
					recipientsParameter: 'canvasRecipients',
					broadcastParameter: 'canvasBroadcast',
					inLocalTimeParameter: 'canvasInLocalTime',
					atOptimalTimeParameter: 'canvasAtOptimalTime',
				})] },
			}),
			operation('Update Schedule', 'updateSchedule', 'Update scheduled canvas', 'Update a scheduled API-triggered Canvas.', {
				request: { method: 'POST', url: '/canvas/trigger/schedule/update' },
				send: { preSend: [buildTriggeredSchedule({
					idParameter: 'canvasId',
					idKey: 'canvas_id',
					sendAtParameter: 'canvasSendAt',
					recipientsParameter: 'canvasRecipients',
					broadcastParameter: 'canvasBroadcast',
					inLocalTimeParameter: 'canvasInLocalTime',
					atOptimalTimeParameter: 'canvasAtOptimalTime',
					scheduleIdParameter: 'canvasScheduleId',
					requireScheduleId: true,
				})] },
			}),
			operation('Delete Schedule', 'deleteSchedule', 'Delete scheduled canvas', 'Cancel a scheduled API-triggered Canvas before it sends.', {
				request: { method: 'POST', url: '/canvas/trigger/schedule/delete' },
				send: { preSend: [buildScheduleDelete('canvasId', 'canvas_id', 'canvasScheduleId')] },
				output: {
					postReceive: [
						async function (items) {
							return items.map((item) => ({ json: { deleted: true, ...item.json }, pairedItem: item.pairedItem }));
						},
					],
				},
			}),
		],
		default: 'trigger',
	},
];

const analyticsOps = ['analytics', 'summary'];
const scheduleOps = ['schedule', 'updateSchedule'];

export const canvasFields: INodeProperties[] = [
	resourceLocator({
		displayName: 'Canvas',
		name: 'canvasId',
		description: 'Canvas to use. From List loads Canvases visible to this API key.',
		searchListMethod: 'searchCanvases',
		placeholder: 'e.g. 01234567-89ab-cdef-0123-456789abcdef',
		displayOptions: canvas(['trigger', 'details', 'analytics', 'summary', 'schedule', 'updateSchedule', 'deleteSchedule']),
	}),
	jsonBody('Recipients', 'canvasRecipients', 'recipients', 'Recipient objects for this Canvas entry.', '[{"external_user_id": "user123", "canvas_entry_properties": {"promo_code": "SAVE20"}}]', canvas(['trigger', 'schedule', 'updateSchedule'])),
	bodyBoolean('Broadcast', 'canvasBroadcast', 'broadcast', 'Whether to send to the whole audience defined on the Canvas. Leave this off unless that is intentional.', canvas(['trigger', 'schedule'])),
	{
		displayName: 'Broadcast sends to the whole audience on this Canvas. Confirm that audience before running the node.',
		name: 'canvasBroadcastNotice',
		type: 'notice',
		default: '',
		displayOptions: show('canvas', ['trigger', 'schedule'], { canvasBroadcast: [true] }),
	},
	jsonBody('Audience', 'canvasAudience', 'audience', 'Connected audience object for an ad hoc Canvas audience.', '{}', canvas(['trigger']), false, false),
	...pageFields('canvas', ['list'], true),
	...seriesFields('canvas', analyticsOps),
	queryDate('Starting At', 'canvasStartingAt', 'starting_at', 'Date the series should start. Use this with Ending At instead of Length when you want an exact window.', canvas(analyticsOps)),
	queryBoolean('Include Variant Breakdown', 'includeVariantBreakdown', 'include_variant_breakdown', 'Whether to include per-variant stats.', canvas(analyticsOps)),
	queryBoolean('Include Step Breakdown', 'includeStepBreakdown', 'include_step_breakdown', 'Whether to include per-step stats.', canvas(analyticsOps)),
	queryBoolean('Include Deleted Step Data', 'includeDeletedStepData', 'include_deleted_step_data', 'Whether to include stats for deleted steps.', canvas(analyticsOps)),
	{
		displayName: 'Send At',
		name: 'canvasSendAt',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'Time to enter users into the Canvas.',
		displayOptions: canvas(scheduleOps),
	},
	{
		displayName: 'In Local Time',
		name: 'canvasInLocalTime',
		type: 'boolean',
		default: false,
		description: 'Whether to enter users at the chosen time in their local time.',
		displayOptions: canvas(scheduleOps),
	},
	{
		displayName: 'At Optimal Time',
		name: 'canvasAtOptimalTime',
		type: 'boolean',
		default: false,
		description: 'Whether to enter users with Braze intelligent timing.',
		displayOptions: canvas(scheduleOps),
	},
	{
		displayName: 'Schedule ID',
		name: 'canvasScheduleId',
		type: 'string',
		default: '',
		required: true,
		description: 'Schedule ID returned when the Canvas was scheduled.',
		displayOptions: canvas(['updateSchedule', 'deleteSchedule']),
	},
];
