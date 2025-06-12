import mongoose, { Schema, Document, Types } from "mongoose";
import { Instrument } from "../types/instrument";

export interface IParticipant {
  userId: Types.ObjectId;
  name: string;
  instrument: Instrument;
}

export interface IRehearsalSession extends Document {
  adminId: Types.ObjectId;
  currentSongId?: string;
  participants: IParticipant[];
  isActive: boolean;
}

const participantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    instrument: { type: String, enum: Object.values(Instrument), required: true }
  },
  { _id: false } 
);

const rehearsalSchema = new Schema<IRehearsalSession>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    currentSongId: { type: String },
    participants: [participantSchema],
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

const RehearsalSession = mongoose.model<IRehearsalSession>(
  "Rehearsal_Session",
  rehearsalSchema
);

export default RehearsalSession;
