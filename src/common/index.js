/* @flow */

// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';

import {
    LevelsByName,
} from './constants';

import {
    ErrorPrettyPrint,
    ArrayOrObjectPrettyPrint,
    FunctionOrUndefinedPrettyPrint,
    NumberPrettyPrint,
    DatePrettyPrint,
    StringOrNullPrettyPrint,
    PromisePrettyPrint,
} from './prettyPrintHandlers';

import {
    type PrettyPrintHandlersType,
    type LevelType,
} from './flowTypes';

export * from './flowTypes';


// =============================================================================
// Constants
// =============================================================================
export * from './constants';

export const DefaultPrettyPrintHandlers: PrettyPrintHandlersType = {
    'Error': ErrorPrettyPrint,

    'Array': ArrayOrObjectPrettyPrint,
    'Object': ArrayOrObjectPrettyPrint,

    'Function': FunctionOrUndefinedPrettyPrint,
    'Undefined': FunctionOrUndefinedPrettyPrint,

    'Number': NumberPrettyPrint,

    'Date': DatePrettyPrint,

    'String': StringOrNullPrettyPrint,
    'Null': StringOrNullPrettyPrint,

    'Promise': PromisePrettyPrint,
};


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
