'use server'

import { updateOrderStatus } from '@repo/data-services'

export async function updateOrderStatusAction(orderId: string, status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED') {
    try {
        const order = await updateOrderStatus(orderId, status);
        return { success: true, order };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al actualizar estado'
        };
    }
} 