/* @flow */

/**
 * Updates tests snapshots
 */
// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';
import { removeSync, copySync } from 'fs-extra';
import Path from 'path';
import Mkdirp from 'mkdirp';
import KlawSync from 'klaw-sync';

// Helpers
// --------------------------------------------------------
import { GetFiles, RemoveSync } from '../helpers/FsHelpers';

// Local
// --------------------------------------------------------
import {
    outputDirPath,
    expectedResultsDirPath,
} from './common';


// =============================================================================
// Start
// =============================================================================
const outputFilePaths = KlawSync( outputDirPath );

removeSync( expectedResultsDirPath );

for ( var i = outputFilePaths.length; i--; ) {
    const { path: outputFilePath, stats } = outputFilePaths[ i ];

    if ( stats.isDirectory() ) continue;

    const expectedResultFilePath =
        outputFilePath.replace( outputDirPath, expectedResultsDirPath );

    const expectedResultDirPath = Path.dirname( expectedResultFilePath );

    Mkdirp.sync( expectedResultDirPath );

    copySync( outputFilePath, expectedResultFilePath );
}
