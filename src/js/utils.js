var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


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

export function formatCategoryName(name) {
	name = name.replace(/(?! )[A-Z]/g, ' $&');
	return name.charAt(0).toUpperCase() + name.slice(1);
}

export function closest(el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn));
}
