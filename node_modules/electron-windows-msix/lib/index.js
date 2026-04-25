"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageMSIX = void 0;
const bin_1 = require("./bin");
const cert_1 = require("./cert");
const manifestation_1 = require("./manifestation");
const utils_1 = require("./utils");
const packageMSIX = async (options) => {
    (0, utils_1.setLogLevel)(options);
    await (0, utils_1.ensureFolders)(options);
    const manifestVars = await (0, manifestation_1.getManifestVariables)(options);
    await (0, utils_1.verifyOptions)(options, manifestVars);
    const program = await (0, utils_1.makeProgramOptions)(options, manifestVars);
    await (0, utils_1.createLayout)(program);
    await (0, cert_1.ensureDevCert)(program);
    await (0, bin_1.priConfig)(program);
    await (0, bin_1.pri)(program);
    await (0, bin_1.make)(program);
    await (0, bin_1.sign)(program);
    return {
        msixPackage: program.msix,
    };
};
exports.packageMSIX = packageMSIX;
//# sourceMappingURL=index.js.map