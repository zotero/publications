import _ from 'lodash';
import Clipboard from 'clipboard';
import itemTpl from './tpl/partial/item.tpl';
import itemTemplatedTpl from './tpl/partial/item-templated.tpl';
import itemCitationTpl from './tpl/partial/item-citation.tpl';
import itemsTpl from './tpl/partial/items.tpl';
import groupTpl from './tpl/partial/group.tpl';
import groupsTpl from './tpl/partial/groups.tpl';
import brandingTpl from './tpl/partial/branding.tpl';
import exportTpl from './tpl/partial/export.tpl';
import groupViewTpl from './tpl/group-view.tpl';
import plainViewTpl from './tpl/plain-view.tpl';
import {
	GROUP_EXPANDED_SUMBOL,
	GROUP_TITLE
} from './data.js';
import {
	formatCategoryName,
	closest,
	toggleCollapse,
	showTab,
	clipboardFallbackMessage,
	once,
	transitionend
} from './utils.js';
import {
	post
} from './api.js';
import fieldMap from './field-map.js';
import typeMap from './type-map';
import hiddenFields from './hidden-fields.js';

_.templateSettings.variable = 'obj';

/**
 * Zotero Renderer constructor
 * @param {HTMLElement} container	- A container where contents is rendered
 * @param {Object} [config]			- ZoteroPublications config
 */
export function ZoteroRenderer(container, zotero) {
	this.container = container;
	this.zotero = zotero;
	this.config = zotero.config;
	this.fieldMap = fieldMap;
	this.typeMap = typeMap;
	this.hiddenFields = hiddenFields;
	if(this.config.storeCitationPreference) {
		this.preferredCitationStyle = localStorage.getItem('zotero-citation-preference');
	} else {
		this.preferredCitationStyle = '';
	}
	this.toggleSpinner(true);
}

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
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
 * Render citation part of a single Zotero using custom template
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
ZoteroRenderer.prototype.renderItemTemplated = function(zoteroItem) {
	return itemTemplatedTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render citation part of a single Zotero item using api-provided citation
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
ZoteroRenderer.prototype.renderItemCitation = function(zoteroItem) {
	return itemCitationTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render a list of Zotero items
 * @param  {Object[]} zoteroItems - List of Zotero items
 * @return {String}                          - Rendered markup of a list of Zotero items
 */
ZoteroRenderer.prototype.renderItems = function(zoteroItems) {
	return itemsTpl({
		'items': zoteroItems,
		'renderer': this
	});
};

/**
 * Render a group of Zotero items
 * @param  {Object[]} items 	- List of items for this group
 * @return {String}             - Rendered markup of a group
 */
ZoteroRenderer.prototype.renderGroup = function(items) {
	return groupTpl({
		'title': formatCategoryName(items[GROUP_TITLE]),
		'items': items,
		'expand': items[GROUP_EXPANDED_SUMBOL],
		'renderer': this
	});
};

/**
 * Renders a list of groups of Zotero items
 * @param {Object[]} 	- List of groups to render
 * @return {String} 	- Rendered markup of groups
 */
ZoteroRenderer.prototype.renderGroups = function(groups) {
	return groupsTpl({
		'groups': groups,
		'renderer': this
	});
};

/**
 * Render a Group View
 * @param {ZoteroData} 	- List of groups to render
 * @return {String} 	- Rendered markup of a complete group view
 */
ZoteroRenderer.prototype.renderGroupView = function(data) {
	return groupViewTpl({
		'groups': data,
		'renderer': this
	});
};

/**
 * Render a Plain View
 * @param  {ZoteroData} zoteroItems - List of Zotero items
 * @return {String} 	- Rendered markup of a complete plain view
 */
ZoteroRenderer.prototype.renderPlainView = function(data) {
	return plainViewTpl({
		'items': data,
		'renderer': this
	});
};

/**
 * Render Zotero branding
 * @return {String}
 */
ZoteroRenderer.prototype.renderBranding = function() {
	if(this.config.showBranding) {
		return brandingTpl();
	} else {
		return '';
	}
};

/**
 * Render Zotero publications into a DOM element
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
ZoteroRenderer.prototype.displayPublications = function(data) {
	var markup;

	this.data = data;

	if(data.grouped > 0) {
		markup = this.renderGroupView(data);
	} else {
		markup = this.renderPlainView(data);
	}


	this.container.innerHTML = markup;
	this.toggleSpinner(false);
	this.previous = markup;
	this.addHandlers();
	this.updateVisuals();
};

/**
 * Update citation and store preference in memory/local storage
 * depending on configuration
 * @param  {HTMLElement} itemEl 		- dom element containing the item
 * @param  {String} citationStyle 		- optionally set the citation style
 */
ZoteroRenderer.prototype.updateCitation = function(itemEl, citationStyle) {
	let itemId = itemEl.getAttribute('data-item');
	let citationEl = itemEl.querySelector('.zotero-citation');
	let citationStyleSelectEl = itemEl.querySelector('[data-trigger="cite-style-selection"]');

	if(citationStyle) {
		citationStyleSelectEl.value = citationStyle;
	} else {
		citationStyle = citationStyleSelectEl.options[citationStyleSelectEl.selectedIndex].value;
	}

	this.preferredCitationStyle = citationStyle;
	if(this.config.storeCitationPreference) {
		localStorage.setItem('zotero-citation-preference', citationStyle);
	}

	citationEl.innerHTML = '';
	citationEl.classList.add('zotero-loading-inline');

	this.zotero.getPublication(itemId, this.zotero.userId, {
		'citationStyle': citationStyle,
		'include': ['bib'],
		'group': false
	}).then(item => {
		citationEl.classList.remove('zotero-loading-inline');
		citationEl.innerHTML = item.raw[0].bib;
	});
};

/**
 * Prepare a link for downloading item export
 * @param {HTMLElement} [itemEl] - dom element containing the item
 */
ZoteroRenderer.prototype.prepareExport = function(itemEl) {
	let itemId = itemEl.getAttribute('data-item');
	let exportEl = itemEl.querySelector('.zotero-export');
	let exportFormatSelectEl = itemEl.querySelector('[data-trigger="export-format-selection"]');
	let exportFormat = exportFormatSelectEl.options[exportFormatSelectEl.selectedIndex].value;

	exportEl.innerHTML = '';
	exportEl.classList.add('zotero-loading-inline');

	this.zotero.getItem(itemId, this.zotero.userId, {
		'include': [exportFormat],
		'group': false
	}).then(item => {
		let itemData = (_.findWhere || _.find)(this.data.raw, {'key': itemId});
		let encoded = window.btoa(item.raw[0][exportFormat]);
		exportEl.classList.remove('zotero-loading-inline');
		exportEl.innerHTML = exportTpl({
			'filename': itemData.data.title + '.' + this.zotero.config.exportFormats[exportFormat].extension,
			'content': encoded,
			'contentType': this.zotero.config.exportFormats[exportFormat].contentType
		});
	});
};

/**
 * Attach interaction handlers
 */
ZoteroRenderer.prototype.addHandlers = function() {
	let clipboard = new Clipboard('.zotero-citation-copy');

	clipboard.on('success', function(e) {
		e.clearSelection();
		e.trigger.setAttribute('aria-label', 'Copied!');
	});

	clipboard.on('error', function(e) {
		e.trigger.setAttribute('aria-label', clipboardFallbackMessage(e.action));
	});

	this.container.addEventListener('mouseout', ev => {
		if(ev.target.classList.contains('zotero-citation-copy')) {
			ev.target.blur();
			ev.target.setAttribute('aria-label', 'Copy to clipboard');
		}
	});

	this.container.addEventListener('click', ev => {
		var target;

		target = closest(ev.target, el => el.hasAttribute && el.hasAttribute('data-trigger'));

		if(target) {
			ev.preventDefault();
			let itemEl = closest(target, el => el.hasAttribute && el.hasAttribute('data-item'));
			if(target.getAttribute('data-trigger') === 'details') {
				this.toggleDetails(itemEl);
			} else if(target.getAttribute('data-trigger') === 'cite' || target.getAttribute('data-trigger') === 'export') {
				showTab(target);
			} else if(target.getAttribute('data-trigger') === 'add-to-library') {
				if(this.zotero.config.zorgIntegration) {
					this.saveToMyLibrary(target, itemEl);
				}
			}
		}
	});

	this.container.addEventListener('change', ev => {
		let target = closest(ev.target, el => el.hasAttribute && el.hasAttribute('data-trigger'));
		let itemEl = closest(target, el => el.hasAttribute && el.hasAttribute('data-item'));
		if(target.getAttribute('data-trigger') === 'cite-style-selection') {
			this.updateCitation(itemEl);
		} else if(target.getAttribute('data-trigger') === 'export-format-selection') {
			this.prepareExport(itemEl);
		}
	});

	window.addEventListener('resize', _.debounce(this.updateVisuals).bind(this));
};

/**
 * Update .zotero-line to align with left border of the screen on small
 * devices, provided that the container is no more than 30px from the
 * border (and no less than 4px required for the actual line and 1px space)
 */
ZoteroRenderer.prototype.updateVisuals = function() {
	if(!this.zoteroLines) {
		this.zoteroLines = this.container.querySelectorAll('.zotero-line');
	}

	_.each(this.zoteroLines, zoteroLineEl => {
		let offset = `${this.container.offsetLeft * -1}px`;
		if(window.innerWidth < 768 && this.container.offsetLeft <= 30 && this.container.offsetLeft > 3) {
			zoteroLineEl.style.left = offset;
		} else {
			zoteroLineEl.style.left = null;
		}
	});
};


/**
 * Toggle CSS class that gives a visual loading feedback. Optionally allows to explicetly specify
 * whether to display or hide visual feedback.
 * @param  {boolean} [activate]    - Explicitely indicate whether to add or remove visual feedback
 */
ZoteroRenderer.prototype.toggleSpinner = function (activate) {
	var method = activate === null ? this.container.classList.toggle : activate ? this.container.classList.add : this.container.classList.remove;
	method.call(this.container.classList, 'zotero-loading');
};


/**
 * Expand (if collapsed) or collapse (if expanded) item details. Optionally override to force
 * either expand or collapse
 * @param  {HTMLElement} itemEl 	- DOM element where item is
 * @param  {boolean} override 		- override whether to expand or collapse details
 */
ZoteroRenderer.prototype.toggleDetails = function(itemEl, override) {
	let detailsEl = itemEl.querySelector('.zotero-details');
		if(detailsEl) {
			let expanded = toggleCollapse(detailsEl, override);
			if(expanded) {
				this.prepareExport(itemEl);
				this.updateCitation(itemEl, this.preferredCitationStyle);
				itemEl.classList.add('zotero-details-open')
			} else {
				itemEl.classList.remove('zotero-details-open');
			}
		}
	if(this.config.useHistory) {
		window.history.pushState(null, null, `#${itemEl.getAttribute('data-item')}`);
	}
}

/**
 * Expand item details based on the item id.
 * @param  {string} itemId
 */
ZoteroRenderer.prototype.expandDetails = function(itemId) {
	let itemEl = document.getElementById(itemId);
	this.toggleDetails(itemEl, true);
	once(itemEl, transitionend(), () => {
		itemEl.scrollIntoView();
	});
}


/**
 * On Zotero.org adds item to currently logged-in user's library
 * @param  {HTMLElement} triggerEl 	- DOM Element that triggered saving, usually a button
 * @param  {HTMLElement} itemEl 	- DOM element where the item is located
 */
ZoteroRenderer.prototype.saveToMyLibrary = function(triggerEl, itemEl) {
	triggerEl.innerText = 'Saving...';
	triggerEl.removeAttribute('data-trigger');
	let itemId = itemEl.getAttribute('data-item');
	let sourceItem = (_.findWhere || _.find)(this.data.raw, {'key': itemId});
	let clonedItem = {};
	let ignoredFields = [
		'mimeType',
		'linkMode',
		'charset',
		'md5',
		'mtime',
		'version',
		'key',
		'collections',
		'parentItem',
		'contentType',
		'filename',
		'tags',
		'dateAdded',
		'dateModified'
	];

	_.forEach(sourceItem.data, (value, key) => {
		if(!_.includes(ignoredFields, key)) {
			clonedItem[key] = value;
		}
	});

	if(!clonedItem.relations) {
		clonedItem.relations = {};
	}
	// console.info(clonedItem);
	// debugger;
	clonedItem.relations = {
		'owl:sameAs': `http://zotero.org/publications/${sourceItem.library.id}/items/${itemId}`
	};

	let writePromise = this.zotero.postItems(
		this.zotero.config.zorgIntegration.userID,
		[clonedItem],
		{ key: this.zotero.config.zorgIntegration.apiKey }
	);

	writePromise.then(() => {
		triggerEl.innerText = 'Saved!';
	});
	writePromise.catch(() => {
		triggerEl.innerText = 'Error!';
		triggerEl.setAttribute('data-trigger', 'add-to-library');
		setTimeout(() => {
			triggerEl.innerText = 'Add to Library';
		}, 2000);
	});
}
