import { ManifestVariables, PackagingOptions, ProgramOptions } from "./types";
export declare const getBinaries: (windowsKitPath: string) => Promise<{
    makeAppx: string;
    makePri: string;
    signTool: string;
    makeCert: string;
}>;
export declare const removeFileExtension: (executablePath: string) => string;
export declare const removePublisherPrefix: (publisher: string) => string;
export declare const ensurePublisherPrefix: (publisher: string) => string;
export declare const ensureFolders: (options: PackagingOptions) => Promise<{
    outputDir: string;
    layoutDir: string;
}>;
export declare const verifyOptions: (options: PackagingOptions, manifestVars?: ManifestVariables) => Promise<void>;
export declare const setLogLevel: (options: PackagingOptions) => void;
export declare const locateMSIXTooling: (options: PackagingOptions, manifestVars?: ManifestVariables) => Promise<{
    makeAppx: string;
    makePri: string;
    signTool: string;
    makeCert: string;
}>;
export declare const makeProgramOptions: (options: PackagingOptions, manifestVars?: ManifestVariables) => Promise<ProgramOptions>;
export declare const createLayout: (program: ProgramOptions) => Promise<void>;
