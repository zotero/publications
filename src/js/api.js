// import fetch from '../../bower_components/fetch/fetch.js';
// import Promise from '../../bower_components/es6-promise/promise.js';

export function getPublications(config) {
	let apiBase = config.apiBase || 'apidev.zotero.org',
		userId = config.userId,
		limit = config.limit = 100,
		style = config.style || 'apa-annotated-bibliography';

	if(!userId) {
		throw new Error("User id needs to be defined");
	}

	let url = `//${apiBase}/users/${userId}/publications/items?
	include=data,bib&limit=${limit}&linkwrap=1&order=dateModified&
	sort=desc&start=0&style=${style}`,
		options = {
			headers: {
				'Accept': 'application/json'
			}
		};

	return new Promise(function(resolve, reject) {
		fetch(url, options)
		.then(function(response) {
			if(response.status >= 200 && response.status < 300) {
				return response;
			} else {
				reject(response.statusText);
			}
		})
		.then(function(response) {
			return response.json();
		})
		.then(function(responseJson) {
			resolve(responseJson);
		});
	});
}
