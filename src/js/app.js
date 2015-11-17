import _ from '../../bower_components/lodash/lodash.js';
import { renderPublications } from './render.js';


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

ZoteroPublications.prototype.getPublications = function() {
	if(!this.config.apiEndpoint) {
		throw new Error('User id needs to be defined');
	}

	let apiBase = this.config.apiBase,
		apiEndpoint = this.config.apiEndpoint,
		limit = this.config.limit,
		style = this.config.citationStyle,
		include = this.config.include.join(','),
		url = `//${apiBase}/${apiEndpoint}?
			include=${include}&limit=${limit}&linkwrap=1&order=dateModified&
			sort=desc&start=0&style=${style}`,
		options = {
			headers: {
				'Accept': 'application/json'
			}
		};

	return new Promise(function(resolve, reject) {
		fetch(url, options)
		.then(function(response) {
			if(response.status >= 200 && response.status < 300) {
				return response;
			} else {
				reject(response.statusText);
			}
		})
		.then(function(response) {
			return response.json();
		})
		.then(function(responseJson) {
			resolve(this.processResponse(responseJson));
		}.bind(this));
	}.bind(this));
};

ZoteroPublications.prototype.render = function(container) {
	this.getPublications().then(
		_.partial(renderPublications, container)
	);
};


module.exports = ZoteroPublications;
