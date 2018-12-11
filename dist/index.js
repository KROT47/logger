'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Logger = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// =============================================================================
// Imports
// =============================================================================


// Local
// --------------------------------------------------------


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _getExplicitType = require('get-explicit-type');

var _getExplicitType2 = _interopRequireDefault(_getExplicitType);

var _Transport = require('./transports/Transport');

var _Transport2 = _interopRequireDefault(_Transport);

var _StdoutTransport = require('./transports/StdoutTransport');

var _StdoutTransport2 = _interopRequireDefault(_StdoutTransport);

var _common = require('./common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// =============================================================================
// Constants
// =============================================================================


// Flow types
// --------------------------------------------------------
var DefaultStdoutLevel = 'trace';
var DefaultLevel = 'info';

var DefaultConfig = {
    stdoutLevel: DefaultStdoutLevel,
    level: DefaultLevel,
    stopOnFatal: false,
    hostname: 'Main',
    stdoutMsgSeparator: '----------------------',
    transports: [],
    printConfig: {
        colors: true,
        depth: 5,
        maxArrayLength: 30
    }
};

var RegExps = {
    lineBreaks: /\n/g,
    escapedLineBreaks: /\\n/g,
    openObjectBrackets: /\{\s+/g,
    stringObjectTypes: /\[(Circular|Object|Array|Function)[^\]]*\]|NaN|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g
};

// =============================================================================
// Logger
// =============================================================================

var Logger = exports.Logger = function () {
    function Logger(config) {
        var _this = this;

        _classCallCheck(this, Logger);

        this.log = function (level) {
            for (var _len = arguments.length, msgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                msgs[_key - 1] = arguments[_key];
            }

            try {
                var levelValue = (0, _common.getLevelValue)(level);

                var options = {
                    level: level,
                    levelValue: levelValue
                };

                var printLogCache = {};

                var printLog = function printLog(printType) {
                    if (!printLogCache[printType]) {
                        printLogCache[printType] = _this._getLogOutput(printType, options, msgs);
                    }

                    return printLogCache[printType];
                };

                var handleTransport = function handleTransport(transport) {
                    // check global level
                    if (transport.levelValue > levelValue) return;

                    // chack transport level
                    if (!transport._levelIsOkToPrint(levelValue)) return;

                    var outStr = printLog(transport.printType);

                    transport._handler(outStr, options);
                };

                handleTransport(_this._stdoutTransport);

                for (var i = _this._transports.length; i--;) {
                    handleTransport(_this._transports[i]);
                }
            } catch (error) {
                _this.fatal(error);
            }
        };

        this.trace = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return _this.log.apply(_this, ['trace'].concat(args));
        };

        this.debug = function () {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return _this.log.apply(_this, ['debug'].concat(args));
        };

        this.info = function () {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            return _this.log.apply(_this, ['info'].concat(args));
        };

        this.warn = function () {
            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                args[_key5] = arguments[_key5];
            }

            return _this.log.apply(_this, ['warn'].concat(args));
        };

        this.error = function () {
            for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                args[_key6] = arguments[_key6];
            }

            return _this.log.apply(_this, ['error'].concat(args));
        };

        this.fatal = function () {
            for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                args[_key7] = arguments[_key7];
            }

            _this.log.apply(_this, ['fatal'].concat(args));

            if (_this._config.stopOnFatal) process.exit(1);
        };

        this._config = _lodash2.default.merge({}, DefaultConfig, config);

        this._levelValue = (0, _common.getLevelValue)(this._config.level);
        this._stdoutLevelValue = (0, _common.getLevelValue)(this._config.stdoutLevel);

        this._transports = this._config.transports.filter(function (transport) {
            return transport._canBeHandled(_this._levelValue);
        });

        this._stdoutTransport = new _StdoutTransport2.default({
            level: this._config.stdoutLevel
        });
    }

    _createClass(Logger, [{
        key: 'child',
        value: function child(childConfig) {
            var config = _lodash2.default.mergeWith({}, this._config, childConfig, this._childCustomizer);

            return new Logger(config);
        }
    }, {
        key: '_childCustomizer',
        value: function _childCustomizer(objValue, srcValue) {
            if (_lodash2.default.isArray(objValue)) return objValue.concat(srcValue);
        }
    }, {
        key: 'end',
        value: function end() {
            for (var i = this._transports.length; i--;) {
                this._transports[i]._end();
            }
        }

        // Private
        // --------------------------------------------------------

    }, {
        key: '_getLogOutput',
        value: function _getLogOutput(printType, options, args) {
            var ts = new Date().toISOString();

            var msgs = this._prettyPrintAll(printType, options, args);

            var hostname = this._config.hostname;
            var level = options.level;


            var separator = '';

            switch (printType) {
                case 'json':
                    return JSON.stringify({ ts: ts, level: level, hostname: hostname, msgs: msgs });

                case 'simple-cli':
                    var _stdoutMsgSeparator = this._config.stdoutMsgSeparator;


                    if (_stdoutMsgSeparator) separator = _stdoutMsgSeparator;

                case 'simple':
                    var levelStr = _common.LevelsByName[level].printValue;

                    var prefix = '[' + ts + '] ' + levelStr + ' on ' + hostname + ' | ';
                    separator = separator ? '' + prefix + separator + '\n' : '';

                    return separator + prefix + msgs.join(' ').replace(RegExps.lineBreaks, '\n' + prefix);

                default:
                    return msgs.join('\n');
            }
        }
    }, {
        key: '_prettyPrintAll',
        value: function _prettyPrintAll(printType, options, msgs) {
            var _this2 = this;

            return msgs.map(function (msg) {
                return _this2._prettyPrint(printType, options, msg);
            });
        }
    }, {
        key: '_prettyPrint',
        value: function _prettyPrint(printType, options, msg) {
            var _this3 = this;

            var currDepth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            var isJsonType = printType === 'json';
            var useColors = printType === 'simple-cli';

            var level = options.level,
                levelValue = options.levelValue;
            var depth = this._config.printConfig.depth;


            var type = (0, _getExplicitType2.default)(msg);

            switch (type) {
                case 'Error':
                    msg = {
                        message: msg.message,
                        stack: msg.stack
                    };

                    if (isJsonType) return msg;

                    return this._stringify(msg, { colors: useColors }).replace(RegExps.escapedLineBreaks, '\n');

                case 'Array':
                case 'Object':
                    if (currDepth > depth) return '[' + type + ']';

                    if (!isJsonType) {
                        return this._stringify(msg, { colors: useColors });
                    }

                    var nextDepth = currDepth + 1;

                    var prettyPrint = function prettyPrint(value) {
                        return _this3._prettyPrint(printType, options, value, nextDepth);
                    };

                    var result = Array.isArray(msg) ? _lodash2.default.map(msg, prettyPrint) : _lodash2.default.mapValues(msg, prettyPrint);

                    return currDepth === 0 && !isJsonType ? JSON.stringify(result) : result;

                case 'Function':
                case 'Undefined':
                    return '[' + type + ']';

                case 'Number':
                    return Number.isNaN(msg) ? '[NaN]' : msg;

                case 'Date':
                    return msg.toISOString();

                case 'String':
                case 'Null':
                    return msg;

                case 'Promise':
                    return '[' + this._stringify(msg, { colors: useColors }) + ']';

                default:
                    return '[' + msg.toString() + ']';
            }
        }
    }, {
        key: '_stringify',
        value: function _stringify(value, printConfig) {
            printConfig = printConfig ? _lodash2.default.merge({}, this._config.printConfig, printConfig) : this._config.printConfig;

            return _util2.default.inspect(value, printConfig);
        }
    }]);

    return Logger;
}();

exports.default = Logger;