import { getCurrentUser, hasPermission } from '@repo/auth/server';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { QRManagerClient } from './QRManagerClient';

interface QRManagerServerProps {
    dictionary: Dictionary;
    appUrl: string;
}

export async function QRManagerServer({ dictionary, appUrl }: QRManagerServerProps) {
    // Verificar permisos en el servidor
    const [canViewRestaurant, canEditRestaurant, hasQRPermission] = await Promise.all([
        hasPermission('restaurant:view'),
        hasPermission('restaurant:edit'),
        hasPermission('restaurant:qr_codes')
    ]);

    if (!canViewRestaurant || !hasQRPermission) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{dictionary.app.restaurant.qr.toast.downloadError}</p>
            </div>
        );
    }

    // Obtener datos del usuario y configuración
    const user = await getCurrentUser();
    if (!user) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{dictionary.app.restaurant.userNotAuthenticated}</p>
            </div>
        );
    }

    // Cargar configuración del restaurante
    const config = await getRestaurantConfig(user.id);

    return (
        <QRManagerClient
            config={config}
            dictionary={dictionary}
            appUrl={appUrl}
            canEdit={canEditRestaurant && hasQRPermission}
            canView={canViewRestaurant && hasQRPermission}
        />
    );
} 