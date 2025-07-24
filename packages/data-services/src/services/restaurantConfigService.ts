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
    template: string;
    waiterCode: string;
    kitchenCode: string;
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
 * Obtener el restaurante padre de un usuario (el restaurante que debe usar)
 */
export async function getRestaurantOwner(userId?: string): Promise<string | null> {
    try {
        const currentUserId = userId || await getCurrentUserId();
        if (!currentUserId) {
            throw new Error('Usuario no autenticado');
        }

        const user = await database.user.findUnique({
            where: { id: currentUserId },
            select: {
                restaurantOwnerId: true,
                id: true
            }
        });

        if (!user) {
            return null;
        }

        // Si tiene un restaurante padre, usar ese. Si no, usar su propio ID
        return user.restaurantOwnerId || user.id;
    } catch (error) {
        console.error('Error al obtener el dueño del restaurante:', error);
        throw new Error('No se pudo obtener el dueño del restaurante');
    }
}

/**
 * Obtener la configuración del restaurante del usuario actual
 */
export async function getRestaurantConfig(userId?: string): Promise<RestaurantConfigData | null> {
    try {
        // Obtener el ID del dueño del restaurante (padre o propio)
        const restaurantOwnerId = await getRestaurantOwner(userId);
        if (!restaurantOwnerId) {
            return null;
        }

        const config = await database.restaurantConfig.findFirst({
            where: {
                isActive: true,
                ownerId: restaurantOwnerId
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                phone: true,
                email: true,
                hours: true,
                logoUrl: true,
                slug: true,
                themeColor: true,
                template: true,
                waiterCode: true,
                kitchenCode: true,
                isActive: true,
                createdById: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return config;
    } catch (error) {
        console.error('Error al obtener configuración del restaurante:', error);
        throw new Error('No se pudo obtener la configuración del restaurante');
    }
}

/**
 * Generar un slug único basado en el nombre del restaurante
 */
async function generateUniqueSlug(baseName: string, excludeId?: string): Promise<string> {
    // Convertir el nombre a slug (minúsculas, sin acentos, solo letras, números y guiones)
    let slug = baseName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
        .replace(/\s+/g, '-') // Espacios a guiones
        .replace(/-+/g, '-') // Múltiples guiones a uno solo
        .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
        .trim();

    // Si el slug está vacío o es muy corto, usar un valor por defecto
    if (!slug || slug.length < 3) {
        slug = 'restaurante';
    }

    // Verificar si el slug ya existe
    let finalSlug = slug;
    let counter = 1;

    while (true) {
        const existing = await database.restaurantConfig.findFirst({
            where: {
                slug: finalSlug,
                isActive: true,
                ...(excludeId && { id: { not: excludeId } })
            }
        });

        if (!existing) {
            break;
        }

        // Si el slug base ya tiene un número al final, incrementarlo
        const match = finalSlug.match(/^(.+)-(\d+)$/);
        if (match) {
            const baseSlug = match[1];
            const currentNumber = parseInt(match[2]);
            finalSlug = `${baseSlug}-${currentNumber + 1}`;
        } else {
            finalSlug = `${slug}-${counter}`;
            counter++;
        }

        // Evitar bucles infinitos
        if (counter > 100) {
            // Si llegamos aquí, usar timestamp como fallback
            finalSlug = `${slug}-${Date.now()}`;
            break;
        }
    }

    return finalSlug;
}

/**
 * Crear o actualizar la configuración del restaurante.
 * NO maneja la lógica de subida de imágenes; eso debe hacerse antes.
 * NO maneja slug y themeColor; esos se manejan desde updateMenuConfig.
 */
export async function upsertRestaurantConfig(
    data: z.infer<typeof restaurantConfigSchema>,
    createdById: string,
    existingId?: string
) {
    try {
        let config;
        if (existingId) {
            config = await database.restaurantConfig.update({
                where: { id: existingId },
                data: data,
            });
        } else {
            // Generar un slug único basado en el nombre del restaurante
            const uniqueSlug = await generateUniqueSlug(data.name);

            config = await database.restaurantConfig.create({
                data: {
                    ...data,
                    slug: uniqueSlug,
                    themeColor: '#16a34a', // Valor por defecto para nuevas configuraciones
                    createdById,
                    ownerId: createdById, // El creador es también el dueño
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
 * Actualizar solo los campos específicos del menú (slug y themeColor)
 */
export async function updateMenuConfig(
    data: { slug: string; themeColor: string; template: string },
    userId: string
) {
    try {
        const existingConfig = await getRestaurantConfig(userId);
        if (!existingConfig) {
            throw new Error('No se encontró la configuración del restaurante');
        }

        // Validar que el slug sea único (solo si se está cambiando)
        if (data.slug !== existingConfig.slug) {
            const existingSlug = await database.restaurantConfig.findFirst({
                where: {
                    slug: data.slug,
                    isActive: true,
                    id: { not: existingConfig.id }
                }
            });
            if (existingSlug) {
                throw new Error('Ya existe un restaurante con este enlace personalizado.');
            }
        }

        const config = await database.restaurantConfig.update({
            where: { id: existingConfig.id },
            data: {
                slug: data.slug,
                themeColor: data.themeColor,
                template: data.template,
            },
        });

        revalidatePath('/es/menu');

        return config;
    } catch (error) {
        console.error('Error al actualizar configuración del menú:', error);
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