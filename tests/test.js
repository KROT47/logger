/* @flow */

// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';
import FS from 'fs';
import Path from 'path';
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
// Constants
// =============================================================================
const testsDir = `${ __dirname }/tests`;

const RegExps = {
    dates: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g,
};


// =============================================================================
// Start
// =============================================================================
const testFilePaths = GetFiles( testsDir );

for ( var i = 0; i < testFilePaths.length; ++i ) {
    const testFileName = testFilePaths[ i ];
    const testFilePath = `${ testsDir }/${ testFileName }`;

    const runTest = require( testFilePath ).default;

    const testOutputDir =
        `${ outputDirPath }/${ Path.basename( testFileName, '.js' ) }`;

    runTest( testOutputDir );

}

setTimeout( () => {
    const errorsCount = checkTestResults( outputDirPath );

    if ( !errorsCount ) {
        RemoveSync( outputDirPath );

        console.log( 'DONE! No errors.');
    }

}, 100 );


function checkTestResults( testOutputDir ) {
    const outputFilePaths = KlawSync( testOutputDir );

    var errorsCount = 0;

    for ( var i = outputFilePaths.length; i--; ) {
        const { path: outputFilePath, stats } = outputFilePaths[ i ];

        if ( stats.isDirectory() ) continue;

        const expectedResultFilePath =
            outputFilePath.replace( outputDirPath, expectedResultsDirPath );

        console.log( '==========================' );

        if ( !check( outputFilePath, expectedResultFilePath ) ) {
            console.log( 'Error:', outputFilePath );
            errorsCount++;
        } else {
            console.log( 'OK!' );
        }
    }

    return errorsCount;
}

function check( filePath1, filePath2 ) {
    const fileStr1 = FS.readFileSync( filePath1 ).toString();
    const fileStr2 = FS.readFileSync( filePath2 ).toString();

    return (
        fileStr1.replace( RegExps.dates, '' )
        === fileStr2.replace( RegExps.dates, '' )
    );
}
