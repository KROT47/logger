/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger, StdoutTransport, FileTransport } from '../common';


// =============================================================================
// Start
// =============================================================================
export function startTest( outputDirPath: string ) {
    const logger = new Logger({
        hostname: '08',
        level: 'trace',
        stdoutLevel: 'trace',
        stdout: new StdoutTransport({
            printType: 'json',
        }),
    });

    logger.info( 'This line should be in json format' );
}

export default startTest;
