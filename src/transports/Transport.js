/* @flow */

// =============================================================================
// Imports
// =============================================================================

// Local
// --------------------------------------------------------
import {
    getLevelValue,
    type TransportInterface,
    type TransportConfigType,
    type HandlerType,
    type EndType,
    type PrintType,
} from '../common';

// Flow types
// --------------------------------------------------------
export type {
    TransportConfigType,
    HandlerType,
};


// =============================================================================
// Constants
// =============================================================================
const DefaultConfig = {
    level: 'info',
    strict: true,
    printType: 'simple',
};


// =============================================================================
// Transport
// =============================================================================
export
    class Transport<ConfigType: TransportConfigType<Object>>
        implements TransportInterface<ConfigType>
    {
        levelValue: number;
        _config: ConfigType;
        _handler: HandlerType;
        _end: EndType;

        constructor( config?: ConfigType ) {
            this._config =
                // $FlowOk
                { ...DefaultConfig, ...config };

            this.levelValue = getLevelValue( this._config.level );
        }

        get printType(): PrintType { return this._config.printType }

        // Public
        // --------------------------------------------------------
        handler: HandlerType = ( logStr, options ) => {};

        end = EmptyFunc;

        // Protected
        // --------------------------------------------------------
        _handler: HandlerType = ( logStr, options ) => {
            const { handler } = this._config;

            if ( handler ) {
                handler( logStr, options, this.handler );
            } else {
                this.handler( logStr, options );
            }
        }

        _end = () => this.end();

        _levelIsOkToPrint( levelValue: number ) {
            return (
                this._config.strict
                    ? this.levelValue === levelValue
                    : this.levelValue <= levelValue
            );
        }

        _canBeHandled( levelValue: number ) {
            return !this._config.strict || this.levelValue >= levelValue;
        }
    }

export default Transport;


// =============================================================================
// Helpers
// =============================================================================
function EmptyFunc( ...args: Array<any> ) {}
