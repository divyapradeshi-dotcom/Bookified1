import mongoose, { Schema } from 'mongoose';
import { IBook } from '@/types';

const BookSchema = new Schema<IBook>(
    {

        clerkId: { type: String, required: true, index: true },
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        author: { type: String, required: true, trim: true },
        persona: { type: String, trim: true },
        fileURL: { type: String, required: true },
        fileBlobKey: { type: String, required: true },
        coverURL: { type: String, required: true },
        coverBlobKey: { type: String },
        fileSize: { type: Number, required: true, min: 0 },
        totalSegments: { type: Number, required: true, min: 0, default: 0 },
    },
    {
        timestamps: true,
    }
);

const Book = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Book;
