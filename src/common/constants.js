/* @flow */

// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';

import { type LevelType } from './flowTypes';

// =============================================================================
// Constants
// =============================================================================
type LevelConfigType = {
    name: LevelType,
    value: number,
    printValue: string,
};

export const Levels: Array<LevelConfigType> = [
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

export const LevelsByName: { [ key: string ]: LevelConfigType } =
    _.keyBy( Levels, 'name' );

export const LevelsByValue: { [ key: number ]: LevelConfigType } =
    _.keyBy( Levels, 'value' );
