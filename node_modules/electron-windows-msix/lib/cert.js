"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDevCert = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const powershell_1 = require("./powershell");
const utils_1 = require("./utils");
const ensureDevCert = async (programOptions) => {
    if (programOptions.createDevCert) {
        const template = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, '../static/templates/create_dev_cert.ps1.in'), 'utf-8');
        const publisherName = (0, utils_1.removePublisherPrefix)(programOptions.publisher);
        const script = template
            .replace(/{{SubjectName}}/g, publisherName)
            .replace(/{{Password}}/g, programOptions.cert_pass)
            .replace(/{{PfxOutputPath}}/g, programOptions.cert_pfx)
            .replace(/{{CerOutputPath}}/g, programOptions.cert_cer);
        const scriptPath = path_1.default.join(programOptions.outputDir, 'create_dev_cert.ps1');
        fs_extra_1.default.writeFileSync(scriptPath, script);
        await (0, powershell_1.powershell)(scriptPath);
        fs_extra_1.default.unlinkSync(scriptPath);
    }
};
exports.ensureDevCert = ensureDevCert;
//# sourceMappingURL=cert.js.map