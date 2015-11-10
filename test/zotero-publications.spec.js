/* eslint-env node, karma,jasmine */
'use strict';

import _ from 'lodash';
import testData from './fixtures/test-data.json';
import {
	renderItem,
	renderCollection,
	renderPublications
 } from '../src/js/render.js';

describe('Zotero Publications', function() {
	it('should render single item', function() {
		let renderedItem = renderItem(testData[0]);
		expect(renderedItem).toBeDefined();
		expect(renderedItem).toMatch(/^<li.*zotero-item zotero-book.*>[\s\S]*<\/li>$/);
		expect(renderedItem).toContain(testData[0].bib);
	});

	// it('should render single item with abstract', function() {
	// 	let renderedItem = renderItem(testData[0]);
	// 	//TODO
	// });

	it('should render single item using custom template', function() {
		let renderedItem = renderItem(testData[0], _.template('<b><%= bib %></b>'));
		expect(renderedItem).toBeDefined();
		expect(renderedItem).toMatch(/^<b>[\s\S]*<\/b>$/);
		expect(renderedItem).toContain(testData[0].bib);
	});

	it('should render a collection of items', function() {
		let renderedCollection = renderCollection(testData);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^<ul.*zotero-collection.*>[\s\S]*(<li.*zotero-item.*>[\s\S]*<\/li>){2}[\s\S]*<\/ul>[\s\S]*<div.*zotero-branding.*>[\s\S]*<\/div>$/);
	});

	it('should replace contents of a container', function() {
		let container = document.createElement('div');
		container.innerHTML = '<span>Hello World</span>';
		expect(container.innerHTML).toBe('<span>Hello World</span>');
		renderPublications(container, testData);
		expect(container.innerHTML).not.toBe('<span>Hello World</span>');
		expect(container.innerHTML).toMatch(/^<ul.*zotero-collection.*>[\s\S]*(<li.*zotero-item.*>[\s\S]*<\/li>){2}[\s\S]*<\/ul>[\s\S]*<div.*zotero-branding.*>[\s\S]*<\/div>$/);
	});

});
