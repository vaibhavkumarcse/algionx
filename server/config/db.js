import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kosis_ecommerce';
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local mongod is not running
    });
    isConnected = true;
    console.log(` MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`\n  MongoDB connection notice: ${error.message}`);
    console.warn(` Running with high-performance In-Memory Hybrid Store.`);
    console.warn(` To use real MongoDB, ensure mongod is running or set MONGO_URI in server/.env\n`);
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  mode: isConnected ? 'MongoDB Live' : 'In-Memory Seed Mode'
});

