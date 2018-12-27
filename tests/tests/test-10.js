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
        hostname: '10',
        stdout: new StdoutTransport({
            printType: 'simple-json-cli',
        }),
        jsonStringifyArgs: [ null, 2 ]
    });

    const complexObj = {
        "glossary": {
            "title": "example glossary",
            "GlossDiv": {
                "title": "S",
                "GlossList": {
                    "GlossEntry": {
                        "ID": "SGML",
                        "SortAs": "SGML",
                        "GlossTerm": "Standard Generalized Markup Language",
                        "Acronym": "SGML",
                        "Abbrev": "ISO 8879:1986",
                        "GlossDef": {
                            "para": "A meta-markup language, used to create markup languages such as DocBook.",
                            "GlossSeeAlso": ["GML", "XML"]
                        },
                        "GlossSee": "markup"
                    }
                }
            }
        }
    };

    logger.info( 'Pretty printed:', complexObj );

    const logger2 = logger.child({
        stdout: new StdoutTransport({
            printType: 'simple-json-cli',
        }),
        jsonStringifyArgs: []
    });

    logger2.info( 'Compact JSON object:', complexObj );
}

export default startTest;
