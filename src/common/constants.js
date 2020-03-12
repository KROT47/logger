/* @flow */

// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';


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

export const RegExps = {
    lineBreaks: /\n/g,
    escapedLineBreaks: /\\n/g,
    startsWithOpenBracket: /^{\s+/,
};

export const LevelsByName = _.keyBy( Levels, 'name' );
export const LevelsByValue = _.keyBy( Levels, 'value' );
