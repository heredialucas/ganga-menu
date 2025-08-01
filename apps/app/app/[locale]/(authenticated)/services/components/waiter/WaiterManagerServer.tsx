import { hasPermission } from '@repo/auth/server-permissions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { buildAppUrl } from '@/lib/utils';
import { WaiterManagerClient } from './WaiterManagerClient';

interface WaiterManagerServerProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
}

export async function WaiterManagerServer({ restaurantConfig, dictionary, locale }: WaiterManagerServerProps) {
    const [canViewWaiter, canEditWaiter] = await Promise.all([
        hasPermission('services:view'),
        hasPermission('services:edit')
    ]);

    const waiterLink = buildAppUrl(`/${locale}/waiter/${restaurantConfig.slug}`);

    return (
        <WaiterManagerClient
            restaurantConfig={restaurantConfig}
            dictionary={dictionary}
            locale={locale}
            waiterLink={waiterLink}
            canView={canViewWaiter}
            canEdit={canEditWaiter}
        />
    );
} 