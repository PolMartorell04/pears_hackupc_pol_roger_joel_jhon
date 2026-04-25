"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifest = exports.getManifestVariables = void 0;
const path = __importStar(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("./utils");
const win_version_1 = require("./win-version");
const DEFAULT_OS_VERSION = '10.0.14393.0';
const DEFAULT_BACKGROUND_COLOR = 'transparent';
const getTemplate = () => {
    const content = fs_extra_1.default.readFileSync(path.join(__dirname, `../static/templates/AppxManifest.xml.in`), 'utf-8');
    return content;
};
const getManifestVariables = async (options) => {
    if (!options.appManifest) {
        return null;
    }
    const manifestXml = (await fs_extra_1.default.readFile(options.appManifest)).toString();
    const minWinVersionRegEx = /MinVersion="(.*?)"/s;
    const appNameRegEx = /Executable="(.*?)"/s;
    const archRegEx = /ProcessorArchitecture="(.*?)"/s;
    const sparseRegex = /<uap10:AllowExternalContent>\s*true\s*<\/uap10:AllowExternalContent>/s;
    const publisherRegex = /Publisher="(.*?)"/s;
    let manifestOsMinVersion;
    let manifestAppName;
    let manifestPackageArch;
    let manifestIsSparsePackage = false;
    let manifestPublisher;
    let match = manifestXml.match(minWinVersionRegEx);
    if (match) {
        manifestOsMinVersion = match[1];
    }
    match = manifestXml.match(appNameRegEx);
    if (match) {
        manifestAppName = (0, utils_1.removeFileExtension)(match[1]);
    }
    match = manifestXml.match(archRegEx);
    if (match) {
        manifestPackageArch = match[1];
    }
    match = manifestXml.match(sparseRegex);
    if (match) {
        manifestIsSparsePackage = true;
    }
    match = manifestXml.match(publisherRegex);
    if (match) {
        manifestPublisher = match[1];
    }
    const manifestVariables = {
        manifestOsMinVersion,
        manifestAppName,
        manifestPackageArch,
        manifestIsSparsePackage,
        manifestPublisher,
    };
    return manifestVariables;
};
exports.getManifestVariables = getManifestVariables;
/**
 * Generates the AppxManifest.xml file from the options provided.
 * @param options - The options for the MSIX package.
 * @returns The AppxManifest.xml content.
 */
const manifest = async (options) => {
    if (options.appManifest) {
        const manifest = await fs_extra_1.default.readFile(options.appManifest, 'utf-8');
        return manifest;
    }
    if (!options.manifestVariables) {
        return null;
    }
    const template = getTemplate();
    const { appDisplayName, packageIdentity, packageMinOSVersion, packageMaxOSVersionTested, packageVersion, packageDisplayName, publisher, publisherDisplayName, appExecutable, targetArch, packageDescription, packageBackgroundColor } = options.manifestVariables;
    const appName = (0, utils_1.removeFileExtension)(appExecutable);
    const publisherName = (0, utils_1.removePublisherPrefix)(publisher);
    const version = (0, win_version_1.ensureWindowsVersion)(packageVersion);
    const manifest = template
        .replace(/{{IdentityName}}/g, packageIdentity)
        .replace(/{{AppDisplayName}}/g, appDisplayName || packageDisplayName || appName)
        .replace(/{{MinOSVersion}}/g, packageMinOSVersion || DEFAULT_OS_VERSION)
        .replace(/{{MaxOSVersionTested}}/g, packageMaxOSVersionTested || packageMinOSVersion || DEFAULT_OS_VERSION)
        .replace(/{{Version}}/g, version)
        .replace(/{{DisplayName}}/g, packageDisplayName || appDisplayName || appName)
        .replace(/{{PublisherName}}/g, publisherName)
        .replace(/{{PublisherDisplayName}}/g, publisherDisplayName || publisherName)
        .replace(/{{PackageDescription}}/g, packageDescription || packageDisplayName || appDisplayName || appName)
        .replace(/{{PackageBackgroundColor}}/g, packageBackgroundColor || DEFAULT_BACKGROUND_COLOR)
        .replace(/{{AppExecutable}}/g, appExecutable)
        .replace(/{{ProcessorArchitecture}}/g, targetArch);
    return manifest;
};
exports.manifest = manifest;
//# sourceMappingURL=manifestation.js.map