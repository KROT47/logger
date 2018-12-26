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
        hostname: '07',
        level: 'trace',
        stdoutLevel: 'trace',
        transports: [
            new FileTransport({
                level: 'trace',
                strict: false,
                printType: 'simple',
                filePath: `${ outputDirPath }/all.log`,
            }),
        ],
        printConfig: {
            depth: 20,
        }
    });

    logger.info({
        a: {
            a: {
                a: {
                    a: {
                        a: {
                            a: {
                                a: {
                                    a: {
                                        a: {
                                            a: {
                                                a: {
                                                    a: {
                                                        a: 1,
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

export default startTest;
