import _ from '../../bower_components/lodash/lodash.js';
import { getPublications } from './api.js';
import { renderPublications } from './render.js';


var zoteroPublications = function(container, config) {
	getPublications(config).then(
		_.partial(renderPublications, container)
	);
};

module.exports = zoteroPublications;
