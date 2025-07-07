import { requirePermission } from '@repo/auth/server-permissions';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getDictionary } from '@repo/internationalization';

export default async function RestaurantPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    // Verificar permisos
    await requirePermission('restaurant:view_config');

    const paramsData = await params;
    const dictionary = await getDictionary(paramsData.locale);

    // Obtener datos
    const restaurantConfig = await getRestaurantConfig();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Configuración del Restaurante
                </h1>
                <p className="text-muted-foreground">
                    Gestiona la configuración de tu restaurante
                </p>
            </div>

            {restaurantConfig ? (
                <div className="border rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-lg">{restaurantConfig.name}</h3>
                    <p className="text-muted-foreground">{restaurantConfig.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium">Dirección:</p>
                            <p className="text-sm text-muted-foreground">{restaurantConfig.address || 'No configurada'}</p>
                        </div>
                        <div>
                            <p className="font-medium">Teléfono:</p>
                            <p className="text-sm text-muted-foreground">{restaurantConfig.phone || 'No configurado'}</p>
                        </div>
                        <div>
                            <p className="font-medium">Email:</p>
                            <p className="text-sm text-muted-foreground">{restaurantConfig.email || 'No configurado'}</p>
                        </div>
                        <div>
                            <p className="font-medium">Código de mozo:</p>
                            <p className="text-sm text-muted-foreground">{restaurantConfig.waiterCode}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg p-6 text-center text-muted-foreground">
                    No hay configuración de restaurante
                </div>
            )}
        </div>
    );
} 