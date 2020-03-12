/* @flow */

// Flow types
// --------------------------------------------------------
// json - basically to print to file
// simple-cli - uses cli colors, so printing to file will be not pretty
// simple - prints without colors as simple text
export type PrintType =
        | 'json'
        | 'simple-cli'
        | 'simple-json'
        | 'simple-json-cli'
        | 'simple';

export type LevelType =
        | 'trace'
        | 'debug'
        | 'info'
        | 'warn'
        | 'error'
        | 'fatal'
        | 'none'
        | 'state';

export interface TransportInterface<ConfigType> {
    handler: HandlerType;
    end: EndType;
}

type HandlerOptionsType = { level: LevelType, levelValue: number };

export type HandlerType = (
    logItem: string,
    options: HandlerOptionsType,
    baseHandler?: HandlerType
) => void;

export type EndType = () => void;

export type TransportConfigType<SpecificFieldsType> = $Shape<{|
    level: LevelType,
    handler: HandlerType,
    printType: PrintType,
    // if true then msg will be printed only if level is equal to transport's
    // by default it is printed when level is equal or greater
    strict: boolean,

    ...SpecificFieldsType,
|}>;

export type OptionsType = {
    level: LevelType,
    levelValue: number,
};

export type PrintConfigType = $Shape<{
    colors: boolean,
    depth: number,
    maxArrayLength: number,
}>;

export type PrettyPrintHandlerOptionsType = {|
    msg: any,
    msgType: string,
    printType: PrintType,
    options: OptionsType,
    currDepth: number,
    depth: number,
    isJsonType: boolean,
    printConfig: PrintConfigType,
    loggerInstance: Object,
    defaultHandler: PrettyPrintHandlerType,
|};

export type PrettyPrintHandlerType =
    ( options: PrettyPrintHandlerOptionsType ) => string | Object;

export type PrettyPrintHandlersType = {
    [ msgType: string ]: PrettyPrintHandlerType,
};
