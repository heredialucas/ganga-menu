'use server'

import { updateOrderStatus } from '@repo/data-services'
import { verifyKitchenCode } from '@repo/data-services'

export async function updateOrderStatusAction(orderId: string, status: 'ACTIVE' | 'READY' | 'CANCELLED') {
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

export async function verifyKitchenCodeAction(slug: string, code: string) {
    try {
        if (!code?.trim()) {
            return {
                success: false,
                isValid: false,
                error: 'Code is required'
            }
        }

        const isValid = await verifyKitchenCode(slug, code.trim())

        return {
            success: true,
            isValid
        }
    } catch (error) {
        console.error('Error verifying kitchen code:', error)
        return {
            success: false,
            isValid: false,
            error: 'Error verifying code'
        }
    }
} 