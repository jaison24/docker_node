import express from "express";
import { addPeer, removePeer } from "../controller/peer.controller";

const router = express.Router();

router.post("/add-peer", addPeer)
router.post("/remove-peer", removePeer)

export default router