'use server';

import { cookies } from 'next/headers';
import { createUser, getUserById, verifyUserCredentials, findUserByEmail } from './userService';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { database } from '@repo/database';
import bcrypt from 'bcryptjs';
import type { UserPermission, Permission } from '@repo/database/generated/client';

// Import permissions system
import { ADMIN_PERMISSIONS } from '@repo/auth/server-permissions';

// Cookie expiration (30 days in seconds)
const COOKIE_EXPIRATION = 60 * 60 * 24 * 30;

/**
 * Establecer cookie de manera compatible con Next.js 15
 */
async function setCookie(name: string, value: string, options?: Partial<ResponseCookie>) {
    try {
        const cookieStore = await cookies();

        cookieStore.set(name, value, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: COOKIE_EXPIRATION,
            sameSite: 'lax',
            ...options,
        });
    } catch (error) {
        console.error('Error al establecer cookie:', error);
    }
}

/**
 * Sign in a user with email and password
 */
export async function signIn({ email, password }: { email: string; password: string }) {
    try {
        const authResult = await verifyUserCredentials(email, password);

        if (!authResult.success) {
            return { success: false, message: 'Credenciales inválidas' };
        }

        const user = await database.user.findUnique({
            where: { id: authResult.user?.id || '' },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const permissions = user.permissions.map(p => p.permission.name);

        const token = JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role.toLowerCase(),
            permissions: permissions,
        });

        await setCookie('auth-token', token);

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return { success: false, message: 'Error al iniciar sesión' };
    }
}

/**
 * Sign up a new user
 */
export async function signUp(data: {
    name: string;
    lastName: string;
    email: string;
    password: string;
}) {
    try {
        const allPermissions = await database.permission.findMany({ select: { id: true } });

        const result = await database.user.create({
            data: {
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                password: await bcrypt.hash(data.password, 12),
                role: 'admin',
                permissions: {
                    create: allPermissions.map(p => ({ permissionId: p.id }))
                }
            },
            include: { permissions: { include: { permission: true } } }
        });

        // Set the user as their own creator
        const user = await database.user.update({
            where: { id: result.id },
            data: { createdById: result.id },
            include: { permissions: { include: { permission: true } } }
        });

        const permissions = user.permissions.map(p => p.permission.name);

        const token = JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role.toLowerCase(),
            permissions: permissions,
        });

        await setCookie('auth-token', token);

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    } catch (error) {
        console.error('Error al crear cuenta:', error);
        return {
            success: false,
            message: 'Error inesperado al crear la cuenta',
            error: 'UNEXPECTED_ERROR'
        };
    }
}

/**
 * Sign out the current user
 */
export async function signOut() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar cookie:', error);
        return { success: false, error: 'Error al cerrar sesión' };
    }
}

/**
 * Get the current authenticated user
 * NOTA: Esta función NO modifica cookies cuando se llama desde un Server Component
 */
export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');

        if (!tokenCookie || !tokenCookie.value || tokenCookie.value.trim() === '') {
            return null;
        }

        try {
            const token = JSON.parse(tokenCookie.value);

            if (!token || !token.id) {
                return null;
            }

            const user = await database.user.findUnique({
                where: { id: token.id },
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            });

            if (!user) {
                return null;
            }

            const permissions = user.permissions.map(p => p.permission.name);

            // Verificar si el token en la cookie está desactualizado
            if (JSON.stringify(permissions) !== JSON.stringify(token.permissions)) {
                const newToken = JSON.stringify({ ...token, permissions });
                await setCookie('auth-token', newToken);
            }

            return {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                permissions: permissions,
            };
        } catch (e) {
            console.error('Error al parsear el token, eliminando cookie corrupta', e);
            await signOut();
            return null;
        }
    } catch (error) {
        console.error('Error en getCurrentUser:', error);
        return null;
    }
}

/**
 * Get only the current user ID from cookies
 * Useful for CRUD operations that need the creator ID
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');

        if (!tokenCookie || !tokenCookie.value || tokenCookie.value.trim() === '') {
            return null;
        }

        try {
            const token = JSON.parse(tokenCookie.value);
            return token.id || null;
        } catch (parseError) {
            console.error('Error al analizar el token:', parseError);
            return null;
        }
    } catch (error) {
        console.error('Error al obtener ID de usuario actual:', error);
        return null;
    }
} 