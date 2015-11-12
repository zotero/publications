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
	container.addEventListener('click', function(ev) {
		if(ev.target.classList.contains('zotero-abstract-toggle')) {
			let abstractShortEl = ev.target.parentNode.parentNode.querySelector('.zotero-abstract-short');
			let abstractEl = ev.target.parentNode.parentNode.querySelector('.zotero-abstract');
			let expanded = abstractShortEl.classList.toggle('zotero-abstract-expanded');
			abstractEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	});
}
