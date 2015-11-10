/* eslint-env node, karma,jasmine */
'use strict';
var zoteroPublications = require('../src/js/app.js');

describe('Zotero Publications', function() {
	it('should be defined', function() {
		expect(zoteroPublications).toBeDefined();
	});
});
