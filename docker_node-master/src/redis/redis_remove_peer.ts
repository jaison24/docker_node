import { getSingleNetworkInterface } from "../utils/generateUniquePort.utils";
import { removePeerWithAnsible } from "../utils/peer.utils";
import redisClient from "./redisClient";

redisClient.subscribe('wireguard-sync', (err, count) => {
    if (err) {
        console.error('Failed to subscribe: ', err);
    } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    }
});

redisClient.on('message', async (channel, message) => {
    if (channel === 'wireguard-sync') {
        const { action, publicKey, targetInstance } = JSON.parse(message);
        const ip = getSingleNetworkInterface(); // Fetch this instance's IP

        if (action === 'remove-peer' && targetInstance === ip) {
            // Remove peer from this instance's WireGuard
          await removePeerWithAnsible(publicKey);
        }
    }
});
