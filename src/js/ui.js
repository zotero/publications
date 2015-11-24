export function addHandlers(container) {
	container.addEventListener('click', function(ev) {
		console.info(ev);
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

