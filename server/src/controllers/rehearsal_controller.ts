import { Request, Response } from "express";
import RehearsalSession from "../models/rehearsal";

const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentSongId } = req.body;
    const adminId = req.user?._id; 

    if (!adminId) {
        res.status(401).json({ message: "User not properly authenticated." });
        return;
    }
    
    await RehearsalSession.updateMany({ adminId, isActive: true }, { isActive: false });

    const session = await RehearsalSession.create({
      adminId,
      currentSongId,
      participants: [adminId],
      isActive: true
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Failed to create session", error: err });
  }
};

const joinSession = async (req: Request, res: Response) : Promise<void> => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?._id;
    const session = await RehearsalSession.findById(sessionId);
    if (!session || !session.isActive) {
        res.status(404).json({ message: "Session not found or inactive" });
        return;
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
      await session.save();
    }

    res.json(session);
  } catch (err) {
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

const endSession = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const session = await RehearsalSession.findByIdAndUpdate(
      sessionId,
      { isActive: false },
      { new: true }
    );
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Failed to end session", error: err });
  }
};

const updateSongInSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id;
    const userId = req.user?._id;
    const { songId } = req.body;  

    if (!songId) {
      res.status(400).json({ message: "Song ID is required" });
      return;
    }

    const session = await RehearsalSession.findById(sessionId);
    if (!session || !session.isActive) {
      res.status(404).json({ message: "Session not found or inactive" });
      return;
    }

    if (session.adminId.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized to update song" });
      return;
    }

    session.currentSongId = songId; 
    await session.save();


    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Failed to update song in session", error: err });
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

const RehearsalController = {
  createSession,
  joinSession,
  getActiveSession,
  endSession,
  updateSongInSession,
  getSessionById
};

export default RehearsalController;
