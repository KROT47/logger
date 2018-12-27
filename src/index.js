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
    stdoutMsgSeparator?: ?string | false,
    stdout?: ?Transport<*> | Logger | false,
    transports?: Array<Transport<any>>,
    printConfig?: $Shape<{
        colors: boolean,
        depth: number,
        maxArrayLength: number,
    }>,
    jsonStringifyArgs?: Array<any>,
};

export type LogMethodType = ( ...args: Array<any> ) => Logger;


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
    stdout: undefined,
    transports: [],
    printConfig: {
        colors: true,
        depth: 5,
        maxArrayLength: 30,
    },
    jsonStringifyArgs: [],
};

const RegExps = {
    lineBreaks: /\n/g,
    escapedLineBreaks: /\\n/g,
    startsWithOpenBracket: /^{\s+/,
};


// =============================================================================
// Logger
// =============================================================================
export class Logger {
    _config: typeof DefaultConfig;
    _levelValue: number;
    _stdoutLevelValue: number;
    _printTypes: { [ printType: PrintType ]: any };
    _transports: Array<Transport<*>>;

    stdout: Logger;

    trace: LogMethodType;
    debug: LogMethodType;
    info: LogMethodType;
    warn: LogMethodType;
    error: LogMethodType;
    state: LogMethodType;
    fatal: LogMethodType;

    constructor( config?: LoggerConfigType ) {
        this._config = _.merge( {}, DefaultConfig, config );

        this._levelValue = getLevelValue( this._config.level );
        this._stdoutLevelValue = getLevelValue( this._config.stdoutLevel );

        const { transports } = this._config;

        var stdoutConfig;

        if ( this._config.stdout ) {
            if ( this._config.stdout instanceof Logger ) {
                this.stdout = this._config.stdout;

            } else if ( this._config.stdout instanceof Transport ) {
                stdoutConfig = {
                    level: this._config.stdoutLevel,
                    stdout: false,
                    transports: [
                        this._config.stdout,
                    ]
                };
            } else {
                throw Error( 'Wrong stdout' );
            }

        } else if ( this._config.stdout === undefined ) {
            stdoutConfig = {
                level: this._config.stdoutLevel,
                stdout: false,
                transports: [
                    new StdoutTransport({
                        level: this._config.stdoutLevel,
                    })
                ]
            };
        }
        if ( stdoutConfig ) {
            this.stdout =
                new Logger(
                    _.merge(
                        {},
                        _.omit( this._config, [ 'transports', 'stdout' ] ),
                        stdoutConfig
                    )
                );
        }

        this._transports =
            transports
                .filter(
                    transport => transport._canBeHandled( this._levelValue )
                );
    }

    child( childConfig: LoggerConfigType ) {
        var { stdout } = childConfig;

        if ( stdout === undefined ) {
            stdout =
                this.stdout
                && this.stdout.child( _.omit( childConfig, 'transports' ) );
        }

        const config =
                _.mergeWith(
                    {}, this._config, { stdout }, childConfig,
                    configMergeCustomizer
                );

        return new Logger( config );
    }

    log( level: LevelType, ...msgs: Array<any> ): Logger {
        const levelValue = getLevelValue( level );

        // check with logger level
        if ( this._levelValue <= levelValue ) {
            const logParams = {
                msgs,
                printLogCache: {},
                options: {
                    level,
                    levelValue,
                },
            };

            this.stdout && this.stdout._log( logParams );

            this._log( logParams );
        }

        return this;
    }

    trace() { return this.log( 'trace', ...arguments ) }

    debug() { return this.log( 'debug', ...arguments ) }

    info() { return this.log( 'info', ...arguments ) }

    warn() { return this.log( 'warn', ...arguments ) }

    error() { return this.log( 'error', ...arguments ) }

    state() { return this.log( 'state', ...arguments ) }

    fatal() {
        const result = this.log( 'fatal', ...arguments );

        if ( this._config.stopOnFatal ) process.exit( 1 );

        return result;
    }

    end() {
        this.stdout && this.stdout.end();

        for ( var i = this._transports.length; i--; ) {
            this._transports[ i ]._end();
        }
    }

    // Private
    // --------------------------------------------------------
    _log( params: {
        msgs: Array<any>,
        printLogCache: Object,
        options: OptionsType,
    }) {
        try {
            for ( var i = this._transports.length; i--; ) {
                this._handleTransport({
                    transport: this._transports[ i ],
                    ...params,
                });
            }

        } catch ( error ) {
            this.fatal( error );
        }
    }

    _handleTransport({
        transport,
        printLogCache,
        options,
        msgs,
    }: {
        transport: Transport<*>,
        printLogCache: Object,
        options: OptionsType,
        msgs: Array<any>,
    }) {
        const { levelValue } = options;

        // check transport level
        if ( !transport._levelIsOkToPrint( levelValue ) ) return;

        const outStr =
                this._printLog({
                    transport,
                    printLogCache,
                    options,
                    msgs,
                });

        transport._handler( outStr, options );
    }

    _printLog({
        transport,
        printLogCache,
        options,
        msgs,
    }: {
        transport: Transport<*>,
        printLogCache: Object,
        options: Object,
        msgs: Array<any>,
    }) {
        const { printType } = transport;

        if ( !printLogCache[ printType ] ) {
            printLogCache[ printType ] =
                this._getLogOutput( printType, options, msgs );
        }

        return printLogCache[ printType ];
    }

    _getLogOutput(
        printType: PrintType,
        options: OptionsType,
        args: Array<any>
    ) {
        const ts = new Date().toISOString();

        var msgs = this._prettyPrintAll( printType, options, args );

        const { hostname, jsonStringifyArgs } = this._config;

        const { level } = options;

        var separator = '';

        switch ( printType ) {
            case 'json':
                return JSON.stringify(
                    { ts, level, hostname, msgs },
                    ...jsonStringifyArgs
                );

            case 'simple-cli':
            case 'simple-json-cli':
                const { stdoutMsgSeparator } = this._config;

                if ( stdoutMsgSeparator ) separator = stdoutMsgSeparator;

            case 'simple-json':
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
        const { jsonStringifyArgs } = this._config;

        if ( ~printType.indexOf( 'simple-json' ) ) {
            return JSON.stringify( msg, ...jsonStringifyArgs );
        }

        const isJsonType = printType === 'json';
        const useColors = printType === 'simple-cli';

        const { level, levelValue } = options;

        const { depth } = this._config.printConfig;

        const printConfig = {
            ...this._config.printConfig,
            colors: useColors,
        };

        const type = GetType( msg );

        switch ( type ) {
            case 'Error':
                msg = {
                    message: msg.message,
                    stack: msg.stack,
                };

                if ( isJsonType ) return msg;

                return (
                    this._stringify( msg, printConfig )
                        .replace( RegExps.escapedLineBreaks, '\n' )
                );

            case 'Array':
            case 'Object':
                if ( currDepth > depth ) return `[${ type }]`;

                if ( !isJsonType ) {
                    return this._stringify( msg, printConfig );
                }

                const nextDepth = currDepth + 1;

                const prettyPrint = value => (
                    this._prettyPrint( printType, options, value, nextDepth )
                );

                const result =
                        _.isArray( msg )
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
                return `[${ this._stringify( msg, printConfig ) }]`;

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

        var result = Util.inspect( value, printConfig );

        if ( ~result.indexOf( '\n' ) ) {
            result = result.replace( RegExps.startsWithOpenBracket, '{\n  ' );
        }

        return result;
    }
}

export default Logger;



// =============================================================================
// Helpers
// =============================================================================
const ConfigMergeHandlers = {
    transports: ( objValue, srcValue ) => (
        _.isArray( objValue ) ? objValue.concat( srcValue ) : undefined
    ),
    jsonStringifyArgs: ( objValue, srcValue ) => (
        _.isArray( objValue ) ? srcValue : undefined
    ),
};

function configMergeCustomizer( objValue: any, srcValue: any, key: string ) {
    const handler = ConfigMergeHandlers[ key ];

    if ( handler ) return handler( ...arguments );
}
