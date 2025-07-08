'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { DailySpecialData } from '@repo/data-services/src/services/dailySpecialService';
import { OrderData } from '@repo/data-services';
import WaiterAuth from './WaiterAuth';
import OrderInterface from './OrderInterface';

interface Category {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    order: number;
    isActive: boolean;
    dishes: Dish[];
}

interface Dish {
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

interface WaiterInterfaceProps {
    locale: string;
    slug: string;
    restaurantConfig: RestaurantConfigData;
    categories: Category[];
    dailySpecials: DailySpecialData[];
    dictionary: Dictionary;
    existingOrders: OrderData[];
    tables: { id: string; label: string; }[];
}

export default function WaiterInterface({
    locale,
    slug,
    restaurantConfig,
    categories,
    dailySpecials,
    dictionary,
    existingOrders,
    tables
}: WaiterInterfaceProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <WaiterAuth
                slug={slug}
                restaurantName={restaurantConfig.name}
                dictionary={dictionary}
                onAuthenticated={() => setIsAuthenticated(true)}
            />
        );
    }

    return (
        <OrderInterface
            restaurantConfig={restaurantConfig}
            categories={categories}
            dailySpecials={dailySpecials}
            dictionary={dictionary}
            existingOrders={existingOrders}
            tables={tables}
        />
    );
}