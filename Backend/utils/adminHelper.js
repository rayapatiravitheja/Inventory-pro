import { User } from "../models/user.model.js";

/**
 * Resolves all active admin email addresses.
 * Always guarantees the account owner (rayapatiravitheja@gmail.com) and any configured ADMIN_EMAIL are included.
 */
export const getAdminEmails = async () => {
    const adminEmails = new Set();

    try {
        const adminUsers = await User.find({ role: "admin" }).select("email username name");
        adminUsers.forEach((admin) => {
            if (admin.email && admin.email.includes("@")) {
                adminEmails.add(admin.email.trim().toLowerCase());
            }
        });
    } catch (err) {
        console.warn("⚠️ Warning fetching admin users from database:", err.message);
    }

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.includes("@")) {
        adminEmails.add(process.env.ADMIN_EMAIL.trim().toLowerCase());
    }

    // Always guarantee primary owner inbox is present for critical operational alerts
    adminEmails.add("rayapatiravitheja@gmail.com");

    return Array.from(adminEmails);
};
