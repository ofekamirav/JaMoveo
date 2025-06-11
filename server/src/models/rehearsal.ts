import mongoose, { Schema, Document } from "mongoose";

export interface IRehearsalSession extends Document {
  adminId: mongoose.Types.ObjectId;
  currentSongId?: string;
  participants: string[]; 
  isActive: boolean;
}

const rehearsalSchema = new Schema<IRehearsalSession>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currentSongId: { type: String },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const RehearsalSession = mongoose.model<IRehearsalSession>('RehearsalSession', rehearsalSchema);

export default RehearsalSession;
