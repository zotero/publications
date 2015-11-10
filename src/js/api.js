
function parseResponse(response) {
	let rawData = response.json();
	let childElements = [];

	for(let i = 0, itemsCount = rawData.length; i < itemsCount; i++) {
			rawData.push();
	}
}

function getPublications(apiBase, userId, limit, style) {
	let url = `//{$apiBase}/users/{$userId}/publications/items?
			include=data,bib&limit=$limit&linkwrap=1&order=dateModified&
			sort=desc&start=0&style={$style}`,
		options = {
			headers: {
				'Accept': 'application/json'
			}
		};
	window.fetch(url, options).then(parseResponse);
}
