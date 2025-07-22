import { redirect } from 'next/navigation';
import { hasAnyPermission } from '@repo/auth/server-permissions';
import { getDictionary } from '@repo/internationalization';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { ServicesCards } from './components/ServicesCards';
import Link from 'next/link';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';
import { FeedbackWidget } from '@/components/FeedbackWidget';

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
            <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                            {dictionary.web?.services?.title || 'Servicios'}
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">
                            {dictionary.web?.services?.subtitleAlt || 'Herramientas para la gestión de tu restaurante.'}
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <ShareLinksWidget dictionary={dictionary} />
                        <FeedbackWidget dictionary={dictionary} />
                    </div>
                </div>
                <div className="border rounded-lg p-3 sm:p-4 md:p-6 text-center">
                    <h2 className="text-lg sm:text-xl font-semibold mb-2">{dictionary.web?.services?.setup?.title || 'Configuración Requerida'}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                        {dictionary.web?.services?.setup?.description || 'Para usar los servicios de mozos y cocina, primero debes configurar tu restaurante.'}
                    </p>
                    <Link href={`/${locale}/restaurant`} className="text-blue-500 hover:underline">
                        {dictionary.web?.services?.setup?.link || 'Ir a la configuración del restaurante'}
                    </Link>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        {dictionary.web?.services?.title || 'Servicios'}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        {dictionary.web?.services?.subtitle || 'Accesos directos para el personal de tu restaurante.'}
                    </p>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <ShareLinksWidget dictionary={dictionary} />
                    <FeedbackWidget dictionary={dictionary} />
                </div>
            </div>
            <ServicesCards
                restaurantConfig={restaurantConfig}
                dictionary={dictionary}
                locale={locale}
            />
        </div>
    );
} 