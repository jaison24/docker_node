"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolManager = exports.RANDOM_PORT_PATH = exports.CONFIG_PATH = exports.PUBLIC_KEY_PATH = exports.PRIVATE_KEY_PATH = exports.PORT_RANGE = exports.BASE_PORT = exports.ISANSIBLE = exports.ADDRESS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const ipPoolManager_1 = require("./ipPoolManager");
const keys_utils_1 = require("./utils/keys.utils");
const wireguardConfig_utils_1 = require("./utils/wireguardConfig.utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Load environment variables from .env file
dotenv_1.default.config();
const PORT = process.env.PORT || 8000;
exports.ADDRESS = process.env.ADDRESS || "10.8.0.0/24";
exports.ISANSIBLE = process.env.ISANSIBLE || "false";
exports.BASE_PORT = 51820;
exports.PORT_RANGE = 100;
// WireGuard Configuration Paths
exports.PRIVATE_KEY_PATH = "/etc/wireguard/private_key";
exports.PUBLIC_KEY_PATH = "/etc/wireguard/public_key";
exports.CONFIG_PATH = "/etc/wireguard/wg0.conf";
exports.RANDOM_PORT_PATH = "/etc/wireguard/wg.port";
// IP Pool Manager Instance
exports.poolManager = (0, ipPoolManager_1.createIPPoolManager)(exports.ADDRESS + "/24");
// API Endpoints
const peer_route_1 = __importDefault(require("./routes/peer.route"));
const generateUniquePort_utils_1 = require("./utils/generateUniquePort.utils");
const getNetworkInterface_utils_1 = require("./utils/getNetworkInterface.utils");
app.use("/api/peer", peer_route_1.default);
app.listen(PORT, async () => {
    try {
        console.log(`Server is running on ${PORT}`);
        if (exports.ISANSIBLE === "false") {
            const { privateKey, publicKey } = await (0, keys_utils_1.generateKeys)();
            await (0, keys_utils_1.saveKeys)(privateKey, publicKey);
            await (0, wireguardConfig_utils_1.createConfigFile)(privateKey);
            await (0, wireguardConfig_utils_1.setupWireGuardInterface)();
        }
        else {
            console.log(`ISANSIBLE: ${exports.ISANSIBLE}`);
            const { privateKey, publicKey } = await (0, keys_utils_1.generateKeys)();
            await (0, keys_utils_1.saveKeys)(privateKey, publicKey);
            await (0, wireguardConfig_utils_1.createConfigFile)(privateKey);
            await (0, wireguardConfig_utils_1.setupWireGuardInterface)();
            (0, getNetworkInterface_utils_1.getNetworkInterfaces)();
            await (0, generateUniquePort_utils_1.managePortsAndConfig)(privateKey);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Initialization error:", error.message);
        }
    }
});
app.get("/", (_req, res) => {
    res.status(200).send("Welcome to the WireGuard Server!");
});
