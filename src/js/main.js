import _ from 'lodash';
import {
	ZoteroRenderer
} from './render.js';
import {
	fetchUntilExhausted
} from './api.js';
import {
	ZoteroData
} from './data.js';
/**
 * Application entry point. Alternatively can be used as a convenience function to render publications
 * into a container
 * @param {*} [configOruserIdOrendpointOrData] - Configuration object that will selectively override
 *                                             the defaults. Alternatively if used as a convenience function,
 *                                             this is first argument (userIdOrendpointOrData) passed over to
 *                                             ZoteroPublications.render.
 * @param {*} [container] - Only when used as a convenience function, specifies a DOM element where publications
 *                        will be rendered
 * @param {*} [config] - Only when used as a convience function, configuration object that will selectively override
 *                     the defaults
 */
export function ZoteroPublications() {
	if(arguments.length > 3) {
		return Promise.reject(
			new Error('ZoteroPublications takes between one and three arguments. ${arguments.length} is too many.')
		);
	}

	if(arguments.length <= 1) {
		this.config = _.extend({}, this.defaults, arguments ? arguments[0] : {});
	} else {
		this.config = _.extend({}, this.defaults, arguments[2]);
	}

	if(this.config.useCitationStyle && !_.includes(this.config.include, 'citation')) {
		this.config.getQueryParamsDefault.include.push('citation');
	}

	_.extend(this.config.getQueryParamsDefault, {
		style: this.config.citationStyle
	});

	function init() {
		if(this.config.zorgIntegration) {
			this.config.zorgIntegration = typeof Zotero !== 'undefined' ?
				(Zotero.config && Zotero.config.loggedInUser)
				|| Zotero.currentUser : false;
			this.config.zorgIntegration['apiKey'] = Zotero.config.apiKey;
		}

		if(arguments.length > 1) {
			return this.render(arguments[0], arguments[1]);
		}
	}

	let promise = new Promise((resolve, reject) => {
		var possiblePromise;
		if(typeof document !== 'undefined' && document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', (ev) => {
				possiblePromise = init.apply(this, arguments);
			});
		} else {
			possiblePromise = init.apply(this, arguments);
		}
		if(possiblePromise && possiblePromise.then) {
			possiblePromise.then((result) => resolve(result));
			possiblePromise.catch((result) => reject(result));
		}
	});

	if(arguments.length > 1) {
		return promise;
	}
}

/**
 * Default configuration object
 * @type {Object}
 */
ZoteroPublications.prototype.defaults = {
	apiBase: 'api.zotero.org',
	citationStyle: '',
	storeCitationPreference: false,
	group: false,
	useCitationStyle: false,
	showBranding: true,
	useHistory: true,
	expand: 'all',
	zorgIntegration: false,
	citeStyleOptions: {
		'american-anthropological-association': 'American Anthropological Association',
		'asa': 'American Psychological Association 6th edition',
		'cell': 'Cell',
		'chicago-author-date': 'Chicago Manual of Style 16th edition (author-date)',
		'chicago-fullnote-bibliography': 'Chicago Manual of Style 16th edition (full note)',
		'chicago-note-bibliography': 'Chicago Manual of Style 16th edition (note)',
		'harvard-cite-them-right': 'Harvard - Cite Them Right 9th edition',
		'ieee': 'IEEE',
		'modern-humanities-research-association': 'Modern Humanities Research Association 3rd edition (note with bibliography)',
		'modern-language-association': 'Modern Language Association 7th edition',
		'nature': 'Nature',
		'vancouver': 'Vancouver'
	},
	citeStyleOptionDefault: 'chicago-note-bibliography',
	exportFormats: {
		'bibtex': {
			name: 'BibTeX',
			contentType: 'application/x-bibtex',
			extension: 'bib'
		},
		'ris': {
			name: 'RIS',
			contentType: 'application/x-research-info-systems',
			extension: 'ris'
		},
		'rdf_zotero': {
			name: 'Zotero RDF',
			contentType: 'application/rdf+xml',
			extension: 'rdf'
		}
	},
	getQueryParamsDefault: {
		linkwrap: '1',
		order: 'dateModified',
		sort: 'desc',
		start: '0',
		include: ['data'],
		limit: 100,
	}
};

/**
 * Low-level function to fetch given url to obtain Zotero Data
 * @param  {String} url      - A Zotero API url to get
 * @param  {?Object} options - Settings that can complement or override instance config
 * @param  {?Object} init    - Options forwarded to the fetch method
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.get = function(url, params = {}, init = {}) {
	params = _.extend({}, this.config.getQueryParamsDefault, params);
	init = _.extend({
		headers: {
			'Accept': 'application/json'
		}
	}, init);

	if(params.include instanceof Array) {
		params.include = params.include.join(',');
	}

	let queryParams = _.map(params, (value, key) => `${key}=${value}`).join('&');
	url = `${url}?${queryParams}`;

	return new Promise((resolve, reject) => {
		let promise = fetchUntilExhausted(url, init);
		promise.then(responseJson => {
			let data = new ZoteroData(responseJson, this.config);
			resolve(data);
		});
		promise.catch(reject);
	});
};

ZoteroPublications.prototype.post = function(url, data, params = {}, init = {}) {
	let queryParams = _.map(params, (value, key) => `${key}=${value}`).join('&');
	init = _.extend({
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}, init);
	url = `${url}?${queryParams}`;

	return fetch(url, init);
}

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint - An API endpoint from which data should be obtained
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getEndpoint = function(endpoint, params = {}) {
	let apiBase = this.config.apiBase,
		url = `https://${apiBase}/${endpoint}`;

	return this.get(url, params);
};

ZoteroPublications.prototype.postEndpoint = function(endpoint, data, params = {}) {
	let apiBase = this.config.apiBase,
		url = `https://${apiBase}/${endpoint}`;

	return this.post(url, data, params);
};

/**
 * Build url for getting user's publications then fetch entire dataset recursively
 * @param  {number} userId   - User id
 * @param  {?Object} options - Settings that can complement or override instance config
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getPublications = function(userId, params = {}) {
	return this.getEndpoint(`users/${userId}/publications/items`, params);
};

/**
 * Build url for getting a single item from user's publications then fetch it
 * @param  {[type]} userId   - User id
 * @param  {?Object} options - Settings that can complement or override instance config
 * @return {[type]}          - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getItem = function(itemId, userId, params = {}) {
	return this.getEndpoint(`users/${userId}/publications/items/${itemId}`, params);
};

ZoteroPublications.prototype.postItems = function(userId, data, params = {}) {
	return this.postEndpoint(`users/${userId}/items`, data, params);

}

/**
 * Render local or remote items.
 * @param  {String|ZoteroData} endpointOrData - Data containung publications to be rendered
 * @param  {HTMLElement} container            - A DOM element where publications will be rendered
 * @return {Promise}                          - Resolved when rendered or rejected on error.
 */
ZoteroPublications.prototype.render = function(userIdOrendpointOrData, container) {
	return new Promise(function(resolve, reject) {
		if(!(container instanceof HTMLElement)) {
			reject(new Error('Second argument to render() method must be a DOM element'));
		}
		if(userIdOrendpointOrData instanceof ZoteroData) {
			let data = userIdOrendpointOrData;
			if(this.config.group === 'type') {
				data.groupByType(this.config.expand);
			}
			this.renderer = new ZoteroRenderer(container, this);
			this.renderer.displayPublications(data);
			if(this.config.useHistory && location.hash) {
				this.renderer.expandDetails(location.hash.substr(1));
			}
			resolve();
		} else if(typeof userIdOrendpointOrData === 'number') {
			let userId = userIdOrendpointOrData;
			let promise = this.getPublications(userId);
			this.renderer = new ZoteroRenderer(container, this);
			promise.then(data => {
				if(this.config.group === 'type') {
					data.groupByType(this.config.expand);
				}
				this.renderer.displayPublications(data);
				if(this.config.useHistory && location.hash) {
					this.renderer.expandDetails(location.hash.substr(1));
				}
				resolve();
			});
			promise.catch(() => {
				reject(arguments[0]);
			});
		} else if(typeof userIdOrendpointOrData === 'string') {
			let endpoint = userIdOrendpointOrData;
			let promise = this.getEndpoint(endpoint);
			this.renderer = new ZoteroRenderer(container, this);
			promise.then(data => {
				if(this.config.group === 'type') {
					data.groupByType(this.config.expand);
				}
				this.renderer.displayPublications(data);
				if(this.config.useHistory && location.hash) {
					this.renderer.expandDetails(location.hash.substr(1));
				}
				resolve();
			});
			promise.catch(() => {
				reject(arguments[0]);
			});
		} else {
			reject(new Error('First argument to render() method must be an endpoint or an instance of ZoteroData'));
		}
	}.bind(this));
};

/**
 * Make ZoteroData publicly accessible underneath ZoteroPublications
 * @type {ZoteroData}
 */
ZoteroPublications.ZoteroData = ZoteroData;

/**
 * Make ZoteroRenderer publicly accessible underneath ZoteroPublications
 * @type {ZoteroRenderer}
 */
ZoteroPublications.ZoteroRenderer = ZoteroRenderer;
