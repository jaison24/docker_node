"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const peer_controller_1 = require("../controller/peer.controller");
const router = express_1.default.Router();
router.post("/add-peer", peer_controller_1.addPeer);
router.post("/remove-peer", peer_controller_1.removePeer);
exports.default = router;
