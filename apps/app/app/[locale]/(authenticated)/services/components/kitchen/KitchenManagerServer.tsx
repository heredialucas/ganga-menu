import { hasPermission } from '@repo/auth/server-permissions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { buildAppUrl } from '@/lib/utils';
import { KitchenManagerClient } from './KitchenManagerClient';

interface KitchenManagerServerProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
    canEdit?: boolean;
    canView?: boolean;
}

export async function KitchenManagerServer({
    restaurantConfig,
    dictionary,
    locale,
    canEdit: parentCanEdit,
    canView: parentCanView
}: KitchenManagerServerProps) {
    const [canViewKitchen, canEditKitchen] = await Promise.all([
        hasPermission('services:view'),
        hasPermission('services:edit')
    ]);

    // Usar los permisos del padre si están disponibles, sino usar los verificados
    const finalCanView = parentCanView !== undefined ? parentCanView : canViewKitchen;
    const finalCanEdit = parentCanEdit !== undefined ? parentCanEdit : canEditKitchen;

    const kitchenLink = buildAppUrl(`/${locale}/kitchen/${restaurantConfig.slug}`);

    return (
        <KitchenManagerClient
            restaurantConfig={restaurantConfig}
            dictionary={dictionary}
            locale={locale}
            kitchenLink={kitchenLink}
            canView={finalCanView}
            canEdit={finalCanEdit}
        />
    );
} 