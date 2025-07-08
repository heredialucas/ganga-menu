'use server'

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import { deleteR2Image, uploadR2Image } from './uploadR2Image';
import { getCurrentUserId } from './authService';

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

        const dishes = await database.dish.findMany({
            where: { createdById: currentUserId },
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
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("Usuario no autenticado");
        }

        const existingDish = await database.dish.findFirst({
            where: {
                id: dishId,
                createdById: userId
            },
            select: { imageUrl: true }
        });

        if (!existingDish) {
            throw new Error("Plato no encontrado o no tienes permiso para editarlo.");
        }

        let imageUrl = data.imageUrl;

        // Si se sube un nuevo archivo
        if (data.imageFile) {
            // Borrar el antiguo si existe
            if (existingDish.imageUrl) {
                try {
                    const oldKey = existingDish.imageUrl.split(process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN!)[1]?.substring(1);
                    if (oldKey) await deleteR2Image(oldKey);
                } catch (imageError) {
                    console.error("Error al eliminar la imagen antigua de R2:", imageError);
                }
            }
            // Subir el nuevo
            const { url } = await uploadR2Image({
                file: data.imageFile,
                name: data.name,
                folder: 'dishes',
                alt: data.name,
                description: data.description,
                url: '',
            });
            imageUrl = url;
        } else if (!data.imageUrl && existingDish.imageUrl) {
            // Si no se proporciona nueva URL ni archivo, y existía una, borrarla
            try {
                const oldKey = existingDish.imageUrl.split(process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN!)[1]?.substring(1);
                if (oldKey) await deleteR2Image(oldKey);
            } catch (imageError) {
                console.error("Error al eliminar la imagen antigua de R2:", imageError);
            }
        }

        // Actualizar plato en la base de datos
        const dish = await database.dish.update({
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
        return dish;
    } catch (error) {
        console.error("Error al actualizar plato:", error);
        throw new Error("No se pudo actualizar el plato");
    }
}

/**
 * Eliminar un plato
 */
export async function deleteDish(dishId: string) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("Usuario no autenticado");
        }

        // Primero obtener el plato para ver si tiene imagen y si pertenece al usuario
        const dish = await database.dish.findFirst({
            where: {
                id: dishId,
                createdById: userId
            },
            select: { imageUrl: true }
        });

        if (!dish) {
            throw new Error("Plato no encontrado o no tienes permiso para eliminarlo.");
        }

        // Eliminar plato de la base de datos
        await database.dish.delete({
            where: { id: dishId },
        });

        // Si el plato tenía imagen, eliminarla del bucket R2
        if (dish?.imageUrl) {
            try {
                // Extraer el key de la URL (la parte después del dominio)
                const key = dish.imageUrl.split(process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN!)[1]?.substring(1);
                if (key) await deleteR2Image(key);
            } catch (imageError) {
                console.error("Error al eliminar imagen de R2:", imageError);
                // No lanzar error, el plato ya se eliminó
            }
        }

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar plato:", error);
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