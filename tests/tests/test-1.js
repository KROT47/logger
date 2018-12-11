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
    const logger = new Logger({
        level: 'trace',
    });

    const logger2 = logger.child({
        hostname: '111',
        transports: [
            new FileTransport({
                level: 'error',
                filePath: `${ outputDirPath }/error.json`,
            }),
        ]
    });

    logger2.error( new Error('test') );
}

export default startTest;
