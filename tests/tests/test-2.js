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
        level: 'info',
    });

    const logger2 = logger.child({
        hostname: '222',
        transports: [
            new FileTransport({
                level: 'info',
                printType: 'simple',
                filePath: `${ outputDirPath }/info.log`,
            }),
            new FileTransport({
                level: 'info',
                filePath: `${ outputDirPath }/info.json`,
            }),
        ]
    });

    const a: Object = { x: 1 };
    a.a = a;

    logger2.info( a );

    logger2.info({ a: { a: { a: { a: { a: { a: { a: 1 } } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: [ 1 ] } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: () => 1 } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: NaN } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: undefined } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: null } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: 1 } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: '1' } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: new Date } } } } } });
    logger2.info({ a: { a: { a: { a: { a: { a: new Error } } } } } });
    logger2.info([ 1, [ 1, [ 1, [ 1, [ 1, [ 1, [ 1, [ 1 ] ] ] ] ] ] ] ]);
    logger2.info({ a: { a: { a: { a: { a: new RegExp('a') } } } } });
    logger2.info({ a: { a: { a: { a: { a: Symbol('asd') } } } } });
    logger2.info({ a: { a: { a: { a: { a: Promise.resolve('asd') } } } } });
}

export default startTest;
