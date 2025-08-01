import { requirePermission, hasPermission } from '@repo/auth/server-permissions';
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
    const { locale } = await params;

    // Verificar permisos básicos
    await requirePermission('restaurant:view', locale);

    const dictionary = await getDictionary(locale);

    // Verificar permisos en el servidor
    const [canViewRestaurant, canEditRestaurant, hasDesignPermission, hasQRPermission] = await Promise.all([
        hasPermission('restaurant:view'),
        hasPermission('restaurant:edit'),
        hasPermission('restaurant:design'),
        hasPermission('restaurant:qr_codes')
    ]);

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        {canEditRestaurant
                            ? dictionary.app.restaurant.title
                            : dictionary.app.restaurant.title + ' (' + (dictionary.app.restaurant.config.readOnlyTitle || 'Solo Lectura') + ')'
                        }
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        {canEditRestaurant
                            ? dictionary.app.restaurant.subtitle
                            : dictionary.app.restaurant.subtitle + ' (' + (dictionary.app.restaurant.config.readOnlySubtitle || 'Modo solo lectura') + ')'
                        }
                    </p>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <ShareLinksWidget dictionary={dictionary} />
                    <FeedbackWidget dictionary={dictionary} />
                </div>
            </div>

            <RestaurantViewManager
                dictionary={dictionary}
                appUrl={getAppUrl()}
                showDesignTab={hasDesignPermission}
                showQRTab={hasQRPermission}
                canEdit={canEditRestaurant}
                canView={canViewRestaurant}
            />
        </div>
    );
} 