'use server';

import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';

export interface RestaurantElement {
    id: string;
    type: 'table' | 'bar' | 'decoration';
    shape: 'circle' | 'rectangle' | 'square';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    name: string;
    capacity?: number;
}

// Helper function para validar y convertir JsonValue a RestaurantElement[]
function parseElements(elementsJson: unknown): RestaurantElement[] {
    if (!Array.isArray(elementsJson)) {
        return [];
    }

    return elementsJson.filter((item): item is RestaurantElement => {
        return (
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            typeof item.type === 'string' &&
            typeof item.shape === 'string' &&
            typeof item.x === 'number' &&
            typeof item.y === 'number' &&
            typeof item.width === 'number' &&
            typeof item.height === 'number' &&
            typeof item.fill === 'string' &&
            typeof item.name === 'string'
        );
    });
}

export interface RestaurantDesignData {
    id: string;
    name: string;
    elements: RestaurantElement[];
    canvasWidth: number;
    canvasHeight: number;
    restaurantConfigId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRestaurantDesignInput {
    name?: string;
    elements: RestaurantElement[];
    canvasWidth: number;
    canvasHeight: number;
    restaurantConfigId: string;
    createdById: string;
}

export interface UpdateRestaurantDesignInput {
    name?: string;
    elements?: RestaurantElement[];
    canvasWidth?: number;
    canvasHeight?: number;
}

/**
 * Obtiene el diseño del restaurante por ID de configuración
 */
export async function getRestaurantDesignByConfigId(restaurantConfigId: string): Promise<RestaurantDesignData | null> {
    const design = await database.restaurantDesign.findUnique({
        where: {
            restaurantConfigId
        }
    });

    if (!design) {
        return null;
    }

    return {
        id: design.id,
        name: design.name,
        elements: parseElements(design.elements),
        canvasWidth: design.canvasWidth,
        canvasHeight: design.canvasHeight,
        restaurantConfigId: design.restaurantConfigId,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt
    };
}

/**
 * Crea un nuevo diseño de restaurante
 */
export async function createRestaurantDesign(input: CreateRestaurantDesignInput): Promise<RestaurantDesignData> {
    const design = await database.restaurantDesign.create({
        data: {
            name: input.name || 'Mi Diseño',
            elements: input.elements as any,
            canvasWidth: input.canvasWidth,
            canvasHeight: input.canvasHeight,
            restaurantConfigId: input.restaurantConfigId,
            createdById: input.createdById
        }
    });

    return {
        id: design.id,
        name: design.name,
        elements: parseElements(design.elements),
        canvasWidth: design.canvasWidth,
        canvasHeight: design.canvasHeight,
        restaurantConfigId: design.restaurantConfigId,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt
    };
}

/**
 * Actualiza un diseño de restaurante existente
 */
export async function updateRestaurantDesign(id: string, input: UpdateRestaurantDesignInput): Promise<RestaurantDesignData> {
    const design = await database.restaurantDesign.update({
        where: { id },
        data: {
            ...(input.name && { name: input.name }),
            ...(input.elements && { elements: input.elements as any }),
            ...(input.canvasWidth && { canvasWidth: input.canvasWidth }),
            ...(input.canvasHeight && { canvasHeight: input.canvasHeight })
        }
    });

    return {
        id: design.id,
        name: design.name,
        elements: parseElements(design.elements),
        canvasWidth: design.canvasWidth,
        canvasHeight: design.canvasHeight,
        restaurantConfigId: design.restaurantConfigId,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt
    };
}

/**
 * Guarda o actualiza el diseño del restaurante
 */
export async function saveRestaurantDesign(
    restaurantConfigId: string,
    userId: string,
    elements: RestaurantElement[],
    canvasWidth: number,
    canvasHeight: number
): Promise<RestaurantDesignData> {
    // Verificar si ya existe un diseño
    const existingDesign = await getRestaurantDesignByConfigId(restaurantConfigId);

    let result: RestaurantDesignData;

    if (existingDesign) {
        // Actualizar diseño existente
        result = await updateRestaurantDesign(existingDesign.id, {
            elements,
            canvasWidth,
            canvasHeight
        });
    } else {
        // Crear nuevo diseño
        result = await createRestaurantDesign({
            elements,
            canvasWidth,
            canvasHeight,
            restaurantConfigId,
            createdById: userId
        });
    }

    // Revalidar la página del dashboard para actualizar los datos
    revalidatePath('/[locale]/admin/dashboard');

    return result;
} 