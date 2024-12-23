import { Request, Response } from "express";
import { promises as fs } from "fs";
import {
  ISANSIBLE,
  poolManager,
  PUBLIC_KEY_PATH
} from "../index";
import redisClient from "../redis/redisClient";
import { getSingleNetworkInterface } from "../utils/generateUniquePort.utils";
import {
  addPeerWithAnsible,
  addPeerWithoutAnsible,
  removePeerWithAnsible,
  removePeerWithoutAnsible,
} from "../utils/peer.utils";

// Helper function to read server public key
const readServerPublicKey = async (): Promise<string> => {
  try {
    const serverPublicKey = await fs.readFile(PUBLIC_KEY_PATH, "utf-8");
    return serverPublicKey.trim();
  } catch (error) {
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
export const addPeer = async (req: Request, res: Response): Promise<void> => {
  const { clientPublicKey } = req.body;

  if (!clientPublicKey) {
    res.status(400).json({ error: "clientPublicKey is required" });
    return;
  }

  try {
    const assignedIP = poolManager.assignIP(clientPublicKey);

    if (!assignedIP) {
      res.status(500).json({ error: "No available IPs" });
      return;
    }

    if (ISANSIBLE === "true") {
      // const index = await getRandomIndex();
      // const randomPorts = `5182${index}`;

      // const randomPorts = await readRandomPorts();
      const ip = getSingleNetworkInterface();
      const randomPort = await redisClient.get(ip);

      console.log(randomPort)

      
      if (!randomPort) {
        throw new Error("Random ports not found");
      }

      // Save peer info in Redis
    const result = await redisClient.set(
      `peer:${clientPublicKey}`,
      JSON.stringify({
          assignedIP,
          associatedInstance: ip,
          wireGuardPort: randomPort,
      })
  );

      if (!result) {
        throw new Error("Failed to save peer info in Redis");
      }

      await addPeerWithAnsible(clientPublicKey, assignedIP, randomPort);

      const serverPublicKey = await readServerPublicKey();

      res.status(200).json({
        message: "Peer added successfully",
        assignedIP,
        randomPort,
        serverPublicKey,
      });
    } else {
      await addPeerWithoutAnsible(clientPublicKey, assignedIP);

      const serverPublicKey = await readServerPublicKey();

      res.status(200).json({
        message: "Peer added successfully",
        assignedIP,
        serverPublicKey
      });
    }
  } catch (error) {
    console.error("Add Peer Error:", error);
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : error });
  }
};

// Remove Peer Controller
export const removePeer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clientPublicKey } = req.body;

  if (!clientPublicKey) {
    res.status(400).json({ error: "clientPublicKey is required" });
    return;
  }

  try {
    if (ISANSIBLE === "true") {
      const publicKey = await redisClient.get(`peer:${clientPublicKey}`);

      if (!publicKey) {
        throw new Error(`Peer with publicKey ${clientPublicKey} not found`);
      }
      
      const peerData = JSON.parse(publicKey);

      if (!peerData) {
          throw new Error(`Peer with publicKey ${publicKey} not found`);
      }
  
      const { associatedInstance } = peerData;
  
      // Publish removal to the associated instance
      redisClient.publish(
          'wireguard-sync',
          JSON.stringify({
              action: 'remove-peer',
              publicKey,
              targetInstance: associatedInstance,
          })
      );
  
      // Remove peer entry from Redis
      await redisClient.del(`peer:${publicKey}`);
    } else {
      await removePeerWithoutAnsible(clientPublicKey);
    }

    const success = poolManager.removePeer(clientPublicKey);

    if (success) {
      console.log(`Peer ${clientPublicKey} removed successfully`);
      res.status(200).json({ message: "Peer removed successfully" });
    } else {
      res.status(404).json({ error: "Peer not found" });
    }
  } catch (error) {
    console.error("Remove Peer Error:", error);
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : error });
  }
};
