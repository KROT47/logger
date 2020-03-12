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
export function GetFiles(
    dirPath: string,
    filter?: ?( { dirPath: string, file: string } ) => boolean
) {
    return (
        FSExtra.readdirSync( dirPath )
            .filter( file => {
                if ( filter ) return filter({ dirPath, file });

                return (
                    !FSExtra.lstatSync( Path.join( dirPath, file ) )
                    .isDirectory()
                );
            })
    );
}


// =============================================================================
// RemoveSync
// =============================================================================
export const RemoveSync = FSExtra.removeSync;
