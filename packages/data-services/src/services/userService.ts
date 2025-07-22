'use server'

import { revalidatePath } from 'next/cache';
import { UserData, UserFormData } from '../types/user';
import { database } from '@repo/database';
import { UserRole } from '@repo/database/generated/client';
import bcrypt from 'bcryptjs';

/**
 * Verifica si un usuario debe ver funcionalidades premium
 * Los usuarios cuyo padre es premium/admin no deben ver funcionalidades premium
 */
export async function shouldShowPremiumFeatures(userId: string): Promise<boolean> {
    try {
        const user = await database.user.findUnique({
            where: { id: userId },
            include: {
                createdBy: {
                    select: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return true; // Por defecto mostrar si no se encuentra el usuario
        }

        // Si el usuario es admin o premium, no mostrar funcionalidades premium
        if (user.role === 'admin' || user.role === 'premium') {
            return false;
        }

        // Si el usuario es 'user', verificar si el padre es premium/admin
        if (user.role === 'user' && user.createdBy) {
            const parentRole = user.createdBy.role;
            // Si el padre es premium o admin, no mostrar funcionalidades premium
            if (parentRole === 'premium' || parentRole === 'admin') {
                return false;
            }
        }

        return true; // Mostrar funcionalidades premium por defecto
    } catch (error) {
        console.error('Error al verificar si mostrar funcionalidades premium:', error);
        return true; // Por defecto mostrar las funcionalidades
    }
}



/**
 * Crear un nuevo usuario
 */
export async function createUser(data: UserFormData & { role: UserRole, creatorId: string, permissionNames: string[] }) {
    try {
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

        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Buscar los IDs de los permisos
        const permissions = await database.permission.findMany({
            where: { name: { in: data.permissionNames } },
            select: { id: true }
        });

        if (permissions.length !== data.permissionNames.length) {
            return {
                success: false,
                message: 'Alguno de los permisos proporcionados no es válido',
                error: 'INVALID_PERMISSIONS'
            };
        }

        const user = await database.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                createdById: data.creatorId,
                permissions: {
                    create: permissions.map(p => ({
                        permissionId: p.id
                    }))
                }
            },
        });

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
 * Obtener un usuario por email
 */
export async function findUserByEmail(email: string, include?: { permissions?: boolean }) {
    try {
        const user = await database.user.findUnique({
            where: { email },
            include: {
                permissions: include?.permissions ? {
                    include: {
                        permission: true
                    }
                } : false,
            }
        });

        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Error al obtener usuario por email:', error);
        throw new Error('No se pudo obtener el usuario');
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
export async function getAllUsers(creatorId: string) {
    try {
        if (!creatorId) {
            return [];
        }

        const users = await database.user.findMany({
            where: { createdById: creatorId },
            orderBy: { createdAt: 'desc' },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        return users.map(user => ({
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            permissions: user.permissions.map(p => p.permission.name)
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
 * Cambiar la contraseña de un usuario
 */
export async function changePasswordService(userId: string, currentPassword: string, newPassword: string) {
    try {
        const user = await database.user.findUnique({ where: { id: userId } });
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return { success: false, message: 'La contraseña actual es incorrecta' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await database.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true, message: 'Contraseña actualizada correctamente' };

    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        return { success: false, message: 'Error interno al cambiar la contraseña' };
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

/**
 * Asigna permisos básicos a un usuario recién creado
 */
async function assignBasicPermissions(userId: string): Promise<void> {
    try {
        // Buscar los permisos básicos
        const basicPermissions = await database.permission.findMany({
            where: {
                name: {
                    in: ['account:view_own', 'account:edit_own', 'account:change_password']
                }
            }
        });

        // Crear las relaciones usuario-permiso
        const userPermissions = basicPermissions.map(permission => ({
            userId,
            permissionId: permission.id
        }));

        if (userPermissions.length > 0) {
            await database.userPermission.createMany({
                data: userPermissions
            });
        }

        console.log(`Assigned ${userPermissions.length} basic permissions to user ${userId}`);
    } catch (error) {
        console.error('Error assigning basic permissions:', error);
        throw error;
    }
}

/**
 * Actualiza automáticamente el rol de todos los usuarios hijos cuando cambia el rol del padre
 * Si el padre es premium/admin, los hijos heredan premium
 * Si el padre es user, los hijos vuelven a user
 */
export async function updateChildrenRoles(parentId: string, parentRole: UserRole): Promise<void> {
    try {
        // Buscar todos los usuarios creados por este padre
        const children = await database.user.findMany({
            where: { createdById: parentId },
            select: { id: true, role: true }
        });

        if (children.length === 0) return;

        // Determinar el rol que deben heredar los hijos
        const inheritedRole: UserRole = (parentRole === 'premium' || parentRole === 'admin') ? 'premium' : 'user';

        // Actualizar todos los hijos
        await database.user.updateMany({
            where: { createdById: parentId },
            data: { role: inheritedRole }
        });

        console.log(`Updated ${children.length} children of user ${parentId} to role: ${inheritedRole}`);
    } catch (error) {
        console.error('Error updating children roles:', error);
        throw error;
    }
}

/**
 * Crea un usuario subordinado con herencia de rol del padre
 * SOLO para usuarios creados desde la gestión de usuarios
 */
export async function createSubordinateUser(userData: {
    email: string;
    name: string;
    lastName: string;
    password: string;
    createdById: string; // OBLIGATORIO - ID del padre
    stripeCustomerId?: string;
}): Promise<any> {
    try {
        // Verificar que el padre existe y obtener su rol
        const parent = await database.user.findUnique({
            where: { id: userData.createdById },
            select: { role: true }
        });

        if (!parent) {
            throw new Error('Parent user not found');
        }

        // Determinar el rol heredado
        const inheritedRole: UserRole = (parent.role === 'premium' || parent.role === 'admin') ? 'premium' : 'user';

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Crear el usuario con el rol heredado
        const newUser = await database.user.create({
            data: {
                ...userData,
                password: hashedPassword, // Usar la contraseña hasheada
                role: inheritedRole
            }
        });

        // Asignar permisos básicos
        await assignBasicPermissions(newUser.id);

        console.log(`Created subordinate user ${newUser.id} with inherited role: ${inheritedRole}`);
        return newUser;
    } catch (error) {
        console.error('Error creating subordinate user:', error);
        throw error;
    }
}

/**
 * Actualiza el rol de un usuario y automáticamente actualiza todos sus hijos directos
 */
export async function updateUserRoleWithChildrenInheritance(userId: string, newRole: UserRole): Promise<any> {
    try {
        // Actualizar el usuario
        const updatedUser = await database.user.update({
            where: { id: userId },
            data: { role: newRole }
        });

        // Actualizar solo los hijos directos
        await updateChildrenRoles(userId, newRole);

        console.log(`Updated user ${userId} to role: ${newRole} and children`);
        return updatedUser;
    } catch (error) {
        console.error('Error updating user role with inheritance:', error);
        throw error;
    }
} 