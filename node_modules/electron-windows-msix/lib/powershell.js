"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.powershell = void 0;
const cross_spawn_promise_1 = require("@malept/cross-spawn-promise");
const logger_1 = require("./logger");
async function powershell(scriptOrCommand) {
    logger_1.log.debug('Running powershell command', { commandAndArgs: scriptOrCommand });
    const isScript = scriptOrCommand.endsWith('.ps1');
    const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass'];
    if (isScript) {
        args.push(scriptOrCommand);
    }
    else {
        args.push('-Command', scriptOrCommand);
    }
    const result = await (0, cross_spawn_promise_1.spawn)('pwsh.exe', args);
    logger_1.log.debug('Powershell command result', { result });
    return result ? result.toString() : '';
}
exports.powershell = powershell;
//# sourceMappingURL=powershell.js.map