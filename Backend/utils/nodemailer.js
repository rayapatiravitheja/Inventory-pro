import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create default SMTP transporter with strict timeouts to prevent cloud hanging
const smtpTransporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    connectionTimeout: 4000, // 4s fail-fast on cloud hosts that block port 465
    greetingTimeout: 4000,
    socketTimeout: 5000,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD ? process.env.SENDER_PASSWORD.replace(/\s+/g, "") : "",
    },
});

// Universal transporter supporting HTTPS APIs (Resend/Brevo) & SMTP fallback
const transporter = {
    sendMail: async (mailOptions) => {
        // 1. If RESEND_API_KEY is configured, send via HTTPS (Port 443 - works everywhere)
        if (process.env.RESEND_API_KEY) {
            try {
                const response = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: process.env.RESEND_FROM || "InventoryPro <onboarding@resend.dev>",
                        to: [mailOptions.to],
                        subject: mailOptions.subject,
                        html: mailOptions.html,
                        text: mailOptions.text,
                    }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Resend API error");
                return { messageId: data.id };
            } catch (err) {
                console.warn("⚠️ Resend API failed, falling back to SMTP:", err.message);
            }
        }

        // 2. Fall back to SMTP transporter
        return await smtpTransporter.sendMail(mailOptions);
    },
};

export default transporter;
