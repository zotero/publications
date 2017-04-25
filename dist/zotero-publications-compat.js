(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ZoteroPublications = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    // This invoke function is written in a style that assumes some
    // calling function (or Promise) will handle exceptions.
    function invoke(method, arg) {
      var result = generator[method](arg);
      var value = result.value;
      return value instanceof AwaitArgument
        ? Promise.resolve(value.arg).then(invokeNext, invokeThrow)
        : Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration. If the Promise is rejected, however, the
            // result for this iteration will be rejected with the same
            // reason. Note that rejections of yielded Promises are not
            // thrown back into the generator function, as is the case
            // when an awaited Promise is rejected. This difference in
            // behavior between yield and await is important, because it
            // allows the consumer to decide what to do with the yielded
            // rejection (swallow it and continue, manually .throw it back
            // into the generator, abandon iteration, whatever). With
            // await, by contrast, there is no opportunity to examine the
            // rejection reason outside the generator function, so the
            // only option is to throw it from the await expression, and
            // let the generator function handle the exception.
            result.value = unwrapped;
            return result;
          });
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var invokeNext = invoke.bind(generator, "next");
    var invokeThrow = invoke.bind(generator, "throw");
    var invokeReturn = invoke.bind(generator, "return");
    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return invoke(method, arg);
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : new Promise(function (resolve) {
          resolve(callInvokeWithMethodAndArg());
        });
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          context._sent = arg;

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":92}],2:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'select'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = document.body.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.addEventListener('focus', window.scrollTo(0, yPosition));
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                document.body.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    document.body.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    document.body.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.target) {
                    this.target.blur();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});
},{"select":93}],3:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './clipboard-action', 'tiny-emitter', 'good-listener'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});
},{"./clipboard-action":2,"good-listener":90,"tiny-emitter":94}],4:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":12,"../modules/es6.object.to-string":64,"../modules/es6.promise":65,"../modules/es6.string.iterator":66,"../modules/web.dom.iterable":67}],5:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],6:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./_hide":23,"./_wks":61}],7:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],8:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":29}],9:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":54,"./_to-iobject":56,"./_to-length":57}],10:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":11,"./_wks":61}],11:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],12:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],13:[function(require,module,exports){
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
},{"./_a-function":5}],14:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],15:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":19}],16:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":21,"./_is-object":29}],17:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],18:[function(require,module,exports){
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
    if(target)redefine(target, key, out, type & $export.U);
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
},{"./_core":12,"./_ctx":13,"./_global":21,"./_hide":23,"./_redefine":46}],19:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],20:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":8,"./_ctx":13,"./_is-array-iter":28,"./_iter-call":30,"./_to-length":57,"./core.get-iterator-method":62}],21:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],22:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],23:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":15,"./_object-dp":39,"./_property-desc":44}],24:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":21}],25:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":15,"./_dom-create":16,"./_fails":19}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":11}],28:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":35,"./_wks":61}],29:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],30:[function(require,module,exports){
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
},{"./_an-object":8}],31:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":23,"./_object-create":38,"./_property-desc":44,"./_set-to-string-tag":48,"./_wks":61}],32:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
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
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
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
},{"./_export":18,"./_has":22,"./_hide":23,"./_iter-create":31,"./_iterators":35,"./_library":36,"./_object-gpo":41,"./_redefine":46,"./_set-to-string-tag":48,"./_wks":61}],33:[function(require,module,exports){
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
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":61}],34:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],35:[function(require,module,exports){
module.exports = {};
},{}],36:[function(require,module,exports){
module.exports = false;
},{}],37:[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
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
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
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

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"./_cof":11,"./_global":21,"./_task":53}],38:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":8,"./_dom-create":16,"./_enum-bug-keys":17,"./_html":24,"./_object-dps":40,"./_shared-key":49}],39:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":8,"./_descriptors":15,"./_ie8-dom-define":25,"./_to-primitive":59}],40:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":8,"./_descriptors":15,"./_object-dp":39,"./_object-keys":43}],41:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":22,"./_shared-key":49,"./_to-object":58}],42:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":9,"./_has":22,"./_shared-key":49,"./_to-iobject":56}],43:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":17,"./_object-keys-internal":42}],44:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],45:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function(target, src, safe){
  for(var key in src)redefine(target, key, src[key], safe);
  return target;
};
},{"./_redefine":46}],46:[function(require,module,exports){
var global    = require('./_global')
  , hide      = require('./_hide')
  , has       = require('./_has')
  , SRC       = require('./_uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)has(val, 'name') || hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
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
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./_core":12,"./_global":21,"./_has":22,"./_hide":23,"./_uid":60}],47:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_descriptors":15,"./_global":21,"./_object-dp":39,"./_wks":61}],48:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":22,"./_object-dp":39,"./_wks":61}],49:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":50,"./_uid":60}],50:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":21}],51:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":5,"./_an-object":8,"./_wks":61}],52:[function(require,module,exports){
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
},{"./_defined":14,"./_to-integer":55}],53:[function(require,module,exports){
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
var listener = function(event){
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
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
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
},{"./_cof":11,"./_ctx":13,"./_dom-create":16,"./_global":21,"./_html":24,"./_invoke":26}],54:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":55}],55:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],56:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":14,"./_iobject":27}],57:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":55}],58:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":14}],59:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":29}],60:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],61:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":21,"./_shared":50,"./_uid":60}],62:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":10,"./_core":12,"./_iterators":35,"./_wks":61}],63:[function(require,module,exports){
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
},{"./_add-to-unscopables":6,"./_iter-define":32,"./_iter-step":34,"./_iterators":35,"./_to-iobject":56}],64:[function(require,module,exports){
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
},{"./_classof":10,"./_redefine":46,"./_wks":61}],65:[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
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
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
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
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
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
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
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
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
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
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
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
},{"./_a-function":5,"./_an-instance":7,"./_classof":10,"./_core":12,"./_ctx":13,"./_export":18,"./_for-of":20,"./_global":21,"./_is-object":29,"./_iter-detect":33,"./_library":36,"./_microtask":37,"./_redefine-all":45,"./_set-species":47,"./_set-to-string-tag":48,"./_species-constructor":51,"./_task":53,"./_wks":61}],66:[function(require,module,exports){
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
},{"./_iter-define":32,"./_string-at":52}],67:[function(require,module,exports){
var $iterators    = require('./es6.array.iterator')
  , redefine      = require('./_redefine')
  , global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , wks           = require('./_wks')
  , ITERATOR      = wks('iterator')
  , TO_STRING_TAG = wks('toStringTag')
  , ArrayValues   = Iterators.Array;

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
  }
}
},{"./_global":21,"./_hide":23,"./_iterators":35,"./_redefine":46,"./_wks":61,"./es6.array.iterator":63}],68:[function(require,module,exports){
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

},{"es5-ext/object/assign":72,"es5-ext/object/is-callable":75,"es5-ext/object/normalize-options":79,"es5-ext/string/#/contains":81}],69:[function(require,module,exports){
var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (Element && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (element.matches(selector)) return element;
        element = element.parentNode;
    }
}

module.exports = closest;

},{}],70:[function(require,module,exports){
var closest = require('./closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"./closest":69}],71:[function(require,module,exports){
'use strict';

module.exports = new Function("return this")();

},{}],72:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":73,"./shim":74}],73:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],74:[function(require,module,exports){
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

},{"../keys":76,"../valid-value":80}],75:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],76:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":77,"./shim":78}],77:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],78:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],79:[function(require,module,exports){
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

},{}],80:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],81:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":82,"./shim":83}],82:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],83:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],84:[function(require,module,exports){
'use strict';

if (!require('./is-implemented')()) {
	Object.defineProperty(require('es5-ext/global'), 'Symbol',
		{ value: require('./polyfill'), configurable: true, enumerable: false,
			writable: true });
}

},{"./is-implemented":85,"./polyfill":87,"es5-ext/global":71}],85:[function(require,module,exports){
'use strict';

var validTypes = { object: true, symbol: true };

module.exports = function () {
	var symbol;
	if (typeof Symbol !== 'function') return false;
	symbol = Symbol('test symbol');
	try { String(symbol); } catch (e) { return false; }

	// Return 'true' also for polyfills
	if (!validTypes[typeof Symbol.iterator]) return false;
	if (!validTypes[typeof Symbol.toPrimitive]) return false;
	if (!validTypes[typeof Symbol.toStringTag]) return false;

	return true;
};

},{}],86:[function(require,module,exports){
'use strict';

module.exports = function (x) {
	if (!x) return false;
	if (typeof x === 'symbol') return true;
	if (!x.constructor) return false;
	if (x.constructor.name !== 'Symbol') return false;
	return (x[x.constructor.toStringTag] === 'Symbol');
};

},{}],87:[function(require,module,exports){
// ES2015 Symbol polyfill for environments that do not support it (or partially support it)

'use strict';

var d              = require('d')
  , validateSymbol = require('./validate-symbol')

  , create = Object.create, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null)
  , isNativeSafe;

if (typeof Symbol === 'function') {
	NativeSymbol = Symbol;
	try {
		String(NativeSymbol());
		isNativeSafe = true;
	} catch (ignore) {}
}

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
	if (isNativeSafe) return NativeSymbol(description);
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
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('', function () {
	var symbol = validateSymbol(this);
	if (typeof symbol === 'symbol') return symbol;
	return symbol.toString();
}));
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

},{"./validate-symbol":88,"d":68}],88:[function(require,module,exports){
'use strict';

var isSymbol = require('./is-symbol');

module.exports = function (value) {
	if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
	return value;
};

},{"./is-symbol":86}],89:[function(require,module,exports){
/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};

},{}],90:[function(require,module,exports){
var is = require('./is');
var delegate = require('delegate');

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;

},{"./is":89,"delegate":70}],91:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":95}],92:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],93:[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        element.focus();
        element.setSelectionRange(0, element.value.length);

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;

},{}],94:[function(require,module,exports){
function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],95:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
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

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
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
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
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
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
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
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
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

    if (input instanceof Request) {
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
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
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
    return new Request(this, { body: this._bodyInit })
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

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
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

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
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

},{}],96:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.processResponse = processResponse;
exports.fetchUntilExhausted = fetchUntilExhausted;

require('es6-symbol/implement');

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils.js');

var _constants = require('./constants.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Process raw API response
 * @param  {Object[]} response - The raw API response
 * @param  {Object} config     - Global ZoteroPublications config
 * @return {Object[]}          - Processed API response
 */
function processResponse(response) {
	if (response) {
		var childItems = [];
		var index = {};

		var _loop = function _loop(i) {
			var item = response[i];
			if (item.data && item.data.abstractNote) {
				item.data[_constants.ABSTRACT_NOTE_PROCESSED] = (0, _utils.formatAbstract)(item.data.abstractNote);
			}
			if (item.data && item.data.creators) {
				item.data[_constants.AUTHORS_SYMBOL] = {};

				item.data.creators.forEach(function (author) {
					var name = author.firstName && author.lastName ? author.firstName + ' ' + author.lastName : author.name;
					var type = author.creatorType.charAt(0).toUpperCase() + author.creatorType.slice(1);

					if (!item.data[_constants.AUTHORS_SYMBOL][type]) {
						item.data[_constants.AUTHORS_SYMBOL][type] = [];
					}

					item.data[_constants.AUTHORS_SYMBOL][type].push(name);
				});
			}
			if (item.data && item.meta.parsedDate) {
				item.data[_constants.FORMATTED_DATE_SYMBOL] = (0, _utils.formatDate)(item.meta.parsedDate);
			}
			if (item.data && item.data.parentItem) {
				response.splice(i, 1);
				childItems.push(item);
			}
			index[item.key] = item;
		};

		for (var i = response.length; i--;) {
			_loop(i);
		}

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = childItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _item = _step.value;

				if (!(_item.data.parentItem in index)) {
					continue;
				}
				if (_item.data.itemType === 'note') {
					if (!index[_item.data.parentItem][_constants.CHILD_NOTES]) {
						index[_item.data.parentItem][_constants.CHILD_NOTES] = [];
					}
					index[_item.data.parentItem][_constants.CHILD_NOTES].push(_item);
				} else if (_item.data.itemType === 'attachment') {
					if (!index[_item.data.parentItem][_constants.CHILD_ATTACHMENTS]) {
						index[_item.data.parentItem][_constants.CHILD_ATTACHMENTS] = [];
					}
					var parsedAttachment = {};
					if (_item.links && _item.links.enclosure) {
						parsedAttachment = {
							url: _item.links.enclosure.href || _item.data.url,
							type: _item.links.enclosure.type || _item.data.contentType,
							title: _item.links.enclosure.title || _item.data.title,
							key: _item.key,
							item: _item
						};
					} else {
						parsedAttachment = {
							url: _item.data.url,
							type: _item.data.contentType,
							title: _item.data.title,
							key: _item.key,
							item: _item
						};
					}

					if (parsedAttachment.title || parsedAttachment.url) {
						index[_item.data.parentItem][_constants.CHILD_ATTACHMENTS].push(parsedAttachment);
					}
				} else {
					if (!index[_item.data.parentItem][_constants.CHILD_OTHER]) {
						index[_item.data.parentItem][_constants.CHILD_OTHER] = [];
					}
					index[_item.data.parentItem][_constants.CHILD_OTHER].push(_item);
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

		for (var i = response.length; i--;) {
			var _item2 = response[i];
			if (_item2[_constants.CHILD_ATTACHMENTS]) {
				_item2[_constants.CHILD_ATTACHMENTS].sort(function (a, b) {
					return new Date(a.item.data.dateAdded).getTime() - new Date(b.item.data.dateAdded).getTime();
				});
			}
			if (_item2[_constants.CHILD_ATTACHMENTS]) {
				_item2[_constants.VIEW_ONLINE_URL] = _item2[_constants.CHILD_ATTACHMENTS][0].url;
				if (_item2[_constants.CHILD_ATTACHMENTS][0].type === 'application/pdf') {
					_item2[_constants.HAS_PDF] = true;
				}
			} else if (_item2.data && _item2.data.url) {
				_item2[_constants.VIEW_ONLINE_URL] = _item2.data.url;
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
				response.json().then(function (jsonDataPart) {
					if (!(jsonDataPart instanceof Array)) {
						jsonDataPart = [jsonDataPart];
					}
					if (response.headers.has('Link')) {
						var matches = response.headers.get('Link').match(relRegex);
						if (matches && matches.length >= 2) {
							resolve(fetchUntilExhausted(matches[1], options, _lodash2.default.union(jsondata, jsonDataPart)));
						} else {
							resolve(_lodash2.default.union(jsondata, jsonDataPart));
						}
					} else {
						resolve(_lodash2.default.union(jsondata, jsonDataPart));
					}
				});
			} else {
				reject(new Error('Unexpected status code ' + response.status + ' when requesting ' + url));
			}
		}).catch(function () {
			reject(new Error('Unexpected error when requesting ' + url));
		});
	});
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./constants.js":97,"./utils.js":116,"es6-symbol/implement":84}],97:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var GROUPED_NONE = exports.GROUPED_NONE = 0;
var GROUPED_BY_TYPE = exports.GROUPED_BY_TYPE = 1;
var GROUPED_BY_COLLECTION = exports.GROUPED_BY_COLLECTION = 2;
var CHILD_NOTES = exports.CHILD_NOTES = Symbol.for('childNotes');
var CHILD_ATTACHMENTS = exports.CHILD_ATTACHMENTS = Symbol.for('childAttachments');
var CHILD_OTHER = exports.CHILD_OTHER = Symbol.for('childOther');
var GROUP_EXPANDED_SUMBOL = exports.GROUP_EXPANDED_SUMBOL = Symbol.for('groupExpanded');
var GROUP_TITLE = exports.GROUP_TITLE = Symbol.for('groupTitle');
var VIEW_ONLINE_URL = exports.VIEW_ONLINE_URL = Symbol.for('viewOnlineUrl');
var ABSTRACT_NOTE_PROCESSED = exports.ABSTRACT_NOTE_PROCESSED = Symbol.for('abstractNoteProcessed');
var AUTHORS_SYMBOL = exports.AUTHORS_SYMBOL = Symbol.for('authors');
var FORMATTED_DATE_SYMBOL = exports.FORMATTED_DATE_SYMBOL = Symbol.for('formattedDate');
var HAS_PDF = exports.HAS_PDF = Symbol.for('hasPdf');

},{}],98:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = ZoteroData;

require('es6-symbol/implement');

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _api = require('./api.js');

var _constants = require('./constants.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Store, Encapsulate and Manipulate Zotero API data
 * @param {Object[]} data   - Zotero API data to encapsulate
 * @param {Object} [config] - ZoteroPublications config
 */
function ZoteroData(data, config) {
	var _this = this;

	this.raw = this.data = (0, _api.processResponse)(data, config);
	this.grouped = _constants.GROUPED_NONE;

	Object.defineProperty(this, 'length', {
		enumerable: false,
		configurable: false,
		get: function get() {
			return _this.raw.length || 0;
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
		groupedData[item.data.itemType][_constants.GROUP_EXPANDED_SUMBOL] = expand === 'all' || _lodash2.default.includes(expand, item.data.itemType);
	}
	this.data = groupedData;
	this.grouped = _constants.GROUPED_BY_TYPE;
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
ZoteroData.prototype[Symbol.iterator] = regeneratorRuntime.mark(function _callee() {
	var keys, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, group, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, value;

	return regeneratorRuntime.wrap(function _callee$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					if (!this.grouped) {
						_context.next = 32;
						break;
					}

					keys = Object.keys(this.data).sort();
					_iteratorNormalCompletion = true;
					_didIteratorError = false;
					_iteratorError = undefined;
					_context.prev = 5;
					_iterator = keys[Symbol.iterator]();

				case 7:
					if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
						_context.next = 16;
						break;
					}

					key = _step.value;
					group = this.data[key];

					group[_constants.GROUP_TITLE] = key;
					_context.next = 13;
					return group;

				case 13:
					_iteratorNormalCompletion = true;
					_context.next = 7;
					break;

				case 16:
					_context.next = 22;
					break;

				case 18:
					_context.prev = 18;
					_context.t0 = _context['catch'](5);
					_didIteratorError = true;
					_iteratorError = _context.t0;

				case 22:
					_context.prev = 22;
					_context.prev = 23;

					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}

				case 25:
					_context.prev = 25;

					if (!_didIteratorError) {
						_context.next = 28;
						break;
					}

					throw _iteratorError;

				case 28:
					return _context.finish(25);

				case 29:
					return _context.finish(22);

				case 30:
					_context.next = 58;
					break;

				case 32:
					_iteratorNormalCompletion2 = true;
					_didIteratorError2 = false;
					_iteratorError2 = undefined;
					_context.prev = 35;
					_iterator2 = this.data[Symbol.iterator]();

				case 37:
					if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
						_context.next = 44;
						break;
					}

					value = _step2.value;
					_context.next = 41;
					return value;

				case 41:
					_iteratorNormalCompletion2 = true;
					_context.next = 37;
					break;

				case 44:
					_context.next = 50;
					break;

				case 46:
					_context.prev = 46;
					_context.t1 = _context['catch'](35);
					_didIteratorError2 = true;
					_iteratorError2 = _context.t1;

				case 50:
					_context.prev = 50;
					_context.prev = 51;

					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}

				case 53:
					_context.prev = 53;

					if (!_didIteratorError2) {
						_context.next = 56;
						break;
					}

					throw _iteratorError2;

				case 56:
					return _context.finish(53);

				case 57:
					return _context.finish(50);

				case 58:
				case 'end':
					return _context.stop();
			}
		}
	}, _callee, this, [[5, 18, 22, 30], [23,, 25, 29], [35, 46, 50, 58], [51,, 53, 57]]);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api.js":96,"./constants.js":97,"es6-symbol/implement":84}],99:[function(require,module,exports){
(function (global){
'use strict';

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _renderer = require('./renderer.js');

var _renderer2 = _interopRequireDefault(_renderer);

var _export = require('./tpl/partial/export.tpl');

var _export2 = _interopRequireDefault(_export);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Constructor for the Dom Wrapper
 * Dom Wrapper's function is to place rendered Zotero Publications
 * into a DOM container and handle events
 * @param {HTMLElement} container				- A container where contents is rendered
 * @param {ZoteroPublications} [zotero]			- ZoteroPublications object
 */
function DomWrapper(container, zotero) {
	this.container = container;
	this.zotero = zotero;
	this.config = zotero.config;
	this.renderer = new _renderer2.default(zotero);
	if (this.config.storeCitationPreference) {
		this.preferredCitationStyle = localStorage.getItem('zotero-citation-preference');
	} else {
		this.preferredCitationStyle = '';
	}
	this.toggleSpinner(true);
}

/**
 * Render Zotero publications into a DOM element
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
DomWrapper.prototype.displayPublications = function (data) {
	var markup;

	this.renderer.data = this.data = data;

	if (data.grouped > 0) {
		markup = this.renderer.renderGroupView(data);
	} else {
		markup = this.renderer.renderPlainView(data);
	}

	this.container.innerHTML = markup;
	this.toggleSpinner(false);
	this.previous = markup;
	this.addHandlers();
	this.updateVisuals();
};

/**
 * Update citation and store preference in memory/local storage
 * depending on configuration
 * @param  {HTMLElement} itemEl 		- dom element containing the item
 * @param  {String} citationStyle 		- optionally set the citation style
 */
DomWrapper.prototype.updateCitation = function (itemEl, citationStyle) {
	var _this = this;

	var itemId = itemEl.getAttribute('data-item');
	var citationEl = itemEl.querySelector('.zotero-citation');
	var citationStyleSelectEl = itemEl.querySelector('[data-trigger="cite-style-selection"]');

	if (citationStyle) {
		citationStyleSelectEl.value = citationStyle;
	} else {
		citationStyle = citationStyleSelectEl.options[citationStyleSelectEl.selectedIndex].value;
	}

	this.preferredCitationStyle = citationStyle;
	if (this.config.storeCitationPreference) {
		localStorage.setItem('zotero-citation-preference', citationStyle);
	}

	citationEl.innerHTML = '';
	citationEl.classList.add('zotero-loading-inline');

	return new Promise(function (resolve, reject) {
		_this.zotero.getPublication(itemId, _this.zotero.userId, {
			'style': citationStyle,
			'include': ['bib'],
			'group': false
		}).then(function (item) {
			citationEl.classList.remove('zotero-loading-inline');
			citationEl.innerHTML = item.raw[0].bib;
			resolve();
		}).catch(reject);
	});
};

/**
 * Prepare a link for downloading item export
 * @param {HTMLElement} [itemEl] - dom element containing the item
 */
DomWrapper.prototype.prepareExport = function (itemEl) {
	var _this2 = this;

	var itemId = itemEl.getAttribute('data-item');
	var exportEl = itemEl.querySelector('.zotero-export');
	var exportFormatSelectEl = itemEl.querySelector('[data-trigger="export-format-selection"]');
	var exportFormat = exportFormatSelectEl.options[exportFormatSelectEl.selectedIndex].value;

	exportEl.innerHTML = '';
	exportEl.classList.add('zotero-loading-inline');

	this.zotero.getPublication(itemId, this.zotero.userId, {
		'include': [exportFormat],
		'group': false
	}).then(function (item) {
		var itemData = (_lodash2.default.findWhere || _lodash2.default.find)(_this2.data.raw, { 'key': itemId });
		var encoded = window.btoa(unescape(encodeURIComponent(item.raw[0][exportFormat])));
		exportEl.classList.remove('zotero-loading-inline');
		exportEl.innerHTML = (0, _export2.default)({
			'filename': itemData.data.title + '.' + _this2.zotero.config.exportFormats[exportFormat].extension,
			'content': encoded,
			'contentType': _this2.zotero.config.exportFormats[exportFormat].contentType
		});
	});
};

/**
 * Attach interaction handlers
 */
DomWrapper.prototype.addHandlers = function () {
	var _this3 = this;

	var clipboard = new _clipboard2.default('.zotero-citation-copy');

	clipboard.on('success', function (e) {
		e.clearSelection();
		e.trigger.setAttribute('aria-label', 'Copied!');
	});

	clipboard.on('error', function (e) {
		e.trigger.setAttribute('aria-label', (0, _utils.clipboardFallbackMessage)(e.action));
	});

	this.container.addEventListener('mouseout', function (ev) {
		if (ev.target.classList.contains('zotero-citation-copy')) {
			ev.target.blur();
			ev.target.setAttribute('aria-label', 'Copy to clipboard');
		}
	});

	this.container.addEventListener('click', function (ev) {
		var target;

		target = (0, _utils.closest)(ev.target, function (el) {
			return el.hasAttribute && el.hasAttribute('data-trigger');
		});

		if (target) {
			ev.preventDefault();
			var itemEl = (0, _utils.closest)(target, function (el) {
				return el.hasAttribute && el.hasAttribute('data-item');
			});
			if (target.getAttribute('data-trigger') === 'details') {
				_this3.toggleDetails(itemEl);
			} else if (target.getAttribute('data-trigger') === 'cite' || target.getAttribute('data-trigger') === 'export') {
				(0, _utils.showTab)(target);
			} else if (target.getAttribute('data-trigger') === 'add-to-library') {
				if (_this3.zotero.config.zorgIntegration) {
					_this3.saveToMyLibrary(target, itemEl);
				}
			} else if (target.getAttribute('data-trigger') === 'expand-authors') {
				var creatorsEl = (0, _utils.closest)(target, function (el) {
					return el.classList.contains('zotero-creators');
				});
				creatorsEl.classList.add('zotero-creators-expanded');
				target.parentNode.removeChild(target);
			}
		}
	});

	this.container.addEventListener('change', function (ev) {
		var target = (0, _utils.closest)(ev.target, function (el) {
			return el.hasAttribute && el.hasAttribute('data-trigger');
		});
		var itemEl = (0, _utils.closest)(target, function (el) {
			return el.hasAttribute && el.hasAttribute('data-item');
		});
		if (target.getAttribute('data-trigger') === 'cite-style-selection') {
			_this3.updateCitation(itemEl);
		} else if (target.getAttribute('data-trigger') === 'export-format-selection') {
			_this3.prepareExport(itemEl);
		}
	});

	window.addEventListener('resize', _lodash2.default.debounce(this.updateVisuals).bind(this));
};

/**
 * Update .zotero-line to align with left border of the screen on small
 * devices, provided that the container is no more than 30px from the
 * border (and no less than 4px required for the actual line and 1px space)
 */
DomWrapper.prototype.updateVisuals = function () {
	var _this4 = this;

	if (!this.zoteroLines) {
		this.zoteroLines = this.container.querySelectorAll('.zotero-line');
	}

	_lodash2.default.each(this.zoteroLines, function (zoteroLineEl) {
		var offset = _this4.container.offsetLeft * -1 + 'px';
		if (window.innerWidth < 768 && _this4.container.offsetLeft <= 30 && _this4.container.offsetLeft > 3) {
			zoteroLineEl.style.left = offset;
		} else {
			zoteroLineEl.style.left = null;
		}
	});
};

/**
 * Toggle CSS class that gives a visual loading feedback. Optionally allows to explicetly specify
 * whether to display or hide visual feedback.
 * @param  {boolean} [activate]    - Explicitely indicate whether to add or remove visual feedback
 */
DomWrapper.prototype.toggleSpinner = function (activate) {
	var method = activate === null ? this.container.classList.toggle : activate ? this.container.classList.add : this.container.classList.remove;
	method.call(this.container.classList, 'zotero-loading');
};

/**
 * Expand (if collapsed) or collapse (if expanded) item details. Optionally override to force
 * either expand or collapse
 * @param  {HTMLElement} itemEl 	- DOM element where item is
 * @param  {boolean} override 		- override whether to expand or collapse details
 */
DomWrapper.prototype.toggleDetails = function (itemEl, override) {
	var detailsEl = itemEl.querySelector('.zotero-details');
	if (detailsEl) {
		var expanded = (0, _utils.toggleCollapse)(detailsEl, override);
		if (expanded) {
			itemEl.classList.add('zotero-details-open');
			if (this.zotero.userId) {
				this.prepareExport(itemEl);
				this.updateCitation(itemEl, this.preferredCitationStyle);
			}
		} else {
			itemEl.classList.remove('zotero-details-open');
		}
	}
	if (this.config.useHistory) {
		window.history.pushState(null, null, '#' + itemEl.getAttribute('data-item'));
	}
};

/**
 * Expand item details based on the item id.
 * @param  {string} itemId
 */
DomWrapper.prototype.expandDetails = function (itemId) {
	var _this5 = this;

	return new Promise(function (resolve) {
		var itemEl = _this5.container.querySelector('[id=item-' + itemId + ']');
		_this5.toggleDetails(itemEl, true);
		(0, _utils.onTransitionEnd)(itemEl, function () {
			itemEl.scrollIntoView();
			resolve();
		}, 500);
	});
};

/**
 * On Zotero.org adds item to currently logged-in user's library
 * @param  {HTMLElement} triggerEl 	- DOM Element that triggered saving, usually a button
 * @param  {HTMLElement} itemEl 	- DOM element where the item is located
 */
DomWrapper.prototype.saveToMyLibrary = function (triggerEl, itemEl) {
	var replacementEl = document.createElement('span');
	replacementEl.innerText = 'Adding...';
	triggerEl.parentNode.replaceChild(replacementEl, triggerEl);
	var itemId = itemEl.getAttribute('data-item');
	var sourceItem = (_lodash2.default.findWhere || _lodash2.default.find)(this.data.raw, { 'key': itemId });
	var clonedItem = {};
	var ignoredFields = ['mimeType', 'linkMode', 'charset', 'md5', 'mtime', 'version', 'key', 'collections', 'parentItem', 'contentType', 'filename', 'tags', 'dateAdded', 'dateModified'];

	_lodash2.default.forEach(sourceItem.data, function (value, key) {
		if (!_lodash2.default.includes(ignoredFields, key)) {
			clonedItem[key] = value;
		}
	});

	if (!clonedItem.relations) {
		clonedItem.relations = {};
	}
	clonedItem.relations = {
		'owl:sameAs': 'http://zotero.org/users/' + sourceItem.library.id + '/publications/items/' + itemId
	};

	var writePromise = this.zotero.postItems(this.zotero.config.zorgIntegration.userID, [clonedItem], { key: this.zotero.config.zorgIntegration.apiKey });

	return new Promise(function (resolve, reject) {
		writePromise.then(function () {
			replacementEl.innerText = 'Added.';
			resolve();
		});
		writePromise.catch(function (err) {
			replacementEl.innerText = 'Error!';
			setTimeout(function () {
				replacementEl.parentNode.replaceChild(triggerEl, replacementEl);
			}, 2000);
			reject(err);
		});
	});
};

module.exports = DomWrapper;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./renderer.js":104,"./tpl/partial/export.tpl":107,"./utils.js":116,"clipboard":3}],100:[function(require,module,exports){
'use strict';

/**
 * Map of property identifiers to user friendly names
 * @type {Object}
 */
module.exports = {
	'itemType': 'Item Type',
	'title': 'Title',
	'dateAdded': 'Date Added',
	'dateModified': 'Date Modified',
	'source': 'Source',
	'notes': 'Notes',
	'tags': 'Tags',
	'attachments': 'Attachments',
	'related': 'Related',
	'url': 'URL',
	'rights': 'Rights',
	'series': 'Series',
	'volume': 'Volume',
	'issue': 'Issue',
	'edition': 'Edition',
	'place': 'Place',
	'publisher': 'Publisher',
	'pages': 'Pages',
	'ISBN': 'ISBN',
	'publicationTitle': 'Publication',
	'ISSN': 'ISSN',
	'date': 'Date',
	'year': 'Year',
	'section': 'Section',
	'callNumber': 'Call Number',
	'archive': 'Archive',
	'archiveLocation': 'Loc. in Archive',
	'libraryCatalog': 'Library Catalog',
	'distributor': 'Distributor',
	'extra': 'Extra',
	'journalAbbreviation': 'Journal Abbr',
	'DOI': 'DOI',
	'accessDate': 'Accessed',
	'seriesTitle': 'Series Title',
	'seriesText': 'Series Text',
	'seriesNumber': 'Series Number',
	'institution': 'Institution',
	'reportType': 'Report Type',
	'code': 'Code',
	'session': 'Session',
	'legislativeBody': 'Legislative Body',
	'history': 'History',
	'reporter': 'Reporter',
	'court': 'Court',
	'numberOfVolumes': '# of Volumes',
	'committee': 'Committee',
	'assignee': 'Assignee',
	'patentNumber': 'Patent Number',
	'priorityNumbers': 'Priority Numbers',
	'issueDate': 'Issue Date',
	'references': 'References',
	'legalStatus': 'Legal Status',
	'codeNumber': 'Code Number',
	'artworkMedium': 'Medium',
	'number': 'Number',
	'artworkSize': 'Artwork Size',
	'repository': 'Repository',
	'videoRecordingType': 'Recording Type',
	'interviewMedium': 'Medium',
	'letterType': 'Type',
	'manuscriptType': 'Type',
	'mapType': 'Type',
	'scale': 'Scale',
	'thesisType': 'Type',
	'websiteType': 'Website Type',
	'audioRecordingType': 'Recording Type',
	'label': 'Label',
	'presentationType': 'Type',
	'meetingName': 'Meeting Name',
	'studio': 'Studio',
	'runningTime': 'Running Time',
	'network': 'Network',
	'postType': 'Post Type',
	'audioFileType': 'File Type',
	'versionNumber': 'Version Number',
	'system': 'System',
	'company': 'Company',
	'conferenceName': 'Conference Name',
	'encyclopediaTitle': 'Encyclopedia Title',
	'dictionaryTitle': 'Dictionary Title',
	'language': 'Language',
	'programmingLanguage': 'Language',
	'university': 'University',
	'abstractNote': 'Abstract',
	'websiteTitle': 'Website Title',
	'reportNumber': 'Report Number',
	'billNumber': 'Bill Number',
	'codeVolume': 'Code Volume',
	'codePages': 'Code Pages',
	'dateDecided': 'Date Decided',
	'reporterVolume': 'Reporter Volume',
	'firstPage': 'First Page',
	'documentNumber': 'Document Number',
	'dateEnacted': 'Date Enacted',
	'publicLawNumber': 'Public Law Number',
	'country': 'Country',
	'applicationNumber': 'Application Number',
	'forumTitle': 'Forum/Listserv Title',
	'episodeNumber': 'Episode Number',
	'blogTitle': 'Blog Title',
	'caseName': 'Case Name',
	'nameOfAct': 'Name of Act',
	'subject': 'Subject',
	'proceedingsTitle': 'Proceedings Title',
	'bookTitle': 'Book Title',
	'shortTitle': 'Short Title',
	'docketNumber': 'Docket Number',
	'numPages': '# of Pages',
	'note': 'Note',
	'numChildren': '# of Children',
	'addedBy': 'Added By',
	'creator': 'Creator'
};

},{}],101:[function(require,module,exports){
'use strict';

/**
 * List of property fields that should not be displayed in the UI
 * @type {Array}
 */
module.exports = ['mimeType', 'linkMode', 'charset', 'md5', 'mtime', 'version', 'key', 'collections', 'relations', 'parentItem', 'contentType', 'filename', 'tags', 'creators', 'abstractNote', //displayed separately
'dateModified', 'dateAdded', 'accessDate', 'libraryCatalog', 'title', 'shortTitle'];

},{}],102:[function(require,module,exports){
'use strict';

require('core-js/es6/promise');

require('isomorphic-fetch');

require('babel-regenerator-runtime');

var _main = require('./main.js');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _main2.default;

},{"./main.js":103,"babel-regenerator-runtime":1,"core-js/es6/promise":4,"isomorphic-fetch":91}],103:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /*global Zotero: false */


exports.default = ZoteroPublications;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _api = require('./api.js');

var _data = require('./data.js');

var _data2 = _interopRequireDefault(_data);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Application entry point. Alternatively can be used as a convenience function to render publications
 * into a container
 * @param {*} [configOruserIdOrendpointOrData] - Configuration object that will selectively override
 *                                             the defaults. Alternatively if used as a convenience function,
 *                                             this is first argument (userIdOrendpointOrData) passed over to
 *                                             ZoteroPublications.render.
 * @param {*} [container] - Only when used as a convenience function, specifies a DOM element where publications
 *                        will be rendered
 * @param {*} [config] - Only when used as a convience function, configuration object that will selectively override
 *                     the defaults
 */
function ZoteroPublications() {
	var _this = this;

	if (arguments.length > 3) {
		return Promise.reject(new Error('ZoteroPublications takes between one and three arguments. ' + arguments.length + ' is too many.'));
	}

	if (arguments.length <= 1) {
		this.config = _lodash2.default.extend({}, this.defaults, arguments ? arguments[0] : {});
	} else {
		this.config = _lodash2.default.extend({}, this.defaults, arguments[2]);
	}

	if (this.config.useCitationStyle && !_lodash2.default.includes(this.config.include, 'citation')) {
		this.config.getQueryParamsDefault.include.push('citation');
	}

	_lodash2.default.extend(this.config.getQueryParamsDefault, {
		style: this.config.citationStyle
	});

	this.ready = new Promise(function (resolve) {
		if (typeof document !== 'undefined' && document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', function () {
				resolve();
			});
		} else {
			resolve();
		}
	});

	this.ready.then(function () {
		_this.config.zorgIntegration = _this.config.zorgIntegration && typeof Zotero !== 'undefined' ? Zotero.config && Zotero.config.loggedInUser || Zotero.currentUser : false;
		if (_this.config.zorgIntegration) {
			_this.config.zorgIntegration['apiKey'] = Zotero.config.apiKey;
		}
	});

	if (arguments.length > 1) {
		return this.render(arguments[0], arguments[1]);
	}
}

/**
 * Default configuration object
 * @type {Object}
 */
ZoteroPublications.prototype.defaults = {
	apiBase: 'api.zotero.org',
	citationStyle: '',
	storeCitationPreference: false,
	group: false,
	useCitationStyle: false,
	showBranding: true,
	useHistory: true,
	expand: 'all',
	zorgIntegration: false,
	authorsListed: 10,
	citeStyleOptions: {
		'american-anthropological-association': 'American Anthropological Association',
		'apa': 'American Psychological Association 6th edition',
		'cell': 'Cell',
		'chicago-author-date': 'Chicago Manual of Style 16th edition (author-date)',
		'chicago-fullnote-bibliography': 'Chicago Manual of Style 16th edition (full note)',
		'chicago-note-bibliography': 'Chicago Manual of Style 16th edition (note)',
		'harvard-cite-them-right': 'Harvard - Cite Them Right 9th edition',
		'ieee': 'IEEE',
		'modern-humanities-research-association': 'Modern Humanities Research Association 3rd edition (note with bibliography)',
		'modern-language-association': 'Modern Language Association 7th edition',
		'nature': 'Nature',
		'vancouver': 'Vancouver'
	},
	citeStyleOptionDefault: 'chicago-note-bibliography',
	exportFormats: {
		'bibtex': {
			name: 'BibTeX',
			contentType: 'application/x-bibtex',
			extension: 'bib'
		},
		'ris': {
			name: 'RIS',
			contentType: 'application/x-research-info-systems',
			extension: 'ris'
		},
		'rdf_zotero': {
			name: 'Zotero RDF',
			contentType: 'application/rdf+xml',
			extension: 'rdf'
		}
	},
	getQueryParamsDefault: {
		linkwrap: '1',
		order: 'dateModified',
		sort: 'desc',
		start: '0',
		include: ['data'],
		limit: 100
	}
};

/**
 * Low-level function to fetch given url to obtain Zotero Data
 * @param  {String} url      - A Zotero API url to get
 * @param  {?Object} options - Settings that can complement or override instance config
 * @param  {?Object} init    - Options forwarded to the fetch method
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.get = function (url) {
	var _this2 = this;

	var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var init = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	params = _lodash2.default.extend({}, this.config.getQueryParamsDefault, params);
	init = _lodash2.default.extend({
		headers: {
			'Accept': 'application/json'
		}
	}, init);

	if (params.include instanceof Array) {
		params.include = params.include.join(',');
	}

	var queryParams = _lodash2.default.map(params, function (value, key) {
		return key + '=' + value;
	}).join('&');
	url = url + '?' + queryParams;

	return new Promise(function (resolve, reject) {
		var promise = (0, _api.fetchUntilExhausted)(url, init);
		promise.then(function (responseJson) {
			var data = new _data2.default(responseJson, _this2.config);
			resolve(data);
		});
		promise.catch(reject);
	});
};

/**
 * Lol-level function to post data to given url
 * @param  {String} url 		- target url for the post request
 * @param  {[type]} data 		- Raw data posted as part of the request
 * @param  {?Object} params 	- Optional additional query string params
 * @param  {?Object} init 		- Options forwarded to the fetch method
 * @return {Promise} 			- Fetch promise
 */
ZoteroPublications.prototype.post = function (url, data) {
	var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	var init = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	var queryParams = _lodash2.default.map(params, function (value, key) {
		return key + '=' + value;
	}).join('&');
	init = _lodash2.default.extend({
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}, init);
	url = url + '?' + queryParams;

	return fetch(url, init);
};

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint 	- An API endpoint from which data should be obtained
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Resolved with ZoteroData object on success, rejected
 *                        		in case of any network/response problems
 */
ZoteroPublications.prototype.getEndpoint = function (endpoint) {
	var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var apiBase = this.config.apiBase,
	    url = 'https://' + apiBase + '/' + endpoint;

	return this.get(url, params);
};

/**
 * Build url for an endpoint and use it to post data
 * @param  {String} endpoint 	- An API endpoint
 * @param  {[type]} data 		- Raw data posted as part of the request
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Fetch promise
 */
ZoteroPublications.prototype.postEndpoint = function (endpoint, data) {
	var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	var apiBase = this.config.apiBase,
	    url = 'https://' + apiBase + '/' + endpoint;

	return this.post(url, data, params);
};

/**
 * Build url for getting user's publications then fetch entire dataset recursively
 * @param  {Number} userId 		- User id
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Resolved with ZoteroData object on success, rejected
 *                        		in case of any network/response problems
 */
ZoteroPublications.prototype.getPublications = function (userId) {
	var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	this.userId = userId;
	return this.getEndpoint('users/' + userId + '/publications/items', params);
};

/**
 * Build url for getting a single item from user's publications then fetch it
 * @param  {String} itemId 		- Item key
 * @param  {Number} userId 		- User id
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise}			- Resolved with ZoteroData object on success, rejected
 *                       		in case of any network/response problems
 */
ZoteroPublications.prototype.getPublication = function (itemId, userId) {
	var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	return this.getEndpoint('users/' + userId + '/publications/items/' + itemId, params);
};

/**
 * Build url for sending one or more items to user's library then post it
 * @param  {Number} userId 		- User id
 * @param  {Object} data 		- Raw data posted as part of the request
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Fetch promise
 */
ZoteroPublications.prototype.postItems = function (userId, data) {
	var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	return this.postEndpoint('users/' + userId + '/items', data, params);
};

/**
 * Render local or remote items.
 * @param  {String|ZoteroData} endpointOrData - Data containung publications to be rendered
 * @param  {HTMLElement} container            - A DOM element where publications will be rendered
 * @return {Promise}                          - Resolved when rendered or rejected on error.
 *                                              In browser, resolved with reference to the domwrapper instance
 *                                              In node, resolved with produced html {String}
 */
ZoteroPublications.prototype.render = function (userIdOrendpointOrData, container) {
	var _this3 = this;

	return new Promise(function (resolve, reject) {
		var promise;

		if (typeof window !== 'undefined' && !(container instanceof HTMLElement)) {
			reject(new Error('Second argument to render() method must be a DOM element'));
		}

		if (userIdOrendpointOrData instanceof _data2.default) {
			promise = Promise.resolve(userIdOrendpointOrData);
		} else if (typeof userIdOrendpointOrData === 'number') {
			promise = _this3.getPublications(userIdOrendpointOrData);
		} else if (typeof userIdOrendpointOrData === 'string') {
			promise = _this3.getEndpoint(userIdOrendpointOrData);
		} else {
			reject(new Error('First argument to render() method must be an endpoint or an instance of ZoteroData'));
		}

		Promise.all([promise, _this3.ready]).then(function (_ref) {
			var _ref2 = _slicedToArray(_ref, 1),
			    data = _ref2[0];

			if (_this3.config.group === 'type') {
				data.groupByType(_this3.config.expand);
			}

			if (typeof window !== 'undefined') {
				var DomWrapper = require('./dom-wrapper.js');
				var domwrapper = new DomWrapper(container, _this3);
				domwrapper.displayPublications(data);
				if (_this3.config.useHistory && location.hash) {
					domwrapper.expandDetails(location.hash.substr(1));
				}
				resolve(domwrapper);
			} else {
				var Renderer = require('./renderer.js');
				var renderer = new Renderer(_this3);
				if (data.grouped > 0) {
					resolve(renderer.renderGroupView(data));
				} else {
					resolve(renderer.renderPlainView(data));
				}
			}
		}).catch(reject);
	});
};

/**
 * Make ZoteroData publicly accessible underneath ZoteroPublications
 * @type {ZoteroData}
 */
ZoteroPublications.ZoteroData = _data2.default;

/**
 * Make ZoteroRenderer publicly accessible underneath ZoteroPublications
 * @type {ZoteroRenderer}
 */
ZoteroPublications.Renderer = require('./renderer.js');

/**
 * Make DomWrapper publicly accessible underneath ZoteroPublications
 * but only if in browser environment
 * @type {DomWrapper}
 */
ZoteroPublications.DomWrapper = typeof window !== 'undefined' ? require('./dom-wrapper.js') : null;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api.js":96,"./data.js":98,"./dom-wrapper.js":99,"./renderer.js":104}],104:[function(require,module,exports){
(function (global){
'use strict';

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _item = require('./tpl/partial/item.tpl');

var _item2 = _interopRequireDefault(_item);

var _itemTemplated = require('./tpl/partial/item-templated.tpl');

var _itemTemplated2 = _interopRequireDefault(_itemTemplated);

var _itemCitation = require('./tpl/partial/item-citation.tpl');

var _itemCitation2 = _interopRequireDefault(_itemCitation);

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

var _constants = require('./constants.js');

var _utils = require('./utils.js');

var _fieldMap = require('./field-map.js');

var _fieldMap2 = _interopRequireDefault(_fieldMap);

var _typeMap = require('./type-map');

var _typeMap2 = _interopRequireDefault(_typeMap);

var _hiddenFields = require('./hidden-fields.js');

var _hiddenFields2 = _interopRequireDefault(_hiddenFields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_lodash2.default.templateSettings.variable = 'obj';

/**
 * Zotero Renderer constructor
 * @param {ZoteroPublications} [zotero]			- ZoteroPublications object
 */
function Renderer(zotero) {
	this.zotero = zotero;
	this.config = zotero.config;
	this.fieldMap = _fieldMap2.default;
	this.typeMap = _typeMap2.default;
	this.hiddenFields = _hiddenFields2.default;
}

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
Renderer.prototype.renderItem = function (zoteroItem) {
	return (0, _item2.default)({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render citation part of a single Zotero using custom template
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
Renderer.prototype.renderItemTemplated = function (zoteroItem) {
	return (0, _itemTemplated2.default)({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render citation part of a single Zotero item using api-provided citation
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
Renderer.prototype.renderItemCitation = function (zoteroItem) {
	return (0, _itemCitation2.default)({
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
Renderer.prototype.renderItems = function (zoteroItems) {
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
Renderer.prototype.renderGroup = function (items) {
	return (0, _group2.default)({
		'title': (0, _utils.formatCategoryName)(items[_constants.GROUP_TITLE]),
		'items': items,
		'expand': items[_constants.GROUP_EXPANDED_SUMBOL],
		'renderer': this
	});
};

/**
 * Renders a list of groups of Zotero items
 * @param {Object[]} 	- List of groups to render
 * @return {String} 	- Rendered markup of groups
 */
Renderer.prototype.renderGroups = function (groups) {
	return (0, _groups2.default)({
		'groups': groups,
		'renderer': this
	});
};

/**
 * Render a Group View
 * @param {ZoteroData} 	- List of groups to render
 * @return {String} 	- Rendered markup of a complete group view
 */
Renderer.prototype.renderGroupView = function (data) {
	return (0, _groupView2.default)({
		'groups': data,
		'renderer': this
	});
};

/**
 * Render a Plain View
 * @param  {ZoteroData} zoteroItems - List of Zotero items
 * @return {String} 	- Rendered markup of a complete plain view
 */
Renderer.prototype.renderPlainView = function (data) {
	return (0, _plainView2.default)({
		'items': data,
		'renderer': this
	});
};

/**
 * Render Zotero branding
 * @return {String}
 */
Renderer.prototype.renderBranding = function () {
	if (this.config.showBranding) {
		return (0, _branding2.default)();
	} else {
		return '';
	}
};

module.exports = Renderer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./constants.js":97,"./field-map.js":100,"./hidden-fields.js":101,"./tpl/group-view.tpl":105,"./tpl/partial/branding.tpl":106,"./tpl/partial/group.tpl":108,"./tpl/partial/groups.tpl":109,"./tpl/partial/item-citation.tpl":110,"./tpl/partial/item-templated.tpl":111,"./tpl/partial/item.tpl":112,"./tpl/partial/items.tpl":113,"./tpl/plain-view.tpl":114,"./type-map":115,"./utils.js":116}],105:[function(require,module,exports){
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
},{}],106:[function(require,module,exports){
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
  __p += '<div class="zotero-branding">\n\t<a href="http://www.zotero.org" class="zotero-logo-link" aria-label="Zotero" rel="nofollow">\n\t\t<svg class="zotero-logo" version="1.1" xmlns="http://www.w3.org/2000/svg" width="90" height="20">\n\t\t\t<g>\n\t\t\t\t<path class="zotero-z" fill="#990000" d="M12.2,6.1L2.8,17.8h9.4v1.9H0v-2.2L9.4,5.8H0.8V3.9h11.4V6.1z"/>\n\t\t\t\t<path fill="#222222" d="M22.1,3.7c5.9,0,7,1.4,7,8.1c0,6.7-1.1,8.1-7,8.1c-5.9,0-7-1.4-7-8.1C15.1,5.2,16.2,3.7,22.1,3.7z M22.1,18\n\t\t\t\t\tc4.2,0,4.5-0.7,4.5-6.1c0-5.5-0.3-6.2-4.5-6.2c-4.2,0-4.5,0.7-4.5,6.2C17.5,17.3,17.8,18,22.1,18z"/>\n\t\t\t\t<path fill="#222222" d="M41.7,5.8h-6.1v10c0,1.7,0.5,2.1,2.2,2.1c2.2,0,2.2-1.2,2.2-2.7v-1.2h2.3v1.2c0,3.1-1.3,4.6-4.5,4.6\n\t\t\t\t\tc-3.7,0-4.5-1.1-4.5-4.8V5.8h-2.1V3.9h2.1V0.1h2.4v3.8h6.1V5.8z"/>\n\t\t\t\t<path fill="#222222" d="M58.3,14.9v0.6c0,4.2-3.2,4.4-6.7,4.4c-6.2,0-7.1-2-7.1-8.1c0-6.6,1.4-8.1,7.1-8.1c5.1,0,6.7,1.2,6.7,7v1.6\n\t\t\t\t\tH46.9c0,5,0.4,5.6,4.6,5.6c3.3,0,4.3-0.2,4.3-2.4v-0.6H58.3z M55.8,10.4c-0.1-4.5-0.7-4.8-4.3-4.8c-4.3,0-4.5,1.1-4.6,4.8H55.8z"/>\n\t\t\t\t<path fill="#222222" d="M64.6,3.9l-0.1,2l0.1,0.1c0.8-1.7,2.7-2.2,4.5-2.2c3,0,4.4,1.5,4.4,4.5v1.1h-2.3V8.3c0-2-0.7-2.6-2.6-2.6\n\t\t\t\t\tc-3,0-3.9,1.4-3.9,4.2v9.8h-2.4V3.9H64.6z"/>\n\t\t\t\t<path fill="#222222" d="M83,3.7c5.9,0,7,1.4,7,8.1c0,6.7-1.1,8.1-7,8.1c-5.9,0-7-1.4-7-8.1C76,5.2,77.1,3.7,83,3.7z M83,18\n\t\t\t\t\tc4.2,0,4.5-0.7,4.5-6.1c0-5.5-0.3-6.2-4.5-6.2c-4.2,0-4.5,0.7-4.5,6.2C78.4,17.3,78.7,18,83,18z"/>\n\t\t\t</g>\n\t\t</svg>\n\t</a>\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],107:[function(require,module,exports){
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
  __p += '<a href="data:' + ((__t = obj.contentType) == null ? '' : _.escape(__t)) + ';base64,' + ((__t = obj.content) == null ? '' : _.escape(__t)) + '" download="' + ((__t = obj.filename) == null ? '' : _.escape(__t)) + '">\n\tDownload\n</a>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],108:[function(require,module,exports){
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
  __p += '<li class="zotero-group' + ((__t = obj.expand ? ' zotero-group-expanded' : '') == null ? '' : _.escape(__t)) + '" aria-expanded="' + ((__t = obj.expand ? 'true' : 'false') == null ? '' : _.escape(__t)) + '" role="listitem">\n\n\t<h2 class="zotero-group-title" data-trigger="expand-group">' + ((__t = obj.title) == null ? '' : _.escape(__t)) + '</h2>\n\t' + ((__t = obj.renderer.renderItems(obj.items)) == null ? '' : __t) + '\n</li>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],109:[function(require,module,exports){
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
  __p += '<ul class="zotero-groups" role="list">\n\t';
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
},{}],110:[function(require,module,exports){
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
  __p += '';
  var constants = require('../../constants.js');
  __p += '\n';
  var utils = require('../../utils.js');
  __p += '\n<h3 class="zotero-item-title">\n\t';
  if (obj.item[constants.VIEW_ONLINE_URL]) {
    __p += '\n\t<a href="' + ((__t = utils.sanitizeURL(obj.item[constants.VIEW_ONLINE_URL])) == null ? '' : _.escape(__t)) + '" rel="nofollow">\n\t\t' + ((__t = obj.item.citation) == null ? '' : __t) + '\n\t</a>\n\t';
  } else {
    __p += '\n\t\t' + ((__t = obj.item.citation) == null ? '' : __t) + '\n\t';
  }
  __p += '\n</h3>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../constants.js":97,"../../utils.js":116}],111:[function(require,module,exports){
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
  __p += '';
  var constants = require('../../constants.js');
  __p += '\n';
  var utils = require('../../utils.js');
  __p += '\n<div class="zotero-item-header-container">\n\t';
  if (obj.data.itemType == 'book') {
    __p += '\n\t\t\t<div class="zotero-item-header">\n\t\t\t\t<h3 class="zotero-item-title">\n\t\t\t\t\t';
    if (obj.item[constants.VIEW_ONLINE_URL]) {
      __p += '\n\t\t\t\t\t\t<a href="' + ((__t = utils.sanitizeURL(obj.item[constants.VIEW_ONLINE_URL])) == null ? '' : _.escape(__t)) + '" rel="nofollow">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a> ';
      if (obj.item[constants.HAS_PDF]) {
        __p += ' [PDF]';
      }
      __p += '\n\t\t\t\t\t';
    } else {
      __p += '\n\t\t\t\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t</h3>\n\t\t\t\t<div class="zotero-item-subline">\n\t\t\t\t\t';
    if (obj.data.publisher) {
      __p += '\n\t\t\t\t\t\t' + ((__t = obj.data.publisher) == null ? '' : _.escape(__t)) + '';
      if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
        __p += ', ';
      }
      __p += '\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t\t';
    if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
      __p += '\n\t\t\t\t\t\t' + ((__t = obj.data[constants.FORMATTED_DATE_SYMBOL]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t';
  } else if (obj.data.itemType == 'thesis') {
    __p += '\n\t\t\t<div class="zotero-item-header">\n\t\t\t\t<h3 class="zotero-item-title">\n\t\t\t\t\t';
    if (obj.item[constants.VIEW_ONLINE_URL]) {
      __p += '\n\t\t\t\t\t\t<a href="' + ((__t = utils.sanitizeURL(obj.item[constants.VIEW_ONLINE_URL])) == null ? '' : _.escape(__t)) + '" rel="nofollow">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a> ';
      if (obj.item[constants.HAS_PDF]) {
        __p += ' [PDF]';
      }
      __p += '\n\t\t\t\t\t';
    } else {
      __p += '\n\t\t\t\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t</h3>\n\t\t\t\t<div class="zotero-item-subline">\n\t\t\t\t\t';
    if (obj.data.university) {
      __p += '\n\t\t\t\t\t\t' + ((__t = obj.data.university) == null ? '' : _.escape(__t)) + '';
      if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
        __p += ', ';
      }
      __p += '\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t\t';
    if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
      __p += '\n\t\t\t\t\t\t' + ((__t = obj.data[constants.FORMATTED_DATE_SYMBOL]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t';
  } else if (obj.data.itemType == 'journalArticle') {
    __p += '\n\t\t<div class="zotero-item-header">\n\t\t\t<h3 class="zotero-item-title">\n\t\t\t\t';
    if (obj.item[constants.VIEW_ONLINE_URL]) {
      __p += '\n\t\t\t\t\t<a href="' + ((__t = utils.sanitizeURL(obj.item[constants.VIEW_ONLINE_URL])) == null ? '' : _.escape(__t)) + '" rel="nofollow">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a> ';
      if (obj.item[constants.HAS_PDF]) {
        __p += ' [PDF]';
      }
      __p += '\n\t\t\t\t';
    } else {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
    }
    __p += '\n\t\t\t</h3>\n\t\t\t<div class="zotero-item-subline">\n\t\t\t\t';
    if (obj.data.publicationTitle) {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data.publicationTitle) == null ? '' : _.escape(__t)) + '';
      if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
        __p += ', ';
      }
      __p += '\n\t\t\t\t';
    } else if (obj.data.journalAbbreviation) {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data.journalAbbreviation) == null ? '' : _.escape(__t)) + '';
      if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
        __p += ', ';
      }
      __p += '\n\t\t\t\t';
    }
    __p += '\n\t\t\t\t';
    if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data[constants.FORMATTED_DATE_SYMBOL]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
    }
    __p += '\n\t\t\t</div>\n\t\t</div>\n\t';
  } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') {
    __p += '\n\t\t<div class="zotero-item-header">\n\t\t\t<h3 class="zotero-item-title">\n\t\t\t\t';
    if (obj.item[constants.VIEW_ONLINE_URL]) {
      __p += '\n\t\t\t\t\t<a href="' + ((__t = utils.sanitizeURL(obj.item[constants.VIEW_ONLINE_URL])) == null ? '' : _.escape(__t)) + '" rel="nofollow">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a> ';
      if (obj.item[constants.HAS_PDF]) {
        __p += ' [PDF]';
      }
      __p += '\n\t\t\t\t';
    } else {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
    }
    __p += '\n\t\t\t</h3>\n\t\t\t<div class="zotero-item-subline">\n\t\t\t\t';
    if (obj.data.publicationTitle) {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data.publicationTitle) == null ? '' : _.escape(__t)) + '';
      if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
        __p += ', ';
      }
      __p += '\n\t\t\t\t';
    }
    __p += '\t\n\t\t\t\t';
    if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data[constants.FORMATTED_DATE_SYMBOL]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
    }
    __p += '\n\t\t\t</div>\n\t\t</div>\n\t';
  } else if (obj.data.itemType == 'blogPost') {
    __p += '\n\t\t<div class="zotero-item-header">\n\t\t\t<h3 class="zotero-item-title">\n\t\t\t\t';
    if (obj.item[constants.VIEW_ONLINE_URL]) {
      __p += '\n\t\t\t\t\t<a href="' + ((__t = utils.sanitizeURL(obj.item[constants.VIEW_ONLINE_URL])) == null ? '' : _.escape(__t)) + '" rel="nofollow">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a> ';
      if (obj.item[constants.HAS_PDF]) {
        __p += ' [PDF]';
      }
      __p += '\n\t\t\t\t';
    } else {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
    }
    __p += '\n\t\t\t</h3>\n\t\t\t<div class="zotero-item-subline">\n\t\t\t\t';
    if (obj.data.blogTitle) {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data.blogTitle) == null ? '' : _.escape(__t)) + '';
      if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
        __p += ', ';
      }
      __p += '\n\t\t\t\t';
    }
    __p += '\t\n\t\t\t\t';
    if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data[constants.FORMATTED_DATE_SYMBOL]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
    }
    __p += '\n\t\t\t</div>\n\t\t</div>\n\t';
  } else {
    __p += '\n\t\t<div class="zotero-item-header">\n\t\t\t<h3 class="zotero-item-title">\n\t\t\t\t';
    if (obj.item[constants.VIEW_ONLINE_URL]) {
      __p += '\n\t\t\t\t\t<a href="' + ((__t = utils.sanitizeURL(obj.item[constants.VIEW_ONLINE_URL])) == null ? '' : _.escape(__t)) + '" rel="nofollow">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a> ';
      if (obj.item[constants.HAS_PDF]) {
        __p += ' [PDF]';
      }
      __p += '\n\t\t\t\t';
    } else {
      __p += '\n\t\t\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t';
    }
    __p += '\n\t\t\t</h3>\n\n\t\t\t';
    if (obj.data[constants.AUTHORS_SYMBOL] || obj.data[constants.FORMATTED_DATE_SYMBOL]) {
      __p += '\n\t\t\t\t<div class="zotero-item-subline">\n\t\t\t\t\t';
      if (obj.data[constants.AUTHORS_SYMBOL] && obj.data[constants.AUTHORS_SYMBOL]['Author']) {
        __p += '\n\t\t\t\t\t\tBy ' + ((__t = obj.data[constants.AUTHORS_SYMBOL]['Author'].join(' & ')) == null ? '' : _.escape(__t)) + '';
        if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
          __p += ', ';
        }
        __p += '\n\t\t\t\t\t';
      }
      __p += '\n\t\t\t\t\t\t\n\t\t\t\t\t';
      if (obj.data[constants.FORMATTED_DATE_SYMBOL]) {
        __p += '\n\t\t\t\t\t\t' + ((__t = obj.data[constants.FORMATTED_DATE_SYMBOL]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t';
      }
      __p += '\n\t\t\t\t</div>\n\t\t\t';
    }
    __p += '\n\t\t</div>\n\t';
  }
  __p += '\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../constants.js":97,"../../utils.js":116}],112:[function(require,module,exports){
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
  __p += '';
  var constants = require('../../constants.js');
  __p += '\n';
  var utils = require('../../utils.js');
  __p += '\n<li class="zotero-item zotero-' + ((__t = obj.data.itemType) == null ? '' : _.escape(__t)) + '" data-item="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '" id="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '" role="listitem">\n\t<a href="#" class="zotero-line" aria-hidden="true" role="presentation" tabindex="-1"></a>\n\n\t<!-- Citation -->\n\t';
  if (obj.renderer.config.useCitationStyle) {
    __p += '\n\t\t' + ((__t = obj.renderer.renderItemCitation(obj.item)) == null ? '' : __t) + '\n\t<!-- Templated -->\n\t';
  } else {
    __p += '\n\t\t' + ((__t = obj.renderer.renderItemTemplated(obj.item)) == null ? '' : __t) + '\n\t';
  }
  __p += '\n\n\t<div class="zotero-item-actions">\n\t\t<a href="" data-trigger="details" aria-controls="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-details">\n\t\t\tDetails\n\t\t</a>\n\t\t';
  if (obj.renderer.zotero.config.zorgIntegration) {
    __p += '\n\t\t\t<a href="" data-trigger="add-to-library" aria-controls="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-details">\n\t\t\t\tAdd to Library\n\t\t\t</a>\n\t\t';
  }
  __p += '\n\t</div>\n\n\t<!-- Details -->\n\t<section class="zotero-details zotero-collapsed zotero-collapsable" aria-hidden="true" aria-expanded="false" id="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-details">\n\t\t<div class="zotero-details-inner">\n\t\t\t<table class="zotero-meta">\n\t\t\t\t';
  if (obj.item.data['itemType']) {
    __p += '\n\t\t\t\t\t<tr class="zotero-meta-item">\n\t\t\t\t\t\t<td class="zotero-meta-label">' + ((__t = obj.renderer.fieldMap['itemType']) == null ? '' : _.escape(__t)) + '</td>\n\t\t\t\t\t\t<td class="zotero-meta-value">' + ((__t = obj.renderer.typeMap[obj.item.data['itemType']]) == null ? '' : _.escape(__t)) + '</td>\n\t\t\t\t\t</tr>\n\t\t\t\t';
  }
  __p += '\n\n\t\t\t\t';
  if (obj.item.data[constants.AUTHORS_SYMBOL]) {
    __p += '\n\t\t\t\t\t';
    for (var i = 0, keys = Object.keys(obj.item.data[constants.AUTHORS_SYMBOL]); i < keys.length; i++) {
      __p += '\n\t\t\t\t\t\t<tr class="zotero-meta-item">\n\t\t\t\t\t\t\t<td class="zotero-meta-label">' + ((__t = keys[i]) == null ? '' : _.escape(__t)) + '</td>\n\t\t\t\t\t\t\t<td class="zotero-meta-value zotero-creators">\n\t\t\t\t\t\t\t\t';
      for (var j = 0; j < Math.min(obj.renderer.zotero.config.authorsListed, obj.item.data[constants.AUTHORS_SYMBOL][keys[i]].length); j++) {
        __p += '\n\t\t\t\t\t\t\t\t\t<span class="zotero-creator">\n\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.item.data[constants.AUTHORS_SYMBOL][keys[i]][j]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t';
      }
      __p += '\n\t\t\t\t\t\t\t\t';
      if (obj.item.data[constants.AUTHORS_SYMBOL][keys[i]].length > obj.renderer.zotero.config.authorsListed) {
        __p += '\n\t\t\t\t\t\t\t\t\t<a href="" class="zotero-creator" data-trigger="expand-authors">\n\t\t\t\t\t\t\t\t\t\tMore...\n\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t';
      }
      __p += '\n\t\t\t\t\t\t\t\t';
      for (var j = obj.renderer.zotero.config.authorsListed; j < obj.item.data[constants.AUTHORS_SYMBOL][keys[i]].length; j++) {
        __p += '\n\t\t\t\t\t\t\t\t\t<span class="zotero-creator zotero-creator-hidden">\n\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.item.data[constants.AUTHORS_SYMBOL][keys[i]][j]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t';
      }
      __p += '\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t';
  }
  __p += '\n\t\t\t\t';
  for (var i = 0, keys = Object.keys(obj.data); i < keys.length; i++) {
    __p += '\n\t\t\t\t\t';
    if (obj.renderer.hiddenFields.indexOf(keys[i]) === -1) {
      __p += '\n\t\t\t\t\t\t';
      if (obj.data[keys[i]]) {
        __p += '\n\t\t\t\t\t\t\t';
        if (keys[i] !== 'itemType') {
          __p += '\n\t\t\t\t\t\t\t\t<tr class="zotero-meta-item">\n\t\t\t\t\t\t\t\t\t<td class="zotero-meta-label">' + ((__t = obj.renderer.fieldMap[keys[i]]) == null ? '' : _.escape(__t)) + '</td>\n\t\t\t\t\t\t\t\t\t<td class="zotero-meta-value">\n\t\t\t\t\t\t\t\t\t\t';
          if (keys[i] === 'DOI') {
            __p += '\n\t\t\t\t\t\t\t\t\t\t\t<a href="https://doi.org/' + ((__t = encodeURIComponent(obj.data[keys[i]])) == null ? '' : _.escape(__t)) + '" rel="nofollow">\n\t\t\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.data[keys[i]]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\t';
          } else if (keys[i] === 'url') {
            __p += '\n\t\t\t\t\t\t\t\t\t\t\t<a href="' + ((__t = utils.sanitizeURL(obj.data[keys[i]])) == null ? '' : _.escape(__t)) + '" rel="nofollow">\n\t\t\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.data[keys[i]]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\t';
          } else {
            __p += '\n\t\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.data[keys[i]]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t\t\t\t';
          }
          __p += '\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t';
        }
        __p += '\n\t\t\t\t\t\t';
      }
      __p += '\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t';
  }
  __p += '\n\t\t\t</table>\n\t\t\t';
  if (obj.data.abstractNote && obj.data.abstractNote.length) {
    __p += '\n\t\t\t\t<h4>Abstract</h4>\n\t\t\t\t<div class="zotero-abstract">\n\t\t\t\t\t' + ((__t = obj.data[constants.ABSTRACT_NOTE_PROCESSED]) == null ? '' : __t) + '\n\t\t\t\t</div>\n\t\t\t';
  }
  __p += '\n\n\t\t\t';
  if (obj.item[constants.CHILD_NOTES] && obj.item[constants.CHILD_NOTES].length) {
    __p += '\n\t\t\t\t<h4>Notes</h4>\n\t\t\t\t<ul class="zotero-notes">\n\t\t\t\t\t';
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = obj.item[constants.CHILD_NOTES][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
  if (obj.item[constants.CHILD_ATTACHMENTS] && obj.item[constants.CHILD_ATTACHMENTS].length) {
    __p += '\n\t\t\t\t<h4>Attachments</h4>\n\t\t\t\t<ul class="zotero-attachments">\n\t\t\t\t\t';
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = obj.item[constants.CHILD_ATTACHMENTS][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var childItem = _step2.value;

        __p += '\n\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t';
        if (childItem.url || childItem.links && childItem.links.enclosure && childItem.links.enclosure.href) {
          __p += '\n\t\t\t\t\t\t\t<a href="' + ((__t = utils.sanitizeURL(childItem.url)) == null ? '' : _.escape(__t)) + '" rel="nofollow">\n\t\t\t\t\t\t\t';
        }
        __p += '\n\t\t\t\t\t\t\t\t<span class="zotero-icon zotero-icon-paperclip" role="presentation" aria-hidden="true"></span><!--\n\t\t\t\t\t\t\t\t-->' + ((__t = childItem.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t';
        if (childItem.url || childItem.links && childItem.links.enclosure && childItem.links.enclosure.href) {
          __p += '\t\n\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t';
        }
        __p += '\n\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\n\t\t\t\t\t';
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
    __p += '\n\t\t\t\t<!-- Cite & export -->\n\t\t\t\t<div class="zotero-toolbar">\n\t\t\t\t\t<ul class="zotero-list-inline" role="tablist">\n\t\t\t\t\t\t<li class="zotero-tab" >\n\t\t\t\t\t\t\t<a href="" data-trigger="cite" role="tab" aria-selected="false" aria-controls="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-cite">Cite</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t\t<li class="zotero-tab">\n\t\t\t\t\t\t\t<a href="" data-trigger="export" role="tab" aria-selected="false" aria-controls="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-export">Export</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t</ul>\n\t\t\t\t</div>\n\n\t\t\t\t<div class="zotero-tab-content">\n\t\t\t\t\t<!-- Cite -->\n\t\t\t\t\t<div role="tabpanel" class="zotero-cite-container zotero-tabpanel" aria-expanded="false" id="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-cite">\n\t\t\t\t\t\t<div class="zotero-container-inner">\n\t\t\t\t\t\t\t<select class="zotero-form-control" data-trigger="cite-style-selection">\n\t\t\t\t\t\t\t\t';
    for (var citationStyle in obj.renderer.zotero.config.citeStyleOptions) {
      __p += '\n\t\t\t\t\t\t\t\t\t<option value="' + ((__t = citationStyle) == null ? '' : __t) + '" ';
      if (citationStyle === obj.renderer.config.citeStyleOptionDefault) {
        __p += ' selected ';
      }
      __p += '>\n\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.renderer.zotero.config.citeStyleOptions[citationStyle]) == null ? '' : __t) + '\n\t\t\t\t\t\t\t\t\t</option>\n\t\t\t\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t<p class="zotero-citation" id="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-citation"></p>\n\t\t\t\t\t\t\t';
    if (typeof navigator !== 'undefined' && !/iPhone|iPad/i.test(navigator.userAgent)) {
      __p += '\n\t\t\t\t\t\t\t\t<button class="zotero-btn zotero-citation-copy tooltipped tooltipped-e" data-clipboard-target="#item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-citation" aria-label="Copy to clipboard">Copy</button>\n\t\t\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<!-- Export -->\n\t\t\t\t\t<div role="tabpanel" class="zotero-export-container zotero-tabpanel" aria-expanded="false" aria-hidden="true" id="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-export">\n\t\t\t\t\t\t<div class="zotero-container-inner">\n\t\t\t\t\t\t\t<select class="zotero-form-control" data-trigger="export-format-selection">\n\t\t\t\t\t\t\t\t';
    for (var exportFormat in obj.renderer.zotero.config.exportFormats) {
      __p += '\n\t\t\t\t\t\t\t\t\t<option value="' + ((__t = exportFormat) == null ? '' : __t) + '">\n\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.renderer.zotero.config.exportFormats[exportFormat].name) == null ? '' : __t) + '\n\t\t\t\t\t\t\t\t\t</option>\n\t\t\t\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t<p class="zotero-export"></p>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t';
  }
  __p += '\n\t\t</div>\n\t</section>\n</li>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../constants.js":97,"../../utils.js":116}],113:[function(require,module,exports){
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
  __p += '<ul class="zotero-items" role="' + ((__t = obj.renderer.data && obj.renderer.data.grouped > 0 ? 'group' : 'list') == null ? '' : _.escape(__t)) + '">\n\t';
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
},{}],114:[function(require,module,exports){
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
  __p += '<div class="zotero-publications">\n\t' + ((__t = obj.renderer.renderItems(obj.items)) == null ? '' : __t) + '\n\t' + ((__t = obj.renderer.renderBranding()) == null ? '' : __t) + '\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],115:[function(require,module,exports){
'use strict';

/**
 * Map of type identifiers to user friendly names
 * @type {Object}
 */
module.exports = {
	'note': 'Note',
	'attachment': 'Attachment',
	'book': 'Book',
	'bookSection': 'Book Section',
	'journalArticle': 'Journal Article',
	'magazineArticle': 'Magazine Article',
	'newspaperArticle': 'Newspaper Article',
	'thesis': 'Thesis',
	'letter': 'Letter',
	'manuscript': 'Manuscript',
	'interview': 'Interview',
	'film': 'Film',
	'artwork': 'Artwork',
	'webpage': 'Web Page',
	'report': 'Report',
	'bill': 'Bill',
	'case': 'Case',
	'hearing': 'Hearing',
	'patent': 'Patent',
	'statute': 'Statute',
	'email': 'E-mail',
	'map': 'Map',
	'blogPost': 'Blog Post',
	'instantMessage': 'Instant Message',
	'forumPost': 'Forum Post',
	'audioRecording': 'Audio Recording',
	'presentation': 'Presentation',
	'videoRecording': 'Video Recording',
	'tvBroadcast': 'TV Broadcast',
	'radioBroadcast': 'Radio Broadcast',
	'podcast': 'Podcast',
	'computerProgram': 'Computer Program',
	'conferencePaper': 'Conference Paper',
	'document': 'Document',
	'encyclopediaArticle': 'Encyclopedia Article',
	'dictionaryEntry': 'Dictionary Entry'
};

},{}],116:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.formatDate = formatDate;
exports.formatAbstract = formatAbstract;
exports.formatCategoryName = formatCategoryName;
exports.closest = closest;
exports.once = once;
exports.id = id;
exports.onTransitionEnd = onTransitionEnd;
exports.toggleCollapse = toggleCollapse;
exports.showTab = showTab;
exports.clipboardFallbackMessage = clipboardFallbackMessage;
exports.sanitizeURL = sanitizeURL;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
		var _year = matches[1];
		var _month = months[parseInt(matches[2], 10) - 1];
		date = _month + ' ' + _year;
	}
	if (matches.length >= 2) {
		date = matches[1];
	}

	return date;
}

function formatAbstract(abstract) {
	return abstract.replace(/(^|\n)([\s\S]*?)(\n|$)/g, '<p>$2</p>');
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
 * Finds the first element that pasess function test by testing the element itself
 * and traversing up
 * @param  {HTMLElement}   el 	- A DOM element from which tracersing begins
 * @param  {Function} fn 		- Function that tests if element is suitable
 * @return {HTMLElement}		- First element that passes the test
 */
function closest(el, fn) {
	return el && (fn(el) ? el : closest(el.parentNode, fn));
}

/**
 * Register a one-time event listener.
 *
 * @param {EventTarget} target
 * @param {String} type
 * @param {Function} listener
 * @returns {Function} deregister
 */
function once(target, type, listener) {
	function deregister() {
		target.removeEventListener(type, handler); // eslint-disable-line no-use-before-define
	}

	function handler() {
		deregister();
		return listener.apply(this, arguments);
	}

	target.addEventListener(type, handler);

	return deregister;
}

/**
 * Uniquely and pernamently identify a DOM element even if it has no id
 * @param  {HTMLElement} target - DOM element to identify
 * @return {String} 			- unique identifier
 */
function id(target) {
	target.id = target.id || _lodash2.default.uniqueId('zotero-element-');
	return target.id;
}

/**
 * Finds a correct name of a transitionend event
 * @return {String} 	- transitionend event name
 */
function onTransitionEnd(target, callback, timeout) {
	var i,
	    el = document.createElement('div'),
	    eventName,
	    possibleEventNames = {
		'transition': 'transitionend',
		'OTransition': 'otransitionend',
		'MozTransition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd'
	};

	for (i in possibleEventNames) {
		if (possibleEventNames.hasOwnProperty(i) && el.style[i] !== undefined) {
			eventName = possibleEventNames[i];
		}
	}

	if (timeout) {
		setTimeout(function () {
			callback('timeout');
		}, timeout);
	}

	return once(target, eventName, function () {
		callback(eventName);
	});
}

var collapsesInProgress = {};

function collapse(element) {
	var initialHeight = getComputedStyle(element).height;
	element.style.height = initialHeight;
	//repaint shenanigans
	element.offsetHeight; // eslint-disable-line no-unused-expressions

	_lodash2.default.defer(function () {
		element.classList.add('zotero-collapsed', 'zotero-collapsing');
		element.style.height = null;
		collapsesInProgress[id(element)] = onTransitionEnd(element, function () {
			element.classList.remove('zotero-collapsing');
			element.setAttribute('aria-hidden', 'true');
			element.setAttribute('aria-expanded', 'false');
			delete collapsesInProgress[id(element)];
		}, 500);
	});
}

function uncollapse(element) {
	element.classList.remove('zotero-collapsed');
	var targetHeight = getComputedStyle(element).height;
	element.classList.add('zotero-collapsed');

	_lodash2.default.defer(function () {
		element.classList.add('zotero-collapsing');
		element.style.height = targetHeight;
		collapsesInProgress[id(element)] = onTransitionEnd(element, function () {
			element.classList.remove('zotero-collapsed', 'zotero-collapsing');
			element.setAttribute('aria-hidden', 'false');
			element.setAttribute('aria-expanded', 'true');
			element.style.height = null;
			delete collapsesInProgress[id(element)];
		}, 500);
	});
}

/**
 * Collpases or uncollapses a DOM element
 * @param  {HTMLElement} element 	- DOM element to be (un)collapsed
 */
function toggleCollapse(element, override) {
	if (typeof override !== 'undefined') {
		if (collapsesInProgress[id(element)]) {
			collapsesInProgress[id(element)]();
		}
		override ? uncollapse(element) : collapse(element); // eslint-disable-line no-unused-expressions
		return override;
	}

	if (collapsesInProgress[id(element)]) {
		collapsesInProgress[id(element)]();
		var collapsing = !element.style.height;
		collapsing ? uncollapse(element) : collapse(element); // eslint-disable-line no-unused-expressions
		return collapsing;
	} else {
		var collapsed = element.classList.contains('zotero-collapsed');
		collapsed ? uncollapse(element) : collapse(element); // eslint-disable-line no-unused-expressions
		return collapsed;
	}
}

function showTab(targetTabEl) {
	var tablistEl = closest(targetTabEl, function (el) {
		return el.getAttribute('role') === 'tablist';
	});
	var targetTabContainer = targetTabEl.parentElement;
	var tabs = tablistEl.querySelectorAll('li.zotero-tab');
	var tabpanelId = targetTabEl.getAttribute('aria-controls');
	var targetTabPanelEl = document.getElementById(tabpanelId);
	var tabPanelsWrapper = closest(targetTabPanelEl, function (el) {
		return el.classList.contains('zotero-tab-content');
	});
	var tabPanels = tabPanelsWrapper.querySelectorAll('.zotero-tabpanel');

	_lodash2.default.each(tabs, function (tabEl) {
		tabEl.classList.remove('zotero-tab-active');
		tabEl.querySelector('a').setAttribute('aria-selected', false);
	});
	_lodash2.default.each(tabPanels, function (tabPanelEl) {
		tabPanelEl.classList.remove('zotero-tabpanel-open');
		tabPanelEl.setAttribute('aria-expanded', false);
		tabPanelEl.setAttribute('aria-hidden', true);
	});

	targetTabContainer.classList.add('zotero-tab-active');
	targetTabPanelEl.classList.add('zotero-tabpanel-open');
	targetTabPanelEl.setAttribute('aria-expanded', true);
	targetTabPanelEl.setAttribute('aria-hidden', false);
	targetTabEl.setAttribute('aria-selected', true);
}

/**
 * Returns a fallback message for a clipboard
 * @return {String} 	- a fallback message
 */
function clipboardFallbackMessage() {
	var actionMsg = '';

	if (/Mac/i.test(navigator.userAgent)) {
		actionMsg = 'Press ⌘-C to copy';
	} else {
		actionMsg = 'Press Ctrl-C to copy';
	}

	return actionMsg;
}

function sanitizeURL(url) {
	url = url.trim();
	if (/^(https?|ftp):\/\//i.test(url)) {
		return url;
	} else {
		return 'http://' + url;
	}
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[102])(102)
});