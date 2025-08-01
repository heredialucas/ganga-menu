import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getDictionary } from '@repo/internationalization';
import { requirePermission, hasPermission } from '@repo/auth/server-permissions';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { getAllDishesWithFullData } from '@repo/data-services/src/services/dishService';
import { getAllCategoriesWithFullData } from '@repo/data-services/src/services/categoryService';
import { getAllDailySpecialsWithFullData, upsertDailySpecial, deleteDailySpecials } from '@repo/data-services/src/services/dailySpecialService';
import { getAppUrl } from '@/lib/utils';
import { DishManager } from './components/DishManager';
import { CategoryManager } from './components/CategoryManager';
import { DailySpecialManager } from './components/DailySpecialManager';
import { MenuAccessWidget } from './components/MenuAccessWidget';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/design-system/components/ui/accordion';

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requirePermission('menu:view');

    const [user, dictionary] = await Promise.all([
        getCurrentUser(),
        getDictionary(locale),
    ]);

    const restaurantConfig = await getRestaurantConfig(user?.id);

    if (!user) {
        return <p className="p-4 text-center">{dictionary.app?.menu?.userNotAuthenticated || 'Usuario no autenticado.'}</p>;
    }

    // Verificar permisos específicos del menú
    const [canViewMenu, canEditMenu] = await Promise.all([
        hasPermission('menu:view'),
        hasPermission('menu:edit')
    ]);

    // ✅ CORREGIDO: Usar los servicios que manejan correctamente la lógica de restaurante padre
    const [dishes, categories, dailySpecials] = await Promise.all([
        getAllDishesWithFullData(user.id), // Este servicio ya usa getRestaurantOwner internamente
        getAllCategoriesWithFullData(user.id), // Este servicio ya usa getRestaurantOwner internamente
        getAllDailySpecialsWithFullData(user.id), // Este servicio ya usa getRestaurantOwner internamente
    ]);

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        {dictionary.app?.menu?.title || 'Gestión del Menú'}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        {dictionary.app?.menu?.subtitle || 'Crea y edita tus platos. Usa los desplegables para configuraciones avanzadas.'}
                    </p>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <ShareLinksWidget dictionary={dictionary} />
                    <FeedbackWidget dictionary={dictionary} />
                </div>
            </div>

            <DishManager
                dishes={dishes}
                categories={categories}
                dictionary={dictionary}
                canEdit={canEditMenu}
                canView={canViewMenu}
            />
            <MenuAccessWidget
                config={restaurantConfig}
                appUrl={getAppUrl()}
                dictionary={dictionary}
                locale={locale}
                canEdit={canEditMenu}
                canView={canViewMenu}
            />

            <Accordion type="multiple" className="w-full space-y-3 sm:space-y-4">
                <AccordionItem value="categories" className="border rounded-lg px-3 sm:px-4">
                    <AccordionTrigger className="text-left">
                        <h3 className="font-semibold text-base sm:text-lg">{dictionary.app?.menu?.categories?.title || 'Gestor de Categorías'}</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CategoryManager
                            categories={categories}
                            dictionary={dictionary}
                            canEdit={canEditMenu}
                            canView={canViewMenu}
                        />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="specials" className="border rounded-lg px-3 sm:px-4">
                    <AccordionTrigger className="text-left">
                        <h3 className="font-semibold text-base sm:text-lg">{dictionary.app?.menu?.dailySpecials?.title || 'Programador de Especiales del Día'}</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <DailySpecialManager
                            dailySpecials={dailySpecials}
                            dishes={dishes}
                            upsertDailySpecial={upsertDailySpecial}
                            deleteDailySpecials={deleteDailySpecials}
                            dictionary={dictionary}
                            locale={locale}
                            canEdit={canEditMenu}
                            canView={canViewMenu}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
} 