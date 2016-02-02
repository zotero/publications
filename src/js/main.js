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
 * Application entry point
 * @param {Object} [config] - Configuration object that will selectively override the defaults
 */
export function ZoteroPublications() {
	if(arguments.length <= 1) {
		this.config = _.extend({}, this.defaults, arguments ? arguments[0] : {});
	} else if(arguments.length <= 3) {
		this.config = _.extend({}, this.defaults, arguments[2]);
		return this.render(arguments[0], arguments[1]);
	} else {
		return Promise.reject(
			new Error('ZoteroPublications takes between one and three arguments. ${arguments.length} is too many.')
		);
	}
}

/**
 * Default configuration object
 * @type {Object}
 */
ZoteroPublications.prototype.defaults = {
	apiBase: 'api.zotero.org',
	limit: 100,
	citationStyle: '',
	include: ['data', 'citation'],
	storeCitationPreference: false,
	shortenedAbstractLenght: 250,
	group: false,
	alwaysUseCitationStyle: false,
	expand: 'all',
	citeStyleOptions: {
		'american-anthropological-association': 'American Anthropological Association',
		'chicago-author-date': 'Chicago Manual of Style 16th edition (author-date)',
		'elsevier-harvard': 'Elsevier Harvard (with titles)',
		'modern-humanities-research-association-author-date': 'Modern Humanities Research Association 3rd edition (author-date)',
		'modern-language-association': 'Modern Language Association 7th edition'
	},
	exportFormats: {
		'bibtex': 'BibTeX',
		'ris': 'RIS',
		'rdf_zotero': 'Zotero RDF'
	}
};

ZoteroPublications.prototype.get = function(url, options) {
	options = options || {
		headers: {
			'Accept': 'application/json'
		}
	};

	return new Promise(function(resolve, reject) {
		let promise = fetchUntilExhausted(url, options);
		promise.then(function(responseJson) {
			let data = new ZoteroData(responseJson, this.config);
			if(this.config.group === 'type') {
				data.groupByType(this.config.expand);
			}
			resolve(data);
		}.bind(this));
		promise.catch(reject);
	}.bind(this));
};

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint - An API endpoint from which data should be obtained
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getEndpoint = function(endpoint) {
	let apiBase = this.config.apiBase,
		limit = this.config.limit,
		style = this.config.citationStyle,
		include = this.config.include.join(','),
		url = `https://${apiBase}/${endpoint}?include=${include}&limit=${limit}&linkwrap=1&order=dateModified&sort=desc&start=0&style=${style}`;

	return this.get(url);

};

ZoteroPublications.prototype.getPublications = function(userId, options) {
	options = options || {};
	let apiBase = this.config.apiBase,
		limit = options.limit || this.config.limit,
		style = options.citationStyle || this.config.citationStyle,
		include = options.include && options.include.join(',') || this.config.include.join(','),
		url = `https://${apiBase}/users/${userId}/publications/items?include=${include}&limit=${limit}&linkwrap=1&order=dateModified&sort=desc&start=0&style=${style}`;

	this.userId = userId;

	return this.get(url);
};


ZoteroPublications.prototype.getItem = function(itemId, userId, options) {
	options = options || {};
	let apiBase = this.config.apiBase,
		limit = options.limit || this.config.limit,
		style = options.citationStyle || this.config.citationStyle,
		include = options.include && options.include.join(',') || this.config.include.join(','),
		url = `https://${apiBase}/users/${userId}/publications/items/${itemId}?include=${include}&limit=${limit}&linkwrap=1&order=dateModified&sort=desc&start=0&style=${style}`;

	return this.get(url);
};

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
			this.renderer = new ZoteroRenderer(container, this);
			this.renderer.displayPublications(data);
			resolve();
		} else if(typeof userIdOrendpointOrData === 'number') {
			let userId = userIdOrendpointOrData;
			let promise = this.getPublications(userId);
			this.renderer = new ZoteroRenderer(container, this);
			promise.then(function(data) {
				this.renderer.displayPublications(data);
				resolve();
			}.bind(this));
			promise.catch(function() {
				reject(arguments[0]);
			});
		} else if(typeof userIdOrendpointOrData === 'string') {
			let endpoint = userIdOrendpointOrData;
			let promise = this.getEndpoint(endpoint);
			this.renderer = new ZoteroRenderer(container, this);
			promise.then(function(data) {
				this.renderer.displayPublications(data);
				resolve();
			}.bind(this));
			promise.catch(function() {
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
