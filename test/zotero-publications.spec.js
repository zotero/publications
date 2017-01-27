/* eslint-env node, karma,jasmine */
'use strict';

import _ from 'lodash';
import testData from './fixtures/test-data.json';
import testDataGrouped from './fixtures/test-data-grouped.json';
import testDataSingle from './fixtures/test-data-single.json';
import Renderer from '../src/js/renderer.js';
import DomWrapper from '../src/js/dom-wrapper.js';
import ZoteroData from '../src/js/data.js';
import ZoteroPublications from '../src/js/main.js';
import {
	CHILD_NOTES,
	CHILD_ATTACHMENTS,
	CHILD_OTHER,
	GROUP_EXPANDED_SUMBOL,
	GROUP_TITLE,
	VIEW_ONLINE_URL,
	AUTHORS_SYMBOL
} from '../src/js/constants.js';
import {
	processResponse
} from '../src/js/api.js';

describe('Zotero Publications', function() {
	var zp,
		renderer,
		domwrapper,
		container,
		data,
		dataGrouped,
		dataSingle;

	beforeEach(function() {
		zp = new ZoteroPublications({
			useCitationStyle: true
		});
		container = document.createElement('div');
		domwrapper = new DomWrapper(container, zp);
		renderer = new Renderer(zp);
		data = JSON.parse(JSON.stringify(testData));
		data.grouped = 0;
		dataGrouped = JSON.parse(JSON.stringify(testDataGrouped));
		dataGrouped[0][GROUP_TITLE] = 'Book';
		dataGrouped[1][GROUP_TITLE] = 'Journal Article';
		dataGrouped.grouped = 1;
		dataSingle = JSON.parse(JSON.stringify(testDataSingle));
	});

	it('should render single item', function() {
		renderer.data = data;
		let renderedItem = renderer.renderItem(data[0]);
		expect(renderedItem).toBeDefined();
		expect(renderedItem).toMatch(/^[\n\r\s]*<li.*zotero-item zotero-book.*>[\s\S]*<\/li>$/);
		expect(renderedItem).toContain(data[0].citation);
	});

	it('should render a list of items', function() {
		renderer.data = data;
		let renderedCollection = renderer.renderItems(data);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^[\n\r\s]*<ul.*zotero-items.*>([\s\S]*?<li.*zotero-item .*>[\s\S]*?<\/li>[\s\S]*?){5}[\s\S]*?<\/ul>$/);
	});

	it('should render group of items', function() {
		renderer.data = dataGrouped;
		let renderedCollection = renderer.renderGroups(dataGrouped);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^[\n\r\s]*<ul.*zotero-groups.*>[\s\S]*?(<li.*"zotero-group".*>[\s\S]*?<ul.*zotero-items.*>[\s\S]*?(<li.*zotero-item.*>[\s\S]*?<\/li>[\s\S]*?){1,2}<\/ul>[\s\S]*?<\/li>[\s\S]*?){2}[\s\S]*?<\/ul>$/);
	});

	it('should render child items', function() {
		renderer.data = data;
		processResponse(data, zp.config);
		let renderedCollection = renderer.renderItems(data);
		expect(renderedCollection).toBeDefined();
		expect(renderedCollection).toMatch(/^[\n\r\s]*<ul.*zotero-items.*>([\s\S]*?<li.*zotero-item.*>[\s\S]*?<div.*zotero-details.*>[\s\S]*?<ul.*zotero-(attachments|notes).*>[\s\S]*?<\/div>[\s\S]*?<\/li>)[\s\S]*?<\/ul>$/);
	});

	it('should replace contents of a container', function() {
		container.innerHTML = '<span>Hello World</span>';
		expect(container.innerHTML).toBe('<span>Hello World</span>');
		domwrapper.displayPublications(data);
		expect(container.innerHTML).not.toBe('<span>Hello World</span>');
		expect(container.innerHTML).toMatch(/^[\n\r\s]*<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-items.*>[\s\S]*$/);
		domwrapper.displayPublications(dataGrouped);
		expect(container.innerHTML).toMatch(/^[\n\r\s]*<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-groups.*>[\s\S]*$/);
	});

	it('should process creators array into a string', function() {
		let processed = processResponse(data);
		let book = _.find(processed, {key: 'ABCD'});
		expect(book.data[AUTHORS_SYMBOL]).toEqual({
			Author: [ 'Yoda' ],
			Editor: [ 'Luke Skywalker' ]
		});
	});

	it('should extract "view online" url from the response', function() {
		let processed = processResponse(data);
		let book = _.find(processed, {key: 'ABCD'});
		let journalArticle = _.find(processed, {key: 'EFGH'});
		expect(book[VIEW_ONLINE_URL]).toEqual('http://zotero.org/paper.pdf');
		expect(journalArticle[VIEW_ONLINE_URL]).toEqual('http://lorem-ipsum.com/test');
	});

	it('should request data from an endpoint', function() {
		spyOn(window, 'fetch');
		zp.getEndpoint('some/endpoint');
		expect(window.fetch).toHaveBeenCalled();
		expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/some\/endpoint\?.*$/);
	});

	it('should request publications for a user', function() {
		spyOn(window, 'fetch');
		zp.getPublications(123);
		expect(window.fetch).toHaveBeenCalled();
		expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/users\/123\/publications\/items\?.*$/);
	});

	it('should request a single publication', function() {
		spyOn(window, 'fetch');
		zp.getPublication(4567, 123);
		expect(window.fetch).toHaveBeenCalled();
		expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/users\/123\/publications\/items\/4567\/?.*$/);
	});

	it('should handle a single item response', function(done) {
		spyOn(window, 'fetch').and.returnValue(
			Promise.resolve(
				new Response(
					JSON.stringify(dataSingle),
					{ status: 200,
					'headers': new Headers({
						'Link': 'blah'
					})}
				)
			)
		);

		zp.getPublication(4567, 123).then(function(data) {
			expect(data instanceof ZoteroData).toBe(true);
			let abcd = _.find(data.raw, {key: 'ABCD'});
			expect(abcd.key).toEqual('ABCD');
			done();
		})
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
		data = processResponse(data);
		expect(data instanceof Array).toBe(true);

		expect(data instanceof Array).toBe(true);
		expect(data.length).toBe(2); // top-level items only

		let abcd = _.find(data, {key: 'ABCD'});

		expect(abcd[CHILD_NOTES].length).toEqual(1);
		expect(abcd[CHILD_NOTES][0]).toBeDefined();
		expect(abcd[CHILD_NOTES][0].key).toEqual('NOTE');
		expect(abcd[CHILD_ATTACHMENTS][0]).toBeDefined();
		expect(abcd[CHILD_ATTACHMENTS].length).toEqual(4);
		expect(abcd[CHILD_ATTACHMENTS][0].key).toEqual('IJKL');
		expect(abcd[CHILD_OTHER].length).toEqual(1);
		expect(abcd[CHILD_OTHER][0].key).toEqual('XYZZ');
	});

	it('should group items by type', function() {
		let zd = new ZoteroData(data, zp.config);
		zd.groupByType();
		let groupNames = Object.keys(zd.data);
		expect(groupNames.length).toEqual(2);
		expect(_.includes(groupNames, 'book')).toEqual(true);
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
			expect(container.innerHTML).toMatch(/^[\n\r\s]*<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-groups.*>[\s\S]*$/);
			done();
		});
	});

	it('should render local items using Zotero object and render() method', function(done) {
		var zpGroup = new ZoteroPublications({
			group: 'type'
		});

		spyOn(window, 'fetch');
		let zd = new ZoteroPublications.ZoteroData(data, zpGroup.config);
		zpGroup.render(zd, container).then(function() {
			expect(window.fetch).not.toHaveBeenCalled();
			expect(container.innerHTML).toMatch(/^[\n\r\s]*<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-groups.*>[\s\S]*$/);
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
			expect(container.innerHTML).toMatch(/^[\n\r\s]*<div.*"zotero-publications".*>[\s\S]*?<ul.*zotero-items.*>[\s\S]*$/);
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
			expect(err instanceof Error).toBe(true);
			done();
		});
	});

	it('should post items', function() {
		spyOn(window, 'fetch');
		zp.postItems(123, {a: 'b'}, {query: 'param'});
		expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/users\/123\/items\?.*?query=param.*$/);
		expect(Object.keys(window.fetch.calls.mostRecent().args[1])).toContain('method');
		expect(window.fetch.calls.mostRecent().args[1]['method']).toEqual('POST');
	});

	it('should pick up Zotero API details from global object on the old site', function(done) {
		window.Zotero = {
			config: {
				apiKey: 'lorem ipsum'
			},
			currentUser: {
				slug: 'foobar'
			}
		}

		let zpIntegrated = new ZoteroPublications({
			zorgIntegration: true
		});

		zpIntegrated.ready.then(function() {
			expect(zpIntegrated.config.zorgIntegration.slug).toEqual('foobar');
			expect(zpIntegrated.config.zorgIntegration.apiKey).toEqual('lorem ipsum');
			done();
		});
	});

	it('should pick up Zotero API details from global object on the new site', function(done) {
		window.Zotero = {
			config: {
				apiKey: 'lorem ipsum',
				loggedInUser: {
					slug: 'foobar'
				}
			}
		};

		let zpIntegrated = new ZoteroPublications({
			zorgIntegration: true
		});

		zpIntegrated.ready.then(function() {
			expect(zpIntegrated.config.zorgIntegration.slug).toEqual('foobar');
			expect(zpIntegrated.config.zorgIntegration.apiKey).toEqual('lorem ipsum');
			done();
		});
	});

	it('should expand selected item', function(done) {
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

		let zp = new ZoteroPublications({
			useHistory: true
		});

		zp.render(123, container).then(function() {
			let domwrapper = new DomWrapper(container, zp);
			domwrapper.expandDetails('EFGH').then(function() {
				setTimeout(function() {
					let itemDetailsEl = container.querySelector('[id=item-EFGH-details]');
					let itemEl = container.querySelector('[id=item-EFGH]');
					expect(itemEl.classList.contains('zotero-details-open')).toEqual(true);
					expect(itemDetailsEl.classList.contains('zotero-collapsed')).toEqual(false);
					expect(itemDetailsEl.getAttribute('aria-hidden')).toEqual('false');
					expect(itemDetailsEl.getAttribute('aria-expanded')).toEqual('true');
					done();
				}, 510); //wait for the fallback transition to fire
			});
		});
	});

	it('should pick up fragment identifier from the url', function(done) {
		location.hash = 'EFGH';

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

		let zp = new ZoteroPublications({
			useHistory: true
		});

		zp.render(123, container).then(function() {
			let itemEl = container.querySelector('[id=item-EFGH]');
			expect(itemEl.classList.contains('zotero-details-open')).toEqual(true);
			done();
		})
	});

	it('should respect branding configuration', function(done) {
		let zd = new ZoteroData(data, zp.config);

		let zp1 = new ZoteroPublications({
			showBranding: true
		});
		let container1 = document.createElement('div');
		let promise1 = new Promise(function(resolve) {
			zp1.render(zd, container1).then(function() {
				let brandingEl = container1.querySelector('.zotero-branding');
				expect(brandingEl).not.toBe(null);
				resolve();
			});
		});

		let zp2 = new ZoteroPublications({
			showBranding: false
		});
		let container2 = document.createElement('div');
		let promise2 = new Promise(function(resolve) {
			zp2.render(zd, container2).then(function() {
				let brandingEl = container2.querySelector('.zotero-branding');
				expect(brandingEl).toBe(null);
				resolve();
			});
		});

		Promise.all([promise1, promise2]).then(function() {
			done();
		});
	});

	it('should save to my library', function(done) {
		spyOn(window, 'fetch').and.returnValue(
			Promise.resolve(
				new Response(
					JSON.stringify({}),
					{ status: 200 }
				)
			)
		);
		window.Zotero = {
			config: {
				apiKey: 'lorem ipsum'
			},
			currentUser: {
				slug: 'foobar',
				userID: 123
			}
		}

		let zpIntegrated = new ZoteroPublications({
			zorgIntegration: true
		});
		let zd = new ZoteroData(data, zp.config);

		zpIntegrated.render(zd, container).then(function(domwrapper) {
			let itemEl = container.querySelector('[id=item-ABCD');
			let triggerEl = itemEl.querySelector('[data-trigger=add-to-library]');
			domwrapper.saveToMyLibrary(triggerEl, itemEl).then(function() {
				expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/users\/123\/items\?.*key=lorem(%20|\s)ipsum$/);
				expect(Object.keys(window.fetch.calls.mostRecent().args[1])).toContain('method');
				expect(window.fetch.calls.mostRecent().args[1]['method']).toEqual('POST');
				done();
			}).catch(function() {
				done();
			});
		});
	});

	it('should re-request citation when upon style selection', function(done) {
		spyOn(window, 'fetch').and.callFake(function() {
			return Promise.resolve(
				new Response(
					JSON.stringify(data),
					{ status: 200,
					'headers': new Headers({
						'Link': ''
					})}
				)
			);
		});

		zp = new ZoteroPublications();
		zp.ready.then(() => {
			zp.render(123, container)
				.then(domwrapper => {
					let itemEl = container.querySelector('[id=item-ABCD');
					domwrapper.updateCitation(itemEl, 'vancouver').then(() => {
						expect(window.fetch.calls.mostRecent().args[0]).toMatch(/^.*api\.zotero\.org\/users\/123\/publications\/items.*?[?|&]style=vancouver.*$/);
						done();
					}).catch(err => {
						fail(err);
						done();
					});
				}).catch(err => {
					fail(err);
					done();
				});
		}).catch(err => {
			fail(err);
			done();
		});
	});
});
