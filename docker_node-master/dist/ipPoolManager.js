"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIPPoolManager = createIPPoolManager;
// Helper function to convert an IP address to a number
function ipToNumber(ip) {
    return ip.split('.').reduce((sum, octet, index) => {
        return sum + parseInt(octet, 10) * Math.pow(256, 3 - index);
    }, 0);
}
// Helper function to convert a number back to an IP address
function numberToIp(num) {
    return [
        (num >> 24) & 255,
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255,
    ].join('.');
}
// Helper function to calculate the next IP address
function getNextAddress(baseAddress, increment = 1) {
    const baseNumber = ipToNumber(baseAddress);
    const nextNumber = baseNumber + increment;
    return numberToIp(nextNumber);
}
// IP Pool Manager Factory Function
function createIPPoolManager(subnet) {
    const [subnetAddress, prefix] = subnet.split("/");
    const usedIPs = new Set();
    const releasedIPs = new Set(); // Track released IPs
    const peers = new Map();
    const serverIP = getNextAddress(subnetAddress); // First IP in the range
    usedIPs.add(serverIP); // Reserve server's IP
    function assignIP(publicKey) {
        console.log(`assignIP called for publicKey: ${publicKey}`);
        // Check if the peer already exists
        if (peers.has(publicKey)) {
            const existingIP = peers.get(publicKey).assignedIP;
            console.log(`Peer ${publicKey} already assigned IP: ${existingIP}`);
            return existingIP;
        }
        // Check if there are any released IPs (vacant ones)
        if (releasedIPs.size > 0) {
            const reusedIP = releasedIPs.values().next().value; // Get the first released IP
            if (reusedIP !== undefined) {
                releasedIPs.delete(reusedIP); // Remove it from released list
                usedIPs.add(reusedIP); // Mark it as used
                // Create and store peer information
                const peer = {
                    publicKey,
                    assignedIP: reusedIP,
                    active: true,
                    lastSeen: Date.now(),
                };
                peers.set(publicKey, peer);
                console.log(`Reused IP: ${reusedIP} for peer ${publicKey}`);
                return reusedIP;
            }
        }
        // If no released IPs are available, iterate over the IP range to find a new unused IP
        for (let i = 2; i < Math.pow(2, 32 - Number(prefix)); i++) {
            const candidateIP = getNextAddress(subnetAddress, i);
            if (!usedIPs.has(candidateIP)) {
                // Mark the IP as used
                usedIPs.add(candidateIP);
                // Create and store peer information
                const peer = {
                    publicKey,
                    assignedIP: candidateIP,
                    active: true,
                    lastSeen: Date.now(),
                };
                peers.set(publicKey, peer);
                console.log(`Assigned ${candidateIP} to new peer ${publicKey}`);
                return candidateIP;
            }
        }
        throw new Error("No available IPs in the pool");
    }
    function removePeer(publicKey) {
        console.log(`removePeer called for publicKey: ${publicKey}`);
        // Remove from IP pool
        if (peers.has(publicKey)) {
            releaseIP(publicKey); // Also handles updating the IP pool
            return true;
        }
        else {
            console.log(`No peer found with publicKey: ${publicKey}`);
            return false;
        }
    }
    function releaseIP(publicKey) {
        console.log(`releaseIP called for publicKey: ${publicKey}`);
        if (peers.has(publicKey)) {
            const { assignedIP } = peers.get(publicKey);
            usedIPs.delete(assignedIP);
            releasedIPs.add(assignedIP); // Add to released IPs for reuse
            peers.delete(publicKey);
            console.log(`Released IP: ${assignedIP} for peer: ${publicKey}`);
        }
        else {
            console.log(`No peer found with publicKey: ${publicKey}`);
        }
    }
    function getPeers() {
        return Array.from(peers.values());
    }
    return { assignIP, releaseIP, getPeers, removePeer };
}
