"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomIndex = void 0;
const executeCommand_utils_1 = require("./executeCommand.utils");
const redisClient_1 = __importDefault(require("../redis/redisClient"));
const CACHE_KEY = "wireguard_pods_count"; // Key to store the index in Redis
const CACHE_TTL = 300; // Cache expiration time in seconds (5 minutes)
const getRandomIndex = async () => {
    try {
        // Check if the value exists in Redis
        const cachedIndex = await redisClient_1.default.get(CACHE_KEY);
        if (cachedIndex) {
            console.log("Cache hit: using cached index value");
            const index = parseInt(cachedIndex, 10);
            // Generate a random number between 0 and index - 1 (inclusive)
            const randomIndex = Math.floor(Math.random() * index);
            return randomIndex;
        }
        console.log("Cache miss: fetching index value from command");
        // Fetch the index using the command
        const indexOutput = await (0, executeCommand_utils_1.executeCommand)("kubectl get pods | grep wireguard | wc -l");
        const index = parseInt(indexOutput, 10); // Convert the command output to an integer
        if (isNaN(index) || index <= 0) {
            throw new Error("Invalid index value");
        }
        // Store the index in Redis with a TTL of 5 minutes
        await redisClient_1.default.setEx(CACHE_KEY, CACHE_TTL, index.toString());
        // Generate a random number between 0 and index - 1 (inclusive)
        const randomIndex = Math.floor(Math.random() * index);
        return randomIndex;
    }
    catch (error) {
        console.error("Error fetching index:", error instanceof Error ? error.message : error);
        throw error;
    }
};
exports.getRandomIndex = getRandomIndex;
