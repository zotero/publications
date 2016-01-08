import itemTpl from './tpl/item.tpl';
import itemsTpl from './tpl/items.tpl';
import groupTpl from './tpl/group.tpl';
import groupsTpl from './tpl/groups.tpl';
// import childItemsTpl from './tpl/child-items.tpl';
// import childItemTpl from './tpl/child-item.tpl';
import brandingTpl from './tpl/branding.tpl';
import {
	addHandlers
} from './ui.js';
import {
	GROUP_EXPANDED_SUMBOL,
	GROUP_TITLE
} from './data.js';

export function ZoteroRenderer(config) {
	this.config = config;
}

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @param  {String} childItemsMarkup - Rendered markup of a list of Zotero child items
 * @return {String}                  - Rendered markup of a Zotero item
 */
ZoteroRenderer.prototype.renderItem = function(zoteroItem) {
	return itemTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render a list of Zotero items
 * @param  {ZoteroData|Object[]} zoteroItems - List of Zotero items
 * @return {String}                          - Rendered markup of a list of Zotero items
 */
ZoteroRenderer.prototype.renderItems = function(zoteroItems) {
	return itemsTpl({
		'items': zoteroItems,
		'renderer': this
	});
};

/**
 * Render single Zotero child item
 * @param  {Object[]} zoteroChildItem - List of Zotero child items
 * @return {String}                   - Rendered markup of a Zotero child item
 */
// ZoteroRenderer.prototype.renderChildItem = function(zoteroChildItem) {
// 	return childItemTpl({
// 		'item': zoteroChildItem
// 	});
// };

/**
 * Render list of Zotero child items
 * @param  {Object} zoteroItem - Parent Zotero item
 * @return {String}            - Rendered markup of a list of Zotero child items
 */
// ZoteroRenderer.prototype.renderChildItems = function(zoteroItem) {
// 	let childItemsMarkup = '';

// 	if(zoteroItem[CHILD_ITEMS_SYMBOL] && zoteroItem[CHILD_ITEMS_SYMBOL].length > 0) {
// 		for (let childItem of zoteroItem[CHILD_ITEMS_SYMBOL]) {
// 			childItemsMarkup += this.renderChildItem(childItem);
// 		}
// 	}

// 	return childItemsTpl({
// 		'childItemsMarkup': childItemsMarkup
// 	});
// };

/**
 * Render an expandable group of Zotero items
 * @param  {String} title       - A title of a group
 * @param  {boolean} expand     - Indicates whether group should appear pre-expanded
 * @param  {String} itemsMarkup - Rendered markup of underlying list of Zotero items
 * @return {String}             - Rendered markup of a group
 */
ZoteroRenderer.prototype.renderGroup = function(items) {
	console.log(items);
	return groupTpl({
		'title': items[GROUP_TITLE],
		'items': items,
		'expand': items[GROUP_EXPANDED_SUMBOL],
		'renderer': this
	});
};

/**
 * Render a list of groups of Zotero items
 * @param  {ZoteroData|Object} data - Grouped data where each key is a group titles and
 *                                    each value is an array Zotero items
 * @return {String}                 - Rendered markup of a list of groups
 */
ZoteroRenderer.prototype.renderGroups = function(data) {
	// let groupsMarkup = '';

	// for(let [ groupTitle, group ] of data) {
	// 	let itemsMarkup = this.renderItems(group);
	// 	let expand = group[GROUP_EXPANDED_SUMBOL];
	// 	groupsMarkup += this.renderGroup(groupTitle, expand, itemsMarkup);
	// }

	console.warn(data);
	
	return groupsTpl({
		'groups': data,
		'renderer': this
	});
};

/**
 * [renderBranding description]
 * @return {[type]} [description]
 */
ZoteroRenderer.prototype.renderBranding = function() {
	return brandingTpl();
};

/**
 * Render Zotero publications into a DOM element
 * @param  {HTMLElement} container - DOM element of which contents is to be replaced
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
ZoteroRenderer.prototype.renderPublications = function(container, data) {
	var markup;

	if(data.grouped > 0) {
		markup = this.renderGroups(data);
	} else {
		markup = this.renderItems(data);
	}

	container.innerHTML = markup;
	addHandlers(container);
};
