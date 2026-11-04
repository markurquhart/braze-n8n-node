import { INodeProperties } from 'n8n-workflow';

import { buildMessageSchedule, buildMessageScheduleUpdate } from './requestBuilders';
import { bodyBoolean, bodyString, get, jsonBody, operation, post, queryDate, resourceLocator, show } from './shared';

const message = (operations: string[]) => show('message', operations);

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['message'] } },
		options: [
			operation('Send', 'send', 'Send message', 'Send an immediate message to specific users.', post('/messages/send')),
			operation('Schedule', 'schedule', 'Schedule message', 'Schedule a dashboard campaign message.', {
				request: { method: 'POST', url: '/messages/schedule/create' },
				send: { preSend: [buildMessageSchedule] },
			}),
			operation('Update Schedule', 'updateSchedule', 'Update scheduled message', 'Update the time or content of a scheduled message.', {
				request: { method: 'POST', url: '/messages/schedule/update' },
				send: { preSend: [buildMessageScheduleUpdate] },
			}),
			operation('Delete Schedule', 'deleteSchedule', 'Delete scheduled message', 'Cancel a scheduled message before it sends.', {
				request: { method: 'POST', url: '/messages/schedule/delete' },
				output: {
					postReceive: [
						async function (items) {
							return items.map((item) => ({ json: { deleted: true, ...item.json }, pairedItem: item.pairedItem }));
						},
					],
				},
			}),
			operation('Get Scheduled Broadcasts', 'scheduledBroadcasts', 'Get scheduled broadcasts', 'List upcoming scheduled campaigns and Canvas entries.', get('/messages/scheduled_broadcasts')),
			operation('Update Live Activity', 'liveActivity', 'Update live activity', 'Update an iOS Live Activity.', post('/messages/live_activity/update')),
		],
		default: 'send',
	},
];

export const messageFields: INodeProperties[] = [
	jsonBody(
		'Recipients',
		'messageRecipients',
		'recipients',
		'Recipient objects. An immediate send needs recipients unless Broadcast is on.',
		'[{"external_user_id": "user123"}]',
		message(['send', 'schedule']),
	),
	jsonBody(
		'Messages',
		'messages',
		'messages',
		'Messaging object. An immediate send needs this. Channel keys include email, apple_push, android_push, sms, and webhook.',
		'{"apple_push": {"alert": "Hello"}}',
		message(['send', 'schedule', 'updateSchedule']),
		false,
		false,
	),
	bodyBoolean('Broadcast', 'messageBroadcast', 'broadcast', 'Whether to send to the whole segment or audience. Leave this off unless that is intentional.', message(['send', 'schedule'])),
	{
		displayName: 'Broadcast can reach every user in the target segment. Confirm that audience before running the node.',
		name: 'messageBroadcastNotice',
		type: 'notice',
		default: '',
		displayOptions: show('message', ['send', 'schedule'], { messageBroadcast: [true] }),
	},
	resourceLocator({
		displayName: 'Campaign',
		name: 'messageCampaignId',
		description: 'Dashboard campaign this schedule belongs to.',
		searchListMethod: 'searchCampaigns',
		placeholder: 'e.g. 01234567-89ab-cdef-0123-456789abcdef',
		displayOptions: message(['schedule']),
	}),
	resourceLocator({
		displayName: 'Segment',
		name: 'messageSegmentId',
		description: 'Segment to send the scheduled message to. Leave empty when you pass recipients instead.',
		searchListMethod: 'searchSegments',
		placeholder: 'e.g. segment_identifier',
		displayOptions: message(['schedule']),
		required: false,
	}),
	{
		displayName: 'Send At',
		name: 'messageSendAt',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'Time to send the message. Schedules can be up to 90 days out.',
		displayOptions: message(['schedule']),
	},
	{
		displayName: 'Send At',
		name: 'messageUpdateSendAt',
		type: 'dateTime',
		default: '',
		description: 'New send time. Leave empty to keep the current time and update the message only.',
		displayOptions: message(['updateSchedule']),
	},
	{
		displayName: 'In Local Time',
		name: 'messageInLocalTime',
		type: 'boolean',
		default: false,
		description: 'Whether to send at the chosen time in each user\'s local time.',
		displayOptions: message(['schedule', 'updateSchedule']),
	},
	{
		displayName: 'At Optimal Time',
		name: 'messageAtOptimalTime',
		type: 'boolean',
		default: false,
		description: 'Whether to send with Braze intelligent timing.',
		displayOptions: message(['schedule', 'updateSchedule']),
	},
	{
		displayName: 'Schedule ID',
		name: 'messageScheduleId',
		type: 'string',
		default: '',
		required: true,
		description: 'Schedule ID returned when the message was scheduled.',
		displayOptions: message(['updateSchedule', 'deleteSchedule']),
		routing: {
			request: {
				body: {
					schedule_id: '={{ $value }}',
				},
			},
		},
	},
	queryDate('End Time', 'broadcastEndTime', 'end_time', 'Return scheduled broadcasts from now until this time.', message(['scheduledBroadcasts'])),
	bodyString('App ID', 'liveActivityAppId', 'app_id', 'App identifier for the Live Activity.', message(['liveActivity']), true),
	bodyString('Activity ID', 'activityId', 'activity_id', 'Live Activity identifier to update.', message(['liveActivity']), true),
	jsonBody('Content State', 'contentState', 'content_state', 'New content state for the Live Activity.', '{"progress": 0.5}', message(['liveActivity']), true, false),
	bodyBoolean('End Activity', 'endActivity', 'end_activity', 'Whether to end the Live Activity.', message(['liveActivity'])),
	jsonBody('Notification', 'liveActivityNotification', 'notification', 'Alert to show when the Live Activity updates.', '{"title": "Update", "body": "Your order moved"}', message(['liveActivity']), false, false),
];
