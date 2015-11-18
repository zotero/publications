import _ from '../../bower_components/lodash/lodash.js';
import itemTpl from './tpl/item.tpl';
import itemsTpl from './tpl/items.tpl';
import groupTpl from './tpl/group.tpl';
import groupsTpl from './tpl/groups.tpl';
import childItemsTpl from './tpl/child-items.tpl';
import childItemTpl from './tpl/child-item.tpl';

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

	if(zoteroItem.childItems && zoteroItem.childItems.length > 0) {
		for (let childItem of zoteroItem.childItems) {
			childItemsMarkup += renderChildItem(childItem);
		}
	}

	return childItemsTpl({
		'childItemsMarkup': childItemsMarkup
	});
}

export function renderGroup(title, itemsMarkup) {
	return groupTpl({
		'title': title,
		'itemsMarkup': itemsMarkup
	});
}

export function renderGrouped(data) {
	let groupsMarkup = '';

	_.forEach(data, function(items, groupTitle) {
		let itemsMarkup = renderCollection(items);
		groupsMarkup += renderGroup(groupTitle, itemsMarkup);
	});

	return groupsTpl({
		'groupsMarkup': groupsMarkup
	});
}

export function renderPublications(container, data) {
	let collectionMarkup = renderCollection(data);
	container.innerHTML = collectionMarkup;
	container.addEventListener('click', function(ev) {
		if(ev.target.classList.contains('zotero-abstract-toggle')) {
			let abstractShortEl = ev.target.parentNode.parentNode.querySelector('.zotero-abstract-short');
			let abstractEl = ev.target.parentNode.parentNode.querySelector('.zotero-abstract');
			let expanded = abstractShortEl.classList.toggle('zotero-abstract-expanded');
			abstractEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	});
}

export function renderGroupedPublications(container, data) {
	let markup = renderGrouped(data);
	container.innerHTML = markup;
}
