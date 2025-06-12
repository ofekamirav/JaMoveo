import express from "express";
import { authMiddleware } from "../controllers/auth_controller";
import RehearsalController from "../controllers/rehearsal_controller";

const router = express.Router();

router.post("/", authMiddleware, RehearsalController.createSession);
router.post("/:id/join", authMiddleware, RehearsalController.joinSession);
router.get("/active", authMiddleware, RehearsalController.getActiveSession);
router.get("/:id", authMiddleware, RehearsalController.getSessionById);
router.post('/quit/:id', authMiddleware, RehearsalController.quitSession); 


export default router;
