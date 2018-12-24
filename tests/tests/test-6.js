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
        level: 'none',
        stdoutLevel: 'none',
    });

    const logger2 = logger.child({
        hostname: '666666',
        transports: [
            new FileTransport({
                level: 'trace',
                strict: false,
                printType: 'simple',
                filePath: `${ outputDirPath }/all.log`,
            }),
        ]
    });

    logger2.error( 'No printing' );

    logger2.major( 'Something important' );
}

export default startTest;
