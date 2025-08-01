import { requirePermission, hasPermission } from '@repo/auth/server-permissions';
import { getDictionary } from '@repo/internationalization';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getOrdersByRestaurant } from '@repo/data-services';
import { OrdersDashboardServer } from './components/dashboard/OrdersDashboardServer';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';
import { FeedbackWidget } from '@/components/FeedbackWidget';

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // Verificar permisos básicos
    await requirePermission('orders:view', locale);

    const [dictionary, restaurantConfig, orders, canViewOrders, canEditOrders] = await Promise.all([
        getDictionary(locale),
        getRestaurantConfig(),
        getRestaurantConfig().then(config =>
            config ? getOrdersByRestaurant(config.id) : []
        ),
        hasPermission('orders:view'),
        hasPermission('orders:edit')
    ]);

    if (!restaurantConfig) {
        return (
            <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                            {dictionary.web?.orders?.title || 'Gestión de Órdenes'}
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">
                            {dictionary.web?.orders?.subtitle || 'Monitorea y gestiona las órdenes de tu restaurante en tiempo real'}
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <ShareLinksWidget dictionary={dictionary} />
                        <FeedbackWidget dictionary={dictionary} />
                    </div>
                </div>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center">
                        <p className="text-sm sm:text-base text-muted-foreground">{dictionary.web?.orders?.setup?.notFound || 'Configuración de restaurante no encontrada'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        {canEditOrders
                            ? (dictionary.web?.orders?.title || 'Gestión de Órdenes')
                            : (dictionary.web?.orders?.title || 'Gestión de Órdenes') + ' (' + (dictionary.app?.orders?.readOnlyTitle || 'Solo Lectura') + ')'
                        }
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        {canEditOrders
                            ? (dictionary.web?.orders?.subtitle || 'Monitorea y gestiona las órdenes de tu restaurante en tiempo real')
                            : (dictionary.web?.orders?.subtitle || 'Monitorea y gestiona las órdenes de tu restaurante en tiempo real') + ' (' + (dictionary.app?.orders?.readOnlySubtitle || 'Modo solo lectura') + ')'
                        }
                    </p>
                    {!canEditOrders && (
                        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                {dictionary.app?.orders?.readOnlyDescription || 'Modo solo lectura: Puedes ver las órdenes pero no modificarlas.'}
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex flex-row items-center gap-2">
                    <ShareLinksWidget dictionary={dictionary} />
                    <FeedbackWidget dictionary={dictionary} />
                </div>
            </div>
            <OrdersDashboardServer
                orders={orders}
                restaurantConfig={restaurantConfig}
                dictionary={dictionary}
                locale={locale}
                canEdit={canEditOrders}
                canView={canViewOrders}
            />
        </div>
    );
} 