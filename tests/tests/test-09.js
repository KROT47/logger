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
        hostname: '09',
        level: 'trace',
        stdoutLevel: 'trace',
        stdout: new StdoutTransport({
            printType: 'json',
        }),
        jsonStringifyArgs: [ null, 2 ]
    });

    logger.info({
        a: {
            a: {
                a: {
                    a: {
                        a: 'Should be pretty printed'
                    }
                }
            }
        }
    });
}

export default startTest;
