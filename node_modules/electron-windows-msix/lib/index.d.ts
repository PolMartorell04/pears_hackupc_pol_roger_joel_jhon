import { type Artifacts, type ManifestGenerationVariables, type PackagingOptions, type WindowsSignOptions } from './types';
export type { PackagingOptions, ManifestGenerationVariables, Artifacts, WindowsSignOptions };
export declare const packageMSIX: (options: PackagingOptions) => Promise<{
    msixPackage: string;
}>;
