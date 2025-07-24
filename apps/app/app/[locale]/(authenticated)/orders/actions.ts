'use server';

import { deleteOrder } from '@repo/data-services';
import { requirePermission } from '@repo/auth/server-permissions';
import { revalidatePath } from 'next/cache';

export async function deleteOrderAction(orderId: string) {
    try {
        // Verificar permisos
        await requirePermission('orders:edit');

        // Eliminar la orden
        await deleteOrder(orderId);

        // Revalidar la página de órdenes
        revalidatePath('/orders');

        return { success: true };
    } catch (error) {
        console.error('Error eliminando orden:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al eliminar la orden'
        };
    }
} 