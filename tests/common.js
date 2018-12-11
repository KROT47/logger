/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger } from '../dist';
import { FileTransport } from '../dist/transports/FileTransport';


// =============================================================================
// Exports
// =============================================================================
export {
    Logger,
    FileTransport,
};


// =============================================================================
// Constants
// =============================================================================
export const resultsDirPath = `${ process.cwd() }/tests/results`;
export const outputDirPath = `${ resultsDirPath }/output`;
export const expectedResultsDirPath = `${ resultsDirPath }/expected`;
