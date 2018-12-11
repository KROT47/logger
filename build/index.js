/* @flow */

// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';
import FS from 'fs';
import Path from 'path';
import Mkdirp from 'mkdirp';
import KlawSync from 'klaw-sync';
import { transformFileSync } from 'babel-core';


// =============================================================================
// Constants
// =============================================================================
const RootDir = process.cwd();

const DistBasePath = `${ __dirname }/dist_base`;

const InputDirPath = `${ RootDir }/src`;
const OutputDirPath = `${ RootDir }/dist`;

const BabelOptions = {
    babelrc: false,
    "presets": [
        "es2015",
        "flow",
    ],
    "plugins": [
        "transform-object-rest-spread",
        "babel-plugin-transform-class-properties",
    ],
};


// =============================================================================
// Build
// =============================================================================
console.log( 'Build started!' );

// Copy base files
// --------------------------------------------------------
KlawSync( DistBasePath ).forEach( ({ path }) => {
    FS.copyFileSync( path, path.replace( DistBasePath, OutputDirPath ) );
});

// Generate package.json
// --------------------------------------------------------
const packageJson = require( './package.js' );

FS.writeFileSync(
    `${ OutputDirPath }/package.json`,
    JSON.stringify( packageJson, null, 4 )
);

// Transpile and copy files
// --------------------------------------------------------
const inputJsFiles = KlawSync( InputDirPath );

for ( var i = inputJsFiles.length; i--; ) {
    const { path: inputFilePath, stats } = inputJsFiles[ i ];

    if ( stats.isDirectory() ) continue;

    const fileName = Path.basename( inputFilePath );

    const outputFilePath = inputFilePath.replace( InputDirPath, OutputDirPath );

    const outputDirPath = Path.dirname( outputFilePath );

    Mkdirp( outputDirPath );

    const ext = Path.extname( inputFilePath );

    switch ( ext ) {

        case '.js':
            // Compile js with babel
            // --------------------------------------------------------
            var compiledCode =
                    babelTransform( inputFilePath, BabelOptions );

            FS.writeFileSync( outputFilePath, compiledCode );

            FS.copyFileSync( inputFilePath, `${ outputFilePath }.flow` );
        break;

        case '.flow':
        case '.json':
            FS.copyFileSync( inputFilePath, outputFilePath );
        break;

        default:
            throw Error( `Unknown file extension: ${ ext }` );
    }
}


console.log( 'Build finished!' );


// =============================================================================
// Helpers
// =============================================================================
function babelTransform( jsFilePath, BabelOptions ) {
    const { code, map, ast } = transformFileSync( jsFilePath, BabelOptions );

    return code;
}
