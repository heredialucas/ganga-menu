import { redirect } from 'next/navigation';
import { hasAnyPermission } from '@repo/auth/server-permissions';
import { getDictionary } from '@repo/internationalization';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { ServicesCards } from './components/ServicesCards';
import Link from 'next/link';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';

export default async function ServicesPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    const hasAccess = await hasAnyPermission(['waiter:view_orders', 'kitchen:view_orders']);
    if (!hasAccess) {
        redirect(`/${locale}/access-denied`);
    }

    const [dictionary, restaurantConfig] = await Promise.all([
        getDictionary(locale),
        getRestaurantConfig(),
    ]);

    if (!restaurantConfig) {
        return (
            <div className="space-y-6">
                <div className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                            Servicios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Herramientas para la gestión de tu restaurante.
                        </p>
                    </div>
                    <ShareLinksWidget dictionary={dictionary} />
                </div>
                <div className="border rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold mb-2">Configuración Requerida</h2>
                    <p className="text-muted-foreground mb-4">
                        Para usar los servicios de mozos y cocina, primero debes configurar tu restaurante.
                    </p>
                    <Link href={`/${locale}/restaurant`} className="text-blue-500 hover:underline">
                        Ir a la configuración del restaurante
                    </Link>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-row items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                        Servicios
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Accesos directos para el personal de tu restaurante.
                    </p>
                </div>
                <ShareLinksWidget dictionary={dictionary} />
            </div>
            <ServicesCards
                restaurantConfig={restaurantConfig}
                dictionary={dictionary}
                locale={locale}
            />
        </div>
    );
} 