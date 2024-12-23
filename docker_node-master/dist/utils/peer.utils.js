"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePeerWithoutAnsible = exports.removePeerWithAnsible = exports.addPeerWithoutAnsible = exports.addPeerWithAnsible = void 0;
const executeCommand_utils_1 = require("./executeCommand.utils");
// Add peer in Ansible environment
const addPeerWithAnsible = async (clientPublicKey, assignedIP, randomPort) => {
    try {
        // Validate inputs
        if (!clientPublicKey || !assignedIP || !randomPort) {
            throw new Error("Invalid input provided to addPeerWithAnsible");
        }
        const command = `wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        // // Save to Redis
        // const value = JSON.stringify({ randomPort, assignedIP });
        // await redisClient.set(clientPublicKey, randomPort);
        console.log(`Added peer (Ansible): ${clientPublicKey}, IP: ${assignedIP}, Port: ${randomPort}`);
    }
    catch (error) {
        console.error("Error in addPeerWithAnsible:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.addPeerWithAnsible = addPeerWithAnsible;
// Add peer in non-Ansible environment
const addPeerWithoutAnsible = async (clientPublicKey, assignedIP) => {
    try {
        // Validate inputs
        if (!clientPublicKey || !assignedIP) {
            throw new Error("Invalid input provided to addPeerWithoutAnsible");
        }
        const command = `wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        console.log(`Added peer (Non-Ansible): ${clientPublicKey}, IP: ${assignedIP}`);
    }
    catch (error) {
        console.error("Error in addPeerWithoutAnsible:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.addPeerWithoutAnsible = addPeerWithoutAnsible;
// Remove peer in Ansible environment
const removePeerWithAnsible = async (clientPublicKey) => {
    try {
        // Validate inputs
        if (!clientPublicKey) {
            throw new Error("Invalid input provided to removePeerWithAnsible");
        }
        const command = `wg set wg0 peer ${clientPublicKey} remove`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        // // Remove from Redis
        // await redisClient.del(clientPublicKey);
        // console.log(`Removed peer (Ansible): ${clientPublicKey}, Index: ${randomPort}`);
    }
    catch (error) {
        console.error("Error in removePeerWithAnsible:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.removePeerWithAnsible = removePeerWithAnsible;
// Remove peer in non-Ansible environment
const removePeerWithoutAnsible = async (clientPublicKey) => {
    try {
        // Validate inputs
        if (!clientPublicKey) {
            throw new Error("Invalid input provided to removePeerWithoutAnsible");
        }
        const command = `wg set wg0 peer ${clientPublicKey} remove`;
        await (0, executeCommand_utils_1.executeCommand)(command);
        await (0, executeCommand_utils_1.executeCommand)("wg-quick save wg0");
        console.log(`Removed peer (Non-Ansible): ${clientPublicKey}`);
    }
    catch (error) {
        console.error("Error in removePeerWithoutAnsible:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.removePeerWithoutAnsible = removePeerWithoutAnsible;
