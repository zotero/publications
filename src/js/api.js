require('es6-symbol/implement');
import _ from 'lodash';
import {
	formatDate,
	formatAbstract
} from './utils.js';
import {
	CHILD_NOTES,
	CHILD_ATTACHMENTS,
	CHILD_OTHER,
	VIEW_ONLINE_URL
} from './data.js';

export const ABSTRACT_NOTE_SHORT_SYMBOL = Symbol.for('abstractNoteShort');
export const ABSTRACT_NOTE_PROCESSED = Symbol.for('abstractNoteProcessed');
export const AUTHORS_SYMBOL = Symbol.for('authors');
export const FORMATTED_DATE_SYMBOL = Symbol.for('formattedDate');

/**
 * Process raw API response
 * @param  {Object[]} response - The raw API response
 * @param  {Object} config     - Global ZoteroPublications config
 * @return {Object[]}          - Processed API response
 */
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
				item.data[ABSTRACT_NOTE_SHORT_SYMBOL] = abstractNoteShort;
				item.data[ABSTRACT_NOTE_PROCESSED] = formatAbstract(item.data.abstractNote);
			}
			if(item.data && item.data.creators) {
					item.data[AUTHORS_SYMBOL] = item.data.creators.map(author => {
						if(author.firstName && author.lastName) {
							return author.firstName + ' ' + author.lastName
						} else if(author.name) {
							return author.name;
						}
					}).join(' & ');
				}
			}
			if(item.data && item.meta.parsedDate) {
				item.data[FORMATTED_DATE_SYMBOL] = formatDate(item.meta.parsedDate);
			}
			if(item.data && item.data.parentItem) {
				response.splice(i, 1);
				childItems.push(item);
			}
			if(item.data && item.data.url) {
				item[VIEW_ONLINE_URL] = item.data.url;
			}
			index[item.key] = item;
		}

		for(let item of childItems) {
			if(!index[item.data.parentItem]) {
				console.warn(`item ${item.key} has parentItem ${item.data.parentItem} that does not exist in the dataset`);
				continue;
			}

			if(item.data.itemType === 'note') {
				if(!index[item.data.parentItem][CHILD_NOTES]) {
					index[item.data.parentItem][CHILD_NOTES] = [];
				}
				index[item.data.parentItem][CHILD_NOTES].push(item);
			} else if(item.data.itemType === 'attachment') {
				if(!index[item.data.parentItem][CHILD_ATTACHMENTS]) {
					index[item.data.parentItem][CHILD_ATTACHMENTS] = [];
				}
				if(!index[item.data.parentItem][VIEW_ONLINE_URL]) {
					if(item.data.url) {
						index[item.data.parentItem][VIEW_ONLINE_URL] = item.url;
					} else if(item.links && item.links.enclosure && item.links.enclosure.href) {
						index[item.data.parentItem][VIEW_ONLINE_URL] = item.links.enclosure.href;
					} else {
						index[item.data.parentItem][CHILD_ATTACHMENTS].push(item);
					}
				} else {
					index[item.data.parentItem][CHILD_ATTACHMENTS].push(item);
				}
			} else {
				if(!index[item.data.parentItem][CHILD_OTHER]) {
					index[item.data.parentItem][CHILD_OTHER] = [];
				}
				index[item.data.parentItem][CHILD_OTHER].push(item);
			}
		}
	}
	return response;
}

/**
 * Recursively fetch data until there's no more rel="next" url in Link header
 * @param  {String} url             - An url for initial data request
 * @param  {Object} [options]       - Custom settings (e.g. headers) passed over to fetch() for each request
 * @param  {Object[]} [jsondata=[]] - Used for data aggregation in recursive calls
 * @return {Promise}                - Resolved with complete dataset or rejected on error
 */
export function fetchUntilExhausted(url, options, jsondata) {
	let relRegex = /<(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))>;\s*rel="next"/;
	jsondata = jsondata || [];

	return new Promise((resolve, reject) => {
		fetch(url, options).then(response => {
			if(response.status >= 200 && response.status < 300) {
				if(response.headers.has('Link')) {
					let matches = response.headers.get('Link').match(relRegex);
					if(matches && matches.length >= 2) {
						response.json().then(jsonDataPart => {
							if(!(jsonDataPart instanceof Array)) {
								jsonDataPart = [jsonDataPart];
							}
							resolve(fetchUntilExhausted(matches[1], options, _.union(jsondata, jsonDataPart)));
						});
					} else {
						response.json().then(jsonDataPart => {
							if(!(jsonDataPart instanceof Array)) {
								jsonDataPart = [jsonDataPart];
							}
							resolve(_.union(jsondata, jsonDataPart));
						});
					}
				} else {
					response.json().then(jsonDataPart => {
						if(!(jsonDataPart instanceof Array)) {
							jsonDataPart = [jsonDataPart];
						}
						resolve(_.union(jsondata, jsonDataPart));
					});
				}
			} else {
				reject(new Error(`Unexpected status code ${response.status} when requesting ${url}`));
			}
		}).catch(() => {
			reject(new Error(`Unexpected error when requesting ${url}`));
		});
	});
}
