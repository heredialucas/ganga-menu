import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { OrderData } from '@repo/data-services';
import { hasPermission } from '@repo/auth/server-permissions';
import { OrdersDashboardClient } from './OrdersDashboardClient';

interface OrdersDashboardServerProps {
    orders: OrderData[];
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
}

export async function OrdersDashboardServer({
    orders,
    restaurantConfig,
    dictionary,
    locale
}: OrdersDashboardServerProps) {
    // Verificar permisos específicos
    const [canViewOrders, canEditOrders] = await Promise.all([
        hasPermission('orders:view'),
        hasPermission('orders:edit')
    ]);

    // Validar que el usuario tenga al menos permisos de lectura
    if (!canViewOrders) {
        return (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <p className="text-sm sm:text-base text-muted-foreground">
                            {dictionary.web?.orders?.permissions?.noAccess || 'No tienes permisos para ver las órdenes'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <OrdersDashboardClient
            orders={orders}
            restaurantConfig={restaurantConfig}
            dictionary={dictionary}
            locale={locale}
            canView={canViewOrders}
            canEdit={canEditOrders}
        />
    );
} 