'use server'

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import { getCurrentUserId } from './authService';
import { requirePermission } from '@repo/auth/server-permissions';

export interface CategoryData {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    dishCount?: number;
}

export interface CategoryFormData {
    name: string;
    description?: string;
    imageUrl?: string;
    order?: number;
    isActive?: boolean;
}

/**
 * Crear una nueva categoría
 */
export async function createCategory(data: CategoryFormData, createdById: string) {
    try {
        // Verificar permiso para editar menú
        await requirePermission('menu:edit');

        // ✅ CORREGIDO: Obtener el ID del dueño del restaurante
        const { getRestaurantOwner } = await import('./restaurantConfigService');
        const restaurantOwnerId = await getRestaurantOwner(createdById);

        if (!restaurantOwnerId) {
            throw new Error("No se pudo determinar el dueño del restaurante");
        }

        // ✅ CORREGIDO: Verificar si ya existe una categoría con ese nombre en el restaurante del usuario
        const existingCategory = await database.category.findFirst({
            where: {
                name: data.name,
                createdById: restaurantOwnerId // Solo verificar dentro del restaurante del usuario
            },
        });

        if (existingCategory) {
            throw new Error('Ya existe una categoría con este nombre');
        }

        // ✅ CORREGIDO: Crear la categoría usando el restaurantOwnerId
        const category = await database.category.create({
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                order: data.order || 0,
                isActive: data.isActive ?? true,
                createdById: restaurantOwnerId, // Usar restaurantOwnerId en lugar de createdById
            },
        });

        revalidatePath('/admin/dashboard');
        revalidatePath('/menu'); // Agregar revalidatePath para la página de menú
        return category;
    } catch (error) {
        console.error('Error al crear categoría:', error);
        // ✅ CORREGIDO: Preservar el mensaje de error original si existe
        if (error instanceof Error) {
            throw error; // Mantener el mensaje original del error
        }
        throw new Error('No se pudo crear la categoría');
    }
}

/**
 * Obtener todas las categorías del usuario actual (para admin)
 */
export async function getAllCategories(userId?: string) {
    try {
        // Si no se proporciona userId, obtener el actual
        const currentUserId = userId || await getCurrentUserId();
        if (!currentUserId) {
            throw new Error('Usuario no autenticado');
        }

        // ✅ CORREGIDO: Obtener el ID del dueño del restaurante
        const { getRestaurantOwner } = await import('./restaurantConfigService');
        const restaurantOwnerId = await getRestaurantOwner(currentUserId);

        if (!restaurantOwnerId) {
            return [];
        }

        const categories = await database.category.findMany({
            where: { createdById: restaurantOwnerId }, // ✅ Usar restaurantOwnerId en lugar de currentUserId
            include: {
                _count: {
                    select: { dishes: true }
                }
            },
            orderBy: { order: 'asc' },
        });

        return categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl,
            order: category.order,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            dishCount: category._count.dishes
        })) as CategoryData[];
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        throw new Error("No se pudieron obtener las categorías");
    }
}

/**
 * Obtener todas las categorías del usuario actual con datos completos (para panel de admin)
 * Esta función devuelve los datos completos incluyendo createdById para compatibilidad con componentes
 */
export async function getAllCategoriesWithFullData(userId?: string) {
    try {
        // Si no se proporciona userId, obtener el actual
        const currentUserId = userId || await getCurrentUserId();
        if (!currentUserId) {
            throw new Error('Usuario no autenticado');
        }

        // Obtener el ID del dueño del restaurante
        const { getRestaurantOwner } = await import('./restaurantConfigService');
        const restaurantOwnerId = await getRestaurantOwner(currentUserId);

        if (!restaurantOwnerId) {
            return [];
        }

        const categories = await database.category.findMany({
            where: { createdById: restaurantOwnerId },
            orderBy: { order: 'asc' },
        });

        return categories;
    } catch (error) {
        console.error("Error al obtener categorías con datos completos:", error);
        throw new Error("No se pudieron obtener las categorías");
    }
}

/**
 * Obtener categorías activas (para público)
 */
export async function getActiveCategories() {
    try {
        const categories = await database.category.findMany({
            where: { isActive: true },
            include: {
                dishes: {
                    where: { status: 'ACTIVE' },
                    orderBy: { order: 'asc' },
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { order: 'asc' },
        });

        return categories;
    } catch (error) {
        console.error("Error al obtener categorías activas:", error);
        throw new Error("No se pudieron obtener las categorías");
    }
}

/**
 * Obtener una categoría por ID
 */
export async function getCategoryById(categoryId: string) {
    try {
        const category = await database.category.findUnique({
            where: { id: categoryId },
            include: {
                dishes: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        return category;
    } catch (error) {
        console.error('Error al obtener categoría por ID:', error);
        throw new Error('No se pudo obtener la categoría');
    }
}

/**
 * Actualizar una categoría existente
 */
export async function updateCategory(categoryId: string, data: CategoryFormData) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("Usuario no autenticado");
        }

        // ✅ CORREGIDO: Obtener el ID del dueño del restaurante
        const { getRestaurantOwner } = await import('./restaurantConfigService');
        const restaurantOwnerId = await getRestaurantOwner(userId);

        if (!restaurantOwnerId) {
            throw new Error("No se pudo determinar el dueño del restaurante");
        }

        // Verificar que la categoría pertenece al restaurante padre
        const categoryToUpdate = await database.category.findFirst({
            where: {
                id: categoryId,
                createdById: restaurantOwnerId, // ✅ Usar restaurantOwnerId en lugar de userId
            }
        });

        if (!categoryToUpdate) {
            throw new Error("Categoría no encontrada o no tienes permiso para editarla.");
        }

        // ✅ CORREGIDO: Verificar si existe otra categoría con el mismo nombre en el restaurante del usuario (excluyendo la actual)
        if (data.name) {
            const existingCategory = await database.category.findFirst({
                where: {
                    name: data.name,
                    id: { not: categoryId },
                    createdById: restaurantOwnerId // Solo verificar dentro del restaurante del usuario
                },
            });

            if (existingCategory) {
                throw new Error('Ya existe una categoría con este nombre');
            }
        }

        // Actualizar categoría en la base de datos
        const category = await database.category.update({
            where: { id: categoryId },
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                order: data.order,
                isActive: data.isActive,
            },
        });

        revalidatePath('/admin/dashboard');
        return category;
    } catch (error) {
        console.error("Error al actualizar categoría:", error);
        // ✅ CORREGIDO: Preservar el mensaje de error original si existe
        if (error instanceof Error) {
            throw error; // Mantener el mensaje original del error
        }
        throw new Error("No se pudo actualizar la categoría");
    }
}

/**
 * Eliminar una categoría
 */
export async function deleteCategory(categoryId: string) {
    try {
        // Verificar permiso para editar menú
        await requirePermission('menu:edit');

        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("Usuario no autenticado");
        }

        // ✅ CORREGIDO: Obtener el ID del dueño del restaurante
        const { getRestaurantOwner } = await import('./restaurantConfigService');
        const restaurantOwnerId = await getRestaurantOwner(userId);

        if (!restaurantOwnerId) {
            throw new Error("No se pudo determinar el dueño del restaurante");
        }

        // ✅ CORREGIDO: Verificar que la categoría pertenece al restaurante padre y si tiene platos asociados
        const categoryWithDishes = await database.category.findFirst({
            where: {
                id: categoryId,
                createdById: restaurantOwnerId // Solo verificar categorías del restaurante del usuario
            },
            include: {
                _count: {
                    select: { dishes: true }
                }
            }
        });

        if (!categoryWithDishes) {
            throw new Error('Categoría no encontrada o no tienes permiso para eliminarla');
        }

        if (categoryWithDishes._count.dishes > 0) {
            throw new Error('No se puede eliminar una categoría que tiene platos asociados');
        }

        // Eliminar la categoría
        await database.category.delete({
            where: { id: categoryId }
        });

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        // ✅ CORREGIDO: Preservar el mensaje de error original si existe
        if (error instanceof Error) {
            throw error; // Mantener el mensaje original del error
        }
        throw new Error('No se pudo eliminar la categoría');
    }
}

/**
 * Reordenar categorías
 */
export async function reorderCategories(categoryOrders: { id: string; order: number }[]) {
    try {
        // Actualizar el orden de múltiples categorías en una transacción
        await database.$transaction(
            categoryOrders.map(({ id, order }) =>
                database.category.update({
                    where: { id },
                    data: { order }
                })
            )
        );

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error al reordenar categorías:", error);
        throw new Error("No se pudo reordenar las categorías");
    }
}

/**
 * Obtener todas las categorías con sus platos del usuario actual (para mostrar en el menú público)
 */
export async function getAllCategoriesWithDishes(userId?: string) {
    try {
        // Si no se proporciona userId, obtener el actual
        const currentUserId = userId || await getCurrentUserId();
        if (!currentUserId) {
            throw new Error('Usuario no autenticado');
        }

        // Obtener el ID del dueño del restaurante
        const { getRestaurantOwner } = await import('./restaurantConfigService');
        const restaurantOwnerId = await getRestaurantOwner(currentUserId);

        if (!restaurantOwnerId) {
            return [];
        }

        const categories = await database.category.findMany({
            where: {
                isActive: true,
                createdById: restaurantOwnerId
            },
            include: {
                dishes: {
                    where: { status: 'ACTIVE' },
                    orderBy: { order: 'asc' },
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { order: 'asc' },
        });

        return categories;
    } catch (error) {
        console.error("Error al obtener categorías con platos:", error);
        throw new Error("No se pudieron obtener las categorías con platos");
    }
}

/**
 * Obtener todas las categorías con platos Y platos sin categoría (para menú público completo)
 */
export async function getAllCategoriesWithDishesAndUncategorized(userId?: string) {
    try {
        // Si no se proporciona userId, obtener el actual
        const currentUserId = userId || await getCurrentUserId();
        if (!currentUserId) {
            throw new Error('Usuario no autenticado');
        }

        // Obtener el ID del dueño del restaurante
        const { getRestaurantOwner } = await import('./restaurantConfigService');
        const restaurantOwnerId = await getRestaurantOwner(currentUserId);

        if (!restaurantOwnerId) {
            return [];
        }

        // Obtener categorías con platos del dueño del restaurante
        const categories = await database.category.findMany({
            where: {
                isActive: true,
                createdById: restaurantOwnerId
            },
            include: {
                dishes: {
                    where: { status: 'ACTIVE' },
                    orderBy: { order: 'asc' },
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { order: 'asc' },
        });

        // Obtener platos sin categoría del dueño del restaurante
        const uncategorizedDishes = await database.dish.findMany({
            where: {
                categoryId: null,
                status: 'ACTIVE',
                createdById: restaurantOwnerId
            },
            orderBy: { order: 'asc' },
            include: {
                category: {
                    select: { name: true }
                }
            }
        });

        // Si hay platos sin categoría, crear una categoría virtual
        const result = [...categories];
        if (uncategorizedDishes.length > 0) {
            result.push({
                id: 'uncategorized',
                name: 'Otros platos',
                description: null,
                imageUrl: null,
                order: 999, // Al final
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdById: restaurantOwnerId, // ✅ Usar restaurantOwnerId en lugar de currentUserId
                dishes: uncategorizedDishes
            });
        }

        return result;
    } catch (error) {
        console.error("Error al obtener categorías con platos y sin categoría:", error);
        throw new Error("No se pudieron obtener las categorías con platos");
    }
} 