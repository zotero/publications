import _ from 'lodash';
import {
	CHILD_ITEMS_SYMBOL
} from './data.js';

export function processResponse(response, config) {
	if(response) {
		let childItems = [];
		let index = {};

		for(var i = response.length; i--; ) {
			let item = response[i];
			if(item.data && item.data.abstractNote) {
				let abstractNoteShort = item.data.abstractNote.substr(0, config.shortenedAbstractLenght);
				abstractNoteShort = abstractNoteShort.substr(
					0,
					Math.min(abstractNoteShort.length, abstractNoteShort.lastIndexOf(' '))
				);
				item.data.abstractNoteShort = abstractNoteShort;
			}
			if(item.data && item.data.parentItem) {
				response.splice(i, 1);
				childItems.push(item);
			}
			index[item.key] = item;
		}

		for(let item of childItems) {
			if(!index[item.data.parentItem]) {
				console.warn(`item ${item.key} has parentItem ${item.data.parentItem} that does not exist in the dataset`);
				continue;
			}

			if(!index[item.data.parentItem][CHILD_ITEMS_SYMBOL]) {
				index[item.data.parentItem][CHILD_ITEMS_SYMBOL] = [];
			}
			index[item.data.parentItem][CHILD_ITEMS_SYMBOL].push(item);
		}
	}
	return response;
}

export function fetchUntilExhausted(url, options, jsondata) {
	let relRegex = /<(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))>;\s*rel="next"/;
	jsondata = jsondata || [];

	return new Promise(function(resolve, reject) {
		fetch(url, options).then(function(response) {
			if(response.status >= 200 && response.status < 300) {
				if(response.headers.has('Link')) {
					let matches = response.headers.get('Link').match(relRegex);
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
		}).catch(function() {
			reject(`Unexpected error when requesting ${url}`);
		});
	});
}
