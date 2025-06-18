import { getAllCategories } from '@repo/data-services/src/services/categoryService';
import { getAllDishes } from '@repo/data-services/src/services/dishService';
import { getAllDailySpecials } from '@repo/data-services/src/services/dailySpecialService';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getRestaurantDesignByConfigId } from '@repo/data-services/src/services/restaurantDesignService';
import MenuDashboard from './components/MenuDashboard';
import { Suspense } from 'react';
import { getDictionary } from '@repo/internationalization';

export default async function AdminDashboard({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const paramsData = await params;
    const dictionary = await getDictionary(paramsData.locale);

    // Obtener datos del menú desde la base de datos
    const [categories, dishes, dailySpecials, restaurantConfig] = await Promise.all([
        getAllCategories(),
        getAllDishes(),
        getAllDailySpecials(),
        getRestaurantConfig()
    ]);

    // Obtener diseño del restaurante si existe configuración
    const restaurantDesign = restaurantConfig
        ? await getRestaurantDesignByConfigId(restaurantConfig.id)
        : null;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MenuDashboard
                categories={categories}
                dishes={dishes}
                dailySpecials={dailySpecials}
                restaurantConfig={restaurantConfig}
                restaurantDesign={restaurantDesign}
                dictionary={dictionary}
                locale={paramsData.locale}
            />
        </Suspense>
    );
}