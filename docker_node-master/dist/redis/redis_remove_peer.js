"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateUniquePort_utils_1 = require("../utils/generateUniquePort.utils");
const peer_utils_1 = require("../utils/peer.utils");
const redisClient_1 = __importDefault(require("./redisClient"));
redisClient_1.default.subscribe('wireguard-sync', (err, count) => {
    if (err) {
        console.error('Failed to subscribe: ', err);
    }
    else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    }
});
redisClient_1.default.on('message', async (channel, message) => {
    if (channel === 'wireguard-sync') {
        const { action, publicKey, targetInstance } = JSON.parse(message);
        const ip = (0, generateUniquePort_utils_1.getSingleNetworkInterface)(); // Fetch this instance's IP
        if (action === 'remove-peer' && targetInstance === ip) {
            // Remove peer from this instance's WireGuard
            await (0, peer_utils_1.removePeerWithAnsible)(publicKey);
        }
    }
});
