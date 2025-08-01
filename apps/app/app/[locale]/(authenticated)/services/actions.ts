'use server';

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import { getRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { requirePermission } from '@repo/auth/server-permissions';
import { z } from 'zod';
import type { Dictionary } from '@repo/internationalization';

const updateWaiterCodeSchema = z.object({
    code: z.string().min(4, 'El código debe tener al menos 4 caracteres.'),
});

const updateKitchenCodeSchema = z.object({
    code: z.string().min(4, 'El código debe tener al menos 4 caracteres.'),
});

export async function updateWaiterCode(formData: FormData, dictionary?: Dictionary) {
    try {
        // Verificar permisos antes de proceder
        await requirePermission('services:edit');

        const config = await getRestaurantConfig();
        if (!config) {
            throw new Error(dictionary?.app?.services?.setup?.notFound || 'Configuración de restaurante no encontrada.');
        }

        const code = formData.get('code') as string;
        const validation = updateWaiterCodeSchema.safeParse({ code });

        if (!validation.success) {
            return {
                success: false,
                message: validation.error.errors[0].message,
            };
        }

        await database.restaurantConfig.update({
            where: { id: config.id },
            data: { waiterCode: validation.data.code },
        });

        revalidatePath('/services');

        return {
            success: true,
            message: dictionary?.app?.services?.shared?.codeSaved || 'Código de mozo actualizado con éxito.',
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : (dictionary?.app?.services?.shared?.codeError || 'Ocurrió un error inesperado.'),
        };
    }
}

export async function updateKitchenCode(formData: FormData, dictionary?: Dictionary) {
    try {
        // Verificar permisos antes de proceder
        await requirePermission('services:edit');

        const config = await getRestaurantConfig();
        if (!config) {
            throw new Error(dictionary?.app?.services?.setup?.notFound || 'Configuración de restaurante no encontrada.');
        }

        const code = formData.get('code') as string;
        const validation = updateKitchenCodeSchema.safeParse({ code });

        if (!validation.success) {
            return {
                success: false,
                message: validation.error.errors[0].message,
            };
        }

        await database.restaurantConfig.update({
            where: { id: config.id },
            data: { kitchenCode: validation.data.code },
        });

        revalidatePath('/services');

        return {
            success: true,
            message: dictionary?.app?.services?.shared?.codeSaved || 'Código de cocina actualizado con éxito.',
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : (dictionary?.app?.services?.shared?.codeError || 'Ocurrió un error inesperado.'),
        };
    }
} 