'use server';

import { revalidatePath } from 'next/cache';
import {
    changePasswordService,
    createUser as createUserService,
    deleteUser as deleteUserService,
    updateUser as updateUserService,
} from '@repo/data-services/src/services/userService';
import {
    createUserWithInheritance,
    updateUserWithInheritance,
    deleteUserWithInheritance
} from '@repo/data-services/src/services/userManagementService';
import { z } from 'zod';
import type { UserRole } from '@repo/database';
import { hasPermission } from '@repo/auth/server-permissions';
import { getCurrentUserId } from '@repo/data-services/src/services/authService';
import { database } from '@repo/database';
import type { Dictionary } from '@repo/internationalization';

// Esquema para la actualización del perfil
const profileSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
});

// Esquema para el cambio de contraseña
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

// Esquema para crear/actualizar usuario
const userSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
    role: z.enum(['admin', 'premium', 'user']),
    permissions: z.array(z.string()),
});

export async function updateProfile(userId: string, formData: FormData, dictionary?: Dictionary) {
    try {
        if (!await hasPermission('account:edit_own')) {
            return { success: false, message: dictionary?.app?.account?.profile?.toast?.noPermission || 'No tienes permisos para editar el perfil.' };
        }

        const data = Object.fromEntries(formData.entries());
        const validated = profileSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }

        await updateUserService(userId, { ...validated.data, password: '' });

        revalidatePath('/account');
        return { success: true, message: dictionary?.app?.account?.profile?.toast?.success || 'Perfil actualizado exitosamente' };
    } catch (error) {
        return { success: false, message: dictionary?.app?.account?.profile?.toast?.error || 'Error al actualizar el perfil' };
    }
}

export async function changePassword(userId: string, formData: FormData, dictionary?: Dictionary) {
    try {
        if (!await hasPermission('account:change_password')) {
            return { success: false, message: dictionary?.app?.account?.password?.toast?.noPermission || 'No tienes permisos para cambiar la contraseña.' };
        }

        const data = Object.fromEntries(formData.entries());
        const validated = passwordSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }

        const result = await changePasswordService(
            userId,
            validated.data.currentPassword,
            validated.data.newPassword
        );

        if (!result.success) {
            return { success: false, message: result.message || (dictionary?.app?.account?.password?.toast?.error || 'Error al cambiar la contraseña') };
        }

        revalidatePath('/account');
        return { success: true, message: dictionary?.app?.account?.password?.toast?.success || 'Contraseña actualizada exitosamente' };

    } catch (error) {
        return { success: false, message: dictionary?.app?.account?.password?.toast?.error || 'Error al cambiar la contraseña' };
    }
}

export async function createUser(formData: FormData, dictionary?: Dictionary) {
    try {
        if (!await hasPermission('admin:manage_users')) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.noPermissionCreate || 'No tienes permisos para crear usuarios.' };
        }

        const creatorId = await getCurrentUserId();
        if (!creatorId) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.creatorNotFound || 'No se pudo identificar al creador del usuario.' };
        }

        const data = {
            name: formData.get('name'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            permissions: JSON.parse(formData.get('permissions') as string || '[]'),
        };

        const validated = userSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }
        if (!validated.data.password) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.passwordRequired || "La contraseña es requerida para nuevos usuarios." };
        }

        const { permissions, ...userData } = validated.data;

        // Usar la nueva función con herencia
        const result = await createUserWithInheritance({
            ...userData,
            password: userData.password!,
            createdById: creatorId, // Esto es requerido para la herencia
        });

        if (!result.success) {
            return { success: false, message: result.error || (dictionary?.app?.account?.users?.actions?.userCreationError || 'Error al crear el usuario') };
        }

        revalidatePath('/account');
        return { success: true, message: dictionary?.app?.account?.users?.toast?.created || 'Usuario creado exitosamente' };

    } catch (error) {
        return { success: false, message: dictionary?.app?.account?.users?.actions?.userCreationError || 'Error al crear el usuario' };
    }
}

export async function updateUser(userId: string, formData: FormData, dictionary?: Dictionary) {
    try {
        if (!await hasPermission('admin:manage_users')) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.noPermissionUpdate || 'No tienes permisos para actualizar usuarios.' };
        }

        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.currentUserNotFound || 'No se pudo identificar al usuario actual.' };
        }

        // Verificar que el usuario a actualizar es subordinado del usuario actual
        const userToUpdate = await database.user.findUnique({
            where: { id: userId },
            select: { createdById: true }
        });

        if (!userToUpdate || userToUpdate.createdById !== currentUserId) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.canOnlyUpdateOwn || 'Solo puedes actualizar usuarios que hayas creado.' };
        }

        const data = {
            name: formData.get('name'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            permissions: JSON.parse(formData.get('permissions') as string || '[]'),
        };

        const validated = userSchema.safeParse(data);
        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }

        // Usar la nueva función con herencia
        const result = await updateUserWithInheritance(userId, {
            ...validated.data,
            role: validated.data.role as UserRole,
            password: validated.data.password || '',
            permissions: validated.data.permissions
        });

        if (!result.success) {
            return { success: false, message: result.error || (dictionary?.app?.account?.users?.actions?.userUpdateError || 'Error al actualizar el usuario') };
        }

        revalidatePath('/account');
        return { success: true, message: dictionary?.app?.account?.users?.toast?.updated || 'Usuario actualizado exitosamente' };

    } catch (error) {
        return { success: false, message: dictionary?.app?.account?.users?.actions?.userUpdateError || 'Error al actualizar el usuario' };
    }
}

export async function deleteUser(userId: string, dictionary?: Dictionary) {
    try {
        if (!await hasPermission('admin:manage_users')) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.noPermissionDelete || 'No tienes permisos para eliminar usuarios.' };
        }

        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.currentUserNotFound || 'No se pudo identificar al usuario actual.' };
        }

        // Verificar que el usuario a eliminar es subordinado del usuario actual
        const userToDelete = await database.user.findUnique({
            where: { id: userId },
            select: { createdById: true }
        });

        if (!userToDelete || userToDelete.createdById !== currentUserId) {
            return { success: false, message: dictionary?.app?.account?.users?.actions?.canOnlyDeleteOwn || 'Solo puedes eliminar usuarios que hayas creado.' };
        }

        const result = await deleteUserWithInheritance(userId);

        if (!result.success) {
            return { success: false, message: result.error || (dictionary?.app?.account?.users?.actions?.userDeleteError || 'Error al eliminar el usuario') };
        }

        revalidatePath('/account');
        return { success: true, message: dictionary?.app?.account?.users?.toast?.deleted || 'Usuario eliminado exitosamente' };

    } catch (error) {
        return { success: false, message: dictionary?.app?.account?.users?.actions?.userDeleteError || 'Error al eliminar el usuario' };
    }
} 