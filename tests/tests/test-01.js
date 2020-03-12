/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger, FileTransport, DefaultTestLoggerConfig } from '../common';


// =============================================================================
// Start
// =============================================================================
export function startTest( outputDirPath: string ) {
    const logger = new Logger({
        level: 'trace',
    });

    const logger2 = logger.child({
        ...DefaultTestLoggerConfig,
        hostname: '01',
        transports: [
            new FileTransport({
                level: 'error',
                filePath: `${ outputDirPath }/error.json`,
            }),
        ],
    });

    logger2.error( new Error( 'test' ) );
}

export default startTest;
