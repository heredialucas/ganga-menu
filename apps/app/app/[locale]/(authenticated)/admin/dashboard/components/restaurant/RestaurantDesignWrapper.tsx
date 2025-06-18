'use client';

import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { RestaurantDesignData } from '@repo/data-services/src/services/restaurantDesignService';
import RestaurantDesignSection from './RestaurantDesignSection';

interface RestaurantDesignWrapperProps {
    dictionary: Dictionary['app']['admin']['menu']['restaurant'];
    restaurantConfig: RestaurantConfigData | null;
    restaurantDesign: RestaurantDesignData | null;
}

export default function RestaurantDesignWrapper({
    dictionary,
    restaurantConfig,
    restaurantDesign
}: RestaurantDesignWrapperProps) {
    return (
        <RestaurantDesignSection
            dictionary={dictionary}
            restaurantConfig={restaurantConfig}
            restaurantDesign={restaurantDesign}
        />
    );
} 