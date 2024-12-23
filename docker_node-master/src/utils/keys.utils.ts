import { PRIVATE_KEY_PATH, PUBLIC_KEY_PATH } from "..";
import { executeCommand } from "./executeCommand.utils";
import { promises as fs } from "fs";

// Generate WireGuard keys
export const generateKeys = async (): Promise<{
  privateKey: string;
  publicKey: string;
}> => {
  const privateKey = await executeCommand("wg genkey");
  const publicKey = await executeCommand(`echo ${privateKey} | wg pubkey`);
  return { privateKey, publicKey };
};

// Save keys to files
export const saveKeys = async (
  privateKey: string,
  publicKey: string
): Promise<void> => {
  await fs.writeFile(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
  await fs.writeFile(PUBLIC_KEY_PATH, publicKey, { mode: 0o600 });
};