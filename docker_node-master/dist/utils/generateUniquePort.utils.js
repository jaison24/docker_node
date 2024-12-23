"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.managePortsAndConfig = exports.assignPort = exports.generateUniquePort = exports.getSingleNetworkInterface = void 0;
const __1 = require("..");
const redisClient_1 = __importDefault(require("../redis/redisClient"));
const getNetworkInterface_utils_1 = require("./getNetworkInterface.utils");
const wireguardConfig_utils_1 = require("./wireguardConfig.utils");
const getSingleNetworkInterface = () => {
    try {
        const interfaces = (0, getNetworkInterface_utils_1.getNetworkInterfaces)();
        // Prefer IPv4, fallback to IPv6
        const selectedIp = interfaces.find(({ family, internal }) => family === 'IPv4' && !internal) ||
            interfaces.find(({ family, internal }) => family === 'IPv6' && !internal);
        if (!selectedIp) {
            throw new Error("No valid network interface found");
        }
        return selectedIp.address;
    }
    catch (error) {
        console.error("Error in getSingleNetworkInterface:", error);
        throw error; // Re-throw the error for upstream handling
    }
};
exports.getSingleNetworkInterface = getSingleNetworkInterface;
// Function to generate a unique port for an instance
const generateUniquePort = async (ip) => {
    try {
        // Get the list of all IPs stored in Redis (used as keys)
        const usedIps = await redisClient_1.default.keys('*');
        // Check if the given IP already has an assigned port
        if (usedIps.includes(ip)) {
            // If the IP is already stored, return the already assigned port
            const assignedPort = await redisClient_1.default.get(ip);
            if (assignedPort !== null) {
                return assignedPort;
            }
        }
        // Generate a new port
        const usedPorts = await redisClient_1.default.keys('*');
        const nextPort = __1.BASE_PORT + usedPorts.length;
        // Check if the next port exceeds the allowed range
        if (nextPort >= __1.BASE_PORT + __1.PORT_RANGE) {
            throw new Error("Port range exhausted!");
        }
        // Store the IP and its assigned port in Redis
        await redisClient_1.default.set(ip, nextPort.toString());
        return nextPort.toString();
    }
    catch (error) {
        console.error(`Error in generateUniquePort for IP ${ip}:`, error);
        throw error;
    }
};
exports.generateUniquePort = generateUniquePort;
// Function to assign port and configuration
const assignPort = async (privateKey) => {
    try {
        const ip = (0, exports.getSingleNetworkInterface)();
        if (!ip) {
            throw new Error("No valid network interface found");
        }
        const port = await (0, exports.generateUniquePort)(ip);
        await (0, wireguardConfig_utils_1.createConfigFileWithAnsible)(privateKey, port);
        return { ip, port };
    }
    catch (error) {
        console.error("Error in assignPort:", error);
        throw error;
    }
};
exports.assignPort = assignPort;
const managePortsAndConfig = async (privateKey) => {
    try {
        const { ip, port } = await (0, exports.assignPort)(privateKey);
        console.log(`Allocated port ${port} for IP ${ip}`);
        const allIps = await redisClient_1.default.keys('*');
        console.log(`All IPs: ${allIps}`);
        return { ip, port };
        // Optionally, store configuration in a file or send to the client
        // fs.writeFileSync(`/etc/wireguard/${ip}.conf`, config);
        // Trigger Ansible to apply configuration if necessary (e.g., by calling an Ansible playbook)
        // Example: execSync('ansible-playbook deploy_config.yml');
    }
    catch (error) {
        console.error("Error in managePortsAndConfig:", error);
        throw error;
    }
};
exports.managePortsAndConfig = managePortsAndConfig;
