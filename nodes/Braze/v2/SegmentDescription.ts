import { INodeProperties } from 'n8n-workflow';

import { omitEmptyBody } from '../GenericFunctions';
import { placeId } from './requestBuilders';
import { get, operation, pageFields, post, resourceLocator, seriesFields, show } from './shared';

const segment = (operations: string[]) => show('segment', operations);

export const segmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['segment'] } },
		options: [
			operation('Get Many', 'list', 'Get many segments', 'List segments in this workspace.', get('/segments/list')),
			operation('Get', 'details', 'Get segment', 'Retrieve one segment.', {
				...get('/segments/details'),
				send: { preSend: [placeId('segmentDetailsId', 'query', 'segment_id')] },
			}),
			operation('Get Analytics', 'analytics', 'Get segment analytics', 'Retrieve the estimated size of a segment over time.', {
				...get('/segments/data_series'),
				send: { preSend: [placeId('segmentDetailsId', 'query', 'segment_id')] },
			}),
			operation('Cancel Export', 'cancelExport', 'Cancel segment export', 'Cancel an in-progress export for a segment.', {
				...post('/export/segment/cancel'),
				send: { preSend: [placeId('segmentDetailsId', 'body', 'segment_id'), omitEmptyBody] },
			}),
		],
		default: 'list',
	},
];

export const segmentFields: INodeProperties[] = [
	resourceLocator({
		displayName: 'Segment',
		name: 'segmentDetailsId',
		description: 'Segment to retrieve or update.',
		searchListMethod: 'searchSegments',
		placeholder: 'e.g. segment_identifier',
		displayOptions: segment(['details', 'analytics', 'cancelExport']),
	}),
	...pageFields('segment', ['list']),
	...seriesFields('segment', ['analytics']),
];
