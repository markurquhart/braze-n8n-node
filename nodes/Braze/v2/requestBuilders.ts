import {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';

import { omitEmptyQuery } from './shared';

export function parameterValue(context: IExecuteSingleFunctions, name: string): string {
	const raw = context.getNodeParameter(name) as string | { value?: string } | undefined;
	if (typeof raw === 'object' && raw !== null) {
		return raw.value ?? '';
	}
	return raw ?? '';
}

function requireValue(context: IExecuteSingleFunctions, name: string, label: string): string {
	const value = parameterValue(context, name);
	if (!value) {
		throw new NodeOperationError(context.getNode(), `Set ${label} before running this operation.`, {
			itemIndex: context.getItemIndex(),
		});
	}
	return value;
}

export function placeId(parameter: string, target: 'body' | 'query', key: string) {
	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const value = requireValue(this, parameter, 'the API identifier');
		if (target === 'query') {
			requestOptions.qs = {
				...((requestOptions.qs as IDataObject | undefined) ?? {}),
				[key]: value,
			};
		} else {
			const current = requestOptions.body;
			const body =
				current && typeof current === 'object' && !Array.isArray(current)
					? { ...(current as IDataObject) }
					: {};
			body[key] = value;
			requestOptions.body = body;
		}
		return target === 'query' ? omitEmptyQuery.call(this, requestOptions) : requestOptions;
	};
}

export function setRequestUrl(urlFrom: (context: IExecuteSingleFunctions) => string) {
	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.url = urlFrom(this);
		return omitEmptyQuery.call(this, requestOptions);
	};
}

export function catalogPath(suffix = '', idParameter = 'itemId') {
	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const name = encodeURIComponent(requireValue(this, 'catalogName', 'a catalog'));
		const itemId = suffix.includes('{itemId}')
			? encodeURIComponent(requireValue(this, idParameter, 'an ID'))
			: '';
		requestOptions.url = `/catalogs/${name}${suffix.replace('{itemId}', itemId)}`;
		return requestOptions;
	};
}

export async function buildUserMerge(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	requestOptions.body = {
		merge_updates: [
			{
				identifier_to_merge: mergeIdentifier(this, 'identifierField', 'identifierValue', 'mergeAliasName', 'mergeAliasLabel'),
				identifier_to_keep: mergeIdentifier(this, 'mergeIdentifierField', 'mergeIdentifierValue', 'keepAliasName', 'keepAliasLabel'),
			},
		],
	};
	return requestOptions;
}

function mergeIdentifier(
	context: IExecuteSingleFunctions,
	fieldName: string,
	valueName: string,
	aliasName: string,
	aliasLabel: string,
): IDataObject {
	const field = context.getNodeParameter(fieldName) as string;
	if (field === 'user_alias') {
		return {
			user_alias: {
				alias_name: context.getNodeParameter(aliasName) as string,
				alias_label: context.getNodeParameter(aliasLabel) as string,
			},
		};
	}
	return {
		[field]: context.getNodeParameter(valueName) as string,
	};
}

export async function buildCatalog(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const description = this.getNodeParameter('catalogDescription', '') as string;
	const catalog: IDataObject = {
		name: this.getNodeParameter('newCatalogName') as string,
		fields: this.getNodeParameter('catalogFields') as IDataObject[],
	};
	if (description) catalog.description = description;
	requestOptions.body = { catalogs: [catalog] };
	return requestOptions;
}

export async function buildCatalogItem(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const itemId = parameterValue(this, 'itemId');
	const item = this.getNodeParameter('item', {}) as IDataObject;
	requestOptions.body = {
		items: [
			{
				...item,
				id: itemId,
			},
		],
	};
	return requestOptions;
}

export async function buildSubscriptionUpdate(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const group: IDataObject = {
		subscription_group_id: this.getNodeParameter('subscriptionGroupId') as string,
		subscription_state: this.getNodeParameter('subscriptionState') as string,
	};
	const identifier = this.getNodeParameter('subscriptionIdentifierType') as string;
	const values = String(this.getNodeParameter('identifierValues') ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
	group[identifier] = values;
	requestOptions.body = { subscription_groups: [group] };
	return requestOptions;
}

export function buildTriggeredSchedule(options: {
	idParameter: string;
	idKey: string;
	sendAtParameter?: string;
	recipientsParameter?: string;
	broadcastParameter?: string;
	inLocalTimeParameter?: string;
	atOptimalTimeParameter?: string;
	scheduleIdParameter?: string;
	requireScheduleId?: boolean;
}) {
	const sendAtParameter = options.sendAtParameter ?? 'sendAt';
	const recipientsParameter = options.recipientsParameter ?? 'recipients';
	const broadcastParameter = options.broadcastParameter ?? 'broadcast';
	const inLocalTimeParameter = options.inLocalTimeParameter ?? 'inLocalTime';
	const atOptimalTimeParameter = options.atOptimalTimeParameter ?? 'atOptimalTime';
	const scheduleIdParameter = options.scheduleIdParameter ?? 'scheduleId';

	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const body: IDataObject = {
			[options.idKey]: requireValue(this, options.idParameter, 'the API identifier'),
			schedule: {
				time: this.getNodeParameter(sendAtParameter) as string,
				in_local_time: this.getNodeParameter(inLocalTimeParameter, false) as boolean,
				at_optimal_time: this.getNodeParameter(atOptimalTimeParameter, false) as boolean,
			},
		};
		const recipients = this.getNodeParameter(recipientsParameter, []) as IDataObject[];
		if (Array.isArray(recipients) && recipients.length > 0) body.recipients = recipients;
		if (this.getNodeParameter(broadcastParameter, false) as boolean) body.broadcast = true;
		if (options.requireScheduleId) {
			body.schedule_id = requireValue(this, scheduleIdParameter, 'the schedule ID');
		}
		requestOptions.body = body;
		return requestOptions;
	};
}

export function buildScheduleDelete(idParameter: string, idKey: string, scheduleIdParameter = 'scheduleId') {
	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.body = {
			[idKey]: requireValue(this, idParameter, 'the API identifier'),
			schedule_id: requireValue(this, scheduleIdParameter, 'the schedule ID'),
		};
		return requestOptions;
	};
}

export async function buildMessageSchedule(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body: IDataObject = {
		campaign_id: requireValue(this, 'messageCampaignId', 'a campaign'),
		schedule: {
			time: this.getNodeParameter('messageSendAt') as string,
			in_local_time: this.getNodeParameter('messageInLocalTime', false) as boolean,
			at_optimal_time: this.getNodeParameter('messageAtOptimalTime', false) as boolean,
		},
	};
	const messages = this.getNodeParameter('messages', {}) as IDataObject;
	if (messages && Object.keys(messages).length > 0) body.messages = messages;
	const segmentId = parameterValue(this, 'messageSegmentId');
	if (segmentId) body.segment_id = segmentId;
	const recipients = this.getNodeParameter('messageRecipients', []) as IDataObject[];
	if (Array.isArray(recipients) && recipients.length > 0) body.recipients = recipients;
	if (this.getNodeParameter('messageBroadcast', false) as boolean) body.broadcast = true;
	requestOptions.body = body;
	return requestOptions;
}

export async function buildMessageScheduleUpdate(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body: IDataObject = {
		schedule_id: requireValue(this, 'messageScheduleId', 'the schedule ID'),
	};
	const sendAt = this.getNodeParameter('messageUpdateSendAt', '') as string;
	if (sendAt) {
		body.schedule = {
			time: sendAt,
			in_local_time: this.getNodeParameter('messageInLocalTime', false) as boolean,
			at_optimal_time: this.getNodeParameter('messageAtOptimalTime', false) as boolean,
		};
	}
	const messages = this.getNodeParameter('messages', {}) as IDataObject;
	if (messages && Object.keys(messages).length > 0) body.messages = messages;
	requestOptions.body = body;
	return requestOptions;
}

export async function buildTransactionalSend(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const recipient: IDataObject = {
		external_user_id: this.getNodeParameter('externalUserId') as string,
	};
	const attributes = this.getNodeParameter('attributes', {}) as IDataObject;
	if (attributes && Object.keys(attributes).length > 0) recipient.attributes = attributes;
	const body: IDataObject = { recipient };
	const triggerProperties = this.getNodeParameter('triggerProperties', {}) as IDataObject;
	if (triggerProperties && Object.keys(triggerProperties).length > 0) {
		body.trigger_properties = triggerProperties;
	}
	const externalSendId = this.getNodeParameter('externalSendId', '') as string;
	if (externalSendId) body.external_send_id = externalSendId;
	requestOptions.url = `/transactional/v1/campaigns/${encodeURIComponent(requireValue(this, 'campaignId', 'a campaign'))}/send`;
	requestOptions.body = body;
	return requestOptions;
}
