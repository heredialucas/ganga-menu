'use server';

import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import type { RestaurantTable } from '@repo/database';
import { getCurrentUserId } from './authService';

export type SaveDesignResult = {
    success: boolean;
    message: string;
    tables?: RestaurantTable[];
};

// Tipos base para los elementos del diseño
interface BaseElement {
    id: string;
    x: number;
    y: number;
    rotation?: number;
    fill: string;
}

interface ShapeElement extends BaseElement {
    type: 'bar' | 'wall';
    shape: 'circle' | 'rectangle' | 'square';
    width: number;
    height: number;
}

interface StaircaseElement extends BaseElement {
    type: 'staircase';
    width: number;
    height: number;
}

export type RestaurantElement = ShapeElement | StaircaseElement;
export type RestaurantTableData = RestaurantTable;

// Helper function para validar y convertir JsonValue a RestaurantElement[]
function parseElements(elementsJson: unknown): RestaurantElement[] {
    if (!Array.isArray(elementsJson)) {
        return [];
    }

    return elementsJson.filter((item: any): item is RestaurantElement => {
        if (typeof item !== 'object' || item === null || typeof item.id !== 'string' || typeof item.type !== 'string') {
            return false;
        }

        switch (item.type) {
            case 'bar':
            case 'wall':
                return (
                    typeof item.x === 'number' &&
                    typeof item.y === 'number' &&
                    typeof item.width === 'number' &&
                    typeof item.height === 'number' &&
                    typeof item.fill === 'string' &&
                    typeof item.shape === 'string'
                );
            case 'staircase':
                return (
                    typeof item.x === 'number' &&
                    typeof item.y === 'number' &&
                    typeof item.width === 'number' &&
                    typeof item.height === 'number' &&
                    typeof item.fill === 'string'
                );
            default:
                return false;
        }
    });
}

export interface RestaurantDesignData {
    id: string;
    name: string;
    elements: RestaurantElement[];
    tables: RestaurantTableData[];
    canvasWidth: number;
    canvasHeight: number;
    restaurantConfigId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SaveDesignPayload {
    restaurantConfigId: string;
    tables: string;
    elements: string;
    canvasWidth: string;
    canvasHeight: string;
}

/**
 * Obtiene el diseño del restaurante por ID de configuración
 */
export async function getRestaurantDesignByConfigId(restaurantConfigId: string): Promise<RestaurantDesignData | null> {
    const design = await database.restaurantDesign.findUnique({
        where: {
            restaurantConfigId
        },
        include: {
            restaurantTables: true,
        }
    });

    if (!design) {
        return null;
    }

    return {
        ...design,
        elements: parseElements(design.elements),
        tables: design.restaurantTables,
    };
}


/**
 * Guarda o actualiza el diseño del restaurante
 */
export async function saveRestaurantDesign(
    prevState: any,
    formData: FormData,
): Promise<SaveDesignResult> {
    'use server'

    console.log("--- INICIANDO GUARDADO DE DISEÑO ---");

    const restaurantConfigId = formData.get('restaurantConfigId') as string;
    const tablesPayload = formData.get('tables') as string;
    const elementsPayload = formData.get('elements') as string;
    const canvasWidth = parseInt(formData.get('canvasWidth') as string, 10);
    const canvasHeight = parseInt(formData.get('canvasHeight') as string, 10);

    console.log("Restaurant Config ID:", restaurantConfigId);
    console.log("Canvas Dims:", { width: canvasWidth, height: canvasHeight });
    console.log("RAW Payload - Tables:", tablesPayload);
    console.log("RAW Payload - Elements:", elementsPayload);

    let tables: RestaurantTableData[];
    let elements: RestaurantElement[];

    try {
        tables = JSON.parse(tablesPayload) as RestaurantTableData[];
        elements = JSON.parse(elementsPayload) as RestaurantElement[];
        console.log("Payload Parseado - Tables Count:", tables.length);
        console.log("Payload Parseado - Elements Count:", elements.length);
    } catch (e: any) {
        console.error("Error al parsear JSON:", e.message);
        return { success: false, message: 'Error interno: El formato de los datos es inválido.' };
    }

    const userId = await getCurrentUserId();

    if (!restaurantConfigId || !userId) {
        console.error("Error: Falta restaurantConfigId o userId.");
        return { success: false, message: 'ID de configuración o de usuario no válido' };
    }

    try {
        const existingDesign = await database.restaurantDesign.findUnique({
            where: { restaurantConfigId },
        });

        if (!existingDesign) {
            console.log("No existe diseño. Creando uno nuevo...");
            const newDesign = await database.restaurantDesign.create({
                data: {
                    restaurantConfigId,
                    canvasWidth,
                    canvasHeight,
                    elements: elements as any,
                    createdById: userId,
                    restaurantTables: {
                        create: tables.map(table => ({
                            label: table.label, x: table.x, y: table.y, width: table.width,
                            height: table.height, rotation: table.rotation, shape: table.shape, fill: table.fill,
                        })),
                    },
                },
                include: { restaurantTables: true }
            });

            console.log("Diseño creado exitosamente.");
            revalidatePath('/[locale]/restaurant');
            return { success: true, message: 'Diseño guardado exitosamente', tables: newDesign.restaurantTables };
        }

        console.log("Diseño existente encontrado. Actualizando con estrategia 'Borrar y Recrear'.");
        console.log(`Borrando ${tables.length} mesas existentes...`);

        const [, updatedDesign] = await database.$transaction([
            database.restaurantTable.deleteMany({
                where: { restaurantDesignId: existingDesign.id },
            }),
            database.restaurantDesign.update({
                where: { id: existingDesign.id },
                data: {
                    canvasWidth,
                    canvasHeight,
                    elements: elements as any,
                    restaurantTables: {
                        create: tables.map(table => ({
                            label: table.label, x: table.x, y: table.y, width: table.width,
                            height: table.height, rotation: table.rotation, shape: table.shape, fill: table.fill
                        })),
                    }
                },
                include: { restaurantTables: true }
            })
        ]);

        console.log("Diseño actualizado exitosamente.");
        revalidatePath('/[locale]/restaurant');
        return { success: true, message: 'Diseño actualizado exitosamente', tables: updatedDesign.restaurantTables };

    } catch (error) {
        console.error("--- ERROR EN LA OPERACIÓN DE BASE DE DATOS ---", error);
        return { success: false, message: 'Hubo un error al guardar el diseño. Verifique que los nombres de las mesas no estén repetidos.' };
    }
} 