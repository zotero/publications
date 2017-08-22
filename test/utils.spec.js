/* eslint-env node, karma,jasmine */
'use strict';

import { sanitizeURL, escapeFormattedValue } from '../src/js/utils.js';

describe('utils', function() {
	describe('sanitizeURL', function() {
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

	describe('escapeFormattedValue', function() {
		it('should escape html', () => {
			expect(escapeFormattedValue('<a href=""></a>')).toEqual('&lt;a href=&quot;&quot;&gt;&lt;/a&gt;');
		});

		it('should render supported tags', () => {
			expect(escapeFormattedValue('Lorem <sc>ipsum</sc> dolot')).toEqual('Lorem <span class="small-caps">ipsum</span> dolot');
			expect(escapeFormattedValue('Lorem <i>ipsum</i> dolot')).toEqual('Lorem <i>ipsum</i> dolot');
		});

		it('should render supported tags while escaping other', () => {
			expect(escapeFormattedValue('Lorem <script><i>ipsum</i></script> dolot')).toEqual('Lorem &lt;script&gt;<i>ipsum</i>&lt;/script&gt; dolot');
		});
	});
});
