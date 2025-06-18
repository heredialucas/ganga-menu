import { database } from '@repo/database';

export interface OrderData {
    id: string;
    tableNumber: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
    total: number;
    notes?: string | null;
    waiterName?: string | null;
    createdAt: Date;
    updatedAt: Date;
    restaurantConfigId: string;
    items: OrderItemData[];
}

export interface OrderItemData {
    id: string;
    quantity: number;
    price: number;
    notes?: string | null;
    dish: {
        id: string;
        name: string;
        description: string;
        price: number;
        imageUrl?: string | null;
    };
}

export interface CreateOrderData {
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

/**
 * Crear una nueva orden
 */
export async function createOrder(data: CreateOrderData): Promise<OrderData> {
    try {
        // Primero obtener los precios actuales de los platos
        const dishIds = data.items.map(item => item.dishId);
        const dishes = await database.dish.findMany({
            where: { id: { in: dishIds } },
            select: { id: true, price: true }
        });

        const dishPriceMap = new Map(dishes.map(dish => [dish.id, dish.price]));

        // Calcular el total
        const total = data.items.reduce((sum, item) => {
            const dishPrice = dishPriceMap.get(item.dishId) || 0;
            return sum + (dishPrice * item.quantity);
        }, 0);

        const order = await database.order.create({
            data: {
                tableNumber: data.tableNumber,
                waiterName: data.waiterName,
                notes: data.notes,
                total,
                restaurantConfigId: data.restaurantConfigId,
                items: {
                    create: data.items.map(item => ({
                        dishId: item.dishId,
                        quantity: item.quantity,
                        price: dishPriceMap.get(item.dishId) || 0,
                        notes: item.notes
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        dish: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });

        return order;
    } catch (error) {
        console.error("Error al crear orden:", error);
        throw new Error("No se pudo crear la orden");
    }
}

/**
 * Obtener todas las órdenes de un restaurante
 */
export async function getOrdersByRestaurant(restaurantConfigId: string): Promise<OrderData[]> {
    try {
        const orders = await database.order.findMany({
            where: { restaurantConfigId },
            include: {
                items: {
                    include: {
                        dish: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return orders;
    } catch (error) {
        console.error("Error al obtener órdenes:", error);
        throw new Error("No se pudieron obtener las órdenes");
    }
}

/**
 * Obtener una orden por ID
 */
export async function getOrderById(orderId: string): Promise<OrderData | null> {
    try {
        const order = await database.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        dish: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });

        return order;
    } catch (error) {
        console.error("Error al obtener orden:", error);
        throw new Error("No se pudo obtener la orden");
    }
}

/**
 * Actualizar estado de una orden
 */
export async function updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'
): Promise<OrderData> {
    try {
        const order = await database.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                items: {
                    include: {
                        dish: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });

        return order;
    } catch (error) {
        console.error("Error al actualizar estado de orden:", error);
        throw new Error("No se pudo actualizar el estado de la orden");
    }
}

/**
 * Verificar código de mozo
 */
export async function verifyWaiterCode(restaurantSlug: string, code: string): Promise<boolean> {
    try {
        const restaurantConfig = await database.restaurantConfig.findUnique({
            where: { slug: restaurantSlug },
            select: { waiterCode: true }
        });

        if (!restaurantConfig) {
            return false;
        }

        return restaurantConfig.waiterCode === code;
    } catch (error) {
        console.error("Error al verificar código de mozo:", error);
        return false;
    }
} 