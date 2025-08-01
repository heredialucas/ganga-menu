import { Suspense } from 'react';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { WaiterManagerServer } from './waiter/WaiterManagerServer';
import { KitchenManagerServer } from './kitchen/KitchenManagerServer';
import WaiterManagerLoading from './waiter/loading';
import KitchenManagerLoading from './kitchen/loading';

interface ServicesManagerProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
}

export async function ServicesManager({ restaurantConfig, dictionary, locale }: ServicesManagerProps) {
    return (
        <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2">
            <Suspense fallback={<WaiterManagerLoading />}>
                <WaiterManagerServer
                    restaurantConfig={restaurantConfig}
                    dictionary={dictionary}
                    locale={locale}
                />
            </Suspense>

            <Suspense fallback={<KitchenManagerLoading />}>
                <KitchenManagerServer
                    restaurantConfig={restaurantConfig}
                    dictionary={dictionary}
                    locale={locale}
                />
            </Suspense>
        </div>
    );
} 