/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger, DefaultTestLoggerConfig } from '../common';


// =============================================================================
// Start
// =============================================================================
export function startTest( outputDirPath: string ) {
    const logger = new Logger({
        ...DefaultTestLoggerConfig,
        stdoutLevel: 'info',
    });

    const logger2 = logger.child({
        hostname: '05',
    });

    logger2.stdout.info( 'This line will be printed only to stdout' );
}

export default startTest;
