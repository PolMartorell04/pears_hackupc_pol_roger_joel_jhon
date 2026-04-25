export declare class WindowsOSVersion {
    major: number;
    minor: number;
    patch: number;
    build: number;
    constructor(version: string);
    toString: () => string;
    equals(other: WindowsOSVersion): 1 | 0 | -1;
    static IsOlder(v1: string, v2: string): boolean;
    static IsNewer(v1: string, v2: string): boolean;
    static IsSame(v1: string, v2: string): boolean;
}
/**
 * Checks if a version string is a semantic version.
 * @param version - The version string to check.
 * @returns True if the version string is a semantic version, false otherwise.
 */
export declare const isValidVersion: (version: string) => boolean;
/**
 * Ensures a semantic version string is converted to a Windows version string if it contains a prerelease version.
 * @param semanticVersion - The semantic version string to normalize.
 * @returns The normalized version string.
 */
export declare const ensureWindowsVersion: (semanticVersion: string) => string;
