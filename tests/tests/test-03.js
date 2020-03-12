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
        level: 'info',
    });

    const logger2 = logger.child({
        ...DefaultTestLoggerConfig,
        hostname: '03',
        transports: [
            new FileTransport({
                level: 'trace',
                strict: false,
                printType: 'simple',
                filePath: `${ outputDirPath }/all.log`,
            }),
        ]
    });

    const a: Object = { x: 1, _circular: true };
    a.a = a;

    logger2.info( a );

    logger2.debug( a );
}

export default startTest;
