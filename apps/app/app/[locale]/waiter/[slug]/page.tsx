import { notFound } from 'next/navigation';
import { getDictionary } from '@repo/internationalization';
import { getAllCategoriesWithDishesAndUncategorized } from '@repo/data-services/src/services/categoryService';
import { getRestaurantConfigBySlug } from '@repo/data-services/src/services/restaurantConfigService';
import { getAllDailySpecials } from '@repo/data-services/src/services/dailySpecialService';
import { getOrdersByRestaurant } from '@repo/data-services';
import { getRestaurantDesignByConfigId } from '@repo/data-services/src/services/restaurantDesignService';
import WaiterInterface from './components/WaiterInterface';
import { Toaster } from 'sonner';

interface PageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export default async function WaiterPage({ params }: PageProps) {
    const paramsData = await params;
    const { locale, slug } = paramsData;

    // Obtener la configuración del restaurante
    const restaurantConfig = await getRestaurantConfigBySlug(slug);

    // Verificar si el restaurante existe
    if (!restaurantConfig) {
        notFound();
    }

    const restaurantDesign = await getRestaurantDesignByConfigId(restaurantConfig.id);
    const tables = restaurantDesign?.tables || [];

    // Obtener datos del menú y órdenes usando el userId del restaurante
    const [dictionary, categoriesWithDishes, dailySpecials, existingOrders] = await Promise.all([
        getDictionary(locale),
        getAllCategoriesWithDishesAndUncategorized(restaurantConfig.createdById),
        getAllDailySpecials(restaurantConfig.createdById),
        getOrdersByRestaurant(restaurantConfig.id)
    ]);

    return (
        <>
            <WaiterInterface
                locale={locale}
                slug={slug}
                restaurantConfig={restaurantConfig}
                categories={categoriesWithDishes}
                dailySpecials={dailySpecials}
                dictionary={dictionary}
                existingOrders={existingOrders}
                tables={tables}
            />
            <Toaster />
        </>
    );
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: PageProps) {
    const paramsData = await params;
    const { locale, slug } = paramsData;

    const [dictionary, restaurantConfig] = await Promise.all([
        getDictionary(locale),
        getRestaurantConfigBySlug(slug)
    ]);

    if (!restaurantConfig) {
        return {
            title: 'Restaurant not found',
            description: 'This restaurant does not exist.',
        };
    }

    return {
        title: `${restaurantConfig.name} - Sistema de Órdenes`,
        description: `Sistema de órdenes para mozos de ${restaurantConfig.name}`,
    };
} 