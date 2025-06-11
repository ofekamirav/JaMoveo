import mongoose, {Schema, Document, Model} from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    instrument: string;
    role: 'player' | 'admin';
    refreshTokens?: string[];
}

const userSchema: Schema<IUser> = new Schema({
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
        enum: ['guitar', 'piano', 'drums', 'bass', 'keyboard', 'saxophone', 'vocals', 'chello', 'violin']
    },

    refreshTokens: {
        type: [String], 
        default: [],
    }
},{
    timestamps: true
});

const  User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
