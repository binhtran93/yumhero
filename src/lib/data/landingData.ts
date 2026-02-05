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
        question: "How much does YumHero cost?",
        answer: "YumHero starts with a 7-day free trial on our Pro plan. After that, it's just $4.99 per month or $39.99 for an entire year (saving you 33%). You get unlimited recipe imports, smart inventory tracking, and full cross-device sync.",
    },
    {
        question: "Why isn't there a permanent free plan?",
        answer: "Many free apps sell your personal data or clutter your kitchen with distracting ads. We believe your kitchen should be a focused space. By being a paid product, we can focus 100% on building tools that actually help you cook, while keeping your data private and your interface clean.",
    },
    {
        question: "Do you have a mobile app?",
        answer: "We are planning to launch native iOS and Android apps very soon! In the meantime, YumHero is built as a Progressive Web App (PWA). You can install it instantly by opening this site in your mobile browser and selecting 'Add to Home Screen' (on iOS, tap the Share button; on Android, tap the menu dots). It works exactly like a native app, stays in sync, and won't take up any storage space.",
    },
    {
        question: "Can I use my subscription on multiple devices?",
        answer: "Absolutely! Your account syncs instantly across your phone, tablet, and computer. You can plan your week on a large desktop screen and then follow the recipe on your phone while standing at the stove.",
    },
    {
        question: "Do you provide recipes and meal plans?",
        answer: "YumHero is designed to be a home for YOUR favorite recipes. While we don't force generic meal plans on you, we make it incredibly easy to import any recipe you find online or manually add your family's secret recipes.",
    },
    {
        question: "Where can I import recipes from?",
        answer: "Almost anywhere! If a recipe is on a website, YumHero can usually extract the ingredients and instructions instantly. It works with thousands of food blogs and recipe sites, stripping away the ads and fluff so you index only the food.",
    },
    {
        question: "Can I import recipes from social media?",
        answer: "Yes! While social media posts (like Instagram or TikTok) are often videos, you can copy the text description or the link into YumHero, and our parser will help you organize the ingredients and steps into your personal library.",
    },
    {
        question: "Will YumHero make my grocery list for me?",
        answer: "Yes, and it's smarter than a standard list. When you plan a meal, YumHero automatically adds the missing items to a consolidated list. You can then use the 'Check Fridge' feature to instantly cross-reference your inventory, ensuring you only buy what you actually need.",
    },
    {
        question: "Can I track my macros and nutrition?",
        answer: "YumHero focuses on the joy of cooking and efficiency of planning. While we don't currently have a full calorie-counting database, you can manually add nutritional notes to your recipes to keep track of what matters to you.",
    },
    {
        question: "Can I create a meal plan for an entire month?",
        answer: "While we recommend weekly planning for the freshest ingredients, our grid is flexible. You can scroll as far into the future as you like and map out weeks or even months of meals in one go.",
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

