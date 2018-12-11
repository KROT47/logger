/* @flow */


// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';
import Util from 'util';
import GetType from 'get-explicit-type';

// Local
// --------------------------------------------------------
import Transport from './transports/Transport';
import StdoutTransport from './transports/StdoutTransport';
import {
    getLevelValue,
    LevelsByName,
    type LevelType,
    type OptionsType,
    type PrintType,
} from './common';

// Flow types
// --------------------------------------------------------
export type LoggerConfigType = {
    level?: LevelType,
    stopOnFatal?: boolean,
    hostname?: string,
    stdoutMsgSeparator?: ?string,
    transports?: Array<Transport<*>>,
    printConfig?: {
        colors: boolean,
        depth: number,
        maxArrayLength: number,
    },
};


// =============================================================================
// Constants
// =============================================================================
const DefaultStdoutLevel = 'trace';
const DefaultLevel = 'info';

const DefaultConfig = {
    stdoutLevel: DefaultStdoutLevel,
    level: DefaultLevel,
    stopOnFatal: false,
    hostname: 'Main',
    stdoutMsgSeparator: '----------------------',
    transports: [],
    printConfig: {
        colors: true,
        depth: 5,
        maxArrayLength: 30,
    },
};

const RegExps = {
    lineBreaks: /\n/g,
    escapedLineBreaks: /\\n/g,
    openObjectBrackets: /\{\s+/g,
    stringObjectTypes: /\[(Circular|Object|Array|Function)[^\]]*\]|NaN|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g,
};


// =============================================================================
// Logger
// =============================================================================
export class Logger {
    _config: typeof DefaultConfig;
    _levelValue: number;
    _stdoutLevelValue: number;
    _printTypes: { [ printType: PrintType ]: any };
    _stdoutTransport: StdoutTransport;
    _transports: Array<Transport<*>>;

    constructor( config?: LoggerConfigType ) {
        this._config = _.merge( {}, DefaultConfig, config );

        this._levelValue = getLevelValue( this._config.level );
        this._stdoutLevelValue = getLevelValue( this._config.stdoutLevel );

        this._transports =
            this._config.transports
                .filter(
                    transport => transport._canBeHandled( this._levelValue )
                );

        this._stdoutTransport =
            new StdoutTransport({
                level: this._config.stdoutLevel,
            });
    }

    child( childConfig: LoggerConfigType ) {
        const config =
                _.mergeWith(
                    {}, this._config, childConfig,
                    this._childCustomizer
                );

        return new Logger( config );
    }
    _childCustomizer( objValue: any, srcValue: any ) {
        if ( _.isArray( objValue ) ) return objValue.concat( srcValue );
    }

    log = ( level: LevelType, ...msgs: Array<any> ) => {
        try {
            const levelValue = getLevelValue( level );

            const options = {
                level,
                levelValue,
            };

            const printLogCache = {};

            const printLog = printType => {
                if ( !printLogCache[ printType ] ) {
                    printLogCache[ printType ] =
                        this._getLogOutput( printType, options, msgs );
                }

                return printLogCache[ printType ];
            };

            const handleTransport = transport => {
                // check global level
                if ( this._levelValue > levelValue ) return;

                // chack transport level
                if ( !transport._levelIsOkToPrint( levelValue ) ) return;

                const outStr = printLog( transport.printType );

                transport._handler( outStr, options );
            };

            handleTransport( this._stdoutTransport );

            for ( var i = this._transports.length; i--; ) {
                handleTransport( this._transports[ i ] );
            }


        } catch ( error ) {
            this.fatal( error );
        }
    };

    trace = ( ...args: Array<any> ) => this.log( 'trace', ...args );

    debug = ( ...args: Array<any> ) => this.log( 'debug', ...args );

    info = ( ...args: Array<any> ) => this.log( 'info', ...args );

    warn = ( ...args: Array<any> ) => this.log( 'warn', ...args );

    error = ( ...args: Array<any> ) => this.log( 'error', ...args );

    fatal = ( ...args: Array<any> ) => {
        this.log( 'fatal', ...args );

        if ( this._config.stopOnFatal ) process.exit( 1 );
    };

    end() {
        for ( var i = this._transports.length; i--; ) {
            this._transports[ i ]._end();
        }
    }

    // Private
    // --------------------------------------------------------
    _getLogOutput(
        printType: PrintType,
        options: OptionsType,
        args: Array<any>
    ) {
        const ts = new Date().toISOString();

        const msgs = this._prettyPrintAll( printType, options, args );

        const { hostname } = this._config;

        const { level } = options;

        var separator = '';

        switch ( printType ) {
            case 'json':
                return JSON.stringify({ ts, level, hostname, msgs });

            case 'simple-cli':
                const { stdoutMsgSeparator } = this._config;

                if ( stdoutMsgSeparator ) separator = stdoutMsgSeparator;

            case 'simple':
                const levelStr = LevelsByName[ level ].printValue;

                const prefix = `[${ ts }] ${ levelStr } on ${ hostname } | `;
                separator =
                        separator
                            ? `${ prefix }${ separator }\n`
                            : '';

                return (
                    separator +
                    prefix +
                    msgs.join( ' ' )
                        .replace( RegExps.lineBreaks, `\n${ prefix }` )
                );

            default:
                return msgs.join( '\n' );
        }
    }

    _prettyPrintAll(
        printType: PrintType,
        options: OptionsType,
        msgs: Array<any>
    ): Array<Array<any> | Object | string> {
        return msgs.map( msg => this._prettyPrint( printType, options, msg ) );
    }

    _prettyPrint(
        printType: PrintType,
        options: OptionsType,
        msg: any,
        currDepth?: number = 0
    ) {
        const isJsonType = printType === 'json';
        const useColors = printType === 'simple-cli';

        const { level, levelValue } = options;

        const { depth } = this._config.printConfig;

        const type = GetType( msg );

        switch ( type ) {
            case 'Error':
                msg = {
                    message: msg.message,
                    stack: msg.stack,
                };

                if ( isJsonType ) return msg;

                return (
                    this._stringify( msg, { colors: useColors } )
                        .replace( RegExps.escapedLineBreaks, '\n' )
                );

            case 'Array':
            case 'Object':
                if ( currDepth > depth ) return `[${ type }]`;

                if ( !isJsonType ) {
                    return this._stringify( msg, { colors: useColors } );
                }

                const nextDepth = currDepth + 1;

                const prettyPrint = value => (
                    this._prettyPrint( printType, options, value, nextDepth )
                );

                const result =
                        Array.isArray( msg )
                            ? _.map( msg, prettyPrint )
                            : _.mapValues( msg, prettyPrint );

                return (
                    currDepth === 0 && !isJsonType
                        ? JSON.stringify( result )
                        : result
                );

            case 'Function':
            case 'Undefined':
                return `[${ type }]`;

            case 'Number': return Number.isNaN( msg ) ? '[NaN]' : msg;

            case 'Date': return msg.toISOString();

            case 'String':
            case 'Null':
                return msg;

            case 'Promise':
                return `[${ this._stringify( msg, { colors: useColors } ) }]`;

            default: return `[${ msg.toString() }]`;
        }
    }

    _stringify(
        value: Object,
        printConfig?: Object
    ) {
        printConfig =
            printConfig
                ? _.merge( {}, this._config.printConfig, printConfig )
                : this._config.printConfig;

        return Util.inspect( value, printConfig );
    }
}

export default Logger;
