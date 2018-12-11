'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StdoutTransport = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Transport2 = require('./Transport');

var _Transport3 = _interopRequireDefault(_Transport2);

var _common = require('../common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// =============================================================================
// Imports
// =============================================================================

// Local
// --------------------------------------------------------


// =============================================================================
// Constants
// =============================================================================


// Flow types
// --------------------------------------------------------
var DefaultConfig = {
    printType: 'simple-cli',
    strict: false
};

// =============================================================================
// StdoutTransport
// =============================================================================

var StdoutTransport = exports.StdoutTransport = function (_Transport) {
    _inherits(StdoutTransport, _Transport);

    function StdoutTransport(config) {
        _classCallCheck(this, StdoutTransport);

        var _this = _possibleConstructorReturn(this, (StdoutTransport.__proto__ || Object.getPrototypeOf(StdoutTransport)).call(this, _extends({}, DefaultConfig, config)));

        _this.handler = function (logStr, _ref) {
            var level = _ref.level;

            console.log(logStr);
        };

        _this.levelValue = (0, _common.getLevelValue)(_this._config.level);
        return _this;
    }

    // Public
    // --------------------------------------------------------


    return StdoutTransport;
}(_Transport3.default);

exports.default = StdoutTransport;