'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LevelsByValue = exports.LevelsByName = exports.Levels = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// =============================================================================
// Imports
// =============================================================================


exports.getLevelValue = getLevelValue;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// =============================================================================
// Constants
// =============================================================================


// Flow types
// --------------------------------------------------------


// json - basically to print to file
// simple-cli - uses cli colors, so printing to file will be not pretty
// simple - prints without colors as simple text
var Levels = exports.Levels = [{ name: 'trace', value: 0, printValue: 'TRACE' }, { name: 'debug', value: 1, printValue: 'DEBUG' }, { name: 'info', value: 2, printValue: 'INFO' }, { name: 'warn', value: 3, printValue: 'WARN' }, { name: 'error', value: 4, printValue: 'ERROR' }, { name: 'fatal', value: 5, printValue: 'FATAL' }, { name: 'none', value: 6, printValue: '' }];

var LevelsByName = exports.LevelsByName = _lodash2.default.keyBy(Levels, 'name');
var LevelsByValue = exports.LevelsByValue = _lodash2.default.keyBy(Levels, 'value');

// =============================================================================
// getLevelValue
// =============================================================================
function getLevelValue(level) {
    switch (typeof level === 'undefined' ? 'undefined' : _typeof(level)) {
        case 'string':
            return LevelsByName[level].value || 0;

        case 'number':
            return level;

        default:
            return 0;
    }
}