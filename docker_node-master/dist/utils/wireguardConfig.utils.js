"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWireGuardInterface = exports.createConfigFileWithAnsible = exports.createConfigFile = void 0;
const index_1 = require("../index");
const fs_1 = require("fs");
const executeCommand_utils_1 = require("./executeCommand.utils");
// Create WireGuard configuration file
const createConfigFile = async (privateKey) => {
    const configContent = `[Interface]
PrivateKey = ${privateKey}
Address = ${index_1.ADDRESS}/24
ListenPort = 51820
SaveConfig = true
PostUp = ufw route allow in on wg0 out on eth+
PostUp = iptables -t nat -I POSTROUTING -o eth+ -j MASQUERADE
PreDown = ufw route delete allow in on eth+ out on enX0
PreDown = iptables -t nat -D POSTROUTING -o eth+ -j MASQUERADE`;
    await fs_1.promises.writeFile(index_1.CONFIG_PATH, configContent, { mode: 0o600 });
};
exports.createConfigFile = createConfigFile;
const createConfigFileWithAnsible = async (privateKey, port) => {
    const configContent = `[Interface]
PrivateKey = ${privateKey}
Address = ${index_1.ADDRESS}/24
ListenPort = ${port}
SaveConfig = true
PostUp = ufw route allow in on wg0 out on eth+
PostUp = iptables -t nat -I POSTROUTING -o eth+ -j MASQUERADE
PreDown = ufw route delete allow in on eth+ out on enX0
PreDown = iptables -t nat -D POSTROUTING -o eth+ -j MASQUERADE`;
    await fs_1.promises.writeFile(index_1.CONFIG_PATH, configContent, { mode: 0o600 });
};
exports.createConfigFileWithAnsible = createConfigFileWithAnsible;
// Set up WireGuard interface
const setupWireGuardInterface = async () => {
    await (0, executeCommand_utils_1.executeCommand)("wg-quick up wg0");
};
exports.setupWireGuardInterface = setupWireGuardInterface;
