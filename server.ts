import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Email Confirmation Endpoint
app.post('/api/send-confirmation', async (req, res) => {
    const { email, name, bookingDetails } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Check if SMTP credentials are provided
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
             console.log('Mocking email send (missing SMTP credentials):', { email, name, bookingDetails });
             return res.json({ success: true, message: 'Email logged (no SMTP config)' });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"New Janta Band" <noreply@newjantaband.com>',
            to: email,
            subject: `Booking Confirmation - ${bookingDetails.referenceNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d97706;">Booking Confirmation</h2>
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>Thank you for choosing New Janta Band! Your booking has been confirmed.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1e293b;">Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Reference No:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${bookingDetails.referenceNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Transaction ID:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${bookingDetails.transactionId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Event Date:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${bookingDetails.eventDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Location:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${bookingDetails.location}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #64748b;">Package:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${bookingDetails.package}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #166534;">Payment Summary</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #166534;">Total Amount:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #166534;">₹${bookingDetails.totalAmount}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #166534;">Advance Paid:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #166534;">₹${bookingDetails.advanceAmount}</td>
                            </tr>
                            <tr style="border-top: 1px solid #bbf7d0;">
                                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">Remaining Amount:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #dc2626;">₹${bookingDetails.remainingAmount}</td>
                            </tr>
                        </table>
                    </div>

                    <p>If you have any questions, please contact us at +91 89820 69314.</p>
                    <p>Regards,<br><strong>New Janta Band Team</strong></p>
                </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
