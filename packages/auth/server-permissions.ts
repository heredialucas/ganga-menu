import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { redirect } from 'next/navigation';

/**
 * Sistema de permisos del lado del servidor para Ganga Menu
 */

// Tipos de permisos disponibles para el contexto de restaurante
export type Permission =
    // Menu Management (Gestión del Menú - incluye platos, categorías, especiales)
    | 'menu:view'
    | 'menu:edit'
    // Restaurant Management (Gestión del Restaurante - incluye config y diseño)
    | 'restaurant:view'
    | 'restaurant:edit'
    | 'restaurant:design'
    | 'restaurant:qr_codes'
    // Orders Management (Gestión de Órdenes)
    | 'orders:view'
    | 'orders:edit'
    // Services Management (Gestión de Servicios - códigos de acceso)
    | 'services:view'
    | 'services:edit'
    // Account (Cuenta propia)
    | 'account:view_own'
    | 'account:edit_own'
    | 'account:change_password'
    // Admin (Administración)
    | 'admin:full_access'
    | 'admin:manage_users'
    | 'admin:system_settings';

// Permisos por defecto para admins (acceso total)
export const ADMIN_PERMISSIONS: Permission[] = [
    // Menu Management
    'menu:view',
    'menu:edit',
    // Restaurant
    'restaurant:view',
    'restaurant:edit',
    'restaurant:design',
    'restaurant:qr_codes',
    // Orders
    'orders:view',
    'orders:edit',
    // Services
    'services:view',
    'services:edit',
    // Account
    'account:view_own',
    'account:edit_own',
    'account:change_password',
    // Admin
    'admin:full_access',
    'admin:manage_users',
    'admin:system_settings',
];

/**
 * Obtiene el usuario actual y sus permisos desde las cookies
 */
export async function getCurrentUserWithPermissions() {
    const user = await getCurrentUser();
    if (!user) {
        return null;
    }

    const roleStr = user.role.toLowerCase();

    return {
        ...user,
        permissions: user.permissions || [],
        isAdmin: roleStr === 'admin',
        isPremium: roleStr === 'premium',
        isUser: roleStr === 'user',
    };
}

/**
 * Verifica si el usuario actual tiene un permiso específico
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    if (!userWithPermissions) return false;

    return userWithPermissions.permissions.includes(permission);
}

/**
 * Verifica si el usuario actual tiene todos los permisos especificados
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    if (!userWithPermissions) return false;

    return permissions.every(permission => userWithPermissions.permissions.includes(permission));
}

/**
 * Verifica si el usuario actual tiene al menos uno de los permisos especificados
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    if (!userWithPermissions) return false;

    return permissions.some(permission => userWithPermissions.permissions.includes(permission));
}

/**
 * Verifica si el usuario actual es administrador
 */
export async function isAdmin(): Promise<boolean> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    return userWithPermissions?.isAdmin || false;
}

/**
 * Verifica si el usuario actual es premium
 */
export async function isPremium(): Promise<boolean> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    return userWithPermissions?.isPremium || false;
}

/**
 * Lanza un error si el usuario actual no tiene el permiso especificado.
 * Si se proporciona un locale, redirige a la página de acceso denegado.
 */
export async function requirePermission(permission: Permission, locale?: string): Promise<void> {
    const hasAccess = await hasPermission(permission);
    if (!hasAccess) {
        if (locale) {
            redirect(`/${locale}/access-denied`);
        }
        // Fallback en caso de que no se pueda redirigir con locale
        throw new Error(`Access denied: Missing permission ${permission}`);
    }
}

/**
 * Middleware para verificar si es admin - lanza error si no es admin
 */
export async function requireAdmin(): Promise<void> {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
        throw new Error('Access denied: Admin privileges required');
    }
}

/**
 * Middleware para verificar si es admin o premium - lanza error si no tiene el nivel suficiente
 */
export async function requireAdminOrPremium(): Promise<void> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    if (!userWithPermissions?.isAdmin && !userWithPermissions?.isPremium) {
        throw new Error('Access denied: Admin or Premium privileges required');
    }
}

/**
 * Configuración del sidebar basada en permisos
 */
export interface SidebarItem {
    label: string;
    mobileLabel: string;
    href: string;
    icon: string;
    allRequiredPermissions?: Permission[]; // AND condition
    anyRequiredPermissions?: Permission[]; // OR condition
    adminOnly?: boolean;
    premiumOnly?: boolean;
}

export const SIDEBAR_CONFIG: SidebarItem[] = [
    {
        label: 'sidebar.account',
        mobileLabel: 'sidebar.account',
        href: '/account',
        icon: 'UsersIcon',
        allRequiredPermissions: ['account:view_own'],
    },
    {
        label: 'sidebar.menu',
        mobileLabel: 'sidebar.menu',
        href: '/menu',
        icon: 'UtensilsCrossed',
        allRequiredPermissions: ['menu:view'],
    },
    {
        label: 'sidebar.restaurant',
        mobileLabel: 'sidebar.restaurant',
        href: '/restaurant',
        icon: 'Layout',
        allRequiredPermissions: ['restaurant:view'],
    },
    {
        label: 'sidebar.services',
        mobileLabel: 'sidebar.services',
        href: '/services',
        icon: 'Settings',
        anyRequiredPermissions: ['services:view'],
    }, {
        label: 'sidebar.orders',
        mobileLabel: 'sidebar.orders',
        href: '/orders',
        icon: 'ClipboardList',
        allRequiredPermissions: ['orders:view'],
    },
];

/**
 * Obtiene los elementos del sidebar autorizados para el usuario actual
 */
export async function getAuthorizedSidebarItems(): Promise<SidebarItem[]> {
    const userWithPermissions = await getCurrentUserWithPermissions();
    if (!userWithPermissions) return [];

    const authorizedItems = [];

    for (const item of SIDEBAR_CONFIG) {
        // Si es adminOnly y el usuario no es admin, no incluir
        if (item.adminOnly && !userWithPermissions.isAdmin) {
            continue;
        }

        // Si es premiumOnly y el usuario no es admin ni premium, no incluir
        if (item.premiumOnly && !userWithPermissions.isAdmin && !userWithPermissions.isPremium) {
            continue;
        }

        // Check for all required permissions (AND condition)
        const hasAllPermissions = !item.allRequiredPermissions || item.allRequiredPermissions.every(
            permission => userWithPermissions.permissions.includes(permission)
        );

        // Check for any required permissions (OR condition)
        const hasAnyPermissions = !item.anyRequiredPermissions || item.anyRequiredPermissions.some(
            permission => userWithPermissions.permissions.includes(permission)
        );

        if (hasAllPermissions && hasAnyPermissions) {
            authorizedItems.push(item);
        }
    }

    return authorizedItems;
} 