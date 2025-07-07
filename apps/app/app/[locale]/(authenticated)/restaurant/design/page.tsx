import { requirePermission } from '@repo/auth/server-permissions';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getRestaurantDesignByConfigId } from '@repo/data-services/src/services/restaurantDesignService';
import { getDictionary } from '@repo/internationalization';

export default async function RestaurantDesignPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    // Verificar permisos para editar el diseño del restaurante
    await requirePermission('restaurant:edit_design');

    const paramsData = await params;
    const dictionary = await getDictionary(paramsData.locale);

    // Obtener configuración y diseño del restaurante
    const restaurantConfig = await getRestaurantConfig();
    const restaurantDesign = restaurantConfig
        ? await getRestaurantDesignByConfigId(restaurantConfig.id)
        : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Diseño del Restaurante
                </h1>
                <p className="text-muted-foreground">
                    Diseña la distribución de mesas y espacios de tu restaurante
                </p>
            </div>

            {!restaurantConfig ? (
                <div className="border rounded-lg p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                        Necesitas configurar tu restaurante primero antes de diseñar la distribución.
                    </p>
                    <a
                        href="/restaurant/config"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Configurar Restaurante
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Información del diseño actual */}
                    {restaurantDesign ? (
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Diseño Actual: {restaurantDesign.name}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Dimensiones del canvas:</p>
                                    <p className="text-sm text-blue-700">
                                        {restaurantDesign.canvasWidth} x {restaurantDesign.canvasHeight} px
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Elementos:</p>
                                    <p className="text-sm text-blue-700">
                                        {Array.isArray(restaurantDesign.elements) ? restaurantDesign.elements.length : 0} elementos
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                                No hay diseño configurado
                            </h3>
                            <p className="text-sm text-yellow-700">
                                Crea tu primer diseño de restaurante para organizar las mesas y espacios.
                            </p>
                        </div>
                    )}

                    {/* Editor de diseño placeholder */}
                    <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Editor de Diseño</h3>
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                El editor de diseño de restaurante estará disponible próximamente.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Aquí podrás arrastrar y soltar mesas, definir zonas y personalizar la distribución de tu restaurante.
                            </p>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Próximas Funcionalidades</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Editor visual de arrastrar y soltar</li>
                            <li>• Plantillas de diseño predefinidas</li>
                            <li>• Configuración de capacidad por mesa</li>
                            <li>• Zonas diferenciadas (interior, terraza, etc.)</li>
                            <li>• Vista previa en tiempo real</li>
                            <li>• Exportación de diseños</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
} 