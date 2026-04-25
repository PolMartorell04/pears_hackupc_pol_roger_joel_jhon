"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const chalk_1 = __importDefault(require("chalk"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('electron-windows-msix');
class log {
    static log(level, message, object) {
        const logMessage = `${level}: ${message}`;
        let logObject = '';
        if (object)
            logObject = JSON.stringify(object, null, 2).replace(/\\r\\n/g, '\n').replace(/\\\\/g, '\\').replace(/\\\"/g, '"');
        if (debug.enabled) {
            debug('%s %s', logMessage, logObject);
            return;
        }
        if (level === 'debug' && !!globalThis.DEBUG) {
            console.log(chalk_1.default.grey(logMessage));
            if (object) {
                console.group();
                console.log(chalk_1.default.grey(logObject));
                console.groupEnd();
            }
        }
        if (level === 'warn' && (!!globalThis.DEBUG || !!globalThis.SHOW_WARNINGS)) {
            console.log(chalk_1.default.yellow(logMessage));
            if (object) {
                console.group();
                console.log(chalk_1.default.yellow(logObject));
                console.groupEnd();
            }
        }
        if (level === 'error') {
            console.log(chalk_1.default.red(logMessage));
            if (object) {
                console.group();
                console.log(chalk_1.default.red(logObject));
                console.groupEnd();
            }
        }
        if (level === 'info') {
            console.log(logMessage);
            if (object) {
                console.group();
                console.log(logObject);
                console.groupEnd();
            }
        }
    }
    static info = (message, object) => this.log('info', message, object);
    static warn = (message, object) => this.log('warn', message, object);
    static error = (message, throwError = false, object) => {
        this.log('error', message, object);
        if (throwError)
            throw new Error(message);
    };
    static debug = (message, object) => this.log('debug', message, object);
}
exports.log = log;
//# sourceMappingURL=logger.js.map