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
        stdoutLevel: 'trace',
        level: 'info',
    });

    const logger2 = logger.child({
        hostname: '04',
    });

    logger2.info( 'Next line should be result of 1 + 1' );

    logger2.trace( 1 + 1, 'OK!' );
}

export default startTest;
