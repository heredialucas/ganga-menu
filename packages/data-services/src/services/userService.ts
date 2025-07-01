'use server'

import { revalidatePath } from 'next/cache';
import { UserData, UserFormData } from '../types/user';
import { database } from '@repo/database';
import { UserRole } from '@repo/database';
import bcrypt from 'bcryptjs';

/**
 * Crear un nuevo usuario
 */
export async function createUser(data: UserFormData & { role: UserRole }) {
    try {
        // Verificar si ya existe un usuario con ese email
        const existingUser = await database.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return {
                success: false,
                message: 'Ya existe un usuario con este email',
                error: 'EMAIL_ALREADY_EXISTS'
            };
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Crear el usuario con contraseña hasheada
        const user = await database.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                password: hashedPassword,
                role: data.role,
            },
        });

        // Retornar usuario sin contraseña
        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        };
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return {
            success: false,
            message: 'Error interno del servidor al crear el usuario',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener un usuario por ID
 */
export async function getUserById(userId: string) {
    try {
        const user = await database.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return null;
        }

        // Retornar usuario sin contraseña
        return {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        throw new Error('No se pudo obtener el usuario');
    }
}

/**
 * Obtener todos los usuarios
 */
export async function getAllUsers() {
    try {
        // Implementación real con la base de datos
        const users = await database.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        // Mapear para no incluir passwords
        return users.map(user => ({
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        })) as UserData[];
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        throw new Error("No se pudieron obtener los usuarios");
    }
}

/**
 * Actualizar un usuario existente
 */
export async function updateUser(userId: string, data: UserFormData & { role?: UserRole }) {
    "use server";
    try {
        const updateData: any = {
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
        };

        // Solo hashear la contraseña si se proporciona una nueva
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 12);
        }

        // Actualizar usuario en la base de datos
        const user = await database.user.update({
            where: { id: userId },
            data: updateData,
        });

        revalidatePath('/admin/dashboard');

        // Devolver usuario sin password
        return {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        } as UserData;
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        throw new Error("No se pudo actualizar el usuario");
    }
}

/**
 * Eliminar un usuario
 */
export async function deleteUser(userId: string) {
    "use server";
    try {
        // Eliminar usuario de la base de datos
        await database.user.delete({
            where: { id: userId },
        });

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        throw new Error("No se pudo eliminar el usuario");
    }
}

/**
 * Verificar credenciales de usuario con hash
 */
export async function verifyUserCredentials(email: string, password: string) {
    try {
        // Buscar usuario por email
        const user = await database.user.findUnique({
            where: { email },
        });

        // Si no se encuentra el usuario, retornar fallo
        if (!user) {
            return { success: false, message: 'Credenciales inválidas' };
        }

        // Comparar contraseña hasheada
        const passwordMatch = await bcrypt.compare(password, user.password);

        // Si las contraseñas no coinciden, retornar fallo
        if (!passwordMatch) {
            return { success: false, message: 'Credenciales inválidas' };
        }

        // Retornar éxito con datos del usuario
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role
            }
        };
    } catch (error) {
        console.error('Error al verificar credenciales:', error);
        throw new Error('No se pudieron verificar las credenciales');
    }
}

export async function updateUserRole(userId: string, role: UserRole) {
    try {
        const updatedUser = await database.user.update({
            where: { id: userId },
            data: { role },
        });
        return updatedUser;
    } catch (error) {
        console.error(`Error updating user role for ${userId}:`, error);
        throw new Error('Could not update user role.');
    }
}

export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    try {
        const updatedUser = await database.user.update({
            where: { id: userId },
            data: { stripeCustomerId },
        });
        return updatedUser;
    } catch (error) {
        console.error(`Error updating stripeCustomerId for ${userId}:`, error);
        throw new Error('Could not update Stripe Customer ID.');
    }
}

export async function findUserByStripeCustomerId(stripeCustomerId: string) {
    try {
        const user = await database.user.findUnique({
            where: { stripeCustomerId },
        });
        return user;
    } catch (error) {
        console.error(`Error finding user by stripeCustomerId ${stripeCustomerId}:`, error);
        throw new Error('Could not find user by Stripe Customer ID.');
    }
} 