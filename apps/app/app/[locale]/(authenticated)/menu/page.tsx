import { requirePermission } from '@repo/auth/server-permissions';
import { database } from '@repo/database';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { upsertDailySpecial, deleteDailySpecials } from '@repo/data-services/src/services/dailySpecialService';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/design-system/components/ui/accordion';
import { DishManager } from './components/DishManager';
import { CategoryManager } from './components/CategoryManager';
import { DailySpecialManager } from './components/DailySpecialManager';
import { MenuAccessWidget } from './components/MenuAccessWidget';
import { getDictionary } from '@repo/internationalization';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { getAppUrl } from '@/lib/utils';

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requirePermission('dishes:view');

    const [user, dictionary] = await Promise.all([
        getCurrentUser(),
        getDictionary(locale),
    ]);

    const restaurantConfig = await getRestaurantConfig(user?.id);

    if (!user) {
        return <p className="p-4 text-center">Usuario no autenticado.</p>;
    }
    const userId = user.id;

    const dishes = await database.dish.findMany({
        where: { createdById: userId },
        include: { category: true },
        orderBy: { name: 'asc' }
    });
    const categories = await database.category.findMany({
        where: { createdById: userId },
        orderBy: { name: 'asc' }
    });
    const dailySpecials = await database.dailySpecial.findMany({
        where: { createdById: userId },
        include: { dish: true },
        orderBy: { date: 'desc' }
    });

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-1 sm:p-2 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        Gestión del Menú
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        Crea y edita tus platos. Usa los desplegables para configuraciones avanzadas.
                    </p>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <ShareLinksWidget dictionary={dictionary} />
                    <FeedbackWidget dictionary={dictionary} />
                </div>
            </div>

            <DishManager dishes={dishes} categories={categories} />
            <MenuAccessWidget config={restaurantConfig} appUrl={getAppUrl()} />

            <Accordion type="multiple" className="w-full space-y-3 sm:space-y-4">
                <AccordionItem value="categories" className="border rounded-lg px-3 sm:px-4">
                    <AccordionTrigger className="text-left">
                        <h3 className="font-semibold text-base sm:text-lg">Gestor de Categorías</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CategoryManager categories={categories} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="specials" className="border rounded-lg px-3 sm:px-4">
                    <AccordionTrigger className="text-left">
                        <h3 className="font-semibold text-base sm:text-lg">Programador de Especiales del Día</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <DailySpecialManager
                            dailySpecials={dailySpecials}
                            dishes={dishes}
                            upsertDailySpecial={upsertDailySpecial}
                            deleteDailySpecials={deleteDailySpecials}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
} 