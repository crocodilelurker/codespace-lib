import mongoose from "mongoose";

const connectDb = async () => {
    try
    {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    }
    catch(error) 
    {
        console.error(error);
    }
};

export default connectDb;