/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger } from '../dist';
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
