import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("♻️ Reusing existing MongoDB connection");
        return;
    }

    try {
        let connectionUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
        if (!connectionUrl.includes(DB_NAME)) {
            if (connectionUrl.includes("/?")) {
                connectionUrl = connectionUrl.replace("/?", `/${DB_NAME}?`);
            } else if (connectionUrl.includes("?")) {
                connectionUrl = connectionUrl.replace("?", `/${DB_NAME}?`);
            } else {
                connectionUrl = `${connectionUrl.replace(/\/$/, "")}/${DB_NAME}`;
            }
        }

        const conn = await mongoose.connect(
            connectionUrl,
            {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            }
        );
        isConnected = conn.connections[0].readyState === 1;
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❎ MongoDB connection FAILED", error);
        process.exit(1);
    }
};

export default connectDB;
