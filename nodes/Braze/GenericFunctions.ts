import {
	IDataObject,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	IWebhookFunctions,
	IHttpRequestMethods,
} from 'n8n-workflow';

type BrazeContext = IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions | IExecuteSingleFunctions;

export async function brazeApiRequest(
	this: BrazeContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('brazeApi');
	const base = String(credentials.restEndpoint).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${base}${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	return (await this.helpers.httpRequestWithAuthentication.call(this, 'brazeApi', options)) as IDataObject;
}

function isEmptyValue(value: unknown): boolean {
	if (value === '' || value === undefined || value === null) return true;
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === 'object') return Object.keys(value as IDataObject).length === 0;
	return false;
}

export async function omitEmptyBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const body = requestOptions.body;
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return requestOptions;
	}

	for (const key of Object.keys(body as IDataObject)) {
		if (isEmptyValue((body as IDataObject)[key])) {
			delete (body as IDataObject)[key];
		}
	}

	if (Object.keys(body as IDataObject).length === 0) {
		delete requestOptions.body;
	}

	return requestOptions;
}

async function searchPaged(
	this: ILoadOptionsFunctions,
	endpoint: string,
	collectionKey: string,
	filter?: string,
	paginationToken?: string,
	includeArchived = true,
): Promise<INodeListSearchResult> {
	const page = paginationToken ? Number(paginationToken) : 0;
	const qs: IDataObject = {
		page,
		sort_direction: 'desc',
	};
	if (includeArchived) qs.include_archived = true;
	const response = await brazeApiRequest.call(this, 'GET', endpoint, {}, qs);
	const records = (response[collectionKey] ?? []) as Array<{ id: string; name: string }>;
	const needle = (filter ?? '').toLowerCase();
	const results = records
		.filter((record) => {
			if (!needle) return true;
			return record.name.toLowerCase().includes(needle) || record.id.toLowerCase().includes(needle);
		})
		.map((record) => ({
			name: record.name,
			value: record.id,
		}));

	return {
		results,
		paginationToken: records.length === 100 ? String(page + 1) : undefined,
	};
}

export async function searchCampaigns(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return searchPaged.call(this, '/campaigns/list', 'campaigns', filter, paginationToken);
}

export async function searchCanvases(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return searchPaged.call(this, '/canvas/list', 'canvases', filter, paginationToken);
}

export async function searchSegments(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return searchPaged.call(this, '/segments/list', 'segments', filter, paginationToken, false);
}

export async function searchCatalogs(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = await brazeApiRequest.call(this, 'GET', '/catalogs');
	const catalogs = (response.catalogs ?? []) as Array<{ name: string; description?: string }>;
	const needle = (filter ?? '').toLowerCase();
	return {
		results: catalogs
			.filter((catalog) => !needle || catalog.name.toLowerCase().includes(needle))
			.map((catalog) => ({
				name: catalog.description ? `${catalog.name} — ${catalog.description}` : catalog.name,
				value: catalog.name,
			})),
	};
}
