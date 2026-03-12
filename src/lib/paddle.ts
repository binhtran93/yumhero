import {
    PUBLIC_PADDLE_CLIENT_TOKEN,
    PUBLIC_PADDLE_PRICE_ID,
} from "$env/static/public";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | undefined = undefined;

export async function getPaddle() {
    if (paddleInstance) return paddleInstance;
    if (!PUBLIC_PADDLE_CLIENT_TOKEN) return undefined;

    const isSandbox = PUBLIC_PADDLE_CLIENT_TOKEN.startsWith("test_");
    const environment = isSandbox ? "sandbox" : "production";

    try {
        paddleInstance = await initializePaddle({
            token: PUBLIC_PADDLE_CLIENT_TOKEN,
            environment,
        });
        console.log("Paddle v2 Initialized (" + environment + ")");
        return paddleInstance;
    } catch (err) {
        console.error("Failed to initialize Paddle:", err);
        return undefined;
    }
}

export async function openCheckout(userId: string) {
    const paddle = await getPaddle();
    if (!paddle) {
        console.error("Paddle not initialized");
        return;
    }

    if (!PUBLIC_PADDLE_PRICE_ID) {
        console.error("No PUBLIC_PADDLE_PRICE_ID configured");
        return;
    }

    try {
        paddle.Checkout.open({
            items: [{ priceId: PUBLIC_PADDLE_PRICE_ID, quantity: 1 }],
            customData: { userId },
            settings: {
                successUrl: window.location.origin + "/plan",
                displayMode: "overlay",
                theme: "light",
            },
        });
    } catch (err) {
        console.error("Paddle Checkout Error:", err);
        throw err;
    }
}
