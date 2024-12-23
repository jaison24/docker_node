import dotenv from "dotenv";
import express from "express";
import os from "os";
import { createIPPoolManager } from "./ipPoolManager";
import { generateKeys, saveKeys } from "./utils/keys.utils";
import {
  createConfigFile,
  setupWireGuardInterface,
} from "./utils/wireguardConfig.utils";

const app = express();
app.use(express.json());

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 8000;
export const ADDRESS = process.env.ADDRESS || "10.8.0.0/24";
export const ISANSIBLE: string = process.env.ISANSIBLE || "false";

export const BASE_PORT = 51820;
export const PORT_RANGE = 100;

// WireGuard Configuration Paths
export const PRIVATE_KEY_PATH = "/etc/wireguard/private_key";
export const PUBLIC_KEY_PATH = "/etc/wireguard/public_key";
export const CONFIG_PATH = "/etc/wireguard/wg0.conf";
export const RANDOM_PORT_PATH = "/etc/wireguard/wg.port";

// IP Pool Manager Instance
export const poolManager = createIPPoolManager(ADDRESS + "/24");

// API Endpoints
import peerRoutes from "./routes/peer.route";
import { managePortsAndConfig } from "./utils/generateUniquePort.utils";
import { getNetworkInterfaces } from "./utils/getNetworkInterface.utils";

app.use("/api/peer", peerRoutes);

app.listen(PORT, async () => {
  try {
    console.log(`Server is running on ${PORT}`);


    if (ISANSIBLE === "false") {
      const { privateKey, publicKey } = await generateKeys();
      await saveKeys(privateKey, publicKey);
      await createConfigFile(privateKey);
      await setupWireGuardInterface();
    }
    else{
      console.log(`ISANSIBLE: ${ISANSIBLE}`);
      const { privateKey, publicKey } = await generateKeys();
      await saveKeys(privateKey, publicKey);
      await createConfigFile(privateKey);
      await setupWireGuardInterface();
      getNetworkInterfaces();
      await managePortsAndConfig(privateKey)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Initialization error:", error.message);
    }
  }
});

app.get("/", (_req, res) => {
  res.status(200).send("Welcome to the WireGuard Server!");
});
