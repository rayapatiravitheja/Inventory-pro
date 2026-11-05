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

// Helper to normalize recipients into a clean array of strings
const normalizeRecipients = (raw) => {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list
        .flatMap((item) => (typeof item === "string" ? item.split(",") : [item?.email || item]))
        .map((e) => (typeof e === "string" ? e.trim() : ""))
        .filter((e) => Boolean(e) && e.includes("@"));
};

// Universal transporter supporting HTTPS APIs (Brevo / Resend) & SMTP fallback
const transporter = {
    sendMail: async (mailOptions) => {
        const recipients = normalizeRecipients(mailOptions.to);
        if (recipients.length === 0) {
            console.warn("⚠️ sendMail called with no valid recipients:", mailOptions.to);
            return { messageId: "skipped_no_recipients" };
        }

        // 1. If BREVO_API_KEY is configured, send via Brevo HTTPS API (Port 443 - delivers to ANY recipient without domain verification!)
        const brevoApiKey = (process.env.BREVO_API_KEY || "").trim();
        if (brevoApiKey) {
            try {
                const toAddresses = recipients.map((email) => ({ email }));

                const payload = {
                    sender: {
                        name: "InventoryPro",
                        email: process.env.SENDER_EMAIL || process.env.EMAIL_USER || "thejaklu@gmail.com",
                    },
                    to: toAddresses,
                    subject: mailOptions.subject,
                    htmlContent: mailOptions.html || mailOptions.text,
                    textContent: mailOptions.text,
                };

                console.log("📤 Dispatching email via Brevo HTTPS API to:", recipients);
                const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "api-key": brevoApiKey,
                        "Accept": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();
                console.log("📬 Brevo API Response:", response.status, data);
                if (response.ok) {
                    return { messageId: data.messageId || data.id };
                }
                console.warn("⚠️ Brevo API non-200, trying Resend/SMTP:", data);
            } catch (err) {
                console.warn("⚠️ Brevo API error, trying next transport:", err.message);
            }
        }

        // 2. If RESEND_API_KEY (or Inventorypro) is configured, send via Resend HTTPS API (Port 443)
        const resendApiKey = (
            process.env.RESEND_API_KEY ||
            process.env.Inventorypro ||
            process.env.RESEND_KEY ||
            ""
        ).trim();

        if (resendApiKey) {
            const ownerEmail = (process.env.ADMIN_EMAIL || "rayapatiravitheja@gmail.com").trim().toLowerCase();
            const fromSender = process.env.RESEND_FROM || "InventoryPro <onboarding@resend.dev>";

            const payload = {
                from: fromSender,
                to: recipients,
                subject: mailOptions.subject,
                html: mailOptions.html || mailOptions.text,
                text: mailOptions.text,
            };

            console.log("📤 Dispatching email via Resend to:", recipients);
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log("📬 Resend API Response:", response.status, data);

            // If Resend succeeds directly:
            if (response.ok) {
                return { messageId: data.id };
            }

            // If Resend rejected with 403 sandbox restriction (unverified domain can only email account owner):
            const isRestrictedError =
                response.status === 403 ||
                data.name === "validation_error" ||
                data.message?.includes("only send testing emails to your own email address") ||
                data.message?.includes("resend.com/domains");

            const isOnlyOwnerRecipient =
                recipients.length === 1 && recipients[0].toLowerCase() === ownerEmail;

            if (isRestrictedError && !isOnlyOwnerRecipient) {
                console.warn(
                    `⚠️ Resend Sandbox Notice: Cannot deliver to external recipient [${recipients.join(
                        ", "
                    )}] without a verified domain. Auto-forwarding copy to owner: ${ownerEmail}`
                );

                const forwardPayload = {
                    from: fromSender,
                    to: [ownerEmail],
                    subject: `[Copy for ${recipients.join(", ")}] ${mailOptions.subject}`,
                    html: `
                        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-family: sans-serif;">
                            <div style="font-weight: 700; color: #92400e; font-size: 13px; margin-bottom: 4px;">
                                ℹ️ Resend Sandbox Delivery Notice
                            </div>
                            <div style="color: #78350f; font-size: 12px; line-height: 1.5;">
                                This email was generated for recipient: <strong>${recipients.join(", ")}</strong>.<br/>
                                Because the active email provider is in test sandbox mode (<code>onboarding@resend.dev</code>), external deliveries are automatically routed to your verified store owner address (<code>${ownerEmail}</code>).
                            </div>
                        </div>
                    ` + (mailOptions.html || mailOptions.text),
                    text: `[Sandbox Copy for ${recipients.join(", ")}]\n\n` + (mailOptions.text || ""),
                };

                const fwdRes = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${resendApiKey}`,
                    },
                    body: JSON.stringify(forwardPayload),
                });
                const fwdData = await fwdRes.json();
                if (fwdRes.ok) {
                    console.log(`✅ Sandbox forward delivered to ${ownerEmail} (MessageId: ${fwdData.id})`);
                    return { messageId: fwdData.id, forwarded: true };
                }
            }

            throw new Error(data.message || JSON.stringify(data));
        }

        // 3. Fall back to SMTP transporter
        return await smtpTransporter.sendMail(mailOptions);
    },
};

export default transporter;
