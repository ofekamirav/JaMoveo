import { Request, Response } from "express";
import RehearsalSession from "../models/rehearsal";
import User from "../models/user";
import { Instrument } from "../types/instrument";
import { Types } from "mongoose";

const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentSongId } = req.body;
    const adminId = req.user?._id;

    if (!adminId) {
      res.status(401).json({ message: "User not properly authenticated." });
      return;
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: "Admin user not found." });
      return;
    }

    // Check if there's an active session and end it
    await RehearsalSession.updateMany({isActive: true }, { isActive: false });

    const session = await RehearsalSession.create({
      adminId,
      currentSongId,
      participants: [
        {
          userId: admin._id,
          name: admin.name,
          instrument: admin.instrument as Instrument
        }
      ],
      isActive: true
    });
    req.app.get('io')?.emit('session-created', session._id);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Failed to create session", error: err });
  }
};

const joinSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?._id;

    const session = await RehearsalSession.findById(sessionId);
    if (!session || !session.isActive) {
      res.status(404).json({ message: "Session not found or inactive" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

   const alreadyJoined = session.participants.some(
    (p: any) => (p.userId ? p.userId.toString() : p.toString()) === (userId as Types.ObjectId).toString()
  );

    if (!alreadyJoined) {
      session.participants.push({
        userId: user._id,
        name: user.name,
        instrument: user.instrument as Instrument
      });
      await session.save();
    }

    res.json(session);
  } catch (err) {
    console.error("Join Session Error:", err);
    res.status(500).json({ message: "Failed to join session", error: err });
  }
};

const getActiveSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await RehearsalSession.findOne({ isActive: true });

    if (!session) {
      res.status(404).json({ message: "No active session found" });
      return;
    }

    res.json(session);
  } catch (err) {
    console.error("Error fetching active session:", err);
    res.status(500).json({ message: "Error fetching session", error: err });
  }
};


const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await RehearsalSession.findById(id);
    if (!session) {
      res.status(404).json({ message: "Session not found by ID" });
      return;
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Error fetching session details", error: err });
  }
};
/*
const quitSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'admin') {
      res.status(403).json({ message: "Only admins can quit sessions." });
      return;
    }

    const session = await RehearsalSession.findById(sessionId);

    if (!session || !session.isActive) {
      res.status(404).json({ message: "Active session not found." });
      return;
    }

    if (session.adminId.toString() !== userId.toString()) {
      res.status(403).json({ message: "You are not the admin of this session." });
      return;
    }

    session.isActive = false;
    await session.save();
    req.app.get('io')?.to(sessionId).emit('session-ended');
    res.status(200).json({ message: "Session ended successfully.", session });
  } catch (error) {
    console.error("quitSession error:", error);
    res.status(500).json({ message: "Failed to end session.", error });
  }
};
*/

const quitSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id;
    console.log(`[Server] Log 1: Attempting to quit session: ${sessionId}`);

    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'admin') {
      res.status(403).json({ message: "Only admins can quit sessions." });
      return;
    }

    const session = await RehearsalSession.findById(sessionId);

    if (!session || !session.isActive) {
      console.log(`[Server] Log 2: Session not found or inactive: ${sessionId}`);
      res.status(404).json({ message: "Active session not found." });
      return;
    }

    if (session.adminId.toString() !== userId.toString()) {
      res.status(403).json({ message: "You are not the admin of this session." });
      return;
    }

    session.isActive = false;
    await session.save();
    console.log(`[Server] Log 3: Session ${sessionId} marked as inactive in DB.`);

    const io = req.app.get('io');
    if (io) {
      console.log(`[Server] Log 4: Emitting 'session-ended' to room: ${sessionId}`);
      io.to(sessionId).emit('session-ended');
    } else {
      console.log(`[Server] Log 5: CRITICAL ERROR! io object not found on req.app!`);
    }

    res.status(200).json({ message: "Session ended successfully.", session });
  } catch (error) {
    console.error("quitSession error:", error);
    res.status(500).json({ message: "Failed to end session.", error });
  }
};


const RehearsalController = {
  createSession,
  joinSession,
  getActiveSession,
  quitSession,
  getSessionById
};

export default RehearsalController;
