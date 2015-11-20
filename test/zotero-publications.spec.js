/* eslint-env node, karma,jasmine */
'use strict';

import _ from 'lodash';
import testData from './fixtures/test-data.json';
import testDataGrouped from './fixtures/test-data-grouped.json';
import {
	renderItem,
	renderCollection,
	renderGrouped,
	renderPublications
 } from '../src/js/render.js';
 import ZoteroPublications from '../src/js/app.js';

describe('Zotero Publications', function() {

	beforeEach(function() {
		spyOn(window, 'fetch').and.returnValue(testData);
	});

	it('should render single item', function() {
		let renderedItem = renderItem(testData[0]);
		expect(renderedItem).toBeDefined();
		expect(renderedItem).toMatch(/^<li.*zotero-item zotero-book.*>[\s\S]*<\/li>$/);
		expect(renderedItem).toContain(testData[0].citation);
	});

	it('should render a list of items', function() {
		let renderedCollection = renderCollection(testData);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^<ul.*zotero-items.*>[\s\S]*(<li.*zotero-item.*>[\s\S]*<\/li>){2}[\s\S]*<\/ul>$/);
	});

	it('should render group of items', function() {
		let renderedCollection = renderGrouped(testDataGrouped);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^<ul.*zotero-groups.*>[\s\S]*<ul.*zotero-items.*>[\s\S]*(<li.*zotero-item.*>[\s\S]*<\/li>){2}[\s\S]*<\/ul>$/);
	});

	it('should render child items', function() {
		let zp = new ZoteroPublications();
		zp.processResponse(testData);
		let renderedCollection = renderCollection(testData);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^<ul.*zotero-items.*>[\s\S]*<li.*zotero-item.*>[\s\S]*<ul.*class="zotero-child-items".*>[\s\S]*<\/ul>[\s\S]*<\/li>[\s\S]*<\/ul>$/);
	});

	it('should replace contents of a container', function() {
		let container = document.createElement('div');
		container.innerHTML = '<span>Hello World</span>';
		expect(container.innerHTML).toBe('<span>Hello World</span>');
		renderPublications(container, testData);
		expect(container.innerHTML).not.toBe('<span>Hello World</span>');
		expect(container.innerHTML).toMatch(/^<ul.*zotero-items.*>[\s\S]*(<li.*zotero-item.*>[\s\S]*<\/li>){2}[\s\S]*<\/ul>[\s\S]*<div.*zotero-branding.*>[\s\S]*<\/div>$/);
	});

	it('should request items from desired enpoint', function() {
		let zp = new ZoteroPublications();
		zp.getItems('some/endpoint');
		expect(window.fetch).toHaveBeenCalled();
		expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/some\/endpoint\?.*$/);
	});

	it('should should generate shortened version of the abstract', function() {
		let zp = new ZoteroPublications({
			shortenedAbstractLenght: 20
		});
		zp.processResponse(testData);
		expect(testData[1].data.abstractNoteShort.length).not.toBeGreaterThan(20);
		expect(testData[1].data.abstractNote.length).toBeGreaterThan(20);
	});

	it('should move child items underneath the main item', function() {
		let zp = new ZoteroPublications();
		zp.processResponse(testData);
		expect(testData instanceof Array).toBe(true);
		expect(testData.length).toBe(3);
		expect(testData[0].childItems).toBeDefined();
	});

	it('should group items by type', function() {
		let zp = new ZoteroPublications();
		zp.processResponse(testData);
		let data = zp.groupByType(testData);
		expect(data instanceof Array).toBe(false);
		expect(Object.keys(data)).toEqual(['book', 'journalArticle']);
	});
});
