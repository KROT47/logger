# Logger

## Example
```js
import Logger from '@bubblehunt/logger';

// Simple
// --------------------------------------------------------
const simpleLogger = new Logger;

simpleLogger.info( 'Writes to stdout', 1, { a: [ 123 ] } );


// Full
// --------------------------------------------------------
import FileTransport from '@bubblehunt/logger/transports/FileTransport';

const logPath = 'out';

const logger = new Logger({
    // Minimal level which would be printed.
    // Levels strictness from min to max:
    //   'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'none'
    level: 'info',
    // Same as level but for stdout specially
    stdoutLevel: 'debug',
    // Whether to process.exit( 1 ) on fatal error
    stopOnFatal: true,
    // Log process label
    hostname: 'Main',
    // Separates each message in stdout
    stdoutMsgSeparator: '----------------------',
    // Every message will be written to transport if level matches
    transports: [
        new FileTransport({
            // If not strict then all upper levels will also be printed
            strict: false,
            level: 'trace',
            // File will be created right away even if no data was written
            createOnFirstWrite: false,
            filePath: `${ logPath }/0_all.json`,
        }),
        new FileTransport({
            level: 'trace',
            filePath: `${ logPath }/1_trace.json`,
        }),
        new FileTransport({
            level: 'debug',
            filePath: `${ logPath }/2_debug.json`,
        }),
        new FileTransport({
            level: 'info',
            filePath: `${ logPath }/3_info.json`,
        }),
        new FileTransport({
            level: 'warn',
            filePath: `${ logPath }/4_warn.json`,
        }),
        new FileTransport({
            level: 'error',
            filePath: `${ logPath }/5_error.json`,
        }),
        new FileTransport({
            level: 'fatal',
            filePath: `${ logPath }/6_fatal.json`,
        }),
    ],
    printConfig: {
        // Whether to use colors in stdout
        colors: false,
        // Object print depth
        depth: 5,
        // First elements quantity to print
        maxArrayLength: 30,
    },
});

logger.info( `writes to file with level: 'info' and stdout` );

logger.trace( { a: 1 }, 1 ); // nothing happens


// Make child with new options
// --------------------------------------------------------
var logger2 = logger.child({
    hostname: 'Child',
    level: 'trace',
});

logger2.trace( `writes to two first files with level: 'trace'` );


// Make child with new options
// --------------------------------------------------------
logger3 = logger2.child({
    stdoutLevel: 'trace',
});

logger3.trace( `writes to two first files with level: 'trace' and to stdout` );
```


## Transport

#### Example: create Transport
```js
/* @flow */

// =============================================================================
// Imports
// =============================================================================
import {
    Transport,
    type TransportConfigType,
    type HandlerType,
} from '@bubblehunt/logger/transports/Transport';

// Flow types
// --------------------------------------------------------
type DefaultConfigType = {};

type MyTransportConfigType =
    & TransportConfigType
    & DefaultConfigType;


// =============================================================================
// Constants
// =============================================================================
const DefaultConfig = {
    // Required message level to call handler
    // level?: LevelType,

    // Called if current Transport class has no method 'handler'
    // handler?: HandlerType,

    // Messages format
    // printType?: 'json' | 'simple-cli' | 'simple',

    // if true then msg will be printed only if level is equal to transport's
    // by default it is printed when level is equal or greater
    // strict?: boolean,
};


// =============================================================================
// MyTransport
// =============================================================================
export class MyTransport extends Transport<MyTransportConfigType> {

    constructor( config?: TransportConfigType ) {
        super({ ...DefaultConfig, ...config });
    }

    // Public
    // --------------------------------------------------------
    handler: HandlerType = ( logStr, options ) => {
        console.log( logStr, options );
    };

    end = () => {};
}

export default MyTransport;

```
