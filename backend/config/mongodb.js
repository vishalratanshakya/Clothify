import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("DB Connected");
        });

        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("MongoDB disconnected");
        });

        // Updated connection options for newer MongoDB versions
        const options = {
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`, options);

        console.log("MongoDB connection established successfully");

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        
        // If it's a DNS error, try alternative connection
        if (error.message.includes('querySrv') || error.message.includes('EBADRESP')) {
            console.log("DNS SRV lookup failed. The server will continue running without database connection.");
            console.log("Please check your network connection or MongoDB Atlas configuration.");
        } else {
            console.log("Retrying connection in 5 seconds...");
            setTimeout(connectDB, 5000);
        }
    }
}

export default connectDB;