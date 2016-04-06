import _ from 'lodash';
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


/**
 * Parse iso date and format it in a simple way
 * @param  {String} isoDate - date in iso format
 * @return {String}         - formatted date
 */
export function formatDate(isoDate) {
	let matches = isoDate.match(/(\d{4})\-?(\d{2})?-?(\d{2})?/);
	let date = isoDate;

	if(matches.length >= 4) {
		let year = matches[1];
		let month = months[parseInt(matches[2], 10) - 1];
		let day = parseInt(matches[3], 10);
		date = `${month} ${day}, ${year}`;
	}
	if(matches.length >= 3) {
		let year = matches[1];
		let month = months[parseInt(matches[2], 10) - 1];
		date = `${month} ${year}`;
	}
	if(matches.length >= 2) {
		date = matches[1];
	}

	return date;
}

export function formatAbstract(abstract) {
	return abstract.replace(/(^|\n)([\s\S]*?)(\n|$)/g, '<p>$2</p>');
}

/**
 * Formats category name
 * @param  {String} name 	- unformatted name
 * @return {String}      	- formatted name
 */
export function formatCategoryName(name) {
	name = name.replace(/(?! )[A-Z]/g, ' $&');
	return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Finds the first element that pasess function test by testing the element itself
 * and traversing up
 * @param  {HTMLElement}   el 	- A DOM element from which tracersing begins
 * @param  {Function} fn 		- Function that tests if element is suitable
 * @return {HTMLElement}		- First element that passes the test
 */
export function closest(el, fn) {
	return el && (fn(el) ? el : closest(el.parentNode, fn));
}

/**
 * Register a one-time event listener.
 *
 * @param {EventTarget} target
 * @param {String} type
 * @param {Function} listener
 * @returns {Function} deregister
 */
export function once(target, type, listener) {
	function deregister() {
		target.removeEventListener(type, handler); // eslint-disable-line no-use-before-define
	}

	function handler() {
		deregister();
		return listener.apply(this, arguments);
	}

	target.addEventListener(type, handler);

	return deregister;
}

/**
 * Uniquely and pernamently identify a DOM element even if it has no id
 * @param  {HTMLElement} target - DOM element to identify
 * @return {String} 			- unique identifier
 */
export function id(target) {
	target.id = target.id || _.uniqueId('zotero-element-');
	return target.id;
}


/**
 * Finds a correct name of a transitionend event
 * @return {String} 	- transitionend event name
 */
export function transitionend() {
	var i,
		el = document.createElement('div'),
		transitions = {
			'transition': 'transitionend',
			'OTransition': 'otransitionend',
			'MozTransition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd'
		};

	for (i in transitions) {
		if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
			return transitions[i];
		}
	}
}

var collapsesInProgress = {};

function collapse(element) {
	let initialHeight = window.getComputedStyle(element).height;
	element.style.height = initialHeight;
	//repaint shenanigans
	element.offsetHeight; // eslint-disable-line no-unused-expressions

	_.defer(() => {
		element.classList.add('zotero-collapsed', 'zotero-collapsing');
		element.style.height = null;
		collapsesInProgress[id(element)] = once(element, transitionend(), () => {
			element.classList.remove('zotero-collapsing');
			element.setAttribute('aria-hidden', 'true');
			element.setAttribute('aria-expanded', 'true');
			delete collapsesInProgress[id(element)];
		});
	});
}

function uncollapse(element) {
	element.classList.remove('zotero-collapsed');
	let targetHeight = window.getComputedStyle(element).height;
	element.classList.add('zotero-collapsed');

	_.defer(() => {
		element.classList.add('zotero-collapsing');
		element.style.height = targetHeight;
		collapsesInProgress[id(element)] = once(element, transitionend(), () => {
			element.classList.remove('zotero-collapsed', 'zotero-collapsing');
			element.setAttribute('aria-hidden', 'false');
			element.setAttribute('aria-expanded', 'false');
			element.style.height = null;
			delete collapsesInProgress[id(element)];
		});
	});
}

/**
 * Collpases or uncollapses a DOM element
 * @param  {HTMLElement} element 	- DOM element to be (un)collapsed
 */
export function toggleCollapse(element, override) {
	if(typeof override !== 'undefined') {
		if(collapsesInProgress[id(element)]) {
			collapsesInProgress[id(element)]();
		}
		override ? uncollapse(element) : collapse(element); // eslint-disable-line no-unused-expressions
		return override;
	}

	if(collapsesInProgress[id(element)]) {
		collapsesInProgress[id(element)]();
		let collapsing = !element.style.height;
		collapsing ? uncollapse(element) : collapse(element); // eslint-disable-line no-unused-expressions
		return collapsing;
	}
	else {
		let collapsed = element.classList.contains('zotero-collapsed');
		collapsed ? uncollapse(element) : collapse(element); // eslint-disable-line no-unused-expressions
		return collapsed;
	}
}

export function showTab(targetTabEl) {
	let tablistEl = closest(targetTabEl, el => el.getAttribute('role') === 'tablist');
	let targetTabContainer = targetTabEl.parentElement;
	let tabs = tablistEl.querySelectorAll('li.zotero-tab');
	let tabpanelId = targetTabEl.getAttribute('aria-controls');
	let targetTabPanelEl = document.getElementById(tabpanelId);
	let tabPanelsWrapper = closest(targetTabPanelEl, el => el.classList.contains('zotero-tab-content'));
	let tabPanels = tabPanelsWrapper.querySelectorAll('.zotero-tabpanel');

	_.each(tabs, tabEl => {
		tabEl.classList.remove('zotero-tab-active');
		tabEl.querySelector('a').setAttribute('aria-selected', false);
	});
	_.each(tabPanels, tabPanelEl => {
		tabPanelEl.classList.remove('zotero-tabpanel-open');
		tabPanelEl.setAttribute('aria-expanded', false);
		tabPanelEl.setAttribute('aria-hidden', true);
	});

	targetTabContainer.classList.add('zotero-tab-active');
	targetTabPanelEl.classList.add('zotero-tabpanel-open');
	targetTabPanelEl.setAttribute('aria-expanded', true);
	targetTabPanelEl.setAttribute('aria-hidden', false);
	targetTabEl.setAttribute('aria-selected', true);
}

/**
 * Returns a fallback message for a clipboard
 * @return {String} 	- a fallback message
 */
export function clipboardFallbackMessage() {
	let actionMsg = '';

	if (/Mac/i.test(navigator.userAgent)) {
		actionMsg = 'Press ⌘-C to copy';
	}
	else {
		actionMsg = 'Press Ctrl-C to copy';
	}

	return actionMsg;
}
