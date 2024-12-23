"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = void 0;
const child_process_1 = require("child_process");
// Utility to execute shell commands
const executeCommand = (command) => new Promise((resolve, reject) => {
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
        if (error) {
            return reject(stderr || error.message);
        }
        resolve(stdout.trim());
    });
});
exports.executeCommand = executeCommand;
