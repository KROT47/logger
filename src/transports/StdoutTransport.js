/* @flow */


// =============================================================================
// Imports
// =============================================================================

// Local
// --------------------------------------------------------
import Transport from './Transport';
import {
    getLevelValue,
    type TransportConfigType,
    type HandlerType,
    type LevelType,
} from '../common';

// Flow types
// --------------------------------------------------------
type DefaultConfigType = {||};

type StdoutTransportConfigType = TransportConfigType<DefaultConfigType>;


// =============================================================================
// Constants
// =============================================================================
const DefaultConfig = {
    printType: 'simple-cli',
    strict: false,
};


// =============================================================================
// StdoutTransport
// =============================================================================
export class StdoutTransport extends Transport<StdoutTransportConfigType> {

    constructor( config?: StdoutTransportConfigType ) {
        super({ ...DefaultConfig, ...config });

        this.levelValue = getLevelValue( this._config.level );
    }

    // Public
    // --------------------------------------------------------
    handler: HandlerType = ( logStr, { level } ) => {
        console.log( logStr );
    }
}

export default StdoutTransport;
