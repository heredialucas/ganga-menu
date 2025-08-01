import { getCurrentUser, hasPermission } from '@repo/auth/server';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getRestaurantDesignByConfigId } from '@repo/data-services/src/services/restaurantDesignService';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { RestaurantDesignData } from '@repo/data-services/src/services/restaurantDesignService';
import type { Dictionary } from '@repo/internationalization';
import { DesignManagerClient } from './DesignManagerClient';

interface DesignManagerServerProps {
    dictionary: Dictionary;
}

export async function DesignManagerServer({ dictionary }: DesignManagerServerProps) {
    // Verificar permisos en el servidor
    const [canViewRestaurant, canEditRestaurant, hasDesignPermission] = await Promise.all([
        hasPermission('restaurant:view'),
        hasPermission('restaurant:edit'),
        hasPermission('restaurant:design')
    ]);

    if (!canViewRestaurant || !hasDesignPermission) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{dictionary.app.restaurant.design.toast.error}</p>
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

    // Cargar configuración y diseño del restaurante
    const config = await getRestaurantConfig(user.id);
    const design = config ? await getRestaurantDesignByConfigId(config.id) : null;

    return (
        <DesignManagerClient
            config={config}
            design={design}
            dictionary={dictionary}
            canEdit={canEditRestaurant && hasDesignPermission}
            canView={canViewRestaurant && hasDesignPermission}
        />
    );
} 