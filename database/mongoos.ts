import mongoose from 'mongoose';


const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    throw new Error("MongoDB URI is missing");
}

type MongooseCache = {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
};

declare global {
    var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoURI, { bufferCommands: false });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.conn = null;
        cached.promise = null;
        console.error('MongoDB connection error', e);
        throw e;
    }

    console.info('MongoDB connection successfully');
    return cached.conn;
};

