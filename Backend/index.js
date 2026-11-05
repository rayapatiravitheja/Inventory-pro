import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import lowStockScheduler from "./utils/lowStockScheduler.js";
import { runRoleMigration } from "./utils/roleMigration.js";

dotenv.config({
    path: "./.env",
});



connectDB()
    .then(async () => {
        await runRoleMigration();
        app.listen(process.env.PORT || 3000, () => {
            console.log(
                `✅ Server listening on http://localhost:${process.env.PORT}/`
            );
            console.log("🚀 Starting low stock alert scheduler...");
            if (process.env.NODE_ENV !== "production") {
                lowStockScheduler.start();
            }
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed !!! ", err);
    });

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, stopping low stock scheduler...");
    lowStockScheduler.stop();
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("🛑 SIGINT received, stopping low stock scheduler...");
    lowStockScheduler.stop();
    process.exit(0);
});
