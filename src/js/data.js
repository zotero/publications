require('es6-symbol/implement');
import _ from 'lodash';
import {
	processResponse
} from './api.js';

export const GROUPED_NONE = 0;
export const GROUPED_BY_TYPE = 1;
export const GROUPED_BY_COLLECTION = 2;
export const CHILD_NOTES = Symbol.for('childNotes');
export const CHILD_ATTACHMENTS = Symbol.for('childAttachments');
export const CHILD_OTHER = Symbol.for('childOther');
export const GROUP_EXPANDED_SUMBOL = Symbol.for('groupExpanded');
export const GROUP_TITLE = Symbol.for('groupTitle');

/**
 * Store, Encapsulate and Manipulate Zotero API data
 * @param {Object[]} data   - Zotero API data to encapsulate
 * @param {Object} [config] - ZoteroPublications config
 */
export function ZoteroData(data, config) {
	this.raw = this.data = processResponse(data, config);
	this.grouped = GROUPED_NONE;

	Object.defineProperty(this, 'length', {
		enumerable: false,
		configurable: false,
		get: function() {
			return this.data.length;
		}
	});
}

/**
 * Group data by type
 * @param  {String|String[]} [expand=[]] - List of types which should appear pre-expanded.
 *                                         Alternatively string "all" is accepted.
 */
ZoteroData.prototype.groupByType = function(expand) {
	let groupedData = {};
	expand = expand || [];
	for(let i = this.raw.length; i--; ) {
		let item = this.raw[i];

		if(!groupedData[item.data.itemType]) {
			groupedData[item.data.itemType] = [];
		}
		groupedData[item.data.itemType].push(item);
		groupedData[item.data.itemType][GROUP_EXPANDED_SUMBOL] = expand === 'all' || _.contains(expand, item.data.itemType);
	}
	this.data = groupedData;
	this.grouped = GROUPED_BY_TYPE;
};

/**
 * Group data by top-level collections
 */
ZoteroData.prototype.groupByCollections = function() {
	throw new Error('groupByCollections is not implemented yet.');
};

/**
 * Custom iterator to allow for..of interation regardless of whether data is grouped or not.
 * For ungrouped data each interation returns single Zotero item
 * For grouped data each iternation returns a group of Zotero items. Additionaly group name
 * is available under GROUP_TITLE Symbol
 */
ZoteroData.prototype[Symbol.iterator] = function () {
	let i = 0;
	if(this.grouped > 0) {
		let keys = Object.keys(this.data);
		return {
			next: function() {
				let group = this.data[keys[i]];
				group[GROUP_TITLE] = keys[i];
				return {
					value: group,
					done: ++i === keys.length
				};
			}.bind(this)
		};
	} else {
		return {
			next: function() {
				return {
					value: i < this.data.length ? this.data[i] : null,
					done: i++ >= this.data.length
				};
			}.bind(this)
		};
	}
};
