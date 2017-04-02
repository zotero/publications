/*global Zotero: false */
import _ from 'lodash';
import {
	fetchUntilExhausted
} from './api.js';
import ZoteroData from './data.js';
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
export default function ZoteroPublications() {
	if(arguments.length > 3) {
		return Promise.reject(
			new Error(`ZoteroPublications takes between one and three arguments. ${arguments.length} is too many.`)
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

	this.ready = new Promise((resolve) => {
		if(typeof document !== 'undefined' && document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				resolve();
			});
		} else {
			resolve();
		}
	});

	this.ready.then(() => {
		this.config.zorgIntegration = this.config.zorgIntegration &&
										typeof Zotero !== 'undefined' ? (Zotero.config && Zotero.config.loggedInUser)
										|| Zotero.currentUser : false;
		if(this.config.zorgIntegration) {
			this.config.zorgIntegration['apiKey'] = Zotero.config.apiKey;
		}
	});

	if(arguments.length > 1) {
		return this.render(arguments[0], arguments[1]);
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
	authorsListed: 10,
	citeStyleOptions: {
		'american-anthropological-association': 'American Anthropological Association',
		'apa': 'American Psychological Association 6th edition',
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
		limit: 100
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

/**
 * Lol-level function to post data to given url
 * @param  {String} url 		- target url for the post request
 * @param  {[type]} data 		- Raw data posted as part of the request
 * @param  {?Object} params 	- Optional additional query string params
 * @param  {?Object} init 		- Options forwarded to the fetch method
 * @return {Promise} 			- Fetch promise
 */
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
 * @param  {String} endpoint 	- An API endpoint from which data should be obtained
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Resolved with ZoteroData object on success, rejected
 *                        		in case of any network/response problems
 */
ZoteroPublications.prototype.getEndpoint = function(endpoint, params = {}) {
	let apiBase = this.config.apiBase,
		url = `https://${apiBase}/${endpoint}`;

	return this.get(url, params);
};

/**
 * Build url for an endpoint and use it to post data
 * @param  {String} endpoint 	- An API endpoint
 * @param  {[type]} data 		- Raw data posted as part of the request
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Fetch promise
 */
ZoteroPublications.prototype.postEndpoint = function(endpoint, data, params = {}) {
	let apiBase = this.config.apiBase,
		url = `https://${apiBase}/${endpoint}`;

	return this.post(url, data, params);
};

/**
 * Build url for getting user's publications then fetch entire dataset recursively
 * @param  {Number} userId 		- User id
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Resolved with ZoteroData object on success, rejected
 *                        		in case of any network/response problems
 */
ZoteroPublications.prototype.getPublications = function(userId, params = {}) {
	this.userId = userId;
	return this.getEndpoint(`users/${userId}/publications/items`, params);
};

/**
 * Build url for getting a single item from user's publications then fetch it
 * @param  {String} itemId 		- Item key
 * @param  {Number} userId 		- User id
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise}			- Resolved with ZoteroData object on success, rejected
 *                       		in case of any network/response problems
 */
ZoteroPublications.prototype.getPublication = function(itemId, userId, params = {}) {
	return this.getEndpoint(`users/${userId}/publications/items/${itemId}`, params);
};

/**
 * Build url for sending one or more items to user's library then post it
 * @param  {Number} userId 		- User id
 * @param  {Object} data 		- Raw data posted as part of the request
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Fetch promise
 */
ZoteroPublications.prototype.postItems = function(userId, data, params = {}) {
	return this.postEndpoint(`users/${userId}/items`, data, params);

}

/**
 * Render local or remote items.
 * @param  {String|ZoteroData} endpointOrData - Data containung publications to be rendered
 * @param  {HTMLElement} container            - A DOM element where publications will be rendered
 * @return {Promise}                          - Resolved when rendered or rejected on error.
 *                                              In browser, resolved with reference to the domwrapper instance
 *                                              In node, resolved with produced html {String}
 */
ZoteroPublications.prototype.render = function(userIdOrendpointOrData, container) {
	return new Promise((resolve, reject) => {
		var promise;

		if(typeof(window) !== 'undefined' && !(container instanceof HTMLElement)) {
			reject(new Error('Second argument to render() method must be a DOM element'));
		}

		if(userIdOrendpointOrData instanceof ZoteroData) {
			promise = Promise.resolve(userIdOrendpointOrData);
		} else if(typeof userIdOrendpointOrData === 'number') {
			promise = this.getPublications(userIdOrendpointOrData);
		} else if(typeof userIdOrendpointOrData === 'string') {
			promise = this.getEndpoint(userIdOrendpointOrData);
		} else {
			reject(new Error('First argument to render() method must be an endpoint or an instance of ZoteroData'));
		}

		Promise.all([promise, this.ready]).then(([data]) => {
			if(this.config.group === 'type') {
				data.groupByType(this.config.expand);
			}

			if(typeof(window) !== 'undefined') {
				const DomWrapper = require('./dom-wrapper.js');
				let domwrapper = new DomWrapper(container, this)
				domwrapper.displayPublications(data);
				if(this.config.useHistory && location.hash) {
					domwrapper.expandDetails(location.hash.substr(1));
				}
				resolve(domwrapper);
			} else {
				const Renderer = require('./renderer.js');
				let renderer = new Renderer(this);
				if(data.grouped > 0) {
					resolve(renderer.renderGroupView(data));
				} else {
					resolve(renderer.renderPlainView(data));
				}
			}

		}).catch(reject);
	});
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
ZoteroPublications.Renderer = require('./renderer.js');

/**
 * Make DomWrapper publicly accessible underneath ZoteroPublications
 * but only if in browser environment
 * @type {DomWrapper}
 */
ZoteroPublications.DomWrapper = typeof(window) !== 'undefined' ? require('./dom-wrapper.js') : null;
