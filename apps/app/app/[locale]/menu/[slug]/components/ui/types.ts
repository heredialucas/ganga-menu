export interface Category {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    order: number;
    isActive: boolean;
    dishes: Dish[];
}

export interface Dish {
    id: string;
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number | null;
    imageUrl?: string | null;
    status: string;
    order: number;
    category?: {
        name: string;
    } | null;
}

export interface TodaySpecial {
    id: string;
    date: Date;
    isActive: boolean;
    dish: Dish;
}

export interface ThemeColors {
    bg: string;
    text: string;
    accent: string;
    decorative: {
        primary: string;
        secondary: string;
        tertiary: string;
        accent: string;
    };
} 