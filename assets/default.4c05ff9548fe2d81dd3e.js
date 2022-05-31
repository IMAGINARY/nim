/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./src/sass/nim-game-view.scss":
/*!*************************************!*\
  !*** ./src/sass/nim-game-view.scss ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/js/nim-game-view.js":
/*!*********************************!*\
  !*** ./src/js/nim-game-view.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* globals IMAGINARY */
__webpack_require__(/*! ../sass/nim-game-view.scss */ "./src/sass/nim-game-view.scss");
const {nimBest, nimRandom} = __webpack_require__(/*! ./nim */ "./src/js/nim.js");

class NimGameView {
  constructor(game) {
    this.game = game;

    this.game.events.on('start', () => { this.onGameStart() });
    this.game.events.on('take', (amount, player) => { this.onTake(amount, player); });
    this.game.events.on('turn', (player) => { this.onTurn(player); });
    this.game.events.on('victory', (player) => { this.onVictory(player); });

    this.$element = $('<div></div>').addClass('nim-game');
    this.$messageBoxContainer = $('<div></div>').addClass('message-box-container');
    this.$messageBox = $('<div></div>').addClass('message-box').text('Human wins')

    this.$take1Btn = $('<button></button>').attr('type', 'button');
    this.$take2Btn = $('<button></button>').attr('type', 'button');
    this.$take3Btn = $('<button></button>').attr('type', 'button');
    this.$restartBtn = $('<button></button>').attr('type', 'button');

    // Sticks
    this.sticks = [];
    for (let i = 0; i < game.getNumSticks(); i += 1) {
      this.sticks.push($('<div></div>').addClass(['stick', 'img-fluid']));
    }
    this.$element.append(
      $('<div></div>').addClass('stick-container')
        .append($('<div></div>').addClass(['row', 'content-justify-center'])
          .append(this.sticks.map(stick => $('<div></div>')
            .addClass('col')
            .append(stick))))
        .append(this.$messageBoxContainer.append(this.$messageBox)));

    // Input
    this.$element.append(
      $('<div></div>').addClass('input-pane')
        .append(
          $('<div></div>').addClass('row justify-content-between')
            .append([
              $('<div></div>').addClass('col-9')
                .append($('<div></div>').addClass('row')
                  .append([
                    $('<div>').addClass('col').append(
                      $('<div>').addClass('d-grid').append(
                        this.$take1Btn.addClass(['btn', 'btn-secondary', 'btn-take'])
                          .text(IMAGINARY.i18n.t('TAKE_N').replace('%n', '1'))
                          .on('click', () => { this.handleTake(1); })
                      )
                    ),
                    $('<div>').addClass('col').append(
                      $('<div>').addClass('d-grid').append(
                        this.$take2Btn.addClass(['btn', 'btn-secondary', 'btn-take'])
                          .text(IMAGINARY.i18n.t('TAKE_N').replace('%n', '2'))
                          .on('click', () => { this.handleTake(2); })
                        )
                    ),
                    $('<div>').addClass('col').append(
                      $('<div>').addClass('d-grid').append(
                        this.$take3Btn.addClass(['btn', 'btn-secondary', 'btn-take'])
                          .text(IMAGINARY.i18n.t('TAKE_N').replace('%n', '3'))
                          .on('click', () => { this.handleTake(3); })
                      )
                    )
                  ])),
              $('<div></div>').addClass('col-3').append(
                $('<div>').addClass('col').append(
                  $('<div>').addClass('d-grid').append(
                    this.$restartBtn.addClass(['btn', 'btn-outline-secondary', 'btn-restart'])
                      .text(IMAGINARY.i18n.t('RESTART'))
                      .on('click', () => { this.handleRestart(); })
                  )
                )
              ),
            ])
        )
    );
  }

  removeSticks(amount, direction) {
    this.sticks.filter(stick => !stick.hasClass('taken')).reverse().slice(0, amount)
      .forEach(stick => stick.addClass(['taken', `taken-${direction}`]));
  }

  resetSticks() {
    this.sticks.forEach(stick => stick.removeClass(['taken', 'taken-n', 'taken-s']));
  }

  showMessage(text) {
    this.$messageBox.text(text);
    this.$messageBoxContainer.addClass('visible');
  }

  hideMessage() {
    this.$messageBoxContainer.removeClass('visible');
  }

  disableInput() {
    this.disableTake();
    this.disableRestart();
  }

  enableInput() {
    this.enableTake();
    this.enableRestart();
  }

  disableTake() {
    [ this.$take1Btn, this.$take2Btn, this.$take3Btn ].forEach((button) => {
      button.addClass('disabled').attr('disabled', true);
    });
  }

  enableTake() {
    [ this.$take1Btn, this.$take2Btn, this.$take3Btn ].forEach((button) => {
      button.removeClass('disabled').attr('disabled', false);
    });
  }

  disableRestart() {
    this.$restartBtn.addClass('disabled').attr('disabled', true);
  }

  enableRestart() {
    this.$restartBtn.removeClass('disabled').attr('disabled', false);
  }

  handleTake(amount) {
    this.game.take(amount);
  }

  handleRestart() {
    this.game.restart();
  }

  onGameStart() {
    this.hideMessage();
    this.resetSticks();
  }

  onTake(amount, player) {
    this.removeSticks(amount, player === 'human' ? 's' : 'n');
  }

  onTurn(player) {
    if (player === 'human') {
      this.enableInput();
    } else {
      this.disableInput();
    }

    if (player === 'computer') {
      setTimeout(() => {
        this.game.take(nimBest(this.game.sticksLeft));
      }, Math.random() * 1500 + 1000);
    }
  }

  onVictory(player) {
    this.showMessage(player === 'human' ? IMAGINARY.i18n.t('HUMAN_WINS') : IMAGINARY.i18n.t('COMPUTER_WINS'))
    this.disableTake();
    this.enableRestart();
  }
}

module.exports = NimGameView;


/***/ }),

/***/ "./src/js/nim-game.js":
/*!****************************!*\
  !*** ./src/js/nim-game.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");

/**
 * A nim game with a single heap.
 *
 * - 2 players (human and computer).
 * - Human starts
 * - 10 sticks
 * - Each player can remove 1-3 sticks.
 * - Last player to remove a stick loses.
 */
class NimGame {
  constructor() {
    this.events = new EventEmitter();
    this.restart();
  }

  getNumSticks() {
    return NimGame.NumSticks;
  }

  restart() {
    this.setSticksLeft(NimGame.NumSticks);
    this.setCurrentPlayer(NimGame.Human);
    this.isOver = false;
    this.events.emit('start', this.currentPlayer);
  }

  setSticksLeft(sticksLeft) {
    this.sticksLeft = sticksLeft;
    this.events.emit('sticksChanged');
  }

  setCurrentPlayer(player) {
    this.currentPlayer = player;
    this.events.emit('turn', this.currentPlayer);
  }

  opossitePlayer(player) {
    return player === NimGame.Human ? NimGame.Computer : NimGame.Human;
  }

  switchTurn() {
    this.setCurrentPlayer(this.opossitePlayer(this.currentPlayer));
  }

  onGameWon(player) {
    this.isOver = true;
    this.events.emit('victory', player);
  }

  take(numberOfSticks) {
    if (numberOfSticks < 1 || numberOfSticks > 3) {
      throw new Error('Invalid number of sticks');
    }

    if (numberOfSticks > this.sticksLeft) {
      throw new Error('Not enough sticks');
    }

    this.events.emit('take', numberOfSticks, this.currentPlayer);
    this.setSticksLeft(this.sticksLeft - numberOfSticks);
    if (this.sticksLeft === 1) {
      this.onGameWon(this.currentPlayer);
    } else if (this.sticksLeft === 0) {
      this.onGameWon(this.opossitePlayer(this.currentPlayer));
    } else {
      this.switchTurn();
    }
  }
}

NimGame.NumSticks = 10;
NimGame.Human = 'human';
NimGame.Computer = 'computer';

module.exports = NimGame;


/***/ }),

/***/ "./src/js/nim.js":
/*!***********************!*\
  !*** ./src/js/nim.js ***!
  \***********************/
/***/ ((module) => {

/**
 * Solver for the 10-stick version of the nim game
 */

/**
 * Return the amount of sticks to take (up to 3) to win the nim game.
 *
 * @param {number} sticksLeft Number of sticks left on the board
 * @return {number}
 */
function nimBest(sticksLeft) {
  if (sticksLeft === 0) {
    throw new Error('Can\'t play nim with no sticks left.')
  }
  switch (sticksLeft % 4) {
    case 1:
      return 1;
    case 2:
      return 1;
    case 3:
      return 2;
    case 0:
      return 3;
  }
}

/**
 * Return the amount of sticks to take (up to 3) to lose the game (or try to).
 * @param {number} sticksLeft
 * @return {number}
 */
function nimWorst(sticksLeft) {
  if (sticksLeft === 0) {
    throw new Error('Can\'t play nim with no sticks left.')
  }

  switch (sticksLeft % 4) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 3;
    case 0:
      return 1;
  }
}

/**
 * Return a random amount of sticks to take (1-3)
 *
 * @param {number} sticksLeft
 * @return {number}
 */
function nimRandom(sticksLeft) {
  if (sticksLeft === 0) {
    throw new Error('Can\'t play nim with no sticks left.')
  }

  return Math.floor(Math.random() * 3) + 1;
}

module.exports = {nimBest, nimRandom};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/* globals IMAGINARY */

const NimGame = __webpack_require__(/*! ./nim-game */ "./src/js/nim-game.js");
const NimGameView = __webpack_require__(/*! ./nim-game-view */ "./src/js/nim-game-view.js");

IMAGINARY.i18n.init({
  queryStringVariable: 'lang',
  translationsDirectory: 'tr',
  defaultLanguage: 'en'
}).then(function(){
  $('[data-component="nim-game"]').each((i, container) => {
    const game = new NimGame();
    const view = new NimGameView(game);
    $(container).append(view.$element);
    window.gameView = view;
  });
}).catch(function(err){
  console.error(err);
});

})();

/******/ })()
;
//# sourceMappingURL=default.4c05ff9548fe2d81dd3e.js.map