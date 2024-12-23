"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveKeys = exports.generateKeys = void 0;
const __1 = require("..");
const executeCommand_utils_1 = require("./executeCommand.utils");
const fs_1 = require("fs");
// Generate WireGuard keys
const generateKeys = async () => {
    const privateKey = await (0, executeCommand_utils_1.executeCommand)("wg genkey");
    const publicKey = await (0, executeCommand_utils_1.executeCommand)(`echo ${privateKey} | wg pubkey`);
    return { privateKey, publicKey };
};
exports.generateKeys = generateKeys;
// Save keys to files
const saveKeys = async (privateKey, publicKey) => {
    await fs_1.promises.writeFile(__1.PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
    await fs_1.promises.writeFile(__1.PUBLIC_KEY_PATH, publicKey, { mode: 0o600 });
};
exports.saveKeys = saveKeys;
