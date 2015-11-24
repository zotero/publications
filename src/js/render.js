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

export function renderItem(zoteroItem, childItemsMarkup) {
	return itemTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'childItemsMarkup': childItemsMarkup || ''
	});
}

export function renderCollection(zoteroItems) {
	let itemsMarkup = '';

	for (let item of zoteroItems) {
		let childItemsMarkup = renderChildItems(item);
		itemsMarkup += renderItem(item, childItemsMarkup);
	}

	return itemsTpl({
		'zoteroItems': itemsMarkup
	});
}

export function renderChildItem(zoteroChildItem) {
	return childItemTpl({
		'item': zoteroChildItem
	});
}

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

export function renderGroup(title, expand, itemsMarkup) {
	return groupTpl({
		'title': title,
		'itemsMarkup': itemsMarkup,
		'expand': expand
	});
}

export function renderGrouped(data) {
	let groupsMarkup = '';

	for(let [ groupTitle, group ] of data) {
		let itemsMarkup = renderCollection(group);
		let expand = group[GROUP_EXPANDED_SUMBOL];
		groupsMarkup += renderGroup(groupTitle, expand, itemsMarkup);
	}

	return groupsTpl({
		'groupsMarkup': groupsMarkup
	});
}

export function renderPublications(container, data) {
	var markup;

	if(data.grouped > 0) {
		markup = renderGrouped(data) + brandingTpl();
	} else {
		markup = renderCollection(data) + brandingTpl();
	}

	container.innerHTML = markup;
	addHandlers(container);
}
