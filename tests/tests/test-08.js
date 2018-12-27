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

    const logger2 = logger.child({
        jsonStringifyArgs: [ null, 2 ]
    });

    logger2.info({
        a: {
            a: {
                a: {
                    a: {
                        a: 'Pretty printed JSON'
                    }
                }
            }
        }
    });
}

export default startTest;
