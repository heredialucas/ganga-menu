'use server'

import { revalidatePath } from 'next/cache';
import { database, RecurrenceType } from '@repo/database';
import { getCurrentUserId } from './authService';
import { z } from 'zod';
import { addMonths, addWeeks, setDay, isBefore, isEqual } from 'date-fns';
import { randomUUID } from 'crypto';

export interface DailySpecialData {
    id: string;
    date: Date;
    isActive: boolean;
    dish: {
        id: string;
        name: string;
        description: string;
        price: number;
        promotionalPrice?: number | null;
        imageUrl?: string;
        status: string;
        order: number;
        category?: {
            name: string;
        } | null;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface DailySpecialFormData {
    date: Date;
    dishId: string;
    isActive?: boolean;
}

const upsertDailySpecialSchema = z.object({
    dishId: z.string(),
    date: z.date(),
    isRecurring: z.boolean().optional(),
    recurrenceType: z.nativeEnum(RecurrenceType).optional(),
    recurrenceDays: z.array(z.string()).optional(),
    recurrenceEndDate: z.date().optional(),
});

/**
 * Crear un nuevo plato del día
 */
export async function createDailySpecial(data: DailySpecialFormData, createdById: string) {
    try {
        // Ya no verificamos si existe un plato para esa fecha, permitimos múltiples

        // Crear el plato del día
        const dailySpecial = await database.dailySpecial.create({
            data: {
                date: data.date,
                dishId: data.dishId,
                isActive: data.isActive ?? true,
                createdById,
            },
            include: {
                dish: {
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        revalidatePath('/admin/dashboard');
        revalidatePath('/'); // Para la landing page
        return dailySpecial;
    } catch (error) {
        console.error('Error al crear plato del día:', error);
        throw new Error('No se pudo crear el plato del día');
    }
}

/**
 * Obtener todos los platos del día del usuario actual (para admin)
 */
export async function getAllDailySpecials(userId?: string) {
    try {
        // Si no se proporciona userId, obtener el actual
        const currentUserId = userId || await getCurrentUserId();
        if (!currentUserId) {
            throw new Error('Usuario no autenticado');
        }

        const dailySpecials = await database.dailySpecial.findMany({
            where: { createdById: currentUserId },
            include: {
                dish: {
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' },
        });

        return dailySpecials as DailySpecialData[];
    } catch (error) {
        console.error("Error al obtener platos del día:", error);
        throw new Error("No se pudieron obtener los platos del día");
    }
}

/**
 * Obtener los platos especiales del día actual (para público) - ahora puede devolver múltiples
 */
export async function getTodaySpecials() {
    try {
        // Usar UTC para evitar problemas de zona horaria
        const nowUTC = new Date();
        const todayUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate()));

        // Buscar platos especiales para hoy
        const todaySpecials = await database.dailySpecial.findMany({
            where: {
                date: todayUTC,
                isActive: true
            },
            include: {
                dish: {
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        return todaySpecials;
    } catch (error) {
        console.error("Error al obtener platos especiales del día actual:", error);
        throw new Error("No se pudieron obtener los platos especiales del día");
    }
}

/**
 * Obtener el primer plato especial del día actual (para compatibilidad)
 */
export async function getTodaySpecial() {
    try {
        const specials = await getTodaySpecials();
        return specials.length > 0 ? specials[0] : null;
    } catch (error) {
        console.error("Error al obtener plato especial del día actual:", error);
        throw new Error("No se pudo obtener el plato especial del día");
    }
}

/**
 * Obtener platos especiales por fecha específica
 */
export async function getDailySpecialsByDate(date: Date) {
    try {
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0); // Normalizar a inicio del día

        const dailySpecials = await database.dailySpecial.findMany({
            where: { date: dateOnly },
            include: {
                dish: {
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        return dailySpecials;
    } catch (error) {
        console.error('Error al obtener platos especiales por fecha:', error);
        throw new Error('No se pudieron obtener los platos especiales');
    }
}

/**
 * Obtener el primer plato especial por fecha específica (para compatibilidad)
 */
export async function getDailySpecialByDate(date: Date) {
    try {
        const specials = await getDailySpecialsByDate(date);
        return specials.length > 0 ? specials[0] : null;
    } catch (error) {
        console.error('Error al obtener plato especial por fecha:', error);
        throw new Error('No se pudo obtener el plato especial');
    }
}

/**
 * Actualizar un plato del día existente
 */
export async function updateDailySpecial(specialId: string, data: DailySpecialFormData) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("Usuario no autenticado");
        }

        // Ya no verificamos fechas únicas, permitimos múltiples platos por día
        const specialToUpdate = await database.dailySpecial.findFirst({
            where: {
                id: specialId,
                createdById: userId
            }
        });

        if (!specialToUpdate) {
            throw new Error("Promoción no encontrada o no tienes permiso para editarla.");
        }

        // Actualizar plato del día en la base de datos
        const dailySpecial = await database.dailySpecial.update({
            where: { id: specialId },
            data: {
                date: data.date,
                dishId: data.dishId,
                isActive: data.isActive,
            },
            include: {
                dish: {
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        revalidatePath('/admin/dashboard');
        revalidatePath('/'); // Para la landing page
        return dailySpecial;
    } catch (error) {
        console.error("Error al actualizar plato del día:", error);
        throw new Error("No se pudo actualizar el plato del día");
    }
}

/**
 * Eliminar un plato del día
 */
export async function deleteDailySpecial(specialId: string) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            throw new Error("Usuario no autenticado");
        }

        const specialToDelete = await database.dailySpecial.findFirst({
            where: {
                id: specialId,
                createdById: userId
            }
        });

        if (!specialToDelete) {
            throw new Error("Promoción no encontrada o no tienes permiso para eliminarla.");
        }

        // Eliminar plato del día de la base de datos
        await database.dailySpecial.delete({
            where: { id: specialId },
        });

        revalidatePath('/admin/dashboard');
        revalidatePath('/'); // Para la landing page
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar plato del día:", error);
        throw new Error("No se pudo eliminar el plato del día");
    }
}

/**
 * Obtener próximos platos del día (para admin y planning)
 */
export async function getUpcomingDailySpecials(days: number = 7) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + days);

        const upcomingSpecials = await database.dailySpecial.findMany({
            where: {
                date: {
                    gte: today,
                    lte: futureDate
                }
            },
            include: {
                dish: {
                    include: {
                        category: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { date: 'asc' }
        });

        return upcomingSpecials as DailySpecialData[];
    } catch (error) {
        console.error("Error al obtener próximos platos del día:", error);
        throw new Error("No se pudieron obtener los próximos platos del día");
    }
}

/**
 * Duplicar un plato especial para múltiples fechas futuras (hasta 36 meses)
 */
export async function duplicateDailySpecialToFutureDates(specialId: string, monthsAhead: number = 36) {
    try {
        // Obtener el plato especial original
        const originalSpecial = await database.dailySpecial.findUnique({
            where: { id: specialId },
            include: {
                dish: true
            }
        });

        if (!originalSpecial) {
            throw new Error('Plato especial no encontrado');
        }

        const originalDate = new Date(originalSpecial.date);
        const createdSpecials = [];

        // Crear platos especiales para los próximos meses
        for (let i = 1; i <= monthsAhead; i++) {
            const futureDate = new Date(originalDate);
            futureDate.setMonth(futureDate.getMonth() + i);

            // Verificar si ya existe un plato especial para esta fecha y plato
            const existingSpecial = await database.dailySpecial.findFirst({
                where: {
                    date: futureDate,
                    dishId: originalSpecial.dishId,
                    createdById: originalSpecial.createdById
                }
            });

            // Solo crear si no existe ya
            if (!existingSpecial) {
                const newSpecial = await database.dailySpecial.create({
                    data: {
                        date: futureDate,
                        dishId: originalSpecial.dishId,
                        isActive: originalSpecial.isActive,
                        createdById: originalSpecial.createdById,
                    },
                    include: {
                        dish: {
                            include: {
                                category: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                });
                createdSpecials.push(newSpecial);
            }
        }

        revalidatePath('/admin/dashboard');
        return {
            success: true,
            created: createdSpecials.length,
            specials: createdSpecials
        };
    } catch (error) {
        console.error('Error al duplicar plato especial:', error);
        throw new Error('No se pudo duplicar el plato especial');
    }
}

export async function upsertDailySpecial(data: {
    dishId: string;
    date: Date;
    isRecurring?: boolean;
    recurrenceType?: RecurrenceType;
    recurrenceDays?: string[];
    recurrenceEndDate?: Date;
}) {
    const validatedData = upsertDailySpecialSchema.parse(data);
    const { dishId, date, isRecurring, recurrenceType, recurrenceDays, recurrenceEndDate } = validatedData;
    const createdById = await getCurrentUserId();

    if (!createdById) {
        throw new Error('Usuario no autenticado');
    }

    if (!isRecurring) {
        // Comportamiento original: crear un solo evento
        const special = await database.dailySpecial.create({
            data: {
                dishId,
                date,
                createdById,
            },
        });
        revalidatePath('/admin/dashboard/menu');
        return { success: true, message: "Promoción creada." };
    }

    // Lógica para promociones recurrentes
    if (!recurrenceType || !recurrenceEndDate) {
        throw new Error("Para promociones recurrentes, el tipo y la fecha de fin son requeridos.");
    }

    const specialsToCreate = [];
    let currentDate = new Date(date);
    const parentId = randomUUID(); // Generar un ID para el padre

    while (isBefore(currentDate, recurrenceEndDate) || isEqual(currentDate, recurrenceEndDate)) {
        if (recurrenceType === RecurrenceType.WEEKLY) {
            if (!recurrenceDays || recurrenceDays.length === 0) {
                throw new Error("Para recurrencia semanal, se requieren los días de la semana.");
            }
            for (const day of recurrenceDays) {
                const targetDate = setDay(currentDate, parseInt(day, 10));
                if ((isBefore(targetDate, recurrenceEndDate) || isEqual(targetDate, recurrenceEndDate)) && isBefore(date, targetDate) || isEqual(date, targetDate)) {
                    specialsToCreate.push({
                        dishId,
                        date: targetDate,
                        createdById,
                        recurrenceType,
                        recurrenceDays: recurrenceDays.join(','),
                        recurrenceEndDate,
                        recurrenceParentId: parentId,
                    });
                }
            }
            currentDate = addWeeks(currentDate, 1);

        } else if (recurrenceType === RecurrenceType.MONTHLY) {
            specialsToCreate.push({
                dishId,
                date: currentDate,
                createdById,
                recurrenceType,
                recurrenceEndDate,
                recurrenceParentId: parentId,
            });
            currentDate = addMonths(currentDate, 1);
        }
    }

    if (specialsToCreate.length > 0) {
        await database.dailySpecial.createMany({
            data: specialsToCreate,
        });
    }

    revalidatePath('/admin/dashboard/menu');
    return { success: true, message: `${specialsToCreate.length} promociones recurrentes creadas.` };
}

export async function deleteDailySpecials(ids: string[]) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Usuario no autenticado.");

    if (ids.length === 0) {
        return { success: true, message: "No se seleccionaron especiales para eliminar." };
    }

    try {
        await database.dailySpecial.deleteMany({
            where: {
                id: { in: ids },
                createdById: userId,
            },
        });
        revalidatePath('/menu');
        return { success: true, message: `${ids.length} promociones eliminadas.` };
    } catch (error) {
        console.error("Error al eliminar promociones:", error);
        throw new Error("No se pudieron eliminar las promociones.");
    }
} 