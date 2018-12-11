/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger } from '../../dist';
import { FileTransport } from '../../dist/transports/FileTransport';


// =============================================================================
// Start
// =============================================================================
export function startTest( outputDirPath: string ) {
    const logger = new Logger;

    logger.info( 'Writes just to stdout' );
}

export default startTest;
