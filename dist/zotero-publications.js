(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ZoteroPublications = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/srv/zotero/my-publications/node_modules/babel-regenerator-runtime/runtime.js":[function(require,module,exports){
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
},{"_process":"/srv/zotero/my-publications/node_modules/process/browser.js"}],"/srv/zotero/my-publications/node_modules/clipboard/lib/clipboard-action.js":[function(require,module,exports){
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
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
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


        ClipboardAction.prototype.resolveOptions = function resolveOptions() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            this.action = options.action;
            this.emitter = options.emitter;
            this.target = options.target;
            this.text = options.text;
            this.trigger = options.trigger;

            this.selectedText = '';
        };

        ClipboardAction.prototype.initSelection = function initSelection() {
            if (this.text) {
                this.selectFake();
            } else if (this.target) {
                this.selectTarget();
            }
        };

        ClipboardAction.prototype.selectFake = function selectFake() {
            var _this = this;

            var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

            this.removeFake();

            this.fakeHandler = document.body.addEventListener('click', function () {
                return _this.removeFake();
            });

            this.fakeElem = document.createElement('textarea');
            // Prevent zooming on iOS
            this.fakeElem.style.fontSize = '12pt';
            // Reset box model
            this.fakeElem.style.border = '0';
            this.fakeElem.style.padding = '0';
            this.fakeElem.style.margin = '0';
            // Move element out of screen horizontally
            this.fakeElem.style.position = 'fixed';
            this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
            // Move element to the same position vertically
            this.fakeElem.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
            this.fakeElem.setAttribute('readonly', '');
            this.fakeElem.value = this.text;

            document.body.appendChild(this.fakeElem);

            this.selectedText = (0, _select2.default)(this.fakeElem);
            this.copyText();
        };

        ClipboardAction.prototype.removeFake = function removeFake() {
            if (this.fakeHandler) {
                document.body.removeEventListener('click');
                this.fakeHandler = null;
            }

            if (this.fakeElem) {
                document.body.removeChild(this.fakeElem);
                this.fakeElem = null;
            }
        };

        ClipboardAction.prototype.selectTarget = function selectTarget() {
            this.selectedText = (0, _select2.default)(this.target);
            this.copyText();
        };

        ClipboardAction.prototype.copyText = function copyText() {
            var succeeded = undefined;

            try {
                succeeded = document.execCommand(this.action);
            } catch (err) {
                succeeded = false;
            }

            this.handleResult(succeeded);
        };

        ClipboardAction.prototype.handleResult = function handleResult(succeeded) {
            if (succeeded) {
                this.emitter.emit('success', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            } else {
                this.emitter.emit('error', {
                    action: this.action,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        };

        ClipboardAction.prototype.clearSelection = function clearSelection() {
            if (this.target) {
                this.target.blur();
            }

            window.getSelection().removeAllRanges();
        };

        ClipboardAction.prototype.destroy = function destroy() {
            this.removeFake();
        };

        _createClass(ClipboardAction, [{
            key: 'action',
            set: function set() {
                var action = arguments.length <= 0 || arguments[0] === undefined ? 'copy' : arguments[0];

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
},{"select":"/srv/zotero/my-publications/node_modules/select/src/select.js"}],"/srv/zotero/my-publications/node_modules/clipboard/lib/clipboard.js":[function(require,module,exports){
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

            var _this = _possibleConstructorReturn(this, _Emitter.call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        Clipboard.prototype.resolveOptions = function resolveOptions() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
            this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
            this.text = typeof options.text === 'function' ? options.text : this.defaultText;
        };

        Clipboard.prototype.listenClick = function listenClick(trigger) {
            var _this2 = this;

            this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                return _this2.onClick(e);
            });
        };

        Clipboard.prototype.onClick = function onClick(e) {
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
        };

        Clipboard.prototype.defaultAction = function defaultAction(trigger) {
            return getAttributeValue('action', trigger);
        };

        Clipboard.prototype.defaultTarget = function defaultTarget(trigger) {
            var selector = getAttributeValue('target', trigger);

            if (selector) {
                return document.querySelector(selector);
            }
        };

        Clipboard.prototype.defaultText = function defaultText(trigger) {
            return getAttributeValue('text', trigger);
        };

        Clipboard.prototype.destroy = function destroy() {
            this.listener.destroy();

            if (this.clipboardAction) {
                this.clipboardAction.destroy();
                this.clipboardAction = null;
            }
        };

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
},{"./clipboard-action":"/srv/zotero/my-publications/node_modules/clipboard/lib/clipboard-action.js","good-listener":"/srv/zotero/my-publications/node_modules/good-listener/src/listen.js","tiny-emitter":"/srv/zotero/my-publications/node_modules/tiny-emitter/index.js"}],"/srv/zotero/my-publications/node_modules/closest/index.js":[function(require,module,exports){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf) {
  var parent = checkYoSelf ? element : element.parentNode

  while (parent && parent !== document) {
    if (matches(parent, selector)) return parent;
    parent = parent.parentNode
  }
}

},{"matches-selector":"/srv/zotero/my-publications/node_modules/matches-selector/index.js"}],"/srv/zotero/my-publications/node_modules/d/index.js":[function(require,module,exports){
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

},{"es5-ext/object/assign":"/srv/zotero/my-publications/node_modules/es5-ext/object/assign/index.js","es5-ext/object/is-callable":"/srv/zotero/my-publications/node_modules/es5-ext/object/is-callable.js","es5-ext/object/normalize-options":"/srv/zotero/my-publications/node_modules/es5-ext/object/normalize-options.js","es5-ext/string/#/contains":"/srv/zotero/my-publications/node_modules/es5-ext/string/#/contains/index.js"}],"/srv/zotero/my-publications/node_modules/delegate/src/delegate.js":[function(require,module,exports){
var closest = require('closest');

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
        e.delegateTarget = closest(e.target, selector, true);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"closest":"/srv/zotero/my-publications/node_modules/closest/index.js"}],"/srv/zotero/my-publications/node_modules/es5-ext/global.js":[function(require,module,exports){
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

},{"./is-symbol":"/srv/zotero/my-publications/node_modules/es6-symbol/is-symbol.js"}],"/srv/zotero/my-publications/node_modules/good-listener/src/is.js":[function(require,module,exports){
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

},{}],"/srv/zotero/my-publications/node_modules/good-listener/src/listen.js":[function(require,module,exports){
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

},{"./is":"/srv/zotero/my-publications/node_modules/good-listener/src/is.js","delegate":"/srv/zotero/my-publications/node_modules/delegate/src/delegate.js"}],"/srv/zotero/my-publications/node_modules/matches-selector/index.js":[function(require,module,exports){

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}
},{}],"/srv/zotero/my-publications/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
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
    var timeout = setTimeout(cleanUpNextTick);
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
    clearTimeout(timeout);
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
        setTimeout(drainQueue, 0);
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

},{}],"/srv/zotero/my-publications/node_modules/select/src/select.js":[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
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

},{}],"/srv/zotero/my-publications/node_modules/tiny-emitter/index.js":[function(require,module,exports){
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

},{}],"/srv/zotero/my-publications/src/js/api.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FORMATTED_DATE_SYMBOL = exports.AUTHORS_SYMBOL = exports.ABSTRACT_NOTE_PROCESSED = undefined;
exports.processResponse = processResponse;
exports.fetchUntilExhausted = fetchUntilExhausted;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils.js');

var _data = require('./data.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('es6-symbol/implement');
const ABSTRACT_NOTE_PROCESSED = exports.ABSTRACT_NOTE_PROCESSED = Symbol.for('abstractNoteProcessed');
const AUTHORS_SYMBOL = exports.AUTHORS_SYMBOL = Symbol.for('authors');
const FORMATTED_DATE_SYMBOL = exports.FORMATTED_DATE_SYMBOL = Symbol.for('formattedDate');

/**
 * Process raw API response
 * @param  {Object[]} response - The raw API response
 * @param  {Object} config     - Global ZoteroPublications config
 * @return {Object[]}          - Processed API response
 */
function processResponse(response, config) {
	if (response) {
		let childItems = [];
		let index = {};

		for (var i = response.length; i--;) {
			let item = response[i];
			if (item.data && item.data.abstractNote) {
				item.data[ABSTRACT_NOTE_PROCESSED] = (0, _utils.formatAbstract)(item.data.abstractNote);
			}
			if (item.data && item.data.creators) {
				item.data[AUTHORS_SYMBOL] = item.data.creators.map(author => {
					if (author.firstName && author.lastName) {
						return author.firstName + ' ' + author.lastName;
					} else if (author.name) {
						return author.name;
					}
				}).join(' & ');
			}
			if (item.data && item.meta.parsedDate) {
				item.data[FORMATTED_DATE_SYMBOL] = (0, _utils.formatDate)(item.meta.parsedDate);
			}
			if (item.data && item.data.parentItem) {
				response.splice(i, 1);
				childItems.push(item);
			}
			if (item.data && item.data.url) {
				item[_data.VIEW_ONLINE_URL] = item.data.url;
			}
			index[item.key] = item;
		}

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = childItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				let item = _step.value;

				if (!index[item.data.parentItem]) {
					console.warn(`item ${ item.key } has parentItem ${ item.data.parentItem } that does not exist in the dataset`);
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
					if (!index[item.data.parentItem][_data.VIEW_ONLINE_URL]) {
						if (item.data.url) {
							index[item.data.parentItem][_data.VIEW_ONLINE_URL] = item.url;
						} else if (item.links && item.links.enclosure && item.links.enclosure.href) {
							index[item.data.parentItem][_data.VIEW_ONLINE_URL] = item.links.enclosure.href;
						} else {
							index[item.data.parentItem][_data.CHILD_ATTACHMENTS].push(item);
						}
					} else {
						index[item.data.parentItem][_data.CHILD_ATTACHMENTS].push(item);
					}
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
	let relRegex = /<(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))>;\s*rel="next"/;
	jsondata = jsondata || [];

	return new Promise((resolve, reject) => {
		fetch(url, options).then(response => {
			if (response.status >= 200 && response.status < 300) {
				if (response.headers.has('Link')) {
					let matches = response.headers.get('Link').match(relRegex);
					if (matches && matches.length >= 2) {
						response.json().then(jsonDataPart => {
							if (!(jsonDataPart instanceof Array)) {
								jsonDataPart = [jsonDataPart];
							}
							resolve(fetchUntilExhausted(matches[1], options, _lodash2.default.union(jsondata, jsonDataPart)));
						});
					} else {
						response.json().then(jsonDataPart => {
							if (!(jsonDataPart instanceof Array)) {
								jsonDataPart = [jsonDataPart];
							}
							resolve(_lodash2.default.union(jsondata, jsonDataPart));
						});
					}
				} else {
					response.json().then(jsonDataPart => {
						if (!(jsonDataPart instanceof Array)) {
							jsonDataPart = [jsonDataPart];
						}
						resolve(_lodash2.default.union(jsondata, jsonDataPart));
					});
				}
			} else {
				reject(new Error(`Unexpected status code ${ response.status } when requesting ${ url }`));
			}
		}).catch(() => {
			reject(new Error(`Unexpected error when requesting ${ url }`));
		});
	});
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./data.js":"/srv/zotero/my-publications/src/js/data.js","./utils.js":"/srv/zotero/my-publications/src/js/utils.js","es6-symbol/implement":"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js"}],"/srv/zotero/my-publications/src/js/data.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.VIEW_ONLINE_URL = exports.GROUP_TITLE = exports.GROUP_EXPANDED_SUMBOL = exports.CHILD_OTHER = exports.CHILD_ATTACHMENTS = exports.CHILD_NOTES = exports.GROUPED_BY_COLLECTION = exports.GROUPED_BY_TYPE = exports.GROUPED_NONE = undefined;
exports.ZoteroData = ZoteroData;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _api = require('./api.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('es6-symbol/implement');
const GROUPED_NONE = exports.GROUPED_NONE = 0;
const GROUPED_BY_TYPE = exports.GROUPED_BY_TYPE = 1;
const GROUPED_BY_COLLECTION = exports.GROUPED_BY_COLLECTION = 2;
const CHILD_NOTES = exports.CHILD_NOTES = Symbol.for('childNotes');
const CHILD_ATTACHMENTS = exports.CHILD_ATTACHMENTS = Symbol.for('childAttachments');
const CHILD_OTHER = exports.CHILD_OTHER = Symbol.for('childOther');
const GROUP_EXPANDED_SUMBOL = exports.GROUP_EXPANDED_SUMBOL = Symbol.for('groupExpanded');
const GROUP_TITLE = exports.GROUP_TITLE = Symbol.for('groupTitle');
const VIEW_ONLINE_URL = exports.VIEW_ONLINE_URL = Symbol.for('viewOnlineUrl');

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
		get: () => {
			return this.raw.length || 0;
		}
	});
}

/**
 * Group data by type
 * @param  {String|String[]} [expand=[]] - List of types which should appear pre-expanded.
 *                                         Alternatively string "all" is accepted.
 */
ZoteroData.prototype.groupByType = function (expand) {
	let groupedData = {};
	expand = expand || [];
	for (let i = this.raw.length; i--;) {
		let item = this.raw[i];

		if (!groupedData[item.data.itemType]) {
			groupedData[item.data.itemType] = [];
		}
		groupedData[item.data.itemType].push(item);
		groupedData[item.data.itemType][GROUP_EXPANDED_SUMBOL] = expand === 'all' || _lodash2.default.includes(expand, item.data.itemType);
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
ZoteroData.prototype[Symbol.iterator] = regeneratorRuntime.mark(function _callee() {
	var keys, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, group, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, value;

	return regeneratorRuntime.wrap(function _callee$(_context) {
		while (1) switch (_context.prev = _context.next) {
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

				group[GROUP_TITLE] = key;
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
	}, _callee, this, [[5, 18, 22, 30], [23,, 25, 29], [35, 46, 50, 58], [51,, 53, 57]]);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","es6-symbol/implement":"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js"}],"/srv/zotero/my-publications/src/js/field-map.js":[function(require,module,exports){
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

},{}],"/srv/zotero/my-publications/src/js/hidden-fields.js":[function(require,module,exports){
'use strict';

/**
 * List of property fields that should not be displayed in the UI
 * @type {Array}
 */
module.exports = ['mimeType', 'linkMode', 'charset', 'md5', 'mtime', 'version', 'key', 'collections', 'relations', 'parentItem', 'contentType', 'filename', 'tags', 'creators', 'abstractNote', //displayed separately
'dateModified', 'dateAdded', 'accessDate', 'libraryCatalog'];

},{}],"/srv/zotero/my-publications/src/js/main-modern.js":[function(require,module,exports){
'use strict';

require('babel-regenerator-runtime');

var _main = require('./main.js');

module.exports = _main.ZoteroPublications;

},{"./main.js":"/srv/zotero/my-publications/src/js/main.js","babel-regenerator-runtime":"/srv/zotero/my-publications/node_modules/babel-regenerator-runtime/runtime.js"}],"/srv/zotero/my-publications/src/js/main.js":[function(require,module,exports){
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
	if (arguments.length > 3) {
		return Promise.reject(new Error('ZoteroPublications takes between one and three arguments. ${arguments.length} is too many.'));
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

	function init() {
		if (this.config.zorgIntegration) {
			this.config.zorgIntegration = typeof Zotero !== 'undefined' ? Zotero.config && Zotero.config.loggedInUser || Zotero.currentUser : false;
			this.config.zorgIntegration['apiKey'] = Zotero.config.apiKey;
		}

		if (arguments.length > 1) {
			return this.render(arguments[0], arguments[1]);
		}
	}

	let promise = new Promise((resolve, reject) => {
		var possiblePromise;
		if (typeof document !== 'undefined' && document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', ev => {
				possiblePromise = init.apply(this, arguments);
			});
		} else {
			possiblePromise = init.apply(this, arguments);
		}
		if (possiblePromise && possiblePromise.then) {
			possiblePromise.then(result => resolve(result));
			possiblePromise.catch(result => reject(result));
		}
	});

	if (arguments.length > 1) {
		return promise;
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
	citeStyleOptions: {
		'american-anthropological-association': 'American Anthropological Association',
		'asa': 'American Psychological Association 6th edition',
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
ZoteroPublications.prototype.get = function (url, params = {}, init = {}) {
	params = _lodash2.default.extend({}, this.config.getQueryParamsDefault, params);
	init = _lodash2.default.extend({
		headers: {
			'Accept': 'application/json'
		}
	}, init);

	if (params.include instanceof Array) {
		params.include = params.include.join(',');
	}

	let queryParams = _lodash2.default.map(params, (value, key) => `${ key }=${ value }`).join('&');
	url = `${ url }?${ queryParams }`;

	return new Promise((resolve, reject) => {
		let promise = (0, _api.fetchUntilExhausted)(url, init);
		promise.then(responseJson => {
			let data = new _data.ZoteroData(responseJson, this.config);
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
ZoteroPublications.prototype.post = function (url, data, params = {}, init = {}) {
	let queryParams = _lodash2.default.map(params, (value, key) => `${ key }=${ value }`).join('&');
	init = _lodash2.default.extend({
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}, init);
	url = `${ url }?${ queryParams }`;

	return fetch(url, init);
};

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint 	- An API endpoint from which data should be obtained
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Resolved with ZoteroData object on success, rejected
 *                        		in case of any network/response problems
 */
ZoteroPublications.prototype.getEndpoint = function (endpoint, params = {}) {
	let apiBase = this.config.apiBase,
	    url = `https://${ apiBase }/${ endpoint }`;

	return this.get(url, params);
};

/**
 * Build url for an endpoint and use it to post data
 * @param  {String} endpoint 	- An API endpoint
 * @param  {[type]} data 		- Raw data posted as part of the request
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Fetch promise
 */
ZoteroPublications.prototype.postEndpoint = function (endpoint, data, params = {}) {
	let apiBase = this.config.apiBase,
	    url = `https://${ apiBase }/${ endpoint }`;

	return this.post(url, data, params);
};

/**
 * Build url for getting user's publications then fetch entire dataset recursively
 * @param  {Number} userId 		- User id
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Resolved with ZoteroData object on success, rejected
 *                        		in case of any network/response problems
 */
ZoteroPublications.prototype.getPublications = function (userId, params = {}) {
	this.userId = userId;
	return this.getEndpoint(`users/${ userId }/publications/items`, params);
};

/**
 * Build url for getting a single item from user's publications then fetch it
 * @param  {String} itemId 		- Item key
 * @param  {Number} userId 		- User id
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise}			- Resolved with ZoteroData object on success, rejected
 *                       		in case of any network/response problems
 */
ZoteroPublications.prototype.getPublication = function (itemId, userId, params = {}) {
	return this.getEndpoint(`users/${ userId }/publications/items/${ itemId }`, params);
};

/**
 * Build url for sending one or more items to user's library then post it
 * @param  {Number} userId 		- User id
 * @param  {Object} data 		- Raw data posted as part of the request
 * @param  {?Object} params 	- Optional additional query string params
 * @return {Promise} 			- Fetch promise
 */
ZoteroPublications.prototype.postItems = function (userId, data, params = {}) {
	return this.postEndpoint(`users/${ userId }/items`, data, params);
};

/**
 * Render local or remote items.
 * @param  {String|ZoteroData} endpointOrData - Data containung publications to be rendered
 * @param  {HTMLElement} container            - A DOM element where publications will be rendered
 * @return {Promise}                          - Resolved when rendered or rejected on error.
 */
ZoteroPublications.prototype.render = function (userIdOrendpointOrData, container) {
	return new Promise(function (resolve, reject) {
		if (!(container instanceof HTMLElement)) {
			reject(new Error('Second argument to render() method must be a DOM element'));
		}
		if (userIdOrendpointOrData instanceof _data.ZoteroData) {
			let data = userIdOrendpointOrData;
			if (this.config.group === 'type') {
				data.groupByType(this.config.expand);
			}
			this.renderer = new _render.ZoteroRenderer(container, this);
			this.renderer.displayPublications(data);
			if (this.config.useHistory && location.hash) {
				this.renderer.expandDetails(location.hash.substr(1));
			}
			resolve();
		} else if (typeof userIdOrendpointOrData === 'number') {
			let userId = userIdOrendpointOrData;
			let promise = this.getPublications(userId);
			this.renderer = new _render.ZoteroRenderer(container, this);
			promise.then(data => {
				if (this.config.group === 'type') {
					data.groupByType(this.config.expand);
				}
				this.renderer.displayPublications(data);
				if (this.config.useHistory && location.hash) {
					this.renderer.expandDetails(location.hash.substr(1));
				}
				resolve();
			});
			promise.catch(() => {
				reject(arguments[0]);
			});
		} else if (typeof userIdOrendpointOrData === 'string') {
			let endpoint = userIdOrendpointOrData;
			let promise = this.getEndpoint(endpoint);
			this.renderer = new _render.ZoteroRenderer(container, this);
			promise.then(data => {
				if (this.config.group === 'type') {
					data.groupByType(this.config.expand);
				}
				this.renderer.displayPublications(data);
				if (this.config.useHistory && location.hash) {
					this.renderer.expandDetails(location.hash.substr(1));
				}
				resolve();
			});
			promise.catch(() => {
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

/**
 * Make ZoteroRenderer publicly accessible underneath ZoteroPublications
 * @type {ZoteroRenderer}
 */
ZoteroPublications.ZoteroRenderer = _render.ZoteroRenderer;

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

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

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

var _export = require('./tpl/partial/export.tpl');

var _export2 = _interopRequireDefault(_export);

var _groupView = require('./tpl/group-view.tpl');

var _groupView2 = _interopRequireDefault(_groupView);

var _plainView = require('./tpl/plain-view.tpl');

var _plainView2 = _interopRequireDefault(_plainView);

var _data = require('./data.js');

var _utils = require('./utils.js');

var _api = require('./api.js');

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
 * @param {HTMLElement} container	- A container where contents is rendered
 * @param {Object} [config]			- ZoteroPublications config
 */
function ZoteroRenderer(container, zotero) {
	this.container = container;
	this.zotero = zotero;
	this.config = zotero.config;
	this.fieldMap = _fieldMap2.default;
	this.typeMap = _typeMap2.default;
	this.hiddenFields = _hiddenFields2.default;
	if (this.config.storeCitationPreference) {
		this.preferredCitationStyle = localStorage.getItem('zotero-citation-preference');
	} else {
		this.preferredCitationStyle = '';
	}
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
 * Render citation part of a single Zotero using custom template
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
ZoteroRenderer.prototype.renderItemTemplated = function (zoteroItem) {
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
ZoteroRenderer.prototype.renderItemCitation = function (zoteroItem) {
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
 * @param {ZoteroData} 	- List of groups to render
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
 * @param  {ZoteroData} zoteroItems - List of Zotero items
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
	if (this.config.showBranding) {
		return (0, _branding2.default)();
	} else {
		return '';
	}
};

/**
 * Render Zotero publications into a DOM element
 * @param  {ZoteroData} data       - Source of publications to be rendered
 */
ZoteroRenderer.prototype.displayPublications = function (data) {
	var markup;

	this.data = data;

	if (data.grouped > 0) {
		markup = this.renderGroupView(data);
	} else {
		markup = this.renderPlainView(data);
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
ZoteroRenderer.prototype.updateCitation = function (itemEl, citationStyle) {
	let itemId = itemEl.getAttribute('data-item');
	let citationEl = itemEl.querySelector('.zotero-citation');
	let citationStyleSelectEl = itemEl.querySelector('[data-trigger="cite-style-selection"]');

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

	this.zotero.getPublication(itemId, this.zotero.userId, {
		'citationStyle': citationStyle,
		'include': ['bib'],
		'group': false
	}).then(item => {
		citationEl.classList.remove('zotero-loading-inline');
		citationEl.innerHTML = item.raw[0].bib;
	});
};

/**
 * Prepare a link for downloading item export
 * @param {HTMLElement} [itemEl] - dom element containing the item
 */
ZoteroRenderer.prototype.prepareExport = function (itemEl) {
	let itemId = itemEl.getAttribute('data-item');
	let exportEl = itemEl.querySelector('.zotero-export');
	let exportFormatSelectEl = itemEl.querySelector('[data-trigger="export-format-selection"]');
	let exportFormat = exportFormatSelectEl.options[exportFormatSelectEl.selectedIndex].value;

	exportEl.innerHTML = '';
	exportEl.classList.add('zotero-loading-inline');

	this.zotero.getPublication(itemId, this.zotero.userId, {
		'include': [exportFormat],
		'group': false
	}).then(item => {
		let itemData = (_lodash2.default.findWhere || _lodash2.default.find)(this.data.raw, { 'key': itemId });
		let encoded = window.btoa(item.raw[0][exportFormat]);
		exportEl.classList.remove('zotero-loading-inline');
		exportEl.innerHTML = (0, _export2.default)({
			'filename': itemData.data.title + '.' + this.zotero.config.exportFormats[exportFormat].extension,
			'content': encoded,
			'contentType': this.zotero.config.exportFormats[exportFormat].contentType
		});
	});
};

/**
 * Attach interaction handlers
 */
ZoteroRenderer.prototype.addHandlers = function () {
	let clipboard = new _clipboard2.default('.zotero-citation-copy');

	clipboard.on('success', function (e) {
		e.clearSelection();
		e.trigger.setAttribute('aria-label', 'Copied!');
	});

	clipboard.on('error', function (e) {
		e.trigger.setAttribute('aria-label', (0, _utils.clipboardFallbackMessage)(e.action));
	});

	this.container.addEventListener('mouseout', ev => {
		if (ev.target.classList.contains('zotero-citation-copy')) {
			ev.target.blur();
			ev.target.setAttribute('aria-label', 'Copy to clipboard');
		}
	});

	this.container.addEventListener('click', ev => {
		var target;

		target = (0, _utils.closest)(ev.target, el => el.hasAttribute && el.hasAttribute('data-trigger'));

		if (target) {
			ev.preventDefault();
			let itemEl = (0, _utils.closest)(target, el => el.hasAttribute && el.hasAttribute('data-item'));
			if (target.getAttribute('data-trigger') === 'details') {
				this.toggleDetails(itemEl);
			} else if (target.getAttribute('data-trigger') === 'cite' || target.getAttribute('data-trigger') === 'export') {
				(0, _utils.showTab)(target);
			} else if (target.getAttribute('data-trigger') === 'add-to-library') {
				if (this.zotero.config.zorgIntegration) {
					this.saveToMyLibrary(target, itemEl);
				}
			}
		}
	});

	this.container.addEventListener('change', ev => {
		let target = (0, _utils.closest)(ev.target, el => el.hasAttribute && el.hasAttribute('data-trigger'));
		let itemEl = (0, _utils.closest)(target, el => el.hasAttribute && el.hasAttribute('data-item'));
		if (target.getAttribute('data-trigger') === 'cite-style-selection') {
			this.updateCitation(itemEl);
		} else if (target.getAttribute('data-trigger') === 'export-format-selection') {
			this.prepareExport(itemEl);
		}
	});

	window.addEventListener('resize', _lodash2.default.debounce(this.updateVisuals).bind(this));
};

/**
 * Update .zotero-line to align with left border of the screen on small
 * devices, provided that the container is no more than 30px from the
 * border (and no less than 4px required for the actual line and 1px space)
 */
ZoteroRenderer.prototype.updateVisuals = function () {
	if (!this.zoteroLines) {
		this.zoteroLines = this.container.querySelectorAll('.zotero-line');
	}

	_lodash2.default.each(this.zoteroLines, zoteroLineEl => {
		let offset = `${ this.container.offsetLeft * -1 }px`;
		if (window.innerWidth < 768 && this.container.offsetLeft <= 30 && this.container.offsetLeft > 3) {
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
ZoteroRenderer.prototype.toggleSpinner = function (activate) {
	var method = activate === null ? this.container.classList.toggle : activate ? this.container.classList.add : this.container.classList.remove;
	method.call(this.container.classList, 'zotero-loading');
};

/**
 * Expand (if collapsed) or collapse (if expanded) item details. Optionally override to force
 * either expand or collapse
 * @param  {HTMLElement} itemEl 	- DOM element where item is
 * @param  {boolean} override 		- override whether to expand or collapse details
 */
ZoteroRenderer.prototype.toggleDetails = function (itemEl, override) {
	let detailsEl = itemEl.querySelector('.zotero-details');
	if (detailsEl) {
		let expanded = (0, _utils.toggleCollapse)(detailsEl, override);
		if (expanded) {
			this.prepareExport(itemEl);
			this.updateCitation(itemEl, this.preferredCitationStyle);
			itemEl.classList.add('zotero-details-open');
		} else {
			itemEl.classList.remove('zotero-details-open');
		}
	}
	if (this.config.useHistory) {
		window.history.pushState(null, null, `#${ itemEl.getAttribute('data-item') }`);
	}
};

/**
 * Expand item details based on the item id.
 * @param  {string} itemId
 */
ZoteroRenderer.prototype.expandDetails = function (itemId) {
	let itemEl = document.getElementById(`item-${ itemId }`);
	this.toggleDetails(itemEl, true);
	(0, _utils.once)(itemEl, (0, _utils.transitionend)(), () => {
		itemEl.scrollIntoView();
	});
};

/**
 * On Zotero.org adds item to currently logged-in user's library
 * @param  {HTMLElement} triggerEl 	- DOM Element that triggered saving, usually a button
 * @param  {HTMLElement} itemEl 	- DOM element where the item is located
 */
ZoteroRenderer.prototype.saveToMyLibrary = function (triggerEl, itemEl) {
	triggerEl.innerText = 'Saving...';
	triggerEl.removeAttribute('data-trigger');
	let itemId = itemEl.getAttribute('data-item');
	let sourceItem = (_lodash2.default.findWhere || _lodash2.default.find)(this.data.raw, { 'key': itemId });
	let clonedItem = {};
	let ignoredFields = ['mimeType', 'linkMode', 'charset', 'md5', 'mtime', 'version', 'key', 'collections', 'parentItem', 'contentType', 'filename', 'tags', 'dateAdded', 'dateModified'];

	_lodash2.default.forEach(sourceItem.data, (value, key) => {
		if (!_lodash2.default.includes(ignoredFields, key)) {
			clonedItem[key] = value;
		}
	});

	if (!clonedItem.relations) {
		clonedItem.relations = {};
	}

	clonedItem.relations = {
		'owl:sameAs': `http://zotero.org/publications/${ sourceItem.library.id }/items/${ itemId }`
	};

	let writePromise = this.zotero.postItems(this.zotero.config.zorgIntegration.userID, [clonedItem], { key: this.zotero.config.zorgIntegration.apiKey });

	writePromise.then(() => {
		triggerEl.innerText = 'Saved!';
	});
	writePromise.catch(() => {
		triggerEl.innerText = 'Error!';
		triggerEl.setAttribute('data-trigger', 'add-to-library');
		setTimeout(() => {
			triggerEl.innerText = 'Add to Library';
		}, 2000);
	});
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","./data.js":"/srv/zotero/my-publications/src/js/data.js","./field-map.js":"/srv/zotero/my-publications/src/js/field-map.js","./hidden-fields.js":"/srv/zotero/my-publications/src/js/hidden-fields.js","./tpl/group-view.tpl":"/srv/zotero/my-publications/src/js/tpl/group-view.tpl","./tpl/partial/branding.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/branding.tpl","./tpl/partial/export.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/export.tpl","./tpl/partial/group.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/group.tpl","./tpl/partial/groups.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/groups.tpl","./tpl/partial/item-citation.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/item-citation.tpl","./tpl/partial/item-templated.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/item-templated.tpl","./tpl/partial/item.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/item.tpl","./tpl/partial/items.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/items.tpl","./tpl/plain-view.tpl":"/srv/zotero/my-publications/src/js/tpl/plain-view.tpl","./type-map":"/srv/zotero/my-publications/src/js/type-map.js","./utils.js":"/srv/zotero/my-publications/src/js/utils.js","clipboard":"/srv/zotero/my-publications/node_modules/clipboard/lib/clipboard.js"}],"/srv/zotero/my-publications/src/js/tpl/group-view.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function () {
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
      print = function () {
    __p += __j.call(arguments, '');
  };
  __p += '<div class="zotero-branding">\n\t<a href="http://www.zotero.org" class="zotero-logo-link" aria-label="Zotero">\n\t\t<svg class="zotero-logo" version="1.1" xmlns="http://www.w3.org/2000/svg" width="90" height="20">\n\t\t\t<g>\n\t\t\t\t<path class="zotero-z" fill="#990000" d="M12.2,6.1L2.8,17.8h9.4v1.9H0v-2.2L9.4,5.8H0.8V3.9h11.4V6.1z"/>\n\t\t\t\t<path fill="#222222" d="M22.1,3.7c5.9,0,7,1.4,7,8.1c0,6.7-1.1,8.1-7,8.1c-5.9,0-7-1.4-7-8.1C15.1,5.2,16.2,3.7,22.1,3.7z M22.1,18\n\t\t\t\t\tc4.2,0,4.5-0.7,4.5-6.1c0-5.5-0.3-6.2-4.5-6.2c-4.2,0-4.5,0.7-4.5,6.2C17.5,17.3,17.8,18,22.1,18z"/>\n\t\t\t\t<path fill="#222222" d="M41.7,5.8h-6.1v10c0,1.7,0.5,2.1,2.2,2.1c2.2,0,2.2-1.2,2.2-2.7v-1.2h2.3v1.2c0,3.1-1.3,4.6-4.5,4.6\n\t\t\t\t\tc-3.7,0-4.5-1.1-4.5-4.8V5.8h-2.1V3.9h2.1V0.1h2.4v3.8h6.1V5.8z"/>\n\t\t\t\t<path fill="#222222" d="M58.3,14.9v0.6c0,4.2-3.2,4.4-6.7,4.4c-6.2,0-7.1-2-7.1-8.1c0-6.6,1.4-8.1,7.1-8.1c5.1,0,6.7,1.2,6.7,7v1.6\n\t\t\t\t\tH46.9c0,5,0.4,5.6,4.6,5.6c3.3,0,4.3-0.2,4.3-2.4v-0.6H58.3z M55.8,10.4c-0.1-4.5-0.7-4.8-4.3-4.8c-4.3,0-4.5,1.1-4.6,4.8H55.8z"/>\n\t\t\t\t<path fill="#222222" d="M64.6,3.9l-0.1,2l0.1,0.1c0.8-1.7,2.7-2.2,4.5-2.2c3,0,4.4,1.5,4.4,4.5v1.1h-2.3V8.3c0-2-0.7-2.6-2.6-2.6\n\t\t\t\t\tc-3,0-3.9,1.4-3.9,4.2v9.8h-2.4V3.9H64.6z"/>\n\t\t\t\t<path fill="#222222" d="M83,3.7c5.9,0,7,1.4,7,8.1c0,6.7-1.1,8.1-7,8.1c-5.9,0-7-1.4-7-8.1C76,5.2,77.1,3.7,83,3.7z M83,18\n\t\t\t\t\tc4.2,0,4.5-0.7,4.5-6.1c0-5.5-0.3-6.2-4.5-6.2c-4.2,0-4.5,0.7-4.5,6.2C78.4,17.3,78.7,18,83,18z"/>\n\t\t\t</g>\n\t\t</svg>\n\t</a>\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/export.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function () {
    __p += __j.call(arguments, '');
  };
  __p += '<a href="data:' + ((__t = obj.contentType) == null ? '' : _.escape(__t)) + ';base64,' + ((__t = obj.content) == null ? '' : _.escape(__t)) + '" download="' + ((__t = obj.filename) == null ? '' : _.escape(__t)) + '">\n\tDownload\n</a>';
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
      print = function () {
    __p += __j.call(arguments, '');
  };
  __p += '<li class="zotero-group' + ((__t = obj.expand ? ' zotero-group-expanded' : '') == null ? '' : _.escape(__t)) + '" aria-expanded="' + ((__t = obj.expand ? 'true' : 'false') == null ? '' : _.escape(__t)) + '" role="listitem">\n\n\t<h2 class="zotero-group-title" data-trigger="expand-group">' + ((__t = obj.title) == null ? '' : _.escape(__t)) + '</h2>\n\t' + ((__t = obj.renderer.renderItems(obj.items)) == null ? '' : __t) + '\n</li>';
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
      print = function () {
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
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/item-citation.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function () {
    __p += __j.call(arguments, '');
  };
  __p += '<h3 class="zotero-item-title">\n\t';
  if (obj.item[Symbol.for('viewOnlineUrl')]) {
    __p += '\n\t<a href="' + ((__t = obj.item[Symbol.for('viewOnlineUrl')]) == null ? '' : _.escape(__t)) + '" target="_blank">\n\t\t' + ((__t = obj.item.citation) == null ? '' : __t) + '\n\t</a>\n\t';
  } else {
    __p += '\n\t\t' + ((__t = obj.item.citation) == null ? '' : __t) + '\n\t';
  }
  __p += '\n</h3>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/item-templated.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function () {
    __p += __j.call(arguments, '');
  };
  __p += '';
  if (obj.data.itemType == 'book') {
    __p += '\n\t<h3 class="zotero-item-title">\n\t\t';
    if (obj.item[Symbol.for('viewOnlineUrl')]) {
      __p += '\n\t\t\t<a href="' + ((__t = obj.item[Symbol.for('viewOnlineUrl')]) == null ? '' : _.escape(__t)) + '" target="_blank">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t';
    } else {
      __p += '\n\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t';
    }
    __p += '\n\t</h3>\n\t<div class="zotero-item-subline">\n\t\tBy ' + ((__t = obj.data[Symbol.for('authors')]) == null ? '' : _.escape(__t)) + '\n\t\t';
    if (obj.data[Symbol.for('formattedDate')]) {
      __p += '\n\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t';
    }
    __p += '\n\t</div>\n';
  } else if (obj.data.itemType == 'journalArticle') {
    __p += '\n\t<h3 class="zotero-item-title">\n\t\t';
    if (obj.item[Symbol.for('viewOnlineUrl')]) {
      __p += '\n\t\t\t<a href="' + ((__t = obj.item[Symbol.for('viewOnlineUrl')]) == null ? '' : _.escape(__t)) + '" target="_blank">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t';
    } else {
      __p += '\n\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t';
    }
    __p += '\n\t</h3>\n\t<div class="zotero-item-subline">\n\t\t' + ((__t = obj.data.journalAbbreviation) == null ? '' : _.escape(__t)) + '\n\t\t';
    if (obj.data[Symbol.for('formattedDate')]) {
      __p += '\n\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t';
    }
    __p += '\n\t</div>\n';
  } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') {
    __p += '\n\t<h3 class="zotero-item-title">\n\t\t';
    if (obj.item[Symbol.for('viewOnlineUrl')]) {
      __p += '\n\t\t\t<a href="' + ((__t = obj.item[Symbol.for('viewOnlineUrl')]) == null ? '' : _.escape(__t)) + '" target="_blank">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t';
    } else {
      __p += '\n\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t';
    }
    __p += '\n\t</h3>\n\t<div class="zotero-item-subline">\n\t\t' + ((__t = obj.data.publicationTitle) == null ? '' : _.escape(__t)) + '\n\t\t';
    if (obj.data[Symbol.for('formattedDate')]) {
      __p += '\n\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t';
    }
    __p += '\n\t</div>\n';
  } else if (obj.data.itemType == 'blogPost') {
    __p += '\n\t<h3 class="zotero-item-title">\n\t\t';
    if (obj.item[Symbol.for('viewOnlineUrl')]) {
      __p += '\n\t\t\t<a href="' + ((__t = obj.item[Symbol.for('viewOnlineUrl')]) == null ? '' : _.escape(__t)) + '" target="_blank">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t';
    } else {
      __p += '\n\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t';
    }
    __p += '\n\t</h3>\n\t<div class="zotero-item-subline">\n\t\t' + ((__t = obj.data.blogTitle) == null ? '' : _.escape(__t)) + '\n\t\t';
    if (obj.data[Symbol.for('formattedDate')]) {
      __p += '\n\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t';
    }
    __p += '\n\t</div>\n';
  } else {
    __p += '\n\t<h3 class="zotero-item-title">\n\t\t';
    if (obj.item[Symbol.for('viewOnlineUrl')]) {
      __p += '\n\t\t\t<a href="' + ((__t = obj.item[Symbol.for('viewOnlineUrl')]) == null ? '' : _.escape(__t)) + '" target="_blank">' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '</a>\n\t\t';
    } else {
      __p += '\n\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t';
    }
    __p += '\n\t</h3>\n\n\t';
    if (obj.item[Symbol.for('authors')] || obj.data[Symbol.for('formattedDate')]) {
      __p += '\n\t\t<div class="zotero-item-subline">\n\t\t\t';
      if (obj.item[Symbol.for('authors')]) {
        __p += '\n\t\t\t\tBy ' + ((__t = obj.data[Symbol.for('authors')]) == null ? '' : _.escape(__t)) + '\n\t\t\t';
      }
      __p += '\n\t\t\t\t\n\t\t\t';
      if (obj.data[Symbol.for('formattedDate')]) {
        __p += '\n\t\t\t(' + ((__t = obj.data[Symbol.for('formattedDate')]) == null ? '' : _.escape(__t)) + ')\n\t\t\t';
      }
      __p += '\n\t\t</div>\n\t';
    }
    __p += '\n';
  }
  __p += '';
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
      print = function () {
    __p += __j.call(arguments, '');
  };
  __p += '<li class="zotero-item zotero-' + ((__t = obj.data.itemType) == null ? '' : _.escape(__t)) + '" data-item="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '" id="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '" role="listitem">\n\t<a href="#" class="zotero-line" aria-hidden="true" role="presentation" tabindex="-1"></a>\n\n\t<!-- Citation -->\n\t';
  if (obj.renderer.config.useCitationStyle) {
    __p += '\n\t\t' + ((__t = obj.renderer.renderItemCitation(obj.item)) == null ? '' : __t) + '\n\t<!-- Templated -->\n\t';
  } else {
    __p += '\n\t\t' + ((__t = obj.renderer.renderItemTemplated(obj.item)) == null ? '' : __t) + '\n\t';
  }
  __p += '\n\n\t\n\t<div class="zotero-item-actions">\n\t\t<!-- Details toggle -->\n\t\t<a href="" data-trigger="details" aria-controls="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-details">\n\t\t\tDetails\n\t\t</a>\n\t\t';
  if (obj.renderer.zotero.config.zorgIntegration) {
    __p += '\n\t\t\t<button class="zotero-add-to-library" data-trigger="add-to-library">\n\t\t\t\tAdd to Library\n\t\t\t</button>\n\t\t';
  }
  __p += '\n\t</div>\n\t\n\t<!-- Details -->\n\t<section class="zotero-details zotero-collapsed zotero-collapsable" aria-hidden="true" aria-expanded="false" id="item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-details">\n\t\t<div class="zotero-details-inner">\n\t\t\t<div class="zotero-meta">\n\t\t\t\t';
  if (obj.item.data[Symbol.for('authors')]) {
    __p += '\n\t\t\t\t\t<div class="zotero-meta-item">\n\t\t\t\t\t\t<div class="zotero-meta-label">Authors</div>\n\t\t\t\t\t\t<div class="zotero-meta-value">' + ((__t = obj.item.data[Symbol.for('authors')]) == null ? '' : _.escape(__t)) + '</div>\n\t\t\t\t\t</div>\n\t\t\t\t';
  }
  __p += '\n\t\t\t\t';
  for (var i = 0, keys = Object.keys(obj.data); i < keys.length; i++) {
    __p += '\n\t\t\t\t\t';
    if (obj.renderer.hiddenFields.indexOf(keys[i]) === -1) {
      __p += '\n\t\t\t\t\t\t';
      if (obj.data[keys[i]]) {
        __p += '\n\t\t\t\t\t\t\t<div class="zotero-meta-item">\n\t\t\t\t\t\t\t\t<div class="zotero-meta-label">' + ((__t = obj.renderer.fieldMap[keys[i]]) == null ? '' : _.escape(__t)) + '</div>\n\t\t\t\t\t\t\t\t<div class="zotero-meta-value">\n\t\t\t\t\t\t\t\t\t';
        if (keys[i] === 'itemType') {
          __p += '\n\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.renderer.typeMap[obj.data[keys[i]]]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t\t\t';
        } else {
          __p += '\n\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.data[keys[i]]) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t\t\t';
        }
        __p += '\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t';
      }
      __p += '\n\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t';
  }
  __p += '\n\t\t\t</div>\n\t\t\t';
  if (obj.data.abstractNote && obj.data.abstractNote.length) {
    __p += '\n\t\t\t\t<h4>Abstract</h4>\n\t\t\t\t<div class="zotero-abstract">\n\t\t\t\t\t' + ((__t = obj.data[Symbol.for('abstractNoteProcessed')]) == null ? '' : __t) + '\n\t\t\t\t</div>\n\t\t\t';
  }
  __p += '\n\n\t\t\t';
  if (obj.item[Symbol.for('childNotes')] && obj.item[Symbol.for('childNotes')].length) {
    __p += '\n\t\t\t\t<h4>Notes</h4>\n\t\t\t\t<ul class="zotero-notes">\n\t\t\t\t\t';
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
    __p += '\n\t\t\t\t<h4>Attachments</h4>\n\t\t\t\t<ul class="zotero-attachments">\n\t\t\t\t\t';
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = obj.item[Symbol.for('childAttachments')][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var childItem = _step2.value;

        __p += '\n\t\t\t\t\t\t';
        if (childItem.url || childItem.links && childItem.links.enclosure && childItem.links.enclosure.href) {
          __p += '\n\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t<a href="' + ((__t = childItem.url || childItem.links && childItem.links.enclosure && childItem.links.enclosure.href) == null ? '' : _.escape(__t)) + '">\n\t\t\t\t\t\t\t\t<span class="zotero-icon zotero-icon-paperclip" role="presentation" aria-hidden="true"></span><!--\n\t\t\t\t\t\t\t\t-->' + ((__t = childItem.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t\t';
        }
        __p += '\n\t\t\t\t\t';
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
    if (!/iPhone|iPad/i.test(navigator.userAgent)) {
      __p += '\n\t\t\t\t\t\t\t\t<button class="zotero-citation-copy tooltipped tooltipped-e" data-clipboard-target="#item-' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-citation" aria-label="Copy to clipboard">Copy</button>\n\t\t\t\t\t\t\t';
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
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/items.tpl":[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
module.exports = function (obj) {
  var __t,
      __p = '',
      __j = Array.prototype.join,
      print = function () {
    __p += __j.call(arguments, '');
  };
  __p += '<ul class="zotero-items" role="' + ((__t = obj.renderer.data.grouped > 0 ? 'group' : 'list') == null ? '' : _.escape(__t)) + '">\n\t';
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
      print = function () {
    __p += __j.call(arguments, '');
  };
  __p += '<div class="zotero-publications">\n\t' + ((__t = obj.renderer.renderItems(obj.items)) == null ? '' : __t) + '\n\t' + ((__t = obj.renderer.renderBranding()) == null ? '' : __t) + '\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/type-map.js":[function(require,module,exports){
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

},{}],"/srv/zotero/my-publications/src/js/utils.js":[function(require,module,exports){
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
exports.transitionend = transitionend;
exports.toggleCollapse = toggleCollapse;
exports.showTab = showTab;
exports.clipboardFallbackMessage = clipboardFallbackMessage;

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
	let matches = isoDate.match(/(\d{4})\-?(\d{2})?-?(\d{2})?/);
	let date = isoDate;

	if (matches.length >= 4) {
		let year = matches[1];
		let month = months[parseInt(matches[2], 10) - 1];
		let day = parseInt(matches[3], 10);
		date = `${ month } ${ day }, ${ year }`;
	}
	if (matches.length >= 3) {
		let year = matches[1];
		let month = months[parseInt(matches[2], 10) - 1];
		date = `${ month } ${ year }`;
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
function transitionend() {
	var i,
	    el = document.createElement('div'),
	    transitions = {
		'transition': 'transitionend',
		'OTransition': 'otransitionend',
		'MozTransition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd'
	};

	for (i in transitions) {
		if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
			return transitions[i];
		}
	}
}

var collapsesInProgress = {};

function collapse(element) {
	let initialHeight = window.getComputedStyle(element).height;
	element.style.height = initialHeight;
	//repaint shenanigans
	element.offsetHeight; // eslint-disable-line no-unused-expressions

	_lodash2.default.defer(() => {
		element.classList.add('zotero-collapsed', 'zotero-collapsing');
		element.style.height = null;
		collapsesInProgress[id(element)] = once(element, transitionend(), () => {
			element.classList.remove('zotero-collapsing');
			element.setAttribute('aria-hidden', 'true');
			element.setAttribute('aria-expanded', 'true');
			delete collapsesInProgress[id(element)];
		});
	});
}

function uncollapse(element) {
	element.classList.remove('zotero-collapsed');
	let targetHeight = window.getComputedStyle(element).height;
	element.classList.add('zotero-collapsed');

	_lodash2.default.defer(() => {
		element.classList.add('zotero-collapsing');
		element.style.height = targetHeight;
		collapsesInProgress[id(element)] = once(element, transitionend(), () => {
			element.classList.remove('zotero-collapsed', 'zotero-collapsing');
			element.setAttribute('aria-hidden', 'false');
			element.setAttribute('aria-expanded', 'false');
			element.style.height = null;
			delete collapsesInProgress[id(element)];
		});
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
		let collapsing = !element.style.height;
		collapsing ? uncollapse(element) : collapse(element); // eslint-disable-line no-unused-expressions
		return collapsing;
	} else {
		let collapsed = element.classList.contains('zotero-collapsed');
		collapsed ? uncollapse(element) : collapse(element); // eslint-disable-line no-unused-expressions
		return collapsed;
	}
}

function showTab(targetTabEl) {
	let tablistEl = closest(targetTabEl, el => el.getAttribute('role') === 'tablist');
	let targetTabContainer = targetTabEl.parentElement;
	let tabs = tablistEl.querySelectorAll('li.zotero-tab');
	let tabpanelId = targetTabEl.getAttribute('aria-controls');
	let targetTabPanelEl = document.getElementById(tabpanelId);
	let tabPanelsWrapper = closest(targetTabPanelEl, el => el.classList.contains('zotero-tab-content'));
	let tabPanels = tabPanelsWrapper.querySelectorAll('.zotero-tabpanel');

	_lodash2.default.each(tabs, tabEl => {
		tabEl.classList.remove('zotero-tab-active');
		tabEl.querySelector('a').setAttribute('aria-selected', false);
	});
	_lodash2.default.each(tabPanels, tabPanelEl => {
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
	let actionMsg = '';

	if (/Mac/i.test(navigator.userAgent)) {
		actionMsg = 'Press ⌘-C to copy';
	} else {
		actionMsg = 'Press Ctrl-C to copy';
	}

	return actionMsg;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},["/srv/zotero/my-publications/src/js/main-modern.js"])("/srv/zotero/my-publications/src/js/main-modern.js")
});