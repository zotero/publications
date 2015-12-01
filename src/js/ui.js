/**
 * Attach interaction handlers for expanding groups and shortened abstracts.
 * @param {HTMLElement} container - A top-level DOM element (e.g. container) that contains Zotero items.
 */
export function addHandlers(container) {
	container.addEventListener('click', function(ev) {
		if(ev.target.classList.contains('zotero-abstract-toggle')) {
			let abstractShortEl = ev.target.parentNode.parentNode.querySelector('.zotero-abstract-short');
			let abstractEl = ev.target.parentNode.parentNode.querySelector('.zotero-abstract');
			let expanded = abstractShortEl.classList.toggle('zotero-abstract-expanded');
			abstractEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
		if(ev.target.classList.contains('zotero-group-title')) {
			let groupEl = ev.target.parentNode;
			let expanded = groupEl.classList.toggle('zotero-group-expanded');
			groupEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	});
}

/**
 * Toggle CSS class that gives a visual loading feedback. Optionally allows to explicetly specify
 * whether to display or hide visual feedback.
 * @param  {HTMLElement} container - A DOM element to which visual feedback class should be attached
 * @param  {boolean} [activate]    - Explicitely indicate whether to add or remove visual feedback
 */
export function toggleSpinner(container, activate) {
	var method = activate === null ? container.classList.toggle : activate ? container.classList.add : container.classList.remove;
	method.call(container.classList, 'zotero-loading');
}

