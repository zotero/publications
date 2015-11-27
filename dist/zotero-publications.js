(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ZoteroPublications = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/srv/zotero/my-publications/src/js/api.js":[function(require,module,exports){
(function (global){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.processResponse = processResponse;
exports.fetchUntilExhausted = fetchUntilExhausted;

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _lodash = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;

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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./data.js":"/srv/zotero/my-publications/src/js/data.js"}],"/srv/zotero/my-publications/src/js/app.js":[function(require,module,exports){
(function (global){
(function (global){
'use strict';

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _lodash = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;

var _lodash2 = _interopRequireDefault(_lodash);

var _renderJs = require('./render.js');

var _apiJs = require('./api.js');

var _dataJs = require('./data.js');

var _uiJs = require('./ui.js');

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
		(0, _uiJs.toggleSpinner)(container, true);
		this.get(endpoint).then(function (data) {
			(0, _uiJs.toggleSpinner)(container, false);
			(0, _renderJs.renderPublications)(container, data);
		});
	}
};

module.exports = ZoteroPublications;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","./data.js":"/srv/zotero/my-publications/src/js/data.js","./render.js":"/srv/zotero/my-publications/src/js/render.js","./ui.js":"/srv/zotero/my-publications/src/js/ui.js"}],"/srv/zotero/my-publications/src/js/data.js":[function(require,module,exports){
(function (global){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ZoteroData = ZoteroData;

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { "default": obj };
}

var _lodash = typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null;

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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/render.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () {
	function sliceIterator(arr, i) {
		var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
			for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
				_arr.push(_s.value);if (i && _arr.length === i) break;
			}
		} catch (err) {
			_d = true;_e = err;
		} finally {
			try {
				if (!_n && _i['return']) _i['return']();
			} finally {
				if (_d) throw _e;
			}
		}return _arr;
	}return function (arr, i) {
		if (Array.isArray(arr)) {
			return arr;
		} else if (Symbol.iterator in Object(arr)) {
			return sliceIterator(arr, i);
		} else {
			throw new TypeError('Invalid attempt to destructure non-iterable instance');
		}
	};
})();

exports.renderItem = renderItem;
exports.renderCollection = renderCollection;
exports.renderChildItem = renderChildItem;
exports.renderChildItems = renderChildItems;
exports.renderGroup = renderGroup;
exports.renderGrouped = renderGrouped;
exports.renderPublications = renderPublications;

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

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
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='var _ = (typeof window !== "undefined" ? window[\'_\'] : typeof global !== "undefined" ? global[\'_\'] : null);\nmodule.exports = function(obj){\nvar __t,__p=\'\',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,\'\');};\nwith(obj||{}){\n__p+=\'<div class="zotero-branding">\\n\\tPowered by <span class="zotero-logo"></span>\\n</div>\';\n}\nreturn __p;\n};\n';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/child-item.tpl":[function(require,module,exports){
(function (global){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='var _ = (typeof window !== "undefined" ? window[\'_\'] : typeof global !== "undefined" ? global[\'_\'] : null);\nmodule.exports = function(obj){\nvar __t,__p=\'\',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,\'\');};\nwith(obj||{}){\n__p+=\'<li>\\n\\t\'+\n((__t=( item.data.key ))==null?\'\':_.escape(__t))+\n\': \'+\n((__t=( item.data.itemType ))==null?\'\':_.escape(__t))+\n\' \\n</li>\';\n}\nreturn __p;\n};\n';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/child-items.tpl":[function(require,module,exports){
(function (global){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='var _ = (typeof window !== "undefined" ? window[\'_\'] : typeof global !== "undefined" ? global[\'_\'] : null);\nmodule.exports = function(obj){\nvar __t,__p=\'\',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,\'\');};\nwith(obj||{}){\n__p+=\'<ul class="zotero-child-items">\\n\\t\'+\n((__t=( childItemsMarkup ))==null?\'\':__t)+\n\'\\n</ul>\';\n}\nreturn __p;\n};\n';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/group.tpl":[function(require,module,exports){
(function (global){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='var _ = (typeof window !== "undefined" ? window[\'_\'] : typeof global !== "undefined" ? global[\'_\'] : null);\nmodule.exports = function(obj){\nvar __t,__p=\'\',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,\'\');};\nwith(obj||{}){\n__p+=\'<li class="zotero-group\'+\n((__t=( expand ? \' zotero-group-expanded\' : \'\' ))==null?\'\':_.escape(__t))+\n\'" aria-expanded="\'+\n((__t=( expand ? \' true\' : \'false\' ))==null?\'\':_.escape(__t))+\n\'" >\\n\\t<h3 class="zotero-group-title">\'+\n((__t=( title ))==null?\'\':_.escape(__t))+\n\'</h3>\\n\\t\'+\n((__t=( itemsMarkup ))==null?\'\':__t)+\n\'\\n</li>\';\n}\nreturn __p;\n};\n';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/groups.tpl":[function(require,module,exports){
(function (global){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='var _ = (typeof window !== "undefined" ? window[\'_\'] : typeof global !== "undefined" ? global[\'_\'] : null);\nmodule.exports = function(obj){\nvar __t,__p=\'\',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,\'\');};\nwith(obj||{}){\n__p+=\'<ul class="zotero-groups">\\n\\t\'+\n((__t=( groupsMarkup ))==null?\'\':__t)+\n\'\\n</ul>\';\n}\nreturn __p;\n};\n';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/item.tpl":[function(require,module,exports){
(function (global){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='var _ = (typeof window !== "undefined" ? window[\'_\'] : typeof global !== "undefined" ? global[\'_\'] : null);\nmodule.exports = function(obj){\nvar __t,__p=\'\',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,\'\');};\nwith(obj||{}){\n__p+=\'<li class="zotero-item zotero-\'+\n((__t=( data.itemType ))==null?\'\':_.escape(__t))+\n\'">\\n\\t\'+\n((__t=( item.citation ))==null?\'\':__t)+\n\'\\n\\t\';\n if (data.abstractNoteShort && data.abstractNoteShort.length) { \n__p+=\'\\n    \\t<p class="zotero-abstract-short">\\n    \\t\\t\'+\n((__t=( data.abstractNoteShort ))==null?\'\':_.escape(__t))+\n\'\\n    \\t\\t<a class="zotero-abstract-toggle" aria-controls="za-\'+\n((__t=( item.key ))==null?\'\':_.escape(__t))+\n\'">...</a>\\n    \\t</p>\\n\\t\';\n } \n__p+=\'\\n\\t\';\n if (data.abstractNote && data.abstractNote.length) { \n__p+=\'\\n    \\t<p id="za-\'+\n((__t=( item.key ))==null?\'\':_.escape(__t))+\n\'" class="zotero-abstract" aria-expanded="false">\\n    \\t\\t\'+\n((__t=( data.abstractNote ))==null?\'\':_.escape(__t))+\n\'\\n    \\t\\t<a class="zotero-abstract-toggle">...</a>\\n    \\t</p>\\n\\t\';\n } \n__p+=\'\\n    \'+\n((__t=( childItemsMarkup ))==null?\'\':__t)+\n\'\\n</li>\';\n}\nreturn __p;\n};\n';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/items.tpl":[function(require,module,exports){
(function (global){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='var _ = (typeof window !== "undefined" ? window[\'_\'] : typeof global !== "undefined" ? global[\'_\'] : null);\nmodule.exports = function(obj){\nvar __t,__p=\'\',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,\'\');};\nwith(obj||{}){\n__p+=\'<ul class="zotero-items">\\n\\t\'+\n((__t=( zoteroItems ))==null?\'\':__t)+\n\'\\n</ul>\';\n}\nreturn __p;\n};\n';
}
return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/ui.js":[function(require,module,exports){
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

function toggleSpinner(container, activate) {
	var method = activate === null ? container.classList.toggle : activate ? container.classList.add : container.classList.remove;
	method.call(container.classList, 'zotero-loading');
}

},{}]},{},["/srv/zotero/my-publications/src/js/app.js"])("/srv/zotero/my-publications/src/js/app.js")
});