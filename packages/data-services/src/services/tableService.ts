import { database } from '@repo/database';

export interface TableData {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    shape: string;
    fill: string;
    restaurantDesignId: string;
}

/**
 * Obtener una mesa específica por ID y validar que pertenece al restaurante
 */
export async function getTableByIdAndRestaurant(tableId: string, restaurantConfigId: string): Promise<TableData | null> {
    try {
        const table = await database.restaurantTable.findFirst({
            where: {
                id: tableId,
                restaurantDesign: {
                    restaurantConfigId: restaurantConfigId
                }
            },
            include: {
                restaurantDesign: {
                    include: {
                        restaurantConfig: true
                    }
                }
            }
        });

        if (!table) {
            return null;
        }

        return {
            id: table.id,
            label: table.label,
            x: table.x,
            y: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            shape: table.shape,
            fill: table.fill,
            restaurantDesignId: table.restaurantDesignId
        };
    } catch (error) {
        console.error("Error al obtener mesa:", error);
        throw new Error("No se pudo obtener la mesa");
    }
}

/**
 * Obtener todas las mesas de un restaurante
 */
export async function getTablesByRestaurant(restaurantConfigId: string): Promise<TableData[]> {
    try {
        const restaurantConfig = await database.restaurantConfig.findUnique({
            where: { id: restaurantConfigId },
            include: {
                restaurantDesign: {
                    include: {
                        restaurantTables: {
                            orderBy: { label: 'asc' }
                        }
                    }
                }
            }
        });

        if (!restaurantConfig?.restaurantDesign) {
            return [];
        }

        return restaurantConfig.restaurantDesign.restaurantTables.map(table => ({
            id: table.id,
            label: table.label,
            x: table.x,
            y: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            shape: table.shape,
            fill: table.fill,
            restaurantDesignId: table.restaurantDesignId
        }));
    } catch (error) {
        console.error("Error al obtener mesas:", error);
        throw new Error("No se pudieron obtener las mesas");
    }
} 