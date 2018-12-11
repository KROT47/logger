/* @flow */

// =============================================================================
// Imports
// =============================================================================
import FSExtra from 'fs-extra';
import Path from 'path';


// =============================================================================
// GetFiles
// =============================================================================
/**
 * Returns all directories in path
 */
export function GetFiles( dirPath: string ) {
    return (
        FSExtra.readdirSync( dirPath )
            .filter( file => (
                !FSExtra.lstatSync( Path.join( dirPath, file ) ).isDirectory()
            ))
    );
}


// =============================================================================
// RemoveSync
// =============================================================================
export const RemoveSync = FSExtra.removeSync;
