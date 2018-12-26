/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger } from '../common';


// =============================================================================
// Start
// =============================================================================
export function startTest( outputDirPath: string ) {
    const logger = new Logger({
        stdoutLevel: 'info',
    });

    const logger2 = logger.child({
        hostname: '05',
    });

    logger2.stdout.info( 'This line will be printed only to stdout' );
}

export default startTest;
