import { ManifestVariables, PackagingOptions } from "./types";
export declare const getManifestVariables: (options: PackagingOptions) => Promise<ManifestVariables>;
/**
 * Generates the AppxManifest.xml file from the options provided.
 * @param options - The options for the MSIX package.
 * @returns The AppxManifest.xml content.
 */
export declare const manifest: (options: PackagingOptions) => Promise<string>;
