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
import {
	toggleSpinner
} from './ui.js';

/**
 * Application entry point
 * @param {Object} [config] - Configuration object that will selectively override the defaults
 */
export function ZoteroPublications() {
	if(arguments.length <= 1) {
		this.config = _.extend({}, this.defaults, arguments ? arguments[0] : {});
		this.renderer = new ZoteroRenderer(this.config);
	} else if(arguments.length <= 3) {
		this.config = _.extend({}, this.defaults, arguments[2]);
		this.renderer = new ZoteroRenderer(this.config);
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
	shortenedAbstractLenght: 250,
	group: false,
	alwaysUseCitationStyle: false,
	expand: 'all'
};

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint - An API endpoint from which data should be obtained
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.get = function(endpoint) {
	let apiBase = this.config.apiBase,
		limit = this.config.limit,
		style = this.config.citationStyle,
		include = this.config.include.join(','),
		url = `https://${apiBase}/${endpoint}?include=${include}&limit=${limit}&linkwrap=1&order=dateModified&sort=desc&start=0&style=${style}`,
		options = {
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
 * Render local or remote items.
 * @param  {String|ZoteroData} endpointOrData - Data containung publications to be rendered
 * @param  {HTMLElement} container            - A DOM element where publications will be rendered
 * @return {Promise}                          - Resolved when rendered or rejected on error.
 */
ZoteroPublications.prototype.render = function(endpointOrData, container) {
	return new Promise(function(resolve, reject) {
		if(!(container instanceof HTMLElement)) {
			reject(new Error('Second argument to render() method must be a DOM element'));
		}
		if(endpointOrData instanceof ZoteroData) {
			let data = endpointOrData;
			this.renderer.renderPublications(container, data, this.config);
			resolve();
		} else if(typeof endpointOrData === 'string') {
			let endpoint = endpointOrData;
			toggleSpinner(container, true);
			let promise = this.get(endpoint);
			promise.then(function(data) {
				toggleSpinner(container, false);
				this.renderer.renderPublications(container, data, this.config);
				resolve();
			}.bind(this));
			promise.catch(function() {
				toggleSpinner(container, false);
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
