import { getCurrentUser, requirePermission } from '@repo/auth/server';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getRestaurantDesignByConfigId } from '@repo/data-services/src/services/restaurantDesignService';
import { getDictionary } from '@repo/internationalization';
import { RestaurantViewManager } from './components/RestaurantViewManager';
import { getAppUrl } from '@/lib/utils';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';

export default async function RestaurantPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    await requirePermission('restaurant:view_config');
    const user = await getCurrentUser();
    const paramsData = await params;
    const dictionary = await getDictionary(paramsData.locale);
    const restaurantConfig = await getRestaurantConfig(user?.id);
    const restaurantDesign = restaurantConfig
        ? await getRestaurantDesignByConfigId(restaurantConfig.id)
        : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Gestión del Restaurante
                    </h1>
                    <p className="text-muted-foreground">
                        Define la configuración de tu restaurante y diseña la distribución de las mesas.
                    </p>
                </div>
                <ShareLinksWidget dictionary={dictionary} />
            </div>

            <RestaurantViewManager
                config={restaurantConfig}
                design={restaurantDesign}
                dictionary={dictionary}
                appUrl={getAppUrl()}
            />
        </div>
    );
} 