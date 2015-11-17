import itemTpl from './tpl/publication-item.tpl';
import listTpl from './tpl/publication-collection.tpl';
import childItemsTpl from './tpl/publication-child-items.tpl';
import childItemTpl from './tpl/publication-child-item.tpl';

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

	return listTpl({
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
