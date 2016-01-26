(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ZoteroPublications = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/srv/zotero/my-publications/node_modules/core-js/es6/promise.js":[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js","../modules/es6.object.to-string":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.object.to-string.js","../modules/es6.promise":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.promise.js","../modules/es6.string.iterator":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.string.iterator.js","../modules/web.dom.iterable":"/srv/zotero/my-publications/node_modules/core-js/modules/web.dom.iterable.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_.js":[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_a-function.js":[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_add-to-unscopables.js":[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_an-instance.js":[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js":[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_array-from-iterable.js":[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":"/srv/zotero/my-publications/node_modules/core-js/modules/_for-of.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_classof.js":[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":"/srv/zotero/my-publications/node_modules/core-js/modules/_cof.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_cof.js":[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js":[function(require,module,exports){
var core = module.exports = {version: '2.0.3'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js":[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":"/srv/zotero/my-publications/node_modules/core-js/modules/_a-function.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_defined.js":[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js":[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":"/srv/zotero/my-publications/node_modules/core-js/modules/_fails.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_dom-create.js":[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_export.js":[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , hide      = require('./_hide')
  , redefine  = require('./_redefine')
  , ctx       = require('./_ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own)redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js","./_ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_fails.js":[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_for-of.js":[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js","./_is-array-iter":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-array-iter.js","./_iter-call":"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-call.js","./_to-length":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-length.js","./core.get-iterator-method":"/srv/zotero/my-publications/node_modules/core-js/modules/core.get-iterator-method.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js":[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js":[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js":[function(require,module,exports){
var $          = require('./_')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_":"/srv/zotero/my-publications/node_modules/core-js/modules/_.js","./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_property-desc":"/srv/zotero/my-publications/node_modules/core-js/modules/_property-desc.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_html.js":[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_invoke.js":[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iobject.js":[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":"/srv/zotero/my-publications/node_modules/core-js/modules/_cof.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_is-array-iter.js":[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/_iterators.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js":[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-call.js":[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-create.js":[function(require,module,exports){
'use strict';
var $              = require('./_')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_":"/srv/zotero/my-publications/node_modules/core-js/modules/_.js","./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_property-desc":"/srv/zotero/my-publications/node_modules/core-js/modules/_property-desc.js","./_set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-to-string-tag.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-define.js":[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getProto       = require('./_').getProto
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getProto($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_":"/srv/zotero/my-publications/node_modules/core-js/modules/_.js","./_export":"/srv/zotero/my-publications/node_modules/core-js/modules/_export.js","./_has":"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js","./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_iter-create":"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-create.js","./_iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/_iterators.js","./_library":"/srv/zotero/my-publications/node_modules/core-js/modules/_library.js","./_redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine.js","./_set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-to-string-tag.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-detect.js":[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-step.js":[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iterators.js":[function(require,module,exports){
module.exports = {};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_library.js":[function(require,module,exports){
module.exports = false;
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_microtask.js":[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process'
  , head, last, notify;

var flush = function(){
  var parent, domain, fn;
  if(isNode && (parent = process.domain)){
    process.domain = null;
    parent.exit();
  }
  while(head){
    domain = head.domain;
    fn     = head.fn;
    if(domain)domain.enter();
    fn(); // <- currently we use it only for Promise - try / catch not required
    if(domain)domain.exit();
    head = head.next;
  } last = undefined;
  if(parent)parent.enter();
};

// Node.js
if(isNode){
  notify = function(){
    process.nextTick(flush);
  };
// browsers with MutationObserver
} else if(Observer){
  var toggle = 1
    , node   = document.createTextNode('');
  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
  notify = function(){
    node.data = toggle = -toggle;
  };
// environments with maybe non-completely correct, but existent Promise
} else if(Promise && Promise.resolve){
  notify = function(){
    Promise.resolve().then(flush);
  };
// for other environments - macrotask based on:
// - setImmediate
// - MessageChannel
// - window.postMessag
// - onreadystatechange
// - setTimeout
} else {
  notify = function(){
    // strange IE + webpack dev server bug - use .call(global)
    macrotask.call(global, flush);
  };
}

module.exports = function asap(fn){
  var task = {fn: fn, next: undefined, domain: isNode && process.domain};
  if(last)last.next = task;
  if(!head){
    head = task;
    notify();
  } last = task;
};
},{"./_cof":"/srv/zotero/my-publications/node_modules/core-js/modules/_cof.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_task":"/srv/zotero/my-publications/node_modules/core-js/modules/_task.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_property-desc.js":[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine-all.js":[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function(target, src, safe){
  for(var key in src)redefine(target, key, src[key], safe);
  return target;
};
},{"./_redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine.js":[function(require,module,exports){
// add fake Function#toString
// for correct work wrapped methods / constructors with methods like LoDash isNative
var global    = require('./_global')
  , hide      = require('./_hide')
  , SRC       = require('./_uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  if(typeof val == 'function'){
    val.hasOwnProperty(SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    val.hasOwnProperty('name') || hide(val, 'name', key);
  }
  if(O === global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else hide(O, key, val);
    }
  }
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./_core":"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_uid":"/srv/zotero/my-publications/node_modules/core-js/modules/_uid.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_set-proto.js":[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./_').getDesc
  , isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_":"/srv/zotero/my-publications/node_modules/core-js/modules/_.js","./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js","./_is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_set-species.js":[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , $           = require('./_')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_":"/srv/zotero/my-publications/node_modules/core-js/modules/_.js","./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_set-to-string-tag.js":[function(require,module,exports){
var def = require('./_').setDesc
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_":"/srv/zotero/my-publications/node_modules/core-js/modules/_.js","./_has":"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_shared.js":[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_species-constructor.js":[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":"/srv/zotero/my-publications/node_modules/core-js/modules/_a-function.js","./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_string-at.js":[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":"/srv/zotero/my-publications/node_modules/core-js/modules/_defined.js","./_to-integer":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-integer.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_task.js":[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listner = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listner, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":"/srv/zotero/my-publications/node_modules/core-js/modules/_cof.js","./_ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js","./_dom-create":"/srv/zotero/my-publications/node_modules/core-js/modules/_dom-create.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_html":"/srv/zotero/my-publications/node_modules/core-js/modules/_html.js","./_invoke":"/srv/zotero/my-publications/node_modules/core-js/modules/_invoke.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_to-integer.js":[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_to-iobject.js":[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":"/srv/zotero/my-publications/node_modules/core-js/modules/_defined.js","./_iobject":"/srv/zotero/my-publications/node_modules/core-js/modules/_iobject.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_to-length.js":[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-integer.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_uid.js":[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js":[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';
module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};
},{"./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_shared":"/srv/zotero/my-publications/node_modules/core-js/modules/_shared.js","./_uid":"/srv/zotero/my-publications/node_modules/core-js/modules/_uid.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/core.get-iterator-method.js":[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":"/srv/zotero/my-publications/node_modules/core-js/modules/_classof.js","./_core":"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js","./_iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/_iterators.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.array.iterator.js":[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":"/srv/zotero/my-publications/node_modules/core-js/modules/_add-to-unscopables.js","./_iter-define":"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-define.js","./_iter-step":"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-step.js","./_iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/_iterators.js","./_to-iobject":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-iobject.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.object.to-string.js":[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof')
  , test    = {};
test[require('./_wks')('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  require('./_redefine')(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"./_classof":"/srv/zotero/my-publications/node_modules/core-js/modules/_classof.js","./_redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.promise.js":[function(require,module,exports){
'use strict';
var $                  = require('./_')
  , LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , anObject           = require('./_an-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , from               = require('./_array-from-iterable')
  , setProto           = require('./_set-proto').set
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var testResolve = function(sub){
  var test = new $Promise(empty), promise;
  if(sub)test.constructor = function(exec){
    exec(empty, empty);
  };
  (promise = $Promise.resolve(test))['catch'](empty);
  return promise === test;
};

var USE_NATIVE = function(){
  var works = false;
  var SubPromise = function(x){
    var self = new $Promise(x);
    setProto(self, SubPromise.prototype);
    return self;
  };
  try {
    works = $Promise && $Promise.resolve && testResolve();
    setProto(SubPromise, $Promise);
    SubPromise.prototype = $.create($Promise.prototype, {constructor: {value: SubPromise}});
    // actual Firefox has broken subclass support, test that
    if(!(SubPromise.resolve(5).then(empty) instanceof SubPromise)){
      works = false;
    }
    // V8 4.8- bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./_descriptors')){
      var thenableThenGotten = false;
      $Promise.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return !!works;
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          result = handler === true ? value : handler(value);
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    if(isUnhandled(promise)){
      var value = promise._v
        , handler, console;
      if(isNode){
        process.emit('unhandledRejection', value, promise);
      } else if(handler = global.onunhandledrejection){
        handler({promise: promise, reason: value});
      } else if((console = global.console) && console.error){
        console.error('Unhandled promise rejection', value);
      } promise._h = 2;
    } promise._a = undefined;
  });
};
var isUnhandled = function(promise){
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  if(promise._h == 1)return false;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok   = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = from(iterable)
        , remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        var alreadyCalled = false;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled = true;
          results[index] = value;
          --remaining || resolve(results);
        }, reject);
      });
      else resolve(results);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_":"/srv/zotero/my-publications/node_modules/core-js/modules/_.js","./_a-function":"/srv/zotero/my-publications/node_modules/core-js/modules/_a-function.js","./_an-instance":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-instance.js","./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_array-from-iterable":"/srv/zotero/my-publications/node_modules/core-js/modules/_array-from-iterable.js","./_classof":"/srv/zotero/my-publications/node_modules/core-js/modules/_classof.js","./_core":"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js","./_ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js","./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_export":"/srv/zotero/my-publications/node_modules/core-js/modules/_export.js","./_for-of":"/srv/zotero/my-publications/node_modules/core-js/modules/_for-of.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js","./_iter-detect":"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-detect.js","./_library":"/srv/zotero/my-publications/node_modules/core-js/modules/_library.js","./_microtask":"/srv/zotero/my-publications/node_modules/core-js/modules/_microtask.js","./_redefine-all":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine-all.js","./_set-proto":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-proto.js","./_set-species":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-species.js","./_set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-to-string-tag.js","./_species-constructor":"/srv/zotero/my-publications/node_modules/core-js/modules/_species-constructor.js","./_task":"/srv/zotero/my-publications/node_modules/core-js/modules/_task.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.string.iterator.js":[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-define.js","./_string-at":"/srv/zotero/my-publications/node_modules/core-js/modules/_string-at.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/web.dom.iterable.js":[function(require,module,exports){
var $iterators     = require('./es6.array.iterator')
  , redefine       = require('./_redefine')
  , global         = require('./_global')
  , hide           = require('./_hide')
  , Iterators      = require('./_iterators')
  , wks            = require('./_wks')
  , ITERATOR       = wks('iterator')
  , TO_STRING_TAG  = wks('toStringTag')
  , ArrayValues    = Iterators.Array;

require('./_').each.call(['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], function(NAME){
  var Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
  }
});
},{"./_":"/srv/zotero/my-publications/node_modules/core-js/modules/_.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/_iterators.js","./_redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js","./es6.array.iterator":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.array.iterator.js"}],"/srv/zotero/my-publications/node_modules/d/index.js":[function(require,module,exports){
'use strict';

var assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , isCallable    = require('es5-ext/object/is-callable')
  , contains      = require('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":"/srv/zotero/my-publications/node_modules/es5-ext/object/assign/index.js","es5-ext/object/is-callable":"/srv/zotero/my-publications/node_modules/es5-ext/object/is-callable.js","es5-ext/object/normalize-options":"/srv/zotero/my-publications/node_modules/es5-ext/object/normalize-options.js","es5-ext/string/#/contains":"/srv/zotero/my-publications/node_modules/es5-ext/string/#/contains/index.js"}],"/srv/zotero/my-publications/node_modules/es5-ext/global.js":[function(require,module,exports){
'use strict';

module.exports = new Function("return this")();

},{}],"/srv/zotero/my-publications/node_modules/es5-ext/object/assign/index.js":[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":"/srv/zotero/my-publications/node_modules/es5-ext/object/assign/is-implemented.js","./shim":"/srv/zotero/my-publications/node_modules/es5-ext/object/assign/shim.js"}],"/srv/zotero/my-publications/node_modules/es5-ext/object/assign/is-implemented.js":[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],"/srv/zotero/my-publications/node_modules/es5-ext/object/assign/shim.js":[function(require,module,exports){
'use strict';

var keys  = require('../keys')
  , value = require('../valid-value')

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":"/srv/zotero/my-publications/node_modules/es5-ext/object/keys/index.js","../valid-value":"/srv/zotero/my-publications/node_modules/es5-ext/object/valid-value.js"}],"/srv/zotero/my-publications/node_modules/es5-ext/object/is-callable.js":[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],"/srv/zotero/my-publications/node_modules/es5-ext/object/keys/index.js":[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":"/srv/zotero/my-publications/node_modules/es5-ext/object/keys/is-implemented.js","./shim":"/srv/zotero/my-publications/node_modules/es5-ext/object/keys/shim.js"}],"/srv/zotero/my-publications/node_modules/es5-ext/object/keys/is-implemented.js":[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],"/srv/zotero/my-publications/node_modules/es5-ext/object/keys/shim.js":[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],"/srv/zotero/my-publications/node_modules/es5-ext/object/normalize-options.js":[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],"/srv/zotero/my-publications/node_modules/es5-ext/object/valid-value.js":[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],"/srv/zotero/my-publications/node_modules/es5-ext/string/#/contains/index.js":[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":"/srv/zotero/my-publications/node_modules/es5-ext/string/#/contains/is-implemented.js","./shim":"/srv/zotero/my-publications/node_modules/es5-ext/string/#/contains/shim.js"}],"/srv/zotero/my-publications/node_modules/es5-ext/string/#/contains/is-implemented.js":[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],"/srv/zotero/my-publications/node_modules/es5-ext/string/#/contains/shim.js":[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js":[function(require,module,exports){
'use strict';

if (!require('./is-implemented')()) {
	Object.defineProperty(require('es5-ext/global'), 'Symbol',
		{ value: require('./polyfill'), configurable: true, enumerable: false,
			writable: true });
}

},{"./is-implemented":"/srv/zotero/my-publications/node_modules/es6-symbol/is-implemented.js","./polyfill":"/srv/zotero/my-publications/node_modules/es6-symbol/polyfill.js","es5-ext/global":"/srv/zotero/my-publications/node_modules/es5-ext/global.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/is-implemented.js":[function(require,module,exports){
'use strict';

module.exports = function () {
	var symbol;
	if (typeof Symbol !== 'function') return false;
	symbol = Symbol('test symbol');
	try { String(symbol); } catch (e) { return false; }
	if (typeof Symbol.iterator === 'symbol') return true;

	// Return 'true' for polyfills
	if (typeof Symbol.isConcatSpreadable !== 'object') return false;
	if (typeof Symbol.iterator !== 'object') return false;
	if (typeof Symbol.toPrimitive !== 'object') return false;
	if (typeof Symbol.toStringTag !== 'object') return false;
	if (typeof Symbol.unscopables !== 'object') return false;

	return true;
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/is-symbol.js":[function(require,module,exports){
'use strict';

module.exports = function (x) {
	return (x && ((typeof x === 'symbol') || (x['@@toStringTag'] === 'Symbol'))) || false;
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/polyfill.js":[function(require,module,exports){
// ES2015 Symbol polyfill for environments that do not support it (or partially support it_

'use strict';

var d              = require('d')
  , validateSymbol = require('./validate-symbol')

  , create = Object.create, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null);

if (typeof Symbol === 'function') NativeSymbol = Symbol;

var generateName = (function () {
	var created = create(null);
	return function (desc) {
		var postfix = 0, name, ie11BugWorkaround;
		while (created[desc + (postfix || '')]) ++postfix;
		desc += (postfix || '');
		created[desc] = true;
		name = '@@' + desc;
		defineProperty(objPrototype, name, d.gs(null, function (value) {
			// For IE11 issue see:
			// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
			//    ie11-broken-getters-on-dom-objects
			// https://github.com/medikoo/es6-symbol/issues/12
			if (ie11BugWorkaround) return;
			ie11BugWorkaround = true;
			defineProperty(this, name, d(value));
			ie11BugWorkaround = false;
		}));
		return name;
	};
}());

// Internal constructor (not one exposed) for creating Symbol instances.
// This one is used to ensure that `someSymbol instanceof Symbol` always return false
HiddenSymbol = function Symbol(description) {
	if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
	return SymbolPolyfill(description);
};

// Exposed `Symbol` constructor
// (returns instances of HiddenSymbol)
module.exports = SymbolPolyfill = function Symbol(description) {
	var symbol;
	if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
	symbol = create(HiddenSymbol.prototype);
	description = (description === undefined ? '' : String(description));
	return defineProperties(symbol, {
		__description__: d('', description),
		__name__: d('', generateName(description))
	});
};
defineProperties(SymbolPolyfill, {
	for: d(function (key) {
		if (globalSymbols[key]) return globalSymbols[key];
		return (globalSymbols[key] = SymbolPolyfill(String(key)));
	}),
	keyFor: d(function (s) {
		var key;
		validateSymbol(s);
		for (key in globalSymbols) if (globalSymbols[key] === s) return key;
	}),

	// If there's native implementation of given symbol, let's fallback to it
	// to ensure proper interoperability with other native functions e.g. Array.from
	hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
	isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
		SymbolPolyfill('isConcatSpreadable')),
	iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
	match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
	replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
	search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
	species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
	split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
	toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
	toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
	unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
});

// Internal tweaks for real symbol producer
defineProperties(HiddenSymbol.prototype, {
	constructor: d(SymbolPolyfill),
	toString: d('', function () { return this.__name__; })
});

// Proper implementation of methods exposed on Symbol.prototype
// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
defineProperties(SymbolPolyfill.prototype, {
	toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
	valueOf: d(function () { return validateSymbol(this); })
});
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('',
	function () { return validateSymbol(this); }));
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
	d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

// Note: It's important to define `toPrimitive` as last one, as some implementations
// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
// And that may invoke error in definition flow:
// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
	d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));

},{"./validate-symbol":"/srv/zotero/my-publications/node_modules/es6-symbol/validate-symbol.js","d":"/srv/zotero/my-publications/node_modules/d/index.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/validate-symbol.js":[function(require,module,exports){
'use strict';

var isSymbol = require('./is-symbol');

module.exports = function (value) {
	if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
	return value;
};

},{"./is-symbol":"/srv/zotero/my-publications/node_modules/es6-symbol/is-symbol.js"}],"/srv/zotero/my-publications/node_modules/whatwg-fetch/fetch.js":[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],"/srv/zotero/my-publications/src/js/api.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FORMATTED_DATE_SYMBOL = exports.AUTHORS_SYMBOL = exports.ABSTRACT_NOTE_SHORT_SYMBOL = undefined;
exports.processResponse = processResponse;
exports.fetchUntilExhausted = fetchUntilExhausted;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils.js');

var _data = require('./data.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('es6-symbol/implement');
var ABSTRACT_NOTE_SHORT_SYMBOL = exports.ABSTRACT_NOTE_SHORT_SYMBOL = Symbol.for('abstractNoteShort');
var AUTHORS_SYMBOL = exports.AUTHORS_SYMBOL = Symbol.for('authors');
var FORMATTED_DATE_SYMBOL = exports.FORMATTED_DATE_SYMBOL = Symbol.for('formattedDate');

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
			if (item.data && item.data.creators) {
				item.data[AUTHORS_SYMBOL] = item.data.creators.map(function (author) {
					return author.firstName + ' ' + author.lastName;
				}).join(' & ');
			}
			if (item.data && item.meta.parsedDate) {
				item.data[FORMATTED_DATE_SYMBOL] = (0, _utils.formatDate)(item.meta.parsedDate);
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

				if (item.data.itemType === 'note') {
					if (!index[item.data.parentItem][_data.CHILD_NOTES]) {
						index[item.data.parentItem][_data.CHILD_NOTES] = [];
					}
					index[item.data.parentItem][_data.CHILD_NOTES].push(item);
				} else if (item.data.itemType === 'attachment') {
					if (!index[item.data.parentItem][_data.CHILD_ATTACHMENTS]) {
						index[item.data.parentItem][_data.CHILD_ATTACHMENTS] = [];
					}
					index[item.data.parentItem][_data.CHILD_ATTACHMENTS].push(item);
				} else {
					if (!index[item.data.parentItem][_data.CHILD_OTHER]) {
						index[item.data.parentItem][_data.CHILD_OTHER] = [];
					}
					index[item.data.parentItem][_data.CHILD_OTHER].push(item);
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
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
								if (!(jsonDataPart instanceof Array)) {
									jsonDataPart = [jsonDataPart];
								}
								resolve(fetchUntilExhausted(matches[1], options, _lodash2.default.union(jsondata, jsonDataPart)));
							});
						} else {
							response.json().then(function (jsonDataPart) {
								if (!(jsonDataPart instanceof Array)) {
									jsonDataPart = [jsonDataPart];
								}
								resolve(_lodash2.default.union(jsondata, jsonDataPart));
							});
						}
					})();
				} else {
					response.json().then(function (jsonDataPart) {
						if (!(jsonDataPart instanceof Array)) {
							jsonDataPart = [jsonDataPart];
						}
						resolve(_lodash2.default.union(jsondata, jsonDataPart));
					});
				}
			} else {
				reject(new Error('Unexpected status code ' + response.status + ' when requesting ' + url));
			}
		}).catch(function () {
			reject(new Error('Unexpected error when requesting ' + url));
		});
	});
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./data.js":"/srv/zotero/my-publications/src/js/data.js","./utils.js":"/srv/zotero/my-publications/src/js/utils.js","es6-symbol/implement":"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js"}],"/srv/zotero/my-publications/src/js/data.js":[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GROUP_TITLE = exports.GROUP_EXPANDED_SUMBOL = exports.CHILD_OTHER = exports.CHILD_ATTACHMENTS = exports.CHILD_NOTES = exports.GROUPED_BY_COLLECTION = exports.GROUPED_BY_TYPE = exports.GROUPED_NONE = undefined;
exports.ZoteroData = ZoteroData;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _api = require('./api.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('es6-symbol/implement');
var GROUPED_NONE = exports.GROUPED_NONE = 0;
var GROUPED_BY_TYPE = exports.GROUPED_BY_TYPE = 1;
var GROUPED_BY_COLLECTION = exports.GROUPED_BY_COLLECTION = 2;
var CHILD_NOTES = exports.CHILD_NOTES = Symbol.for('childNotes');
var CHILD_ATTACHMENTS = exports.CHILD_ATTACHMENTS = Symbol.for('childAttachments');
var CHILD_OTHER = exports.CHILD_OTHER = Symbol.for('childOther');
var GROUP_EXPANDED_SUMBOL = exports.GROUP_EXPANDED_SUMBOL = Symbol.for('groupExpanded');
var GROUP_TITLE = exports.GROUP_TITLE = Symbol.for('groupTitle');

/**
 * Store, Encapsulate and Manipulate Zotero API data
 * @param {Object[]} data   - Zotero API data to encapsulate
 * @param {Object} [config] - ZoteroPublications config
 */
function ZoteroData(data, config) {
	this.raw = this.data = (0, _api.processResponse)(data, config);
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
		groupedData[item.data.itemType][GROUP_EXPANDED_SUMBOL] = expand === 'all' || _lodash2.default.contains(expand, item.data.itemType);
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
 * For grouped data each iternation returns a group of Zotero items. Additionaly group name
 * is available under GROUP_TITLE Symbol
 */
ZoteroData.prototype[Symbol.iterator] = function () {
	var _this = this;

	var i = 0;
	if (this.grouped > 0) {
		var _ret = function () {
			var keys = Object.keys(_this.data);
			return {
				v: {
					next: function () {
						var group = this.data[keys[i]];
						group[GROUP_TITLE] = keys[i];
						return {
							value: group,
							done: ++i === keys.length
						};
					}.bind(_this)
				}
			};
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	} else {
		return {
			next: function () {
				return {
					value: i < this.data.length ? this.data[i] : null,
					done: i++ >= this.data.length
				};
			}.bind(this)
		};
	}
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","es6-symbol/implement":"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js"}],"/srv/zotero/my-publications/src/js/main-compat.js":[function(require,module,exports){
'use strict';

var _main = require('./main.js');

// require('core-js/es5');

// doesn't seem to work very well in IE
// require('es6-promise').polyfill();
require('core-js/es6/promise');
require('whatwg-fetch');

module.exports = _main.ZoteroPublications;

},{"./main.js":"/srv/zotero/my-publications/src/js/main.js","core-js/es6/promise":"/srv/zotero/my-publications/node_modules/core-js/es6/promise.js","whatwg-fetch":"/srv/zotero/my-publications/node_modules/whatwg-fetch/fetch.js"}],"/srv/zotero/my-publications/src/js/main.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ZoteroPublications = ZoteroPublications;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _render = require('./render.js');

var _api = require('./api.js');

var _data = require('./data.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Application entry point
 * @param {Object} [config] - Configuration object that will selectively override the defaults
 */
function ZoteroPublications() {
	if (arguments.length <= 1) {
		this.config = _lodash2.default.extend({}, this.defaults, arguments ? arguments[0] : {});
	} else if (arguments.length <= 3) {
		this.config = _lodash2.default.extend({}, this.defaults, arguments[2]);
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
	alwaysUseCitationStyle: false,
	expand: 'all'
};

ZoteroPublications.prototype.get = function (url, options) {
	options = options || {
		headers: {
			'Accept': 'application/json'
		}
	};

	return new Promise(function (resolve, reject) {
		var promise = (0, _api.fetchUntilExhausted)(url, options);
		promise.then(function (responseJson) {
			var data = new _data.ZoteroData(responseJson, this.config);
			if (this.config.group === 'type') {
				data.groupByType(this.config.expand);
			}
			resolve(data);
		}.bind(this));
		promise.catch(reject);
	}.bind(this));
};

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint - An API endpoint from which data should be obtained
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getEndpoint = function (endpoint) {
	var apiBase = this.config.apiBase,
	    limit = this.config.limit,
	    style = this.config.citationStyle,
	    include = this.config.include.join(','),
	    url = 'https://' + apiBase + '/' + endpoint + '?include=' + include + '&limit=' + limit + '&linkwrap=1&order=dateModified&sort=desc&start=0&style=' + style;

	return this.get(url);
};

ZoteroPublications.prototype.getPublications = function (userId, citationStyle) {
	var apiBase = this.config.apiBase,
	    limit = this.config.limit,
	    style = citationStyle || this.config.citationStyle,
	    include = this.config.include.join(','),
	    url = 'https://' + apiBase + '/users/' + userId + '/publications/items?include=' + include + '&limit=' + limit + '&linkwrap=1&order=dateModified&sort=desc&start=0&style=' + style;

	this.userId = userId;

	return this.get(url);
};

ZoteroPublications.prototype.getItem = function (itemId, userId, citationStyle) {
	var apiBase = this.config.apiBase,
	    limit = this.config.limit,
	    style = citationStyle || this.config.citationStyle,
	    include = this.config.include.join(','),
	    url = 'https://' + apiBase + '/users/' + userId + '/publications/items/' + itemId + '?include=' + include + '&limit=' + limit + '&linkwrap=1&order=dateModified&sort=desc&start=0&style=' + style;

	return this.get(url);
};

/**
 * Render local or remote items.
 * @param  {String|ZoteroData} endpointOrData - Data containung publications to be rendered
 * @param  {HTMLElement} container            - A DOM element where publications will be rendered
 * @return {Promise}                          - Resolved when rendered or rejected on error.
 */
ZoteroPublications.prototype.render = function (endpointOrData, container) {
	return new Promise(function (resolve, reject) {
		if (!(container instanceof HTMLElement)) {
			reject(new Error('Second argument to render() method must be a DOM element'));
		}
		if (endpointOrData instanceof _data.ZoteroData) {
			this.renderer = new _render.ZoteroRenderer(container, this);
			var data = endpointOrData;
			this.renderer.displayPublications(data);
			resolve();
		} else if (typeof endpointOrData === 'string') {
			this.renderer = new _render.ZoteroRenderer(container, this);
			var endpoint = endpointOrData;
			var promise = this.getEndpoint(endpoint);
			promise.then(function (data) {
				this.renderer.displayPublications(data);
				resolve();
			}.bind(this));
			promise.catch(function () {
				reject(arguments[0]);
			});
		} else {
			reject(new Error('First argument to render() method must be an endpoint or an instance of ZoteroData'));
		}
	}.bind(this));
};

/**
 * Make ZoteroData publicly accessible underneath ZoteroPublications
 * @type {ZoteroData}
 */
ZoteroPublications.ZoteroData = _data.ZoteroData;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","./data.js":"/srv/zotero/my-publications/src/js/data.js","./render.js":"/srv/zotero/my-publications/src/js/render.js"}],"/srv/zotero/my-publications/src/js/render.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ZoteroRenderer = ZoteroRenderer;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _item = require('./tpl/partial/item.tpl');

var _item2 = _interopRequireDefault(_item);

var _items = require('./tpl/partial/items.tpl');

var _items2 = _interopRequireDefault(_items);

var _group = require('./tpl/partial/group.tpl');

var _group2 = _interopRequireDefault(_group);

var _groups = require('./tpl/partial/groups.tpl');

var _groups2 = _interopRequireDefault(_groups);

var _branding = require('./tpl/partial/branding.tpl');

var _branding2 = _interopRequireDefault(_branding);

var _groupView = require('./tpl/group-view.tpl');

var _groupView2 = _interopRequireDefault(_groupView);

var _plainView = require('./tpl/plain-view.tpl');

var _plainView2 = _interopRequireDefault(_plainView);

var _data = require('./data.js');

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_lodash2.default.templateSettings.variable = 'obj';

/**
 * Zotero Renderer constructor
 * @param {HTMLElement} container	- A container where contents is rendered
 * @param {Object} [config]			- ZoteroPublications config
 */
function ZoteroRenderer(container, zotero) {
	this.container = container;
	this.zotero = zotero;
	this.config = zotero.config;
	this.toggleSpinner(true);
}

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
ZoteroRenderer.prototype.renderItem = function (zoteroItem) {
	return (0, _item2.default)({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render a list of Zotero items
 * @param  {Object[]} zoteroItems - List of Zotero items
 * @return {String}                          - Rendered markup of a list of Zotero items
 */
ZoteroRenderer.prototype.renderItems = function (zoteroItems) {
	return (0, _items2.default)({
		'items': zoteroItems,
		'renderer': this
	});
};

/**
 * Render a group of Zotero items
 * @param  {Object[]} items 	- List of items for this group
 * @return {String}             - Rendered markup of a group
 */
ZoteroRenderer.prototype.renderGroup = function (items) {
	return (0, _group2.default)({
		'title': (0, _utils.formatCategoryName)(items[_data.GROUP_TITLE]),
		'items': items,
		'expand': items[_data.GROUP_EXPANDED_SUMBOL],
		'renderer': this
	});
};

/**
 * Renders a list of groups of Zotero items
 * @param {Object[]} 	- List of groups to render
 * @return {String} 	- Rendered markup of groups
 */
ZoteroRenderer.prototype.renderGroups = function (groups) {
	return (0, _groups2.default)({
		'groups': groups,
		'renderer': this
	});
};

/**
 * Render a Group View
 * @param {Object[]} 	- List of groups to render
 * @return {String} 	- Rendered markup of a complete group view
 */
ZoteroRenderer.prototype.renderGroupView = function (data) {
	return (0, _groupView2.default)({
		'groups': data,
		'renderer': this
	});
};

/**
 * Render a Plain View
 * @param  {Object[]} zoteroItems - List of Zotero items
 * @return {String} 	- Rendered markup of a complete plain view
 */
ZoteroRenderer.prototype.renderPlainView = function (data) {
	return (0, _plainView2.default)({
		'items': data,
		'renderer': this
	});
};

/**
 * Render Zotero branding
 * @return {String}
 */
ZoteroRenderer.prototype.renderBranding = function () {
	return (0, _branding2.default)();
};

/**
 * Render Zotero publications into a DOM element
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
ZoteroRenderer.prototype.displayPublications = function (data) {
	var markup;

	if (data.grouped > 0) {
		markup = this.renderGroupView(data);
	} else {
		markup = this.renderPlainView(data);
	}

	this.data = data;
	this.container.innerHTML = markup;

	_lodash2.default.each(this.container.querySelectorAll('.zotero-details'), function (element) {
		element.style.height = element.offsetHeight + 'px';
		element.classList.add('zotero-details-collapsed');
	});

	this.toggleSpinner(false);
	this.previous = markup;
	this.addHandlers();
};

/**
 * Attach interaction handlers
 */
ZoteroRenderer.prototype.addHandlers = function () {
	this.container.addEventListener('click', function (ev) {
		var target;

		target = (0, _utils.closest)(ev.target, function (el) {
			return el.dataset && el.dataset.trigger === 'details';
		});
		if (target) {
			var itemEl = (0, _utils.closest)(target, function (el) {
				return el.dataset && el.dataset.item;
			});
			var detailsEl = itemEl.querySelector('.zotero-details');
			if (detailsEl) {
				detailsEl.classList.toggle('zotero-details-collapsed');
			}
			window.history.pushState(null, null, '#' + itemEl.dataset.item);
			ev.preventDefault();
			return;
		}
		target = (0, _utils.closest)(ev.target, function (el) {
			return el.dataset && el.dataset.trigger === 'cite';
		});
		if (target) {
			var itemEl = (0, _utils.closest)(target, function (el) {
				return el.dataset && el.dataset.item;
			});
			var citeContainerEl = itemEl.querySelector('.zotero-cite-container');
			citeContainerEl.classList.toggle('zotero-cite-container-collapsed');
		}
	});

	this.container.addEventListener('change', function (ev) {
		var _this = this;

		var target;

		target = (0, _utils.closest)(ev.target, function (el) {
			return el.dataset && el.dataset.trigger === 'cite-style-selection';
		});
		if (target) {
			(function () {
				var itemEl = (0, _utils.closest)(target, function (el) {
					return el.dataset && el.dataset.item;
				});
				var itemId = itemEl.dataset.item;
				var citationTextareaEl = itemEl.querySelector('.zotero-citation');
				var citationStyle = target.options[target.selectedIndex].value;
				_this.zotero.getItem(itemId, _this.zotero.userId, citationStyle).then(function (item) {
					citationTextareaEl.value = item.raw[0].citation;
				});
			})();
		}
	}.bind(this));
};

/**
 * Toggle CSS class that gives a visual loading feedback. Optionally allows to explicetly specify
 * whether to display or hide visual feedback.
 * @param  {boolean} [activate]    - Explicitely indicate whether to add or remove visual feedback
 */
ZoteroRenderer.prototype.toggleSpinner = function (activate) {
	var method = activate === null ? this.container.classList.toggle : activate ? this.container.classList.add : this.container.classList.remove;
	method.call(this.container.classList, 'zotero-loading');
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./data.js":"/srv/zotero/my-publications/src/js/data.js","./tpl/group-view.tpl":"/srv/zotero/my-publications/src/js/tpl/group-view.tpl","./tpl/partial/branding.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/branding.tpl","./tpl/partial/group.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/group.tpl","./tpl/partial/groups.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/groups.tpl","./tpl/partial/item.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/item.tpl","./tpl/partial/items.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/items.tpl","./tpl/plain-view.tpl":"/srv/zotero/my-publications/src/js/tpl/plain-view.tpl","./utils.js":"/srv/zotero/my-publications/src/js/utils.js"}],"/srv/zotero/my-publications/src/js/tpl/group-view.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<div class="zotero-publications">\n\t' + ((__t = obj.renderer.renderGroups(obj.groups)) == null ? '' : __t) + '\n\t' + ((__t = obj.renderer.renderBranding()) == null ? '' : __t) + '\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/branding.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<div class="zotero-branding">\n\t<a href="http://www.zotero.org" class="zotero-logo-link">\n\t\t<svg class="zotero-logo" version="1.1" xmlns="http://www.w3.org/2000/svg" width="90" height="20">\n\t\t\t<g>\n\t\t\t\t<path class="zotero-z" fill="#990000" d="M12.2,6.1L2.8,17.8h9.4v1.9H0v-2.2L9.4,5.8H0.8V3.9h11.4V6.1z"/>\n\t\t\t\t<path fill="#222222" d="M22.1,3.7c5.9,0,7,1.4,7,8.1c0,6.7-1.1,8.1-7,8.1c-5.9,0-7-1.4-7-8.1C15.1,5.2,16.2,3.7,22.1,3.7z M22.1,18\n\t\t\t\t\tc4.2,0,4.5-0.7,4.5-6.1c0-5.5-0.3-6.2-4.5-6.2c-4.2,0-4.5,0.7-4.5,6.2C17.5,17.3,17.8,18,22.1,18z"/>\n\t\t\t\t<path fill="#222222" d="M41.7,5.8h-6.1v10c0,1.7,0.5,2.1,2.2,2.1c2.2,0,2.2-1.2,2.2-2.7v-1.2h2.3v1.2c0,3.1-1.3,4.6-4.5,4.6\n\t\t\t\t\tc-3.7,0-4.5-1.1-4.5-4.8V5.8h-2.1V3.9h2.1V0.1h2.4v3.8h6.1V5.8z"/>\n\t\t\t\t<path fill="#222222" d="M58.3,14.9v0.6c0,4.2-3.2,4.4-6.7,4.4c-6.2,0-7.1-2-7.1-8.1c0-6.6,1.4-8.1,7.1-8.1c5.1,0,6.7,1.2,6.7,7v1.6\n\t\t\t\t\tH46.9c0,5,0.4,5.6,4.6,5.6c3.3,0,4.3-0.2,4.3-2.4v-0.6H58.3z M55.8,10.4c-0.1-4.5-0.7-4.8-4.3-4.8c-4.3,0-4.5,1.1-4.6,4.8H55.8z"/>\n\t\t\t\t<path fill="#222222" d="M64.6,3.9l-0.1,2l0.1,0.1c0.8-1.7,2.7-2.2,4.5-2.2c3,0,4.4,1.5,4.4,4.5v1.1h-2.3V8.3c0-2-0.7-2.6-2.6-2.6\n\t\t\t\t\tc-3,0-3.9,1.4-3.9,4.2v9.8h-2.4V3.9H64.6z"/>\n\t\t\t\t<path fill="#222222" d="M83,3.7c5.9,0,7,1.4,7,8.1c0,6.7-1.1,8.1-7,8.1c-5.9,0-7-1.4-7-8.1C76,5.2,77.1,3.7,83,3.7z M83,18\n\t\t\t\t\tc4.2,0,4.5-0.7,4.5-6.1c0-5.5-0.3-6.2-4.5-6.2c-4.2,0-4.5,0.7-4.5,6.2C78.4,17.3,78.7,18,83,18z"/>\n\t\t\t</g>\n\t\t</svg>\n\t</a>\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/group.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<li class="zotero-group' + ((__t = obj.expand ? ' zotero-group-expanded' : '') == null ? '' : _.escape(__t)) + '" aria-expanded="' + ((__t = obj.expand ? ' true' : 'false') == null ? '' : _.escape(__t)) + '" >\n\t<h2 class="zotero-group-title" data-trigger="expand-group">' + ((__t = obj.title) == null ? '' : _.escape(__t)) + '</h2>\n\t' + ((__t = obj.renderer.renderItems(obj.items)) == null ? '' : __t) + '\n</li>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/groups.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<ul class="zotero-groups">\n\t';
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = obj.groups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var group = _step.value;

      __p += '\n\t\t' + ((__t = obj.renderer.renderGroup(group)) == null ? '' : __t) + '\n\t';
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  __p += '\n</ul>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/item.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<li class="zotero-item zotero-' + ((__t = obj.data.itemType) == null ? '' : _.escape(__t)) + '" data-item="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '" id="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '">\n\n\t<!-- Reference -->\n\t';
  if (obj.renderer.config.alwaysUseCitationStyle) {
    __p += '\n\t\t<div class="zotero-item-title">\n\t\t\t' + ((__t = obj.item.citation) == null ? '' : __t) + '\n\t\t</div>\n\n\t<!-- Templated -->\n\t';
  } else {
    __p += '\n\t\t';
    if (obj.data.itemType == 'book') {
      __p += '\n\t\t\t<div class="zotero-item-title">\n\t\t\t\t<a href="#">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t\t</div>\n\t\t\t<div class="zotoero-item-subline">\n\t\t\t\tBy ' + ((__t = obj.data[Symbol.for('authors')]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
      if (obj.data[Symbol.for('formattedDate')]) {
        __p += '\n\t\t\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t\t\t';
      }
      __p += '\n\t\t\t</div>\n\n\t\t';
    } else if (obj.data.itemType == 'journalArticle') {
      __p += '\n\t\t\t<div class="zotero-item-title">\n\t\t\t\t<a href="#">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t\t</div>\n\t\t\t<div class="zotoero-item-subline">\n\t\t\t\t' + ((__t = obj.data.journalAbbreviation) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
      if (obj.data[Symbol.for('formattedDate')]) {
        __p += '\n\t\t\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t\t\t';
      }
      __p += '\n\t\t\t</div>\n\n\t\t';
    } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') {
      __p += '\n\t\t\t<div class="zotero-item-title">\n\t\t\t\t<a href="#">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t\t</div>\n\t\t\t<div class="zotoero-item-subline">\n\t\t\t\t' + ((__t = obj.data.publicationTitle) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
      if (obj.data[Symbol.for('formattedDate')]) {
        __p += '\n\t\t\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t\t\t';
      }
      __p += '\n\t\t\t</div>\n\n\t\t';
    } else if (obj.data.itemType == 'blogPost') {
      __p += '\n\t\t\t<div class="zotero-item-title">\n\t\t\t\t<a href="#">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t\t</div>\n\t\t\t<div class="zotoero-item-subline">\n\t\t\t\t' + ((__t = obj.data.blogTitle) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
      if (obj.data[Symbol.for('formattedDate')]) {
        __p += '\n\t\t\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t\t\t';
      }
      __p += '\n\t\t\t</div>\n\n\t\t';
    } else {
      __p += '\n\t\t\t<div class="zotero-item-title">\n\t\t\t\t<a href="#">' + ((__t = obj.item.citation) == null ? '' : __t) + '</a>\n\t\t\t</div>\n\t\t';
    }
    __p += '\n\t';
  }
  __p += '\n\n\t<!-- Details toggle -->\n\t<div>\n\t\t<a href="#' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '" data-trigger="details">\n\t\t\tDetails\n\t\t</a>\n\t</div>\n\n\t<!-- Details -->\n\t<div class="zotero-details">\n\t\t<div class="zotero-details-inner">\n\t\t\t';
  if (!obj.renderer.config.alwaysUseCitationStyle) {
    __p += '\n\t\t\t\t<div class="zotero-reference">\n\t\t\t\t\t' + ((__t = obj.item.citation) == null ? '' : __t) + '\n\t\t\t\t</div>\n\t\t\t';
  }
  __p += '\n\n\t\t\t';
  if (obj.data.abstractNote && obj.data.abstractNote.length) {
    __p += '\n\t\t\t\t<h3>\n\t\t\t\t\tAbstract\n\t\t\t\t</h3>\n\t\t\t\t<p class="zotero-abstract">\n\t\t\t\t\t' + ((__t = obj.data.abstractNote) == null ? '' : _.escape(__t)) + '\n\t\t\t\t</p>\n\t\t\t';
  }
  __p += '\n\n\t\t\t';
  if (obj.item[Symbol.for('childNotes')] && obj.item[Symbol.for('childNotes')].length) {
    __p += '\n\t\t\t\t<h3>Notes</h3>\n\t\t\t\t<ul class="zotero-notes">\n\t\t\t\t\t';
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = obj.item[Symbol.for('childNotes')][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var childItem = _step.value;

        __p += '\n\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t' + ((__t = childItem.data.note) == null ? '' : __t) + '\n\t\t\t\t\t\t</li>\n\t\t\t\t\t';
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    __p += '\n\t\t\t\t</ul>\n\t\t\t';
  }
  __p += '\n\n\t\t\t';
  if (obj.item[Symbol.for('childAttachments')] && obj.item[Symbol.for('childAttachments')].length) {
    __p += '\n\t\t\t\t<h3>Attachments</h3>\n\t\t\t\t<ul class="zotero-attachments">\n\t\t\t\t\t';
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = obj.item[Symbol.for('childAttachments')][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var childItem = _step2.value;

        __p += '\n\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t<a href="#">\n\t\t\t\t\t\t\t\t<span class="zotero-icon zotero-icon-paperclip"></span><!--\n\t\t\t\t\t\t\t\t-->' + ((__t = childItem.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t';
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    __p += '\n\t\t\t\t</ul>\n\t\t\t';
  }
  __p += '\n\t\t\t';
  if (obj.renderer.zotero.userId) {
    __p += '\n\t\t\t\t<div>\n\t\t\t\t\t<button class="zotero-cite-button" data-trigger="cite">\n\t\t\t\t\t\tCite\n\t\t\t\t\t</button>\n\t\t\t\t</div>\n\t\t\t\t<div class="zotero-cite-container">\n\t\t\t\t\t<select data-trigger="cite-style-selection">\n\t\t\t\t\t\t<option value="american-anthropological-association">\n\t\t\t\t\t\t\tAmerican Anthropological Association\n\t\t\t\t\t\t</option>\n\t\t\t\t\t\t<option value="cell">\n\t\t\t\t\t\t\tCell\n\t\t\t\t\t\t</option>\n\t\t\t\t\t\t<option value="chicago-author-date">\n\t\t\t\t\t\t\tChicago Manual of Style 16th edition (author-date)\n\t\t\t\t\t\t</option>\n\t\t\t\t\t\t<option value="elsevier-harvard">\n\t\t\t\t\t\t\tElsevier Harvard (with titles)\n\t\t\t\t\t\t</option>\n\t\t\t\t\t\t<option value="ieee">\n\t\t\t\t\t\t\tIEEE\n\t\t\t\t\t\t</option>\n\t\t\t\t\t\t<option value="modern-humanities-research-association-author-date">\n\t\t\t\t\t\t\tModern Humanities Research Association 3rd edition (author-date)\n\t\t\t\t\t\t</option>\n\t\t\t\t\t\t<option value="modern-language-association">\n\t\t\t\t\t\t\tModern Language Association 7th edition\n\t\t\t\t\t\t</option>\n\t\t\t\t\t\t<option value="nature">\n\t\t\t\t\t\t\tNature\n\t\t\t\t\t\t</option>\n\t\t\t\t\t\t<option value="vancouver">\n\t\t\t\t\t\t\tVancouver\n\t\t\t\t\t\t</option>\n\t\t\t\t\t</select>\n\t\t\t\t\t<textarea class="zotero-citation" cols="30" rows="5">\n\t\t\t\t\t\t' + ((__t = obj.item.citation) == null ? '' : __t) + '\n\t\t\t\t\t</textarea>\n\t\t\t\t</div>\n\t\t\t';
  }
  __p += '\n\t\t</div>\n\t</div>\n</li>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/items.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<ul class="zotero-items">\n\t';
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = obj.items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      __p += '\n\t\t' + ((__t = obj.renderer.renderItem(item)) == null ? '' : __t) + '\n\t';
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  __p += '\n</ul>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/plain-view.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<div class="zotero-publications">\n\t' + ((__t = obj.renderer.renderItems(items)) == null ? '' : __t) + '\n\t' + ((__t = obj.renderer.renderBranding()) == null ? '' : __t) + '\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/utils.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.formatDate = formatDate;
exports.formatCategoryName = formatCategoryName;
exports.closest = closest;
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Parse iso date and format it in a simple way
 * @param  {String} isoDate - date in iso format
 * @return {String}         - formatted date
 */
function formatDate(isoDate) {
	var matches = isoDate.match(/(\d{4})\-?(\d{2})?-?(\d{2})?/);
	var date = isoDate;

	if (matches.length >= 4) {
		var year = matches[1];
		var month = months[parseInt(matches[2], 10) - 1];
		var day = parseInt(matches[3], 10);
		date = month + ' ' + day + ', ' + year;
	}
	if (matches.length >= 3) {
		var year = matches[1];
		var month = months[parseInt(matches[2], 10) - 1];
		date = month + ' ' + year;
	}
	if (matches.length >= 2) {
		date = matches[1];
	}

	return date;
}

/**
 * Formats category name
 * @param  {String} name 	- unformatted name
 * @return {String}      	- formatted name
 */
function formatCategoryName(name) {
	name = name.replace(/(?! )[A-Z]/g, ' $&');
	return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Finds the first element that pasess function test by
 * testing the element itself and traversing up
 * @param  {HTMLElement}   el 	- A DOM element from which tracersing begins
 * @param  {Function} fn 		- Function that tests if element is suitable
 * @return {HTMLElement}		- First element that passes the test
 */
function closest(el, fn) {
	return el && (fn(el) ? el : closest(el.parentNode, fn));
}

},{}]},{},["/srv/zotero/my-publications/src/js/main-compat.js"])("/srv/zotero/my-publications/src/js/main-compat.js")
});