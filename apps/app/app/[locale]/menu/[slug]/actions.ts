'use server'

import { createOrder, getOrdersByRestaurant } from '@repo/data-services'
import type { Dictionary } from '@repo/internationalization';

export interface CreateOrderFromMenuAction {
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

export async function createOrderFromMenuAction(data: CreateOrderFromMenuAction, dictionary?: Dictionary) {
    try {
        const order = await createOrder(data);
        return { success: true, order };
    } catch (error) {
        console.error('Error creating order from menu:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : (dictionary?.app?.menu?.order?.error || 'Error desconocido')
        };
    }
}

export async function getTableOrdersAction(tableId: string, restaurantConfigId: string, dictionary?: Dictionary) {
    try {
        const allOrders = await getOrdersByRestaurant(restaurantConfigId);
        const tableOrders = allOrders.filter(order =>
            order.table?.id === tableId &&
            (order.status === 'ACTIVE' || order.status === 'READY' || order.status === 'PAID')
        );
        return { success: true, orders: tableOrders };
    } catch (error) {
        console.error('Error getting table orders:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : (dictionary?.app?.menu?.order?.error || 'Error al obtener órdenes')
        };
    }
} 