'use server';

import { getCurrentUser } from '@repo/auth/server';
import { saveRestaurantDesign as saveDesign, getRestaurantDesignByConfigId } from '@repo/data-services/src/services/restaurantDesignService';
import { upsertRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Schema para la configuración del restaurante
const restaurantConfigSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    hours: z.string().optional(),
    logoUrl: z.string().url('URL de logo inválida').optional().or(z.literal('')),
    slug: z.string().min(3, 'El enlace debe tener al menos 3 caracteres').optional(),
    themeColor: z.string().optional(),
    waiterCode: z.string().optional(),
});

// Schema para el diseño del restaurante
const restaurantDesignSchema = z.object({
    restaurantConfigId: z.string(),
    elements: z.string(),
    canvasWidth: z.string(),
    canvasHeight: z.string(),
});

export async function saveRestaurantConfig(prevState: any, formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const rawData = Object.fromEntries(formData.entries());
        const validatedData = restaurantConfigSchema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: 'Error de validación',
                errors: validatedData.error.flatten().fieldErrors,
            };
        }

        await upsertRestaurantConfig(validatedData.data, user.id);

        revalidatePath('/(authenticated)/restaurant');

        return {
            success: true,
            message: 'Configuración guardada con éxito',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Error al guardar la configuración',
        };
    }
}

export async function saveRestaurantDesign(prevState: any, formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Not authenticated');
        }

        const rawData = Object.fromEntries(formData.entries());
        const validatedData = restaurantDesignSchema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: 'Validation Error',
                errors: validatedData.error.flatten().fieldErrors,
            };
        }

        const { restaurantConfigId, elements, canvasWidth, canvasHeight } = validatedData.data;

        await saveDesign(
            restaurantConfigId,
            user.id,
            JSON.parse(elements),
            parseInt(canvasWidth, 10),
            parseInt(canvasHeight, 10)
        );

        revalidatePath('/(authenticated)/restaurant');

        return {
            success: true,
            message: 'Diseño guardado con éxito!',
        };

    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Error al guardar el diseño.',
        };
    }
} 