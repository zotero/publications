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

function processResponse(response, config) {
	if (response) {
		var childItems = [];
		var index = {};

		for (var i = response.length; i--;) {
			var item = response[i];
			if (item.data && item.data.abstractNote) {
				var abstractNoteShort = item.data.abstractNote.substr(0, config.shortenedAbstractLenght);
				abstractNoteShort = abstractNoteShort.substr(0, Math.min(abstractNoteShort.length, abstractNoteShort.lastIndexOf(' ')));
				item.data.abstractNoteShort = abstractNoteShort;
			}
			if (item.data && item.data.parentItem) {
				response.splice(i, 1);
				childItems.push(item);
			} else {
				index[item.key] = item;
			}
		}

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = childItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var item = _step.value;

				if (!index[item.data.parentItem]) {
					console.warn('item ' + item.data.key + ' has parentItem ' + item.data.parentItem + ' that does not exist in the dataset');
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
				reject('Unexpected status code ' + response.status + ' when requesting ' + url);
			}
		});
	});
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./data.js":"/srv/zotero/my-publications/src/js/data.js"}],"/srv/zotero/my-publications/src/js/app.js":[function(require,module,exports){
(function (global){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _renderJs = require('./render.js');

var _apiJs = require('./api.js');

var _dataJs = require('./data.js');

function ZoteroPublications(config) {
	this.config = _lodash2['default'].extend({}, this.defaults, config);
}

ZoteroPublications.prototype.defaults = {
	apiBase: 'api.zotero.org',
	limit: 100,
	citationStyle: 'apa-annotated-bibliography',
	include: ['data', 'citation'],
	shortenedAbstractLenght: 250,
	group: false,
	expand: 'all'
};

ZoteroPublications.prototype.get = function (endpoint) {
	var apiBase = this.config.apiBase,
	    limit = this.config.limit,
	    style = this.config.citationStyle,
	    include = this.config.include.join(','),
	    url = '//' + apiBase + '/' + endpoint + '?include=' + include + '&limit=' + limit + '&linkwrap=1&order=dateModified&sort=desc&start=0&style=' + style,
	    options = {
		headers: {
			'Accept': 'application/json'
		}
	};

	return new Promise((function (resolve) {
		(0, _apiJs.fetchUntilExhausted)(url, options).then((function (responseJson) {
			responseJson = (0, _apiJs.processResponse)(responseJson, this.config);
			var data = new _dataJs.ZoteroData(responseJson);
			if (this.config.group === 'type') {
				data.groupByType(this.config.expand);
			}
			resolve(data);
		}).bind(this));
	}).bind(this));
};

ZoteroPublications.prototype.render = function (endpointOrData, container) {
	if (endpointOrData instanceof _dataJs.ZoteroData) {
		var data = endpointOrData;
		(0, _renderJs.renderPublications)(container, data);
	} else {
		var endpoint = endpointOrData;
		this.get(endpoint).then(_lodash2['default'].partial(_renderJs.renderPublications, container));
	}
};

module.exports = ZoteroPublications;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","./data.js":"/srv/zotero/my-publications/src/js/data.js","./render.js":"/srv/zotero/my-publications/src/js/render.js"}],"/srv/zotero/my-publications/src/js/data.js":[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ZoteroData = ZoteroData;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var GROUPED_NONE = 0;
exports.GROUPED_NONE = GROUPED_NONE;
var GROUPED_BY_TYPE = 1;
exports.GROUPED_BY_TYPE = GROUPED_BY_TYPE;
var GROUPED_BY_COLLECTION = 2;
exports.GROUPED_BY_COLLECTION = GROUPED_BY_COLLECTION;
var CHILD_ITEMS_SYMBOL = Symbol("childItems");
exports.CHILD_ITEMS_SYMBOL = CHILD_ITEMS_SYMBOL;
var GROUP_EXPANDED_SUMBOL = Symbol("groupExpanded");

exports.GROUP_EXPANDED_SUMBOL = GROUP_EXPANDED_SUMBOL;

function ZoteroData(data) {
	this.raw = data;
	this.data = data;
	this.grouped = GROUPED_NONE;

	Object.defineProperty(this, 'length', {
		enumerable: false,
		configurable: false,
		get: function get() {
			return this.data.length;
		}
	});
}

ZoteroData.prototype.groupByType = function (expand) {
	var groupedData = {};
	expand = expand || [];
	for (var i = this.raw.length; i--;) {
		var item = this.raw[i];

		if (!groupedData[item.data.itemType]) {
			groupedData[item.data.itemType] = [];
		}
		groupedData[item.data.itemType].push(item);
		groupedData[item.data.itemType][GROUP_EXPANDED_SUMBOL] = expand === 'all' || _lodash2["default"].contains(expand, item.data.itemType);
	}
	this.data = groupedData;
	this.grouped = GROUPED_BY_TYPE;
};

ZoteroData.prototype.groupByCollections = function () {
	throw new Error('groupByCollections is not implemented yet.');
};

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

		if (typeof _ret === "object") return _ret.v;
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

},{}],"/srv/zotero/my-publications/src/js/render.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.renderItem = renderItem;
exports.renderCollection = renderCollection;
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

function renderItem(zoteroItem, childItemsMarkup) {
	return (0, _tplItemTpl2['default'])({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'childItemsMarkup': childItemsMarkup || ''
	});
}

function renderCollection(zoteroItems) {
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

function renderChildItem(zoteroChildItem) {
	return (0, _tplChildItemTpl2['default'])({
		'item': zoteroChildItem
	});
}

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

function renderGroup(title, expand, itemsMarkup) {
	return (0, _tplGroupTpl2['default'])({
		'title': title,
		'itemsMarkup': itemsMarkup,
		'expand': expand
	});
}

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

			var itemsMarkup = renderCollection(group);
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

function renderPublications(container, data) {
	var markup;

	if (data.grouped > 0) {
		markup = renderGrouped(data) + (0, _tplBrandingTpl2['default'])();
	} else {
		markup = renderCollection(data) + (0, _tplBrandingTpl2['default'])();
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
__p+='<div class="zotero-branding">\n\tPowered by Zotero\n</div>';
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
 if (data.abstractNoteShort && data.abstractNoteShort.length) { 
__p+='\n    \t<p class="zotero-abstract-short">\n    \t\t'+
((__t=( data.abstractNoteShort ))==null?'':_.escape(__t))+
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
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.addHandlers = addHandlers;

function addHandlers(container) {
	container.addEventListener('click', function (ev) {
		console.info(ev);
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

},{}]},{},["/srv/zotero/my-publications/src/js/app.js"])("/srv/zotero/my-publications/src/js/app.js")
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L3pvdGVyby9teS1wdWJsaWNhdGlvbnMvc3JjL2pzL2FwaS5qcyIsIi9zcnYvem90ZXJvL215LXB1YmxpY2F0aW9ucy9zcmMvanMvYXBwLmpzIiwiL3Nydi96b3Rlcm8vbXktcHVibGljYXRpb25zL3NyYy9qcy9kYXRhLmpzIiwiL3Nydi96b3Rlcm8vbXktcHVibGljYXRpb25zL3NyYy9qcy9yZW5kZXIuanMiLCJzcmMvanMvdHBsL2JyYW5kaW5nLnRwbCIsInNyYy9qcy90cGwvY2hpbGQtaXRlbS50cGwiLCJzcmMvanMvdHBsL2NoaWxkLWl0ZW1zLnRwbCIsInNyYy9qcy90cGwvZ3JvdXAudHBsIiwic3JjL2pzL3RwbC9ncm91cHMudHBsIiwic3JjL2pzL3RwbC9pdGVtLnRwbCIsInNyYy9qcy90cGwvaXRlbXMudHBsIiwiL3Nydi96b3Rlcm8vbXktcHVibGljYXRpb25zL3NyYy9qcy91aS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O3NCQ0FjLFFBQVE7Ozs7c0JBR2YsV0FBVzs7QUFFWCxTQUFTLGVBQWUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQ2pELEtBQUcsUUFBUSxFQUFFO0FBQ1osTUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQUksS0FBSyxHQUFHLEVBQUUsQ0FBQzs7QUFFZixPQUFJLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUk7QUFDbkMsT0FBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLE9BQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtBQUN2QyxRQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0s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UyxFQUFFO0FBQ3RDLFVBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBUyxFQUFFLEVBQUU7QUFDaEQsU0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqQixNQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO0FBQzFELE9BQUksZUFBZSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM5RixPQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDbkYsT0FBSSxRQUFRLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM1RSxhQUFVLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxRQUFRLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0dBQ3RFO0FBQ0QsTUFBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTtBQUN0RCxPQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUNuQyxPQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ2pFLFVBQU8sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLFFBQVEsR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUM7R0FDbkU7RUFDRCxDQUFDLENBQUM7Q0FDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHtcblx0Q0hJTERfSVRFTVNfU1lNQk9MXG59IGZyb20gJy4vZGF0YS5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NSZXNwb25zZShyZXNwb25zZSwgY29uZmlnKSB7XG5cdGlmKHJlc3BvbnNlKSB7XG5cdFx0bGV0IGNoaWxkSXRlbXMgPSBbXTtcblx0XHRsZXQgaW5kZXggPSB7fTtcblxuXHRcdGZvcih2YXIgaSA9IHJlc3BvbnNlLmxlbmd0aDsgaS0tOyApIHtcblx0XHRcdGxldCBpdGVtID0gcmVzcG9uc2VbaV07XG5cdFx0XHRpZihpdGVtLmRhdGEgJiYgaXRlbS5kYXRhLmFic3RyYWN0Tm90ZSkge1xuXHRcdFx0XHRsZXQgYWJzdHJhY3ROb3RlU2hvcnQgPSBpdGVtLmRhdGEuYWJzdHJhY3ROb3RlLnN1YnN0cigwLCBjb25maWcuc2hvcnRlbmVkQWJzdHJhY3RMZW5naHQpO1xuXHRcdFx0XHRhYnN0cmFjdE5vdGVTaG9ydCA9IGFic3RyYWN0Tm90ZVNob3J0LnN1YnN0cihcblx0XHRcdFx0XHQwLFxuXHRcdFx0XHRcdE1hdGgubWluKGFic3RyYWN0Tm90ZVNob3J0Lmxlbmd0aCwgYWJzdHJhY3ROb3RlU2hvcnQubGFzdEluZGV4T2YoJyAnKSlcblx0XHRcdFx0KTtcblx0XHRcdFx0aXRlbS5kYXRhLmFic3RyYWN0Tm90ZVNob3J0ID0gYWJzdHJhY3ROb3RlU2hvcnQ7XG5cdFx0XHR9XG5cdFx0XHRpZihpdGVtLmRhdGEgJiYgaXRlbS5kYXRhLnBhcmVudEl0ZW0pIHtcblx0XHRcdFx0cmVzcG9uc2Uuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRjaGlsZEl0ZW1zLnB1c2goaXRlbSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbmRleFtpdGVtLmtleV0gPSBpdGVtO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvcihsZXQgaXRlbSBvZiBjaGlsZEl0ZW1zKSB7XG5cdFx0XHRpZighaW5kZXhbaXRlbS5kYXRhLnBhcmVudEl0ZW1dKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihgaXRlbSAke2l0ZW0uZGF0YS5rZXl9IGhhcyBwYXJlbnRJdGVtICR7aXRlbS5kYXRhLnBhcmVudEl0ZW19IHRoYXQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGRhdGFzZXRgKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmKCFpbmRleFtpdGVtLmRhdGEucGFyZW50SXRlbV1bQ0hJTERfSVRFTVNfU1lNQk9MXSkge1xuXHRcdFx0XHRpbmRleFtpdGVtLmRhdGEucGFyZW50SXRlbV1bQ0hJTERfSVRFTVNfU1lNQk9MXSA9IFtdO1xuXHRcdFx0fVxuXHRcdFx0aW5kZXhbaXRlbS5kYXRhLnBhcmVudEl0ZW1dW0NISUxEX0lURU1TX1NZTUJPTF0ucHVzaChpdGVtKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3BvbnNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hVbnRpbEV4aGF1c3RlZCh1cmwsIG9wdGlvbnMsIGpzb25kYXRhKSB7XG5cdGxldCByZWxSZWdleCA9IC88KGh0dHBzPzpcXC9cXC8od3d3XFwuKT9bLWEtekEtWjAtOUA6JS5fXFwrfiM9XXsyLDI1Nn1cXC5bYS16XXsyLDZ9XFxiKFstYS16QS1aMC05QDolX1xcKy5+Iz8mLy89XSopKT47XFxzKnJlbD1cIm5leHRcIi87XG5cdGpzb25kYXRhID0ganNvbmRhdGEgfHwgW107XG5cblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0aWYocmVzcG9uc2Uuc3RhdHVzID49IDIwMCAmJiByZXNwb25zZS5zdGF0dXMgPCAzMDApIHtcblx0XHRcdFx0aWYocmVzcG9uc2UuaGVhZGVycy5oYXMoJ0xpbmsnKSkge1xuXHRcdFx0XHRcdGxldCBtYXRjaGVzID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0xpbmsnKS5tYXRjaChyZWxSZWdleCk7XG5cdFx0XHRcdFx0aWYobWF0Y2hlcyAmJiBtYXRjaGVzLmxlbmd0aCA+PSAyKSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5qc29uKCkudGhlbihmdW5jdGlvbihqc29uRGF0YVBhcnQpIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShmZXRjaFVudGlsRXhoYXVzdGVkKG1hdGNoZXNbMV0sIG9wdGlvbnMsIF8udW5pb24oanNvbmRhdGEsIGpzb25EYXRhUGFydCkpKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZS5qc29uKCkudGhlbihmdW5jdGlvbihqc29uRGF0YVBhcnQpIHtcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZShfLnVuaW9uKGpzb25kYXRhLCBqc29uRGF0YVBhcnQpKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXNwb25zZS5qc29uKCkudGhlbihmdW5jdGlvbihqc29uRGF0YVBhcnQpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoXy51bmlvbihqc29uZGF0YSwganNvbkRhdGFQYXJ0KSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlamVjdChgVW5leHBlY3RlZCBzdGF0dXMgY29kZSAke3Jlc3BvbnNlLnN0YXR1c30gd2hlbiByZXF1ZXN0aW5nICR7dXJsfWApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcbn1cbiIsImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQge1xuXHRyZW5kZXJQdWJsaWNhdGlvbnNcbn0gZnJvbSAnLi9yZW5kZXIuanMnO1xuaW1wb3J0IHtcblx0ZmV0Y2hVbnRpbEV4aGF1c3RlZCxcblx0cHJvY2Vzc1Jlc3BvbnNlXG59IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7XG5cdFpvdGVyb0RhdGFcbn0gZnJvbSAnLi9kYXRhLmpzJztcblxuZnVuY3Rpb24gWm90ZXJvUHVibGljYXRpb25zKGNvbmZpZykge1xuXHR0aGlzLmNvbmZpZyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xufVxuXG5ab3Rlcm9QdWJsaWNhdGlvbnMucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuXHRhcGlCYXNlOiAnYXBpLnpvdGVyby5vcmcnLFxuXHRsaW1pdDogMTAwLFxuXHRjaXRhdGlvblN0eWxlOiAnYXBhLWFubm90YXRlZC1iaWJsaW9ncmFwaHknLFxuXHRpbmNsdWRlOiBbJ2RhdGEnLCAnY2l0YXRpb24nXSxcblx0c2hvcnRlbmVkQWJzdHJhY3RMZW5naHQ6IDI1MCxcblx0Z3JvdXA6IGZhbHNlLFxuXHRleHBhbmQ6ICdhbGwnXG59O1xuXG5ab3Rlcm9QdWJsaWNhdGlvbnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGVuZHBvaW50KSB7XG5cdGxldCBhcGlCYXNlID0gdGhpcy5jb25maWcuYXBpQmFzZSxcblx0XHRsaW1pdCA9IHRoaXMuY29uZmlnLmxpbWl0LFxuXHRcdHN0eWxlID0gdGhpcy5jb25maWcuY2l0YXRpb25TdHlsZSxcblx0XHRpbmNsdWRlID0gdGhpcy5jb25maWcuaW5jbHVkZS5qb2luKCcsJyksXG5cdFx0dXJsID0gYC8vJHthcGlCYXNlfS8ke2VuZHBvaW50fT9pbmNsdWRlPSR7aW5jbHVkZX0mbGltaXQ9JHtsaW1pdH0mbGlua3dyYXA9MSZvcmRlcj1kYXRlTW9kaWZpZWQmc29ydD1kZXNjJnN0YXJ0PTAmc3R5bGU9JHtzdHlsZX1gLFxuXHRcdG9wdGlvbnMgPSB7XG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdCdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbidcblx0XHRcdH1cblx0XHR9O1xuXG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG5cdFx0ZmV0Y2hVbnRpbEV4aGF1c3RlZCh1cmwsIG9wdGlvbnMpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2VKc29uKSB7XG5cdFx0XHRyZXNwb25zZUpzb24gPSBwcm9jZXNzUmVzcG9uc2UocmVzcG9uc2VKc29uLCB0aGlzLmNvbmZpZyk7XG5cdFx0XHRsZXQgZGF0YSA9IG5ldyBab3Rlcm9EYXRhKHJlc3BvbnNlSnNvbik7XG5cdFx0XHRpZih0aGlzLmNvbmZpZy5ncm91cCA9PT0gJ3R5cGUnKSB7XG5cdFx0XHRcdGRhdGEuZ3JvdXBCeVR5cGUodGhpcy5jb25maWcuZXhwYW5kKTtcblx0XHRcdH1cblx0XHRcdHJlc29sdmUoZGF0YSk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblx0fS5iaW5kKHRoaXMpKTtcbn07XG5cblxuWm90ZXJvUHVibGljYXRpb25zLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihlbmRwb2ludE9yRGF0YSwgY29udGFpbmVyKSB7XG5cdGlmKGVuZHBvaW50T3JEYXRhIGluc3RhbmNlb2YgWm90ZXJvRGF0YSkge1xuXHRcdGxldCBkYXRhID0gZW5kcG9pbnRPckRhdGE7XG5cdFx0cmVuZGVyUHVibGljYXRpb25zKGNvbnRhaW5lciwgZGF0YSk7XG5cdH0gZWxzZSB7XG5cdFx0bGV0IGVuZHBvaW50ID0gZW5kcG9pbnRPckRhdGE7XG5cdFx0dGhpcy5nZXQoZW5kcG9pbnQpLnRoZW4oXy5wYXJ0aWFsKHJlbmRlclB1YmxpY2F0aW9ucywgY29udGFpbmVyKSk7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gWm90ZXJvUHVibGljYXRpb25zO1xuIiwiaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuZXhwb3J0IGNvbnN0IEdST1VQRURfTk9ORSA9IDA7XG5leHBvcnQgY29uc3QgR1JPVVBFRF9CWV9UWVBFID0gMTtcbmV4cG9ydCBjb25zdCBHUk9VUEVEX0JZX0NPTExFQ1RJT04gPSAyO1xuZXhwb3J0IGNvbnN0IENISUxEX0lURU1TX1NZTUJPTCA9IFN5bWJvbChcImNoaWxkSXRlbXNcIik7XG5leHBvcnQgY29uc3QgR1JPVVBfRVhQQU5ERURfU1VNQk9MID0gU3ltYm9sKFwiZ3JvdXBFeHBhbmRlZFwiKTtcblxuZXhwb3J0IGZ1bmN0aW9uIFpvdGVyb0RhdGEoZGF0YSkge1xuXHR0aGlzLnJhdyA9IGRhdGE7XG5cdHRoaXMuZGF0YSA9IGRhdGE7XG5cdHRoaXMuZ3JvdXBlZCA9IEdST1VQRURfTk9ORTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2xlbmd0aCcsIHtcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuXHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhLmxlbmd0aDtcblx0XHR9XG5cdH0pO1xufVxuXG5ab3Rlcm9EYXRhLnByb3RvdHlwZS5ncm91cEJ5VHlwZSA9IGZ1bmN0aW9uKGV4cGFuZCkge1xuXHRsZXQgZ3JvdXBlZERhdGEgPSB7fTtcblx0ZXhwYW5kID0gZXhwYW5kIHx8IFtdO1xuXHRmb3IobGV0IGkgPSB0aGlzLnJhdy5sZW5ndGg7IGktLTsgKSB7XG5cdFx0bGV0IGl0ZW0gPSB0aGlzLnJhd1tpXTtcblxuXHRcdGlmKCFncm91cGVkRGF0YVtpdGVtLmRhdGEuaXRlbVR5cGVdKSB7XG5cdFx0XHRncm91cGVkRGF0YVtpdGVtLmRhdGEuaXRlbVR5cGVdID0gW107XG5cdFx0fVxuXHRcdGdyb3VwZWREYXRhW2l0ZW0uZGF0YS5pdGVtVHlwZV0ucHVzaChpdGVtKTtcblx0XHRncm91cGVkRGF0YVtpdGVtLmRhdGEuaXRlbVR5cGVdW0dST1VQX0VYUEFOREVEX1NVTUJPTF0gPSBleHBhbmQgPT09ICdhbGwnIHx8IF8uY29udGFpbnMoZXhwYW5kLCBpdGVtLmRhdGEuaXRlbVR5cGUpO1xuXHR9XG5cdHRoaXMuZGF0YSA9IGdyb3VwZWREYXRhO1xuXHR0aGlzLmdyb3VwZWQgPSBHUk9VUEVEX0JZX1RZUEU7XG59O1xuXG5ab3Rlcm9EYXRhLnByb3RvdHlwZS5ncm91cEJ5Q29sbGVjdGlvbnMgPSBmdW5jdGlvbigpIHtcblx0dGhyb3cgbmV3IEVycm9yKCdncm91cEJ5Q29sbGVjdGlvbnMgaXMgbm90IGltcGxlbWVudGVkIHlldC4nKTtcbn07XG5cblpvdGVyb0RhdGEucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcblx0bGV0IGkgPSAwO1xuXHRpZih0aGlzLmdyb3VwZWQgPiAwKSB7XG5cdFx0bGV0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRuZXh0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR2YWx1ZTogaSA8IGtleXMubGVuZ3RoID8gW2tleXNbaV0sIHRoaXMuZGF0YVtrZXlzW2ldXV0gOiBudWxsLFxuXHRcdFx0XHRcdGRvbmU6IGkrKyA+PSBrZXlzLmxlbmd0aFxuXHRcdFx0XHR9O1xuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmV4dDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dmFsdWU6IGkgPCB0aGlzLmRhdGEubGVuZ3RoID8gdGhpcy5kYXRhW2ldIDogbnVsbCxcblx0XHRcdFx0XHRkb25lOiBpKysgPj0gdGhpcy5kYXRhLmxlbmd0aFxuXHRcdFx0XHR9O1xuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fTtcblx0fVxufTtcbiIsImltcG9ydCBpdGVtVHBsIGZyb20gJy4vdHBsL2l0ZW0udHBsJztcbmltcG9ydCBpdGVtc1RwbCBmcm9tICcuL3RwbC9pdGVtcy50cGwnO1xuaW1wb3J0IGdyb3VwVHBsIGZyb20gJy4vdHBsL2dyb3VwLnRwbCc7XG5pbXBvcnQgZ3JvdXBzVHBsIGZyb20gJy4vdHBsL2dyb3Vwcy50cGwnO1xuaW1wb3J0IGNoaWxkSXRlbXNUcGwgZnJvbSAnLi90cGwvY2hpbGQtaXRlbXMudHBsJztcbmltcG9ydCBjaGlsZEl0ZW1UcGwgZnJvbSAnLi90cGwvY2hpbGQtaXRlbS50cGwnO1xuaW1wb3J0IGJyYW5kaW5nVHBsIGZyb20gJy4vdHBsL2JyYW5kaW5nLnRwbCc7XG5pbXBvcnQge1xuXHRhZGRIYW5kbGVyc1xufSBmcm9tICcuL3VpLmpzJztcbmltcG9ydCB7XG5cdENISUxEX0lURU1TX1NZTUJPTCxcblx0R1JPVVBfRVhQQU5ERURfU1VNQk9MXG59IGZyb20gJy4vZGF0YS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJJdGVtKHpvdGVyb0l0ZW0sIGNoaWxkSXRlbXNNYXJrdXApIHtcblx0cmV0dXJuIGl0ZW1UcGwoe1xuXHRcdCdpdGVtJzogem90ZXJvSXRlbSxcblx0XHQnZGF0YSc6IHpvdGVyb0l0ZW0uZGF0YSxcblx0XHQnY2hpbGRJdGVtc01hcmt1cCc6IGNoaWxkSXRlbXNNYXJrdXAgfHwgJydcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJDb2xsZWN0aW9uKHpvdGVyb0l0ZW1zKSB7XG5cdGxldCBpdGVtc01hcmt1cCA9ICcnO1xuXG5cdGZvciAobGV0IGl0ZW0gb2Ygem90ZXJvSXRlbXMpIHtcblx0XHRsZXQgY2hpbGRJdGVtc01hcmt1cCA9IHJlbmRlckNoaWxkSXRlbXMoaXRlbSk7XG5cdFx0aXRlbXNNYXJrdXAgKz0gcmVuZGVySXRlbShpdGVtLCBjaGlsZEl0ZW1zTWFya3VwKTtcblx0fVxuXG5cdHJldHVybiBpdGVtc1RwbCh7XG5cdFx0J3pvdGVyb0l0ZW1zJzogaXRlbXNNYXJrdXBcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJDaGlsZEl0ZW0oem90ZXJvQ2hpbGRJdGVtKSB7XG5cdHJldHVybiBjaGlsZEl0ZW1UcGwoe1xuXHRcdCdpdGVtJzogem90ZXJvQ2hpbGRJdGVtXG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQ2hpbGRJdGVtcyh6b3Rlcm9JdGVtKSB7XG5cdGxldCBjaGlsZEl0ZW1zTWFya3VwID0gJyc7XG5cblx0aWYoem90ZXJvSXRlbVtDSElMRF9JVEVNU19TWU1CT0xdICYmIHpvdGVyb0l0ZW1bQ0hJTERfSVRFTVNfU1lNQk9MXS5sZW5ndGggPiAwKSB7XG5cdFx0Zm9yIChsZXQgY2hpbGRJdGVtIG9mIHpvdGVyb0l0ZW1bQ0hJTERfSVRFTVNfU1lNQk9MXSkge1xuXHRcdFx0Y2hpbGRJdGVtc01hcmt1cCArPSByZW5kZXJDaGlsZEl0ZW0oY2hpbGRJdGVtKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY2hpbGRJdGVtc1RwbCh7XG5cdFx0J2NoaWxkSXRlbXNNYXJrdXAnOiBjaGlsZEl0ZW1zTWFya3VwXG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyR3JvdXAodGl0bGUsIGV4cGFuZCwgaXRlbXNNYXJrdXApIHtcblx0cmV0dXJuIGdyb3VwVHBsKHtcblx0XHQndGl0bGUnOiB0aXRsZSxcblx0XHQnaXRlbXNNYXJrdXAnOiBpdGVtc01hcmt1cCxcblx0XHQnZXhwYW5kJzogZXhwYW5kXG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyR3JvdXBlZChkYXRhKSB7XG5cdGxldCBncm91cHNNYXJrdXAgPSAnJztcblxuXHRmb3IobGV0IFsgZ3JvdXBUaXRsZSwgZ3JvdXAgXSBvZiBkYXRhKSB7XG5cdFx0bGV0IGl0ZW1zTWFya3VwID0gcmVuZGVyQ29sbGVjdGlvbihncm91cCk7XG5cdFx0bGV0IGV4cGFuZCA9IGdyb3VwW0dST1VQX0VYUEFOREVEX1NVTUJPTF07XG5cdFx0Z3JvdXBzTWFya3VwICs9IHJlbmRlckdyb3VwKGdyb3VwVGl0bGUsIGV4cGFuZCwgaXRlbXNNYXJrdXApO1xuXHR9XG5cblx0cmV0dXJuIGdyb3Vwc1RwbCh7XG5cdFx0J2dyb3Vwc01hcmt1cCc6IGdyb3Vwc01hcmt1cFxuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclB1YmxpY2F0aW9ucyhjb250YWluZXIsIGRhdGEpIHtcblx0dmFyIG1hcmt1cDtcblxuXHRpZihkYXRhLmdyb3VwZWQgPiAwKSB7XG5cdFx0bWFya3VwID0gcmVuZGVyR3JvdXBlZChkYXRhKSArIGJyYW5kaW5nVHBsKCk7XG5cdH0gZWxzZSB7XG5cdFx0bWFya3VwID0gcmVuZGVyQ29sbGVjdGlvbihkYXRhKSArIGJyYW5kaW5nVHBsKCk7XG5cdH1cblxuXHRjb250YWluZXIuaW5uZXJIVE1MID0gbWFya3VwO1xuXHRhZGRIYW5kbGVycyhjb250YWluZXIpO1xufVxuIiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG52YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4scHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcbndpdGgob2JqfHx7fSl7XG5fX3ArPSc8ZGl2IGNsYXNzPVwiem90ZXJvLWJyYW5kaW5nXCI+XFxuXFx0UG93ZXJlZCBieSBab3Rlcm9cXG48L2Rpdj4nO1xufVxucmV0dXJuIF9fcDtcbn07XG4iLCJ2YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbnZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xud2l0aChvYmp8fHt9KXtcbl9fcCs9JzxsaT5cXG5cXHQnK1xuKChfX3Q9KCBpdGVtLmRhdGEua2V5ICkpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xuJzogJytcbigoX190PSggaXRlbS5kYXRhLml0ZW1UeXBlICkpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xuJyBcXG48L2xpPic7XG59XG5yZXR1cm4gX19wO1xufTtcbiIsInZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xudmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLHByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XG53aXRoKG9ianx8e30pe1xuX19wKz0nPHVsIGNsYXNzPVwiem90ZXJvLWNoaWxkLWl0ZW1zXCI+XFxuXFx0JytcbigoX190PSggY2hpbGRJdGVtc01hcmt1cCApKT09bnVsbD8nJzpfX3QpK1xuJ1xcbjwvdWw+Jztcbn1cbnJldHVybiBfX3A7XG59O1xuIiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG52YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4scHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcbndpdGgob2JqfHx7fSl7XG5fX3ArPSc8bGkgY2xhc3M9XCJ6b3Rlcm8tZ3JvdXAnK1xuKChfX3Q9KCBleHBhbmQgPyAnIHpvdGVyby1ncm91cC1leHBhbmRlZCcgOiAnJyApKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcbidcIiBhcmlhLWV4cGFuZGVkPVwiJytcbigoX190PSggZXhwYW5kID8gJyB0cnVlJyA6ICdmYWxzZScgKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXG4nXCIgPlxcblxcdDxoMyBjbGFzcz1cInpvdGVyby1ncm91cC10aXRsZVwiPicrXG4oKF9fdD0oIHRpdGxlICkpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xuJzwvaDM+XFxuXFx0JytcbigoX190PSggaXRlbXNNYXJrdXAgKSk9PW51bGw/Jyc6X190KStcbidcXG48L2xpPic7XG59XG5yZXR1cm4gX19wO1xufTtcbiIsInZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmope1xudmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLHByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XG53aXRoKG9ianx8e30pe1xuX19wKz0nPHVsIGNsYXNzPVwiem90ZXJvLWdyb3Vwc1wiPlxcblxcdCcrXG4oKF9fdD0oIGdyb3Vwc01hcmt1cCApKT09bnVsbD8nJzpfX3QpK1xuJ1xcbjwvdWw+Jztcbn1cbnJldHVybiBfX3A7XG59O1xuIiwidmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iail7XG52YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4scHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcbndpdGgob2JqfHx7fSl7XG5fX3ArPSc8bGkgY2xhc3M9XCJ6b3Rlcm8taXRlbSB6b3Rlcm8tJytcbigoX190PSggZGF0YS5pdGVtVHlwZSApKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcbidcIj5cXG5cXHQnK1xuKChfX3Q9KCBpdGVtLmNpdGF0aW9uICkpPT1udWxsPycnOl9fdCkrXG4nXFxuXFx0JztcbiBpZiAoZGF0YS5hYnN0cmFjdE5vdGVTaG9ydCAmJiBkYXRhLmFic3RyYWN0Tm90ZVNob3J0Lmxlbmd0aCkgeyBcbl9fcCs9J1xcbiAgICBcXHQ8cCBjbGFzcz1cInpvdGVyby1hYnN0cmFjdC1zaG9ydFwiPlxcbiAgICBcXHRcXHQnK1xuKChfX3Q9KCBkYXRhLmFic3RyYWN0Tm90ZVNob3J0ICkpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xuJ1xcbiAgICBcXHRcXHQ8YSBjbGFzcz1cInpvdGVyby1hYnN0cmFjdC10b2dnbGVcIiBhcmlhLWNvbnRyb2xzPVwiemEtJytcbigoX190PSggaXRlbS5rZXkgKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXG4nXCI+Li4uPC9hPlxcbiAgICBcXHQ8L3A+XFxuXFx0JztcbiB9IFxuX19wKz0nXFxuXFx0JztcbiBpZiAoZGF0YS5hYnN0cmFjdE5vdGUgJiYgZGF0YS5hYnN0cmFjdE5vdGUubGVuZ3RoKSB7IFxuX19wKz0nXFxuICAgIFxcdDxwIGlkPVwiemEtJytcbigoX190PSggaXRlbS5rZXkgKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXG4nXCIgY2xhc3M9XCJ6b3Rlcm8tYWJzdHJhY3RcIiBhcmlhLWV4cGFuZGVkPVwiZmFsc2VcIj5cXG4gICAgXFx0XFx0JytcbigoX190PSggZGF0YS5hYnN0cmFjdE5vdGUgKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXG4nXFxuICAgIFxcdFxcdDxhIGNsYXNzPVwiem90ZXJvLWFic3RyYWN0LXRvZ2dsZVwiPi4uLjwvYT5cXG4gICAgXFx0PC9wPlxcblxcdCc7XG4gfSBcbl9fcCs9J1xcbiAgICAnK1xuKChfX3Q9KCBjaGlsZEl0ZW1zTWFya3VwICkpPT1udWxsPycnOl9fdCkrXG4nXFxuPC9saT4nO1xufVxucmV0dXJuIF9fcDtcbn07XG4iLCJ2YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbnZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xud2l0aChvYmp8fHt9KXtcbl9fcCs9Jzx1bCBjbGFzcz1cInpvdGVyby1pdGVtc1wiPlxcblxcdCcrXG4oKF9fdD0oIHpvdGVyb0l0ZW1zICkpPT1udWxsPycnOl9fdCkrXG4nXFxuPC91bD4nO1xufVxucmV0dXJuIF9fcDtcbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gYWRkSGFuZGxlcnMoY29udGFpbmVyKSB7XG5cdGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2KSB7XG5cdFx0Y29uc29sZS5pbmZvKGV2KTtcblx0XHRpZihldi50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCd6b3Rlcm8tYWJzdHJhY3QtdG9nZ2xlJykpIHtcblx0XHRcdGxldCBhYnN0cmFjdFNob3J0RWwgPSBldi50YXJnZXQucGFyZW50Tm9kZS5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJy56b3Rlcm8tYWJzdHJhY3Qtc2hvcnQnKTtcblx0XHRcdGxldCBhYnN0cmFjdEVsID0gZXYudGFyZ2V0LnBhcmVudE5vZGUucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCcuem90ZXJvLWFic3RyYWN0Jyk7XG5cdFx0XHRsZXQgZXhwYW5kZWQgPSBhYnN0cmFjdFNob3J0RWwuY2xhc3NMaXN0LnRvZ2dsZSgnem90ZXJvLWFic3RyYWN0LWV4cGFuZGVkJyk7XG5cdFx0XHRhYnN0cmFjdEVsLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGV4cGFuZGVkID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG5cdFx0fVxuXHRcdGlmKGV2LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3pvdGVyby1ncm91cC10aXRsZScpKSB7XG5cdFx0XHRsZXQgZ3JvdXBFbCA9IGV2LnRhcmdldC5wYXJlbnROb2RlO1xuXHRcdFx0bGV0IGV4cGFuZGVkID0gZ3JvdXBFbC5jbGFzc0xpc3QudG9nZ2xlKCd6b3Rlcm8tZ3JvdXAtZXhwYW5kZWQnKTtcblx0XHRcdGdyb3VwRWwuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgZXhwYW5kZWQgPyAndHJ1ZScgOiAnZmFsc2UnKTtcblx0XHR9XG5cdH0pO1xufVxuXG4iXX0=
