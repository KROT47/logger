/* @flow */

// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';

import {
    RegExps,
} from './constants';

import {
    type PrettyPrintHandlerOptionsType,
} from './flowTypes';

type ReturnType = string | Array<string> | { [ key: string ]: string };


// ArrayOrObjectPrettyPrint
// --------------------------------------------------------
export function ArrayOrObjectPrettyPrint({
    msg,
    msgType,
    printType,
    options,
    currDepth,
    depth,
    isJsonType,
    printConfig,
    loggerInstance,
}: PrettyPrintHandlerOptionsType ): ReturnType {
    if ( currDepth > depth ) return `[${ msgType }]`;

    if ( !isJsonType ) {
        return loggerInstance._stringify( msg, printConfig );
    }

    const nextDepth = currDepth + 1;

    const prettyPrint = value => (
        loggerInstance._prettyPrint( printType, options, value, nextDepth )
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
};

// FunctionOrUndefinedPrettyPrint
// --------------------------------------------------------
export function FunctionOrUndefinedPrettyPrint({
    msgType
}: PrettyPrintHandlerOptionsType ): string {
    return `[${ msgType }]`;
};

// StringOrNullPrettyPrint
// --------------------------------------------------------
export function StringOrNullPrettyPrint({
    msg
}: PrettyPrintHandlerOptionsType ): string {
    return msg;
};

// ErrorPrettyPrint
// --------------------------------------------------------
export function ErrorPrettyPrint({
    msg,
    isJsonType,
    printConfig,
    loggerInstance,
}: PrettyPrintHandlerOptionsType ): string | Object {
    msg = {
        message: msg.message,
        stack: msg.stack,
        _type: 'Error',
    };

    if ( isJsonType ) return msg;

    return (
        loggerInstance._stringify( msg, printConfig )
            .replace( RegExps.escapedLineBreaks, '\n' )
    );
};

// NumberPrettyPrint
// --------------------------------------------------------
export function NumberPrettyPrint({
    msg,
}: PrettyPrintHandlerOptionsType ): string {
    return Number.isNaN( msg ) ? '[NaN]' : msg;
}

// DatePrettyPrint
// --------------------------------------------------------
export function DatePrettyPrint({
    msg
}: PrettyPrintHandlerOptionsType ): string {
    return msg.toISOString();
}

// PromisePrettyPrint
// --------------------------------------------------------
export function PromisePrettyPrint({
    msg,
    printConfig,
    loggerInstance,
}: PrettyPrintHandlerOptionsType ): string {
    return `[${ loggerInstance._stringify( msg, printConfig ) }]`;
}
