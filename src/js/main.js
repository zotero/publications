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
	showRights: true,
	expand: 'all',
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
	citeStyleOptionDefault: 'chicago-author-date',
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
ZoteroPublications.prototype.get = function(url, options, init) {
	init = init || {
		headers: {
			'Accept': 'application/json'
		}
	};

	options = _.extend({}, this.config, options);

	return new Promise((resolve, reject) => {
		let promise = fetchUntilExhausted(url, init);
		promise.then(responseJson => {
			let data = new ZoteroData(responseJson, this.config);
			if(options.group === 'type') {
				data.groupByType(options.expand);
			}
			resolve(data);
		});
		promise.catch(reject);
	});
};

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint - An API endpoint from which data should be obtained
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getEndpoint = function(endpoint, options) {
	options = options || {};
	let apiBase = this.config.apiBase,
		limit = options.limit || this.config.limit,
		style = options.citationStyle || this.config.citationStyle,
		include = options.include && options.include.join(',') || this.config.include.join(','),
		url = `https://${apiBase}/${endpoint}?include=${include}&limit=${limit}&linkwrap=1&order=dateModified&sort=desc&start=0&style=${style}`;

	return this.get(url, options);
};

/**
 * Build url for getting user's publications then fetch entire dataset recursively
 * @param  {number} userId   - User id
 * @param  {?Object} options - Settings that can complement or override instance config
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getPublications = function(userId, options) {
	options = options || {};
	let apiBase = this.config.apiBase,
		limit = options.limit || this.config.limit,
		style = options.citationStyle || this.config.citationStyle,
		include = options.include && options.include.join(',') || this.config.include.join(','),
		url = `https://${apiBase}/users/${userId}/publications/items?include=${include}&limit=${limit}&linkwrap=1&order=dateModified&sort=desc&start=0&style=${style}`;

	this.userId = userId;

	return this.get(url, options);
};

/**
 * Build url for getting a single item from user's publications then fetch it
 * @param  {[type]} userId   - User id
 * @param  {?Object} options - Settings that can complement or override instance config
 * @return {[type]}          - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getItem = function(itemId, userId, options) {
	options = options || {};
	let apiBase = this.config.apiBase,
		limit = options.limit || this.config.limit,
		style = options.citationStyle || this.config.citationStyle,
		include = options.include && options.include.join(',') || this.config.include.join(','),
		url = `https://${apiBase}/users/${userId}/publications/items/${itemId}?include=${include}&limit=${limit}&linkwrap=1&order=dateModified&sort=desc&start=0&style=${style}`;

	return this.get(url, options);
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
			promise.then(data => {
				this.renderer.displayPublications(data);
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
				this.renderer.displayPublications(data);
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
