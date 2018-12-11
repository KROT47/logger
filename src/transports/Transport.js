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
    strict: true,
    printType: 'simple',
};


// =============================================================================
// Transport
// =============================================================================
export
    class Transport<ConfigType: TransportConfigType>
        implements TransportInterface<ConfigType>
    {
        levelValue: number;
        printType: PrintType;
        _config: ConfigType;
        _handler: HandlerType;
        _end: EndType;

        constructor( config?: TransportConfigType ) {
            // $FlowFixMe
            this._config = { ...DefaultConfig, ...config };

            this.levelValue = getLevelValue( this._config.level );
            // $FlowFixMe
            this.printType = this._config.printType;
        }

        // Public
        // --------------------------------------------------------
        handler: HandlerType = ( logStr, options ) => {
            const { handler = EmptyFunc } = this._config;

            handler( logStr, options );
        };

        end = EmptyFunc;

        // Protected
        // --------------------------------------------------------
        _handler: HandlerType = ( logStr, options ) => {
            this.handler( logStr, options );
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
