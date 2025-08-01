import { getDictionary } from '@repo/internationalization';
import { requirePermission } from '@repo/auth/server-permissions';
import { Suspense } from 'react';
import { ShareLinksWidget } from '@/components/ShareLinksWidget';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/design-system/components/ui/accordion';
import { DishManagerServer } from './components/dishes/DishManagerServer';
import { CategoryManagerServer } from './components/categories/CategoryManagerServer';
import { DailySpecialManagerServer } from './components/daily-specials/DailySpecialManagerServer';
import { MenuAccessWidgetServer } from './components/menu-access/MenuAccessWidgetServer';
import DishLoading from './components/dishes/loading';
import CategoryLoading from './components/categories/loading';
import DailySpecialLoading from './components/daily-specials/loading';
import MenuAccessLoading from './components/menu-access/loading';

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requirePermission('menu:view');

    const dictionary = await getDictionary(locale);

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

            {/* Sección de Platos */}
            <Suspense fallback={<DishLoading />}>
                <DishManagerServer dictionary={dictionary} locale={locale} />
            </Suspense>

            {/* Widget de Acceso al Menú */}
            <Suspense fallback={<MenuAccessLoading />}>
                <MenuAccessWidgetServer dictionary={dictionary} locale={locale} />
            </Suspense>

            <Accordion type="multiple" className="w-full space-y-3 sm:space-y-4">
                {/* Sección de Categorías */}
                <AccordionItem value="categories" className="border rounded-lg px-3 sm:px-4">
                    <AccordionTrigger className="text-left">
                        <h3 className="font-semibold text-base sm:text-lg">{dictionary.app?.menu?.categories?.title || 'Gestor de Categorías'}</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <Suspense fallback={<CategoryLoading />}>
                            <CategoryManagerServer dictionary={dictionary} locale={locale} />
                        </Suspense>
                    </AccordionContent>
                </AccordionItem>

                {/* Sección de Especiales del Día */}
                <AccordionItem value="specials" className="border rounded-lg px-3 sm:px-4">
                    <AccordionTrigger className="text-left">
                        <h3 className="font-semibold text-base sm:text-lg">{dictionary.app?.menu?.dailySpecials?.title || 'Programador de Especiales del Día'}</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                        <Suspense fallback={<DailySpecialLoading />}>
                            <DailySpecialManagerServer dictionary={dictionary} locale={locale} />
                        </Suspense>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}



