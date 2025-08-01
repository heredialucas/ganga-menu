import { getCurrentUser, hasPermission } from '@repo/auth/server';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { ConfigManagerClient } from './ConfigManagerClient';

interface ConfigManagerServerProps {
    dictionary: Dictionary;
    appUrl: string;
}

export async function ConfigManagerServer({ dictionary, appUrl }: ConfigManagerServerProps) {
    // Verificar permisos en el servidor
    const [canViewRestaurant, canEditRestaurant] = await Promise.all([
        hasPermission('restaurant:view'),
        hasPermission('restaurant:edit')
    ]);

    if (!canViewRestaurant) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{dictionary.app.restaurant.config.toast.error}</p>
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
        <ConfigManagerClient
            config={config}
            dictionary={dictionary}
            appUrl={appUrl}
            canEdit={canEditRestaurant}
            canView={canViewRestaurant}
        />
    );
} 