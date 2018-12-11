/* @flow */


// =============================================================================
// Imports
// =============================================================================
import FS, { type WriteStream } from 'fs';
import Path from 'path';
import Mkdirp from 'mkdirp';

// Local
// --------------------------------------------------------
import {
    Transport,
    type TransportConfigType,
    type HandlerType,
} from './Transport';
import {
    getLevelValue,
} from '../common';

// Flow types
// --------------------------------------------------------
type DefaultConfigType = {
    createOnFirstWrite?: boolean,
    filePath: string,
};

type FileTransportConfigType =
    & TransportConfigType
    & DefaultConfigType;


// =============================================================================
// Constants
// =============================================================================
const DefaultConfig = {
    printType: 'json',
    createOnFirstWrite: true,
};

// List of all files opened to write ( prevents multiple writes )
const FilesReservedForWrite = {};


// =============================================================================
// FileTransport
// =============================================================================
export class FileTransport extends Transport<FileTransportConfigType> {

    static checkFilePath( filePath: string ) {
        if ( filePath in FilesReservedForWrite ) {
            throw Error( `File '${ filePath }' is already reserved for write` );
        }

        FilesReservedForWrite[ filePath ] = true;
    }

    __fileWriteStream: WriteStream;

    __isEnded = false;

    constructor( config: FileTransportConfigType ) {
        super({ ...DefaultConfig, ...config });

        const { createOnFirstWrite, filePath, level } = this._config;

        FileTransport.checkFilePath( filePath );

        this.levelValue = getLevelValue( level );

        const dirname = Path.dirname( filePath );

        Mkdirp.sync( dirname );

        if ( !createOnFirstWrite ) this.__getFileWriteStream();

        process.on( 'exit', this.end );
    }

    // Public
    // --------------------------------------------------------
    handler: HandlerType = ( logStr ) => {
        if ( this.__isEnded ) return;

        this.__getFileWriteStream().write( logStr + '\n' );
    };

    end = () => {
        if ( this.__isEnded ) return;

        this.__isEnded = true;

        const { filePath, createOnFirstWrite } = this._config;

        if ( this.__fileWriteStream ) this.__fileWriteStream.end();

        delete FilesReservedForWrite[ filePath ];
    };

    // Private
    // --------------------------------------------------------
    __getFileWriteStream() {
        if ( !this.__fileWriteStream ) {
            const { filePath } = this._config;

            this.__fileWriteStream = FS.createWriteStream( filePath );
        }

        return this.__fileWriteStream;
    }
}

export default FileTransport;
