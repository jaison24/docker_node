import os from 'os';

// Function to fetch network interfaces (IP addresses)
export const getNetworkInterfaces = () => {
    const interfaces = os.networkInterfaces();
    const ips: { address: string; family: string; internal: boolean }[] = [];

    for (const [name, addresses] of Object.entries(interfaces)) {
        addresses?.forEach(({ family, internal, address }) => {
            ips.push({ address, family, internal });
        });
    }

    return ips;
};
