import _ from 'lodash';
import itemTpl from './tpl/partial/item.tpl';
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
	selectText,
	toggleCollapse
} from './utils.js';

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
	if(this.config.storeCitationPreference) {
		this.preferredCitationStyle = localStorage.getItem('zotero-citation-preference');
	} else {
		this.preferredCitationStyle = this.config.citationStyle;
	}
	this.toggleSpinner(true);
}

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
ZoteroRenderer.prototype.renderItem = function(zoteroItem) {
	var citationPreference;

	return itemTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this,
		'citationPreference': citationPreference
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
 * @param {Object[]} 	- List of groups to render
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
 * @param  {Object[]} zoteroItems - List of Zotero items
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
	return brandingTpl();
};

/**
 * Render Zotero publications into a DOM element
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
ZoteroRenderer.prototype.displayPublications = function(data) {
	var markup;

	if(data.grouped > 0) {
		markup = this.renderGroupView(data);
	} else {
		markup = this.renderPlainView(data);
	}

	this.data = data;
	this.container.innerHTML = markup;
	this.toggleSpinner(false);
	this.previous = markup;
	this.addHandlers();
};

/**
 * Update citation and store preference in memory/local storage
 * depending on configuration
 * @param  {HTMLElement} itemEl 		- dom element containing the item
 * @param  {String} citationStyle 		- optionally set the citation style
 */
ZoteroRenderer.prototype.updateCitation = function(itemEl, citationStyle) {
	let itemId = itemEl.dataset.item;
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

	this.zotero.getItem(itemId, this.zotero.userId, {'citationStyle': citationStyle}).then(function(item) {
		citationEl.classList.remove('zotero-loading-inline');
		citationEl.innerHTML = item.raw[0].citation;
		selectText(citationEl);
	});
};

/**
 * Prepare a link for downloading item export
 */
ZoteroRenderer.prototype.prepareExport = function(itemEl) {
	let itemId = itemEl.dataset.item;
	let exportEl = itemEl.querySelector('.zotero-export');
	let exportFormatSelectEl = itemEl.querySelector('[data-trigger="export-format-selection"]');
	let exportFormat = exportFormatSelectEl.options[exportFormatSelectEl.selectedIndex].value;

	exportEl.innerHTML = '';
	exportEl.classList.add('zotero-loading-inline');

	this.zotero.getItem(itemId, this.zotero.userId, {'include': ['data', 'citation', exportFormat]}).then(function(item) {
		exportEl.classList.remove('zotero-loading-inline');
		exportEl.innerHTML = exportTpl({
			'filename': item.raw[0].data.title,
			'content': item.raw[0][exportFormat]
		});
	});
};

/**
 * Attach interaction handlers
 */
ZoteroRenderer.prototype.addHandlers = function() {
	this.container.addEventListener('click', ev => {
		var target;

		target = closest(ev.target, el => el.dataset && el.dataset.trigger === 'details');
		if(target) {
			let itemEl = closest(target, el => el.dataset && el.dataset.item);
			let detailsEl = itemEl.querySelector('.zotero-details');
			if(detailsEl) {
				toggleCollapse(detailsEl);
			}
			window.history.pushState(null, null, `#${itemEl.dataset.item}`);
			ev.preventDefault();
			return;
		}
		target = closest(ev.target, el => el.dataset && el.dataset.trigger === 'cite');
		if(target) {
			let itemEl = closest(target, el => el.dataset && el.dataset.item);
			let citeContainerEl = itemEl.querySelector('.zotero-cite-container');
			let exportContainerEl = itemEl.querySelector('.zotero-export-container');
			if(citeContainerEl) {
				let expanding = toggleCollapse(citeContainerEl);
				if(expanding) {
					this.updateCitation(itemEl, this.preferredCitationStyle);
					toggleCollapse(exportContainerEl, false);
				}
			}
		}
		target = closest(ev.target, el => el.dataset && el.dataset.trigger === 'export');
		if(target) {
			let itemEl = closest(target, el => el.dataset && el.dataset.item);
			let citeContainerEl = itemEl.querySelector('.zotero-cite-container');
			let exportContainerEl = itemEl.querySelector('.zotero-export-container');
			if(exportContainerEl) {
				let expanding = toggleCollapse(exportContainerEl);
				if(expanding) {
					this.prepareExport(itemEl);
					toggleCollapse(citeContainerEl, false);
				}
			}
		}
	});

	this.container.addEventListener('change', ev => {
		var target;

		target = closest(ev.target, el => el.dataset && el.dataset.trigger === 'cite-style-selection');
		if(target) {
			let itemEl = closest(target, el => el.dataset && el.dataset.item);
			this.updateCitation(itemEl);
		}

		target = closest(ev.target, el => el.dataset && el.dataset.trigger === 'export-format-selection');
		if(target) {
			let itemEl = closest(target, el => el.dataset && el.dataset.item);
			this.prepareExport(itemEl);
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
