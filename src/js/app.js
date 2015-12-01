import _ from 'lodash';
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
import {
	toggleSpinner
} from './ui.js';

function ZoteroPublications(config) {
	this.config = _.extend({}, this.defaults, config);
}

ZoteroPublications.prototype.defaults = {
	apiBase: 'api.zotero.org',
	limit: 100,
	citationStyle: 'apa-annotated-bibliography',
	include: ['data', 'citation'],
	shortenedAbstractLenght: 250,
	group: false,
	expand: 'all'
};

ZoteroPublications.prototype.get = function(endpoint) {
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

	return new Promise(function(resolve, reject) {
		let promise = fetchUntilExhausted(url, options);
		promise.then(function(responseJson) {
			responseJson = processResponse(responseJson, this.config);
			let data = new ZoteroData(responseJson);
			if(this.config.group === 'type') {
				data.groupByType(this.config.expand);
			}
			resolve(data);
		}.bind(this));
		promise.catch(reject);
	}.bind(this));
};


ZoteroPublications.prototype.render = function(endpointOrData, container) {
	return new Promise(function(resolve, reject) {
		if(endpointOrData instanceof ZoteroData) {
			let data = endpointOrData;
			renderPublications(container, data);
			resolve();
		} else {
			let endpoint = endpointOrData;
			toggleSpinner(container, true);
			let promise = this.get(endpoint);
			promise.then(function(data) {
				toggleSpinner(container, false);
				renderPublications(container, data);
				resolve();
			});
			promise.catch(reject);
		}
	}.bind(this));
};

ZoteroPublications.ZoteroData = ZoteroData;

module.exports = ZoteroPublications;
