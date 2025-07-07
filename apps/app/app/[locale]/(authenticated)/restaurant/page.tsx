import { requirePermission } from '@repo/auth/server-permissions';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getRestaurantDesignByConfigId } from '@repo/data-services/src/services/restaurantDesignService';
import { getDictionary } from '@repo/internationalization';
import Link from 'next/link';
import { Settings, Palette, Store, QrCode } from 'lucide-react';

export default async function RestaurantPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    // Verificar permisos para ver la configuración del restaurante
    await requirePermission('restaurant:view_config');

    const paramsData = await params;
    const dictionary = await getDictionary(paramsData.locale);

    // Obtener configuración del restaurante
    const restaurantConfig = await getRestaurantConfig();
    const restaurantDesign = restaurantConfig
        ? await getRestaurantDesignByConfigId(restaurantConfig.id)
        : null;

    const restaurantSections = [
        {
            title: 'Configuración General',
            description: 'Información básica del restaurante',
            href: '/restaurant/config',
            icon: Settings,
            color: 'bg-blue-500',
            status: restaurantConfig ? 'Configurado' : 'Pendiente'
        },
        {
            title: 'Diseño de Mesas',
            description: 'Diseña la distribución de tu restaurante',
            href: '/restaurant/design',
            icon: Palette,
            color: 'bg-green-500',
            status: restaurantDesign ? 'Configurado' : 'Pendiente'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Gestión del Restaurante
                </h1>
                <p className="text-muted-foreground">
                    Configura y personaliza tu restaurante
                </p>
            </div>

            {/* Información del restaurante actual */}
            {restaurantConfig && (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Store className="h-8 w-8 text-green-600" />
                        <div>
                            <h2 className="text-xl font-semibold text-green-900">{restaurantConfig.name}</h2>
                            <p className="text-green-700">{restaurantConfig.description}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <p className="text-sm font-medium text-green-900">Slug público:</p>
                            <p className="text-sm text-green-700 font-mono">{restaurantConfig.slug}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-900">Código de mozo:</p>
                            <p className="text-sm text-green-700 font-mono">{restaurantConfig.waiterCode}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {restaurantSections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="group block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${section.color} text-white`}>
                                <section.icon className="h-6 w-6" />
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${section.status === 'Configurado'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {section.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {section.description}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Enlaces rápidos */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {restaurantConfig && (
                        <>
                            <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <QrCode className="h-4 w-4" />
                                    Menú Público
                                </h4>
                                <Link
                                    href={`/menu/${restaurantConfig.slug}`}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    target="_blank"
                                >
                                    Ver menú público →
                                </Link>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Store className="h-4 w-4" />
                                    Interfaz de Mesa
                                </h4>
                                <Link
                                    href={`/waiter/${restaurantConfig.slug}`}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    target="_blank"
                                >
                                    Acceder como mozo →
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 