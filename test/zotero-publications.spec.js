/* eslint-env node, karma,jasmine */
'use strict';

import _ from 'lodash';
import testData from './fixtures/test-data.json';
import testDataGrouped from './fixtures/test-data-grouped.json';
import {
	ZoteroRenderer
 } from '../src/js/render.js';
import {
	processResponse,
	ABSTRACT_NOTE_SHORT_SYMBOL
} from '../src/js/api.js';
import {
	ZoteroData,
	CHILD_NOTES,
	CHILD_ATTACHMENTS,
	GROUP_EXPANDED_SUMBOL,
	GROUP_TITLE
} from '../src/js/data.js';
import {
	ZoteroPublications
} from '../src/js/main.js';

describe('Zotero Publications', function() {
	var zp,
		renderer,
		container,
		data,
		dataGrouped;

	beforeEach(function() {
		zp = new ZoteroPublications({
			useCitationStyle: true
		});
		container = document.createElement('div');
		renderer = new ZoteroRenderer(container, zp);
		data = _.clone(testData);
		data.grouped = 0;
		dataGrouped = _.clone(testDataGrouped);
		dataGrouped.grouped = 1;
	});

	it('should render single item', function() {
		renderer.data = data;
		let renderedItem = renderer.renderItem(data[0]);
		expect(renderedItem).toBeDefined();
		expect(renderedItem).toMatch(/^<li.*zotero-item zotero-book.*>[\s\S]*<\/li>$/);
		expect(renderedItem).toContain(data[0].citation);
	});

	it('should render a list of items', function() {
		renderer.data = data;
		let renderedCollection = renderer.renderItems(data);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^<ul.*zotero-items.*>([\s\S]*?<li.*zotero-item .*>[\s\S]*?<\/li>[\s\S]*?){5}[\s\S]*?<\/ul>$/);
	});

	it('should render group of items', function() {
		renderer.data = dataGrouped;
		dataGrouped[0][GROUP_TITLE] = 'Book';
		dataGrouped[1][GROUP_TITLE] = 'Journal Article';
		let renderedCollection = renderer.renderGroups(dataGrouped);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^<ul.*zotero-groups.*>[\s\S]*?(<li.*"zotero-group".*>[\s\S]*?<ul.*zotero-items.*>[\s\S]*?(<li.*zotero-item.*>[\s\S]*?<\/li>[\s\S]*?){1,2}<\/ul>[\s\S]*?<\/li>[\s\S]*?){2}[\s\S]*?<\/ul>$/);
	});

	it('should render child items', function() {
		renderer.data = data;
		processResponse(data, zp.config);
		let renderedCollection = renderer.renderItems(data);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^<ul.*zotero-items.*>([\s\S]*?<li.*zotero-item.*>[\s\S]*?<div.*zotero-details.*>[\s\S]*?<ul.*zotero-(attachments|notes).*>[\s\S]*?<\/div>[\s\S]*?<\/li>){2}[\s\S]*?<\/ul>$/);
	});

	it('should replace contents of a container', function() {
		container.innerHTML = '<span>Hello World</span>';
		expect(container.innerHTML).toBe('<span>Hello World</span>');
		renderer.displayPublications(data);
		expect(container.innerHTML).not.toBe('<span>Hello World</span>');
		expect(container.innerHTML).toMatch(/^<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-items.*>[\s\S]*$/);
		renderer.displayPublications(dataGrouped);
		expect(container.innerHTML).toMatch(/^<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-groups.*>[\s\S]*$/);
	});

	it('should request items from desired enpoint', function() {
		spyOn(window, 'fetch');
		zp.getEndpoint('some/endpoint');
		expect(window.fetch).toHaveBeenCalled();
		expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/some\/endpoint\?.*$/);
	});

	it('should reject on failed requests', function(done) {
		spyOn(window, 'fetch').and.returnValue(
			Promise.reject('some error')
		);

		zp.get('some/endpoint')
			.then(function() {
				fail('Promise resolved when it should reject!');
				done();
			}).catch(function() {
				expect(window.fetch).toHaveBeenCalled();
				done();
			});
	});

	it('should move child items underneath the main item', function() {
		data = processResponse(data, zp.config);

		expect(data instanceof Array).toBe(true);
		expect(data.length).toBe(3);

		expect(data[2][CHILD_NOTES][0]).toBeDefined();
		expect(data[2][CHILD_NOTES][0].key).toEqual('NOTE');
		expect(data[0][CHILD_ATTACHMENTS][0]).toBeDefined();
		expect(data[0][CHILD_ATTACHMENTS][0].key).toEqual('FGHI');
	});

	it('should group items by type', function() {
		let zd = new ZoteroData(data, zp.config);
		zd.groupByType();
		expect(Object.keys(zd.data)).toEqual(['book', 'journalArticle']);
	});

	it('should pre-expand selected groups', function() {
		let zd = new ZoteroData(data, zp.config);
		zd.groupByType(['book']);
		expect(zd.data.book[GROUP_EXPANDED_SUMBOL]).toBe(true);
		expect(zd.data.journalArticle[GROUP_EXPANDED_SUMBOL]).toBe(false);
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

		zp.get('some/endpoint').then(function(zd) {
			expect(window.fetch.calls.count()).toEqual(2);
			expect(zd.length).toEqual(2);
			done();
		});
	});

	it('should render grouped, remote itmes using Zotero object and render() method', function(done) {
		spyOn(window, 'fetch').and.returnValue(
			Promise.resolve(
				new Response(
					JSON.stringify(data),
					{ status: 200,
					'headers': new Headers({
						'Link': 'blah'
					})}
				)
			)
		);

		let promise = new ZoteroPublications({
			'group': 'type'
		}).render('some/endpoint', container);
		expect(container.classList.contains('zotero-loading')).toBe(true);

		promise.then(function() {
			expect(window.fetch).toHaveBeenCalled();
			expect(container.classList.contains('zotero-loading')).toBe(false);
			expect(container.innerHTML).toMatch(/^<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-groups.*>[\s\S]*$/);
			done();
		});
	});

	it('should render local items using Zotero object and render() method', function(done) {
		spyOn(window, 'fetch');
		let zd = new ZoteroPublications.ZoteroData(data, zp.config);
		zp.render(zd, container).then(function() {
			expect(window.fetch).not.toHaveBeenCalled();
			expect(container.innerHTML).toMatch(/^<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-items.*>[\s\S]*$/);
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
					JSON.stringify(data),
					{ status: 200,
					'headers': new Headers({
						'Link': 'blah'
					})}
				)
			)
		);

		let promise = new ZoteroPublications('some/endpoint', container, {});
		expect(container.classList.contains('zotero-loading')).toBe(true);

		promise.then(function() {
			expect(window.fetch).toHaveBeenCalled();
			expect(container.classList.contains('zotero-loading')).toBe(false);
			expect(container.innerHTML).toMatch(/^<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-items.*>[\s\S]*$/);
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
