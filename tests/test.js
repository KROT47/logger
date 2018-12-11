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
    const errorsCount = checkTestResults();

    if ( errorsCount ) {
        console.log( `Errors count: ${ errorsCount }` );
    } else {
        RemoveSync( outputDirPath );

        console.log( 'DONE! No errors.');
    }

}, 100 );


var errorsCount = 0;

function checkTestResults() {
    const expectedResultsFilePaths =
        KlawSync( expectedResultsDirPath )
            .filter( ({ stats }) => !stats.isDirectory());

    const outputResultsFilePaths =
        KlawSync( outputDirPath )
            .filter( ({ stats }) => !stats.isDirectory());

    for ( var i = expectedResultsFilePaths.length; i--; ) {
        const {
            path: expectedResultFilePath,
            stats,
        } = expectedResultsFilePaths[ i ];

        const outputFilePath =
            expectedResultFilePath.replace(
                expectedResultsDirPath,
                outputDirPath
            );

        assert(
            filesAreEqual( outputFilePath, expectedResultFilePath ),
            outputFilePath
        );
    }

    const expectedTestsCount = expectedResultsFilePaths.length;
    const outputTestsCount = outputResultsFilePaths.length;

    assert(
        expectedTestsCount === outputTestsCount,
        `Error: tests count mismatch: ${ outputTestsCount } vs ${ expectedTestsCount } expected`
    );

    return errorsCount;
}

function assert( cond, errMsg ) {
    console.log( '==========================' );

    if ( !cond ) {
        console.log( 'Error:', errMsg );
        errorsCount++;
    } else {
        console.log( 'OK!' );
    }
}

function filesAreEqual( filePath1, filePath2 ) {
    try {
        const fileStr1 = FS.readFileSync( filePath1 ).toString();
        const fileStr2 = FS.readFileSync( filePath2 ).toString();

        return (
            fileStr1.replace( RegExps.dates, '' )
            === fileStr2.replace( RegExps.dates, '' )
        );
    } catch ( e ) {
        console.error( e );
        return false;
    }
}
