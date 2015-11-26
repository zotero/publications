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
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.0.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);

!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n;n="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,n.ZoteroPublications=t()}}(function(){var define;return function t(n,r,e){function o(i,a){if(!r[i]){if(!n[i]){var c="function"==typeof require&&require;if(!a&&c)return c(i,!0);if(u)return u(i,!0);var l=new Error("Cannot find module '"+i+"'");throw l.code="MODULE_NOT_FOUND",l}var f=r[i]={exports:{}};n[i][0].call(f.exports,function(t){var r=n[i][1][t];return o(r?r:t)},f,f.exports,t,n,r,e)}return r[i].exports}for(var u="function"==typeof require&&require,i=0;i<e.length;i++)o(e[i]);return o}({"/srv/zotero/my-publications/node_modules/lodash/index.js":[function(t,n,r){(function(t){(function(){function e(t,n){if(t!==n){var r=null===t,e=t===z,o=t===t,u=null===n,i=n===z,a=n===n;if(t>n&&!u||!o||r&&!i&&a||e&&a)return 1;if(n>t&&!r||!a||u&&!e&&o||i&&o)return-1}return 0}function o(t,n,r){for(var e=t.length,o=r?e:-1;r?o--:++o<e;)if(n(t[o],o,t))return o;return-1}function u(t,n,r){if(n!==n)return d(t,r);for(var e=r-1,o=t.length;++e<o;)if(t[e]===n)return e;return-1}function i(t){return"function"==typeof t||!1}function a(t){return null==t?"":t+""}function c(t,n){for(var r=-1,e=t.length;++r<e&&n.indexOf(t.charAt(r))>-1;);return r}function l(t,n){for(var r=t.length;r--&&n.indexOf(t.charAt(r))>-1;);return r}function f(t,n){return e(t.criteria,n.criteria)||t.index-n.index}function s(t,n,r){for(var o=-1,u=t.criteria,i=n.criteria,a=u.length,c=r.length;++o<a;){var l=e(u[o],i[o]);if(l){if(o>=c)return l;var f=r[o];return l*("asc"===f||f===!0?1:-1)}}return t.index-n.index}function p(t){return Ft[t]}function h(t){return Yt[t]}function _(t,n,r){return n?t=Zt[t]:r&&(t=Kt[t]),"\\"+t}function v(t){return"\\"+Kt[t]}function d(t,n,r){for(var e=t.length,o=n+(r?0:-1);r?o--:++o<e;){var u=t[o];if(u!==u)return o}return-1}function g(t){return!!t&&"object"==typeof t}function y(t){return 160>=t&&t>=9&&13>=t||32==t||160==t||5760==t||6158==t||t>=8192&&(8202>=t||8232==t||8233==t||8239==t||8287==t||12288==t||65279==t)}function m(t,n){for(var r=-1,e=t.length,o=-1,u=[];++r<e;)t[r]===n&&(t[r]=F,u[++o]=r);return u}function b(t,n){for(var r,e=-1,o=t.length,u=-1,i=[];++e<o;){var a=t[e],c=n?n(a,e,t):a;e&&r===c||(r=c,i[++u]=a)}return i}function w(t){for(var n=-1,r=t.length;++n<r&&y(t.charCodeAt(n)););return n}function x(t){for(var n=t.length;n--&&y(t.charCodeAt(n)););return n}function j(t){return Ht[t]}function A(t){function n(t){if(g(t)&&!Ea(t)&&!(t instanceof X)){if(t instanceof y)return t;if(ni.call(t,"__chain__")&&ni.call(t,"__wrapped__"))return he(t)}return new y(t)}function r(){}function y(t,n,r){this.__wrapped__=t,this.__actions__=r||[],this.__chain__=!!n}function X(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=ki,this.__views__=[]}function nt(){var t=new X(this.__wrapped__);return t.__actions__=tn(this.__actions__),t.__dir__=this.__dir__,t.__filtered__=this.__filtered__,t.__iteratees__=tn(this.__iteratees__),t.__takeCount__=this.__takeCount__,t.__views__=tn(this.__views__),t}function et(){if(this.__filtered__){var t=new X(this);t.__dir__=-1,t.__filtered__=!0}else t=this.clone(),t.__dir__*=-1;return t}function Ft(){var t=this.__wrapped__.value(),n=this.__dir__,r=Ea(t),e=0>n,o=r?t.length:0,u=Hr(0,o,this.__views__),i=u.start,a=u.end,c=a-i,l=e?a:i-1,f=this.__iteratees__,s=f.length,p=0,h=ji(c,this.__takeCount__);if(!r||D>o||o==c&&h==c)return er(e&&r?t.reverse():t,this.__actions__);var _=[];t:for(;c--&&h>p;){l+=n;for(var v=-1,d=t[l];++v<s;){var g=f[v],y=g.iteratee,m=g.type,b=y(d);if(m==$)d=b;else if(!b){if(m==P)continue t;break t}}_[p++]=d}return _}function Yt(){this.__data__={}}function Ht(t){return this.has(t)&&delete this.__data__[t]}function Gt(t){return"__proto__"==t?z:this.__data__[t]}function Zt(t){return"__proto__"!=t&&ni.call(this.__data__,t)}function Kt(t,n){return"__proto__"!=t&&(this.__data__[t]=n),this}function Vt(t){var n=t?t.length:0;for(this.data={hash:gi(null),set:new si};n--;)this.push(t[n])}function Xt(t,n){var r=t.data,e="string"==typeof n||No(n)?r.set.has(n):r.hash[n];return e?0:-1}function Jt(t){var n=this.data;"string"==typeof t||No(t)?n.set.add(t):n.hash[t]=!0}function Qt(t,n){for(var r=-1,e=t.length,o=-1,u=n.length,i=Pu(e+u);++r<e;)i[r]=t[r];for(;++o<u;)i[r++]=n[o];return i}function tn(t,n){var r=-1,e=t.length;for(n||(n=Pu(e));++r<e;)n[r]=t[r];return n}function nn(t,n){for(var r=-1,e=t.length;++r<e&&n(t[r],r,t)!==!1;);return t}function on(t,n){for(var r=t.length;r--&&n(t[r],r,t)!==!1;);return t}function un(t,n){for(var r=-1,e=t.length;++r<e;)if(!n(t[r],r,t))return!1;return!0}function an(t,n,r,e){for(var o=-1,u=t.length,i=e,a=i;++o<u;){var c=t[o],l=+n(c);r(l,i)&&(i=l,a=c)}return a}function cn(t,n){for(var r=-1,e=t.length,o=-1,u=[];++r<e;){var i=t[r];n(i,r,t)&&(u[++o]=i)}return u}function ln(t,n){for(var r=-1,e=t.length,o=Pu(e);++r<e;)o[r]=n(t[r],r,t);return o}function fn(t,n){for(var r=-1,e=n.length,o=t.length;++r<e;)t[o+r]=n[r];return t}function sn(t,n,r,e){var o=-1,u=t.length;for(e&&u&&(r=t[++o]);++o<u;)r=n(r,t[o],o,t);return r}function pn(t,n,r,e){var o=t.length;for(e&&o&&(r=t[--o]);o--;)r=n(r,t[o],o,t);return r}function hn(t,n){for(var r=-1,e=t.length;++r<e;)if(n(t[r],r,t))return!0;return!1}function _n(t,n){for(var r=t.length,e=0;r--;)e+=+n(t[r])||0;return e}function vn(t,n){return t===z?n:t}function dn(t,n,r,e){return t!==z&&ni.call(e,r)?t:n}function gn(t,n,r){for(var e=-1,o=Da(n),u=o.length;++e<u;){var i=o[e],a=t[i],c=r(a,n[i],i,t,n);(c===c?c===a:a!==a)&&(a!==z||i in t)||(t[i]=c)}return t}function yn(t,n){return null==n?t:bn(n,Da(n),t)}function mn(t,n){for(var r=-1,e=null==t,o=!e&&Xr(t),u=o?t.length:0,i=n.length,a=Pu(i);++r<i;){var c=n[r];o?a[r]=Jr(c,u)?t[c]:z:a[r]=e?z:t[c]}return a}function bn(t,n,r){r||(r={});for(var e=-1,o=n.length;++e<o;){var u=n[e];r[u]=t[u]}return r}function wn(t,n,r){var e=typeof t;return"function"==e?n===z?t:ir(t,n,r):null==t?ku:"object"==e?Dn(t):n===z?Lu(t):Pn(t,n)}function xn(t,n,r,e,o,u,i){var a;if(r&&(a=o?r(t,e,o):r(t)),a!==z)return a;if(!No(t))return t;var c=Ea(t);if(c){if(a=Gr(t),!n)return tn(t,a)}else{var l=ei.call(t),f=l==V;if(l!=Q&&l!=Y&&(!f||o))return Wt[l]?Kr(t,l,n):o?t:{};if(a=Zr(f?{}:t),!n)return yn(a,t)}u||(u=[]),i||(i=[]);for(var s=u.length;s--;)if(u[s]==t)return i[s];return u.push(t),i.push(a),(c?nn:Mn)(t,function(e,o){a[o]=xn(e,n,r,o,t,u,i)}),a}function jn(t,n,r){if("function"!=typeof t)throw new Vu(W);return pi(function(){t.apply(z,r)},n)}function An(t,n){var r=t?t.length:0,e=[];if(!r)return e;var o=-1,i=Wr(),a=i==u,c=a&&n.length>=D?vr(n):null,l=n.length;c&&(i=Xt,a=!1,n=c);t:for(;++o<r;){var f=t[o];if(a&&f===f){for(var s=l;s--;)if(n[s]===f)continue t;e.push(f)}else i(n,f,0)<0&&e.push(f)}return e}function zn(t,n){var r=!0;return Ti(t,function(t,e,o){return r=!!n(t,e,o)}),r}function In(t,n,r,e){var o=e,u=o;return Ti(t,function(t,i,a){var c=+n(t,i,a);(r(c,o)||c===e&&c===u)&&(o=c,u=t)}),u}function On(t,n,r,e){var o=t.length;for(r=null==r?0:+r||0,0>r&&(r=-r>o?0:o+r),e=e===z||e>o?o:+e||0,0>e&&(e+=o),o=r>e?0:e>>>0,r>>>=0;o>r;)t[r++]=n;return t}function kn(t,n){var r=[];return Ti(t,function(t,e,o){n(t,e,o)&&r.push(t)}),r}function En(t,n,r,e){var o;return r(t,function(t,r,u){return n(t,r,u)?(o=e?r:t,!1):void 0}),o}function Sn(t,n,r,e){e||(e=[]);for(var o=-1,u=t.length;++o<u;){var i=t[o];g(i)&&Xr(i)&&(r||Ea(i)||Io(i))?n?Sn(i,n,r,e):fn(e,i):r||(e[e.length]=i)}return e}function Rn(t,n){return qi(t,n,nu)}function Mn(t,n){return qi(t,n,Da)}function Cn(t,n){return Bi(t,n,Da)}function Ln(t,n){for(var r=-1,e=n.length,o=-1,u=[];++r<e;){var i=n[r];Lo(t[i])&&(u[++o]=i)}return u}function Nn(t,n,r){if(null!=t){r!==z&&r in se(t)&&(n=[r]);for(var e=0,o=n.length;null!=t&&o>e;)t=t[n[e++]];return e&&e==o?t:z}}function Tn(t,n,r,e,o,u){return t===n?!0:null==t||null==n||!No(t)&&!g(n)?t!==t&&n!==n:Un(t,n,Tn,r,e,o,u)}function Un(t,n,r,e,o,u,i){var a=Ea(t),c=Ea(n),l=H,f=H;a||(l=ei.call(t),l==Y?l=Q:l!=Q&&(a=Fo(t))),c||(f=ei.call(n),f==Y?f=Q:f!=Q&&(c=Fo(n)));var s=l==Q,p=f==Q,h=l==f;if(h&&!a&&!s)return Br(t,n,l);if(!o){var _=s&&ni.call(t,"__wrapped__"),v=p&&ni.call(n,"__wrapped__");if(_||v)return r(_?t.value():t,v?n.value():n,e,o,u,i)}if(!h)return!1;u||(u=[]),i||(i=[]);for(var d=u.length;d--;)if(u[d]==t)return i[d]==n;u.push(t),i.push(n);var g=(a?qr:Dr)(t,n,r,e,o,u,i);return u.pop(),i.pop(),g}function qn(t,n,r){var e=n.length,o=e,u=!r;if(null==t)return!o;for(t=se(t);e--;){var i=n[e];if(u&&i[2]?i[1]!==t[i[0]]:!(i[0]in t))return!1}for(;++e<o;){i=n[e];var a=i[0],c=t[a],l=i[1];if(u&&i[2]){if(c===z&&!(a in t))return!1}else{var f=r?r(c,l,a):z;if(!(f===z?Tn(l,c,r,!0):f))return!1}}return!0}function Bn(t,n){var r=-1,e=Xr(t)?Pu(t.length):[];return Ti(t,function(t,o,u){e[++r]=n(t,o,u)}),e}function Dn(t){var n=Fr(t);if(1==n.length&&n[0][2]){var r=n[0][0],e=n[0][1];return function(t){return null==t?!1:t[r]===e&&(e!==z||r in se(t))}}return function(t){return qn(t,n)}}function Pn(t,n){var r=Ea(t),e=te(t)&&ee(n),o=t+"";return t=pe(t),function(u){if(null==u)return!1;var i=o;if(u=se(u),(r||!e)&&!(i in u)){if(u=1==t.length?u:Nn(u,Kn(t,0,-1)),null==u)return!1;i=Ie(t),u=se(u)}return u[i]===n?n!==z||i in u:Tn(n,u[i],z,!0)}}function $n(t,n,r,e,o){if(!No(t))return t;var u=Xr(n)&&(Ea(n)||Fo(n)),i=u?z:Da(n);return nn(i||n,function(a,c){if(i&&(c=a,a=n[c]),g(a))e||(e=[]),o||(o=[]),Wn(t,n,c,$n,r,e,o);else{var l=t[c],f=r?r(l,a,c,t,n):z,s=f===z;s&&(f=a),f===z&&(!u||c in t)||!s&&(f===f?f===l:l!==l)||(t[c]=f)}}),t}function Wn(t,n,r,e,o,u,i){for(var a=u.length,c=n[r];a--;)if(u[a]==c)return void(t[r]=i[a]);var l=t[r],f=o?o(l,c,r,t,n):z,s=f===z;s&&(f=c,Xr(c)&&(Ea(c)||Fo(c))?f=Ea(l)?l:Xr(l)?tn(l):[]:Po(c)||Io(c)?f=Io(l)?Ko(l):Po(l)?l:{}:s=!1),u.push(c),i.push(f),s?t[r]=e(f,c,o,u,i):(f===f?f!==l:l===l)&&(t[r]=f)}function Fn(t){return function(n){return null==n?z:n[t]}}function Yn(t){var n=t+"";return t=pe(t),function(r){return Nn(r,t,n)}}function Hn(t,n){for(var r=t?n.length:0;r--;){var e=n[r];if(e!=o&&Jr(e)){var o=e;hi.call(t,e,1)}}return t}function Gn(t,n){return t+yi(Ii()*(n-t+1))}function Zn(t,n,r,e,o){return o(t,function(t,o,u){r=e?(e=!1,t):n(r,t,o,u)}),r}function Kn(t,n,r){var e=-1,o=t.length;n=null==n?0:+n||0,0>n&&(n=-n>o?0:o+n),r=r===z||r>o?o:+r||0,0>r&&(r+=o),o=n>r?0:r-n>>>0,n>>>=0;for(var u=Pu(o);++e<o;)u[e]=t[e+n];return u}function Vn(t,n){var r;return Ti(t,function(t,e,o){return r=n(t,e,o),!r}),!!r}function Xn(t,n){var r=t.length;for(t.sort(n);r--;)t[r]=t[r].value;return t}function Jn(t,n,r){var e=Pr(),o=-1;n=ln(n,function(t){return e(t)});var u=Bn(t,function(t){var r=ln(n,function(n){return n(t)});return{criteria:r,index:++o,value:t}});return Xn(u,function(t,n){return s(t,n,r)})}function Qn(t,n){var r=0;return Ti(t,function(t,e,o){r+=+n(t,e,o)||0}),r}function tr(t,n){var r=-1,e=Wr(),o=t.length,i=e==u,a=i&&o>=D,c=a?vr():null,l=[];c?(e=Xt,i=!1):(a=!1,c=n?[]:l);t:for(;++r<o;){var f=t[r],s=n?n(f,r,t):f;if(i&&f===f){for(var p=c.length;p--;)if(c[p]===s)continue t;n&&c.push(s),l.push(f)}else e(c,s,0)<0&&((n||a)&&c.push(s),l.push(f))}return l}function nr(t,n){for(var r=-1,e=n.length,o=Pu(e);++r<e;)o[r]=t[n[r]];return o}function rr(t,n,r,e){for(var o=t.length,u=e?o:-1;(e?u--:++u<o)&&n(t[u],u,t););return r?Kn(t,e?0:u,e?u+1:o):Kn(t,e?u+1:0,e?o:u)}function er(t,n){var r=t;r instanceof X&&(r=r.value());for(var e=-1,o=n.length;++e<o;){var u=n[e];r=u.func.apply(u.thisArg,fn([r],u.args))}return r}function or(t,n,r){var e=0,o=t?t.length:e;if("number"==typeof n&&n===n&&Ri>=o){for(;o>e;){var u=e+o>>>1,i=t[u];(r?n>=i:n>i)&&null!==i?e=u+1:o=u}return o}return ur(t,n,ku,r)}function ur(t,n,r,e){n=r(n);for(var o=0,u=t?t.length:0,i=n!==n,a=null===n,c=n===z;u>o;){var l=yi((o+u)/2),f=r(t[l]),s=f!==z,p=f===f;if(i)var h=p||e;else h=a?p&&s&&(e||null!=f):c?p&&(e||s):null==f?!1:e?n>=f:n>f;h?o=l+1:u=l}return ji(u,Si)}function ir(t,n,r){if("function"!=typeof t)return ku;if(n===z)return t;switch(r){case 1:return function(r){return t.call(n,r)};case 3:return function(r,e,o){return t.call(n,r,e,o)};case 4:return function(r,e,o,u){return t.call(n,r,e,o,u)};case 5:return function(r,e,o,u,i){return t.call(n,r,e,o,u,i)}}return function(){return t.apply(n,arguments)}}function ar(t){var n=new ii(t.byteLength),r=new _i(n);return r.set(new _i(t)),n}function cr(t,n,r){for(var e=r.length,o=-1,u=xi(t.length-e,0),i=-1,a=n.length,c=Pu(a+u);++i<a;)c[i]=n[i];for(;++o<e;)c[r[o]]=t[o];for(;u--;)c[i++]=t[o++];return c}function lr(t,n,r){for(var e=-1,o=r.length,u=-1,i=xi(t.length-o,0),a=-1,c=n.length,l=Pu(i+c);++u<i;)l[u]=t[u];for(var f=u;++a<c;)l[f+a]=n[a];for(;++e<o;)l[f+r[e]]=t[u++];return l}function fr(t,n){return function(r,e,o){var u=n?n():{};if(e=Pr(e,o,3),Ea(r))for(var i=-1,a=r.length;++i<a;){var c=r[i];t(u,c,e(c,i,r),r)}else Ti(r,function(n,r,o){t(u,n,e(n,r,o),o)});return u}}function sr(t){return yo(function(n,r){var e=-1,o=null==n?0:r.length,u=o>2?r[o-2]:z,i=o>2?r[2]:z,a=o>1?r[o-1]:z;for("function"==typeof u?(u=ir(u,a,5),o-=2):(u="function"==typeof a?a:z,o-=u?1:0),i&&Qr(r[0],r[1],i)&&(u=3>o?z:u,o=1);++e<o;){var c=r[e];c&&t(n,c,u)}return n})}function pr(t,n){return function(r,e){var o=r?$i(r):0;if(!re(o))return t(r,e);for(var u=n?o:-1,i=se(r);(n?u--:++u<o)&&e(i[u],u,i)!==!1;);return r}}function hr(t){return function(n,r,e){for(var o=se(n),u=e(n),i=u.length,a=t?i:-1;t?a--:++a<i;){var c=u[a];if(r(o[c],c,o)===!1)break}return n}}function _r(t,n){function r(){var o=this&&this!==rn&&this instanceof r?e:t;return o.apply(n,arguments)}var e=gr(t);return r}function vr(t){return gi&&si?new Vt(t):null}function dr(t){return function(n){for(var r=-1,e=zu(su(n)),o=e.length,u="";++r<o;)u=t(u,e[r],r);return u}}function gr(t){return function(){var n=arguments;switch(n.length){case 0:return new t;case 1:return new t(n[0]);case 2:return new t(n[0],n[1]);case 3:return new t(n[0],n[1],n[2]);case 4:return new t(n[0],n[1],n[2],n[3]);case 5:return new t(n[0],n[1],n[2],n[3],n[4]);case 6:return new t(n[0],n[1],n[2],n[3],n[4],n[5]);case 7:return new t(n[0],n[1],n[2],n[3],n[4],n[5],n[6])}var r=Ni(t.prototype),e=t.apply(r,n);return No(e)?e:r}}function yr(t){function n(r,e,o){o&&Qr(r,e,o)&&(e=z);var u=Ur(r,t,z,z,z,z,z,e);return u.placeholder=n.placeholder,u}return n}function mr(t,n){return yo(function(r){var e=r[0];return null==e?e:(r.push(n),t.apply(z,r))})}function br(t,n){return function(r,e,o){if(o&&Qr(r,e,o)&&(e=z),e=Pr(e,o,3),1==e.length){r=Ea(r)?r:fe(r);var u=an(r,e,t,n);if(!r.length||u!==n)return u}return In(r,e,t,n)}}function wr(t,n){return function(r,e,u){if(e=Pr(e,u,3),Ea(r)){var i=o(r,e,n);return i>-1?r[i]:z}return En(r,e,t)}}function xr(t){return function(n,r,e){return n&&n.length?(r=Pr(r,e,3),o(n,r,t)):-1}}function jr(t){return function(n,r,e){return r=Pr(r,e,3),En(n,r,t,!0)}}function Ar(t){return function(){for(var n,r=arguments.length,e=t?r:-1,o=0,u=Pu(r);t?e--:++e<r;){var i=u[o++]=arguments[e];if("function"!=typeof i)throw new Vu(W);!n&&y.prototype.thru&&"wrapper"==$r(i)&&(n=new y([],!0))}for(e=n?-1:r;++e<r;){i=u[e];var a=$r(i),c="wrapper"==a?Pi(i):z;n=c&&ne(c[0])&&c[1]==(L|S|M|N)&&!c[4].length&&1==c[9]?n[$r(c[0])].apply(n,c[3]):1==i.length&&ne(i)?n[a]():n.thru(i)}return function(){var t=arguments,e=t[0];if(n&&1==t.length&&Ea(e)&&e.length>=D)return n.plant(e).value();for(var o=0,i=r?u[o].apply(this,t):e;++o<r;)i=u[o].call(this,i);return i}}}function zr(t,n){return function(r,e,o){return"function"==typeof e&&o===z&&Ea(r)?t(r,e):n(r,ir(e,o,3))}}function Ir(t){return function(n,r,e){return("function"!=typeof r||e!==z)&&(r=ir(r,e,3)),t(n,r,nu)}}function Or(t){return function(n,r,e){return("function"!=typeof r||e!==z)&&(r=ir(r,e,3)),t(n,r)}}function kr(t){return function(n,r,e){var o={};return r=Pr(r,e,3),Mn(n,function(n,e,u){var i=r(n,e,u);e=t?i:e,n=t?n:i,o[e]=n}),o}}function Er(t){return function(n,r,e){return n=a(n),(t?n:"")+Cr(n,r,e)+(t?"":n)}}function Sr(t){var n=yo(function(r,e){var o=m(e,n.placeholder);return Ur(r,t,z,e,o)});return n}function Rr(t,n){return function(r,e,o,u){var i=arguments.length<3;return"function"==typeof e&&u===z&&Ea(r)?t(r,e,o,i):Zn(r,Pr(e,u,4),o,i,n)}}function Mr(t,n,r,e,o,u,i,a,c,l){function f(){for(var y=arguments.length,b=y,w=Pu(y);b--;)w[b]=arguments[b];if(e&&(w=cr(w,e,o)),u&&(w=lr(w,u,i)),_||d){var x=f.placeholder,j=m(w,x);if(y-=j.length,l>y){var A=a?tn(a):z,I=xi(l-y,0),E=_?j:z,S=_?z:j,R=_?w:z,L=_?z:w;n|=_?M:C,n&=~(_?C:M),v||(n&=~(O|k));var N=[t,n,r,R,E,L,S,A,c,I],T=Mr.apply(z,N);return ne(t)&&Wi(T,N),T.placeholder=x,T}}var U=p?r:this,q=h?U[t]:t;return a&&(w=ce(w,a)),s&&c<w.length&&(w.length=c),this&&this!==rn&&this instanceof f&&(q=g||gr(t)),q.apply(U,w)}var s=n&L,p=n&O,h=n&k,_=n&S,v=n&E,d=n&R,g=h?z:gr(t);return f}function Cr(t,n,r){var e=t.length;if(n=+n,e>=n||!bi(n))return"";var o=n-e;return r=null==r?" ":r+"",gu(r,di(o/r.length)).slice(0,o)}function Lr(t,n,r,e){function o(){for(var n=-1,a=arguments.length,c=-1,l=e.length,f=Pu(l+a);++c<l;)f[c]=e[c];for(;a--;)f[c++]=arguments[++n];var s=this&&this!==rn&&this instanceof o?i:t;return s.apply(u?r:this,f)}var u=n&O,i=gr(t);return o}function Nr(t){var n=Yu[t];return function(t,r){return r=r===z?0:+r||0,r?(r=li(10,r),n(t*r)/r):n(t)}}function Tr(t){return function(n,r,e,o){var u=Pr(e);return null==e&&u===wn?or(n,r,t):ur(n,r,u(e,o,1),t)}}function Ur(t,n,r,e,o,u,i,a){var c=n&k;if(!c&&"function"!=typeof t)throw new Vu(W);var l=e?e.length:0;if(l||(n&=~(M|C),e=o=z),l-=o?o.length:0,n&C){var f=e,s=o;e=o=z}var p=c?z:Pi(t),h=[t,n,r,e,o,f,s,u,i,a];if(p&&(oe(h,p),n=h[1],a=h[9]),h[9]=null==a?c?0:t.length:xi(a-l,0)||0,n==O)var _=_r(h[0],h[2]);else _=n!=M&&n!=(O|M)||h[4].length?Mr.apply(z,h):Lr.apply(z,h);var v=p?Di:Wi;return v(_,h)}function qr(t,n,r,e,o,u,i){var a=-1,c=t.length,l=n.length;if(c!=l&&!(o&&l>c))return!1;for(;++a<c;){var f=t[a],s=n[a],p=e?e(o?s:f,o?f:s,a):z;if(p!==z){if(p)continue;return!1}if(o){if(!hn(n,function(t){return f===t||r(f,t,e,o,u,i)}))return!1}else if(f!==s&&!r(f,s,e,o,u,i))return!1}return!0}function Br(t,n,r){switch(r){case G:case Z:return+t==+n;case K:return t.name==n.name&&t.message==n.message;case J:return t!=+t?n!=+n:t==+n;case tt:case rt:return t==n+""}return!1}function Dr(t,n,r,e,o,u,i){var a=Da(t),c=a.length,l=Da(n),f=l.length;if(c!=f&&!o)return!1;for(var s=c;s--;){var p=a[s];if(!(o?p in n:ni.call(n,p)))return!1}for(var h=o;++s<c;){p=a[s];var _=t[p],v=n[p],d=e?e(o?v:_,o?_:v,p):z;if(!(d===z?r(_,v,e,o,u,i):d))return!1;h||(h="constructor"==p)}if(!h){var g=t.constructor,y=n.constructor;if(g!=y&&"constructor"in t&&"constructor"in n&&!("function"==typeof g&&g instanceof g&&"function"==typeof y&&y instanceof y))return!1}return!0}function Pr(t,r,e){var o=n.callback||Iu;return o=o===Iu?wn:o,e?o(t,r,e):o}function $r(t){for(var n=t.name,r=Li[n],e=r?r.length:0;e--;){var o=r[e],u=o.func;if(null==u||u==t)return o.name}return n}function Wr(t,r,e){var o=n.indexOf||Ae;return o=o===Ae?u:o,t?o(t,r,e):o}function Fr(t){for(var n=ru(t),r=n.length;r--;)n[r][2]=ee(n[r][1]);return n}function Yr(t,n){var r=null==t?z:t[n];return qo(r)?r:z}function Hr(t,n,r){for(var e=-1,o=r.length;++e<o;){var u=r[e],i=u.size;switch(u.type){case"drop":t+=i;break;case"dropRight":n-=i;break;case"take":n=ji(n,t+i);break;case"takeRight":t=xi(t,n-i)}}return{start:t,end:n}}function Gr(t){var n=t.length,r=new t.constructor(n);return n&&"string"==typeof t[0]&&ni.call(t,"index")&&(r.index=t.index,r.input=t.input),r}function Zr(t){var n=t.constructor;return"function"==typeof n&&n instanceof n||(n=Gu),new n}function Kr(t,n,r){var e=t.constructor;switch(n){case ot:return ar(t);case G:case Z:return new e(+t);case ut:case it:case at:case ct:case lt:case ft:case st:case pt:case ht:var o=t.buffer;return new e(r?ar(o):o,t.byteOffset,t.length);case J:case rt:return new e(t);case tt:var u=new e(t.source,Mt.exec(t));u.lastIndex=t.lastIndex}return u}function Vr(t,n,r){null==t||te(n,t)||(n=pe(n),t=1==n.length?t:Nn(t,Kn(n,0,-1)),n=Ie(n));var e=null==t?t:t[n];return null==e?z:e.apply(t,r)}function Xr(t){return null!=t&&re($i(t))}function Jr(t,n){return t="number"==typeof t||Nt.test(t)?+t:-1,n=null==n?Mi:n,t>-1&&t%1==0&&n>t}function Qr(t,n,r){if(!No(r))return!1;var e=typeof n;if("number"==e?Xr(r)&&Jr(n,r.length):"string"==e&&n in r){var o=r[n];return t===t?t===o:o!==o}return!1}function te(t,n){var r=typeof t;if("string"==r&&zt.test(t)||"number"==r)return!0;if(Ea(t))return!1;var e=!At.test(t);return e||null!=n&&t in se(n)}function ne(t){var r=$r(t);if(!(r in X.prototype))return!1;var e=n[r];if(t===e)return!0;var o=Pi(e);return!!o&&t===o[0]}function re(t){return"number"==typeof t&&t>-1&&t%1==0&&Mi>=t}function ee(t){return t===t&&!No(t)}function oe(t,n){var r=t[1],e=n[1],o=r|e,u=L>o,i=e==L&&r==S||e==L&&r==N&&t[7].length<=n[8]||e==(L|N)&&r==S;if(!u&&!i)return t;e&O&&(t[2]=n[2],o|=r&O?0:E);var a=n[3];if(a){var c=t[3];t[3]=c?cr(c,a,n[4]):tn(a),t[4]=c?m(t[3],F):tn(n[4])}return a=n[5],a&&(c=t[5],t[5]=c?lr(c,a,n[6]):tn(a),t[6]=c?m(t[5],F):tn(n[6])),a=n[7],a&&(t[7]=tn(a)),e&L&&(t[8]=null==t[8]?n[8]:ji(t[8],n[8])),null==t[9]&&(t[9]=n[9]),t[0]=n[0],t[1]=o,t}function ue(t,n){return t===z?n:Sa(t,n,ue)}function ie(t,n){t=se(t);for(var r=-1,e=n.length,o={};++r<e;){var u=n[r];u in t&&(o[u]=t[u])}return o}function ae(t,n){var r={};return Rn(t,function(t,e,o){n(t,e,o)&&(r[e]=t)}),r}function ce(t,n){for(var r=t.length,e=ji(n.length,r),o=tn(t);e--;){var u=n[e];t[e]=Jr(u,r)?o[u]:z}return t}function le(t){for(var n=nu(t),r=n.length,e=r&&t.length,o=!!e&&re(e)&&(Ea(t)||Io(t)),u=-1,i=[];++u<r;){var a=n[u];(o&&Jr(a,e)||ni.call(t,a))&&i.push(a)}return i}function fe(t){return null==t?[]:Xr(t)?No(t)?t:Gu(t):iu(t)}function se(t){return No(t)?t:Gu(t)}function pe(t){if(Ea(t))return t;var n=[];return a(t).replace(It,function(t,r,e,o){n.push(e?o.replace(St,"$1"):r||t)}),n}function he(t){return t instanceof X?t.clone():new y(t.__wrapped__,t.__chain__,tn(t.__actions__))}function _e(t,n,r){n=(r?Qr(t,n,r):null==n)?1:xi(yi(n)||1,1);for(var e=0,o=t?t.length:0,u=-1,i=Pu(di(o/n));o>e;)i[++u]=Kn(t,e,e+=n);return i}function ve(t){for(var n=-1,r=t?t.length:0,e=-1,o=[];++n<r;){var u=t[n];u&&(o[++e]=u)}return o}function de(t,n,r){var e=t?t.length:0;return e?((r?Qr(t,n,r):null==n)&&(n=1),Kn(t,0>n?0:n)):[]}function ge(t,n,r){var e=t?t.length:0;return e?((r?Qr(t,n,r):null==n)&&(n=1),n=e-(+n||0),Kn(t,0,0>n?0:n)):[]}function ye(t,n,r){return t&&t.length?rr(t,Pr(n,r,3),!0,!0):[]}function me(t,n,r){return t&&t.length?rr(t,Pr(n,r,3),!0):[]}function be(t,n,r,e){var o=t?t.length:0;return o?(r&&"number"!=typeof r&&Qr(t,n,r)&&(r=0,e=o),On(t,n,r,e)):[]}function we(t){return t?t[0]:z}function xe(t,n,r){var e=t?t.length:0;return r&&Qr(t,n,r)&&(n=!1),e?Sn(t,n):[]}function je(t){var n=t?t.length:0;return n?Sn(t,!0):[]}function Ae(t,n,r){var e=t?t.length:0;if(!e)return-1;if("number"==typeof r)r=0>r?xi(e+r,0):r;else if(r){var o=or(t,n);return e>o&&(n===n?n===t[o]:t[o]!==t[o])?o:-1}return u(t,n,r||0)}function ze(t){return ge(t,1)}function Ie(t){var n=t?t.length:0;return n?t[n-1]:z}function Oe(t,n,r){var e=t?t.length:0;if(!e)return-1;var o=e;if("number"==typeof r)o=(0>r?xi(e+r,0):ji(r||0,e-1))+1;else if(r){o=or(t,n,!0)-1;var u=t[o];return(n===n?n===u:u!==u)?o:-1}if(n!==n)return d(t,o,!0);for(;o--;)if(t[o]===n)return o;return-1}function ke(){var t=arguments,n=t[0];if(!n||!n.length)return n;for(var r=0,e=Wr(),o=t.length;++r<o;)for(var u=0,i=t[r];(u=e(n,i,u))>-1;)hi.call(n,u,1);return n}function Ee(t,n,r){var e=[];if(!t||!t.length)return e;var o=-1,u=[],i=t.length;for(n=Pr(n,r,3);++o<i;){var a=t[o];n(a,o,t)&&(e.push(a),u.push(o))}return Hn(t,u),e}function Se(t){return de(t,1)}function Re(t,n,r){var e=t?t.length:0;return e?(r&&"number"!=typeof r&&Qr(t,n,r)&&(n=0,r=e),Kn(t,n,r)):[]}function Me(t,n,r){var e=t?t.length:0;return e?((r?Qr(t,n,r):null==n)&&(n=1),Kn(t,0,0>n?0:n)):[]}function Ce(t,n,r){var e=t?t.length:0;return e?((r?Qr(t,n,r):null==n)&&(n=1),n=e-(+n||0),Kn(t,0>n?0:n)):[]}function Le(t,n,r){return t&&t.length?rr(t,Pr(n,r,3),!1,!0):[]}function Ne(t,n,r){return t&&t.length?rr(t,Pr(n,r,3)):[]}function Te(t,n,r,e){var o=t?t.length:0;if(!o)return[];null!=n&&"boolean"!=typeof n&&(e=r,r=Qr(t,n,e)?z:n,n=!1);var i=Pr();return(null!=r||i!==wn)&&(r=i(r,e,3)),n&&Wr()==u?b(t,r):tr(t,r)}function Ue(t){if(!t||!t.length)return[];var n=-1,r=0;t=cn(t,function(t){return Xr(t)?(r=xi(t.length,r),!0):void 0});for(var e=Pu(r);++n<r;)e[n]=ln(t,Fn(n));return e}function qe(t,n,r){var e=t?t.length:0;if(!e)return[];var o=Ue(t);return null==n?o:(n=ir(n,r,4),ln(o,function(t){return sn(t,n,z,!0)}))}function Be(){for(var t=-1,n=arguments.length;++t<n;){var r=arguments[t];if(Xr(r))var e=e?fn(An(e,r),An(r,e)):r}return e?tr(e):[]}function De(t,n){var r=-1,e=t?t.length:0,o={};for(!e||n||Ea(t[0])||(n=[]);++r<e;){var u=t[r];n?o[u]=n[r]:u&&(o[u[0]]=u[1])}return o}function Pe(t){var r=n(t);return r.__chain__=!0,r}function $e(t,n,r){return n.call(r,t),t}function We(t,n,r){return n.call(r,t)}function Fe(){return Pe(this)}function Ye(){return new y(this.value(),this.__chain__)}function He(t){for(var n,e=this;e instanceof r;){var o=he(e);n?u.__wrapped__=o:n=o;var u=o;e=e.__wrapped__}return u.__wrapped__=t,n}function Ge(){var t=this.__wrapped__,n=function(t){return r&&r.__dir__<0?t:t.reverse()};if(t instanceof X){var r=t;return this.__actions__.length&&(r=new X(this)),r=r.reverse(),r.__actions__.push({func:We,args:[n],thisArg:z}),new y(r,this.__chain__)}return this.thru(n)}function Ze(){return this.value()+""}function Ke(){return er(this.__wrapped__,this.__actions__)}function Ve(t,n,r){var e=Ea(t)?un:zn;return r&&Qr(t,n,r)&&(n=z),("function"!=typeof n||r!==z)&&(n=Pr(n,r,3)),e(t,n)}function Xe(t,n,r){var e=Ea(t)?cn:kn;return n=Pr(n,r,3),e(t,n)}function Je(t,n){return oa(t,Dn(n))}function Qe(t,n,r,e){var o=t?$i(t):0;return re(o)||(t=iu(t),o=t.length),r="number"!=typeof r||e&&Qr(n,r,e)?0:0>r?xi(o+r,0):r||0,"string"==typeof t||!Ea(t)&&Wo(t)?o>=r&&t.indexOf(n,r)>-1:!!o&&Wr(t,n,r)>-1}function to(t,n,r){var e=Ea(t)?ln:Bn;return n=Pr(n,r,3),e(t,n)}function no(t,n){return to(t,Lu(n))}function ro(t,n,r){var e=Ea(t)?cn:kn;return n=Pr(n,r,3),e(t,function(t,r,e){return!n(t,r,e)})}function eo(t,n,r){if(r?Qr(t,n,r):null==n){t=fe(t);var e=t.length;return e>0?t[Gn(0,e-1)]:z}var o=-1,u=Zo(t),e=u.length,i=e-1;for(n=ji(0>n?0:+n||0,e);++o<n;){var a=Gn(o,i),c=u[a];u[a]=u[o],u[o]=c}return u.length=n,u}function oo(t){return eo(t,ki)}function uo(t){var n=t?$i(t):0;return re(n)?n:Da(t).length}function io(t,n,r){var e=Ea(t)?hn:Vn;return r&&Qr(t,n,r)&&(n=z),("function"!=typeof n||r!==z)&&(n=Pr(n,r,3)),e(t,n)}function ao(t,n,r){if(null==t)return[];r&&Qr(t,n,r)&&(n=z);var e=-1;n=Pr(n,r,3);var o=Bn(t,function(t,r,o){return{criteria:n(t,r,o),index:++e,value:t}});return Xn(o,f)}function co(t,n,r,e){return null==t?[]:(e&&Qr(n,r,e)&&(r=z),Ea(n)||(n=null==n?[]:[n]),Ea(r)||(r=null==r?[]:[r]),Jn(t,n,r))}function lo(t,n){return Xe(t,Dn(n))}function fo(t,n){if("function"!=typeof n){if("function"!=typeof t)throw new Vu(W);var r=t;t=n,n=r}return t=bi(t=+t)?t:0,function(){return--t<1?n.apply(this,arguments):void 0}}function so(t,n,r){return r&&Qr(t,n,r)&&(n=z),n=t&&null==n?t.length:xi(+n||0,0),Ur(t,L,z,z,z,z,n)}function po(t,n){var r;if("function"!=typeof n){if("function"!=typeof t)throw new Vu(W);var e=t;t=n,n=e}return function(){return--t>0&&(r=n.apply(this,arguments)),1>=t&&(n=z),r}}function ho(t,n,r){function e(){h&&ai(h),l&&ai(l),v=0,l=h=_=z}function o(n,r){r&&ai(r),l=h=_=z,n&&(v=va(),f=t.apply(p,c),h||l||(c=p=z))}function u(){var t=n-(va()-s);0>=t||t>n?o(_,l):h=pi(u,t)}function i(){o(g,h)}function a(){if(c=arguments,s=va(),p=this,_=g&&(h||!y),d===!1)var r=y&&!h;else{l||y||(v=s);var e=d-(s-v),o=0>=e||e>d;o?(l&&(l=ai(l)),v=s,f=t.apply(p,c)):l||(l=pi(i,e))}return o&&h?h=ai(h):h||n===d||(h=pi(u,n)),r&&(o=!0,f=t.apply(p,c)),!o||h||l||(c=p=z),f}var c,l,f,s,p,h,_,v=0,d=!1,g=!0;if("function"!=typeof t)throw new Vu(W);if(n=0>n?0:+n||0,r===!0){var y=!0;g=!1}else No(r)&&(y=!!r.leading,d="maxWait"in r&&xi(+r.maxWait||0,n),g="trailing"in r?!!r.trailing:g);return a.cancel=e,a}function _o(t,n){if("function"!=typeof t||n&&"function"!=typeof n)throw new Vu(W);var r=function(){var e=arguments,o=n?n.apply(this,e):e[0],u=r.cache;if(u.has(o))return u.get(o);var i=t.apply(this,e);return r.cache=u.set(o,i),i};return r.cache=new _o.Cache,r}function vo(t){if("function"!=typeof t)throw new Vu(W);return function(){return!t.apply(this,arguments)}}function go(t){return po(2,t)}function yo(t,n){if("function"!=typeof t)throw new Vu(W);return n=xi(n===z?t.length-1:+n||0,0),function(){for(var r=arguments,e=-1,o=xi(r.length-n,0),u=Pu(o);++e<o;)u[e]=r[n+e];switch(n){case 0:return t.call(this,u);case 1:return t.call(this,r[0],u);case 2:return t.call(this,r[0],r[1],u)}var i=Pu(n+1);for(e=-1;++e<n;)i[e]=r[e];return i[n]=u,t.apply(this,i)}}function mo(t){if("function"!=typeof t)throw new Vu(W);return function(n){return t.apply(this,n)}}function bo(t,n,r){var e=!0,o=!0;if("function"!=typeof t)throw new Vu(W);return r===!1?e=!1:No(r)&&(e="leading"in r?!!r.leading:e,o="trailing"in r?!!r.trailing:o),ho(t,n,{leading:e,maxWait:+n,trailing:o})}function wo(t,n){return n=null==n?ku:n,Ur(n,M,z,[t],[])}function xo(t,n,r,e){return n&&"boolean"!=typeof n&&Qr(t,n,r)?n=!1:"function"==typeof n&&(e=r,r=n,n=!1),"function"==typeof r?xn(t,n,ir(r,e,1)):xn(t,n)}function jo(t,n,r){return"function"==typeof n?xn(t,!0,ir(n,r,1)):xn(t,!0)}function Ao(t,n){return t>n}function zo(t,n){return t>=n}function Io(t){return g(t)&&Xr(t)&&ni.call(t,"callee")&&!fi.call(t,"callee")}function Oo(t){return t===!0||t===!1||g(t)&&ei.call(t)==G}function ko(t){return g(t)&&ei.call(t)==Z}function Eo(t){return!!t&&1===t.nodeType&&g(t)&&!Po(t)}function So(t){return null==t?!0:Xr(t)&&(Ea(t)||Wo(t)||Io(t)||g(t)&&Lo(t.splice))?!t.length:!Da(t).length}function Ro(t,n,r,e){r="function"==typeof r?ir(r,e,3):z;var o=r?r(t,n):z;return o===z?Tn(t,n,r):!!o}function Mo(t){return g(t)&&"string"==typeof t.message&&ei.call(t)==K}function Co(t){return"number"==typeof t&&bi(t)}function Lo(t){return No(t)&&ei.call(t)==V}function No(t){var n=typeof t;return!!t&&("object"==n||"function"==n)}function To(t,n,r,e){return r="function"==typeof r?ir(r,e,3):z,qn(t,Fr(n),r)}function Uo(t){return Do(t)&&t!=+t}function qo(t){return null==t?!1:Lo(t)?ui.test(ti.call(t)):g(t)&&Lt.test(t)}function Bo(t){return null===t}function Do(t){return"number"==typeof t||g(t)&&ei.call(t)==J}function Po(t){var n;if(!g(t)||ei.call(t)!=Q||Io(t)||!ni.call(t,"constructor")&&(n=t.constructor,"function"==typeof n&&!(n instanceof n)))return!1;var r;return Rn(t,function(t,n){r=n}),r===z||ni.call(t,r)}function $o(t){return No(t)&&ei.call(t)==tt}function Wo(t){return"string"==typeof t||g(t)&&ei.call(t)==rt}function Fo(t){return g(t)&&re(t.length)&&!!$t[ei.call(t)]}function Yo(t){return t===z}function Ho(t,n){return n>t}function Go(t,n){return n>=t}function Zo(t){var n=t?$i(t):0;return re(n)?n?tn(t):[]:iu(t)}function Ko(t){return bn(t,nu(t))}function Vo(t,n,r){var e=Ni(t);return r&&Qr(t,n,r)&&(n=z),n?yn(e,n):e}function Xo(t){return Ln(t,nu(t))}function Jo(t,n,r){var e=null==t?z:Nn(t,pe(n),n+"");return e===z?r:e}function Qo(t,n){if(null==t)return!1;var r=ni.call(t,n);if(!r&&!te(n)){if(n=pe(n),t=1==n.length?t:Nn(t,Kn(n,0,-1)),null==t)return!1;n=Ie(n),r=ni.call(t,n)}return r||re(t.length)&&Jr(n,t.length)&&(Ea(t)||Io(t))}function tu(t,n,r){r&&Qr(t,n,r)&&(n=z);for(var e=-1,o=Da(t),u=o.length,i={};++e<u;){var a=o[e],c=t[a];n?ni.call(i,c)?i[c].push(a):i[c]=[a]:i[c]=a}return i}function nu(t){if(null==t)return[];No(t)||(t=Gu(t));var n=t.length;n=n&&re(n)&&(Ea(t)||Io(t))&&n||0;for(var r=t.constructor,e=-1,o="function"==typeof r&&r.prototype===t,u=Pu(n),i=n>0;++e<n;)u[e]=e+"";for(var a in t)i&&Jr(a,n)||"constructor"==a&&(o||!ni.call(t,a))||u.push(a);return u}function ru(t){t=se(t);for(var n=-1,r=Da(t),e=r.length,o=Pu(e);++n<e;){var u=r[n];o[n]=[u,t[u]]}return o}function eu(t,n,r){var e=null==t?z:t[n];return e===z&&(null==t||te(n,t)||(n=pe(n),t=1==n.length?t:Nn(t,Kn(n,0,-1)),e=null==t?z:t[Ie(n)]),e=e===z?r:e),Lo(e)?e.call(t):e}function ou(t,n,r){if(null==t)return t;var e=n+"";n=null!=t[e]||te(n,t)?[e]:pe(n);for(var o=-1,u=n.length,i=u-1,a=t;null!=a&&++o<u;){
var c=n[o];No(a)&&(o==i?a[c]=r:null==a[c]&&(a[c]=Jr(n[o+1])?[]:{})),a=a[c]}return t}function uu(t,n,r,e){var o=Ea(t)||Fo(t);if(n=Pr(n,e,4),null==r)if(o||No(t)){var u=t.constructor;r=o?Ea(t)?new u:[]:Ni(Lo(u)?u.prototype:z)}else r={};return(o?nn:Mn)(t,function(t,e,o){return n(r,t,e,o)}),r}function iu(t){return nr(t,Da(t))}function au(t){return nr(t,nu(t))}function cu(t,n,r){return n=+n||0,r===z?(r=n,n=0):r=+r||0,t>=ji(n,r)&&t<xi(n,r)}function lu(t,n,r){r&&Qr(t,n,r)&&(n=r=z);var e=null==t,o=null==n;if(null==r&&(o&&"boolean"==typeof t?(r=t,t=1):"boolean"==typeof n&&(r=n,o=!0)),e&&o&&(n=1,o=!1),t=+t||0,o?(n=t,t=0):n=+n||0,r||t%1||n%1){var u=Ii();return ji(t+u*(n-t+ci("1e-"+((u+"").length-1))),n)}return Gn(t,n)}function fu(t){return t=a(t),t&&t.charAt(0).toUpperCase()+t.slice(1)}function su(t){return t=a(t),t&&t.replace(Tt,p).replace(Et,"")}function pu(t,n,r){t=a(t),n+="";var e=t.length;return r=r===z?e:ji(0>r?0:+r||0,e),r-=n.length,r>=0&&t.indexOf(n,r)==r}function hu(t){return t=a(t),t&&bt.test(t)?t.replace(yt,h):t}function _u(t){return t=a(t),t&&kt.test(t)?t.replace(Ot,_):t||"(?:)"}function vu(t,n,r){t=a(t),n=+n;var e=t.length;if(e>=n||!bi(n))return t;var o=(n-e)/2,u=yi(o),i=di(o);return r=Cr("",i,r),r.slice(0,u)+t+r}function du(t,n,r){return(r?Qr(t,n,r):null==n)?n=0:n&&(n=+n),t=bu(t),zi(t,n||(Ct.test(t)?16:10))}function gu(t,n){var r="";if(t=a(t),n=+n,1>n||!t||!bi(n))return r;do n%2&&(r+=t),n=yi(n/2),t+=t;while(n);return r}function yu(t,n,r){return t=a(t),r=null==r?0:ji(0>r?0:+r||0,t.length),t.lastIndexOf(n,r)==r}function mu(t,r,e){var o=n.templateSettings;e&&Qr(t,r,e)&&(r=e=z),t=a(t),r=gn(yn({},e||r),o,dn);var u,i,c=gn(yn({},r.imports),o.imports,dn),l=Da(c),f=nr(c,l),s=0,p=r.interpolate||Ut,h="__p += '",_=Zu((r.escape||Ut).source+"|"+p.source+"|"+(p===jt?Rt:Ut).source+"|"+(r.evaluate||Ut).source+"|$","g"),d="//# sourceURL="+("sourceURL"in r?r.sourceURL:"lodash.templateSources["+ ++Pt+"]")+"\n";t.replace(_,function(n,r,e,o,a,c){return e||(e=o),h+=t.slice(s,c).replace(qt,v),r&&(u=!0,h+="' +\n__e("+r+") +\n'"),a&&(i=!0,h+="';\n"+a+";\n__p += '"),e&&(h+="' +\n((__t = ("+e+")) == null ? '' : __t) +\n'"),s=c+n.length,n}),h+="';\n";var g=r.variable;g||(h="with (obj) {\n"+h+"\n}\n"),h=(i?h.replace(_t,""):h).replace(vt,"$1").replace(dt,"$1;"),h="function("+(g||"obj")+") {\n"+(g?"":"obj || (obj = {});\n")+"var __t, __p = ''"+(u?", __e = _.escape":"")+(i?", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n":";\n")+h+"return __p\n}";var y=Xa(function(){return Fu(l,d+"return "+h).apply(z,f)});if(y.source=h,Mo(y))throw y;return y}function bu(t,n,r){var e=t;return(t=a(t))?(r?Qr(e,n,r):null==n)?t.slice(w(t),x(t)+1):(n+="",t.slice(c(t,n),l(t,n)+1)):t}function wu(t,n,r){var e=t;return t=a(t),t?(r?Qr(e,n,r):null==n)?t.slice(w(t)):t.slice(c(t,n+"")):t}function xu(t,n,r){var e=t;return t=a(t),t?(r?Qr(e,n,r):null==n)?t.slice(0,x(t)+1):t.slice(0,l(t,n+"")+1):t}function ju(t,n,r){r&&Qr(t,n,r)&&(n=z);var e=T,o=U;if(null!=n)if(No(n)){var u="separator"in n?n.separator:u;e="length"in n?+n.length||0:e,o="omission"in n?a(n.omission):o}else e=+n||0;if(t=a(t),e>=t.length)return t;var i=e-o.length;if(1>i)return o;var c=t.slice(0,i);if(null==u)return c+o;if($o(u)){if(t.slice(i).search(u)){var l,f,s=t.slice(0,i);for(u.global||(u=Zu(u.source,(Mt.exec(u)||"")+"g")),u.lastIndex=0;l=u.exec(s);)f=l.index;c=c.slice(0,null==f?i:f)}}else if(t.indexOf(u,i)!=i){var p=c.lastIndexOf(u);p>-1&&(c=c.slice(0,p))}return c+o}function Au(t){return t=a(t),t&&mt.test(t)?t.replace(gt,j):t}function zu(t,n,r){return r&&Qr(t,n,r)&&(n=z),t=a(t),t.match(n||Bt)||[]}function Iu(t,n,r){return r&&Qr(t,n,r)&&(n=z),g(t)?Eu(t):wn(t,n)}function Ou(t){return function(){return t}}function ku(t){return t}function Eu(t){return Dn(xn(t,!0))}function Su(t,n){return Pn(t,xn(n,!0))}function Ru(t,n,r){if(null==r){var e=No(n),o=e?Da(n):z,u=o&&o.length?Ln(n,o):z;(u?u.length:e)||(u=!1,r=n,n=t,t=this)}u||(u=Ln(n,Da(n)));var i=!0,a=-1,c=Lo(t),l=u.length;r===!1?i=!1:No(r)&&"chain"in r&&(i=r.chain);for(;++a<l;){var f=u[a],s=n[f];t[f]=s,c&&(t.prototype[f]=function(n){return function(){var r=this.__chain__;if(i||r){var e=t(this.__wrapped__),o=e.__actions__=tn(this.__actions__);return o.push({func:n,args:arguments,thisArg:t}),e.__chain__=r,e}return n.apply(t,fn([this.value()],arguments))}}(s))}return t}function Mu(){return rn._=oi,this}function Cu(){}function Lu(t){return te(t)?Fn(t):Yn(t)}function Nu(t){return function(n){return Nn(t,pe(n),n+"")}}function Tu(t,n,r){r&&Qr(t,n,r)&&(n=r=z),t=+t||0,r=null==r?1:+r||0,null==n?(n=t,t=0):n=+n||0;for(var e=-1,o=xi(di((n-t)/(r||1)),0),u=Pu(o);++e<o;)u[e]=t,t+=r;return u}function Uu(t,n,r){if(t=yi(t),1>t||!bi(t))return[];var e=-1,o=Pu(ji(t,Ei));for(n=ir(n,r,1);++e<t;)Ei>e?o[e]=n(e):n(e);return o}function qu(t){var n=++ri;return a(t)+n}function Bu(t,n){return(+t||0)+(+n||0)}function Du(t,n,r){return r&&Qr(t,n,r)&&(n=z),n=Pr(n,r,3),1==n.length?_n(Ea(t)?t:fe(t),n):Qn(t,n)}t=t?en.defaults(rn.Object(),t,en.pick(rn,Dt)):rn;var Pu=t.Array,$u=t.Date,Wu=t.Error,Fu=t.Function,Yu=t.Math,Hu=t.Number,Gu=t.Object,Zu=t.RegExp,Ku=t.String,Vu=t.TypeError,Xu=Pu.prototype,Ju=Gu.prototype,Qu=Ku.prototype,ti=Fu.prototype.toString,ni=Ju.hasOwnProperty,ri=0,ei=Ju.toString,oi=rn._,ui=Zu("^"+ti.call(ni).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),ii=t.ArrayBuffer,ai=t.clearTimeout,ci=t.parseFloat,li=Yu.pow,fi=Ju.propertyIsEnumerable,si=Yr(t,"Set"),pi=t.setTimeout,hi=Xu.splice,_i=t.Uint8Array,vi=Yr(t,"WeakMap"),di=Yu.ceil,gi=Yr(Gu,"create"),yi=Yu.floor,mi=Yr(Pu,"isArray"),bi=t.isFinite,wi=Yr(Gu,"keys"),xi=Yu.max,ji=Yu.min,Ai=Yr($u,"now"),zi=t.parseInt,Ii=Yu.random,Oi=Hu.NEGATIVE_INFINITY,ki=Hu.POSITIVE_INFINITY,Ei=4294967295,Si=Ei-1,Ri=Ei>>>1,Mi=9007199254740991,Ci=vi&&new vi,Li={};n.support={};n.templateSettings={escape:wt,evaluate:xt,interpolate:jt,variable:"",imports:{_:n}};var Ni=function(){function t(){}return function(n){if(No(n)){t.prototype=n;var r=new t;t.prototype=z}return r||{}}}(),Ti=pr(Mn),Ui=pr(Cn,!0),qi=hr(),Bi=hr(!0),Di=Ci?function(t,n){return Ci.set(t,n),t}:ku,Pi=Ci?function(t){return Ci.get(t)}:Cu,$i=Fn("length"),Wi=function(){var t=0,n=0;return function(r,e){var o=va(),u=B-(o-n);if(n=o,u>0){if(++t>=q)return r}else t=0;return Di(r,e)}}(),Fi=yo(function(t,n){return g(t)&&Xr(t)?An(t,Sn(n,!1,!0)):[]}),Yi=xr(),Hi=xr(!0),Gi=yo(function(t){for(var n=t.length,r=n,e=Pu(s),o=Wr(),i=o==u,a=[];r--;){var c=t[r]=Xr(c=t[r])?c:[];e[r]=i&&c.length>=120?vr(r&&c):null}var l=t[0],f=-1,s=l?l.length:0,p=e[0];t:for(;++f<s;)if(c=l[f],(p?Xt(p,c):o(a,c,0))<0){for(var r=n;--r;){var h=e[r];if((h?Xt(h,c):o(t[r],c,0))<0)continue t}p&&p.push(c),a.push(c)}return a}),Zi=yo(function(t,n){n=Sn(n);var r=mn(t,n);return Hn(t,n.sort(e)),r}),Ki=Tr(),Vi=Tr(!0),Xi=yo(function(t){return tr(Sn(t,!1,!0))}),Ji=yo(function(t,n){return Xr(t)?An(t,n):[]}),Qi=yo(Ue),ta=yo(function(t){var n=t.length,r=n>2?t[n-2]:z,e=n>1?t[n-1]:z;return n>2&&"function"==typeof r?n-=2:(r=n>1&&"function"==typeof e?(--n,e):z,e=z),t.length=n,qe(t,r,e)}),na=yo(function(t){return t=Sn(t),this.thru(function(n){return Qt(Ea(n)?n:[se(n)],t)})}),ra=yo(function(t,n){return mn(t,Sn(n))}),ea=fr(function(t,n,r){ni.call(t,r)?++t[r]:t[r]=1}),oa=wr(Ti),ua=wr(Ui,!0),ia=zr(nn,Ti),aa=zr(on,Ui),ca=fr(function(t,n,r){ni.call(t,r)?t[r].push(n):t[r]=[n]}),la=fr(function(t,n,r){t[r]=n}),fa=yo(function(t,n,r){var e=-1,o="function"==typeof n,u=te(n),i=Xr(t)?Pu(t.length):[];return Ti(t,function(t){var a=o?n:u&&null!=t?t[n]:z;i[++e]=a?a.apply(t,r):Vr(t,n,r)}),i}),sa=fr(function(t,n,r){t[r?0:1].push(n)},function(){return[[],[]]}),pa=Rr(sn,Ti),ha=Rr(pn,Ui),_a=yo(function(t,n){if(null==t)return[];var r=n[2];return r&&Qr(n[0],n[1],r)&&(n.length=1),Jn(t,Sn(n),[])}),va=Ai||function(){return(new $u).getTime()},da=yo(function(t,n,r){var e=O;if(r.length){var o=m(r,da.placeholder);e|=M}return Ur(t,e,n,r,o)}),ga=yo(function(t,n){n=n.length?Sn(n):Xo(t);for(var r=-1,e=n.length;++r<e;){var o=n[r];t[o]=Ur(t[o],O,t)}return t}),ya=yo(function(t,n,r){var e=O|k;if(r.length){var o=m(r,ya.placeholder);e|=M}return Ur(n,e,t,r,o)}),ma=yr(S),ba=yr(R),wa=yo(function(t,n){return jn(t,1,n)}),xa=yo(function(t,n,r){return jn(t,n,r)}),ja=Ar(),Aa=Ar(!0),za=yo(function(t,n){if(n=Sn(n),"function"!=typeof t||!un(n,i))throw new Vu(W);var r=n.length;return yo(function(e){for(var o=ji(e.length,r);o--;)e[o]=n[o](e[o]);return t.apply(this,e)})}),Ia=Sr(M),Oa=Sr(C),ka=yo(function(t,n){return Ur(t,N,z,z,z,Sn(n))}),Ea=mi||function(t){return g(t)&&re(t.length)&&ei.call(t)==H},Sa=sr($n),Ra=sr(function(t,n,r){return r?gn(t,n,r):yn(t,n)}),Ma=mr(Ra,vn),Ca=mr(Sa,ue),La=jr(Mn),Na=jr(Cn),Ta=Ir(qi),Ua=Ir(Bi),qa=Or(Mn),Ba=Or(Cn),Da=wi?function(t){var n=null==t?z:t.constructor;return"function"==typeof n&&n.prototype===t||"function"!=typeof t&&Xr(t)?le(t):No(t)?wi(t):[]}:le,Pa=kr(!0),$a=kr(),Wa=yo(function(t,n){if(null==t)return{};if("function"!=typeof n[0]){var n=ln(Sn(n),Ku);return ie(t,An(nu(t),n))}var r=ir(n[0],n[1],3);return ae(t,function(t,n,e){return!r(t,n,e)})}),Fa=yo(function(t,n){return null==t?{}:"function"==typeof n[0]?ae(t,ir(n[0],n[1],3)):ie(t,Sn(n))}),Ya=dr(function(t,n,r){return n=n.toLowerCase(),t+(r?n.charAt(0).toUpperCase()+n.slice(1):n)}),Ha=dr(function(t,n,r){return t+(r?"-":"")+n.toLowerCase()}),Ga=Er(),Za=Er(!0),Ka=dr(function(t,n,r){return t+(r?"_":"")+n.toLowerCase()}),Va=dr(function(t,n,r){return t+(r?" ":"")+(n.charAt(0).toUpperCase()+n.slice(1))}),Xa=yo(function(t,n){try{return t.apply(z,n)}catch(r){return Mo(r)?r:new Wu(r)}}),Ja=yo(function(t,n){return function(r){return Vr(r,t,n)}}),Qa=yo(function(t,n){return function(r){return Vr(t,r,n)}}),tc=Nr("ceil"),nc=Nr("floor"),rc=br(Ao,Oi),ec=br(Ho,ki),oc=Nr("round");return n.prototype=r.prototype,y.prototype=Ni(r.prototype),y.prototype.constructor=y,X.prototype=Ni(r.prototype),X.prototype.constructor=X,Yt.prototype["delete"]=Ht,Yt.prototype.get=Gt,Yt.prototype.has=Zt,Yt.prototype.set=Kt,Vt.prototype.push=Jt,_o.Cache=Yt,n.after=fo,n.ary=so,n.assign=Ra,n.at=ra,n.before=po,n.bind=da,n.bindAll=ga,n.bindKey=ya,n.callback=Iu,n.chain=Pe,n.chunk=_e,n.compact=ve,n.constant=Ou,n.countBy=ea,n.create=Vo,n.curry=ma,n.curryRight=ba,n.debounce=ho,n.defaults=Ma,n.defaultsDeep=Ca,n.defer=wa,n.delay=xa,n.difference=Fi,n.drop=de,n.dropRight=ge,n.dropRightWhile=ye,n.dropWhile=me,n.fill=be,n.filter=Xe,n.flatten=xe,n.flattenDeep=je,n.flow=ja,n.flowRight=Aa,n.forEach=ia,n.forEachRight=aa,n.forIn=Ta,n.forInRight=Ua,n.forOwn=qa,n.forOwnRight=Ba,n.functions=Xo,n.groupBy=ca,n.indexBy=la,n.initial=ze,n.intersection=Gi,n.invert=tu,n.invoke=fa,n.keys=Da,n.keysIn=nu,n.map=to,n.mapKeys=Pa,n.mapValues=$a,n.matches=Eu,n.matchesProperty=Su,n.memoize=_o,n.merge=Sa,n.method=Ja,n.methodOf=Qa,n.mixin=Ru,n.modArgs=za,n.negate=vo,n.omit=Wa,n.once=go,n.pairs=ru,n.partial=Ia,n.partialRight=Oa,n.partition=sa,n.pick=Fa,n.pluck=no,n.property=Lu,n.propertyOf=Nu,n.pull=ke,n.pullAt=Zi,n.range=Tu,n.rearg=ka,n.reject=ro,n.remove=Ee,n.rest=Se,n.restParam=yo,n.set=ou,n.shuffle=oo,n.slice=Re,n.sortBy=ao,n.sortByAll=_a,n.sortByOrder=co,n.spread=mo,n.take=Me,n.takeRight=Ce,n.takeRightWhile=Le,n.takeWhile=Ne,n.tap=$e,n.throttle=bo,n.thru=We,n.times=Uu,n.toArray=Zo,n.toPlainObject=Ko,n.transform=uu,n.union=Xi,n.uniq=Te,n.unzip=Ue,n.unzipWith=qe,n.values=iu,n.valuesIn=au,n.where=lo,n.without=Ji,n.wrap=wo,n.xor=Be,n.zip=Qi,n.zipObject=De,n.zipWith=ta,n.backflow=Aa,n.collect=to,n.compose=Aa,n.each=ia,n.eachRight=aa,n.extend=Ra,n.iteratee=Iu,n.methods=Xo,n.object=De,n.select=Xe,n.tail=Se,n.unique=Te,Ru(n,n),n.add=Bu,n.attempt=Xa,n.camelCase=Ya,n.capitalize=fu,n.ceil=tc,n.clone=xo,n.cloneDeep=jo,n.deburr=su,n.endsWith=pu,n.escape=hu,n.escapeRegExp=_u,n.every=Ve,n.find=oa,n.findIndex=Yi,n.findKey=La,n.findLast=ua,n.findLastIndex=Hi,n.findLastKey=Na,n.findWhere=Je,n.first=we,n.floor=nc,n.get=Jo,n.gt=Ao,n.gte=zo,n.has=Qo,n.identity=ku,n.includes=Qe,n.indexOf=Ae,n.inRange=cu,n.isArguments=Io,n.isArray=Ea,n.isBoolean=Oo,n.isDate=ko,n.isElement=Eo,n.isEmpty=So,n.isEqual=Ro,n.isError=Mo,n.isFinite=Co,n.isFunction=Lo,n.isMatch=To,n.isNaN=Uo,n.isNative=qo,n.isNull=Bo,n.isNumber=Do,n.isObject=No,n.isPlainObject=Po,n.isRegExp=$o,n.isString=Wo,n.isTypedArray=Fo,n.isUndefined=Yo,n.kebabCase=Ha,n.last=Ie,n.lastIndexOf=Oe,n.lt=Ho,n.lte=Go,n.max=rc,n.min=ec,n.noConflict=Mu,n.noop=Cu,n.now=va,n.pad=vu,n.padLeft=Ga,n.padRight=Za,n.parseInt=du,n.random=lu,n.reduce=pa,n.reduceRight=ha,n.repeat=gu,n.result=eu,n.round=oc,n.runInContext=A,n.size=uo,n.snakeCase=Ka,n.some=io,n.sortedIndex=Ki,n.sortedLastIndex=Vi,n.startCase=Va,n.startsWith=yu,n.sum=Du,n.template=mu,n.trim=bu,n.trimLeft=wu,n.trimRight=xu,n.trunc=ju,n.unescape=Au,n.uniqueId=qu,n.words=zu,n.all=Ve,n.any=io,n.contains=Qe,n.eq=Ro,n.detect=oa,n.foldl=pa,n.foldr=ha,n.head=we,n.include=Qe,n.inject=pa,Ru(n,function(){var t={};return Mn(n,function(r,e){n.prototype[e]||(t[e]=r)}),t}(),!1),n.sample=eo,n.prototype.sample=function(t){return this.__chain__||null!=t?this.thru(function(n){return eo(n,t)}):eo(this.value())},n.VERSION=I,nn(["bind","bindKey","curry","curryRight","partial","partialRight"],function(t){n[t].placeholder=n}),nn(["drop","take"],function(t,n){X.prototype[t]=function(r){var e=this.__filtered__;if(e&&!n)return new X(this);r=null==r?1:xi(yi(r)||0,0);var o=this.clone();return e?o.__takeCount__=ji(o.__takeCount__,r):o.__views__.push({size:r,type:t+(o.__dir__<0?"Right":"")}),o},X.prototype[t+"Right"]=function(n){return this.reverse()[t](n).reverse()}}),nn(["filter","map","takeWhile"],function(t,n){var r=n+1,e=r!=$;X.prototype[t]=function(t,n){var o=this.clone();return o.__iteratees__.push({iteratee:Pr(t,n,1),type:r}),o.__filtered__=o.__filtered__||e,o}}),nn(["first","last"],function(t,n){var r="take"+(n?"Right":"");X.prototype[t]=function(){return this[r](1).value()[0]}}),nn(["initial","rest"],function(t,n){var r="drop"+(n?"":"Right");X.prototype[t]=function(){return this.__filtered__?new X(this):this[r](1)}}),nn(["pluck","where"],function(t,n){var r=n?"filter":"map",e=n?Dn:Lu;X.prototype[t]=function(t){return this[r](e(t))}}),X.prototype.compact=function(){return this.filter(ku)},X.prototype.reject=function(t,n){return t=Pr(t,n,1),this.filter(function(n){return!t(n)})},X.prototype.slice=function(t,n){t=null==t?0:+t||0;var r=this;return r.__filtered__&&(t>0||0>n)?new X(r):(0>t?r=r.takeRight(-t):t&&(r=r.drop(t)),n!==z&&(n=+n||0,r=0>n?r.dropRight(-n):r.take(n-t)),r)},X.prototype.takeRightWhile=function(t,n){return this.reverse().takeWhile(t,n).reverse()},X.prototype.toArray=function(){return this.take(ki)},Mn(X.prototype,function(t,r){var e=/^(?:filter|map|reject)|While$/.test(r),o=/^(?:first|last)$/.test(r),u=n[o?"take"+("last"==r?"Right":""):r];u&&(n.prototype[r]=function(){var n=o?[1]:arguments,r=this.__chain__,i=this.__wrapped__,a=!!this.__actions__.length,c=i instanceof X,l=n[0],f=c||Ea(i);f&&e&&"function"==typeof l&&1!=l.length&&(c=f=!1);var s=function(t){return o&&r?u(t,1)[0]:u.apply(z,fn([t],n))},p={func:We,args:[s],thisArg:z},h=c&&!a;if(o&&!r)return h?(i=i.clone(),i.__actions__.push(p),t.call(i)):u.call(z,this.value())[0];if(!o&&f){i=h?i:new X(this);var _=t.apply(i,n);return _.__actions__.push(p),new y(_,r)}return this.thru(s)})}),nn(["join","pop","push","replace","shift","sort","splice","split","unshift"],function(t){var r=(/^(?:replace|split)$/.test(t)?Qu:Xu)[t],e=/^(?:push|sort|unshift)$/.test(t)?"tap":"thru",o=/^(?:join|pop|replace|shift)$/.test(t);n.prototype[t]=function(){var t=arguments;return o&&!this.__chain__?r.apply(this.value(),t):this[e](function(n){return r.apply(n,t)})}}),Mn(X.prototype,function(t,r){var e=n[r];if(e){var o=e.name,u=Li[o]||(Li[o]=[]);u.push({name:r,func:e})}}),Li[Mr(z,k).name]=[{name:"wrapper",func:z}],X.prototype.clone=nt,X.prototype.reverse=et,X.prototype.value=Ft,n.prototype.chain=Fe,n.prototype.commit=Ye,n.prototype.concat=na,n.prototype.plant=He,n.prototype.reverse=Ge,n.prototype.toString=Ze,n.prototype.run=n.prototype.toJSON=n.prototype.valueOf=n.prototype.value=Ke,n.prototype.collect=n.prototype.map,n.prototype.head=n.prototype.first,n.prototype.select=n.prototype.filter,n.prototype.tail=n.prototype.rest,n}var z,I="3.10.1",O=1,k=2,E=4,S=8,R=16,M=32,C=64,L=128,N=256,T=30,U="...",q=150,B=16,D=200,P=1,$=2,W="Expected a function",F="__lodash_placeholder__",Y="[object Arguments]",H="[object Array]",G="[object Boolean]",Z="[object Date]",K="[object Error]",V="[object Function]",X="[object Map]",J="[object Number]",Q="[object Object]",tt="[object RegExp]",nt="[object Set]",rt="[object String]",et="[object WeakMap]",ot="[object ArrayBuffer]",ut="[object Float32Array]",it="[object Float64Array]",at="[object Int8Array]",ct="[object Int16Array]",lt="[object Int32Array]",ft="[object Uint8Array]",st="[object Uint8ClampedArray]",pt="[object Uint16Array]",ht="[object Uint32Array]",_t=/\b__p \+= '';/g,vt=/\b(__p \+=) '' \+/g,dt=/(__e\(.*?\)|\b__t\)) \+\n'';/g,gt=/&(?:amp|lt|gt|quot|#39|#96);/g,yt=/[&<>"'`]/g,mt=RegExp(gt.source),bt=RegExp(yt.source),wt=/<%-([\s\S]+?)%>/g,xt=/<%([\s\S]+?)%>/g,jt=/<%=([\s\S]+?)%>/g,At=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,zt=/^\w*$/,It=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,Ot=/^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g,kt=RegExp(Ot.source),Et=/[\u0300-\u036f\ufe20-\ufe23]/g,St=/\\(\\)?/g,Rt=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,Mt=/\w*$/,Ct=/^0[xX]/,Lt=/^\[object .+?Constructor\]$/,Nt=/^\d+$/,Tt=/[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g,Ut=/($^)/,qt=/['\n\r\u2028\u2029\\]/g,Bt=function(){var t="[A-Z\\xc0-\\xd6\\xd8-\\xde]",n="[a-z\\xdf-\\xf6\\xf8-\\xff]+";return RegExp(t+"+(?="+t+n+")|"+t+"?"+n+"|"+t+"+|[0-9]+","g")}(),Dt=["Array","ArrayBuffer","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Math","Number","Object","RegExp","Set","String","_","clearTimeout","isFinite","parseFloat","parseInt","setTimeout","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap"],Pt=-1,$t={};$t[ut]=$t[it]=$t[at]=$t[ct]=$t[lt]=$t[ft]=$t[st]=$t[pt]=$t[ht]=!0,$t[Y]=$t[H]=$t[ot]=$t[G]=$t[Z]=$t[K]=$t[V]=$t[X]=$t[J]=$t[Q]=$t[tt]=$t[nt]=$t[rt]=$t[et]=!1;var Wt={};Wt[Y]=Wt[H]=Wt[ot]=Wt[G]=Wt[Z]=Wt[ut]=Wt[it]=Wt[at]=Wt[ct]=Wt[lt]=Wt[J]=Wt[Q]=Wt[tt]=Wt[rt]=Wt[ft]=Wt[st]=Wt[pt]=Wt[ht]=!0,Wt[K]=Wt[V]=Wt[X]=Wt[nt]=Wt[et]=!1;var Ft={"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","Ç":"C","ç":"c","Ð":"D","ð":"d","È":"E","É":"E","Ê":"E","Ë":"E","è":"e","é":"e","ê":"e","ë":"e","Ì":"I","Í":"I","Î":"I","Ï":"I","ì":"i","í":"i","î":"i","ï":"i","Ñ":"N","ñ":"n","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","Ù":"U","Ú":"U","Û":"U","Ü":"U","ù":"u","ú":"u","û":"u","ü":"u","Ý":"Y","ý":"y","ÿ":"y","Æ":"Ae","æ":"ae","Þ":"Th","þ":"th","ß":"ss"},Yt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"},Ht={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'","&#96;":"`"},Gt={"function":!0,object:!0},Zt={0:"x30",1:"x31",2:"x32",3:"x33",4:"x34",5:"x35",6:"x36",7:"x37",8:"x38",9:"x39",A:"x41",B:"x42",C:"x43",D:"x44",E:"x45",F:"x46",a:"x61",b:"x62",c:"x63",d:"x64",e:"x65",f:"x66",n:"x6e",r:"x72",t:"x74",u:"x75",v:"x76",x:"x78"},Kt={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},Vt=Gt[typeof r]&&r&&!r.nodeType&&r,Xt=Gt[typeof n]&&n&&!n.nodeType&&n,Jt=Vt&&Xt&&"object"==typeof t&&t&&t.Object&&t,Qt=Gt[typeof self]&&self&&self.Object&&self,tn=Gt[typeof window]&&window&&window.Object&&window,nn=Xt&&Xt.exports===Vt&&Vt,rn=Jt||tn!==(this&&this.window)&&tn||Qt||this,en=A();"function"==typeof define&&"object"==typeof define.amd&&define.amd?(rn._=en,define(function(){return en})):Vt&&Xt?nn?(Xt.exports=en)._=en:Vt._=en:rn._=en}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],"/srv/zotero/my-publications/src/js/api.js":[function(t,n,r){"use strict";function e(t){return t&&t.__esModule?t:{"default":t}}function o(t,n){if(t){for(var r=[],e={},o=t.length;o--;){var u=t[o];if(u.data&&u.data.abstractNote){var i=u.data.abstractNote.substr(0,n.shortenedAbstractLenght);i=i.substr(0,Math.min(i.length,i.lastIndexOf(" "))),u.data.abstractNoteShort=i}u.data&&u.data.parentItem?(t.splice(o,1),r.push(u)):e[u.key]=u}var a=!0,l=!1,f=void 0;try{for(var s,p=r[Symbol.iterator]();!(a=(s=p.next()).done);a=!0){var u=s.value;e[u.data.parentItem]?(e[u.data.parentItem][c.CHILD_ITEMS_SYMBOL]||(e[u.data.parentItem][c.CHILD_ITEMS_SYMBOL]=[]),e[u.data.parentItem][c.CHILD_ITEMS_SYMBOL].push(u)):console.warn("item "+u.data.key+" has parentItem "+u.data.parentItem+" that does not exist in the dataset")}}catch(h){l=!0,f=h}finally{try{!a&&p["return"]&&p["return"]()}finally{if(l)throw f}}}return t}function u(t,n,r){var e=/<(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*))>;\s*rel="next"/;return r=r||[],new Promise(function(o,i){fetch(t,n).then(function(c){c.status>=200&&c.status<300?c.headers.has("Link")?!function(){var t=c.headers.get("Link").match(e);t&&t.length>=2?c.json().then(function(e){o(u(t[1],n,a["default"].union(r,e)))}):c.json().then(function(t){o(a["default"].union(r,t))})}():c.json().then(function(t){o(a["default"].union(r,t))}):i("Unexpected status code "+c.status+" when requesting "+t)})})}Object.defineProperty(r,"__esModule",{value:!0}),r.processResponse=o,r.fetchUntilExhausted=u;var i=t("lodash"),a=e(i),c=t("./data.js")},{"./data.js":"/srv/zotero/my-publications/src/js/data.js",lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/app.js":[function(t,n,r){"use strict";function e(t){return t&&t.__esModule?t:{"default":t}}function o(t){this.config=i["default"].extend({},this.defaults,t)}var u=t("lodash"),i=e(u),a=t("./render.js"),c=t("./api.js"),l=t("./data.js");o.prototype.defaults={apiBase:"api.zotero.org",limit:100,citationStyle:"apa-annotated-bibliography",include:["data","citation"],shortenedAbstractLenght:250,group:!1,expand:"all"},o.prototype.get=function(t){var n=this.config.apiBase,r=this.config.limit,e=this.config.citationStyle,o=this.config.include.join(","),u="//"+n+"/"+t+"?include="+o+"&limit="+r+"&linkwrap=1&order=dateModified&sort=desc&start=0&style="+e,i={headers:{Accept:"application/json"}};return new Promise(function(t){(0,c.fetchUntilExhausted)(u,i).then(function(n){n=(0,c.processResponse)(n,this.config);var r=new l.ZoteroData(n);"type"===this.config.group&&r.groupByType(this.config.expand),t(r)}.bind(this))}.bind(this))},o.prototype.render=function(t,n){if(t instanceof l.ZoteroData){var r=t;(0,a.renderPublications)(n,r)}else{var e=t;this.get(e).then(i["default"].partial(a.renderPublications,n))}},n.exports=o},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","./data.js":"/srv/zotero/my-publications/src/js/data.js","./render.js":"/srv/zotero/my-publications/src/js/render.js",lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/data.js":[function(t,n,r){"use strict";function e(t){return t&&t.__esModule?t:{"default":t}}function o(t){this.raw=t,this.data=t,this.grouped=a,Object.defineProperty(this,"length",{enumerable:!1,configurable:!1,get:function(){return this.data.length}})}Object.defineProperty(r,"__esModule",{value:!0}),r.ZoteroData=o;var u=t("lodash"),i=e(u),a=0;r.GROUPED_NONE=a;var c=1;r.GROUPED_BY_TYPE=c;var l=2;r.GROUPED_BY_COLLECTION=l;var f=Symbol("childItems");r.CHILD_ITEMS_SYMBOL=f;var s=Symbol("groupExpanded");r.GROUP_EXPANDED_SUMBOL=s,o.prototype.groupByType=function(t){var n={};t=t||[];for(var r=this.raw.length;r--;){var e=this.raw[r];n[e.data.itemType]||(n[e.data.itemType]=[]),n[e.data.itemType].push(e),n[e.data.itemType][s]="all"===t||i["default"].contains(t,e.data.itemType)}this.data=n,this.grouped=c},o.prototype.groupByCollections=function(){throw new Error("groupByCollections is not implemented yet.")},o.prototype[Symbol.iterator]=function(){var t=this,n=0;if(!(this.grouped>0))return{next:function(){return{value:n<this.data.length?this.data[n]:null,done:n++>=this.data.length}}.bind(this)};var r=function(){var r=Object.keys(t.data);return{v:{next:function(){return{value:n<r.length?[r[n],this.data[r[n]]]:null,done:n++>=r.length}}.bind(t)}}}();return"object"==typeof r?r.v:void 0}},{lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/render.js":[function(t,n,r){"use strict";function e(t){return t&&t.__esModule?t:{"default":t}}function o(t,n){return(0,h["default"])({item:t,data:t.data,childItemsMarkup:n||""})}function u(t){var n="",r=!0,e=!1,u=void 0;try{for(var i,c=t[Symbol.iterator]();!(r=(i=c.next()).done);r=!0){var l=i.value,f=a(l);n+=o(l,f)}}catch(s){e=!0,u=s}finally{try{!r&&c["return"]&&c["return"]()}finally{if(e)throw u}}return(0,v["default"])({zoteroItems:n})}function i(t){return(0,j["default"])({item:t})}function a(t){var n="";if(t[O.CHILD_ITEMS_SYMBOL]&&t[O.CHILD_ITEMS_SYMBOL].length>0){var r=!0,e=!1,o=void 0;try{for(var u,a=t[O.CHILD_ITEMS_SYMBOL][Symbol.iterator]();!(r=(u=a.next()).done);r=!0){var c=u.value;n+=i(c)}}catch(l){e=!0,o=l}finally{try{!r&&a["return"]&&a["return"]()}finally{if(e)throw o}}}return(0,w["default"])({childItemsMarkup:n})}function c(t,n,r){return(0,g["default"])({title:t,itemsMarkup:r,expand:n})}function l(t){var n="",r=!0,e=!1,o=void 0;try{for(var i,a=t[Symbol.iterator]();!(r=(i=a.next()).done);r=!0){var l=s(i.value,2),f=l[0],p=l[1],h=u(p),_=p[O.GROUP_EXPANDED_SUMBOL];n+=c(f,_,h)}}catch(v){e=!0,o=v}finally{try{!r&&a["return"]&&a["return"]()}finally{if(e)throw o}}return(0,m["default"])({groupsMarkup:n})}function f(t,n){var r;r=n.grouped>0?l(n)+(0,z["default"])():u(n)+(0,z["default"])(),t.innerHTML=r,(0,I.addHandlers)(t)}Object.defineProperty(r,"__esModule",{value:!0});var s=function(){function t(t,n){var r=[],e=!0,o=!1,u=void 0;try{for(var i,a=t[Symbol.iterator]();!(e=(i=a.next()).done)&&(r.push(i.value),!n||r.length!==n);e=!0);}catch(c){o=!0,u=c}finally{try{!e&&a["return"]&&a["return"]()}finally{if(o)throw u}}return r}return function(n,r){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return t(n,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();r.renderItem=o,r.renderCollection=u,r.renderChildItem=i,r.renderChildItems=a,r.renderGroup=c,r.renderGrouped=l,r.renderPublications=f;var p=t("./tpl/item.tpl"),h=e(p),_=t("./tpl/items.tpl"),v=e(_),d=t("./tpl/group.tpl"),g=e(d),y=t("./tpl/groups.tpl"),m=e(y),b=t("./tpl/child-items.tpl"),w=e(b),x=t("./tpl/child-item.tpl"),j=e(x),A=t("./tpl/branding.tpl"),z=e(A),I=t("./ui.js"),O=t("./data.js")},{"./data.js":"/srv/zotero/my-publications/src/js/data.js","./tpl/branding.tpl":"/srv/zotero/my-publications/src/js/tpl/branding.tpl","./tpl/child-item.tpl":"/srv/zotero/my-publications/src/js/tpl/child-item.tpl","./tpl/child-items.tpl":"/srv/zotero/my-publications/src/js/tpl/child-items.tpl","./tpl/group.tpl":"/srv/zotero/my-publications/src/js/tpl/group.tpl","./tpl/groups.tpl":"/srv/zotero/my-publications/src/js/tpl/groups.tpl","./tpl/item.tpl":"/srv/zotero/my-publications/src/js/tpl/item.tpl","./tpl/items.tpl":"/srv/zotero/my-publications/src/js/tpl/items.tpl","./ui.js":"/srv/zotero/my-publications/src/js/ui.js"}],"/srv/zotero/my-publications/src/js/tpl/branding.tpl":[function(require,module,exports){require("lodash");module.exports=function(obj){var __p="";Array.prototype.join;with(obj||{})__p+='<div class="zotero-branding">\n	Powered by Zotero\n</div>';return __p}},{lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/tpl/child-item.tpl":[function(require,module,exports){var _=require("lodash");module.exports=function(obj){var __t,__p="";Array.prototype.join;with(obj||{})__p+="<li>\n	"+(null==(__t=item.data.key)?"":_.escape(__t))+": "+(null==(__t=item.data.itemType)?"":_.escape(__t))+" \n</li>";return __p}},{lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/tpl/child-items.tpl":[function(require,module,exports){require("lodash");module.exports=function(obj){var __t,__p="";Array.prototype.join;with(obj||{})__p+='<ul class="zotero-child-items">\n	'+(null==(__t=childItemsMarkup)?"":__t)+"\n</ul>";return __p}},{lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/tpl/group.tpl":[function(require,module,exports){var _=require("lodash");module.exports=function(obj){var __t,__p="";Array.prototype.join;with(obj||{})__p+='<li class="zotero-group'+(null==(__t=expand?" zotero-group-expanded":"")?"":_.escape(__t))+'" aria-expanded="'+(null==(__t=expand?" true":"false")?"":_.escape(__t))+'" >\n	<h3 class="zotero-group-title">'+(null==(__t=title)?"":_.escape(__t))+"</h3>\n	"+(null==(__t=itemsMarkup)?"":__t)+"\n</li>";return __p}},{lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/tpl/groups.tpl":[function(require,module,exports){require("lodash");module.exports=function(obj){var __t,__p="";Array.prototype.join;with(obj||{})__p+='<ul class="zotero-groups">\n	'+(null==(__t=groupsMarkup)?"":__t)+"\n</ul>";return __p}},{lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/tpl/item.tpl":[function(require,module,exports){var _=require("lodash");module.exports=function(obj){var __t,__p="";Array.prototype.join;with(obj||{})__p+='<li class="zotero-item zotero-'+(null==(__t=data.itemType)?"":_.escape(__t))+'">\n	'+(null==(__t=item.citation)?"":__t)+"\n	",data.abstractNoteShort&&data.abstractNoteShort.length&&(__p+='\n    	<p class="zotero-abstract-short">\n    		'+(null==(__t=data.abstractNoteShort)?"":_.escape(__t))+'\n    		<a class="zotero-abstract-toggle" aria-controls="za-'+(null==(__t=item.key)?"":_.escape(__t))+'">...</a>\n    	</p>\n	'),__p+="\n	",data.abstractNote&&data.abstractNote.length&&(__p+='\n    	<p id="za-'+(null==(__t=item.key)?"":_.escape(__t))+'" class="zotero-abstract" aria-expanded="false">\n    		'+(null==(__t=data.abstractNote)?"":_.escape(__t))+'\n    		<a class="zotero-abstract-toggle">...</a>\n    	</p>\n	'),__p+="\n    "+(null==(__t=childItemsMarkup)?"":__t)+"\n</li>";return __p}},{lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/tpl/items.tpl":[function(require,module,exports){require("lodash");module.exports=function(obj){var __t,__p="";Array.prototype.join;with(obj||{})__p+='<ul class="zotero-items">\n	'+(null==(__t=zoteroItems)?"":__t)+"\n</ul>";return __p}},{lodash:"/srv/zotero/my-publications/node_modules/lodash/index.js"}],"/srv/zotero/my-publications/src/js/ui.js":[function(t,n,r){"use strict";function e(t){t.addEventListener("click",function(t){if(console.info(t),t.target.classList.contains("zotero-abstract-toggle")){var n=t.target.parentNode.parentNode.querySelector(".zotero-abstract-short"),r=t.target.parentNode.parentNode.querySelector(".zotero-abstract"),e=n.classList.toggle("zotero-abstract-expanded");r.setAttribute("aria-expanded",e?"true":"false")}if(t.target.classList.contains("zotero-group-title")){var o=t.target.parentNode,e=o.classList.toggle("zotero-group-expanded");o.setAttribute("aria-expanded",e?"true":"false")}})}Object.defineProperty(r,"__esModule",{value:!0}),r.addHandlers=e},{}]},{},["/srv/zotero/my-publications/src/js/app.js"])("/srv/zotero/my-publications/src/js/app.js")});