'use server';

import { revalidatePath } from 'next/cache';
import {
    changePassword as changePasswordService,
    createUser as createUserService,
    deleteUser as deleteUserService,
    updateUser as updateUserService,
} from '@repo/data-services/src/services/userService';
import { z } from 'zod';
import type { UserRole } from '@repo/database';
import { hasPermission } from '@repo/auth/server-permissions';

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
    role: z.enum(['admin', 'seller']),
    permissions: z.array(z.string()),
});

export async function updateProfile(userId: string, formData: FormData) {
    try {
        if (!await hasPermission('account:edit_own')) {
            return { success: false, message: 'No tienes permisos para editar el perfil.' };
        }

        const data = Object.fromEntries(formData.entries());
        const validated = profileSchema.safeParse(data);

        if (!validated.success) {
            return { success: false, message: validated.error.errors[0].message };
        }

        await updateUserService(userId, { ...validated.data, password: '' });

        revalidatePath('/account');
        return { success: true, message: 'Perfil actualizado exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al actualizar el perfil' };
    }
}

export async function changePassword(userId: string, formData: FormData) {
    try {
        if (!await hasPermission('account:change_password')) {
            return { success: false, message: 'No tienes permisos para cambiar la contraseña.' };
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
            return { success: false, message: result.message || 'Error al cambiar la contraseña' };
        }

        revalidatePath('/account');
        return { success: true, message: 'Contraseña actualizada exitosamente' };

    } catch (error) {
        return { success: false, message: 'Error al cambiar la contraseña' };
    }
}

export async function createUser(formData: FormData) {
    try {
        if (!await hasPermission('account:manage_users')) {
            return { success: false, message: 'No tienes permisos para crear usuarios.' };
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
            return { success: false, message: "La contraseña es requerida para nuevos usuarios." };
        }

        const result = await createUserService({ ...validated.data, role: validated.data.role as UserRole, password: validated.data.password });

        if (!result.success) {
            return { success: false, message: result.message || 'Error al crear el usuario' };
        }

        revalidatePath('/account');
        return { success: true, message: 'Usuario creado exitosamente' };

    } catch (error) {
        return { success: false, message: 'Error al crear el usuario' };
    }
}

export async function updateUser(userId: string, formData: FormData) {
    try {
        if (!await hasPermission('account:manage_users')) {
            return { success: false, message: 'No tienes permisos para actualizar usuarios.' };
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

        await updateUserService(userId, { ...validated.data, role: validated.data.role as UserRole, password: validated.data.password || '' });

        revalidatePath('/account');
        return { success: true, message: 'Usuario actualizado exitosamente' };

    } catch (error) {
        return { success: false, message: 'Error al actualizar el usuario' };
    }
}

export async function deleteUser(userId: string) {
    try {
        if (!await hasPermission('account:manage_users')) {
            return { success: false, message: 'No tienes permisos para eliminar usuarios.' };
        }

        await deleteUserService(userId);
        revalidatePath('/account');
        return { success: true, message: 'Usuario eliminado exitosamente' };

    } catch (error) {
        return { success: false, message: 'Error al eliminar el usuario' };
    }
} 