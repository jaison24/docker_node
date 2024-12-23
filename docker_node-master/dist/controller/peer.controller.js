"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePeer = exports.addPeer = void 0;
const fs_1 = require("fs");
const index_1 = require("../index");
const redisClient_1 = __importDefault(require("../redis/redisClient"));
const generateUniquePort_utils_1 = require("../utils/generateUniquePort.utils");
const peer_utils_1 = require("../utils/peer.utils");
// Helper function to read server public key
const readServerPublicKey = async () => {
    try {
        const serverPublicKey = await fs_1.promises.readFile(index_1.PUBLIC_KEY_PATH, "utf-8");
        return serverPublicKey.trim();
    }
    catch (error) {
        throw new Error("Failed to read server public key");
    }
};
// const readRandomPorts = async (): Promise<string> => {
//   try {
//     const randomPorts = await fs.readFile(RANDOM_PORT_PATH, "utf-8");
//     return randomPorts.trim();
//   } catch (error) {
//     throw new Error("Failed to read server public key");
//   }
// };
// Add Peer Controller
const addPeer = async (req, res) => {
    const { clientPublicKey } = req.body;
    if (!clientPublicKey) {
        res.status(400).json({ error: "clientPublicKey is required" });
        return;
    }
    try {
        const assignedIP = index_1.poolManager.assignIP(clientPublicKey);
        if (!assignedIP) {
            res.status(500).json({ error: "No available IPs" });
            return;
        }
        if (index_1.ISANSIBLE === "true") {
            // const index = await getRandomIndex();
            // const randomPorts = `5182${index}`;
            // const randomPorts = await readRandomPorts();
            const ip = (0, generateUniquePort_utils_1.getSingleNetworkInterface)();
            const randomPort = await redisClient_1.default.get(ip);
            console.log(randomPort);
            if (!randomPort) {
                throw new Error("Random ports not found");
            }
            // Save peer info in Redis
            const result = await redisClient_1.default.set(`peer:${clientPublicKey}`, JSON.stringify({
                assignedIP,
                associatedInstance: ip,
                wireGuardPort: randomPort,
            }));
            if (!result) {
                throw new Error("Failed to save peer info in Redis");
            }
            await (0, peer_utils_1.addPeerWithAnsible)(clientPublicKey, assignedIP, randomPort);
            const serverPublicKey = await readServerPublicKey();
            res.status(200).json({
                message: "Peer added successfully",
                assignedIP,
                randomPort,
                serverPublicKey,
            });
        }
        else {
            await (0, peer_utils_1.addPeerWithoutAnsible)(clientPublicKey, assignedIP);
            const serverPublicKey = await readServerPublicKey();
            res.status(200).json({
                message: "Peer added successfully",
                assignedIP,
                serverPublicKey
            });
        }
    }
    catch (error) {
        console.error("Add Peer Error:", error);
        res
            .status(500)
            .json({ error: error instanceof Error ? error.message : error });
    }
};
exports.addPeer = addPeer;
// Remove Peer Controller
const removePeer = async (req, res) => {
    const { clientPublicKey } = req.body;
    if (!clientPublicKey) {
        res.status(400).json({ error: "clientPublicKey is required" });
        return;
    }
    try {
        if (index_1.ISANSIBLE === "true") {
            const publicKey = await redisClient_1.default.get(`peer:${clientPublicKey}`);
            if (!publicKey) {
                throw new Error(`Peer with publicKey ${clientPublicKey} not found`);
            }
            const peerData = JSON.parse(publicKey);
            if (!peerData) {
                throw new Error(`Peer with publicKey ${publicKey} not found`);
            }
            const { associatedInstance } = peerData;
            // Publish removal to the associated instance
            redisClient_1.default.publish('wireguard-sync', JSON.stringify({
                action: 'remove-peer',
                publicKey,
                targetInstance: associatedInstance,
            }));
            // Remove peer entry from Redis
            await redisClient_1.default.del(`peer:${publicKey}`);
        }
        else {
            await (0, peer_utils_1.removePeerWithoutAnsible)(clientPublicKey);
        }
        const success = index_1.poolManager.removePeer(clientPublicKey);
        if (success) {
            console.log(`Peer ${clientPublicKey} removed successfully`);
            res.status(200).json({ message: "Peer removed successfully" });
        }
        else {
            res.status(404).json({ error: "Peer not found" });
        }
    }
    catch (error) {
        console.error("Remove Peer Error:", error);
        res
            .status(500)
            .json({ error: error instanceof Error ? error.message : error });
    }
};
exports.removePeer = removePeer;
