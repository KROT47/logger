/* @flow */

// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';

// Flow types
// --------------------------------------------------------
// json - basically to print to file
// simple-cli - uses cli colors, so printing to file will be not pretty
// simple - prints without colors as simple text
export type PrintType =
        | 'json'
        | 'simple-cli'
        | 'simple-json'
        | 'simple-json-cli'
        | 'simple';

export type LevelType =
        | 'trace'
        | 'debug'
        | 'info'
        | 'warn'
        | 'error'
        | 'fatal'
        | 'none'
        | 'state';

export interface TransportInterface<ConfigType> {
    handler: HandlerType;
    end: EndType;
}

export type HandlerType =
    ( logItem: string, { level: LevelType, levelValue: number } ) => void;

export type EndType = () => void;

export type TransportConfigType<SpecificFieldsType> = {|
    level?: LevelType,
    handler?: HandlerType,
    printType?: PrintType,
    // if true then msg will be printed only if level is equal to transport's
    // by default it is printed when level is equal or greater
    strict?: boolean,

    ...SpecificFieldsType,
|};

export type OptionsType = {
    level: LevelType,
    levelValue: number,
};


// =============================================================================
// Constants
// =============================================================================
export const Levels = [
    { name: 'trace', value: 0, printValue: 'TRACE' },
    { name: 'debug', value: 1, printValue: 'DEBUG' },
    { name: 'info',  value: 2, printValue: 'INFO' },
    { name: 'warn',  value: 3, printValue: 'WARN' },
    { name: 'error', value: 4, printValue: 'ERROR' },
    { name: 'state', value: 5, printValue: 'STATE' },
    { name: 'fatal', value: 6, printValue: 'FATAL' },
    { name: 'none',  value: 7, printValue: '' },
];

export const LevelsByName = _.keyBy( Levels, 'name' );
export const LevelsByValue = _.keyBy( Levels, 'value' );


// =============================================================================
// getLevelValue
// =============================================================================
export function getLevelValue( level: ?LevelType ): number {
    switch ( typeof level ) {
        case 'string': return LevelsByName[ level ].value || 0;

        case 'number': return level;

        default: return 0;
    }
}
