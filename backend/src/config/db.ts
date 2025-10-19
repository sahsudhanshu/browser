import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('MongoDB connected ✅');
    } catch (err) {
        console.error('MongoDB connection failed ❌', err);
        process.exit(1);
    }
};

export default connectDB;
