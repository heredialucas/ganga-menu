'use server';

import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';

// Tipos base para los elementos del diseño
interface BaseElement {
    id: string;
    x: number;
    y: number;
    rotation?: number;
    fill: string;
}

interface ShapeElement extends BaseElement {
    type: 'table' | 'bar';
    shape: 'circle' | 'rectangle' | 'square';
    width: number;
    height: number;
    name: string;
    capacity?: number;
}

interface WallElement {
    id: string;
    type: 'wall';
    points: number[];
    fill: string;
}

interface StaircaseElement extends BaseElement {
    type: 'staircase';
    width: number;
    height: number;
}

export type RestaurantElement = ShapeElement | WallElement | StaircaseElement;


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
            case 'table':
            case 'bar':
                return (
                    typeof item.x === 'number' &&
                    typeof item.y === 'number' &&
                    typeof item.width === 'number' &&
                    typeof item.height === 'number' &&
                    typeof item.fill === 'string' &&
                    typeof item.name === 'string' &&
                    typeof item.shape === 'string'
                );
            case 'wall':
                return Array.isArray(item.points) && typeof item.fill === 'string';
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
        ...design,
        elements: parseElements(design.elements),
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
        ...design,
        elements: parseElements(design.elements),
    };
}

/**
 * Actualiza un diseño de restaurante existente
 */
export async function updateRestaurantDesign(id: string, input: UpdateRestaurantDesignInput): Promise<RestaurantDesignData> {
    const design = await database.restaurantDesign.update({
        where: { id },
        data: {
            name: input.name,
            elements: input.elements as any,
            canvasWidth: input.canvasWidth,
            canvasHeight: input.canvasHeight
        }
    });

    return {
        ...design,
        elements: parseElements(design.elements),
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
    const existingDesign = await getRestaurantDesignByConfigId(restaurantConfigId);

    let result: RestaurantDesignData;

    if (existingDesign) {
        result = await updateRestaurantDesign(existingDesign.id, {
            elements,
            canvasWidth,
            canvasHeight
        });
    } else {
        result = await createRestaurantDesign({
            elements,
            canvasWidth,
            canvasHeight,
            restaurantConfigId,
            createdById: userId
        });
    }

    revalidatePath('/[locale]/restaurant');

    return result;
} 