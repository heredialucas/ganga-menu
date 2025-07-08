'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';

const RestaurantConfigContext = createContext<RestaurantConfigData | null>(null);

export function RestaurantConfigProvider({
    children,
    config,
}: {
    children: ReactNode;
    config: RestaurantConfigData | null;
}) {
    return (
        <RestaurantConfigContext.Provider value={config}>
            {children}
        </RestaurantConfigContext.Provider>
    );
}

export function useRestaurantConfig() {
    const context = useContext(RestaurantConfigContext);
    // We don't throw an error if context is not found,
    // as some parts of the app might not have a restaurant config.
    // The components using this hook should handle the null case.
    return context;
} 