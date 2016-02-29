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
'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _select = require('select');

var _select2 = _interopRequireDefault(_select);

/**
 * Inner class which performs selection from either `text` or `target`
 * properties and then executes copy or cut operations.
 */

var ClipboardAction = (function () {
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

    /**
     * Decides which selection strategy is going to be applied based
     * on the existence of `text` and `target` properties.
     */

    ClipboardAction.prototype.initSelection = function initSelection() {
        if (this.text && this.target) {
            throw new Error('Multiple attributes declared, use either "target" or "text"');
        } else if (this.text) {
            this.selectFake();
        } else if (this.target) {
            this.selectTarget();
        } else {
            throw new Error('Missing required attributes, use either "target" or "text"');
        }
    };

    /**
     * Creates a fake textarea element, sets its value from `text` property,
     * and makes a selection on it.
     */

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
        this.fakeElem.style.position = 'absolute';
        this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
        // Move element to the same position vertically
        this.fakeElem.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
        this.fakeElem.setAttribute('readonly', '');
        this.fakeElem.value = this.text;

        document.body.appendChild(this.fakeElem);

        this.selectedText = _select2['default'](this.fakeElem);
        this.copyText();
    };

    /**
     * Only removes the fake element after another click event, that way
     * a user can hit `Ctrl+C` to copy because selection still exists.
     */

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

    /**
     * Selects the content from element passed on `target` property.
     */

    ClipboardAction.prototype.selectTarget = function selectTarget() {
        this.selectedText = _select2['default'](this.target);
        this.copyText();
    };

    /**
     * Executes the copy operation based on the current selection.
     */

    ClipboardAction.prototype.copyText = function copyText() {
        var succeeded = undefined;

        try {
            succeeded = document.execCommand(this.action);
        } catch (err) {
            succeeded = false;
        }

        this.handleResult(succeeded);
    };

    /**
     * Fires an event based on the copy operation result.
     * @param {Boolean} succeeded
     */

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

    /**
     * Removes current selection and focus from `target` element.
     */

    ClipboardAction.prototype.clearSelection = function clearSelection() {
        if (this.target) {
            this.target.blur();
        }

        window.getSelection().removeAllRanges();
    };

    /**
     * Sets the `action` to be performed which can be either 'copy' or 'cut'.
     * @param {String} action
     */

    /**
     * Destroy lifecycle.
     */

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

        /**
         * Gets the `action` property.
         * @return {String}
         */
        get: function get() {
            return this._action;
        }

        /**
         * Sets the `target` property using an element
         * that will be have its content copied.
         * @param {Element} target
         */
    }, {
        key: 'target',
        set: function set(target) {
            if (target !== undefined) {
                if (target && typeof target === 'object' && target.nodeType === 1) {
                    this._target = target;
                } else {
                    throw new Error('Invalid "target" value, use a valid Element');
                }
            }
        },

        /**
         * Gets the `target` property.
         * @return {String|HTMLElement}
         */
        get: function get() {
            return this._target;
        }
    }]);

    return ClipboardAction;
})();

exports['default'] = ClipboardAction;
module.exports = exports['default'];
},{"select":"/srv/zotero/my-publications/node_modules/select/src/select.js"}],"/srv/zotero/my-publications/node_modules/clipboard/lib/clipboard.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _clipboardAction = require('./clipboard-action');

var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

var _tinyEmitter = require('tiny-emitter');

var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

var _goodListener = require('good-listener');

var _goodListener2 = _interopRequireDefault(_goodListener);

/**
 * Base class which takes one or more elements, adds event listeners to them,
 * and instantiates a new `ClipboardAction` on each click.
 */

var Clipboard = (function (_Emitter) {
    _inherits(Clipboard, _Emitter);

    /**
     * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
     * @param {Object} options
     */

    function Clipboard(trigger, options) {
        _classCallCheck(this, Clipboard);

        _Emitter.call(this);

        this.resolveOptions(options);
        this.listenClick(trigger);
    }

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */

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

    /**
     * Adds a click event listener to the passed trigger.
     * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
     */

    Clipboard.prototype.listenClick = function listenClick(trigger) {
        var _this = this;

        this.listener = _goodListener2['default'](trigger, 'click', function (e) {
            return _this.onClick(e);
        });
    };

    /**
     * Defines a new `ClipboardAction` on each click event.
     * @param {Event} e
     */

    Clipboard.prototype.onClick = function onClick(e) {
        var trigger = e.delegateTarget || e.currentTarget;

        if (this.clipboardAction) {
            this.clipboardAction = null;
        }

        this.clipboardAction = new _clipboardAction2['default']({
            action: this.action(trigger),
            target: this.target(trigger),
            text: this.text(trigger),
            trigger: trigger,
            emitter: this
        });
    };

    /**
     * Default `action` lookup function.
     * @param {Element} trigger
     */

    Clipboard.prototype.defaultAction = function defaultAction(trigger) {
        return getAttributeValue('action', trigger);
    };

    /**
     * Default `target` lookup function.
     * @param {Element} trigger
     */

    Clipboard.prototype.defaultTarget = function defaultTarget(trigger) {
        var selector = getAttributeValue('target', trigger);

        if (selector) {
            return document.querySelector(selector);
        }
    };

    /**
     * Default `text` lookup function.
     * @param {Element} trigger
     */

    Clipboard.prototype.defaultText = function defaultText(trigger) {
        return getAttributeValue('text', trigger);
    };

    /**
     * Destroy lifecycle.
     */

    Clipboard.prototype.destroy = function destroy() {
        this.listener.destroy();

        if (this.clipboardAction) {
            this.clipboardAction.destroy();
            this.clipboardAction = null;
        }
    };

    return Clipboard;
})(_tinyEmitter2['default']);

exports['default'] = Clipboard;
function getAttributeValue(suffix, element) {
    var attribute = 'data-clipboard-' + suffix;

    if (!element.hasAttribute(attribute)) {
        return;
    }

    return element.getAttribute(attribute);
}
module.exports = exports['default'];
},{"./clipboard-action":"/srv/zotero/my-publications/node_modules/clipboard/lib/clipboard-action.js","good-listener":"/srv/zotero/my-publications/node_modules/good-listener/src/listen.js","tiny-emitter":"/srv/zotero/my-publications/node_modules/tiny-emitter/index.js"}],"/srv/zotero/my-publications/node_modules/closest/index.js":[function(require,module,exports){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf) {
  var parent = checkYoSelf ? element : element.parentNode

  while (parent && parent !== document) {
    if (matches(parent, selector)) return parent;
    parent = parent.parentNode
  }
}

},{"matches-selector":"/srv/zotero/my-publications/node_modules/matches-selector/index.js"}],"/srv/zotero/my-publications/node_modules/core-js/es6/promise.js":[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js","../modules/es6.object.to-string":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.object.to-string.js","../modules/es6.promise":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.promise.js","../modules/es6.string.iterator":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.string.iterator.js","../modules/web.dom.iterable":"/srv/zotero/my-publications/node_modules/core-js/modules/web.dom.iterable.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_a-function.js":[function(require,module,exports){
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

},{"./_for-of":"/srv/zotero/my-publications/node_modules/core-js/modules/_for-of.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_array-includes.js":[function(require,module,exports){
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
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-index.js","./_to-iobject":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-iobject.js","./_to-length":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-length.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_classof.js":[function(require,module,exports){
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
var core = module.exports = {version: '2.1.0'};
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
},{"./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_enum-bug-keys.js":[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_export.js":[function(require,module,exports){
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
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_object-dp":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-dp.js","./_property-desc":"/srv/zotero/my-publications/node_modules/core-js/modules/_property-desc.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_html.js":[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_ie8-dom-define.js":[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_dom-create":"/srv/zotero/my-publications/node_modules/core-js/modules/_dom-create.js","./_fails":"/srv/zotero/my-publications/node_modules/core-js/modules/_fails.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_invoke.js":[function(require,module,exports){
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
},{"./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_object-create":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-create.js","./_property-desc":"/srv/zotero/my-publications/node_modules/core-js/modules/_property-desc.js","./_set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-to-string-tag.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-define.js":[function(require,module,exports){
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
},{"./_export":"/srv/zotero/my-publications/node_modules/core-js/modules/_export.js","./_has":"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js","./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_iter-create":"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-create.js","./_iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/_iterators.js","./_library":"/srv/zotero/my-publications/node_modules/core-js/modules/_library.js","./_object-gpo":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-gpo.js","./_redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine.js","./_set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-to-string-tag.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-detect.js":[function(require,module,exports){
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

module.exports = function(fn){
  var task = {fn: fn, next: undefined, domain: isNode && process.domain};
  if(last)last.next = task;
  if(!head){
    head = task;
    notify();
  } last = task;
};
},{"./_cof":"/srv/zotero/my-publications/node_modules/core-js/modules/_cof.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_task":"/srv/zotero/my-publications/node_modules/core-js/modules/_task.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_object-create.js":[function(require,module,exports){
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
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
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
},{"./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_dom-create":"/srv/zotero/my-publications/node_modules/core-js/modules/_dom-create.js","./_enum-bug-keys":"/srv/zotero/my-publications/node_modules/core-js/modules/_enum-bug-keys.js","./_html":"/srv/zotero/my-publications/node_modules/core-js/modules/_html.js","./_object-dps":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-dps.js","./_shared-key":"/srv/zotero/my-publications/node_modules/core-js/modules/_shared-key.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_object-dp.js":[function(require,module,exports){
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
},{"./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_ie8-dom-define":"/srv/zotero/my-publications/node_modules/core-js/modules/_ie8-dom-define.js","./_to-primitive":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-primitive.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_object-dps.js":[function(require,module,exports){
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
},{"./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_object-dp":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-dp.js","./_object-keys":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-keys.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_object-gopd.js":[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_has":"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js","./_ie8-dom-define":"/srv/zotero/my-publications/node_modules/core-js/modules/_ie8-dom-define.js","./_object-pie":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-pie.js","./_property-desc":"/srv/zotero/my-publications/node_modules/core-js/modules/_property-desc.js","./_to-iobject":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-iobject.js","./_to-primitive":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-primitive.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_object-gpo.js":[function(require,module,exports){
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
},{"./_has":"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js","./_shared-key":"/srv/zotero/my-publications/node_modules/core-js/modules/_shared-key.js","./_to-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_object-keys-internal.js":[function(require,module,exports){
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
},{"./_array-includes":"/srv/zotero/my-publications/node_modules/core-js/modules/_array-includes.js","./_has":"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js","./_shared-key":"/srv/zotero/my-publications/node_modules/core-js/modules/_shared-key.js","./_to-iobject":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-iobject.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_object-keys.js":[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":"/srv/zotero/my-publications/node_modules/core-js/modules/_enum-bug-keys.js","./_object-keys-internal":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-keys-internal.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_object-pie.js":[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],"/srv/zotero/my-publications/node_modules/core-js/modules/_property-desc.js":[function(require,module,exports){
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
},{"./_core":"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_has":"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js","./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_uid":"/srv/zotero/my-publications/node_modules/core-js/modules/_uid.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_set-proto.js":[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
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
},{"./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js","./_is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js","./_object-gopd":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-gopd.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_set-species.js":[function(require,module,exports){
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
},{"./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_object-dp":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-dp.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_set-to-string-tag.js":[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":"/srv/zotero/my-publications/node_modules/core-js/modules/_has.js","./_object-dp":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-dp.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_shared-key.js":[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":"/srv/zotero/my-publications/node_modules/core-js/modules/_shared.js","./_uid":"/srv/zotero/my-publications/node_modules/core-js/modules/_uid.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_shared.js":[function(require,module,exports){
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
},{"./_cof":"/srv/zotero/my-publications/node_modules/core-js/modules/_cof.js","./_ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js","./_dom-create":"/srv/zotero/my-publications/node_modules/core-js/modules/_dom-create.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_html":"/srv/zotero/my-publications/node_modules/core-js/modules/_html.js","./_invoke":"/srv/zotero/my-publications/node_modules/core-js/modules/_invoke.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_to-index.js":[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-integer.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_to-integer.js":[function(require,module,exports){
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
},{"./_to-integer":"/srv/zotero/my-publications/node_modules/core-js/modules/_to-integer.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_to-object.js":[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":"/srv/zotero/my-publications/node_modules/core-js/modules/_defined.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_to-primitive.js":[function(require,module,exports){
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
},{"./_is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/_uid.js":[function(require,module,exports){
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
var LIBRARY            = require('./_library')
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
    SubPromise.prototype = require('./_object-create')($Promise.prototype, {constructor: {value: SubPromise}});
    // actual Firefox has broken subclass support, test that
    if(!(SubPromise.resolve(5).then(empty) instanceof SubPromise)){
      works = false;
    }
    // V8 4.8- bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./_descriptors')){
      var thenableThenGotten = false;
      $Promise.resolve(require('./_object-dp').f({}, 'then', {
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
      var f = function(promise, index){
        var alreadyCalled = false;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled = true;
          results[index] = value;
          --remaining || resolve(results);
        }, reject);
      };
      if(remaining)for(var i = 0, l = values.length; l > i; i++)f(values[i], i);
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
},{"./_a-function":"/srv/zotero/my-publications/node_modules/core-js/modules/_a-function.js","./_an-instance":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-instance.js","./_an-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_an-object.js","./_array-from-iterable":"/srv/zotero/my-publications/node_modules/core-js/modules/_array-from-iterable.js","./_classof":"/srv/zotero/my-publications/node_modules/core-js/modules/_classof.js","./_core":"/srv/zotero/my-publications/node_modules/core-js/modules/_core.js","./_ctx":"/srv/zotero/my-publications/node_modules/core-js/modules/_ctx.js","./_descriptors":"/srv/zotero/my-publications/node_modules/core-js/modules/_descriptors.js","./_export":"/srv/zotero/my-publications/node_modules/core-js/modules/_export.js","./_for-of":"/srv/zotero/my-publications/node_modules/core-js/modules/_for-of.js","./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_is-object":"/srv/zotero/my-publications/node_modules/core-js/modules/_is-object.js","./_iter-detect":"/srv/zotero/my-publications/node_modules/core-js/modules/_iter-detect.js","./_library":"/srv/zotero/my-publications/node_modules/core-js/modules/_library.js","./_microtask":"/srv/zotero/my-publications/node_modules/core-js/modules/_microtask.js","./_object-create":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-create.js","./_object-dp":"/srv/zotero/my-publications/node_modules/core-js/modules/_object-dp.js","./_redefine-all":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine-all.js","./_set-proto":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-proto.js","./_set-species":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-species.js","./_set-to-string-tag":"/srv/zotero/my-publications/node_modules/core-js/modules/_set-to-string-tag.js","./_species-constructor":"/srv/zotero/my-publications/node_modules/core-js/modules/_species-constructor.js","./_task":"/srv/zotero/my-publications/node_modules/core-js/modules/_task.js"}],"/srv/zotero/my-publications/node_modules/core-js/modules/es6.string.iterator.js":[function(require,module,exports){
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
},{"./_global":"/srv/zotero/my-publications/node_modules/core-js/modules/_global.js","./_hide":"/srv/zotero/my-publications/node_modules/core-js/modules/_hide.js","./_iterators":"/srv/zotero/my-publications/node_modules/core-js/modules/_iterators.js","./_redefine":"/srv/zotero/my-publications/node_modules/core-js/modules/_redefine.js","./_wks":"/srv/zotero/my-publications/node_modules/core-js/modules/_wks.js","./es6.array.iterator":"/srv/zotero/my-publications/node_modules/core-js/modules/es6.array.iterator.js"}],"/srv/zotero/my-publications/node_modules/d/index.js":[function(require,module,exports){
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

},{}],"/srv/zotero/my-publications/node_modules/whatwg-fetch/fetch.js":[function(require,module,exports){
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
exports.FORMATTED_DATE_SYMBOL = exports.AUTHORS_SYMBOL = exports.ABSTRACT_NOTE_PROCESSED = exports.ABSTRACT_NOTE_SHORT_SYMBOL = undefined;
exports.processResponse = processResponse;
exports.fetchUntilExhausted = fetchUntilExhausted;

var _lodash = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils.js');

var _data = require('./data.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('es6-symbol/implement');
var ABSTRACT_NOTE_SHORT_SYMBOL = exports.ABSTRACT_NOTE_SHORT_SYMBOL = Symbol.for('abstractNoteShort');
var ABSTRACT_NOTE_PROCESSED = exports.ABSTRACT_NOTE_PROCESSED = Symbol.for('abstractNoteProcessed');
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
				item.data[ABSTRACT_NOTE_PROCESSED] = (0, _utils.formatAbstract)(item.data.abstractNote);
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
var GROUPED_NONE = exports.GROUPED_NONE = 0;
var GROUPED_BY_TYPE = exports.GROUPED_BY_TYPE = 1;
var GROUPED_BY_COLLECTION = exports.GROUPED_BY_COLLECTION = 2;
var CHILD_NOTES = exports.CHILD_NOTES = Symbol.for('childNotes');
var CHILD_ATTACHMENTS = exports.CHILD_ATTACHMENTS = Symbol.for('childAttachments');
var CHILD_OTHER = exports.CHILD_OTHER = Symbol.for('childOther');
var GROUP_EXPANDED_SUMBOL = exports.GROUP_EXPANDED_SUMBOL = Symbol.for('groupExpanded');
var GROUP_TITLE = exports.GROUP_TITLE = Symbol.for('groupTitle');
var VIEW_ONLINE_URL = exports.VIEW_ONLINE_URL = Symbol.for('viewOnlineUrl');

/**
 * Store, Encapsulate and Manipulate Zotero API data
 * @param {Object[]} data   - Zotero API data to encapsulate
 * @param {Object} [config] - ZoteroPublications config
 */
function ZoteroData(data, config) {
	var _this = this;

	this.raw = this.data = (0, _api.processResponse)(data, config);
	this.grouped = GROUPED_NONE;

	Object.defineProperty(this, 'length', {
		enumerable: false,
		configurable: false,
		get: function get() {
			return _this.data.length;
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
		}
	}, _callee, this, [[5, 18, 22, 30], [23,, 25, 29], [35, 46, 50, 58], [51,, 53, 57]]);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./api.js":"/srv/zotero/my-publications/src/js/api.js","es6-symbol/implement":"/srv/zotero/my-publications/node_modules/es6-symbol/implement.js"}],"/srv/zotero/my-publications/src/js/main-compat.js":[function(require,module,exports){
'use strict';

require('babel-regenerator-runtime');

var _main = require('./main.js');

// require('core-js/es5');

// doesn't seem to work very well in IE
// require('es6-promise').polyfill();
require('core-js/es6/promise');
require('whatwg-fetch');


module.exports = _main.ZoteroPublications;

},{"./main.js":"/srv/zotero/my-publications/src/js/main.js","babel-regenerator-runtime":"/srv/zotero/my-publications/node_modules/babel-regenerator-runtime/runtime.js","core-js/es6/promise":"/srv/zotero/my-publications/node_modules/core-js/es6/promise.js","whatwg-fetch":"/srv/zotero/my-publications/node_modules/whatwg-fetch/fetch.js"}],"/srv/zotero/my-publications/src/js/main.js":[function(require,module,exports){
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
	storeCitationPreference: false,
	shortenedAbstractLenght: 250,
	group: false,
	alwaysUseCitationStyle: false,
	showRights: true,
	expand: 'all',
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
	citeStyleOptionDefault: 'chicago-author-date',
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
ZoteroPublications.prototype.get = function (url, options, init) {
	var _this = this;

	init = init || {
		headers: {
			'Accept': 'application/json'
		}
	};

	options = _lodash2.default.extend({}, this.config, options);

	return new Promise(function (resolve, reject) {
		var promise = (0, _api.fetchUntilExhausted)(url, init);
		promise.then(function (responseJson) {
			var data = new _data.ZoteroData(responseJson, _this.config);
			if (options.group === 'type') {
				data.groupByType(options.expand);
			}
			resolve(data);
		});
		promise.catch(reject);
	});
};

/**
 * Build url for an endpoint then fetch entire dataset recursively
 * @param  {String} endpoint - An API endpoint from which data should be obtained
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getEndpoint = function (endpoint, options) {
	options = options || {};
	var apiBase = this.config.apiBase,
	    limit = options.limit || this.config.limit,
	    style = options.citationStyle || this.config.citationStyle,
	    include = options.include && options.include.join(',') || this.config.include.join(','),
	    url = 'https://' + apiBase + '/' + endpoint + '?include=' + include + '&limit=' + limit + '&linkwrap=1&order=dateModified&sort=desc&start=0&style=' + style;

	return this.get(url, options);
};

/**
 * Build url for getting user's publications then fetch entire dataset recursively
 * @param  {number} userId   - User id
 * @param  {?Object} options - Settings that can complement or override instance config
 * @return {Promise}         - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getPublications = function (userId, options) {
	options = options || {};
	var apiBase = this.config.apiBase,
	    limit = options.limit || this.config.limit,
	    style = options.citationStyle || this.config.citationStyle,
	    include = options.include && options.include.join(',') || this.config.include.join(','),
	    url = 'https://' + apiBase + '/users/' + userId + '/publications/items?include=' + include + '&limit=' + limit + '&linkwrap=1&order=dateModified&sort=desc&start=0&style=' + style;

	this.userId = userId;

	return this.get(url, options);
};

/**
 * Build url for getting a single item from user's publications then fetch it
 * @param  {[type]} userId   - User id
 * @param  {?Object} options - Settings that can complement or override instance config
 * @return {[type]}          - Resolved with ZoteroData object on success, rejected
 *                             in case of any network/response problems
 */
ZoteroPublications.prototype.getItem = function (itemId, userId, options) {
	options = options || {};
	var apiBase = this.config.apiBase,
	    limit = options.limit || this.config.limit,
	    style = options.citationStyle || this.config.citationStyle,
	    include = options.include && options.include.join(',') || this.config.include.join(','),
	    url = 'https://' + apiBase + '/users/' + userId + '/publications/items/' + itemId + '?include=' + include + '&limit=' + limit + '&linkwrap=1&order=dateModified&sort=desc&start=0&style=' + style;

	return this.get(url, options);
};

/**
 * Render local or remote items.
 * @param  {String|ZoteroData} endpointOrData - Data containung publications to be rendered
 * @param  {HTMLElement} container            - A DOM element where publications will be rendered
 * @return {Promise}                          - Resolved when rendered or rejected on error.
 */
ZoteroPublications.prototype.render = function (userIdOrendpointOrData, container) {
	return new Promise(function (resolve, reject) {
		var _this2 = this,
		    _arguments = arguments;

		if (!(container instanceof HTMLElement)) {
			reject(new Error('Second argument to render() method must be a DOM element'));
		}
		if (userIdOrendpointOrData instanceof _data.ZoteroData) {
			var data = userIdOrendpointOrData;
			this.renderer = new _render.ZoteroRenderer(container, this);
			this.renderer.displayPublications(data);
			resolve();
		} else if (typeof userIdOrendpointOrData === 'number') {
			var userId = userIdOrendpointOrData;
			var promise = this.getPublications(userId);
			this.renderer = new _render.ZoteroRenderer(container, this);
			promise.then(function (data) {
				_this2.renderer.displayPublications(data);
				resolve();
			});
			promise.catch(function () {
				reject(_arguments[0]);
			});
		} else if (typeof userIdOrendpointOrData === 'string') {
			var endpoint = userIdOrendpointOrData;
			var promise = this.getEndpoint(endpoint);
			this.renderer = new _render.ZoteroRenderer(container, this);
			promise.then(function (data) {
				_this2.renderer.displayPublications(data);
				resolve();
			});
			promise.catch(function () {
				reject(_arguments[0]);
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

var _detailsModal = require('./tpl/partial/details-modal.tpl');

var _detailsModal2 = _interopRequireDefault(_detailsModal);

var _groupView = require('./tpl/group-view.tpl');

var _groupView2 = _interopRequireDefault(_groupView);

var _plainView = require('./tpl/plain-view.tpl');

var _plainView2 = _interopRequireDefault(_plainView);

var _data = require('./data.js');

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

$ = $ || window.$ || window.jQuery; /*global $:true*/


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
	if (this.config.storeCitationPreference) {
		this.preferredCitationStyle = localStorage.getItem('zotero-citation-preference');
	} else {
		this.preferredCitationStyle = this.config.citationStyle;
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
	return (0, _branding2.default)();
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
ZoteroRenderer.prototype.updateCitation = function (itemEl, detailsEl, citationStyle) {
	var itemId = itemEl.dataset.item;
	var citationEl = detailsEl.querySelector('.zotero-citation');
	var citationStyleSelectEl = detailsEl.querySelector('[data-trigger="cite-style-selection"]');

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

	this.zotero.getItem(itemId, this.zotero.userId, {
		'citationStyle': citationStyle,
		'include': ['bib'],
		'group': false
	}).then(function (item) {
		citationEl.classList.remove('zotero-loading-inline');
		citationEl.innerHTML = item.raw[0].bib;
	});
};

/**
 * Prepare a link for downloading item export
 */
ZoteroRenderer.prototype.prepareExport = function (itemEl, detailsEl) {
	var _this = this;

	var itemId = itemEl.dataset.item;
	var exportEl = detailsEl.querySelector('.zotero-export');
	var exportFormatSelectEl = detailsEl.querySelector('[data-trigger="export-format-selection"]');
	var exportFormat = exportFormatSelectEl.options[exportFormatSelectEl.selectedIndex].value;

	exportEl.innerHTML = '';
	exportEl.classList.add('zotero-loading-inline');

	this.zotero.getItem(itemId, this.zotero.userId, {
		'include': [exportFormat],
		'group': false
	}).then(function (item) {
		var itemData = (_lodash2.default.findWhere || _lodash2.default.find)(_this.data.raw, { 'key': itemId });
		var encoded = window.btoa(item.raw[0][exportFormat]);
		exportEl.classList.remove('zotero-loading-inline');
		exportEl.innerHTML = (0, _export2.default)({
			'filename': itemData.data.title + '.' + _this.zotero.config.exportFormats[exportFormat].extension,
			'content': encoded,
			'contentType': _this.zotero.config.exportFormats[exportFormat].contentType
		});
	});
};

/**
 * Attach interaction handlers
 */
ZoteroRenderer.prototype.addHandlers = function () {
	var _this2 = this;

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
			return el.dataset && el.dataset.trigger;
		});

		if (target) {
			ev.preventDefault();
			if (target.dataset.trigger === 'details') {
				(function () {
					var itemEl = (0, _utils.closest)(target, function (el) {
						return el.dataset && el.dataset.item;
					});
					var itemId = itemEl.dataset.item;
					var zoteroItem = (_lodash2.default.findWhere || _lodash2.default.find)(_this2.data.raw, { 'key': itemId });

					$((0, _detailsModal2.default)({
						'item': zoteroItem,
						'data': zoteroItem.data,
						'renderer': _this2
					})).on('show.bs.modal', function (modalev) {
						_this2.modal = modalev.currentTarget;
					}).on('hidden.bs.modal', function () {
						_this2.modal.remove();
					}).on('shown.bs.modal', function (modalev) {
						modalev.currentTarget.addEventListener('click', function (modalClickEv) {
							var modalTarget = (0, _utils.closest)(modalClickEv.target, function (el) {
								return el.dataset && el.dataset.trigger;
							});
							if (modalTarget) {
								if (modalTarget.dataset.trigger === 'cite' || modalTarget.dataset.trigger === 'export') {
									(0, _utils.showTab)(modalTarget);
									if (modalTarget.dataset.trigger === 'cite') {
										_this2.updateCitation(itemEl, _this2.modal, _this2.preferredCitationStyle);
									} else if (modalTarget.dataset.trigger === 'export') {
										_this2.prepareExport(itemEl, _this2.modal);
									}
								}
							}
						});
					}).modal();
					window.history.pushState(null, null, '#' + itemEl.dataset.item);
				})();
			}
		}
	});

	this.container.addEventListener('change', function (ev) {
		var target = (0, _utils.closest)(ev.target, function (el) {
			return el.dataset && el.dataset.trigger;
		});

		if (target.dataset.trigger === 'cite-style-selection') {
			var itemEl = (0, _utils.closest)(target, function (el) {
				return el.dataset && el.dataset.item;
			});
			_this2.updateCitation(itemEl, _this2.modal);
		} else if (target.dataset.trigger === 'export-format-selection') {
			var itemEl = (0, _utils.closest)(target, function (el) {
				return el.dataset && el.dataset.item;
			});
			_this2.prepareExport(itemEl, _this2.modal);
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
	var _this3 = this;

	if (!this.zoteroLines) {
		this.zoteroLines = this.container.querySelectorAll('.zotero-line');
	}

	_lodash2.default.each(this.zoteroLines, function (zoteroLineEl) {
		var offset = _this3.container.offsetLeft * -1 + 'px';
		if (window.innerWidth < 768 && _this3.container.offsetLeft <= 30 && _this3.container.offsetLeft > 3) {
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./data.js":"/srv/zotero/my-publications/src/js/data.js","./tpl/group-view.tpl":"/srv/zotero/my-publications/src/js/tpl/group-view.tpl","./tpl/partial/branding.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/branding.tpl","./tpl/partial/details-modal.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/details-modal.tpl","./tpl/partial/export.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/export.tpl","./tpl/partial/group.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/group.tpl","./tpl/partial/groups.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/groups.tpl","./tpl/partial/item-citation.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/item-citation.tpl","./tpl/partial/item-templated.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/item-templated.tpl","./tpl/partial/item.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/item.tpl","./tpl/partial/items.tpl":"/srv/zotero/my-publications/src/js/tpl/partial/items.tpl","./tpl/plain-view.tpl":"/srv/zotero/my-publications/src/js/tpl/plain-view.tpl","./utils.js":"/srv/zotero/my-publications/src/js/utils.js","clipboard":"/srv/zotero/my-publications/node_modules/clipboard/lib/clipboard.js"}],"/srv/zotero/my-publications/src/js/tpl/group-view.tpl":[function(require,module,exports){
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
  __p += '<div class="zotero-branding">\n\t<a href="http://www.zotero.org" class="zotero-logo-link" aria-label="Zotero">\n\t\t<svg class="zotero-logo" version="1.1" xmlns="http://www.w3.org/2000/svg" width="90" height="20">\n\t\t\t<g>\n\t\t\t\t<path class="zotero-z" fill="#990000" d="M12.2,6.1L2.8,17.8h9.4v1.9H0v-2.2L9.4,5.8H0.8V3.9h11.4V6.1z"/>\n\t\t\t\t<path fill="#222222" d="M22.1,3.7c5.9,0,7,1.4,7,8.1c0,6.7-1.1,8.1-7,8.1c-5.9,0-7-1.4-7-8.1C15.1,5.2,16.2,3.7,22.1,3.7z M22.1,18\n\t\t\t\t\tc4.2,0,4.5-0.7,4.5-6.1c0-5.5-0.3-6.2-4.5-6.2c-4.2,0-4.5,0.7-4.5,6.2C17.5,17.3,17.8,18,22.1,18z"/>\n\t\t\t\t<path fill="#222222" d="M41.7,5.8h-6.1v10c0,1.7,0.5,2.1,2.2,2.1c2.2,0,2.2-1.2,2.2-2.7v-1.2h2.3v1.2c0,3.1-1.3,4.6-4.5,4.6\n\t\t\t\t\tc-3.7,0-4.5-1.1-4.5-4.8V5.8h-2.1V3.9h2.1V0.1h2.4v3.8h6.1V5.8z"/>\n\t\t\t\t<path fill="#222222" d="M58.3,14.9v0.6c0,4.2-3.2,4.4-6.7,4.4c-6.2,0-7.1-2-7.1-8.1c0-6.6,1.4-8.1,7.1-8.1c5.1,0,6.7,1.2,6.7,7v1.6\n\t\t\t\t\tH46.9c0,5,0.4,5.6,4.6,5.6c3.3,0,4.3-0.2,4.3-2.4v-0.6H58.3z M55.8,10.4c-0.1-4.5-0.7-4.8-4.3-4.8c-4.3,0-4.5,1.1-4.6,4.8H55.8z"/>\n\t\t\t\t<path fill="#222222" d="M64.6,3.9l-0.1,2l0.1,0.1c0.8-1.7,2.7-2.2,4.5-2.2c3,0,4.4,1.5,4.4,4.5v1.1h-2.3V8.3c0-2-0.7-2.6-2.6-2.6\n\t\t\t\t\tc-3,0-3.9,1.4-3.9,4.2v9.8h-2.4V3.9H64.6z"/>\n\t\t\t\t<path fill="#222222" d="M83,3.7c5.9,0,7,1.4,7,8.1c0,6.7-1.1,8.1-7,8.1c-5.9,0-7-1.4-7-8.1C76,5.2,77.1,3.7,83,3.7z M83,18\n\t\t\t\t\tc4.2,0,4.5-0.7,4.5-6.1c0-5.5-0.3-6.2-4.5-6.2c-4.2,0-4.5,0.7-4.5,6.2C78.4,17.3,78.7,18,83,18z"/>\n\t\t\t</g>\n\t\t</svg>\n\t</a>\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/details-modal.tpl":[function(require,module,exports){
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
  __p += '<div class="modal fade" id="detailsModal" tabindex="-1" role="dialog" aria-labelledby="detailsModalTitle">\n\t<div class="modal-dialog" role="document">\n\t\t<div class="modal-content">\n\t\t\t<div class="modal-header">\n\t\t\t\t<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n\t\t\t\t\t<h4 class="modal-title" id="detailsModalTitle">\n\t\t\t\t\t\t' + ((__t = obj.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t</h4>\n\t\t\t</div>\n\t\t\t<div class="modal-body zotero-details">\n\t\t\t\t<div class="zotero-details-inner">\n\t\t\t\t\t';
  if (obj.data.abstractNote && obj.data.abstractNote.length) {
    __p += '\n\t\t\t\t\t\t<h4>Abstract</h4>\n\t\t\t\t\t\t<div class="zotero-abstract">\n\t\t\t\t\t\t\t' + ((__t = obj.data[Symbol.for('abstractNoteProcessed')]) == null ? '' : __t) + '\n\t\t\t\t\t\t</div>\n\t\t\t\t\t';
  }
  __p += '\n\n\t\t\t\t\t';
  if (obj.item[Symbol.for('childNotes')] && obj.item[Symbol.for('childNotes')].length) {
    __p += '\n\t\t\t\t\t\t<h4>Notes</h4>\n\t\t\t\t\t\t<ul class="zotero-notes">\n\t\t\t\t\t\t\t';
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = obj.item[Symbol.for('childNotes')][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var childItem = _step.value;

        __p += '\n\t\t\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t\t\t' + ((__t = childItem.data.note) == null ? '' : __t) + '\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t';
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

    __p += '\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t';
  }
  __p += '\n\n\t\t\t\t\t';
  if (obj.item[Symbol.for('childAttachments')] && obj.item[Symbol.for('childAttachments')].length) {
    __p += '\n\t\t\t\t\t\t<h4>Attachments</h4>\n\t\t\t\t\t\t<ul class="zotero-attachments">\n\t\t\t\t\t\t\t';
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = obj.item[Symbol.for('childAttachments')][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var childItem = _step2.value;

        __p += '\n\t\t\t\t\t\t\t\t';
        if (childItem.url || childItem.links && childItem.links.enclosure && childItem.links.enclosure.href) {
          __p += '\n\t\t\t\t\t\t\t\t<li>\n\t\t\t\t\t\t\t\t\t<a href="' + ((__t = childItem.url || childItem.links && childItem.links.enclosure && childItem.links.enclosure.href) == null ? '' : _.escape(__t)) + '">\n\t\t\t\t\t\t\t\t\t\t<span class="zotero-icon zotero-icon-paperclip" role="presentation" aria-hidden="true"></span><!--\n\t\t\t\t\t\t\t\t\t\t-->' + ((__t = childItem.data.title) == null ? '' : _.escape(__t)) + '\n\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t';
        }
        __p += '\n\t\t\t\t\t\t\t';
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

    __p += '\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t';
  }
  __p += '\n\t\t\t\t\t';
  if (obj.renderer.zotero.userId) {
    __p += '\n\t\t\t\t\t\t<div class="zotero-tab-content" aria-expanded="false">\n\t\t\t\t\t\t\thello world\n\t\t\t\t\t\t\t<!-- Cite -->\n\t\t\t\t\t\t\t<div role="tabpanel" class="zotero-cite-container zotero-tabpanel" id="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-cite">\n\t\t\t\t\t\t\t\t<div class="zotero-container-inner">\n\t\t\t\t\t\t\t\t\t<select class="zotero-form-control" data-trigger="cite-style-selection">\n\t\t\t\t\t\t\t\t\t\t';
    for (var citationStyle in obj.renderer.zotero.config.citeStyleOptions) {
      __p += '\n\t\t\t\t\t\t\t\t\t\t\t<option value="' + ((__t = citationStyle) == null ? '' : __t) + '" ';
      if (citationStyle === obj.renderer.config.citeStyleOptionDefault) {
        __p += ' selected ';
      }
      __p += '>\n\t\t\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.renderer.zotero.config.citeStyleOptions[citationStyle]) == null ? '' : __t) + '\n\t\t\t\t\t\t\t\t\t\t\t</option>\n\t\t\t\t\t\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t\t<p class="zotero-citation" id="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-citation"></p>\n\t\t\t\t\t\t\t\t\t';
    if (!/iPhone|iPad/i.test(navigator.userAgent)) {
      __p += '\n\t\t\t\t\t\t\t\t\t\t<button class="zotero-citation-copy tooltipped tooltipped-e" data-clipboard-target="#' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-citation" aria-label="Copy to clipboard">Copy</button>\n\t\t\t\t\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t<!-- Export -->\n\t\t\t\t\t\t\t<div role="tabpanel" class="zotero-export-container zotero-tabpanel" aria-expanded="false" aria-hidden="true" id="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-export">\n\t\t\t\t\t\t\t\t<div class="zotero-container-inner">\n\t\t\t\t\t\t\t\t\t<select class="zotero-form-control" data-trigger="export-format-selection">\n\t\t\t\t\t\t\t\t\t\t';
    for (var exportFormat in obj.renderer.zotero.config.exportFormats) {
      __p += '\n\t\t\t\t\t\t\t\t\t\t\t<option value="' + ((__t = exportFormat) == null ? '' : __t) + '">\n\t\t\t\t\t\t\t\t\t\t\t\t' + ((__t = obj.renderer.zotero.config.exportFormats[exportFormat].name) == null ? '' : __t) + '\n\t\t\t\t\t\t\t\t\t\t\t</option>\n\t\t\t\t\t\t\t\t\t\t';
    }
    __p += '\n\t\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t\t\t<p class="zotero-export"></p>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t';
  }
  __p += '\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class="modal-footer">\n\t\t\t\t<span role="tablist">\n\t\t\t\t\t<button data-trigger="cite" role="tab" type="button" class="btn btn-default" aria-controls="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-cite">Cite</button>\n\t\t\t\t\t<button data-trigger="export" role="tab" type="button" class="btn btn-default" aria-controls="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-export">Export</button>\n\t\t\t\t</span>\n\t\t\t\t<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>';
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
      print = function print() {
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
      print = function print() {
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
},{}],"/srv/zotero/my-publications/src/js/tpl/partial/item-citation.tpl":[function(require,module,exports){
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
      print = function print() {
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
    __p += '\n\t' + ((__t = obj.renderer.renderItemCitation(obj.item)) == null ? '' : __t) + '\n';
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
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<li class="zotero-item zotero-' + ((__t = obj.data.itemType) == null ? '' : _.escape(__t)) + '" data-item="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '" id="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '" role="listitem">\n\t<a href="#" class="zotero-line" aria-hidden="true" role="presentation" tabindex="-1"></a>\n\n\t<!-- Citation -->\n\t';
  if (obj.renderer.config.alwaysUseCitationStyle) {
    __p += '\n\t\t' + ((__t = obj.renderer.renderItemCitation(obj.item)) == null ? '' : __t) + '\n\t<!-- Templated -->\n\t';
  } else {
    __p += '\n\t\t' + ((__t = obj.renderer.renderItemTemplated(obj.item)) == null ? '' : __t) + '\n\t';
  }
  __p += '\n\n\t<!-- Details toggle -->\n\t<div>\n\t\t<a href="" data-trigger="details" aria-controls="' + ((__t = obj.item.key) == null ? '' : _.escape(__t)) + '-details">\n\t\t\tDetails\n\t\t</a>\n\t</div>\n\t';
  if (obj.renderer.config.showRights) {
    __p += '\n\t\t<small class="rights">' + ((__t = obj.data.rights) == null ? '' : _.escape(__t)) + '</small>\n\t';
  }
  __p += '\n</li>';
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
      print = function print() {
    __p += __j.call(arguments, '');
  };
  __p += '<div class="zotero-publications">\n\t' + ((__t = obj.renderer.renderItems(obj.items)) == null ? '' : __t) + '\n\t' + ((__t = obj.renderer.renderBranding()) == null ? '' : __t) + '\n</div>';
  return __p;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
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
 * Finds the first element that pasess function test by
 * testing the element itself and traversing up
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
 * Uniquely and pernamently identify a DOM element
 * even if it has no id
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
	var initialHeight = window.getComputedStyle(element).height;
	element.style.height = initialHeight;
	//repaint shenanigans
	element.offsetHeight; // eslint-disable-line no-unused-expressions

	_lodash2.default.defer(function () {
		element.classList.add('zotero-collapsed', 'zotero-collapsing');
		element.style.height = null;
		collapsesInProgress[id(element)] = once(element, transitionend(), function () {
			element.classList.remove('zotero-collapsing');
			element.setAttribute('aria-hidden', 'true');
			element.setAttribute('aria-expanded', 'true');
			delete collapsesInProgress[id(element)];
		});
	});
}

function uncollapse(element) {
	element.classList.remove('zotero-collapsed');
	var targetHeight = window.getComputedStyle(element).height;
	element.classList.add('zotero-collapsed');

	_lodash2.default.defer(function () {
		element.classList.add('zotero-collapsing');
		element.style.height = targetHeight;
		collapsesInProgress[id(element)] = once(element, transitionend(), function () {
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},["/srv/zotero/my-publications/src/js/main-compat.js"])("/srv/zotero/my-publications/src/js/main-compat.js")
});