/* @flow */

// =============================================================================
// Imports
// =============================================================================
import {
    removeSync,
} from 'fs-extra';
import {
    readdirSync,
    lstatSync,
} from 'fs';
import Path from 'path';


// =============================================================================
// GetFiles
// =============================================================================
/**
 * Returns all directories in path
 */
export function GetFiles(
    dirPath: string,
    filter?: ?( { dirPath: string, file: string } ) => boolean
): Array<string> {
    return (
        readdirSync( dirPath )
            .filter( file => {
                if ( filter ) return filter({ dirPath, file });

                return !lstatSync( Path.join( dirPath, file ) ).isDirectory();
            })
    );
}


// =============================================================================
// RemoveSync
// =============================================================================
export const RemoveSync = removeSync;
