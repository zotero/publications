(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ZoteroPublications = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/srv/zotero/my-publications/src/js/api.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.processResponse = processResponse;
exports.fetchUntilExhausted = fetchUntilExhausted;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _dataJs = require('./data.js');

var ABSTRACT_NOTE_SHORT_SYMBOL = Symbol['for']('abstractNoteShort');

exports.ABSTRACT_NOTE_SHORT_SYMBOL = ABSTRACT_NOTE_SHORT_SYMBOL;
/**
 * Process raw API response
 * @param  {Object[]} response - The raw API response
 * @param  {Object} config     - Global ZoteroPublications config
 * @return {Object[]}          - Processed API response
 */

function processResponse(response, config) {
	if (response) {
		var childItems = [];
		var index = {};

		for (var i = response.length; i--;) {
			var item = response[i];
			if (item.data && item.data.abstractNote) {
				var abstractNoteShort = item.data.abstractNote.substr(0, config.shortenedAbstractLenght);
				abstractNoteShort = abstractNoteShort.substr(0, Math.min(abstractNoteShort.length, abstractNoteShort.lastIndexOf(' ')));
				item.data[ABSTRACT_NOTE_SHORT_SYMBOL] = abstractNoteShort;
			}
			if (item.data && item.data.parentItem) {
				response.splice(i, 1);
				childItems.push(item);
			}
			index[item.key] = item;
		}

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = childItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				if (!index[item.data.parentItem]) {
					console.warn('item ' + item.key + ' has parentItem ' + item.data.parentItem + ' that does not exist in the dataset');
					continue;
				}

				if (!index[item.data.parentItem][_dataJs.CHILD_ITEMS_SYMBOL]) {
					index[item.data.parentItem][_dataJs.CHILD_ITEMS_SYMBOL] = [];
				}
				index[item.data.parentItem][_dataJs.CHILD_ITEMS_SYMBOL].push(item);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator['return']) {
					_iterator['return']();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	}
	return response;
}

/**
 * Recursively fetch data until there's no more rel="next" url in Link header
 * @param  {String} url             - An url for initial data request
 * @param  {Object} [options]       - Custom settings (e.g. headers) passed over to fetch() for each request
 * @param  {Object[]} [jsondata=[]] - Used for data aggregation in recursive calls
 * @return {Promise}                - Resolved with complete dataset or rejected on error
 */

function fetchUntilExhausted(url, options, jsondata) {
	var relRegex = /<(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))>;\s*rel="next"/;
	jsondata = jsondata || [];

	return new Promise(function (resolve, reject) {
		fetch(url, options).then(function (response) {
			if (response.status >= 200 && response.status < 300) {
				if (response.headers.has('Link')) {
					(function () {
						var matches = response.headers.get('Link').match(relRegex);
						if (matches && matches.length >= 2) {
							response.json().then(function (jsonDataPart) {
								resolve(fetchUntilExhausted(matches[1], options, _lodash2['default'].union(jsondata, jsonDataPart)));
							});
						} else {
							response.json().then(function (jsonDataPart) {
								resolve(_lodash2['default'].union(jsondata, jsonDataPart));
							});
						}
					})();
				} else {
					response.json().then(function (jsonDataPart) {
						resolve(_lodash2['default'].union(jsondata, jsonDataPart));
					});
				}
			} else {
				reject(new Error('Unexpected status code ' + response.status + ' when requesting ' + url));
			}
		})['catch'](function () {
			reject(new Error('Unexpected error when requesting ' + url));
		});
	});
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./data.js":"/srv/zotero/my-publications/src/js/data.js"}],"/srv/zotero/my-publications/src/js/data.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.ZoteroData = ZoteroData;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _apiJs = require('./api.js');

var GROUPED_NONE = 0;
exports.GROUPED_NONE = GROUPED_NONE;
var GROUPED_BY_TYPE = 1;
exports.GROUPED_BY_TYPE = GROUPED_BY_TYPE;
var GROUPED_BY_COLLECTION = 2;
exports.GROUPED_BY_COLLECTION = GROUPED_BY_COLLECTION;
var CHILD_ITEMS_SYMBOL = Symbol['for']('childItems');
exports.CHILD_ITEMS_SYMBOL = CHILD_ITEMS_SYMBOL;
var GROUP_EXPANDED_SUMBOL = Symbol['for']('groupExpanded');

exports.GROUP_EXPANDED_SUMBOL = GROUP_EXPANDED_SUMBOL;
/**
 * Store, Encapsulate and Manipulate Zotero API data
 * @param {Object[]} data   - Zotero API data to encapsulate
 * @param {Object} [config] - ZoteroPublications config
 */

function ZoteroData(data, config) {
	this.raw = this.data = (0, _apiJs.processResponse)(data, config);
	this.grouped = GROUPED_NONE;

	Object.defineProperty(this, 'length', {
		enumerable: false,
		configurable: false,
		get: function get() {
			return this.data.length;
		}
	});
}

/**
 * Group data by type
 * @param  {String|String[]} [expand=[]] - List of types which should appear pre-expanded.
 *                                         Alternatively string "all" is accepted.
 */
ZoteroData.prototype.groupByType = function (expand) {
	var groupedData = {};
	expand = expand || [];
	for (var i = this.raw.length; i--;) {
		var item = this.raw[i];

		if (!groupedData[item.data.itemType]) {
			groupedData[item.data.itemType] = [];
		}
		groupedData[item.data.itemType].push(item);
		groupedData[item.data.itemType][GROUP_EXPANDED_SUMBOL] = expand === 'all' || _lodash2['default'].contains(expand, item.data.itemType);
	}
	this.data = groupedData;
	this.grouped = GROUPED_BY_TYPE;
};

/**
 * Group data by top-level collections
 */
ZoteroData.prototype.groupByCollections = function () {
	throw new Error('groupByCollections is not implemented yet.');
};

/**
 * Custom iterator to allow for..of interation regardless of whether data is grouped or not.
 * For ungrouped data each interation returns single Zotero item
 * For grouped data each interationr returns an a pair of group title and an Array of Zotero items
 */
ZoteroData.prototype[Symbol.iterator] = function () {
	var _this = this;

	var i = 0;
	if (this.grouped > 0) {
		var _ret = (function () {
			var keys = Object.keys(_this.data);
			return {
				v: {
					next: (function () {
						return {
							value: i < keys.length ? [keys[i], this.data[keys[i]]] : null,
							done: i++ >= keys.length
						};
					}).bind(_this)
				}
			};
		})();

		if (typeof _ret === 'object') return _ret.v;
	} else {
		return {
			next: (function () {
				return {
					value: i < this.data.length ? this.data[i] : null,
					done: i++ >= this.data.length
				};
			}).bind(this)
		};
	}
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./api.js":"/srv/zotero/my-publications/src/js/api.js"}],"/srv/zotero/my-publications/src/js/main-modern.js":[function(require,module,exports){
'use strict';

var _mainJs = require('./main.js');

module.exports = _mainJs.ZoteroPublications;

},{"./main.js":"/srv/zotero/my-publications/src/js/main.js"}],"/srv/zotero/my-publications/src/js/main.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.ZoteroPublications = ZoteroPublications;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _renderJs = require('./render.js');

var _apiJs = require('./api.js');

var _dataJs = require('./data.js');

var _uiJs = require('./ui.js');

/**
 * Application entry point
 * @param {Object} [config] - Configuration object that will selectively override the defaults
 */

function ZoteroPublications() {
	if (arguments.length <= 1) {
		this.config = _lodash2['default'].extend({}, this.defaults, arguments ? arguments[0] : {});
	} else if (arguments.length <= 3) {
		this.config = _lodash2['default'].extend({}, this.defaults, arguments[2]);
		return this.render(arguments[0], arguments[1]);
	} else {
		return Promise.reject(new Error('ZoteroPublications takes between one and three arguments. ${arguments.length} is too many.'));
	}
}

/**
 * Default configuration object
 * @type {Object}
 */
ZoteroPublications.prototype.defaults = {
	apiBase: 'api.zotero.org',
	limit: 100,
	citationStyle: '',
	include: ['data', 'citation'],
	shortenedAbstractLenght: 250,
	group: false,
	expand: 'all'
};

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint - An API endpoint from which data should be obtained
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.get = function (endpoint) {
	var apiBase = this.config.apiBase,
	    limit = this.config.limit,
	    style = this.config.citationStyle,
	    include = this.config.include.join(','),
	    url = 'https://' + apiBase + '/' + endpoint + '?include=' + include + '&limit=' + limit + '&linkwrap=1&order=dateModified&sort=desc&start=0&style=' + style,
	    options = {
		headers: {
			'Accept': 'application/json'
		}
	};

	return new Promise((function (resolve, reject) {
		var promise = (0, _apiJs.fetchUntilExhausted)(url, options);
		promise.then((function (responseJson) {
			var data = new _dataJs.ZoteroData(responseJson, this.config);
			if (this.config.group === 'type') {
				data.groupByType(this.config.expand);
			}
			resolve(data);
		}).bind(this));
		promise['catch'](reject);
	}).bind(this));
};

/**
 * Render local or remote items.
 * @param  {String|ZoteroData} endpointOrData - Data containung publications to be rendered
 * @param  {HTMLElement} container            - A DOM element where publications will be rendered
 * @return {Promise}                          - Resolved when rendered or rejected on error.
 */
ZoteroPublications.prototype.render = function (endpointOrData, container) {
	return new Promise((function (resolve, reject) {
		if (!(container instanceof HTMLElement)) {
			reject(new Error('Second argument to render() method must be a DOM element'));
		}
		if (endpointOrData instanceof _dataJs.ZoteroData) {
			var data = endpointOrData;
			(0, _renderJs.renderPublications)(container, data);
			resolve();
		} else if (typeof endpointOrData === 'string') {
			var endpoint = endpointOrData;
			(0, _uiJs.toggleSpinner)(container, true);
			var promise = this.get(endpoint);
			promise.then(function (data) {
				(0, _uiJs.toggleSpinner)(container, false);
				(0, _renderJs.renderPublications)(container, data);
				resolve();
			});
			promise['catch'](function () {
				(0, _uiJs.toggleSpinner)(container, false);
				reject(arguments[0]);
			});
		} else {
			reject(new Error('First argument to render() method must be an endpoint or an instance of ZoteroData'));
		}
	}).bind(this));
};

/**
 * Make ZoteroData publicly accessible underneath ZoteroPublications
 * @type {ZoteroData}
 */
ZoteroPublications.ZoteroData = _dataJs.ZoteroData;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","./data.js":"/srv/zotero/my-publications/src/js/data.js","./render.js":"/srv/zotero/my-publications/src/js/render.js","./ui.js":"/srv/zotero/my-publications/src/js/ui.js"}],"/srv/zotero/my-publications/src/js/render.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.renderItem = renderItem;
exports.renderItems = renderItems;
exports.renderChildItem = renderChildItem;
exports.renderChildItems = renderChildItems;
exports.renderGroup = renderGroup;
exports.renderGrouped = renderGrouped;
exports.renderPublications = renderPublications;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tplItemTpl = require('./tpl/item.tpl');

var _tplItemTpl2 = _interopRequireDefault(_tplItemTpl);

var _tplItemsTpl = require('./tpl/items.tpl');

var _tplItemsTpl2 = _interopRequireDefault(_tplItemsTpl);

var _tplGroupTpl = require('./tpl/group.tpl');

var _tplGroupTpl2 = _interopRequireDefault(_tplGroupTpl);

var _tplGroupsTpl = require('./tpl/groups.tpl');

var _tplGroupsTpl2 = _interopRequireDefault(_tplGroupsTpl);

var _tplChildItemsTpl = require('./tpl/child-items.tpl');

var _tplChildItemsTpl2 = _interopRequireDefault(_tplChildItemsTpl);

var _tplChildItemTpl = require('./tpl/child-item.tpl');

var _tplChildItemTpl2 = _interopRequireDefault(_tplChildItemTpl);

var _tplBrandingTpl = require('./tpl/branding.tpl');

var _tplBrandingTpl2 = _interopRequireDefault(_tplBrandingTpl);

var _uiJs = require('./ui.js');

var _dataJs = require('./data.js');

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @param  {String} childItemsMarkup - Rendered markup of a list of Zotero child items
 * @return {String}                  - Rendered markup of a Zotero item
 */

function renderItem(zoteroItem, childItemsMarkup) {
	return (0, _tplItemTpl2['default'])({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'childItemsMarkup': childItemsMarkup || ''
	});
}

/**
 * Render a list of Zotero items
 * @param  {ZoteroData|Object[]} zoteroItems - List of Zotero items
 * @return {String}                          - Rendered markup of a list of Zotero items
 */

function renderItems(zoteroItems) {
	var itemsMarkup = '';

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = zoteroItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var item = _step.value;

			var childItemsMarkup = renderChildItems(item);
			itemsMarkup += renderItem(item, childItemsMarkup);
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator['return']) {
				_iterator['return']();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return (0, _tplItemsTpl2['default'])({
		'zoteroItems': itemsMarkup
	});
}

/**
 * Render single Zotero child item
 * @param  {Object[]} zoteroChildItem - List of Zotero child items
 * @return {String}                   - Rendered markup of a Zotero child item
 */

function renderChildItem(zoteroChildItem) {
	return (0, _tplChildItemTpl2['default'])({
		'item': zoteroChildItem
	});
}

/**
 * Render list of Zotero child items
 * @param  {Object} zoteroItem - Parent Zotero item
 * @return {String}            - Rendered markup of a list of Zotero child items
 */

function renderChildItems(zoteroItem) {
	var childItemsMarkup = '';

	if (zoteroItem[_dataJs.CHILD_ITEMS_SYMBOL] && zoteroItem[_dataJs.CHILD_ITEMS_SYMBOL].length > 0) {
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = zoteroItem[_dataJs.CHILD_ITEMS_SYMBOL][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var childItem = _step2.value;

				childItemsMarkup += renderChildItem(childItem);
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2['return']) {
					_iterator2['return']();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
	}

	return (0, _tplChildItemsTpl2['default'])({
		'childItemsMarkup': childItemsMarkup
	});
}

/**
 * Render an expandable group of Zotero items
 * @param  {String} title       - A title of a group
 * @param  {boolean} expand     - Indicates whether group should appear pre-expanded
 * @param  {String} itemsMarkup - Rendered markup of underlying list of Zotero items
 * @return {String}             - Rendered markup of a group
 */

function renderGroup(title, expand, itemsMarkup) {
	return (0, _tplGroupTpl2['default'])({
		'title': title,
		'itemsMarkup': itemsMarkup,
		'expand': expand
	});
}

/**
 * Render a list of groups of Zotero items
 * @param  {ZoteroData|Object} data - Grouped data where each key is a group titles and
 *                                    each value is an array Zotero items
 * @return {String}                 - Rendered markup of a list of groups
 */

function renderGrouped(data) {
	var groupsMarkup = '';

	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var _step3$value = _slicedToArray(_step3.value, 2);

			var groupTitle = _step3$value[0];
			var group = _step3$value[1];

			var itemsMarkup = renderItems(group);
			var expand = group[_dataJs.GROUP_EXPANDED_SUMBOL];
			groupsMarkup += renderGroup(groupTitle, expand, itemsMarkup);
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3['return']) {
				_iterator3['return']();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	return (0, _tplGroupsTpl2['default'])({
		'groupsMarkup': groupsMarkup
	});
}

/**
 * Render Zotero publications into a DOM element
 * @param  {HTMLElement} container - DOM element of which contents is to be replaced
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */

function renderPublications(container, data) {
	var markup;

	if (data.grouped > 0) {
		markup = renderGrouped(data) + (0, _tplBrandingTpl2['default'])();
	} else {
		markup = renderItems(data) + (0, _tplBrandingTpl2['default'])();
	}

	container.innerHTML = markup;
	(0, _uiJs.addHandlers)(container);
}

},{"./data.js":"/srv/zotero/my-publications/src/js/data.js","./tpl/branding.tpl":"/srv/zotero/my-publications/src/js/tpl/branding.tpl","./tpl/child-item.tpl":"/srv/zotero/my-publications/src/js/tpl/child-item.tpl","./tpl/child-items.tpl":"/srv/zotero/my-publications/src/js/tpl/child-items.tpl","./tpl/group.tpl":"/srv/zotero/my-publications/src/js/tpl/group.tpl","./tpl/groups.tpl":"/srv/zotero/my-publications/src/js/tpl/groups.tpl","./tpl/item.tpl":"/srv/zotero/my-publications/src/js/tpl/item.tpl","./tpl/items.tpl":"/srv/zotero/my-publications/src/js/tpl/items.tpl","./ui.js":"/srv/zotero/my-publications/src/js/ui.js"}],"/srv/zotero/my-publications/src/js/tpl/branding.tpl":[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="zotero-branding">\n\tPowered by <span class="zotero-logo"></span>\n</div>';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/srv/zotero/my-publications/src/js/tpl/child-item.tpl":[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li>\n\t'+
((__t=( item.data.key ))==null?'':_.escape(__t))+
': '+
((__t=( item.data.itemType ))==null?'':_.escape(__t))+
' \n</li>';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/srv/zotero/my-publications/src/js/tpl/child-items.tpl":[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul class="zotero-child-items">\n\t'+
((__t=( childItemsMarkup ))==null?'':__t)+
'\n</ul>';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/srv/zotero/my-publications/src/js/tpl/group.tpl":[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="zotero-group'+
((__t=( expand ? ' zotero-group-expanded' : '' ))==null?'':_.escape(__t))+
'" aria-expanded="'+
((__t=( expand ? ' true' : 'false' ))==null?'':_.escape(__t))+
'" >\n\t<h3 class="zotero-group-title">'+
((__t=( title ))==null?'':_.escape(__t))+
'</h3>\n\t'+
((__t=( itemsMarkup ))==null?'':__t)+
'\n</li>';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/srv/zotero/my-publications/src/js/tpl/groups.tpl":[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul class="zotero-groups">\n\t'+
((__t=( groupsMarkup ))==null?'':__t)+
'\n</ul>';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/srv/zotero/my-publications/src/js/tpl/item.tpl":[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<li class="zotero-item zotero-'+
((__t=( data.itemType ))==null?'':_.escape(__t))+
'">\n\t'+
((__t=( item.citation ))==null?'':__t)+
'\n\t';
 if (data[Symbol.for('abstractNoteShort')] && data[Symbol.for('abstractNoteShort')].length) { 
__p+='\n    \t<p class="zotero-abstract-short">\n    \t\t'+
((__t=( data[Symbol.for('abstractNoteShort')] ))==null?'':_.escape(__t))+
'\n    \t\t<a class="zotero-abstract-toggle" aria-controls="za-'+
((__t=( item.key ))==null?'':_.escape(__t))+
'">...</a>\n    \t</p>\n\t';
 } 
__p+='\n\t';
 if (data.abstractNote && data.abstractNote.length) { 
__p+='\n    \t<p id="za-'+
((__t=( item.key ))==null?'':_.escape(__t))+
'" class="zotero-abstract" aria-expanded="false">\n    \t\t'+
((__t=( data.abstractNote ))==null?'':_.escape(__t))+
'\n    \t\t<a class="zotero-abstract-toggle">...</a>\n    \t</p>\n\t';
 } 
__p+='\n    '+
((__t=( childItemsMarkup ))==null?'':__t)+
'\n</li>';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/srv/zotero/my-publications/src/js/tpl/items.tpl":[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<ul class="zotero-items">\n\t'+
((__t=( zoteroItems ))==null?'':__t)+
'\n</ul>';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/srv/zotero/my-publications/src/js/ui.js":[function(require,module,exports){
/**
 * Attach interaction handlers for expanding groups and shortened abstracts.
 * @param {HTMLElement} container - A top-level DOM element (e.g. container) that contains Zotero items.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.addHandlers = addHandlers;
exports.toggleSpinner = toggleSpinner;

function addHandlers(container) {
	container.addEventListener('click', function (ev) {
		if (ev.target.classList.contains('zotero-abstract-toggle')) {
			var abstractShortEl = ev.target.parentNode.parentNode.querySelector('.zotero-abstract-short');
			var abstractEl = ev.target.parentNode.parentNode.querySelector('.zotero-abstract');
			var expanded = abstractShortEl.classList.toggle('zotero-abstract-expanded');
			abstractEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
		if (ev.target.classList.contains('zotero-group-title')) {
			var groupEl = ev.target.parentNode;
			var expanded = groupEl.classList.toggle('zotero-group-expanded');
			groupEl.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	});
}

/**
 * Toggle CSS class that gives a visual loading feedback. Optionally allows to explicetly specify
 * whether to display or hide visual feedback.
 * @param  {HTMLElement} container - A DOM element to which visual feedback class should be attached
 * @param  {boolean} [activate]    - Explicitely indicate whether to add or remove visual feedback
 */

function toggleSpinner(container, activate) {
	var method = activate === null ? container.classList.toggle : activate ? container.classList.add : container.classList.remove;
	method.call(container.classList, 'zotero-loading');
}

},{}]},{},["/srv/zotero/my-publications/src/js/main-modern.js"])("/srv/zotero/my-publications/src/js/main-modern.js")
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L3pvdGVyby9teS1wdWJsaWNhdGlvbnMvc3JjL2pzL2FwaS5qcyIsIi9zcnYvem90ZXJvL215LXB1YmxpY2F0aW9ucy9zcmMvanMvZGF0YS5qcyIsIi9zcnYvem90ZXJvL215LXB1YmxpY2F0aW9ucy9zcmMvanMvbWFpbi1tb2Rlcm4uanMiLCIvc3J2L3pvdGVyby9teS1wdWJsaWNhdGlvbnMvc3JjL2pzL21haW4uanMiLCIvc3J2L3pvdGVyby9teS1wdWJsaWNhdGlvbnMvc3JjL2pzL3JlbmRlci5qcyIsInNyYy9qcy90cGwvYnJhbmRpbmcudHBsIiwic3JjL2pzL3RwbC9jaGlsZC1pdGVtLnRwbCIsInNyYy9qcy90cGwvY2hpbGQtaXRlbXMudHBsIiwic3JjL2pzL3RwbC9ncm91cC50cGwiLCJzcmMvanMvdHBsL2dyb3Vwcy50cGwiLCJzcmMvanMvdHBsL2l0ZW0udHBsIiwic3JjL2pzL3RwbC9pdGVtcy50cGwiLCIvc3J2L3pvdGVyby9teS1wdWJsaWNhdGlvbnMvc3JjL2pzL3VpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7c0JDQWMsUUFBUTs7OztzQkFHZixXQUFXOztBQUVYLElBQU0sMEJBQTBCLEdBQUcsTUFBTSxPQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQVFuRSxTQUFTLGVBQWUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQ2pELEtBQUcsUUFBUSxFQUFFO0FBQ1osTUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQUksS0FBSyxHQUFHLEVBQUUsQ0FBQzs7QUFFZixPQUFJLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUk7QUFDbkMsT0FBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FB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QUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsUUFBUSxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQztHQUN0RTtBQUNELE1BQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7QUFDdEQsT0FBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDbkMsT0FBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNqRSxVQUFPLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxRQUFRLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0dBQ25FO0VBQ0QsQ0FBQyxDQUFDO0NBQ0g7Ozs7Ozs7OztBQVFNLFNBQVMsYUFBYSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDbEQsS0FBSSxNQUFNLEdBQUcsUUFBUSxLQUFLLElBQUksR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxRQUFRLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDOUgsT0FBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUM7Q0FDbkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7XG5cdENISUxEX0lURU1TX1NZTUJPTFxufSBmcm9tICcuL2RhdGEuanMnO1xuXG5leHBvcnQgY29uc3QgQUJTVFJBQ1RfTk9URV9TSE9SVF9TWU1CT0wgPSBTeW1ib2wuZm9yKCdhYnN0cmFjdE5vdGVTaG9ydCcpO1xuXG4vKipcbiAqIFByb2Nlc3MgcmF3IEFQSSByZXNwb25zZVxuICogQHBhcmFtICB7T2JqZWN0W119IHJlc3BvbnNlIC0gVGhlIHJhdyBBUEkgcmVzcG9uc2VcbiAqIEBwYXJhbSAge09iamVjdH0gY29uZmlnICAgICAtIEdsb2JhbCBab3Rlcm9QdWJsaWNhdGlvbnMgY29uZmlnXG4gKiBAcmV0dXJuIHtPYmplY3RbXX0gICAgICAgICAgLSBQcm9jZXNzZWQgQVBJIHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzUmVzcG9uc2UocmVzcG9uc2UsIGNvbmZpZykge1xuXHRpZihyZXNwb25zZSkge1xuXHRcdGxldCBjaGlsZEl0ZW1zID0gW107XG5cdFx0bGV0IGluZGV4ID0ge307XG5cblx0XHRmb3IodmFyIGkgPSByZXNwb25zZS5sZW5ndGg7IGktLTsgKSB7XG5cdFx0XHRsZXQgaXRlbSA9IHJlc3BvbnNlW2ldO1xuXHRcdFx0aWYoaXRlbS5kYXRhICYmIGl0ZW0uZGF0YS5hYnN0cmFjdE5vdGUpIHtcblx0XHRcdFx0bGV0IGFic3RyYWN0Tm90ZVNob3J0ID0gaXRlbS5kYXRhLmFic3RyYWN0Tm90ZS5zdWJzdHIoMCwgY29uZmlnLnNob3J0ZW5lZEFic3RyYWN0TGVuZ2h0KTtcblx0XHRcdFx0YWJzdHJhY3ROb3RlU2hvcnQgPSBhYnN0cmFjdE5vdGVTaG9ydC5zdWJzdHIoXG5cdFx0XHRcdFx0MCxcblx0XHRcdFx0XHRNYXRoLm1pbihhYnN0cmFjdE5vdGVTaG9ydC5sZW5ndGgsIGFic3RyYWN0Tm90ZVNob3J0Lmxhc3RJbmRleE9mKCcgJykpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGl0ZW0uZGF0YVtBQlNUUkFDVF9OT1RFX1NIT1JUX1NZTUJPTF0gPSBhYnN0cmFjdE5vdGVTaG9ydDtcblx0XHRcdH1cblx0XHRcdGlmKGl0ZW0uZGF0YSAmJiBpdGVtLmRhdGEucGFyZW50SXRlbSkge1xuXHRcdFx0XHRyZXNwb25zZS5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdGNoaWxkSXRlbXMucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHRcdGluZGV4W2l0ZW0ua2V5XSA9IGl0ZW07XG5cdFx0fVxuXG5cdFx0Zm9yKGxldCBpdGVtIG9mIGNoaWxkSXRlbXMpIHtcblx0XHRcdGlmKCFpbmRleFtpdGVtLmRhdGEucGFyZW50SXRlbV0pIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKGBpdGVtICR7aXRlbS5rZXl9IGhhcyBwYXJlbnRJdGVtICR7aXRlbS5kYXRhLnBhcmVudEl0ZW19IHRoYXQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGRhdGFzZXRgKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmKCFpbmRleFtpdGVtLmRhdGEucGFyZW50SXRlbV1bQ0hJTERfSVRFTVNfU1lNQk9MXSkge1xuXHRcdFx0XHRpbmRleFtpdGVtLmRhdGEucGFyZW50SXRlbV1bQ0hJTERfSVRFTVNfU1lNQk9MXSA9IFtdO1xuXHRcdFx0fVxuXHRcdFx0aW5kZXhbaXRlbS5kYXRhLnBhcmVudEl0ZW1dW0NISUxEX0lURU1TX1NZTUJPTF0ucHVzaChpdGVtKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGZldGNoIGRhdGEgdW50aWwgdGhlcmUncyBubyBtb3JlIHJlbD1cIm5leHRcIiB1cmwgaW4gTGluayBoZWFkZXJcbiAqIEBwYXJhbSAge1N0cmluZ30gdXJsICAgICAgICAgICAgIC0gQW4gdXJsIGZvciBpbml0aWFsIGRhdGEgcmVxdWVzdFxuICogQHBhcmFtICB7T2JqZWN0fSBbb3B0aW9uc10gICAgICAgLSBDdXN0b20gc2V0dGluZ3MgKGUuZy4gaGVhZGVycykgcGFzc2VkIG92ZXIgdG8gZmV0Y2goKSBmb3IgZWFjaCByZXF1ZXN0XG4gKiBAcGFyYW0gIHtPYmplY3RbXX0gW2pzb25kYXRhPVtdXSAtIFVzZWQgZm9yIGRhdGEgYWdncmVnYXRpb24gaW4gcmVjdXJzaXZlIGNhbGxzXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAgICAgICAgICAgICAgICAtIFJlc29sdmVkIHdpdGggY29tcGxldGUgZGF0YXNldCBvciByZWplY3RlZCBvbiBlcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hVbnRpbEV4aGF1c3RlZCh1cmwsIG9wdGlvbnMsIGpzb25kYXRhKSB7XG5cdGxldCByZWxSZWdleCA9IC88KGh0dHBzPzpcXC9cXC8od3d3XFwuKT9bLWEtekEtWjAtOUA6JS5fXFwrfiM9XXsyLDI1Nn1cXC5bYS16XXsyLDZ9XFxiKFstYS16QS1aMC05QDolX1xcKy5+Iz8mLy89XSopKT47XFxzKnJlbD1cIm5leHRcIi87XG5cdGpzb25kYXRhID0ganNvbmRhdGEgfHwgW107XG5cblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcblx0XHRcdFx0aWYocmVzcG9uc2UuaGVhZGVycy5oYXMoJ0xpbmsnKSkge1xuXHRcdFx0XHRcdGxldCBtYXRjaGVzID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0xpbmsnKS5tYXRjaChyZWxSZWdleCk7XG5cdFx0XHRcdFx0aWYobWF0Y2hlcyAmJiBtYXRjaGVzLmxlbmd0aCA+PSAyKSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5qc29uKCkudGhlbihmdW5jdGlvbihqc29uRGF0YVBhcnQpIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShmZXRjaFVudGlsRXhoYXVzdGVkKG1hdGNoZXNbMV0sIG9wdGlvbnMsIF8udW5pb24oanNvbmRhdGEsIGpzb25EYXRhUGFydCkpKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5qc29uKCkudGhlbihmdW5jdGlvbihqc29uRGF0YVBhcnQpIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShfLnVuaW9uKGpzb25kYXRhLCBqc29uRGF0YVBhcnQpKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXNwb25zZS5qc29uKCkudGhlbihmdW5jdGlvbihqc29uRGF0YVBhcnQpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoXy51bmlvbihqc29uZGF0YSwganNvbkRhdGFQYXJ0KSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlamVjdChuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgc3RhdHVzIGNvZGUgJHtyZXNwb25zZS5zdGF0dXN9IHdoZW4gcmVxdWVzdGluZyAke3VybH1gKSk7XG5cdFx0XHR9XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oKSB7XG5cdFx0XHRyZWplY3QobmV3IEVycm9yKGBVbmV4cGVjdGVkIGVycm9yIHdoZW4gcmVxdWVzdGluZyAke3VybH1gKSk7XG5cdFx0fSk7XG5cdH0pO1xufVxuIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7XG5cdHByb2Nlc3NSZXNwb25zZVxufSBmcm9tICcuL2FwaS5qcyc7XG5cbmV4cG9ydCBjb25zdCBHUk9VUEVEX05PTkUgPSAwO1xuZXhwb3J0IGNvbnN0IEdST1VQRURfQllfVFlQRSA9IDE7XG5leHBvcnQgY29uc3QgR1JPVVBFRF9CWV9DT0xMRUNUSU9OID0gMjtcbmV4cG9ydCBjb25zdCBDSElMRF9JVEVNU19TWU1CT0wgPSBTeW1ib2wuZm9yKCdjaGlsZEl0ZW1zJyk7XG5leHBvcnQgY29uc3QgR1JPVVBfRVhQQU5ERURfU1VNQk9MID0gU3ltYm9sLmZvcignZ3JvdXBFeHBhbmRlZCcpO1xuXG4vKipcbiAqIFN0b3JlLCBFbmNhcHN1bGF0ZSBhbmQgTWFuaXB1bGF0ZSBab3Rlcm8gQVBJIGRhdGFcbiAqIEBwYXJhbSB7T2JqZWN0W119IGRhdGEgICAtIFpvdGVybyBBUEkgZGF0YSB0byBlbmNhcHN1bGF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtjb25maWddIC0gWm90ZXJvUHVibGljYXRpb25zIGNvbmZpZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gWm90ZXJvRGF0YShkYXRhLCBjb25maWcpIHtcblx0dGhpcy5yYXcgPSB0aGlzLmRhdGEgPSBwcm9jZXNzUmVzcG9uc2UoZGF0YSwgY29uZmlnKTtcblx0dGhpcy5ncm91cGVkID0gR1JPVVBFRF9OT05FO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbGVuZ3RoJywge1xuXHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmRhdGEubGVuZ3RoO1xuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogR3JvdXAgZGF0YSBieSB0eXBlXG4gKiBAcGFyYW0gIHtTdHJpbmd8U3RyaW5nW119IFtleHBhbmQ9W11dIC0gTGlzdCBvZiB0eXBlcyB3aGljaCBzaG91bGQgYXBwZWFyIHByZS1leHBhbmRlZC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbHRlcm5hdGl2ZWx5IHN0cmluZyBcImFsbFwiIGlzIGFjY2VwdGVkLlxuICovXG5ab3Rlcm9EYXRhLnByb3RvdHlwZS5ncm91cEJ5VHlwZSA9IGZ1bmN0aW9uKGV4cGFuZCkge1xuXHRsZXQgZ3JvdXBlZERhdGEgPSB7fTtcblx0ZXhwYW5kID0gZXhwYW5kIHx8IFtdO1xuXHRmb3IobGV0IGkgPSB0aGlzLnJhdy5sZW5ndGg7IGktLTsgKSB7XG5cdFx0bGV0IGl0ZW0gPSB0aGlzLnJhd1tpXTtcblxuXHRcdGlmKCFncm91cGVkRGF0YVtpdGVtLmRhdGEuaXRlbVR5cGVdKSB7XG5cdFx0XHRncm91cGVkRGF0YVtpdGVtLmRhdGEuaXRlbVR5cGVdID0gW107XG5cdFx0fVxuXHRcdGdyb3VwZWREYXRhW2l0ZW0uZGF0YS5pdGVtVHlwZV0ucHVzaChpdGVtKTtcblx0XHRncm91cGVkRGF0YVtpdGVtLmRhdGEuaXRlbVR5cGVdW0dST1VQX0VYUEFOREVEX1NVTUJPTF0gPSBleHBhbmQgPT09ICdhbGwnIHx8IF8uY29udGFpbnMoZXhwYW5kLCBpdGVtLmRhdGEuaXRlbVR5cGUpO1xuXHR9XG5cdHRoaXMuZGF0YSA9IGdyb3VwZWREYXRhO1xuXHR0aGlzLmdyb3VwZWQgPSBHUk9VUEVEX0JZX1RZUEU7XG59O1xuXG4vKipcbiAqIEdyb3VwIGRhdGEgYnkgdG9wLWxldmVsIGNvbGxlY3Rpb25zXG4gKi9cblpvdGVyb0RhdGEucHJvdG90eXBlLmdyb3VwQnlDb2xsZWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHR0aHJvdyBuZXcgRXJyb3IoJ2dyb3VwQnlDb2xsZWN0aW9ucyBpcyBub3QgaW1wbGVtZW50ZWQgeWV0LicpO1xufTtcblxuLyoqXG4gKiBDdXN0b20gaXRlcmF0b3IgdG8gYWxsb3cgZm9yLi5vZiBpbnRlcmF0aW9uIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBkYXRhIGlzIGdyb3VwZWQgb3Igbm90LlxuICogRm9yIHVuZ3JvdXBlZCBkYXRhIGVhY2ggaW50ZXJhdGlvbiByZXR1cm5zIHNpbmdsZSBab3Rlcm8gaXRlbVxuICogRm9yIGdyb3VwZWQgZGF0YSBlYWNoIGludGVyYXRpb25yIHJldHVybnMgYW4gYSBwYWlyIG9mIGdyb3VwIHRpdGxlIGFuZCBhbiBBcnJheSBvZiBab3Rlcm8gaXRlbXNcbiAqL1xuWm90ZXJvRGF0YS5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuXHRsZXQgaSA9IDA7XG5cdGlmKHRoaXMuZ3JvdXBlZCA+IDApIHtcblx0XHRsZXQga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5leHQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHZhbHVlOiBpIDwga2V5cy5sZW5ndGggPyBba2V5c1tpXSwgdGhpcy5kYXRhW2tleXNbaV1dXSA6IG51bGwsXG5cdFx0XHRcdFx0ZG9uZTogaSsrID49IGtleXMubGVuZ3RoXG5cdFx0XHRcdH07XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuZXh0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR2YWx1ZTogaSA8IHRoaXMuZGF0YS5sZW5ndGggPyB0aGlzLmRhdGFbaV0gOiBudWxsLFxuXHRcdFx0XHRcdGRvbmU6IGkrKyA+PSB0aGlzLmRhdGEubGVuZ3RoXG5cdFx0XHRcdH07XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHR9O1xuXHR9XG59O1xuIiwiaW1wb3J0IHsgWm90ZXJvUHVibGljYXRpb25zIH0gZnJvbSAnLi9tYWluLmpzJztcblxubW9kdWxlLmV4cG9ydHMgPSBab3Rlcm9QdWJsaWNhdGlvbnM7IiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7XG5cdHJlbmRlclB1YmxpY2F0aW9uc1xufSBmcm9tICcuL3JlbmRlci5qcyc7XG5pbXBvcnQge1xuXHRmZXRjaFVudGlsRXhoYXVzdGVkXG59IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7XG5cdFpvdGVyb0RhdGFcbn0gZnJvbSAnLi9kYXRhLmpzJztcbmltcG9ydCB7XG5cdHRvZ2dsZVNwaW5uZXJcbn0gZnJvbSAnLi91aS5qcyc7XG5cbi8qKlxuICogQXBwbGljYXRpb24gZW50cnkgcG9pbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBbY29uZmlnXSAtIENvbmZpZ3VyYXRpb24gb2JqZWN0IHRoYXQgd2lsbCBzZWxlY3RpdmVseSBvdmVycmlkZSB0aGUgZGVmYXVsdHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvdGVyb1B1YmxpY2F0aW9ucygpIHtcblx0aWYoYXJndW1lbnRzLmxlbmd0aCA8PSAxKSB7XG5cdFx0dGhpcy5jb25maWcgPSBfLmV4dGVuZCh7fSwgdGhpcy5kZWZhdWx0cywgYXJndW1lbnRzID8gYXJndW1lbnRzWzBdIDoge30pO1xuXHR9IGVsc2UgaWYoYXJndW1lbnRzLmxlbmd0aCA8PSAzKSB7XG5cdFx0dGhpcy5jb25maWcgPSBfLmV4dGVuZCh7fSwgdGhpcy5kZWZhdWx0cywgYXJndW1lbnRzWzJdKTtcblx0XHRyZXR1cm4gdGhpcy5yZW5kZXIoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcblx0XHRcdG5ldyBFcnJvcignWm90ZXJvUHVibGljYXRpb25zIHRha2VzIGJldHdlZW4gb25lIGFuZCB0aHJlZSBhcmd1bWVudHMuICR7YXJndW1lbnRzLmxlbmd0aH0gaXMgdG9vIG1hbnkuJylcblx0XHQpO1xuXHR9XG59XG5cbi8qKlxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdFxuICogQHR5cGUge09iamVjdH1cbiAqL1xuWm90ZXJvUHVibGljYXRpb25zLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcblx0YXBpQmFzZTogJ2FwaS56b3Rlcm8ub3JnJyxcblx0bGltaXQ6IDEwMCxcblx0Y2l0YXRpb25TdHlsZTogJycsXG5cdGluY2x1ZGU6IFsnZGF0YScsICdjaXRhdGlvbiddLFxuXHRzaG9ydGVuZWRBYnN0cmFjdExlbmdodDogMjUwLFxuXHRncm91cDogZmFsc2UsXG5cdGV4cGFuZDogJ2FsbCdcbn07XG5cbi8qKlxuICogQnVpbGQgdXJsIGZvciBhbiBlbmRwb2ludCB0aGVuIGZldGNoIGVudGlyZSBkYXRhc2V0IHJlY3Vyc2l2ZWx5XG4gKiBAcGFyYW0gIHtTdHJpbmd9IGVuZHBvaW50IC0gQW4gQVBJIGVuZHBvaW50IGZyb20gd2hpY2ggZGF0YSBzaG91bGQgYmUgb2J0YWluZWRcbiAqIEByZXR1cm4ge1Byb21pc2V9ICAgICAgICAgLSBSZXNvbHZlZCB3aXRoIFpvdGVyb0RhdGEgb2JqZWN0IG9uIHN1Y2Nlc3MsIHJlamVjdGVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gY2FzZSBvZiBhbnkgbmV0d29yay9yZXNwb25zZSBwcm9ibGVtc1xuICovXG5ab3Rlcm9QdWJsaWNhdGlvbnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGVuZHBvaW50KSB7XG5cdGxldCBhcGlCYXNlID0gdGhpcy5jb25maWcuYXBpQmFzZSxcblx0XHRsaW1pdCA9IHRoaXMuY29uZmlnLmxpbWl0LFxuXHRcdHN0eWxlID0gdGhpcy5jb25maWcuY2l0YXRpb25TdHlsZSxcblx0XHRpbmNsdWRlID0gdGhpcy5jb25maWcuaW5jbHVkZS5qb2luKCcsJyksXG5cdFx0dXJsID0gYGh0dHBzOi8vJHthcGlCYXNlfS8ke2VuZHBvaW50fT9pbmNsdWRlPSR7aW5jbHVkZX0mbGltaXQ9JHtsaW1pdH0mbGlua3dyYXA9MSZvcmRlcj1kYXRlTW9kaWZpZWQmc29ydD1kZXNjJnN0YXJ0PTAmc3R5bGU9JHtzdHlsZX1gLFxuXHRcdG9wdGlvbnMgPSB7XG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdCdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbidcblx0XHRcdH1cblx0XHR9O1xuXG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRsZXQgcHJvbWlzZSA9IGZldGNoVW50aWxFeGhhdXN0ZWQodXJsLCBvcHRpb25zKTtcblx0XHRwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2VKc29uKSB7XG5cdFx0XHRsZXQgZGF0YSA9IG5ldyBab3Rlcm9EYXRhKHJlc3BvbnNlSnNvbiwgdGhpcy5jb25maWcpO1xuXHRcdFx0aWYodGhpcy5jb25maWcuZ3JvdXAgPT09ICd0eXBlJykge1xuXHRcdFx0XHRkYXRhLmdyb3VwQnlUeXBlKHRoaXMuY29uZmlnLmV4cGFuZCk7XG5cdFx0XHR9XG5cdFx0XHRyZXNvbHZlKGRhdGEpO1xuXHRcdH0uYmluZCh0aGlzKSk7XG5cdFx0cHJvbWlzZS5jYXRjaChyZWplY3QpO1xuXHR9LmJpbmQodGhpcykpO1xufTtcblxuLyoqXG4gKiBSZW5kZXIgbG9jYWwgb3IgcmVtb3RlIGl0ZW1zLlxuICogQHBhcmFtICB7U3RyaW5nfFpvdGVyb0RhdGF9IGVuZHBvaW50T3JEYXRhIC0gRGF0YSBjb250YWludW5nIHB1YmxpY2F0aW9ucyB0byBiZSByZW5kZXJlZFxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciAgICAgICAgICAgIC0gQSBET00gZWxlbWVudCB3aGVyZSBwdWJsaWNhdGlvbnMgd2lsbCBiZSByZW5kZXJlZFxuICogQHJldHVybiB7UHJvbWlzZX0gICAgICAgICAgICAgICAgICAgICAgICAgIC0gUmVzb2x2ZWQgd2hlbiByZW5kZXJlZCBvciByZWplY3RlZCBvbiBlcnJvci5cbiAqL1xuWm90ZXJvUHVibGljYXRpb25zLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihlbmRwb2ludE9yRGF0YSwgY29udGFpbmVyKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRpZighKGNvbnRhaW5lciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuXHRcdFx0cmVqZWN0KG5ldyBFcnJvcignU2Vjb25kIGFyZ3VtZW50IHRvIHJlbmRlcigpIG1ldGhvZCBtdXN0IGJlIGEgRE9NIGVsZW1lbnQnKSk7XG5cdFx0fVxuXHRcdGlmKGVuZHBvaW50T3JEYXRhIGluc3RhbmNlb2YgWm90ZXJvRGF0YSkge1xuXHRcdFx0bGV0IGRhdGEgPSBlbmRwb2ludE9yRGF0YTtcblx0XHRcdHJlbmRlclB1YmxpY2F0aW9ucyhjb250YWluZXIsIGRhdGEpO1xuXHRcdFx0cmVzb2x2ZSgpO1xuXHRcdH0gZWxzZSBpZih0eXBlb2YgZW5kcG9pbnRPckRhdGEgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRsZXQgZW5kcG9pbnQgPSBlbmRwb2ludE9yRGF0YTtcblx0XHRcdHRvZ2dsZVNwaW5uZXIoY29udGFpbmVyLCB0cnVlKTtcblx0XHRcdGxldCBwcm9taXNlID0gdGhpcy5nZXQoZW5kcG9pbnQpO1xuXHRcdFx0cHJvbWlzZS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0dG9nZ2xlU3Bpbm5lcihjb250YWluZXIsIGZhbHNlKTtcblx0XHRcdFx0cmVuZGVyUHVibGljYXRpb25zKGNvbnRhaW5lciwgZGF0YSk7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH0pO1xuXHRcdFx0cHJvbWlzZS5jYXRjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9nZ2xlU3Bpbm5lcihjb250YWluZXIsIGZhbHNlKTtcblx0XHRcdFx0cmVqZWN0KGFyZ3VtZW50c1swXSk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVqZWN0KG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gcmVuZGVyKCkgbWV0aG9kIG11c3QgYmUgYW4gZW5kcG9pbnQgb3IgYW4gaW5zdGFuY2Ugb2YgWm90ZXJvRGF0YScpKTtcblx0XHR9XG5cdH0uYmluZCh0aGlzKSk7XG59O1xuXG4vKipcbiAqIE1ha2UgWm90ZXJvRGF0YSBwdWJsaWNseSBhY2Nlc3NpYmxlIHVuZGVybmVhdGggWm90ZXJvUHVibGljYXRpb25zXG4gKiBAdHlwZSB7Wm90ZXJvRGF0YX1cbiAqL1xuWm90ZXJvUHVibGljYXRpb25zLlpvdGVyb0RhdGEgPSBab3Rlcm9EYXRhO1xuIiwiaW1wb3J0IGl0ZW1UcGwgZnJvbSAnLi90cGwvaXRlbS50cGwnO1xuaW1wb3J0IGl0ZW1zVHBsIGZyb20gJy4vdHBsL2l0ZW1zLnRwbCc7XG5pbXBvcnQgZ3JvdXBUcGwgZnJvbSAnLi90cGwvZ3JvdXAudHBsJztcbmltcG9ydCBncm91cHNUcGwgZnJvbSAnLi90cGwvZ3JvdXBzLnRwbCc7XG5pbXBvcnQgY2hpbGRJdGVtc1RwbCBmcm9tICcuL3RwbC9jaGlsZC1pdGVtcy50cGwnO1xuaW1wb3J0IGNoaWxkSXRlbVRwbCBmcm9tICcuL3RwbC9jaGlsZC1pdGVtLnRwbCc7XG5pbXBvcnQgYnJhbmRpbmdUcGwgZnJvbSAnLi90cGwvYnJhbmRpbmcudHBsJztcbmltcG9ydCB7XG5cdGFkZEhhbmRsZXJzXG59IGZyb20gJy4vdWkuanMnO1xuaW1wb3J0IHtcblx0Q0hJTERfSVRFTVNfU1lNQk9MLFxuXHRHUk9VUF9FWFBBTkRFRF9TVU1CT0xcbn0gZnJvbSAnLi9kYXRhLmpzJztcblxuLyoqXG4gKiBSZW5kZXIgc2luZ2xlIFpvdGVybyBpdGVtXG4gKiBAcGFyYW0gIHtPYmplY3R9IHpvdGVyb0l0ZW0gICAgICAgLSBTaW5nbGUgWm90ZXJvIGl0ZW0gZGF0YVxuICogQHBhcmFtICB7U3RyaW5nfSBjaGlsZEl0ZW1zTWFya3VwIC0gUmVuZGVyZWQgbWFya3VwIG9mIGEgbGlzdCBvZiBab3Rlcm8gY2hpbGQgaXRlbXNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgICAgICAgICAgICAtIFJlbmRlcmVkIG1hcmt1cCBvZiBhIFpvdGVybyBpdGVtXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJJdGVtKHpvdGVyb0l0ZW0sIGNoaWxkSXRlbXNNYXJrdXApIHtcblx0cmV0dXJuIGl0ZW1UcGwoe1xuXHRcdCdpdGVtJzogem90ZXJvSXRlbSxcblx0XHQnZGF0YSc6IHpvdGVyb0l0ZW0uZGF0YSxcblx0XHQnY2hpbGRJdGVtc01hcmt1cCc6IGNoaWxkSXRlbXNNYXJrdXAgfHwgJydcblx0fSk7XG59XG5cbi8qKlxuICogUmVuZGVyIGEgbGlzdCBvZiBab3Rlcm8gaXRlbXNcbiAqIEBwYXJhbSAge1pvdGVyb0RhdGF8T2JqZWN0W119IHpvdGVyb0l0ZW1zIC0gTGlzdCBvZiBab3Rlcm8gaXRlbXNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgICAgICAgICAgICAgICAgICAgIC0gUmVuZGVyZWQgbWFya3VwIG9mIGEgbGlzdCBvZiBab3Rlcm8gaXRlbXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckl0ZW1zKHpvdGVyb0l0ZW1zKSB7XG5cdGxldCBpdGVtc01hcmt1cCA9ICcnO1xuXG5cdGZvciAobGV0IGl0ZW0gb2Ygem90ZXJvSXRlbXMpIHtcblx0XHRsZXQgY2hpbGRJdGVtc01hcmt1cCA9IHJlbmRlckNoaWxkSXRlbXMoaXRlbSk7XG5cdFx0aXRlbXNNYXJrdXAgKz0gcmVuZGVySXRlbShpdGVtLCBjaGlsZEl0ZW1zTWFya3VwKTtcblx0fVxuXG5cdHJldHVybiBpdGVtc1RwbCh7XG5cdFx0J3pvdGVyb0l0ZW1zJzogaXRlbXNNYXJrdXBcblx0fSk7XG59XG5cbi8qKlxuICogUmVuZGVyIHNpbmdsZSBab3Rlcm8gY2hpbGQgaXRlbVxuICogQHBhcmFtICB7T2JqZWN0W119IHpvdGVyb0NoaWxkSXRlbSAtIExpc3Qgb2YgWm90ZXJvIGNoaWxkIGl0ZW1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAgICAgICAgICAgICAgIC0gUmVuZGVyZWQgbWFya3VwIG9mIGEgWm90ZXJvIGNoaWxkIGl0ZW1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNoaWxkSXRlbSh6b3Rlcm9DaGlsZEl0ZW0pIHtcblx0cmV0dXJuIGNoaWxkSXRlbVRwbCh7XG5cdFx0J2l0ZW0nOiB6b3Rlcm9DaGlsZEl0ZW1cblx0fSk7XG59XG5cbi8qKlxuICogUmVuZGVyIGxpc3Qgb2YgWm90ZXJvIGNoaWxkIGl0ZW1zXG4gKiBAcGFyYW0gIHtPYmplY3R9IHpvdGVyb0l0ZW0gLSBQYXJlbnQgWm90ZXJvIGl0ZW1cbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgICAgICAtIFJlbmRlcmVkIG1hcmt1cCBvZiBhIGxpc3Qgb2YgWm90ZXJvIGNoaWxkIGl0ZW1zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJDaGlsZEl0ZW1zKHpvdGVyb0l0ZW0pIHtcblx0bGV0IGNoaWxkSXRlbXNNYXJrdXAgPSAnJztcblxuXHRpZih6b3Rlcm9JdGVtW0NISUxEX0lURU1TX1NZTUJPTF0gJiYgem90ZXJvSXRlbVtDSElMRF9JVEVNU19TWU1CT0xdLmxlbmd0aCA+IDApIHtcblx0XHRmb3IgKGxldCBjaGlsZEl0ZW0gb2Ygem90ZXJvSXRlbVtDSElMRF9JVEVNU19TWU1CT0xdKSB7XG5cdFx0XHRjaGlsZEl0ZW1zTWFya3VwICs9IHJlbmRlckNoaWxkSXRlbShjaGlsZEl0ZW0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBjaGlsZEl0ZW1zVHBsKHtcblx0XHQnY2hpbGRJdGVtc01hcmt1cCc6IGNoaWxkSXRlbXNNYXJrdXBcblx0fSk7XG59XG5cbi8qKlxuICogUmVuZGVyIGFuIGV4cGFuZGFibGUgZ3JvdXAgb2YgWm90ZXJvIGl0ZW1zXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHRpdGxlICAgICAgIC0gQSB0aXRsZSBvZiBhIGdyb3VwXG4gKiBAcGFyYW0gIHtib29sZWFufSBleHBhbmQgICAgIC0gSW5kaWNhdGVzIHdoZXRoZXIgZ3JvdXAgc2hvdWxkIGFwcGVhciBwcmUtZXhwYW5kZWRcbiAqIEBwYXJhbSAge1N0cmluZ30gaXRlbXNNYXJrdXAgLSBSZW5kZXJlZCBtYXJrdXAgb2YgdW5kZXJseWluZyBsaXN0IG9mIFpvdGVybyBpdGVtc1xuICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgICAgICAtIFJlbmRlcmVkIG1hcmt1cCBvZiBhIGdyb3VwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJHcm91cCh0aXRsZSwgZXhwYW5kLCBpdGVtc01hcmt1cCkge1xuXHRyZXR1cm4gZ3JvdXBUcGwoe1xuXHRcdCd0aXRsZSc6IHRpdGxlLFxuXHRcdCdpdGVtc01hcmt1cCc6IGl0ZW1zTWFya3VwLFxuXHRcdCdleHBhbmQnOiBleHBhbmRcblx0fSk7XG59XG5cbi8qKlxuICogUmVuZGVyIGEgbGlzdCBvZiBncm91cHMgb2YgWm90ZXJvIGl0ZW1zXG4gKiBAcGFyYW0gIHtab3Rlcm9EYXRhfE9iamVjdH0gZGF0YSAtIEdyb3VwZWQgZGF0YSB3aGVyZSBlYWNoIGtleSBpcyBhIGdyb3VwIHRpdGxlcyBhbmRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWFjaCB2YWx1ZSBpcyBhbiBhcnJheSBab3Rlcm8gaXRlbXNcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICAgICAgICAgICAgIC0gUmVuZGVyZWQgbWFya3VwIG9mIGEgbGlzdCBvZiBncm91cHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckdyb3VwZWQoZGF0YSkge1xuXHRsZXQgZ3JvdXBzTWFya3VwID0gJyc7XG5cblx0Zm9yKGxldCBbIGdyb3VwVGl0bGUsIGdyb3VwIF0gb2YgZGF0YSkge1xuXHRcdGxldCBpdGVtc01hcmt1cCA9IHJlbmRlckl0ZW1zKGdyb3VwKTtcblx0XHRsZXQgZXhwYW5kID0gZ3JvdXBbR1JPVVBfRVhQQU5ERURfU1VNQk9MXTtcblx0XHRncm91cHNNYXJrdXAgKz0gcmVuZGVyR3JvdXAoZ3JvdXBUaXRsZSwgZXhwYW5kLCBpdGVtc01hcmt1cCk7XG5cdH1cblxuXHRyZXR1cm4gZ3JvdXBzVHBsKHtcblx0XHQnZ3JvdXBzTWFya3VwJzogZ3JvdXBzTWFya3VwXG5cdH0pO1xufVxuXG4vKipcbiAqIFJlbmRlciBab3Rlcm8gcHVibGljYXRpb25zIGludG8gYSBET00gZWxlbWVudFxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciAtIERPTSBlbGVtZW50IG9mIHdoaWNoIGNvbnRlbnRzIGlzIHRvIGJlIHJlcGxhY2VkXG4gKiBAcGFyYW0gIHtab3Rlcm9EYXRhfSBkYXRhICAgICAgIC0gU291cmNlIG9mIHB1YmxpY2F0aW9ucyB0byBiZSByZW5kZXJlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyUHVibGljYXRpb25zKGNvbnRhaW5lciwgZGF0YSkge1xuXHR2YXIgbWFya3VwO1xuXG5cdGlmKGRhdGEuZ3JvdXBlZCA+IDApIHtcblx0XHRtYXJrdXAgPSByZW5kZXJHcm91cGVkKGRhdGEpICsgYnJhbmRpbmdUcGwoKTtcblx0fSBlbHNlIHtcblx0XHRtYXJrdXAgPSByZW5kZXJJdGVtcyhkYXRhKSArIGJyYW5kaW5nVHBsKCk7XG5cdH1cblxuXHRjb250YWluZXIuaW5uZXJIVE1MID0gbWFya3VwO1xuXHRhZGRIYW5kbGVycyhjb250YWluZXIpO1xufVxuIiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG52YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4scHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcbndpdGgob2JqfHx7fSl7XG5fX3ArPSc8ZGl2IGNsYXNzPVwiem90ZXJvLWJyYW5kaW5nXCI+XFxuXFx0UG93ZXJlZCBieSA8c3BhbiBjbGFzcz1cInpvdGVyby1sb2dvXCI+PC9zcGFuPlxcbjwvZGl2Pic7XG59XG5yZXR1cm4gX19wO1xufTtcbiIsInZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xudmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLHByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XG53aXRoKG9ianx8e30pe1xuX19wKz0nPGxpPlxcblxcdCcrXG4oKF9fdD0oIGl0ZW0uZGF0YS5rZXkgKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXG4nOiAnK1xuKChfX3Q9KCBpdGVtLmRhdGEuaXRlbVR5cGUgKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXG4nIFxcbjwvbGk+Jztcbn1cbnJldHVybiBfX3A7XG59O1xuIiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG52YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4scHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcbndpdGgob2JqfHx7fSl7XG5fX3ArPSc8dWwgY2xhc3M9XCJ6b3Rlcm8tY2hpbGQtaXRlbXNcIj5cXG5cXHQnK1xuKChfX3Q9KCBjaGlsZEl0ZW1zTWFya3VwICkpPT1udWxsPycnOl9fdCkrXG4nXFxuPC91bD4nO1xufVxucmV0dXJuIF9fcDtcbn07XG4iLCJ2YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbnZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xud2l0aChvYmp8fHt9KXtcbl9fcCs9JzxsaSBjbGFzcz1cInpvdGVyby1ncm91cCcrXG4oKF9fdD0oIGV4cGFuZCA/ICcgem90ZXJvLWdyb3VwLWV4cGFuZGVkJyA6ICcnICkpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xuJ1wiIGFyaWEtZXhwYW5kZWQ9XCInK1xuKChfX3Q9KCBleHBhbmQgPyAnIHRydWUnIDogJ2ZhbHNlJyApKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcbidcIiA+XFxuXFx0PGgzIGNsYXNzPVwiem90ZXJvLWdyb3VwLXRpdGxlXCI+JytcbigoX190PSggdGl0bGUgKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXG4nPC9oMz5cXG5cXHQnK1xuKChfX3Q9KCBpdGVtc01hcmt1cCApKT09bnVsbD8nJzpfX3QpK1xuJ1xcbjwvbGk+Jztcbn1cbnJldHVybiBfX3A7XG59O1xuIiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG52YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4scHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcbndpdGgob2JqfHx7fSl7XG5fX3ArPSc8dWwgY2xhc3M9XCJ6b3Rlcm8tZ3JvdXBzXCI+XFxuXFx0JytcbigoX190PSggZ3JvdXBzTWFya3VwICkpPT1udWxsPycnOl9fdCkrXG4nXFxuPC91bD4nO1xufVxucmV0dXJuIF9fcDtcbn07XG4iLCJ2YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbnZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xud2l0aChvYmp8fHt9KXtcbl9fcCs9JzxsaSBjbGFzcz1cInpvdGVyby1pdGVtIHpvdGVyby0nK1xuKChfX3Q9KCBkYXRhLml0ZW1UeXBlICkpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xuJ1wiPlxcblxcdCcrXG4oKF9fdD0oIGl0ZW0uY2l0YXRpb24gKSk9PW51bGw/Jyc6X190KStcbidcXG5cXHQnO1xuIGlmIChkYXRhW1N5bWJvbC5mb3IoJ2Fic3RyYWN0Tm90ZVNob3J0JyldICYmIGRhdGFbU3ltYm9sLmZvcignYWJzdHJhY3ROb3RlU2hvcnQnKV0ubGVuZ3RoKSB7IFxuX19wKz0nXFxuICAgIFxcdDxwIGNsYXNzPVwiem90ZXJvLWFic3RyYWN0LXNob3J0XCI+XFxuICAgIFxcdFxcdCcrXG4oKF9fdD0oIGRhdGFbU3ltYm9sLmZvcignYWJzdHJhY3ROb3RlU2hvcnQnKV0gKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXG4nXFxuICAgIFxcdFxcdDxhIGNsYXNzPVwiem90ZXJvLWFic3RyYWN0LXRvZ2dsZVwiIGFyaWEtY29udHJvbHM9XCJ6YS0nK1xuKChfX3Q9KCBpdGVtLmtleSApKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcbidcIj4uLi48L2E+XFxuICAgIFxcdDwvcD5cXG5cXHQnO1xuIH0gXG5fX3ArPSdcXG5cXHQnO1xuIGlmIChkYXRhLmFic3RyYWN0Tm90ZSAmJiBkYXRhLmFic3RyYWN0Tm90ZS5sZW5ndGgpIHsgXG5fX3ArPSdcXG4gICAgXFx0PHAgaWQ9XCJ6YS0nK1xuKChfX3Q9KCBpdGVtLmtleSApKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcbidcIiBjbGFzcz1cInpvdGVyby1hYnN0cmFjdFwiIGFyaWEtZXhwYW5kZWQ9XCJmYWxzZVwiPlxcbiAgICBcXHRcXHQnK1xuKChfX3Q9KCBkYXRhLmFic3RyYWN0Tm90ZSApKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcbidcXG4gICAgXFx0XFx0PGEgY2xhc3M9XCJ6b3Rlcm8tYWJzdHJhY3QtdG9nZ2xlXCI+Li4uPC9hPlxcbiAgICBcXHQ8L3A+XFxuXFx0JztcbiB9IFxuX19wKz0nXFxuICAgICcrXG4oKF9fdD0oIGNoaWxkSXRlbXNNYXJrdXAgKSk9PW51bGw/Jyc6X190KStcbidcXG48L2xpPic7XG59XG5yZXR1cm4gX19wO1xufTtcbiIsInZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xudmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLHByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XG53aXRoKG9ianx8e30pe1xuX19wKz0nPHVsIGNsYXNzPVwiem90ZXJvLWl0ZW1zXCI+XFxuXFx0JytcbigoX190PSggem90ZXJvSXRlbXMgKSk9PW51bGw/Jyc6X190KStcbidcXG48L3VsPic7XG59XG5yZXR1cm4gX19wO1xufTtcbiIsIi8qKlxuICogQXR0YWNoIGludGVyYWN0aW9uIGhhbmRsZXJzIGZvciBleHBhbmRpbmcgZ3JvdXBzIGFuZCBzaG9ydGVuZWQgYWJzdHJhY3RzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY29udGFpbmVyIC0gQSB0b3AtbGV2ZWwgRE9NIGVsZW1lbnQgKGUuZy4gY29udGFpbmVyKSB0aGF0IGNvbnRhaW5zIFpvdGVybyBpdGVtcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEhhbmRsZXJzKGNvbnRhaW5lcikge1xuXHRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldikge1xuXHRcdGlmKGV2LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3pvdGVyby1hYnN0cmFjdC10b2dnbGUnKSkge1xuXHRcdFx0bGV0IGFic3RyYWN0U2hvcnRFbCA9IGV2LnRhcmdldC5wYXJlbnROb2RlLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignLnpvdGVyby1hYnN0cmFjdC1zaG9ydCcpO1xuXHRcdFx0bGV0IGFic3RyYWN0RWwgPSBldi50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJy56b3Rlcm8tYWJzdHJhY3QnKTtcblx0XHRcdGxldCBleHBhbmRlZCA9IGFic3RyYWN0U2hvcnRFbC5jbGFzc0xpc3QudG9nZ2xlKCd6b3Rlcm8tYWJzdHJhY3QtZXhwYW5kZWQnKTtcblx0XHRcdGFic3RyYWN0RWwuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgZXhwYW5kZWQgPyAndHJ1ZScgOiAnZmFsc2UnKTtcblx0XHR9XG5cdFx0aWYoZXYudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnem90ZXJvLWdyb3VwLXRpdGxlJykpIHtcblx0XHRcdGxldCBncm91cEVsID0gZXYudGFyZ2V0LnBhcmVudE5vZGU7XG5cdFx0XHRsZXQgZXhwYW5kZWQgPSBncm91cEVsLmNsYXNzTGlzdC50b2dnbGUoJ3pvdGVyby1ncm91cC1leHBhbmRlZCcpO1xuXHRcdFx0Z3JvdXBFbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCBleHBhbmRlZCA/ICd0cnVlJyA6ICdmYWxzZScpO1xuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogVG9nZ2xlIENTUyBjbGFzcyB0aGF0IGdpdmVzIGEgdmlzdWFsIGxvYWRpbmcgZmVlZGJhY2suIE9wdGlvbmFsbHkgYWxsb3dzIHRvIGV4cGxpY2V0bHkgc3BlY2lmeVxuICogd2hldGhlciB0byBkaXNwbGF5IG9yIGhpZGUgdmlzdWFsIGZlZWRiYWNrLlxuICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGNvbnRhaW5lciAtIEEgRE9NIGVsZW1lbnQgdG8gd2hpY2ggdmlzdWFsIGZlZWRiYWNrIGNsYXNzIHNob3VsZCBiZSBhdHRhY2hlZFxuICogQHBhcmFtICB7Ym9vbGVhbn0gW2FjdGl2YXRlXSAgICAtIEV4cGxpY2l0ZWx5IGluZGljYXRlIHdoZXRoZXIgdG8gYWRkIG9yIHJlbW92ZSB2aXN1YWwgZmVlZGJhY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZVNwaW5uZXIoY29udGFpbmVyLCBhY3RpdmF0ZSkge1xuXHR2YXIgbWV0aG9kID0gYWN0aXZhdGUgPT09IG51bGwgPyBjb250YWluZXIuY2xhc3NMaXN0LnRvZ2dsZSA6IGFjdGl2YXRlID8gY29udGFpbmVyLmNsYXNzTGlzdC5hZGQgOiBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZTtcblx0bWV0aG9kLmNhbGwoY29udGFpbmVyLmNsYXNzTGlzdCwgJ3pvdGVyby1sb2FkaW5nJyk7XG59XG5cbiJdfQ==
