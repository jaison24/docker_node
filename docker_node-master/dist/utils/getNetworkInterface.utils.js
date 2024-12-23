"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkInterfaces = void 0;
const os_1 = __importDefault(require("os"));
// Function to fetch network interfaces (IP addresses)
const getNetworkInterfaces = () => {
    const interfaces = os_1.default.networkInterfaces();
    const ips = [];
    for (const [name, addresses] of Object.entries(interfaces)) {
        addresses?.forEach(({ family, internal, address }) => {
            ips.push({ address, family, internal });
        });
    }
    return ips;
};
exports.getNetworkInterfaces = getNetworkInterfaces;
