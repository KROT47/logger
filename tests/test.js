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
    dates: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
};

const Argvs = process.argv.slice( 2 );

const TestNumbersToRun = Argvs[ 0 ] ? Argvs[ 0 ].split( ',' ) : [];
const FileRegExp = ( () => {
    if ( !TestNumbersToRun.length ) return;
    const numbersWithLeadingZore =
        TestNumbersToRun.map( num => String( num ).padStart( 2, '0' ) );

    return new RegExp( 'test-' + numbersWithLeadingZore.join( '|test-' ) );
})();

const FileFilter =
    FileRegExp
        ? ( file ) => FileRegExp.test( file )
        : ( file ) => true;


// =============================================================================
// Start
// =============================================================================
const testFilePaths = GetFiles( testsDir, ({ file }) => FileFilter( file ) );

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
        // RemoveSync( outputDirPath );

        console.log( 'DONE! No errors.');
    }

}, 400 );


var errorsCount = 0;

function checkTestResults() {
    if ( !FS.existsSync( outputDirPath ) ) {
        console.log( '!!! Could not find output dir !!!' );
        return 0;
    }

    console.log( '' );
    console.log( '====================================================' );
    console.log( 'Checking file outputs' );
    console.log( '====================================================' );
    console.log( '' );

    const expectedResultsFilePaths =
        KlawSync( expectedResultsDirPath )
            .filter( ({ path, stats }) => (
                !stats.isDirectory() && FileFilter( path )
            ))
            .sort( ( a, b ) => a.path < b.path );

    const outputResultsFilePaths =
        KlawSync( outputDirPath )
            .filter( ({ path, stats }) => (
                !stats.isDirectory() && FileFilter( path )
            ));

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
        `tests count mismatch: ${ outputTestsCount } vs ${ expectedTestsCount } expected`
    );

    return errorsCount;
}

function assert( cond, errMsg ) {
    console.log( '==========================' );

    if ( !cond ) {
        console.log( 'Error:', errMsg );
        errorsCount++;
        return false;
    }

    console.log( 'OK!' );

    return true;
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
