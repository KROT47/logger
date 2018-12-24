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
    stdout: undefined,
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

    constructor( config?: LoggerConfigType ) {
        this._config = _.merge( {}, DefaultConfig, config );

        this._levelValue = getLevelValue( this._config.level );
        this._stdoutLevelValue = getLevelValue( this._config.stdoutLevel );

        var stdoutConfig;

        if ( this._config.stdout ) {
            if ( this._config.stdout instanceof Logger ) {
                this.stdout = this._config.stdout;
            } else {
                stdoutConfig = {
                    level: this._config.stdoutLevel,
                    stdout: this._config.stdout,
                };
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
        if ( stdoutConfig ) this.stdout = new Logger( stdoutConfig );

        this._transports =
            this._config.transports
                .filter(
                    transport => transport._canBeHandled( this._levelValue )
                );
    }

    child( childConfig: LoggerConfigType ) {
        const stdout =
                this.stdout
                && this.stdout.child(
                    _.omit( childConfig, [ 'transports', 'stdout' ] )
                );

        const config =
                _.mergeWith(
                    {}, this._config, { stdout }, childConfig,
                    this._childCustomizer
                );

        return new Logger( config );
    }
    _childCustomizer( objValue: any, srcValue: any ) {
        if ( _.isArray( objValue ) ) return objValue.concat( srcValue );
    }

    log( level: LevelType, ...msgs: Array<any> ) {
        const levelValue = getLevelValue( level );

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

    trace( ...args: Array<any> ) { this.log( 'trace', ...args ) }

    debug( ...args: Array<any> ) { this.log( 'debug', ...args ) }

    info( ...args: Array<any> ) { this.log( 'info', ...args ) }

    warn( ...args: Array<any> ) { this.log( 'warn', ...args ) }

    error( ...args: Array<any> ) { this.log( 'error', ...args ) }

    fatal( ...args: Array<any> ) {
        this.log( 'fatal', ...args );

        if ( this._config.stopOnFatal ) process.exit( 1 );
    }

    major( ...args: Array<any> ) { this.log( 'major', ...args ) }

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
                    globalLevelValue: this._levelValue,
                    ...params,
                });
            }

        } catch ( error ) {
            this.fatal( error );
        }
    }

    _handleTransport({
        globalLevelValue,
        transport,
        printLogCache,
        options,
        msgs,
    }: {
        transport: Transport<*>,
        globalLevelValue: number,
        printLogCache: Object,
        options: OptionsType,
        msgs: Array<any>,
    }) {
        const { levelValue } = options;

        // check global level
        if ( globalLevelValue > levelValue ) return;

        // chack transport level
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

        var result = Util.inspect( value, printConfig );

        if ( ~result.indexOf( '\n' ) ) {
            result = result.replace( RegExps.startsWithOpenBracket, '{\n  ' );
        }

        return result;
    }
}

export default Logger;
