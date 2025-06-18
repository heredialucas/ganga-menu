'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Dictionary } from '@repo/internationalization';
import { CategoryData } from '@repo/data-services/src/services/categoryService';
import { DishData } from '@repo/data-services/src/services/dishService';
import { DailySpecialData } from '@repo/data-services/src/services/dailySpecialService';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { RestaurantDesignData } from '@repo/data-services/src/services/restaurantDesignService';
import CategoriesSection from './categories/CategoriesSection';
import DishesSection from './dishes/DishesSection';
import DailySpecialsSection from './daily-specials/DailySpecialsSection';
import RestaurantConfigSection from './restaurant-config/RestaurantConfigSection';
import RestaurantDesignWrapper from './restaurant/RestaurantDesignWrapper';
import MenuShareWidget from '../../../../../../components/MenuShareWidget';

interface MenuDashboardProps {
    categories: CategoryData[];
    dishes: DishData[];
    dailySpecials: DailySpecialData[];
    restaurantConfig: RestaurantConfigData | null;
    restaurantDesign: RestaurantDesignData | null;
    dictionary: Dictionary;
    locale: string;
}

export default function MenuDashboard({
    categories,
    dishes,
    dailySpecials,
    restaurantConfig,
    restaurantDesign,
    dictionary,
    locale
}: MenuDashboardProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const activeTab = searchParams.get('tab') as 'config' | 'categories' | 'dishes' | 'dailySpecials' | 'restaurant' || 'config';



    // Obtener slug y nombre del restaurante
    const restaurantSlug = restaurantConfig?.slug || 'mi-restaurante';
    const restaurantName = restaurantConfig?.name || 'Mi Restaurante';

    return (
        <div className="p-3 sm:p-4 md:p-6">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {dictionary.app.admin.menu.title}
                </h1>
            </div>

            {/* Widget de compartir menú - compacto para todas las vistas excepto config */}
            {activeTab !== 'config' && (
                <div className="mb-4 sm:mb-6">
                    <MenuShareWidget
                        slug={restaurantSlug}
                        locale={locale}
                        restaurantName={restaurantName}
                        compact={true}
                    />
                </div>
            )}

            {/* Content */}
            {activeTab === 'config' && (
                <RestaurantConfigSection
                    restaurantConfig={restaurantConfig}
                    dictionary={dictionary}
                    locale={locale}
                />
            )}

            {activeTab === 'categories' && (
                <CategoriesSection
                    categories={categories}
                    dictionary={dictionary.app.admin.menu.categories}
                />
            )}

            {activeTab === 'dishes' && (
                <DishesSection
                    dishes={dishes}
                    categories={categories}
                    dictionary={dictionary.app.admin.menu.dishes}
                />
            )}

            {activeTab === 'dailySpecials' && (
                <DailySpecialsSection
                    dailySpecials={dailySpecials}
                    dishes={dishes}
                    dictionary={dictionary.app.admin.menu.dailySpecials}
                />
            )}

            {activeTab === 'restaurant' && (
                <RestaurantDesignWrapper
                    dictionary={dictionary.app.admin.menu.restaurant}
                    restaurantConfig={restaurantConfig}
                    restaurantDesign={restaurantDesign}
                />
            )}
        </div>
    );
} 