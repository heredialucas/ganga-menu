'use server';

import { getCurrentUser, requirePermission } from '@repo/auth/server';
import { saveRestaurantDesign as saveDesign } from '@repo/data-services/src/services/restaurantDesignService';
import { getRestaurantConfig, upsertRestaurantConfig } from '@repo/data-services/src/services/restaurantConfigService';
import { uploadR2Image, deleteR2Image } from '@repo/data-services/src/services/uploadR2Image';
import { getTablesByRestaurant } from '@repo/data-services/src/services/tableService';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const restaurantConfigSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    hours: z.string().optional().refine((val) => {
        if (!val) return true;
        try { JSON.parse(val); return true; }
        catch (e) { return false; }
    }, { message: "Formato de horarios inválido." }),
    logoUrl: z.string().url('URL de logo inválida').optional().or(z.literal('')),
});

export async function saveRestaurantConfig(prevState: any, formData: FormData) {
    try {
        // Verificar permisos antes de proceder
        await requirePermission('restaurant:edit');

        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const data = Object.fromEntries(formData.entries());
        const logoFile = data.logoUrlFile as File;
        let finalLogoUrl = data.logoUrl as string;

        const existingConfig = await getRestaurantConfig(user.id);

        if (logoFile && logoFile.size > 0) {
            if (existingConfig?.logoUrl && process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN) {
                try {
                    const oldKey = existingConfig.logoUrl.split(process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN)[1]?.substring(1);
                    if (oldKey) await deleteR2Image(oldKey);
                } catch (e) { console.error("No se pudo borrar el logo antiguo:", e); }
            }
            const { url } = await uploadR2Image({
                file: logoFile,
                name: data.name as string || 'logo',
                folder: 'logos',
                url: '',
                description: 'Logo del restaurante',
                alt: 'Logo'
            });
            finalLogoUrl = url;
        } else if (!finalLogoUrl && existingConfig?.logoUrl) {
            try {
                const oldKey = existingConfig.logoUrl.split(process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN!)[1]?.substring(1);
                if (oldKey) await deleteR2Image(oldKey);
            } catch (e) { console.error("No se pudo borrar el logo antiguo:", e); }
        }

        const dataToValidate = { ...data, logoUrl: finalLogoUrl };
        delete (dataToValidate as any).logoUrlFile;

        const validatedData = restaurantConfigSchema.safeParse(dataToValidate);

        if (!validatedData.success) {
            console.error('Validation errors:', JSON.stringify(validatedData.error.flatten(), null, 2));
            return {
                success: false,
                message: 'Error de validación. Revisa los campos marcados.',
                errors: validatedData.error.flatten().fieldErrors,
            };
        }

        // Llamada correcta al servicio con los datos validados
        await upsertRestaurantConfig(validatedData.data, user.id, existingConfig?.id);

        revalidatePath('/(authenticated)/restaurant');

        return {
            success: true,
            message: 'Configuración guardada con éxito',
        };

    } catch (error: any) {
        console.error('Error al guardar la configuración:', error.message);
        return {
            success: false,
            message: error.message || 'Error al guardar la configuración',
            errors: undefined,
        };
    }
}

export async function saveRestaurantDesign(prevState: any, formData: FormData) {
    // Verificar permisos antes de proceder
    await requirePermission('restaurant:edit');

    // The `saveDesign` service function handles authentication, data parsing,
    // database operations, and revalidation. This wrapper simply passes the arguments through.
    return saveDesign(prevState, formData);
}

export async function getRestaurantTables() {
    try {
        await requirePermission('restaurant:view');
        const user = await getCurrentUser();

        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        const restaurantConfig = await getRestaurantConfig(user.id);

        if (!restaurantConfig) {
            return { success: false, message: 'Restaurante no configurado', tables: [] };
        }

        const tables = await getTablesByRestaurant(restaurantConfig.id);

        return {
            success: true,
            message: 'Mesas obtenidas correctamente',
            tables
        };
    } catch (error) {
        console.error('Error obteniendo mesas:', error);
        return {
            success: false,
            message: 'Error al obtener las mesas',
            tables: []
        };
    }
} 