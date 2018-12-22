/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger, FileTransport } from '../common';


// =============================================================================
// Start
// =============================================================================
export function startTest( outputDirPath: string ) {
    const logger = new Logger({
        stdoutlevel: 'trace',
        level: 'info',
    });

    const logger2 = logger.child({
        hostname: '4444',
    });

    logger2.info( 'Next line should be result of 1 + 1' );

    logger2.trace( 1 + 1, 'OK!' );
}

export default startTest;
