import { hasPermission } from '@repo/auth/server-permissions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { buildAppUrl } from '@/lib/utils';
import { KitchenManagerClient } from './KitchenManagerClient';

interface KitchenManagerServerProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
}

export async function KitchenManagerServer({ restaurantConfig, dictionary, locale }: KitchenManagerServerProps) {
    const [canViewKitchen, canEditKitchen] = await Promise.all([
        hasPermission('services:view'),
        hasPermission('services:edit')
    ]);

    const kitchenLink = buildAppUrl(`/${locale}/kitchen/${restaurantConfig.slug}`);

    return (
        <KitchenManagerClient
            restaurantConfig={restaurantConfig}
            dictionary={dictionary}
            locale={locale}
            kitchenLink={kitchenLink}
            canView={canViewKitchen}
            canEdit={canEditKitchen}
        />
    );
} 