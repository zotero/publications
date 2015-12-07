(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ZoteroPublications = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/srv/zotero/my-publications/node_modules/core-js/es6/promise.js":[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$.core').Promise;
},{"../modules/$.core":"/srv/zotero/my-publications/node_modules/core-js/modules/$.core.js","../modules/es6.object.to-string":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.object.to-string.js","../modules/es6.promise":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.promise.js","../modules/es6.string.iterator":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.string.iterator.js","../modules/web.dom.iterable":"/srv/zotero/my-publications/node_modules/core-js/modules/web.dom.iterable.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.a-function.js":[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.add-to-unscopables.js":[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./$.wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./$.hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./$.hide":"/srv/zotero/my-publications/node_modules/core-js/modules/$.hide.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.an-object.js":[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.is-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.classof.js":[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , TAG = require('./$.wks')('toStringTag')
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
},{"./$.cof":"/srv/zotero/my-publications/node_modules/core-js/modules/$.cof.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.cof.js":[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.core.js":[function(require,module,exports){
var core = module.exports = {version: '1.2.6'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.ctx.js":[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./$.a-function');
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
},{"./$.a-function":"/srv/zotero/my-publications/node_modules/core-js/modules/$.a-function.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.defined.js":[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.descriptors.js":[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./$.fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./$.fails":"/srv/zotero/my-publications/node_modules/core-js/modules/$.fails.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.dom-create.js":[function(require,module,exports){
var isObject = require('./$.is-object')
  , document = require('./$.global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.is-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.export.js":[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , hide      = require('./$.hide')
  , redefine  = require('./$.redefine')
  , ctx       = require('./$.ctx')
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
    own = !IS_FORCED && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own)redefine(target, key, out);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;  // forced
$export.G = 2;  // global
$export.S = 4;  // static
$export.P = 8;  // proto
$export.B = 16; // bind
$export.W = 32; // wrap
module.exports = $export;
},{"./$.core":"/srv/zotero/my-publications/node_modules/core-js/modules/$.core.js","./$.ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/$.ctx.js","./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.hide":"/srv/zotero/my-publications/node_modules/core-js/modules/$.hide.js","./$.redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/$.redefine.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.fails.js":[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.for-of.js":[function(require,module,exports){
var ctx         = require('./$.ctx')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , anObject    = require('./$.an-object')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that){
  var iterFn = getIterFn(iterable)
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
},{"./$.an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.an-object.js","./$.ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/$.ctx.js","./$.is-array-iter":"/srv/zotero/my-publications/node_modules/core-js/modules/$.is-array-iter.js","./$.iter-call":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-call.js","./$.to-length":"/srv/zotero/my-publications/node_modules/core-js/modules/$.to-length.js","./core.get-iterator-method":"/srv/zotero/my-publications/node_modules/core-js/modules/core.get-iterator-method.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js":[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.has.js":[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.hide.js":[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.descriptors') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":"/srv/zotero/my-publications/node_modules/core-js/modules/$.js","./$.descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/$.descriptors.js","./$.property-desc":"/srv/zotero/my-publications/node_modules/core-js/modules/$.property-desc.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.html.js":[function(require,module,exports){
module.exports = require('./$.global').document && document.documentElement;
},{"./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.invoke.js":[function(require,module,exports){
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
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.iobject.js":[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./$.cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":"/srv/zotero/my-publications/node_modules/core-js/modules/$.cof.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.is-array-iter.js":[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./$.iterators')
  , ITERATOR   = require('./$.wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./$.iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iterators.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.is-object.js":[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-call.js":[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./$.an-object');
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
},{"./$.an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.an-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-create.js":[function(require,module,exports){
'use strict';
var $              = require('./$')
  , descriptor     = require('./$.property-desc')
  , setToStringTag = require('./$.set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./$.hide')(IteratorPrototype, require('./$.wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./$":"/srv/zotero/my-publications/node_modules/core-js/modules/$.js","./$.hide":"/srv/zotero/my-publications/node_modules/core-js/modules/$.hide.js","./$.property-desc":"/srv/zotero/my-publications/node_modules/core-js/modules/$.property-desc.js","./$.set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/$.set-to-string-tag.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-define.js":[function(require,module,exports){
'use strict';
var LIBRARY        = require('./$.library')
  , $export        = require('./$.export')
  , redefine       = require('./$.redefine')
  , hide           = require('./$.hide')
  , has            = require('./$.has')
  , Iterators      = require('./$.iterators')
  , $iterCreate    = require('./$.iter-create')
  , setToStringTag = require('./$.set-to-string-tag')
  , getProto       = require('./$').getProto
  , ITERATOR       = require('./$.wks')('iterator')
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
    , methods, key;
  // Fix native
  if($native){
    var IteratorPrototype = getProto($default.call(new Base));
    // Set @@toStringTag to native iterators
    setToStringTag(IteratorPrototype, TAG, true);
    // FF fix
    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    // fix Array#{values, @@iterator}.name in V8 / FF
    if(DEF_VALUES && $native.name !== VALUES){
      VALUES_BUG = true;
      $default = function values(){ return $native.call(this); };
    }
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
      values:  DEF_VALUES  ? $default : getMethod(VALUES),
      keys:    IS_SET      ? $default : getMethod(KEYS),
      entries: !DEF_VALUES ? $default : getMethod('entries')
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./$":"/srv/zotero/my-publications/node_modules/core-js/modules/$.js","./$.export":"/srv/zotero/my-publications/node_modules/core-js/modules/$.export.js","./$.has":"/srv/zotero/my-publications/node_modules/core-js/modules/$.has.js","./$.hide":"/srv/zotero/my-publications/node_modules/core-js/modules/$.hide.js","./$.iter-create":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-create.js","./$.iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iterators.js","./$.library":"/srv/zotero/my-publications/node_modules/core-js/modules/$.library.js","./$.redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/$.redefine.js","./$.set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/$.set-to-string-tag.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-detect.js":[function(require,module,exports){
var ITERATOR     = require('./$.wks')('iterator')
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
},{"./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-step.js":[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.iterators.js":[function(require,module,exports){
module.exports = {};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.js":[function(require,module,exports){
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
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.library.js":[function(require,module,exports){
module.exports = false;
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.microtask.js":[function(require,module,exports){
var global    = require('./$.global')
  , macrotask = require('./$.task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./$.cof')(process) == 'process'
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
},{"./$.cof":"/srv/zotero/my-publications/node_modules/core-js/modules/$.cof.js","./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.task":"/srv/zotero/my-publications/node_modules/core-js/modules/$.task.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.property-desc.js":[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.redefine-all.js":[function(require,module,exports){
var redefine = require('./$.redefine');
module.exports = function(target, src){
  for(var key in src)redefine(target, key, src[key]);
  return target;
};
},{"./$.redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/$.redefine.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.redefine.js":[function(require,module,exports){
// add fake Function#toString
// for correct work wrapped methods / constructors with methods like LoDash isNative
var global    = require('./$.global')
  , hide      = require('./$.hide')
  , SRC       = require('./$.uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./$.core').inspectSource = function(it){
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
    if(!safe)delete O[key];
    hide(O, key, val);
  }
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./$.core":"/srv/zotero/my-publications/node_modules/core-js/modules/$.core.js","./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.hide":"/srv/zotero/my-publications/node_modules/core-js/modules/$.hide.js","./$.uid":"/srv/zotero/my-publications/node_modules/core-js/modules/$.uid.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.same-value.js":[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.set-proto.js":[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./$').getDesc
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
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
},{"./$":"/srv/zotero/my-publications/node_modules/core-js/modules/$.js","./$.an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.an-object.js","./$.ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/$.ctx.js","./$.is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.is-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.set-species.js":[function(require,module,exports){
'use strict';
var global      = require('./$.global')
  , $           = require('./$')
  , DESCRIPTORS = require('./$.descriptors')
  , SPECIES     = require('./$.wks')('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./$":"/srv/zotero/my-publications/node_modules/core-js/modules/$.js","./$.descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/$.descriptors.js","./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.set-to-string-tag.js":[function(require,module,exports){
var def = require('./$').setDesc
  , has = require('./$.has')
  , TAG = require('./$.wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./$":"/srv/zotero/my-publications/node_modules/core-js/modules/$.js","./$.has":"/srv/zotero/my-publications/node_modules/core-js/modules/$.has.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.shared.js":[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.species-constructor.js":[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./$.an-object')
  , aFunction = require('./$.a-function')
  , SPECIES   = require('./$.wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./$.a-function":"/srv/zotero/my-publications/node_modules/core-js/modules/$.a-function.js","./$.an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.an-object.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.strict-new.js":[function(require,module,exports){
module.exports = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.string-at.js":[function(require,module,exports){
var toInteger = require('./$.to-integer')
  , defined   = require('./$.defined');
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
},{"./$.defined":"/srv/zotero/my-publications/node_modules/core-js/modules/$.defined.js","./$.to-integer":"/srv/zotero/my-publications/node_modules/core-js/modules/$.to-integer.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.task.js":[function(require,module,exports){
var ctx                = require('./$.ctx')
  , invoke             = require('./$.invoke')
  , html               = require('./$.html')
  , cel                = require('./$.dom-create')
  , global             = require('./$.global')
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
  if(require('./$.cof')(process) == 'process'){
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
},{"./$.cof":"/srv/zotero/my-publications/node_modules/core-js/modules/$.cof.js","./$.ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/$.ctx.js","./$.dom-create":"/srv/zotero/my-publications/node_modules/core-js/modules/$.dom-create.js","./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.html":"/srv/zotero/my-publications/node_modules/core-js/modules/$.html.js","./$.invoke":"/srv/zotero/my-publications/node_modules/core-js/modules/$.invoke.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.to-integer.js":[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.to-iobject.js":[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./$.iobject')
  , defined = require('./$.defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./$.defined":"/srv/zotero/my-publications/node_modules/core-js/modules/$.defined.js","./$.iobject":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iobject.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.to-length.js":[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./$.to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./$.to-integer":"/srv/zotero/my-publications/node_modules/core-js/modules/$.to-integer.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.uid.js":[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js":[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , uid    = require('./$.uid')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
};
},{"./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.shared":"/srv/zotero/my-publications/node_modules/core-js/modules/$.shared.js","./$.uid":"/srv/zotero/my-publications/node_modules/core-js/modules/$.uid.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/core.get-iterator-method.js":[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./$.classof":"/srv/zotero/my-publications/node_modules/core-js/modules/$.classof.js","./$.core":"/srv/zotero/my-publications/node_modules/core-js/modules/$.core.js","./$.iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iterators.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.array.iterator.js":[function(require,module,exports){
'use strict';
var addToUnscopables = require('./$.add-to-unscopables')
  , step             = require('./$.iter-step')
  , Iterators        = require('./$.iterators')
  , toIObject        = require('./$.to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./$.iter-define')(Array, 'Array', function(iterated, kind){
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
},{"./$.add-to-unscopables":"/srv/zotero/my-publications/node_modules/core-js/modules/$.add-to-unscopables.js","./$.iter-define":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-define.js","./$.iter-step":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-step.js","./$.iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iterators.js","./$.to-iobject":"/srv/zotero/my-publications/node_modules/core-js/modules/$.to-iobject.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.object.to-string.js":[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./$.classof')
  , test    = {};
test[require('./$.wks')('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  require('./$.redefine')(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"./$.classof":"/srv/zotero/my-publications/node_modules/core-js/modules/$.classof.js","./$.redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/$.redefine.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.promise.js":[function(require,module,exports){
'use strict';
var $          = require('./$')
  , LIBRARY    = require('./$.library')
  , global     = require('./$.global')
  , ctx        = require('./$.ctx')
  , classof    = require('./$.classof')
  , $export    = require('./$.export')
  , isObject   = require('./$.is-object')
  , anObject   = require('./$.an-object')
  , aFunction  = require('./$.a-function')
  , strictNew  = require('./$.strict-new')
  , forOf      = require('./$.for-of')
  , setProto   = require('./$.set-proto').set
  , same       = require('./$.same-value')
  , SPECIES    = require('./$.wks')('species')
  , speciesConstructor = require('./$.species-constructor')
  , asap       = require('./$.microtask')
  , PROMISE    = 'Promise'
  , process    = global.process
  , isNode     = classof(process) == 'process'
  , P          = global[PROMISE]
  , Wrapper;

var testResolve = function(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
};

var USE_NATIVE = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = P && P.resolve && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./$.descriptors')){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
var sameConstructor = function(a, b){
  // library wrapper special case
  if(LIBRARY && a === P && b === Wrapper)return true;
  return same(a, b);
};
var getConstructor = function(C){
  var S = anObject(C)[SPECIES];
  return S != undefined ? S : C;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var PromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve),
  this.reject  = aFunction(reject)
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(record, isReject){
  if(record.n)return;
  record.n = true;
  var chain = record.c;
  asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , result, then;
      try {
        if(handler){
          if(!ok)record.h = true;
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
    chain.length = 0;
    record.n = false;
    if(isReject)setTimeout(function(){
      var promise = record.p
        , handler, console;
      if(isUnhandled(promise)){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      } record.a = undefined;
    }, 1);
  });
};
var isUnhandled = function(promise){
  var record = promise._d
    , chain  = record.a || record.c
    , i      = 0
    , reaction;
  if(record.h)return false;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var $reject = function(value){
  var record = this;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  notify(record, true);
};
var $resolve = function(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(record.p === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      asap(function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record, false);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    aFunction(executor);
    var record = this._d = {
      p: strictNew(this, P, PROMISE),         // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false,                               // <- handled rejection
      n: false                                // <- notify
    };
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.redefine-all')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction = new PromiseCapability(speciesConstructor(this, P))
        , promise  = reaction.promise
        , record   = this._d;
      reaction.ok   = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      record.c.push(reaction);
      if(record.a)record.a.push(reaction);
      if(record.s)notify(record, false);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: P});
require('./$.set-to-string-tag')(P, PROMISE);
require('./$.set-species')(PROMISE);
Wrapper = require('./$.core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = new PromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof P && sameConstructor(x.constructor, this))return x;
    var capability = new PromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = getConstructor(this)
      , capability = new PromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject
      , values     = [];
    var abrupt = perform(function(){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
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
    var C          = getConstructor(this)
      , capability = new PromiseCapability(C)
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
},{"./$":"/srv/zotero/my-publications/node_modules/core-js/modules/$.js","./$.a-function":"/srv/zotero/my-publications/node_modules/core-js/modules/$.a-function.js","./$.an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.an-object.js","./$.classof":"/srv/zotero/my-publications/node_modules/core-js/modules/$.classof.js","./$.core":"/srv/zotero/my-publications/node_modules/core-js/modules/$.core.js","./$.ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/$.ctx.js","./$.descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/$.descriptors.js","./$.export":"/srv/zotero/my-publications/node_modules/core-js/modules/$.export.js","./$.for-of":"/srv/zotero/my-publications/node_modules/core-js/modules/$.for-of.js","./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/$.is-object.js","./$.iter-detect":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-detect.js","./$.library":"/srv/zotero/my-publications/node_modules/core-js/modules/$.library.js","./$.microtask":"/srv/zotero/my-publications/node_modules/core-js/modules/$.microtask.js","./$.redefine-all":"/srv/zotero/my-publications/node_modules/core-js/modules/$.redefine-all.js","./$.same-value":"/srv/zotero/my-publications/node_modules/core-js/modules/$.same-value.js","./$.set-proto":"/srv/zotero/my-publications/node_modules/core-js/modules/$.set-proto.js","./$.set-species":"/srv/zotero/my-publications/node_modules/core-js/modules/$.set-species.js","./$.set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/$.set-to-string-tag.js","./$.species-constructor":"/srv/zotero/my-publications/node_modules/core-js/modules/$.species-constructor.js","./$.strict-new":"/srv/zotero/my-publications/node_modules/core-js/modules/$.strict-new.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.string.iterator.js":[function(require,module,exports){
'use strict';
var $at  = require('./$.string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
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
},{"./$.iter-define":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iter-define.js","./$.string-at":"/srv/zotero/my-publications/node_modules/core-js/modules/$.string-at.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/web.dom.iterable.js":[function(require,module,exports){
require('./es6.array.iterator');
var global      = require('./$.global')
  , hide        = require('./$.hide')
  , Iterators   = require('./$.iterators')
  , ITERATOR    = require('./$.wks')('iterator')
  , NL          = global.NodeList
  , HTC         = global.HTMLCollection
  , NLProto     = NL && NL.prototype
  , HTCProto    = HTC && HTC.prototype
  , ArrayValues = Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
if(NLProto && !NLProto[ITERATOR])hide(NLProto, ITERATOR, ArrayValues);
if(HTCProto && !HTCProto[ITERATOR])hide(HTCProto, ITERATOR, ArrayValues);
},{"./$.global":"/srv/zotero/my-publications/node_modules/core-js/modules/$.global.js","./$.hide":"/srv/zotero/my-publications/node_modules/core-js/modules/$.hide.js","./$.iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/$.iterators.js","./$.wks":"/srv/zotero/my-publications/node_modules/core-js/modules/$.wks.js","./es6.array.iterator":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.array.iterator.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js":[function(require,module,exports){
'use strict';

if (!require('./is-implemented')()) {
	Object.defineProperty(require('es5-ext/global'), 'Symbol',
		{ value: require('./polyfill'), configurable: true, enumerable: false,
			writable: true });
}

},{"./is-implemented":"/srv/zotero/my-publications/node_modules/es6-symbol/is-implemented.js","./polyfill":"/srv/zotero/my-publications/node_modules/es6-symbol/polyfill.js","es5-ext/global":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/global.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/is-implemented.js":[function(require,module,exports){
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

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/d/index.js":[function(require,module,exports){
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

},{"es5-ext/object/assign":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/assign/index.js","es5-ext/object/is-callable":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/is-callable.js","es5-ext/object/normalize-options":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/normalize-options.js","es5-ext/string/#/contains":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/string/#/contains/index.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/global.js":[function(require,module,exports){
'use strict';

module.exports = new Function("return this")();

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/assign/index.js":[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/assign/is-implemented.js","./shim":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/assign/shim.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/assign/is-implemented.js":[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/assign/shim.js":[function(require,module,exports){
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

},{"../keys":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/keys/index.js","../valid-value":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/valid-value.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/is-callable.js":[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/keys/index.js":[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/keys/is-implemented.js","./shim":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/keys/shim.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/keys/is-implemented.js":[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/keys/shim.js":[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/normalize-options.js":[function(require,module,exports){
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

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/object/valid-value.js":[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/string/#/contains/index.js":[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/string/#/contains/is-implemented.js","./shim":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/string/#/contains/shim.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/string/#/contains/is-implemented.js":[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/es5-ext/string/#/contains/shim.js":[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],"/srv/zotero/my-publications/node_modules/es6-symbol/polyfill.js":[function(require,module,exports){
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

HiddenSymbol = function Symbol(description) {
	if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
	return SymbolPolyfill(description);
};
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
defineProperties(HiddenSymbol.prototype, {
	constructor: d(SymbolPolyfill),
	toString: d('', function () { return this.__name__; })
});

defineProperties(SymbolPolyfill.prototype, {
	toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
	valueOf: d(function () { return validateSymbol(this); })
});
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('',
	function () { return validateSymbol(this); }));
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
	d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));
defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
	d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

},{"./validate-symbol":"/srv/zotero/my-publications/node_modules/es6-symbol/validate-symbol.js","d":"/srv/zotero/my-publications/node_modules/es6-symbol/node_modules/d/index.js"}],"/srv/zotero/my-publications/node_modules/es6-symbol/validate-symbol.js":[function(require,module,exports){
'use strict';

var isSymbol = require('./is-symbol');

module.exports = function (value) {
	if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
	return value;
};

},{"./is-symbol":"/srv/zotero/my-publications/node_modules/es6-symbol/is-symbol.js"}],"/srv/zotero/my-publications/node_modules/whatwg-fetch/fetch.js":[function(require,module,exports){
(function() {
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

    this._initBody(bodyInit)
    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
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
})();

},{}],"/srv/zotero/my-publications/src/js/api.js":[function(require,module,exports){
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

require('es6-symbol/implement');
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
},{"./data.js":"/srv/zotero/my-publications/src/js/data.js","es6-symbol/implement":"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js"}],"/srv/zotero/my-publications/src/js/data.js":[function(require,module,exports){
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

require('es6-symbol/implement');
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
},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","es6-symbol/implement":"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js"}],"/srv/zotero/my-publications/src/js/main-compat.js":[function(require,module,exports){
// require('core-js/es5');

// doesn't seem to work very well in IE
// require('es6-promise').polyfill();
'use strict';

var _mainJs = require('./main.js');

require('core-js/es6/promise');
require('whatwg-fetch');

module.exports = _mainJs.ZoteroPublications;

},{"./main.js":"/srv/zotero/my-publications/src/js/main.js","core-js/es6/promise":"/srv/zotero/my-publications/node_modules/core-js/es6/promise.js","whatwg-fetch":"/srv/zotero/my-publications/node_modules/whatwg-fetch/fetch.js"}],"/srv/zotero/my-publications/src/js/main.js":[function(require,module,exports){
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

},{}]},{},["/srv/zotero/my-publications/src/js/main-compat.js"])("/srv/zotero/my-publications/src/js/main-compat.js")
});