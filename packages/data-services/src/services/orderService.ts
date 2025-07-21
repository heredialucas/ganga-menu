import { database } from '@repo/database';

export interface OrderData {
    id: string;
    table: { id: string; label: string } | null;
    status: 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID';
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
                tableId: data.tableId,
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
                table: {
                    select: { id: true, label: true }
                },
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
                table: {
                    select: { id: true, label: true }
                },
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
                table: {
                    select: { id: true, label: true }
                },
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
    status: 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID'
): Promise<OrderData> {
    try {
        const order = await database.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                table: {
                    select: { id: true, label: true }
                },
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
 * Eliminar una orden
 */
export async function deleteOrder(orderId: string): Promise<void> {
    try {
        // Verificar si la orden existe antes de eliminarla
        const existingOrder = await database.order.findUnique({
            where: { id: orderId }
        });

        if (!existingOrder) {
            console.log(`Orden ${orderId} ya no existe en la base de datos`);
            return; // No lanzar error si ya no existe
        }

        // Eliminar la orden (los OrderItems se eliminan automáticamente por CASCADE)
        await database.order.delete({
            where: { id: orderId }
        });
    } catch (error) {
        console.error("Error al eliminar orden:", error);
        throw new Error("No se pudo eliminar la orden");
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

/**
 * Verificar código de cocina
 */
export async function verifyKitchenCode(restaurantSlug: string, code: string): Promise<boolean> {
    try {
        const restaurantConfig = await database.restaurantConfig.findUnique({
            where: { slug: restaurantSlug },
            select: { kitchenCode: true }
        });

        if (!restaurantConfig) {
            return false;
        }

        return restaurantConfig.kitchenCode === code;
    } catch (error) {
        console.error("Error al verificar código de cocina:", error);
        return false;
    }
}

/**
 * Marcar todas las órdenes de una mesa como pagadas
 */
export async function markTableAsPaid(tableId: string): Promise<OrderData[]> {
    try {
        const updatedOrders = await database.order.updateMany({
            where: {
                tableId: tableId,
                status: { in: ['ACTIVE', 'READY'] } // Solo órdenes activas o listas
            },
            data: {
                status: 'PAID',
                updatedAt: new Date()
            }
        });

        // Retornar las órdenes actualizadas
        const orders = await database.order.findMany({
            where: {
                tableId: tableId,
                status: 'PAID'
            },
            include: {
                table: {
                    select: { id: true, label: true }
                },
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
            orderBy: { updatedAt: 'desc' }
        });

        return orders;
    } catch (error) {
        console.error("Error al marcar mesa como pagada:", error);
        throw new Error("No se pudo marcar la mesa como pagada");
    }
} 