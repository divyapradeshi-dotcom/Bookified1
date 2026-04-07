'use server'

import BookSegment from '@/database/models/book-segment.model';
import Book from '@/database/models/book.model';
import { connectToDatabase } from '@/database/mongoos';
import { CreateBook, TextSegment } from '@/types';
import { generateSlug, serializeData } from '@/lib/utils';
export const getAllBooks = async () => {
    try{
        await connectToDatabase();
        const books=await Book.find().sort({ createdAt: -1 }).lean();
        return {
            success:true,
            data:serializeData(books),
        }
    } catch(e){
        console.error("error connecting to database ",e);
        return{
            success: false, error:e
        }
    }
}
export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title);
        const existingBook = await Book.findOne({ slug }).lean();

        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            };
        }

        if (!data.coverURL) {
            return {
                success: false,
                error: 'coverURL is required to create a book',
            };
        }

        const book = await Book.create({
            ...data,
            slug,
            totalSegments: 0,
        });

        return {
            success: true,
            data: serializeData(book),
            alreadyExists: false,
        };
    } catch (e) {
        console.log('Error creating Book', e);

        return {
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error creating book',
        };
    }
};

export const saveBookSegments = async (
    bookId: string,
    clerkId: string,
    segments: TextSegment[]
) => {
    try {
        await connectToDatabase();
        console.log('Save book segments...');

        const segmentsToInsert = segments.map((segment) => ({
            clerkId,
            bookId,
            content: segment.text,
            segmentIndex: segment.segmentIndex,
            pageNumber: segment.pageNumber,
            wordCount: segment.wordCount,
        }));

        if (segmentsToInsert.length > 0) {
            await BookSegment.insertMany(segmentsToInsert);
        }

        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

        console.log('Save book segments successfully...');

        return {
            success: true,
            data: { segmentsCreated: segments.length },
        };
    } catch (e) {
        console.error('Error saving book segments', e);

        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete(bookId);

        console.log('Deleted book segments and book due to failure to save segments.');

        return {
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error saving book segments',
        };
    }
};

export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(title);
        const existingBook = await Book.findOne({ slug }).lean();

        if (existingBook) {
            return {
                exists: true,
                data: serializeData(existingBook),
            };
        }

        return {
            exists: false,
            data: null,
        };
    } catch (e) {
        console.error('Error checking book', e);

        return {
            exists: false,
            error: e instanceof Error ? e.message : 'Unknown error checking book',
        };
    }
};

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        const book = await Book.findOne({ slug }).lean();

        if (!book) return { success: false, error: 'Book not found' };

        return { success: true, data: serializeData(book) };
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error',
        };
    }
};