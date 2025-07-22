import { getCurrentUser, requirePermission } from '@repo/auth/server';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getRestaurantDesignByConfigId } from '@repo/data-services/src/services/restaurantDesignService';
import { getDictionary } from '@repo/internationalization';
import { RestaurantViewManager } from './components/RestaurantViewManager';
import { getAppUrl } from '@/lib/utils';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';
import { FeedbackWidget } from '@/components/FeedbackWidget';

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
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        Gestión del Restaurante
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        Define la configuración de tu restaurante y diseña la distribución de las mesas.
                    </p>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <ShareLinksWidget dictionary={dictionary} />
                    <FeedbackWidget dictionary={dictionary} />
                </div>
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