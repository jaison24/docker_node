import { executeCommand } from "./executeCommand.utils";
import redisClient from "../redis/redisClient";

const CACHE_KEY = "wireguard_pods_count"; // Key to store the index in Redis
const CACHE_TTL = 300; // Cache expiration time in seconds (5 minutes)

export const getRandomIndex = async (): Promise<number> => {
  try {
    // Check if the value exists in Redis
    const cachedIndex = await redisClient.get(CACHE_KEY);

    if (cachedIndex) {
      console.log("Cache hit: using cached index value");
      const index = parseInt(cachedIndex, 10);

      // Generate a random number between 0 and index - 1 (inclusive)
      const randomIndex = Math.floor(Math.random() * index);
      return randomIndex;
    }

    console.log("Cache miss: fetching index value from command");
    // Fetch the index using the command
    const indexOutput = await executeCommand(
      "kubectl get pods | grep wireguard | wc -l"
    );
    const index = parseInt(indexOutput, 10); // Convert the command output to an integer

    if (isNaN(index) || index <= 0) {
      throw new Error("Invalid index value");
    }

    // Store the index in Redis with a TTL of 5 minutes
    await redisClient.setEx(CACHE_KEY, CACHE_TTL, index.toString());

    // Generate a random number between 0 and index - 1 (inclusive)
    const randomIndex = Math.floor(Math.random() * index);

    return randomIndex;
  } catch (error) {
    console.error(
      "Error fetching index:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
};
