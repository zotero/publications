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

export function toggleSpinner(container, activate) {
	var method = activate === null ? container.classList.toggle : activate ? container.classList.add : container.classList.remove;
	method.call(container.classList, 'zotero-loading');
}

