'use server'

import { updateOrderStatus } from '@repo/data-services'
import { verifyKitchenCode } from '@repo/data-services'
import type { Dictionary } from '@repo/internationalization';

export async function updateOrderStatusAction(orderId: string, status: 'ACTIVE' | 'READY' | 'CANCELLED', dictionary?: Dictionary) {
    try {
        const order = await updateOrderStatus(orderId, status);
        return { success: true, order };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : (dictionary?.app?.kitchen?.interface?.error || 'Error al actualizar estado')
        };
    }
}

export async function verifyKitchenCodeAction(slug: string, code: string, dictionary?: Dictionary) {
    try {
        if (!code?.trim()) {
            return {
                success: false,
                isValid: false,
                error: dictionary?.app?.kitchen?.auth?.codeRequired || 'Code is required'
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
            error: dictionary?.app?.kitchen?.auth?.invalidCode || 'Error verifying code'
        }
    }
} 