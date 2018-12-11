'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Transport = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// =============================================================================
// Imports
// =============================================================================

// Local
// --------------------------------------------------------


var _common = require('../common');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// =============================================================================
// Constants
// =============================================================================


// Flow types
// --------------------------------------------------------
var DefaultConfig = {
    strict: true,
    printType: 'simple'
};

// =============================================================================
// Transport
// =============================================================================

var Transport = exports.Transport = function () {
    function Transport(config) {
        var _this = this;

        _classCallCheck(this, Transport);

        this.handler = function (logStr, options) {
            var _config$handler = _this._config.handler,
                handler = _config$handler === undefined ? EmptyFunc : _config$handler;


            handler(logStr, options);
        };

        this.end = EmptyFunc;

        this._handler = function (logStr, options) {
            _this.handler(logStr, options);
        };

        this._end = function () {
            return _this.end();
        };

        // $FlowFixMe
        this._config = _extends({}, DefaultConfig, config);

        this.levelValue = (0, _common.getLevelValue)(this._config.level);
        // $FlowFixMe
        this.printType = this._config.printType;
    }

    // Public
    // --------------------------------------------------------


    // Protected
    // --------------------------------------------------------


    _createClass(Transport, [{
        key: '_levelIsOkToPrint',
        value: function _levelIsOkToPrint(levelValue) {
            return this._config.strict ? this.levelValue === levelValue : this.levelValue <= levelValue;
        }
    }, {
        key: '_canBeHandled',
        value: function _canBeHandled(levelValue) {
            return this.levelValue > levelValue;
        }
    }]);

    return Transport;
}();

exports.default = Transport;

// =============================================================================
// Helpers
// =============================================================================

function EmptyFunc() {}