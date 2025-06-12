import mongoose, {Schema, Document, Model, Types} from "mongoose";
import { Instrument } from "../types/instrument";

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    instrument: Instrument;
    role: 'player' | 'admin';
    refreshTokens?: string;
}

const userSchema: Schema<IUser> = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId()
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['player', 'admin'],
        default: 'player'
    },
    instrument: {
        type: String,
        required: function (this: IUser) {
            return this.role === 'player';
        },
        enum: Object.values(Instrument),
    },

    refreshTokens: {
        type: String, 
        default: null,
    }
},{
    timestamps: true
});

const  User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
