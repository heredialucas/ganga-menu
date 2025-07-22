import { requirePermission } from '@repo/auth/server-permissions';
import { getDictionary } from '@repo/internationalization';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getOrdersByRestaurant } from '@repo/data-services';
import { OrdersDashboard } from './components/OrdersDashboard';

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requirePermission('orders:view');

    const [dictionary, restaurantConfig, orders] = await Promise.all([
        getDictionary(locale),
        getRestaurantConfig(),
        getRestaurantConfig().then(config =>
            config ? getOrdersByRestaurant(config.id) : []
        )
    ]);

    if (!restaurantConfig) {
        return (
            <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <p className="text-sm sm:text-base text-muted-foreground">Configuración de restaurante no encontrada</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
            <OrdersDashboard
                orders={orders}
                restaurantConfig={restaurantConfig}
                dictionary={dictionary}
            />
        </div>
    );
} 