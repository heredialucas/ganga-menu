import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getAllDishesWithFullData } from '@repo/data-services/src/services/dishService';
import { getAllCategoriesWithFullData } from '@repo/data-services/src/services/categoryService';
import { hasPermission } from '@repo/auth/server-permissions';
import { DishManagerClient } from './DishManagerClient';
import type { Dictionary } from '@repo/internationalization';

interface DishManagerServerProps {
    dictionary: Dictionary;
    locale: string;
}

export async function DishManagerServer({ dictionary, locale }: DishManagerServerProps) {
    const [user, canEdit, canView] = await Promise.all([
        getCurrentUser(),
        hasPermission('menu:edit'),
        hasPermission('menu:view')
    ]);

    if (!user) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                {dictionary.app?.menu?.dishes?.userNotAuthenticated || 'Usuario no autenticado.'}
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                {dictionary.app?.menu?.dishes?.noPermission || 'No tienes permisos para ver los platos.'}
            </div>
        );
    }

    // Cargar datos en paralelo
    const [dishes, categories] = await Promise.all([
        getAllDishesWithFullData(user.id),
        getAllCategoriesWithFullData(user.id)
    ]);

    return (
        <DishManagerClient
            dishes={dishes}
            categories={categories}
            dictionary={dictionary}
            canEdit={canEdit}
            canView={canView}
        />
    );
} 