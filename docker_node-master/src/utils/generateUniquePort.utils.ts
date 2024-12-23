import { BASE_PORT, PORT_RANGE } from "..";
import redisClient from "../redis/redisClient";
import { getNetworkInterfaces } from "./getNetworkInterface.utils";
import { createConfigFileWithAnsible } from "./wireguardConfig.utils";

export const getSingleNetworkInterface = () => {
    try {
        const interfaces = getNetworkInterfaces();

        // Prefer IPv4, fallback to IPv6
        const selectedIp = interfaces.find(({ family, internal }) => family === 'IPv4' && !internal) ||
                           interfaces.find(({ family, internal }) => family === 'IPv6' && !internal);

        if (!selectedIp) {
            throw new Error("No valid network interface found");
        }

        return selectedIp.address;
    } catch (error) {
        console.error("Error in getSingleNetworkInterface:", error);
        throw error; // Re-throw the error for upstream handling
    }
};


// Function to generate a unique port for an instance
export const generateUniquePort = async (ip: string): Promise<string> => {
    try {
        // Get the list of all IPs stored in Redis (used as keys)
        const usedIps = await redisClient.keys('*');

        // Check if the given IP already has an assigned port
        if (usedIps.includes(ip)) {
            // If the IP is already stored, return the already assigned port
            const assignedPort = await redisClient.get(ip);
            if (assignedPort !== null) {
                return assignedPort;
            }
        }

        // Generate a new port
        const usedPorts = await redisClient.keys('*');
        const nextPort = BASE_PORT + usedPorts.length;


        // Check if the next port exceeds the allowed range
        if (nextPort >= BASE_PORT + PORT_RANGE) {
            throw new Error("Port range exhausted!");
        }

        // Store the IP and its assigned port in Redis
        await redisClient.set(ip, nextPort.toString());
        return nextPort.toString();
    } catch (error) {
        console.error(`Error in generateUniquePort for IP ${ip}:`, error);
        throw error;
    }
};

// Function to assign port and configuration
export const assignPort = async (privateKey: string) => {
    try {
        const ip = getSingleNetworkInterface();
        if (!ip) {
            throw new Error("No valid network interface found");
        }

        const port: string = await generateUniquePort(ip);

        await createConfigFileWithAnsible(privateKey, port);
        return { ip, port };
    } catch (error) {
        console.error("Error in assignPort:", error);
        throw error;
    }
};

export const managePortsAndConfig = async (privateKey: string) => {
    try {
        const { ip, port } = await assignPort(privateKey);
        console.log(`Allocated port ${port} for IP ${ip}`);
        const allIps = await redisClient.keys('*');
        console.log(`All IPs: ${allIps}`);
        return { ip, port };

        // Optionally, store configuration in a file or send to the client
        // fs.writeFileSync(`/etc/wireguard/${ip}.conf`, config);

        // Trigger Ansible to apply configuration if necessary (e.g., by calling an Ansible playbook)
        // Example: execSync('ansible-playbook deploy_config.yml');
    } catch (error) {
        console.error("Error in managePortsAndConfig:", error);
        throw error;
    }
};
