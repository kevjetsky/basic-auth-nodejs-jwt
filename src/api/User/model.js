import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema(
    {
        uniqueId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        
        username: {
            type: String,
            trim: true,
        },

        phoneNumber: {
            number: {
                type: String,
                required: true,
                trim: true,
            },

        countryCode: {
                type: String,
                required: true,
                trim: true,
            },
        },

        partnerId: {
            type: String, 
            default: null,
            trim: true,
        },

        sentCount: {
            type: Number,
            default: 0,
        },

        receivedCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.index(
  { 'phoneNumber.number': 1, 'phoneNumber.countryCode': 1 },
  { unique: true }
);

export default mongoose.model('User', userSchema);
