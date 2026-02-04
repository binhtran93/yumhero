// Landing page mock data and types

export interface MockMeal {
    name: string;
}

export interface MockDay {
    day: string;
    date: string;
    meals: Record<string, MockMeal[]>;
}

export const mockPlan: MockDay[] = [
    {
        day: "Monday",
        date: "2",
        meals: {
            breakfast: [{ name: "Avocado Toast" }],
            lunch: [{ name: "Quinoa Bowl" }],
            dinner: [{ name: "Baked Salmon" }],
            snack: [{ name: "Apple & Almonds" }],
            note: [{ name: "Buy fresh herbs" }],
        },
    },
    {
        day: "Tuesday",
        date: "3",
        meals: {
            breakfast: [{ name: "Greek Yogurt" }],
            lunch: [{ name: "Chicken Wrap" }],
            dinner: [{ name: "Beef Stir-fry" }],
            snack: [],
            note: [],
        },
    },
    {
        day: "Wednesday",
        date: "4",
        meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
            note: [],
        },
    },
    {
        day: "Thursday",
        date: "5",
        meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
            note: [],
        },
    },
    {
        day: "Friday",
        date: "6",
        meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
            note: [],
        },
    },
    {
        day: "Saturday",
        date: "7",
        meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
            note: [],
        },
    },
    {
        day: "Sunday",
        date: "8",
        meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
            note: [],
        },
    },
];

export const mealTypes = ["breakfast", "lunch", "dinner", "snack", "note"];

export const mockLeftovers = [
    {
        name: "Bolognese Sauce",
        date: "yesterday",
        image: "/mockup/bolognese.png",
    },
    {
        name: "Grilled Veggies",
        date: "2d ago",
        image: "/mockup/veggies.png",
    },
];

export const mockQuickRecipes = [
    {
        name: "Avocado Toast",
        calorie: "290 kcal",
        image: "/mockup/avocado.png",
    },
    {
        name: "15-min Pasta",
        calorie: "450 kcal",
        image: "/mockup/pasta.png",
    },
    { name: "Tuna Salad", calorie: "320 kcal", image: "/mockup/tuna.png" },
    {
        name: "Egg Fried Rice",
        calorie: "380 kcal",
        image: "/mockup/rice.png",
    },
];

export const fridgeItems = [
    { name: "Chicken Breast", tag: "Today", tagColor: "bg-red-100 text-red-700" },
    { name: "Broccoli", tag: "2 days", tagColor: "bg-yellow-100 text-yellow-700" },
    { name: "Leftover Pasta", tag: "Ready to eat", tagColor: "bg-green-100 text-green-700" },
    { name: "Greek Yogurt", tag: "5 days", tagColor: "bg-gray-100 text-gray-600" },
];

export const pricingTiers = [
    {
        name: "Free",
        price: "$0",
        description: "For casual home cooks",
        features: [
            "7-day meal planning",
            "Basic shopping list",
            "5 saved recipes",
            "Single device",
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$5",
        period: "/month",
        description: "For serious meal planners",
        features: [
            "Unlimited planning",
            "Smart shopping lists",
            "Unlimited recipes",
            "Fridge tracking",
            "Leftover integration",
            "Multi-device sync",
        ],
        cta: "Start Free Trial",
        highlighted: true,
    },
    {
        name: "Family",
        price: "$8",
        period: "/month",
        description: "For households",
        features: [
            "Everything in Pro",
            "Up to 6 family members",
            "Shared shopping lists",
            "Meal preferences",
            "Priority support",
        ],
        cta: "Start Free Trial",
        highlighted: false,
    },
];

export const faqItems = [
    {
        question: "How does YumHero handle leftovers?",
        answer: 'It treats them as "Ready-to-Eat" ingredients that can be scheduled just like a recipe, ensuring nothing goes to waste. When you finish cooking, mark any extras as leftovers and they\'ll appear in your fridge inventory.',
    },
    {
        question: "Can I import recipes from websites?",
        answer: "Yes! The system is designed to scrape and format recipes from any URL into our clean, standardized UI. Just paste the link and we'll extract ingredients, steps, and cooking times automatically.",
    },
    {
        question: "Is there a mobile app?",
        answer: "YumHero is built as a Progressive Web App (PWA), meaning it works perfectly on your phone in the kitchen without a bulky download. Add it to your home screen for a native app experience.",
    },
    {
        question: "How does the shopping list work?",
        answer: "When you plan your week, YumHero automatically generates a consolidated shopping list. It checks your fridge inventory first and only includes ingredients you actually need to buy.",
    },
];

export const getMealStyles = (type: string) => {
    switch (type) {
        case "breakfast":
            return "bg-accent-breakfast-bg text-accent-breakfast-text border-accent-breakfast/10";
        case "lunch":
            return "bg-accent-lunch-bg text-accent-lunch-text border-accent-lunch/10";
        case "dinner":
            return "bg-accent-dinner-bg text-accent-dinner-text border-accent-dinner/10";
        case "snack":
            return "bg-accent-snack-bg text-accent-snack-text border-accent-snack/10";
        case "note":
            return "bg-accent-note-bg text-accent-note-text border-accent-note/10";
        default:
            return "";
    }
};

export const getLabelColor = (type: string) => {
    switch (type) {
        case "breakfast":
            return "text-accent-breakfast";
        case "lunch":
            return "text-accent-lunch";
        case "dinner":
            return "text-accent-dinner";
        case "snack":
            return "text-accent-snack";
        case "note":
            return "text-accent-note";
        default:
            return "";
    }
};

export const getDotColor = (type: string) => {
    switch (type) {
        case "breakfast":
            return "bg-accent-breakfast";
        case "lunch":
            return "bg-accent-lunch";
        case "dinner":
            return "bg-accent-dinner";
        case "snack":
            return "bg-accent-snack";
        case "note":
            return "bg-accent-note";
        default:
            return "bg-gray-400";
    }
};

export const shoppingItems = [
    { name: "Organic Eggs", amount: "1 dozen", inFridge: false },
    { name: "Greek Yogurt", amount: "500g", inFridge: true },
    { name: "Avocado", amount: "3 pcs", inFridge: false },
    { name: "Chicken Breast", amount: "1 kg", inFridge: true },
    { name: "Spinach", amount: "250g", inFridge: false },
    { name: "Quinoa", amount: "500g", inFridge: false },
    { name: "Whole Milk", amount: "1L", inFridge: true },
    { name: "Blueberries", amount: "125g", inFridge: false },
    { name: "Oat Milk", amount: "1L", inFridge: false },
    { name: "Cherry Tomatoes", amount: "250g", inFridge: true },
];

