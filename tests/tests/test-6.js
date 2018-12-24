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
        level: 'state',
        stdoutLevel: 'state',
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

    logger2.error( 'This must not be printed' );

    logger2.state( 'Something important' );


    const logger3 = logger2.child({
        hostname: '666666-2',
        level: 'none',
        stdoutLevel: 'none',
        stopOnFatal: false,
    });

    logger3.fatal( 'This must not be printed' );
}

export default startTest;
