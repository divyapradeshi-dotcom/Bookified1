import mongoose, { Schema } from 'mongoose';
import { IBookSegment } from '@/types';

const BookSegmentSchema = new Schema<IBookSegment>(
    {
        clerkId: { type: String, required: true, index: true },
        bookId: { type: String, ref: 'Book', required: true, index: true },
        content: { type: String, required: true },
        segmentIndex: { type: Number, required: true, min: 0, index:true },
        pageNumber: { type: Number, min: 1 ,index:true },
        wordCount: { type: Number, required: true, min: 0 },
    },
    {
        timestamps: true,
    }
);

BookSegmentSchema.index({ bookId: 1, segmentIndex: 1 }, { unique: true });
BookSegmentSchema.index({ bookId: 1, pageNumber: 1 });
BookSegmentSchema.index({ bookId: 1, content: 'text' });
const BookSegment =
    mongoose.models.BookSegment || mongoose.model<IBookSegment>('BookSegment', BookSegmentSchema);

export default BookSegment;
