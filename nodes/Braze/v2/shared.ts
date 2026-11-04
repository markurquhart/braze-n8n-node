import {
	IDataObject,
	IDisplayOptions,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
	INodePropertyOptions,
	INodePropertyRouting,
} from 'n8n-workflow';

import { omitEmptyBody } from '../GenericFunctions';

export async function omitEmptyQuery(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const qs = requestOptions.qs as IDataObject | undefined;
	if (!qs) return requestOptions;
	for (const key of Object.keys(qs)) {
		if (qs[key] === '' || qs[key] === undefined || qs[key] === null) {
			delete qs[key];
		}
	}
	return requestOptions;
}

export function show(
	resource: string,
	operation: string[],
	extra: Record<string, Array<string | boolean | number>> = {},
): IDisplayOptions {
	return {
		show: {
			resource: [resource],
			operation,
			...extra,
		},
	};
}

export function post(url: string): INodePropertyRouting {
	return {
		request: {
			method: 'POST',
			url,
		},
		send: {
			preSend: [omitEmptyBody],
		},
	};
}

export function get(url: string): INodePropertyRouting {
	return {
		request: {
			method: 'GET',
			url,
		},
		send: {
			preSend: [omitEmptyQuery],
		},
	};
}

export function http(method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', url: string): INodePropertyRouting {
	const routing: INodePropertyRouting = {
		request: {
			method,
			url,
		},
	};
	routing.send = {
		preSend: method === 'GET' ? [omitEmptyQuery] : [omitEmptyBody],
	};
	return routing;
}

export function operation(
	name: string,
	value: string,
	action: string,
	description: string,
	routing: INodePropertyRouting,
): INodePropertyOptions {
	return { name, value, action, description, routing };
}

export function resourceLocator(options: {
	displayName: string;
	name: string;
	description: string;
	searchListMethod: string;
	placeholder: string;
	displayOptions: IDisplayOptions;
	required?: boolean;
}): INodeProperties {
	return {
		displayName: options.displayName,
		name: options.name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: options.required !== false,
		description: options.description,
		displayOptions: options.displayOptions,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: `Select a ${options.displayName.toLowerCase()}`,
				typeOptions: {
					searchListMethod: options.searchListMethod,
					searchable: true,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				placeholder: options.placeholder,
			},
		],
	};
}

export function jsonBody(
	displayName: string,
	name: string,
	bodyKey: string,
	description: string,
	placeholder: string,
	displayOptions: IDisplayOptions,
	required = false,
	asArray = true,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'json',
		default: asArray ? '[]' : '{}',
		required,
		placeholder,
		description,
		displayOptions,
		routing: {
			request: {
				body: {
					[bodyKey]: '={{ $value }}',
				},
			},
		},
	};
}

export function csvBody(
	displayName: string,
	name: string,
	bodyKey: string,
	description: string,
	placeholder: string,
	displayOptions: IDisplayOptions,
	required = true,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		required,
		placeholder,
		description,
		displayOptions,
		routing: {
			request: {
				body: {
					[bodyKey]: '={{ $value.split(",").map(id => id.trim()).filter(id => id) }}',
				},
			},
		},
	};
}

export function queryNumber(
	displayName: string,
	name: string,
	queryKey: string,
	description: string,
	displayOptions: IDisplayOptions,
	defaultValue: number,
	extra: Partial<INodeProperties> = {},
): INodeProperties {
	return {
		displayName,
		name,
		type: 'number',
		default: defaultValue,
		description,
		displayOptions,
		routing: {
			request: {
				qs: {
					[queryKey]: '={{ $value }}',
				},
			},
		},
		...extra,
	};
}

export function queryString(
	displayName: string,
	name: string,
	queryKey: string,
	description: string,
	displayOptions: IDisplayOptions,
	required = false,
	placeholder = '',
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		required,
		placeholder,
		description,
		displayOptions,
		routing: {
			request: {
				qs: {
					[queryKey]: '={{ $value }}',
				},
			},
		},
	};
}

export function queryBoolean(
	displayName: string,
	name: string,
	queryKey: string,
	description: string,
	displayOptions: IDisplayOptions,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'boolean',
		default: false,
		description,
		displayOptions,
		routing: {
			request: {
				qs: {
					[queryKey]: '={{ $value }}',
				},
			},
		},
	};
}

export function queryDate(
	displayName: string,
	name: string,
	queryKey: string,
	description: string,
	displayOptions: IDisplayOptions,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'dateTime',
		default: '',
		description,
		displayOptions,
		routing: {
			request: {
				qs: {
					[queryKey]: '={{ $value }}',
				},
			},
		},
	};
}

export function pageFields(resource: string, operations: string[], includeArchived = false, includeSort = true): INodeProperties[] {
	const displayOptions = show(resource, operations);
	const fields: INodeProperties[] = [
		queryNumber('Page', `${resource}Page`, 'page', 'Page of results to return. List endpoints return a fixed page size.', displayOptions, 0, {
			typeOptions: { minValue: 0 },
		}),
	];

	if (includeSort) {
		fields.push({
			displayName: 'Sort Direction',
			name: `${resource}SortDirection`,
			type: 'options',
			options: [
				{ name: 'Oldest First', value: 'asc' },
				{ name: 'Newest First', value: 'desc' },
			],
			default: 'desc',
			description: 'Sort records by the time they were created.',
			displayOptions,
			routing: {
				request: {
					qs: {
						sort_direction: '={{ $value }}',
					},
				},
			},
		});
	}

	if (includeArchived) {
		fields.push(queryBoolean(
			'Include Archived',
			`${resource}IncludeArchived`,
			'include_archived',
			'Whether to include archived records.',
			displayOptions,
		));
	}

	return fields;
}

export function seriesFields(resource: string, operations: string[], includeUnit = false): INodeProperties[] {
	const displayOptions = show(resource, operations);
	const fields: INodeProperties[] = [
		queryNumber(
			'Length',
			`${resource}Length`,
			'length',
			'Number of units to include, ending at Ending At. Day series must be between 1 and 100.',
			displayOptions,
			7,
			{ typeOptions: { minValue: 1, maxValue: 100 } },
		),
		queryDate(
			'Ending At',
			`${resource}EndingAt`,
			'ending_at',
			'Date the series should end. Defaults to the time of the request when left empty.',
			displayOptions,
		),
	];

	if (includeUnit) {
		fields.push({
			displayName: 'Unit',
			name: `${resource}Unit`,
			type: 'options',
			options: [
				{ name: 'Day', value: 'day' },
				{ name: 'Hour', value: 'hour' },
			],
			default: 'day',
			description: 'Time unit for each point in the series.',
			displayOptions,
			routing: {
				request: {
					qs: {
						unit: '={{ $value }}',
					},
				},
			},
		});
	}

	return fields;
}

export function bodyString(
	displayName: string,
	name: string,
	bodyKey: string,
	description: string,
	displayOptions: IDisplayOptions,
	required = false,
	placeholder = '',
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		required,
		placeholder,
		description,
		displayOptions,
		routing: {
			request: {
				body: {
					[bodyKey]: '={{ $value }}',
				},
			},
		},
	};
}

export function bodyBoolean(
	displayName: string,
	name: string,
	bodyKey: string,
	description: string,
	displayOptions: IDisplayOptions,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'boolean',
		default: false,
		description,
		displayOptions,
		routing: {
			request: {
				body: {
					[bodyKey]: '={{ $value }}',
				},
			},
		},
	};
}
