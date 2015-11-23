import _ from '../../bower_components/lodash/lodash.js';
import {
	renderPublications
} from './render.js';
import {
	fetchUntilExhausted,
	processResponse
} from './api.js';
import {
	ZoteroData
} from './data.js';

function ZoteroPublications(config) {
	this.config = _.extend({}, this.defaults, config);
}

ZoteroPublications.prototype.defaults = {
	apiBase: 'api.zotero.org',
	limit: 100,
	citationStyle: 'apa-annotated-bibliography',
	include: ['data', 'citation'],
	shortenedAbstractLenght: 250
};

ZoteroPublications.prototype.getItems = function(endpoint) {
	let apiBase = this.config.apiBase,
		limit = this.config.limit,
		style = this.config.citationStyle,
		include = this.config.include.join(','),
		url = `//${apiBase}/${endpoint}?include=${include}&limit=${limit}&linkwrap=1&order=dateModified&sort=desc&start=0&style=${style}`,
		options = {
			headers: {
				'Accept': 'application/json'
			}
		};

	return new Promise(function(resolve) {
		fetchUntilExhausted(url, options)
		.then(function(responseJson) {
			responseJson = processResponse(responseJson, this.config);
			let data = new ZoteroData(responseJson);
			resolve(data);
		}.bind(this));
	}.bind(this));
};


ZoteroPublications.prototype.render = function(endpoint, container, options) {
	options = options || {};
	this.getItems(endpoint).then(
		function(data) {
			if(options.groupByType) {
				data.groupByType();
			}
			renderPublications(container, data);
		}
	);
};

module.exports = ZoteroPublications;
