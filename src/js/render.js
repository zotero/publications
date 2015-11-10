import itemTpl from './tpl/publication-item.tpl';
import listTpl from './tpl/publication-collection.tpl';

export function renderItem(itemData, template) {
	template = template || itemTpl;
	return template(itemData);
}

export function renderCollection(zoteroItems, template) {
	template = template || listTpl;
	let itemsMarkup = '';

	for (let item of zoteroItems) {
		itemsMarkup += renderItem(item);
	}

	return template({'zoteroItems': itemsMarkup});
}

export function renderPublications(container, data) {
	let collectionMarkup = renderCollection(data);
	container.innerHTML = collectionMarkup;
}
