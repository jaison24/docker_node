import redisClient from "../redis/redisClient";
import { executeCommand } from "./executeCommand.utils";

// Add peer in Ansible environment
export const addPeerWithAnsible = async (
  clientPublicKey: string,
  assignedIP: string,
  randomPort: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey || !assignedIP || !randomPort) {
      throw new Error("Invalid input provided to addPeerWithAnsible");
    }

    const command = `wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    // // Save to Redis
    // const value = JSON.stringify({ randomPort, assignedIP });
    // await redisClient.set(clientPublicKey, randomPort);
    console.log(`Added peer (Ansible): ${clientPublicKey}, IP: ${assignedIP}, Port: ${randomPort}`);
  } catch (error) {
    console.error("Error in addPeerWithAnsible:", error instanceof Error ? error.message : error);
    throw error;
  }
};

// Add peer in non-Ansible environment
export const addPeerWithoutAnsible = async (
  clientPublicKey: string,
  assignedIP: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey || !assignedIP) {
      throw new Error("Invalid input provided to addPeerWithoutAnsible");
    }

    const command = `wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}/32`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    console.log(`Added peer (Non-Ansible): ${clientPublicKey}, IP: ${assignedIP}`);
  } catch (error) {
    console.error("Error in addPeerWithoutAnsible:", error instanceof Error ? error.message : error);
    throw error;
  }
};

// Remove peer in Ansible environment
export const removePeerWithAnsible = async (
  clientPublicKey: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey ) {
      throw new Error("Invalid input provided to removePeerWithAnsible");
    }

    const command = `wg set wg0 peer ${clientPublicKey} remove`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    // // Remove from Redis
    // await redisClient.del(clientPublicKey);
    // console.log(`Removed peer (Ansible): ${clientPublicKey}, Index: ${randomPort}`);
  } catch (error) {
    console.error("Error in removePeerWithAnsible:", error instanceof Error ? error.message : error);
    throw error;
  }
};

// Remove peer in non-Ansible environment
export const removePeerWithoutAnsible = async (
  clientPublicKey: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!clientPublicKey) {
      throw new Error("Invalid input provided to removePeerWithoutAnsible");
    }

    const command = `wg set wg0 peer ${clientPublicKey} remove`;
    await executeCommand(command);
    await executeCommand("wg-quick save wg0");

    console.log(`Removed peer (Non-Ansible): ${clientPublicKey}`);
  } catch (error) {
    console.error("Error in removePeerWithoutAnsible:", error instanceof Error ? error.message : error);
    throw error;
  }
};

