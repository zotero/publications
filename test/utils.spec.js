/* eslint-env node, karma,jasmine */
'use strict';

import { sanitizeURL } from '../src/js/utils.js';

describe('utils', function() {
	it('should allow valid urls', () => {
		expect(sanitizeURL('http://zotero.org')).toEqual('http://zotero.org');
		expect(sanitizeURL('https://zotero.org')).toEqual('https://zotero.org');
		expect(sanitizeURL('ftp://zotero.org')).toEqual('ftp://zotero.org');
		expect(sanitizeURL(' http://zotero.org')).toEqual('http://zotero.org');
	});

	it('should add protocol to protocol-less urls', () => {
		expect(sanitizeURL('zotero.org')).toEqual('http://zotero.org');
		expect(sanitizeURL(' zotero.org')).toEqual('http://zotero.org');
	});

	it('should prevent xss in urls', () => {
		expect(sanitizeURL('javascript:alert(\'xss\')')).toEqual('http://javascript:alert(\'xss\')');
		expect(sanitizeURL(' javascript:alert(\'xss\')')).toEqual('http://javascript:alert(\'xss\')');
	});
});
