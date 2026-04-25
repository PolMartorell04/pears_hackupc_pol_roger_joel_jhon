"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureWindowsVersion = exports.isValidVersion = exports.WindowsOSVersion = void 0;
class WindowsOSVersion {
    major;
    minor;
    patch;
    build;
    constructor(version) {
        const array = version.split('.');
        if (array.length != 4) {
            throw new Error(`Invalid Windows version string. {${version}}`);
        }
        this.major = Number.parseInt(array[0], 10);
        this.minor = Number.parseInt(array[1], 10);
        this.patch = Number.parseInt(array[2], 10);
        this.build = Number.parseInt(array[3], 10);
    }
    toString = () => `${this.major}.${this.minor}.${this.patch}.${this.build}`;
    equals(other) {
        if (this.major < other.major)
            return -1;
        if (this.major > other.major)
            return 1;
        if (this.minor < other.minor)
            return -1;
        if (this.minor > other.minor)
            return 1;
        if (this.patch < other.patch)
            return -1;
        if (this.patch > other.patch)
            return 1;
        if (this.build < other.build)
            return -1;
        if (this.build > other.build)
            return 1;
        return 0;
    }
    static IsOlder(v1, v2) {
        const wv1 = new WindowsOSVersion(v1);
        const wv2 = new WindowsOSVersion(v2);
        return wv1.equals(wv2) === -1;
    }
    static IsNewer(v1, v2) {
        const wv1 = new WindowsOSVersion(v1);
        const wv2 = new WindowsOSVersion(v2);
        return wv1.equals(wv2) === 1;
    }
    static IsSame(v1, v2) {
        const wv1 = new WindowsOSVersion(v1);
        const wv2 = new WindowsOSVersion(v2);
        return wv1.equals(wv2) === 0;
    }
}
exports.WindowsOSVersion = WindowsOSVersion;
/**
 * Checks if a version string is a semantic version.
 * @param version - The version string to check.
 * @returns True if the version string is a semantic version, false otherwise.
 */
const isValidVersion = (version) => {
    const semVerRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    const windowsVerRegex = /^\d+\.\d+\.\d+\.\d+$/;
    return semVerRegex.test(version) || windowsVerRegex.test(version);
};
exports.isValidVersion = isValidVersion;
/**
 * Ensures a semantic version string is converted to a Windows version string if it contains a prerelease version.
 * @param semanticVersion - The semantic version string to normalize.
 * @returns The normalized version string.
 */
const ensureWindowsVersion = (semanticVersion) => {
    const semVerRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    if (semanticVersion.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return semanticVersion;
    }
    if (semanticVersion.match(/^\d+\.\d+\.\d+$/)) {
        return `${semanticVersion}.0`;
    }
    if (!(0, exports.isValidVersion)(semanticVersion)) {
        throw new Error(`Invalid semantic version string. {${semanticVersion}}`);
    }
    return semanticVersion.replace(/[-+].*/, '.0');
};
exports.ensureWindowsVersion = ensureWindowsVersion;
//# sourceMappingURL=win-version.js.map