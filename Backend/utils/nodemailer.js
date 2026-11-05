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
            const toAddresses = Array.isArray(mailOptions.to)
                ? mailOptions.to
                : [mailOptions.to];

            const payload = {
                from: process.env.RESEND_FROM || "onboarding@resend.dev",
                to: toAddresses,
                subject: mailOptions.subject,
                html: mailOptions.html || mailOptions.text,
                text: mailOptions.text,
            };

            console.log("📤 Dispatching email via Resend HTTPS API to:", toAddresses);
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log("📬 Resend API Response:", response.status, data);
            if (!response.ok) {
                throw new Error(data.message || JSON.stringify(data));
            }
            return { messageId: data.id };
        }

        // 2. Fall back to SMTP transporter
        return await smtpTransporter.sendMail(mailOptions);
    },
};

export default transporter;
