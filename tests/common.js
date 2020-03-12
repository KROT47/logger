/* @flow */

// =============================================================================
// Imports
// =============================================================================
import GetType from 'get-explicit-type';

import { getUpdatedObjDeep } from '../helpers';

import { Logger, type LoggerConfigType } from '../dist';
import { FileTransport } from '../dist/transports/FileTransport';
import { StdoutTransport } from '../dist/transports/StdoutTransport';


// =============================================================================
// Exports
// =============================================================================
export {
    Logger,
    FileTransport,
    StdoutTransport,
};


// =============================================================================
// Constants
// =============================================================================
export const resultsDirPath = `${ process.cwd() }/tests/results`;
export const outputDirPath = `${ resultsDirPath }/output`;
export const expectedResultsDirPath = `${ resultsDirPath }/expected`;

const DefaultDate = new Date( 0 );

// =============================================================================
// DefaultTestLoggerConfig
// =============================================================================
export const DefaultTestLoggerConfig: $Shape<LoggerConfigType> = {
    prettyPrintHandlers: {
        'Error': ( options ) => {
            const {
                msg,
                defaultHandler,
            } = options;

            return defaultHandler({
                ...options,
                msg: prepareError( msg ),
            });
        },

        'Array': arrayOrObjectHandler,
        'Object': arrayOrObjectHandler,

        'Date': dateHandler,
    },
};

// =============================================================================
// PrettyPrintHandlers
// =============================================================================
function arrayOrObjectHandler( options ) {
    const {
        msg,
        defaultHandler,
        loggerInstance,
    } = options;

    if ( msg._circular ) return defaultHandler( options );

    return defaultHandler({
        ...options,
        msg: getUpdatedObjDeep( msg, ( value, key, source, dest ) => {
            if ( value instanceof Error ) return prepareError( value );

            if ( value instanceof Date ) return DefaultDate;

            return value;
        }, {
            maxDepth: loggerInstance._config.printConfig.depth,
            onMaxDepthReachCb: arrOrObj => {
                return `[${ GetType( arrOrObj ) }]`;
            },
        } ),
    });
}

function dateHandler( options ) {
    const {
        msg,
        defaultHandler,
    } = options;

    return defaultHandler({
        ...options,
        msg: DefaultDate,
    });
}

function prepareError( error: Error ) {
    const testError =  new Error( error.message );

    testError.stack = '[Error: ' + testError.message + ']';

    return testError;
}
