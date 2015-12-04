/* eslint-env node, karma,jasmine */
'use strict';

import _ from 'lodash';
import testData from './fixtures/test-data.json';
import testDataGrouped from './fixtures/test-data-grouped.json';
import {
	renderItem,
	renderItems,
	renderGrouped,
	renderPublications
 } from '../src/js/render.js';
import {
	processResponse,
	ABSTRACT_NOTE_SHORT_SYMBOL
} from '../src/js/api.js';
import {
	ZoteroData,
	CHILD_ITEMS_SYMBOL,
	GROUP_EXPANDED_SUMBOL
} from '../src/js/data.js';
import ZoteroPublications from '../src/js/app.js';


describe('Zotero Publications', function() {

	it('should render single item', function() {
		let renderedItem = renderItem(testData[0]);
		expect(renderedItem).toBeDefined();
		expect(renderedItem).toMatch(/^<li.*zotero-item zotero-book.*>[\s\S]*<\/li>$/);
		expect(renderedItem).toContain(testData[0].citation);
	});

	it('should render a list of items', function() {
		let renderedCollection = renderItems(testData);
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
		processResponse(testData, zp.config);
		let renderedCollection = renderItems(testData);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^<ul.*zotero-items.*>[\s\S]*<li.*zotero-item.*>[\s\S]*<ul.*class="zotero-child-items".*>[\s\S]*<\/ul>[\s\S]*<\/li>[\s\S]*<\/ul>$/);
	});

	it('should replace contents of a container', function() {
		let container = document.createElement('div');
		let tdg = _.clone(testDataGrouped);
		tdg.grouped = 1;
		container.innerHTML = '<span>Hello World</span>';
		expect(container.innerHTML).toBe('<span>Hello World</span>');
		renderPublications(container, testData);
		expect(container.innerHTML).not.toBe('<span>Hello World</span>');
		expect(container.innerHTML).toMatch(/^<ul.*zotero-items.*>[\s\S]*$/);
		renderPublications(container, tdg);
		expect(container.innerHTML).toMatch(/^<ul.*zotero-groups.*>[\s\S]*$/);
	});

	it('should request items from desired enpoint', function() {
		spyOn(window, 'fetch');
		let zp = new ZoteroPublications();
		zp.get('some/endpoint');
		expect(window.fetch).toHaveBeenCalled();
		expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/some\/endpoint\?.*$/);
	});

	it('should reject on failed requests', function(done) {
		spyOn(window, 'fetch').and.returnValue(
			Promise.reject('some error')
		);
		let zp = new ZoteroPublications();
		zp.get('some/endpoint')
			.then(function() {
				fail('Promise resolved when it should reject!');
				done();
			}).catch(function() {
				expect(window.fetch).toHaveBeenCalled();
				done();
			});
	});

	it('should should generate shortened version of the abstract', function() {
		let zp = new ZoteroPublications({
			shortenedAbstractLenght: 20
		});
		processResponse(testData, zp.config);
		expect(testData[1].data[ABSTRACT_NOTE_SHORT_SYMBOL].length).not.toBeGreaterThan(20);
		expect(testData[1].data.abstractNote.length).toBeGreaterThan(20);
	});

	it('should move child items underneath the main item', function() {
		let zp = new ZoteroPublications();
		processResponse(testData, zp.config);
		expect(testData instanceof Array).toBe(true);
		expect(testData.length).toBe(3);
		expect(testData[0][CHILD_ITEMS_SYMBOL]).toBeDefined();
		expect(testData[0][CHILD_ITEMS_SYMBOL][0][CHILD_ITEMS_SYMBOL]).toBeDefined();
		expect(testData[0][CHILD_ITEMS_SYMBOL][0].key).toEqual('IJKL');
		expect(testData[0][CHILD_ITEMS_SYMBOL][0][CHILD_ITEMS_SYMBOL][0].key).toEqual('NOTE');
	});

	it('should group items by type', function() {
		let zp = new ZoteroPublications();
		let data = new ZoteroData(testData, zp.config);
		data.groupByType();
		expect(Object.keys(data.data)).toEqual(['book', 'journalArticle']);
	});

	it('should pre-expand selected groups', function() {
		let zp = new ZoteroPublications();
		let data = new ZoteroData(testData, zp.config);
		data.groupByType(['book']);
		expect(data.data.book[GROUP_EXPANDED_SUMBOL]).toBe(true);
		expect(data.data.journalArticle[GROUP_EXPANDED_SUMBOL]).toBe(false);
	});

	it('should recursively batch-fetch all data', function(done) {
		var isFirstResponse = true;

		spyOn(window, 'fetch').and.callFake(function() {
			let headers = new Headers({
				'Link': '<https://second-batch-url.com/>; rel="next"'
			});
			let responseProperties = {
				'status': 200
			};

			if(isFirstResponse) {
				responseProperties = _.extend({}, responseProperties, {
					'headers': headers
				});
				isFirstResponse = false;
				return Promise.resolve(new Response(JSON.stringify([{
					'key1': 'value1'
				}]), responseProperties));
			} else {
				return Promise.resolve(new Response(JSON.stringify([{
					'key2': 'value2'
				}]), responseProperties));
			}
		});

		let zp = new ZoteroPublications();

		zp.get('some/endpoint').then(function(data) {
			expect(window.fetch.calls.count()).toEqual(2);
			expect(data.length).toEqual(2);
			done();
		});
	});

	it('should render grouped, remote itmes using Zotero object and render() method', function(done) {
		spyOn(window, 'fetch').and.returnValue(
			Promise.resolve(
				new Response(
					JSON.stringify(testData),
					{ status: 200,
					'headers': new Headers({
						'Link': 'blah'
					})}
				)
			)
		);
		let container = document.createElement('div');
		expect(container.classList.contains('zotero-loading')).toBe(false);

		let promise = new ZoteroPublications({
			'group': 'type'
		}).render('some/endpoint', container);
		expect(container.classList.contains('zotero-loading')).toBe(true);

		promise.then(function() {
			expect(window.fetch).toHaveBeenCalled();
			expect(container.classList.contains('zotero-loading')).toBe(false);
			expect(container.innerHTML).toMatch(/^<ul.*zotero-groups.*>[\s\S]*$/);
			done();
		});
	});

	it('should render local items using Zotero object and render() method', function(done) {
		spyOn(window, 'fetch');
		let container = document.createElement('div');
		let zp = new ZoteroPublications();
		let zd = new ZoteroPublications.ZoteroData(testData, zp.config);
		zp.render(zd, container).then(function() {
			expect(window.fetch).not.toHaveBeenCalled();
			expect(container.innerHTML).toMatch(/^<ul.*zotero-items.*>[\s\S]*$/);
			done();
		});
	});

	it('should reject when unable to fetch remote items using render() method', function(done) {
		spyOn(window, 'fetch').and.returnValue(
			Promise.resolve(
				new Response(
					'{}',
					{ status: 500 },
					new Headers()
				)
			)
		);
		let container = document.createElement('div');
		new ZoteroPublications().render('some/endpoint', container)
			.then(function() {
				fail('Promise resolved when it should reject!');
				done();
			}).catch(function() {
				expect(window.fetch).toHaveBeenCalled();
				done();
		});
	});

	it('should render remote itmes using shortcut syntax', function(done) {
		spyOn(window, 'fetch').and.returnValue(
			Promise.resolve(
				new Response(
					JSON.stringify(testData),
					{ status: 200,
					'headers': new Headers({
						'Link': 'blah'
					})}
				)
			)
		);
		let container = document.createElement('div');
		expect(container.classList.contains('zotero-loading')).toBe(false);

		let promise = new ZoteroPublications('some/endpoint', container, {});
		expect(container.classList.contains('zotero-loading')).toBe(true);

		promise.then(function() {
			expect(window.fetch).toHaveBeenCalled();
			expect(container.classList.contains('zotero-loading')).toBe(false);
			expect(container.innerHTML).toMatch(/^<ul.*zotero-items.*>[\s\S]*$/);
			done();
		});
	});

	it('should throw error when called with invalid first argument', function(done) {
		new ZoteroPublications({}, document.createElement('div'), {}).then(function() {
			fail();
			done();
		}).catch(function(err) {
			expect(err instanceof Error).toBe(true);
			done();
		});
	});

	it('should throw error when called with invalid second argument', function(done) {
		new ZoteroPublications('', '', '').then(function() {
			fail();
			done();
		}).catch(function(err) {
			expect(err instanceof Error).toBe(true);
			done();
		});
	});

	it('should throw error when called with invalid number of arguments', function(done) {
		new ZoteroPublications('/endpoint', document.createElement('div'), {}, '').then(function() {
			fail();
			done();
		}).catch(function(err) {
			console.warn(err);
			expect(err instanceof Error).toBe(true);
			done();
		});
	});
});
