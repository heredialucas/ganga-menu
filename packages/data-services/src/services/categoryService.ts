'use server'

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import { getCurrentUserId } from './authService';

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
        // Verificar si ya existe una categoría con ese nombre
        const existingCategory = await database.category.findUnique({
            where: { name: data.name },
        });

        if (existingCategory) {
            throw new Error('Ya existe una categoría con este nombre');
        }

        // Crear la categoría
        const category = await database.category.create({
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                order: data.order || 0,
                isActive: data.isActive ?? true,
                createdById,
            },
        });

        revalidatePath('/admin/dashboard');
        return category;
    } catch (error) {
        console.error('Error al crear categoría:', error);
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

        const categories = await database.category.findMany({
            where: { createdById: currentUserId },
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

        // Verificar que la categoría pertenece al usuario
        const categoryToUpdate = await database.category.findFirst({
            where: {
                id: categoryId,
                createdById: userId,
            }
        });

        if (!categoryToUpdate) {
            throw new Error("Categoría no encontrada o no tienes permiso para editarla.");
        }

        // Verificar si existe otra categoría con el mismo nombre (excluyendo la actual)
        if (data.name) {
            const existingCategory = await database.category.findFirst({
                where: {
                    name: data.name,
                    id: { not: categoryId }
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
        throw new Error("No se pudo actualizar la categoría");
    }
}

/**
 * Eliminar una categoría
 */
export async function deleteCategory(categoryId: string) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("Usuario no autenticado");
        }

        // Verificar que la categoría pertenece al usuario
        const categoryToDelete = await database.category.findFirst({
            where: {
                id: categoryId,
                createdById: userId,
            }
        });

        if (!categoryToDelete) {
            throw new Error("Categoría no encontrada o no tienes permiso para eliminarla.");
        }

        // Verificar si la categoría tiene platos asociados
        const dishCount = await database.dish.count({
            where: { categoryId }
        });

        if (dishCount > 0) {
            throw new Error('No se puede eliminar una categoría que tiene platos asociados');
        }

        // Eliminar categoría de la base de datos
        await database.category.delete({
            where: { id: categoryId },
        });

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar categoría:", error);
        throw new Error("No se pudo eliminar la categoría");
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

        const categories = await database.category.findMany({
            where: {
                isActive: true,
                createdById: currentUserId
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

        // Obtener categorías con platos
        const categories = await database.category.findMany({
            where: {
                isActive: true,
                createdById: currentUserId
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

        // Obtener platos sin categoría
        const uncategorizedDishes = await database.dish.findMany({
            where: {
                categoryId: null,
                status: 'ACTIVE',
                createdById: currentUserId
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
                createdById: currentUserId,
                dishes: uncategorizedDishes
            });
        }

        return result;
    } catch (error) {
        console.error("Error al obtener categorías con platos y sin categoría:", error);
        throw new Error("No se pudieron obtener las categorías con platos");
    }
} 