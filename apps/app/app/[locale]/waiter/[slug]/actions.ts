'use server'

import { createOrder, verifyWaiterCode, getOrdersByRestaurant, updateOrderStatus, markTableAsPaid } from '@repo/data-services'
import type { Dictionary } from '@repo/internationalization';

export interface CreateOrderAction {
    tableId: string;
    waiterName?: string;
    notes?: string;
    restaurantConfigId: string;
    items: {
        dishId: string;
        quantity: number;
        notes?: string;
    }[];
}

export async function createOrderAction(data: CreateOrderAction, dictionary?: Dictionary) {
    try {
        const order = await createOrder(data);
        return { success: true, order };
    } catch (error) {
        console.error('Error creating order:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : (dictionary?.app?.waiter?.order?.error || 'Error desconocido')
        };
    }
}

export async function getRestaurantOrdersAction(restaurantConfigId: string, dictionary?: Dictionary) {
    try {
        const orders = await getOrdersByRestaurant(restaurantConfigId);
        return { success: true, orders };
    } catch (error) {
        console.error('Error getting orders:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : (dictionary?.app?.waiter?.order?.error || 'Error al obtener órdenes')
        };
    }
}

export async function updateOrderStatusAction(orderId: string, status: 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID', dictionary?: Dictionary) {
    try {
        const order = await updateOrderStatus(orderId, status);
        return { success: true, order };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : (dictionary?.app?.waiter?.order?.error || 'Error al actualizar estado')
        };
    }
}

export async function verifyWaiterCodeAction(slug: string, code: string, dictionary?: Dictionary) {
    try {
        if (!code?.trim()) {
            return {
                success: false,
                isValid: false,
                error: dictionary?.app?.waiter?.auth?.codeRequired || 'Code is required'
            }
        }

        const isValid = await verifyWaiterCode(slug, code.trim())

        return {
            success: true,
            isValid
        }
    } catch (error) {
        console.error('Error verifying waiter code:', error)
        return {
            success: false,
            isValid: false,
            error: dictionary?.app?.waiter?.auth?.invalidCode || 'Error verifying code'
        }
    }
}

export async function markTableAsPaidAction(tableId: string, dictionary?: Dictionary) {
    try {
        const orders = await markTableAsPaid(tableId);
        return {
            success: true,
            orders,
            message: dictionary?.app?.waiter?.order?.tableReleased || `Mesa marcada como pagada. ${orders.length} órdenes actualizadas.`
        };
    } catch (error) {
        console.error('Error marking table as paid:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : (dictionary?.app?.waiter?.order?.error || 'Error al marcar mesa como pagada')
        };
    }
}