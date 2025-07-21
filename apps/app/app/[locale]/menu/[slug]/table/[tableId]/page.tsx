import { notFound } from 'next/navigation';
import { getDictionary } from '@repo/internationalization';
import { getAllCategoriesWithDishesAndUncategorized } from '@repo/data-services/src/services/categoryService';
import { getAllDailySpecials } from '@repo/data-services/src/services/dailySpecialService';
import { getRestaurantConfigBySlug } from '@repo/data-services/src/services/restaurantConfigService';
import { getTableByIdAndRestaurant } from '@repo/data-services/src/services/tableService';
import MenuLanding from '../../components/MenuLanding';

interface PageProps {
    params: Promise<{
        locale: string;
        slug: string;
        tableId: string;
    }>;
}

export default async function TableMenuPage({ params }: PageProps) {
    const paramsData = await params;
    const { locale, slug, tableId } = paramsData;

    // Obtener la configuración del restaurante
    const restaurantConfig = await getRestaurantConfigBySlug(slug);

    if (!restaurantConfig) {
        notFound();
    }

    // Validar que la mesa existe y pertenece a este restaurante
    const table = await getTableByIdAndRestaurant(tableId, restaurantConfig.id);

    if (!table) {
        notFound();
    }

    // Obtener datos del menú
    const [dictionary, categoriesWithDishes, dailySpecials] = await Promise.all([
        getDictionary(locale),
        getAllCategoriesWithDishesAndUncategorized(restaurantConfig.createdById),
        getAllDailySpecials(restaurantConfig.createdById)
    ]);

    // Encontrar todos los especiales de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySpecials = dailySpecials.filter(special => {
        const specialDate = new Date(special.date);
        specialDate.setHours(0, 0, 0, 0);
        return specialDate.getTime() === today.getTime() && special.isActive;
    });

    const todaySpecial = todaySpecials.length > 0 ? todaySpecials[0] : null;

    return (
        <MenuLanding
            locale={locale}
            slug={slug}
            restaurantConfig={restaurantConfig}
            categories={categoriesWithDishes}
            todaySpecial={todaySpecial}
            todaySpecials={todaySpecials}
            dictionary={dictionary}
            table={table}
        />
    );
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: PageProps) {
    const paramsData = await params;
    const { slug, tableId } = paramsData;

    const restaurantConfig = await getRestaurantConfigBySlug(slug);

    if (!restaurantConfig) {
        return {
            title: 'Restaurant not found',
            description: 'This restaurant does not exist.',
        };
    }

    const table = await getTableByIdAndRestaurant(tableId, restaurantConfig.id);

    if (!table) {
        return {
            title: 'Table not found',
            description: 'This table does not exist.',
        };
    }

    return {
        title: `${restaurantConfig.name} - ${table.label} - Menu`,
        description: `Order from ${table.label} at ${restaurantConfig.name}`,
    };
} 