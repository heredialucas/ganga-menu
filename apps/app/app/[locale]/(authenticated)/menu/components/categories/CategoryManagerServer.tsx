import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getAllCategoriesWithFullData } from '@repo/data-services/src/services/categoryService';
import { hasPermission } from '@repo/auth/server-permissions';
import { CategoryManagerClient } from './CategoryManagerClient';
import type { Dictionary } from '@repo/internationalization';

interface CategoryManagerServerProps {
    dictionary: Dictionary;
    locale: string;
}

export async function CategoryManagerServer({ dictionary, locale }: CategoryManagerServerProps) {
    const [user, canEdit, canView] = await Promise.all([
        getCurrentUser(),
        hasPermission('menu:edit'),
        hasPermission('menu:view')
    ]);

    if (!user) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                {dictionary.app?.menu?.categories?.userNotAuthenticated || 'Usuario no autenticado.'}
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                {dictionary.app?.menu?.categories?.noPermission || 'No tienes permisos para ver las categorías.'}
            </div>
        );
    }

    const categories = await getAllCategoriesWithFullData(user.id);

    return (
        <CategoryManagerClient
            categories={categories}
            dictionary={dictionary}
            canEdit={canEdit}
            canView={canView}
        />
    );
} 