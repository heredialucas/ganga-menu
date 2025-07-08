'use server'

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import { getCurrentUserId } from './authService';
import { uploadR2Image, deleteR2Image } from './uploadR2Image';
import { z } from 'zod';

const restaurantConfigSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    hours: z.string().optional().refine((val) => {
        if (!val) return true;
        try {
            JSON.parse(val);
            return true;
        } catch (e) {
            return false;
        }
    }, { message: "Formato de horarios inválido." }),
    logoUrl: z.string().url('URL de logo inválida').optional().or(z.literal('')),
    slug: z.string().min(3, 'El enlace debe tener al menos 3 caracteres').optional(),
    themeColor: z.string().optional(),
});

export interface RestaurantConfigData {
    id: string;
    name: string;
    description?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    hours?: string | null;
    logoUrl?: string | null;
    slug: string;
    themeColor: string;
    waiterCode: string;
    isActive: boolean;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * DEPRECATED: Use Zod schema from this service.
 */
export interface RestaurantConfigFormData {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
    logoUrl?: string;
    slug?: string;
    themeColor?: string;
    waiterCode?: string;
}

/**
 * Obtener la configuración del restaurante del usuario actual
 */
export async function getRestaurantConfig(userId?: string): Promise<RestaurantConfigData | null> {
    try {
        // Si no se proporciona userId, obtener el actual
        const currentUserId = userId || await getCurrentUserId();
        if (!currentUserId) {
            throw new Error('Usuario no autenticado');
        }

        const config = await database.restaurantConfig.findFirst({
            where: {
                isActive: true,
                createdById: currentUserId
            },
            orderBy: { createdAt: 'desc' }
        });

        return config;
    } catch (error) {
        console.error('Error al obtener configuración del restaurante:', error);
        throw new Error('No se pudo obtener la configuración del restaurante');
    }
}

/**
 * Crear o actualizar la configuración del restaurante.
 * NO maneja la lógica de subida de imágenes; eso debe hacerse antes.
 */
export async function upsertRestaurantConfig(
    data: z.infer<typeof restaurantConfigSchema>,
    createdById: string,
    existingId?: string
) {
    try {
        // Validar que el slug sea único (solo si se está cambiando)
        const slugToUse = data.slug || 'mi-restaurante';
        if (!existingId || (existingId && data.slug)) {
            const existingSlug = await database.restaurantConfig.findFirst({
                where: {
                    slug: slugToUse,
                    isActive: true,
                    id: { not: existingId }
                }
            });
            if (existingSlug) {
                throw new Error('Ya existe un restaurante con este enlace personalizado.');
            }
        }

        const dbData = { ...data, slug: slugToUse };

        let config;
        if (existingId) {
            config = await database.restaurantConfig.update({
                where: { id: existingId },
                data: dbData,
            });
        } else {
            config = await database.restaurantConfig.create({
                data: {
                    ...dbData,
                    createdById,
                },
            });
        }

        revalidatePath('/admin/dashboard');
        revalidatePath('/es/menu');

        return config;
    } catch (error) {
        console.error('Error al guardar configuración del restaurante:', error);
        throw error;
    }
}


/**
 * Obtener la configuración pública del restaurante por slug
 */
export async function getRestaurantConfigBySlug(slug: string): Promise<RestaurantConfigData | null> {
    try {
        const config = await database.restaurantConfig.findUnique({
            where: {
                slug,
                isActive: true
            }
        });

        return config;
    } catch (error) {
        console.error('Error al obtener configuración por slug:', error);
        return null;
    }
} 