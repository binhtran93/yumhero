import { json } from "@sveltejs/kit";
import { adminDb } from "$lib/server/admin";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    try {
        const { email, message } = await request.json();
        const ip = getClientAddress();

        // Validation
        if (!email || !message) {
            return json(
                { message: "Email and message are required." },
                { status: 400 }
            );
        }

        // Rate Limiting (10 messages per 5 minutes per IP)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const recentMessages = await adminDb
            .collection("contact_messages")
            .where("ip", "==", ip)
            .where("createdAt", ">", fiveMinutesAgo)
            .limit(10)
            .get();

        if (recentMessages.size >= 10) {
            return json(
                { message: "Too many messages. Please wait a few minutes." },
                { status: 429 }
            );
        }

        // Save to Firestore
        await adminDb.collection("contact_messages").add({
            email,
            message,
            ip,
            createdAt: new Date().toISOString(),
            status: "new",
        });

        return json({ message: "Message sent successfully!" });
    } catch (error: any) {
        console.error("Error in contact API:", error);
        return json(
            { message: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
};
