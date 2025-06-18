'use server'

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import { getCurrentUserId } from './authService';

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
 * Crear o actualizar la configuración del restaurante
 */
export async function upsertRestaurantConfig(data: RestaurantConfigFormData, createdById: string) {
    try {
        // Buscar si ya existe una configuración para ESTE usuario específico
        const existingConfig = await database.restaurantConfig.findFirst({
            where: {
                isActive: true,
                createdById: createdById  // ✅ FILTRAR POR USUARIO ESPECÍFICO
            }
        });

        // Validar que el slug sea único (solo si se está cambiando)
        const slugToUse = data.slug || (existingConfig?.slug) || 'mi-restaurante';
        if (slugToUse !== existingConfig?.slug) {
            const existingSlug = await database.restaurantConfig.findFirst({
                where: {
                    slug: slugToUse,
                    isActive: true,
                    id: { not: existingConfig?.id } // Excluir la configuración actual si existe
                }
            });

            if (existingSlug) {
                throw new Error('Ya existe un restaurante con este enlace personalizado. Por favor elige otro nombre para tu enlace.');
            }
        }

        let config;

        if (existingConfig) {
            // Actualizar configuración existente del usuario
            config = await database.restaurantConfig.update({
                where: { id: existingConfig.id },
                data: {
                    name: data.name,
                    description: data.description,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    hours: data.hours,
                    logoUrl: data.logoUrl,
                    slug: slugToUse,
                    themeColor: data.themeColor || existingConfig.themeColor,
                    waiterCode: data.waiterCode || existingConfig.waiterCode,
                }
            });
        } else {
            // Crear nueva configuración para el usuario
            config = await database.restaurantConfig.create({
                data: {
                    name: data.name,
                    description: data.description,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    hours: data.hours,
                    logoUrl: data.logoUrl,
                    slug: slugToUse,
                    themeColor: data.themeColor || 'green',
                    waiterCode: data.waiterCode || '1234',
                    createdById,
                }
            });
        }

        revalidatePath('/admin/dashboard');
        revalidatePath('/es/menu');

        return config;
    } catch (error) {
        console.error('Error al guardar configuración del restaurante:', error);
        // Re-lanzar el error original para mantener el mensaje específico
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