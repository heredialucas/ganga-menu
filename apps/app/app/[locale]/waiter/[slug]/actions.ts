'use server'

import { createOrder, verifyWaiterCode, getOrdersByRestaurant, updateOrderStatus } from '@repo/data-services'

export interface CreateOrderAction {
    tableNumber: string;
    waiterName?: string;
    notes?: string;
    restaurantConfigId: string;
    items: {
        dishId: string;
        quantity: number;
        notes?: string;
    }[];
}

export async function createOrderAction(data: CreateOrderAction) {
    try {
        const order = await createOrder(data);
        return { success: true, order };
    } catch (error) {
        console.error('Error creating order:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

export async function getRestaurantOrdersAction(restaurantConfigId: string) {
    try {
        const orders = await getOrdersByRestaurant(restaurantConfigId);
        return { success: true, orders };
    } catch (error) {
        console.error('Error getting orders:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener órdenes'
        };
    }
}

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

export async function verifyWaiterCodeAction(slug: string, code: string) {
    try {
        if (!code?.trim()) {
            return {
                success: false,
                isValid: false,
                error: 'Code is required'
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
            error: 'Error verifying code'
        }
    }
}