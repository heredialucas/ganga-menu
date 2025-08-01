import { hasPermission } from '@repo/auth/server-permissions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { buildAppUrl } from '@/lib/utils';
import { WaiterManagerClient } from './WaiterManagerClient';

interface WaiterManagerServerProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
    canEdit?: boolean;
    canView?: boolean;
}

export async function WaiterManagerServer({
    restaurantConfig,
    dictionary,
    locale,
    canEdit: parentCanEdit,
    canView: parentCanView
}: WaiterManagerServerProps) {
    const [canViewWaiter, canEditWaiter] = await Promise.all([
        hasPermission('services:view'),
        hasPermission('services:edit')
    ]);

    // Usar los permisos del padre si están disponibles, sino usar los verificados
    const finalCanView = parentCanView !== undefined ? parentCanView : canViewWaiter;
    const finalCanEdit = parentCanEdit !== undefined ? parentCanEdit : canEditWaiter;

    const waiterLink = buildAppUrl(`/${locale}/waiter/${restaurantConfig.slug}`);

    return (
        <WaiterManagerClient
            restaurantConfig={restaurantConfig}
            dictionary={dictionary}
            locale={locale}
            waiterLink={waiterLink}
            canView={finalCanView}
            canEdit={finalCanEdit}
        />
    );
} 