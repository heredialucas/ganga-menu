import { requirePermission } from '@repo/auth/server-permissions';
import { database } from '@repo/database';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { upsertDailySpecial, deleteDailySpecials } from '@repo/data-services/src/services/dailySpecialService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/design-system/components/ui/accordion';
import { DishManager } from './components/DishManager';
import { CategoryManager } from './components/CategoryManager';
import { DailySpecialManager } from './components/DailySpecialManager';
import { getDictionary } from '@repo/internationalization';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requirePermission('dishes:view');

    const [user, dictionary] = await Promise.all([
        getCurrentUser(),
        getDictionary(locale),
    ]);

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
        <div className="space-y-6">
            <div className="flex flex-row items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                        Gestión del Menú
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Crea y edita tus platos. Usa los desplegables para configuraciones avanzadas.
                    </p>
                </div>
                <ShareLinksWidget dictionary={dictionary} />
            </div>

            <DishManager dishes={dishes} categories={categories} />

            <Accordion type="multiple" className="w-full space-y-4">
                <AccordionItem value="categories" className="border rounded-lg px-4">
                    <AccordionTrigger>
                        <h3 className="font-semibold text-lg">Gestor de Categorías</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CategoryManager categories={categories} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="specials" className="border rounded-lg px-4">
                    <AccordionTrigger>
                        <h3 className="font-semibold text-lg">Programador de Especiales del Día</h3>
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