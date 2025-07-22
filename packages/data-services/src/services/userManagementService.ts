import { database } from '@repo/database';
import { UserRole } from '@repo/database/generated/client';
import {
    createSubordinateUser,
    updateUserRoleWithChildrenInheritance
} from './userService';
import bcrypt from 'bcryptjs';

/**
 * Servicio para la gestión de usuarios con herencia automática de roles
 */

export interface CreateUserData {
    email: string;
    name: string;
    lastName: string;
    password: string;
    createdById?: string;
    stripeCustomerId?: string;
}

export interface UpdateUserData {
    name?: string;
    lastName?: string;
    email?: string;
    role?: UserRole;
    password?: string;
    permissions?: string[];
}

/**
 * Crear un nuevo usuario con herencia automática de rol
 */
export async function createUserWithInheritance(data: CreateUserData) {
    try {
        if (!data.createdById) {
            return {
                success: false,
                error: 'createdById is required for inheritance'
            };
        }

        const newUser = await createSubordinateUser(data as any);

        return {
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                lastName: newUser.lastName,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        };
    } catch (error) {
        console.error('Error creating user:', error);
        return {
            success: false,
            error: 'Failed to create user'
        };
    }
}

/**
 * Actualizar un usuario y manejar la herencia de roles
 */
export async function updateUserWithInheritance(userId: string, data: UpdateUserData) {
    try {
        let updatedUser;

        // Preparar los datos de actualización
        const updateData: any = {
            name: data.name,
            lastName: data.lastName,
            email: data.email
        };

        // Si se está actualizando la contraseña, hashearla
        if (data.password && data.password.trim() !== '') {
            updateData.password = await bcrypt.hash(data.password, 12);
        }

        // Si se está actualizando el rol, usar la función con herencia
        if (data.role) {
            updatedUser = await updateUserRoleWithChildrenInheritance(userId, data.role);

            // Si también hay otros datos para actualizar, hacerlo por separado
            if (Object.keys(updateData).length > 0) {
                updatedUser = await database.user.update({
                    where: { id: userId },
                    data: updateData
                });
            }
        } else {
            // Actualización normal sin cambio de rol
            updatedUser = await database.user.update({
                where: { id: userId },
                data: updateData
            });
        }

        // Actualizar permisos si se proporcionan
        if (data.permissions) {
            // Primero eliminar todos los permisos actuales
            await database.userPermission.deleteMany({
                where: { userId }
            });

            // Luego agregar los nuevos permisos
            if (data.permissions.length > 0) {
                const permissions = await database.permission.findMany({
                    where: { name: { in: data.permissions } }
                });

                const userPermissions = permissions.map(permission => ({
                    userId,
                    permissionId: permission.id
                }));

                if (userPermissions.length > 0) {
                    await database.userPermission.createMany({
                        data: userPermissions
                    });
                }
            }
        }

        return {
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                lastName: updatedUser.lastName,
                role: updatedUser.role,
                updatedAt: updatedUser.updatedAt
            }
        };
    } catch (error) {
        console.error('Error updating user:', error);
        return {
            success: false,
            error: 'Failed to update user'
        };
    }
}

/**
 * Eliminar un usuario
 */
export async function deleteUserWithInheritance(userId: string) {
    try {
        await database.user.delete({
            where: { id: userId }
        });

        return {
            success: true,
            message: 'User deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting user:', error);
        return {
            success: false,
            error: 'Failed to delete user'
        };
    }
}

/**
 * Obtener todos los usuarios con información de herencia
 */
export async function getAllUsersWithInheritance() {
    try {
        const users = await database.user.findMany({
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                createdUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                parent: user.createdBy,
                children: user.createdUsers,
                permissions: user.permissions.map(p => p.permission.name)
            }))
        };
    } catch (error) {
        console.error('Error getting users:', error);
        return {
            success: false,
            error: 'Failed to get users'
        };
    }
}

/**
 * Obtener un usuario específico con información de herencia
 */
export async function getUserByIdWithInheritance(userId: string) {
    try {
        const user = await database.user.findUnique({
            where: { id: userId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                createdUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!user) {
            return {
                success: false,
                error: 'User not found'
            };
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                parent: user.createdBy,
                children: user.createdUsers,
                permissions: user.permissions.map(p => p.permission.name)
            }
        };
    } catch (error) {
        console.error('Error getting user:', error);
        return {
            success: false,
            error: 'Failed to get user'
        };
    }
}

/**
 * Obtener solo los usuarios subordinados del usuario actual
 */
export async function getSubordinateUsers(userId: string) {
    try {
        const users = await database.user.findMany({
            where: {
                createdById: userId // Solo usuarios creados por este usuario
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                createdUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                parent: user.createdBy,
                children: user.createdUsers,
                permissions: user.permissions.map(p => p.permission.name)
            }))
        };
    } catch (error) {
        console.error('Error getting subordinate users:', error);
        return {
            success: false,
            error: 'Failed to get subordinate users'
        };
    }
} 