import itemTpl from './tpl/item.tpl';
import itemsTpl from './tpl/items.tpl';
import groupTpl from './tpl/group.tpl';
import groupsTpl from './tpl/groups.tpl';
import childItemsTpl from './tpl/child-items.tpl';
import childItemTpl from './tpl/child-item.tpl';
import brandingTpl from './tpl/branding.tpl';
import {
	addHandlers
} from './ui.js';
import {
	CHILD_ITEMS_SYMBOL,
	GROUP_EXPANDED_SUMBOL
} from './data.js';

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @param  {String} childItemsMarkup - Rendered markup of a list of Zotero child items
 * @return {String}                  - Rendered markup of a Zotero item
 */
export function renderItem(zoteroItem, childItemsMarkup) {
	return itemTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'childItemsMarkup': childItemsMarkup || ''
	});
}

/**
 * Render a list of Zotero items
 * @param  {ZoteroData|Object[]} zoteroItems - List of Zotero items
 * @return {String}                          - Rendered markup of a list of Zotero items
 */
export function renderItems(zoteroItems) {
	let itemsMarkup = '';

	for (let item of zoteroItems) {
		let childItemsMarkup = renderChildItems(item);
		itemsMarkup += renderItem(item, childItemsMarkup);
	}

	return itemsTpl({
		'zoteroItems': itemsMarkup
	});
}

/**
 * Render single Zotero child item
 * @param  {Object[]} zoteroChildItem - List of Zotero child items
 * @return {String}                   - Rendered markup of a Zotero child item
 */
export function renderChildItem(zoteroChildItem) {
	return childItemTpl({
		'item': zoteroChildItem
	});
}

/**
 * Render list of Zotero child items
 * @param  {Object} zoteroItem - Parent Zotero item
 * @return {String}            - Rendered markup of a list of Zotero child items
 */
export function renderChildItems(zoteroItem) {
	let childItemsMarkup = '';

	if(zoteroItem[CHILD_ITEMS_SYMBOL] && zoteroItem[CHILD_ITEMS_SYMBOL].length > 0) {
		for (let childItem of zoteroItem[CHILD_ITEMS_SYMBOL]) {
			childItemsMarkup += renderChildItem(childItem);
		}
	}

	return childItemsTpl({
		'childItemsMarkup': childItemsMarkup
	});
}

/**
 * Render an expandable group of Zotero items
 * @param  {String} title       - A title of a group
 * @param  {boolean} expand     - Indicates whether group should appear pre-expanded
 * @param  {String} itemsMarkup - Rendered markup of underlying list of Zotero items
 * @return {String}             - Rendered markup of a group
 */
export function renderGroup(title, expand, itemsMarkup) {
	return groupTpl({
		'title': title,
		'itemsMarkup': itemsMarkup,
		'expand': expand
	});
}

/**
 * Render a list of groups of Zotero items
 * @param  {ZoteroData|Object} data - Grouped data where each key is a group titles and
 *                                    each value is an array Zotero items
 * @return {String}                 - Rendered markup of a list of groups
 */
export function renderGrouped(data) {
	let groupsMarkup = '';

	for(let [ groupTitle, group ] of data) {
		let itemsMarkup = renderItems(group);
		let expand = group[GROUP_EXPANDED_SUMBOL];
		groupsMarkup += renderGroup(groupTitle, expand, itemsMarkup);
	}

	return groupsTpl({
		'groupsMarkup': groupsMarkup
	});
}

/**
 * Render Zotero publications into a DOM element
 * @param  {HTMLElement} container - DOM element of which contents is to be replaced
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
export function renderPublications(container, data) {
	var markup;

	if(data.grouped > 0) {
		markup = renderGrouped(data) + brandingTpl();
	} else {
		markup = renderItems(data) + brandingTpl();
	}

	container.innerHTML = markup;
	addHandlers(container);
}
