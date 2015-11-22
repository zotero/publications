import _ from '../../bower_components/lodash/lodash.js';
import {
	renderPublications,
	renderGroupedPublications
} from './render.js';


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

ZoteroPublications.prototype.processResponse = function(response) {
	if(response) {
		let childItems = [];
		let index = {};

		for(var i = response.length; i--; ) {
			let item = response[i];
			if(item.data && item.data.abstractNote) {
				let abstractNoteShort = item.data.abstractNote.substr(0, this.config.shortenedAbstractLenght);
				abstractNoteShort = abstractNoteShort.substr(
					0,
					Math.min(abstractNoteShort.length, abstractNoteShort.lastIndexOf(' '))
				);
				item.data.abstractNoteShort = abstractNoteShort;
			}
			if(item.data && item.data.parentItem) {
				response.splice(i, 1);
				childItems.push(item);
			} else {
				index[item.key] = item;
			}
		}

		for(let item of childItems) {
			if(!index[item.data.parentItem]) {
				console.warn(`item ${item.data.key} has parentItem ${item.data.parentItem} that does not exist in the dataset`);
				continue;
			}

			if(!index[item.data.parentItem].childItems) {
				index[item.data.parentItem].childItems = [];
			}
			index[item.data.parentItem].childItems.push(item);
		}
	}
	return response;
};

function fetchUntilExhausted(url, options, jsondata) {
	let regex = /<(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))>;\s*rel="next"/;
	jsondata = jsondata || [];

	return new Promise(function(resolve, reject) {
		fetch(url, options).then(function(response) {
			if(response.status >= 200 && response.status < 300) {
				if(response.headers.has('Link')) {
					let matches = response.headers.get('Link').match(regex);
					if(matches && matches.length >= 2) {
						response.json().then(function(jsonDataPart) {
							resolve(fetchUntilExhausted(matches[1], options, _.union(jsondata, jsonDataPart)));
						});
					} else {
						response.json().then(function(jsonDataPart) {
							resolve(_.union(jsondata, jsonDataPart));
						});
					}
				} else {
					response.json().then(function(jsonDataPart) {
						resolve(_.union(jsondata, jsonDataPart));
					});
				}
			} else {
				reject(`Unexpected status code ${response.status} when requesting ${url}`);
			}
		});
	});
}

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
		// .then(function(response) {
		// 	return response.json();
		// })
		.then(function(responseJson) {
			resolve(this.processResponse(responseJson));
		}.bind(this));
	}.bind(this));
};

ZoteroPublications.prototype.groupByType = function(data) {
	let groupedData = {};
	for(let item of data) {
		if(!groupedData[item.data.itemType]) {
			groupedData[item.data.itemType] = [];
		}
		groupedData[item.data.itemType].push(item);
	}
	return groupedData;
};

ZoteroPublications.prototype.render = function(endpoint, container, options) {
	options = options || {};
	this.getItems(endpoint).then(
		function(data) {
			if(options.groupByType) {
				data = this.groupByType(data);
				renderGroupedPublications(container, data);
			} else {
				renderPublications(container, data);
			}
		}.bind(this)
	);
};


module.exports = ZoteroPublications;
