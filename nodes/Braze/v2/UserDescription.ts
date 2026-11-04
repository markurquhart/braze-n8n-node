import { INodeProperties } from 'n8n-workflow';

import { omitEmptyBody } from '../GenericFunctions';
import { buildUserMerge, placeId } from './requestBuilders';
import { bodyString, csvBody, jsonBody, operation, post, queryString, show } from './shared';

const user = (operationName: string[]) => show('user', operationName);

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['user'] } },
		options: [
			operation('Track', 'track', 'Track user', 'Record events, purchases, and profile attributes.', post('/users/track')),
			operation('Identify', 'identify', 'Identify user', 'Attach an external ID to an alias-only user.', post('/users/identify')),
			operation('Delete', 'delete', 'Delete user', 'Permanently delete a user profile.', post('/users/delete')),
			operation('Merge', 'merge', 'Merge users', 'Merge one user profile into another.', {
				request: { method: 'POST', url: '/users/merge' },
				send: { preSend: [buildUserMerge] },
			}),
			operation('Export', 'export', 'Export users', 'Export profiles by identifier, segment, or the Global Control Group.', {
				request: { method: 'POST' },
				send: { preSend: [omitEmptyBody] },
			}),
			operation('Create Alias', 'alias', 'Create user alias', 'Add an alias to an existing user, or create an alias-only user.', post('/users/alias/new')),
			operation('Update Alias', 'updateAlias', 'Update user alias', 'Rename an existing user alias.', post('/users/alias/update')),
			operation('Rename External ID', 'renameExternalId', 'Rename external ID', 'Replace a user external ID.', post('/users/external_ids/rename')),
			operation('Remove External ID', 'removeExternalId', 'Remove external ID', 'Remove deprecated external IDs from user profiles.', post('/users/external_ids/remove')),
			operation('Get Track Status', 'trackStatus', 'Get user track status', 'Check whether Braze has finished processing /users/track requests.', {
				request: { method: 'GET', url: '/users/track/status' },
			}),
		],
		default: 'track',
	},
];

const identifierOptions = [
	{ name: 'External ID', value: 'external_id' },
	{ name: 'User Alias', value: 'user_alias' },
	{ name: 'Braze ID', value: 'braze_id' },
];

export const userFields: INodeProperties[] = [
	{
		displayName: 'Provide at least one of Attributes, Events, or Purchases. /users/track accepts up to 75 of each per request.',
		name: 'trackNotice',
		type: 'notice',
		default: '',
		displayOptions: user(['track']),
	},
	jsonBody('Attributes', 'attributes', 'attributes', 'User attribute objects to update.', '[{"external_id": "user123", "first_name": "Nathan", "email": "nathan@example.com"}]', user(['track'])),
	jsonBody('Events', 'events', 'events', 'Custom event objects to record.', '[{"external_id": "user123", "name": "event_name", "time": "2026-01-01T00:00:00Z"}]', user(['track'])),
	jsonBody('Purchases', 'purchases', 'purchases', 'Purchase objects to record.', '[{"external_id": "user123", "product_id": "sku1", "currency": "USD", "price": 12.34, "time": "2026-01-01T00:00:00Z"}]', user(['track'])),
	bodyString('Partner', 'partner', 'partner', 'Partner name, when this track call is made for a Braze technology partner.', user(['track']), false, 'e.g. partner_name'),

	jsonBody('Aliases to Identify', 'aliasesToIdentify', 'aliases_to_identify', 'Alias objects to identify. Each object needs an external ID and a user alias.', '[{"external_id": "user123", "user_alias": {"alias_name": "device123", "alias_label": "device_id"}}]', user(['identify']), true),

	{
		displayName: 'Deleting a profile is permanent.',
		name: 'deleteNotice',
		type: 'notice',
		default: '',
		displayOptions: user(['delete']),
	},
	{
		displayName: 'Identifier Type',
		name: 'identifierType',
		type: 'options',
		options: [
			{ name: 'External IDs', value: 'external_ids' },
			{ name: 'Braze IDs', value: 'braze_ids' },
			{ name: 'User Aliases', value: 'user_aliases' },
			{ name: 'Email Addresses', value: 'email_addresses' },
			{ name: 'Phone Numbers', value: 'phone_numbers' },
		],
		default: 'external_ids',
		description: 'Identifier to delete by. A request can include only one identifier type, up to 50 values.',
		displayOptions: user(['delete']),
	},
	csvBody('External IDs', 'externalIds', 'external_ids', 'Comma-separated external IDs to delete.', 'e.g. user123, user456', show('user', ['delete'], { identifierType: ['external_ids'] })),
	csvBody('Braze IDs', 'brazeIds', 'braze_ids', 'Comma-separated Braze IDs to delete.', 'e.g. 5f1d..., 5f1e...', show('user', ['delete'], { identifierType: ['braze_ids'] })),
	csvBody('Email Addresses', 'emailAddresses', 'email_addresses', 'Comma-separated email addresses to delete.', 'e.g. nathan@example.com', show('user', ['delete'], { identifierType: ['email_addresses'] })),
	csvBody('Phone Numbers', 'phoneNumbers', 'phone_numbers', 'Comma-separated phone numbers in E.164 format.', 'e.g. +12125551212', show('user', ['delete'], { identifierType: ['phone_numbers'] })),
	jsonBody('User Aliases', 'userAliasesDelete', 'user_aliases', 'User alias objects to delete.', '[{"alias_name": "device123", "alias_label": "device_id"}]', show('user', ['delete'], { identifierType: ['user_aliases'] }), true),

	{
		displayName: 'Identifier to Merge',
		name: 'identifierField',
		type: 'options',
		options: identifierOptions,
		default: 'external_id',
		description: 'Identifier of the profile that will be merged and removed.',
		displayOptions: user(['merge']),
	},
	{
		displayName: 'Identifier Value',
		name: 'identifierValue',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. user123',
		description: 'Value of the profile that will be merged and removed.',
		displayOptions: show('user', ['merge'], { identifierField: ['external_id', 'braze_id'] }),
	},
	{
		displayName: 'Alias Name',
		name: 'mergeAliasName',
		type: 'string',
		default: '',
		required: true,
		description: 'Alias name of the profile that will be merged and removed.',
		displayOptions: show('user', ['merge'], { identifierField: ['user_alias'] }),
	},
	{
		displayName: 'Alias Label',
		name: 'mergeAliasLabel',
		type: 'string',
		default: '',
		required: true,
		description: 'Alias label of the profile that will be merged and removed.',
		displayOptions: show('user', ['merge'], { identifierField: ['user_alias'] }),
	},
	{
		displayName: 'Identifier to Keep',
		name: 'mergeIdentifierField',
		type: 'options',
		options: identifierOptions,
		default: 'external_id',
		description: 'Identifier of the profile that will be kept.',
		displayOptions: user(['merge']),
	},
	{
		displayName: 'Identifier Value',
		name: 'mergeIdentifierValue',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. user456',
		description: 'Value of the profile that will be kept.',
		displayOptions: show('user', ['merge'], { mergeIdentifierField: ['external_id', 'braze_id'] }),
	},
	{
		displayName: 'Alias Name',
		name: 'keepAliasName',
		type: 'string',
		default: '',
		required: true,
		description: 'Alias name of the profile that will be kept.',
		displayOptions: show('user', ['merge'], { mergeIdentifierField: ['user_alias'] }),
	},
	{
		displayName: 'Alias Label',
		name: 'keepAliasLabel',
		type: 'string',
		default: '',
		required: true,
		description: 'Alias label of the profile that will be kept.',
		displayOptions: show('user', ['merge'], { mergeIdentifierField: ['user_alias'] }),
	},

	{
		displayName: 'Export Type',
		name: 'exportType',
		type: 'options',
		options: [
			{ name: 'By Identifier', value: 'byId', routing: { request: { url: '/users/export/ids' } } },
			{ name: 'By Segment', value: 'bySegment', routing: { request: { url: '/users/export/segment' } } },
			{ name: 'Global Control Group', value: 'globalControlGroup', routing: { request: { url: '/users/export/global_control_group' } } },
		],
		default: 'byId',
		description: 'Which profiles to export.',
		displayOptions: user(['export']),
	},
	{
		displayName: 'Identifier Type',
		name: 'exportIdentifierType',
		type: 'options',
		options: [
			{ name: 'External IDs', value: 'external_ids' },
			{ name: 'User Aliases', value: 'user_aliases' },
			{ name: 'Braze ID', value: 'braze_id' },
			{ name: 'Email Address', value: 'email_address' },
			{ name: 'Phone', value: 'phone' },
			{ name: 'Device ID', value: 'device_id' },
		],
		default: 'external_ids',
		description: 'Identifier used to find profiles. External IDs and aliases accept up to 50 values. The other identifiers accept one value.',
		displayOptions: show('user', ['export'], { exportType: ['byId'] }),
	},
	csvBody('External IDs', 'exportExternalIds', 'external_ids', 'Comma-separated external IDs to export.', 'e.g. user123, user456', show('user', ['export'], { exportType: ['byId'], exportIdentifierType: ['external_ids'] })),
	jsonBody('User Aliases', 'exportUserAliases', 'user_aliases', 'User alias objects to export.', '[{"alias_name": "device123", "alias_label": "device_id"}]', show('user', ['export'], { exportType: ['byId'], exportIdentifierType: ['user_aliases'] }), true),
	bodyString('Braze ID', 'brazeId', 'braze_id', 'Braze ID of the profile to export.', show('user', ['export'], { exportType: ['byId'], exportIdentifierType: ['braze_id'] }), true),
	bodyString('Email Address', 'emailAddress', 'email_address', 'Email address of the profile to export.', show('user', ['export'], { exportType: ['byId'], exportIdentifierType: ['email_address'] }), true, 'e.g. nathan@example.com'),
	bodyString('Phone', 'phone', 'phone', 'Phone number of the profile to export, in E.164 format.', show('user', ['export'], { exportType: ['byId'], exportIdentifierType: ['phone'] }), true, 'e.g. +12125551212'),
	bodyString('Device ID', 'deviceId', 'device_id', 'Device identifier returned by the Braze SDK.', show('user', ['export'], { exportType: ['byId'], exportIdentifierType: ['device_id'] }), true),
	{
		displayName: 'Segment',
		name: 'segmentId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Segment whose users will be exported.',
		displayOptions: show('user', ['export'], { exportType: ['bySegment'] }),
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: 'searchSegments', searchable: true },
			},
			{ displayName: 'ID', name: 'id', type: 'string', placeholder: 'e.g. segment_identifier' },
		],
		routing: {
			send: { preSend: [placeId('segmentId', 'body', 'segment_id'), omitEmptyBody] },
		},
	},
	jsonBody('Fields to Export', 'fieldsToExport', 'fields_to_export', 'Profile fields to return, such as email, first_name, or custom_attributes. Leave empty to return the default field set.', '["email", "first_name", "external_id"]', user(['export'])),
	bodyString('Callback URL', 'callbackEndpoint', 'callback_endpoint', 'URL Braze should call when a segment or Global Control Group export is ready.', show('user', ['export'], { exportType: ['bySegment', 'globalControlGroup'] }), false, 'e.g. https://example.com/braze-export'),

	jsonBody('User Aliases', 'userAliases', 'user_aliases', 'Aliases to create. Include an external ID to attach the alias to an existing user, or omit it to create an alias-only user.', '[{"external_id": "user123", "alias_name": "device123", "alias_label": "device_id"}]', user(['alias']), true),
	jsonBody('Alias Updates', 'aliasUpdates', 'alias_updates', 'Aliases to rename. Each object needs alias_label, old_alias_name, and new_alias_name.', '[{"alias_label": "device_id", "old_alias_name": "device123", "new_alias_name": "device456"}]', user(['updateAlias']), true),
	jsonBody('External ID Renames', 'externalIdRenames', 'external_id_renames', 'External IDs to rename. Each object needs current_external_id and new_external_id.', '[{"current_external_id": "old-id", "new_external_id": "new-id"}]', user(['renameExternalId']), true),
	csvBody('External IDs', 'externalIdsRemove', 'external_ids', 'Comma-separated external IDs to remove.', 'e.g. old-id-1, old-id-2', user(['removeExternalId'])),
	queryString('Status ID', 'statusId', 'status_id', 'Status ID returned by a /users/track response.', user(['trackStatus']), true, 'e.g. 0123456789abcdef'),
];
