import _find from 'lodash/find';
import _debounce from 'lodash/debounce';
import _each from 'lodash/each';
import includes from 'lodash/includes';
import Clipboard from 'clipboard';
import ZoteroRenderer from './renderer';
import exportTpl from './tpl/partial/export';
import constants from './constants';
import utils, { closest, toggleCollapse, showTab, clipboardFallbackMessage, onTransitionEnd } from './utils';

/**
 * Constructor for the Dom Wrapper
 * Dom Wrapper's function is to place rendered Zotero Publications
 * into a DOM container and handle events
 * @param {HTMLElement} container				- A container where contents is rendered
 * @param {ZoteroPublications} [zotero]			- ZoteroPublications object
 */
function DomWrapper(container, zotero) {
	this.container = container;
	this.zotero = zotero;
	this.config = zotero.config;
	this.renderer = new ZoteroRenderer(zotero);
	if(this.config.storeCitationPreference) {
		this.preferredCitationStyle = localStorage.getItem('zotero-citation-preference');
	} else {
		this.preferredCitationStyle = '';
	}
	this.toggleSpinner(true);
}

/**
 * Render Zotero publications into a DOM element
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
DomWrapper.prototype.displayPublications = function(data) {
	var markup;

	this.renderer.data = this.data = data;

	if(data.grouped > 0) {
		markup = this.renderer.renderGroupView(data);
	} else {
		markup = this.renderer.renderPlainView(data);
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
DomWrapper.prototype.updateCitation = function(itemEl, citationStyle) {
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

	return new Promise((resolve, reject) => {
		this.zotero.getPublication(itemId, this.zotero.userId, {
			'style': citationStyle,
			'include': ['bib'],
			'group': false
		}).then(item => {
			citationEl.classList.remove('zotero-loading-inline');
			citationEl.innerHTML = item.raw[0].bib;
			resolve();
		}).catch(reject);
	});
};

/**
 * Prepare a link for downloading item export
 * @param {HTMLElement} [itemEl] - dom element containing the item
 */
DomWrapper.prototype.prepareExport = function(itemEl) {
	let itemId = itemEl.getAttribute('data-item');
	let exportEl = itemEl.querySelector('.zotero-export');
	let exportFormatSelectEl = itemEl.querySelector('[data-trigger="export-format-selection"]');
	let exportFormat = exportFormatSelectEl.options[exportFormatSelectEl.selectedIndex].value;

	exportEl.innerHTML = '';
	exportEl.classList.add('zotero-loading-inline');

	this.zotero.getPublication(itemId, this.zotero.userId, {
		'include': [exportFormat],
		'group': false
	}).then(item => {
		let itemData = _find(this.data.raw, {'key': itemId});
		let encoded = window.btoa(unescape(encodeURIComponent(item.raw[0][exportFormat])));
		exportEl.classList.remove('zotero-loading-inline');
		exportEl.innerHTML = exportTpl({
			'filename': itemData.data.title + '.' + this.zotero.config.exportFormats[exportFormat].extension,
			'content': encoded,
			'contentType': this.zotero.config.exportFormats[exportFormat].contentType,
			constants, utils
		});
	});
};

/**
 * Attach interaction handlers
 */
DomWrapper.prototype.addHandlers = function() {
	let clipboard = new Clipboard('.zotero-citation-copy');

	Array.from(this.container.querySelectorAll('.zotero-details.zotero-collapsable'))
		.forEach(element => {
			element.style.height = 0 + 'px';
			element.setAttribute('data-collapsed', 'true');
		});

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
			} else if(target.getAttribute('data-trigger') === 'expand-authors') {
				let creatorsEl = closest(target, el => el.classList.contains('zotero-creators'));
				creatorsEl.classList.add('zotero-creators-expanded');
				target.parentNode.removeChild(target);
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

	window.addEventListener('resize', _debounce(this.updateVisuals).bind(this));
};

/**
 * Update .zotero-line to align with left border of the screen on small
 * devices, provided that the container is no more than 30px from the
 * border (and no less than 4px required for the actual line and 1px space)
 */
DomWrapper.prototype.updateVisuals = function() {
	if(!this.zoteroLines) {
		this.zoteroLines = this.container.querySelectorAll('.zotero-line');
	}

	_each(this.zoteroLines, zoteroLineEl => {
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
DomWrapper.prototype.toggleSpinner = function (activate) {
	var method = activate === null ? this.container.classList.toggle : activate ? this.container.classList.add : this.container.classList.remove;
	method.call(this.container.classList, 'zotero-loading');
};


/**
 * Expand (if collapsed) or collapse (if expanded) item details. Optionally override to force
 * either expand or collapse
 * @param  {HTMLElement} itemEl 	- DOM element where item is
 * @param  {boolean} override 		- override whether to expand or collapse details
 */
DomWrapper.prototype.toggleDetails = function(itemEl, override) {
	let detailsEl = itemEl.querySelector('.zotero-details');
		if(detailsEl) {
			let expanded = toggleCollapse(detailsEl, override);
			if(expanded) {
				itemEl.classList.add('zotero-details-open')
				if(this.zotero.userId) {
					this.prepareExport(itemEl);
					this.updateCitation(itemEl, this.preferredCitationStyle);
				}
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
DomWrapper.prototype.expandDetails = function(itemId) {
	return new Promise((resolve) => {
		let itemEl = this.container.querySelector(`[id=item-${itemId}]`);
		this.toggleDetails(itemEl, true);
		onTransitionEnd(itemEl, () => {
			itemEl.scrollIntoView();
			resolve();
		}, 500);
	});
}


/**
 * On Zotero.org adds item to currently logged-in user's library
 * @param  {HTMLElement} triggerEl 	- DOM Element that triggered saving, usually a button
 * @param  {HTMLElement} itemEl 	- DOM element where the item is located
 */
DomWrapper.prototype.saveToMyLibrary = function(triggerEl, itemEl) {
	let replacementEl = document.createElement('span');
	replacementEl.innerText = 'Adding...';
	triggerEl.parentNode.replaceChild(replacementEl, triggerEl);
	let itemId = itemEl.getAttribute('data-item');
	let sourceItem = _find(this.data.raw, {'key': itemId});
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

	_each(sourceItem.data, (value, key) => {
		if(!includes(ignoredFields, key)) {
			clonedItem[key] = value;
		}
	});

	if(!clonedItem.relations) {
		clonedItem.relations = {};
	}
	clonedItem.relations = {
		'owl:sameAs': `http://zotero.org/users/${sourceItem.library.id}/publications/items/${itemId}`
	};


	let writePromise = this.zotero.postItems(
		this.zotero.config.zorgIntegration.userID,
		[clonedItem],
		{ key: this.zotero.config.zorgIntegration.apiKey }
	);

	return new Promise((resolve, reject) => {
		writePromise.then(() => {
			replacementEl.innerText = 'Added.';
			resolve();
		});
		writePromise.catch((err) => {
			replacementEl.innerText = 'Error!';
			setTimeout(() => {
				replacementEl.parentNode.replaceChild(triggerEl, replacementEl);
			}, 2000);
			reject(err);
		});
	});
}

export default DomWrapper;
