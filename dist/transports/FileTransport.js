'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FileTransport = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _Transport2 = require('./Transport');

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
    printType: 'json',
    createOnFirstWrite: true
};

// List of all files opened to write ( prevents multiple writes )
var FilesReservedForWrite = {};

// =============================================================================
// FileTransport
// =============================================================================

var FileTransport = exports.FileTransport = function (_Transport) {
    _inherits(FileTransport, _Transport);

    _createClass(FileTransport, null, [{
        key: 'checkFilePath',
        value: function checkFilePath(filePath) {
            if (filePath in FilesReservedForWrite) {
                throw Error('File \'' + filePath + '\' is already reserved for write');
            }

            FilesReservedForWrite[filePath] = true;
        }
    }]);

    function FileTransport(config) {
        _classCallCheck(this, FileTransport);

        var _this = _possibleConstructorReturn(this, (FileTransport.__proto__ || Object.getPrototypeOf(FileTransport)).call(this, _extends({}, DefaultConfig, config)));

        _initialiseProps.call(_this);

        var _this$_config = _this._config,
            createOnFirstWrite = _this$_config.createOnFirstWrite,
            filePath = _this$_config.filePath,
            level = _this$_config.level;


        FileTransport.checkFilePath(filePath);

        _this.levelValue = (0, _common.getLevelValue)(level);

        var dirname = _path2.default.dirname(filePath);

        _mkdirp2.default.sync(dirname);

        if (!createOnFirstWrite) _this.__getFileWriteStream();

        process.on('exit', _this.end);
        return _this;
    }

    // Public
    // --------------------------------------------------------


    _createClass(FileTransport, [{
        key: '__getFileWriteStream',


        // Private
        // --------------------------------------------------------
        value: function __getFileWriteStream() {
            if (!this.__fileWriteStream) {
                var _filePath = this._config.filePath;


                this.__fileWriteStream = _fs2.default.createWriteStream(_filePath);
            }

            return this.__fileWriteStream;
        }
    }]);

    return FileTransport;
}(_Transport2.Transport);

var _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this.__isEnded = false;

    this.handler = function (logStr) {
        if (_this2.__isEnded) return;

        _this2.__getFileWriteStream().write(logStr + '\n');
    };

    this.end = function () {
        if (_this2.__isEnded) return;

        _this2.__isEnded = true;

        var _config = _this2._config,
            filePath = _config.filePath,
            createOnFirstWrite = _config.createOnFirstWrite;


        if (_this2.__fileWriteStream) _this2.__fileWriteStream.end();

        delete FilesReservedForWrite[filePath];
    };
};

exports.default = FileTransport;