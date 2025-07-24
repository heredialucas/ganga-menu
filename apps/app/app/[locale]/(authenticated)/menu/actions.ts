'use server';

import { getCurrentUser, requirePermission } from '@repo/auth/server';
import { updateMenuConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TemplateType, AVAILABLE_TEMPLATES } from '../../menu/[slug]/types/templates';

// Crear el enum dinámicamente desde los templates disponibles
const templateEnum = z.enum(AVAILABLE_TEMPLATES.map(t => t.id) as [TemplateType, ...TemplateType[]]);

const menuConfigSchema = z.object({
    slug: z.string().min(3, 'El enlace debe tener al menos 3 caracteres'),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'El color debe ser un código hexadecimal válido (ej: #16a34a)'),
    template: templateEnum,
});

export async function saveMenuConfig(prevState: any, formData: FormData) {
    try {
        // Verificar permisos antes de proceder
        await requirePermission('menu:edit');

        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const data = Object.fromEntries(formData.entries());

        const validatedData = menuConfigSchema.safeParse(data);

        if (!validatedData.success) {
            console.error('Validation errors:', JSON.stringify(validatedData.error.flatten(), null, 2));
            return {
                success: false,
                message: 'Error de validación. Revisa los campos marcados.',
                errors: validatedData.error.flatten().fieldErrors,
            };
        }

        // Usar la función específica para actualizar solo los campos del menú
        await updateMenuConfig(validatedData.data, user.id);

        revalidatePath('/(authenticated)/menu');

        return {
            success: true,
            message: 'Configuración del menú guardada con éxito',
        };

    } catch (error: any) {
        console.error('Error al guardar la configuración del menú:', error.message);
        return {
            success: false,
            message: error.message || 'Error al guardar la configuración del menú',
            errors: undefined,
        };
    }
} 