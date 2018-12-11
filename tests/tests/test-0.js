/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger } from '../common';


// =============================================================================
// Start
// =============================================================================
export function startTest( outputDirPath: string ) {
    const logger = new Logger;

    logger.info( 'Writes just to stdout' );
}

export default startTest;
