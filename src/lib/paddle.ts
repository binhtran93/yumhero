import {
    PUBLIC_PADDLE_CLIENT_TOKEN,
    PUBLIC_PADDLE_PRICE_ID_MONTHLY,
    PUBLIC_PADDLE_PRICE_ID_YEARLY,
    PUBLIC_PADDLE_PRICE_ID_MONTHLY_NO_TRIAL,
    PUBLIC_PADDLE_PRICE_ID_YEARLY_NO_TRIAL,
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
            environment: environment,
        });
        console.log("Paddle v2 Initialized (" + environment + ")");
        return paddleInstance;
    } catch (err) {
        console.error("Failed to initialize Paddle:", err);
        return undefined;
    }
}

export async function openCheckout(userId: string, plan: "monthly" | "yearly", hasUsedTrial: boolean) {
    const paddle = await getPaddle();
    if (!paddle) {
        console.error("Paddle not initialized");
        return;
    }

    let priceId: string;
    if (hasUsedTrial) {
        priceId = plan === "monthly"
            ? PUBLIC_PADDLE_PRICE_ID_MONTHLY_NO_TRIAL
            : PUBLIC_PADDLE_PRICE_ID_YEARLY_NO_TRIAL;
    } else {
        priceId = plan === "monthly"
            ? PUBLIC_PADDLE_PRICE_ID_MONTHLY
            : PUBLIC_PADDLE_PRICE_ID_YEARLY;
    }

    if (!priceId) {
        console.error("No price ID found for plan:", plan);
        return;
    }

    try {
        paddle.Checkout.open({
            items: [{ priceId: priceId, quantity: 1 }],
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
