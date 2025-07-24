'use server'

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import { deleteR2Image, uploadR2Image } from './uploadR2Image';
import { getCurrentUserId } from './authService';
import { requirePermission } from '@repo/auth/server-permissions';

export interface DishData {
    id: string;
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number | null;
    imageUrl?: string;
    status: 'ACTIVE' | 'INACTIVE';
    order: number;
    categoryId?: string;
    categoryName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DishFormData {
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number | null;
    imageUrl?: string;
    imageFile?: File;
    status?: 'ACTIVE' | 'INACTIVE';
    order?: number;
    categoryId?: string;
}

/**
 * Crear un nuevo plato
 */
export async function createDish(data: DishFormData, createdById: string) {
    try {
        // Verificar permiso para editar menú
        await requirePermission('menu:edit');

        let imageUrl = data.imageUrl;

        if (data.imageFile) {
            const { url } = await uploadR2Image({
                file: data.imageFile,
                name: data.name,
                folder: 'dishes',
                alt: data.name,
                description: data.description,
                url: '',
            });
            imageUrl = url;
        }

        // Crear el plato
        const dish = await database.dish.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                promotionalPrice: data.promotionalPrice,
                imageUrl: imageUrl,
                status: data.status || 'ACTIVE',
                order: data.order || 0,
                categoryId: data.categoryId || null,
                createdById,
            },
            include: {
                category: {
                    select: { name: true }
                }
            }
        });

        revalidatePath('/admin/dashboard');
        return dish;
    } catch (error) {
        console.error('Error al crear plato:', error);
        // ✅ CORREGIDO: Preservar el mensaje de error original si existe
        if (error instanceof Error) {
            throw error; // Mantener el mensaje original del error
        }
        throw new Error('No se pudo crear el plato');
    }
}

/**
 * Obtener todos los platos del usuario actual (para admin)
 */
export async function getAllDishes(userId?: string) {
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

        const dishes = await database.dish.findMany({
            where: { createdById: restaurantOwnerId }, // ✅ Usar restaurantOwnerId en lugar de currentUserId
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: [
                { categoryId: 'asc' },
                { order: 'asc' }
            ],
        });

        return dishes.map(dish => ({
            id: dish.id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            promotionalPrice: dish.promotionalPrice,
            imageUrl: dish.imageUrl,
            status: dish.status,
            order: dish.order,
            categoryId: dish.categoryId,
            categoryName: dish.category?.name,
            createdAt: dish.createdAt,
            updatedAt: dish.updatedAt,
        })) as DishData[];
    } catch (error) {
        console.error("Error al obtener platos:", error);
        throw new Error("No se pudieron obtener los platos");
    }
}

/**
 * Obtener todos los platos del usuario actual con datos completos (para panel de admin)
 * Esta función devuelve los datos completos incluyendo createdById para compatibilidad con componentes
 */
export async function getAllDishesWithFullData(userId?: string) {
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

        const dishes = await database.dish.findMany({
            where: { createdById: restaurantOwnerId },
            include: {
                category: true
            },
            orderBy: [
                { categoryId: 'asc' },
                { order: 'asc' }
            ],
        });

        return dishes;
    } catch (error) {
        console.error("Error al obtener platos con datos completos:", error);
        throw new Error("No se pudieron obtener los platos");
    }
}

/**
 * Obtener platos activos por categoría (para público)
 */
export async function getDishesByCategory(categoryId: string) {
    try {
        const dishes = await database.dish.findMany({
            where: {
                categoryId,
                status: 'ACTIVE'
            },
            orderBy: { order: 'asc' },
        });

        return dishes;
    } catch (error) {
        console.error("Error al obtener platos por categoría:", error);
        throw new Error("No se pudieron obtener los platos");
    }
}

/**
 * Obtener un plato por ID
 */
export async function getDishById(dishId: string) {
    try {
        const dish = await database.dish.findUnique({
            where: { id: dishId },
            include: {
                category: {
                    select: { name: true }
                }
            }
        });

        return dish;
    } catch (error) {
        console.error('Error al obtener plato por ID:', error);
        throw new Error('No se pudo obtener el plato');
    }
}

/**
 * Actualizar un plato existente
 */
export async function updateDish(dishId: string, data: DishFormData) {
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

        // Verificar que el plato pertenece al restaurante padre
        const existingDish = await database.dish.findFirst({
            where: {
                id: dishId,
                createdById: restaurantOwnerId, // ✅ Usar restaurantOwnerId en lugar de userId
            }
        });

        if (!existingDish) {
            throw new Error("Plato no encontrado o no tienes permiso para editarlo.");
        }

        let imageUrl = data.imageUrl || existingDish.imageUrl;

        if (data.imageFile) {
            // Eliminar imagen anterior si existe
            if (existingDish.imageUrl) {
                await deleteR2Image(existingDish.imageUrl);
            }

            const { url } = await uploadR2Image({
                file: data.imageFile,
                name: data.name,
                folder: 'dishes',
                alt: data.name,
                description: data.description,
                url: '',
            });
            imageUrl = url;
        }

        // Actualizar el plato
        const updatedDish = await database.dish.update({
            where: { id: dishId },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                promotionalPrice: data.promotionalPrice,
                imageUrl: imageUrl,
                status: data.status,
                order: data.order,
                categoryId: data.categoryId || null,
            },
            include: {
                category: {
                    select: { name: true }
                }
            }
        });

        revalidatePath('/admin/dashboard');
        return updatedDish;
    } catch (error) {
        console.error("Error al actualizar plato:", error);
        // ✅ CORREGIDO: Preservar el mensaje de error original si existe
        if (error instanceof Error) {
            throw error; // Mantener el mensaje original del error
        }
        throw new Error("No se pudo actualizar el plato");
    }
}

/**
 * Eliminar un plato
 */
export async function deleteDish(dishId: string) {
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

        // Verificar que el plato pertenece al restaurante padre
        const dishToDelete = await database.dish.findFirst({
            where: {
                id: dishId,
                createdById: restaurantOwnerId, // ✅ Usar restaurantOwnerId en lugar de userId
            }
        });

        if (!dishToDelete) {
            throw new Error("Plato no encontrado o no tienes permiso para eliminarlo.");
        }

        // Eliminar imagen si existe
        if (dishToDelete.imageUrl) {
            await deleteR2Image(dishToDelete.imageUrl);
        }

        // Eliminar plato de la base de datos
        await database.dish.delete({
            where: { id: dishId }
        });

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar plato:", error);
        // ✅ CORREGIDO: Preservar el mensaje de error original si existe
        if (error instanceof Error) {
            throw error; // Mantener el mensaje original del error
        }
        throw new Error("No se pudo eliminar el plato");
    }
}

/**
 * Reordenar platos dentro de una categoría
 */
export async function reorderDishes(dishOrders: { id: string; order: number }[]) {
    try {
        // Actualizar el orden de múltiples platos en una transacción
        await database.$transaction(
            dishOrders.map(({ id, order }) =>
                database.dish.update({
                    where: { id },
                    data: { order }
                })
            )
        );

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error al reordenar platos:", error);
        throw new Error("No se pudo reordenar los platos");
    }
} 