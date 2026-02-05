import { json } from "@sveltejs/kit";
import { adminDb } from "$lib/server/admin";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { email, message } = await request.json();

        // Validation
        if (!email || !message) {
            return json(
                { message: "Email and message are required." },
                { status: 400 }
            );
        }

        // Save to Firestore
        await adminDb.collection("contact_messages").add({
            email,
            message,
            createdAt: new Date().toISOString(),
            status: "new",
        });

        // TODO: Integrate with an email service like Resend or SendGrid
        // to actually send the email to support@yumhero.app
        console.log(`Contact form submission from ${email}`);

        return json({ message: "Message sent successfully!" });
    } catch (error: any) {
        console.error("Error in contact API:", error);
        return json(
            { message: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
};
