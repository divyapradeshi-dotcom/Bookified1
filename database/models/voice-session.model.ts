import mongoose, { Schema } from 'mongoose';
import { IVoiceSession } from '@/types';

const VoiceSessionSchema = new Schema<IVoiceSession>(
    {

        clerkId: { type: String, required: true, index: true },
        bookId: { type: String, ref: 'Book', required: true, index: true },
        startedAt: { type: Date, required: true, default: Date.now },
        endedAt: { type: Date },
        durationSeconds: { type: Number, required: true, min: 0, default: 0 },
        billingPeriodStart: { type: Date, required: true, index: true },
    },
    {
        timestamps: true,
    }
);
VoiceSessionSchema.index({ clerkId: 1, billingPeriodStart: 1 });

const VoiceSession =
    mongoose.models.VoiceSession || mongoose.model<IVoiceSession>('VoiceSession', VoiceSessionSchema);

export default VoiceSession;
