import { notFound } from 'next/navigation';
import { getDictionary } from '@repo/internationalization';
import { getRestaurantConfigBySlug } from '@repo/data-services/src/services/restaurantConfigService';
import { getOrdersByRestaurant } from '@repo/data-services';
import KitchenInterface from './components/KitchenInterface';

interface PageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export default async function KitchenPage({ params }: PageProps) {
    const paramsData = await params;
    const { locale, slug } = paramsData;

    // Obtener la configuración del restaurante
    const restaurantConfig = await getRestaurantConfigBySlug(slug);

    // Verificar si el restaurante existe
    if (!restaurantConfig) {
        notFound();
    }

    // Obtener diccionario y órdenes
    const [dictionary, orders] = await Promise.all([
        getDictionary(locale),
        getOrdersByRestaurant(restaurantConfig.id)
    ]);

    return (
        <KitchenInterface
            restaurantConfig={restaurantConfig}
            orders={orders}
            dictionary={dictionary}
        />
    );
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: PageProps) {
    const paramsData = await params;
    const { slug } = paramsData;

    const restaurantConfig = await getRestaurantConfigBySlug(slug);

    if (!restaurantConfig) {
        return {
            title: 'Restaurant not found',
            description: 'This restaurant does not exist.',
        };
    }

    return {
        title: `${restaurantConfig.name} - Panel de Cocina`,
        description: `Panel de gestión de órdenes para la cocina de ${restaurantConfig.name}`,
    };
} 