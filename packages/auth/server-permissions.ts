import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { redirect } from 'next/navigation';

/**
 * Sistema de permisos del lado del servidor para Ganga Menu
 */

// Tipos de permisos disponibles para el contexto de restaurante
export type Permission =
    // Dishes (Platos)
    | 'dishes:view'
    | 'dishes:create'
    | 'dishes:edit'
    | 'dishes:delete'
    | 'dishes:manage_status'
    // Categories (Categorías)
    | 'categories:view'
    | 'categories:create'
    | 'categories:edit'
    | 'categories:delete'
    | 'categories:manage_order'
    // Daily Specials (Especiales del día)
    | 'daily_specials:view'
    | 'daily_specials:create'
    | 'daily_specials:edit'
    | 'daily_specials:delete'
    // Restaurant Config (Configuración del restaurante)
    | 'restaurant:view_config'
    | 'restaurant:edit_config'
    | 'restaurant:manage_settings'
    // Restaurant Design (Diseño del restaurante)
    | 'restaurant:view_design'
    | 'restaurant:edit_design'
    // Orders (Órdenes)
    | 'orders:view'
    | 'orders:create'
    | 'orders:edit'
    | 'orders:delete'
    | 'orders:manage_status'
    // Kitchen (Cocina)
    | 'kitchen:view_orders'
    | 'kitchen:update_status'
    // Waiter (Mozo)
    | 'waiter:view_orders'
    | 'waiter:create_orders'
    | 'waiter:view_menu'
    // Menu Sharing (Menú público)
    | 'menu:view_public'
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
    // Dishes
    'dishes:view',
    'dishes:create',
    'dishes:edit',
    'dishes:delete',
    'dishes:manage_status',
    // Categories
    'categories:view',
    'categories:create',
    'categories:edit',
    'categories:delete',
    'categories:manage_order',
    // Daily Specials
    'daily_specials:view',
    'daily_specials:create',
    'daily_specials:edit',
    'daily_specials:delete',
    // Restaurant
    'restaurant:view_config',
    'restaurant:edit_config',
    'restaurant:manage_settings',
    'restaurant:view_design',
    'restaurant:edit_design',
    // Orders
    'orders:view',
    'orders:create',
    'orders:edit',
    'orders:delete',
    'orders:manage_status',
    // Kitchen
    'kitchen:view_orders',
    'kitchen:update_status',
    // Waiter
    'waiter:view_orders',
    'waiter:create_orders',
    'waiter:view_menu',
    // Menu
    'menu:view_public',
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
    requiredPermissions: Permission[];
    adminOnly?: boolean;
    premiumOnly?: boolean;
}

export const SIDEBAR_CONFIG: SidebarItem[] = [
    {
        label: 'dashboard',
        mobileLabel: 'dashboardMobile',
        href: '/admin/dashboard',
        icon: 'LayoutDashboard',
        requiredPermissions: ['admin:full_access'],
        adminOnly: true,
    },
    {
        label: 'dishes',
        mobileLabel: 'dishesMenu',
        href: '/admin/dishes',
        icon: 'UtensilsCrossed',
        requiredPermissions: ['dishes:view'],
    },
    {
        label: 'categories',
        mobileLabel: 'categoriesMenu',
        href: '/admin/categories',
        icon: 'FolderOpen',
        requiredPermissions: ['categories:view'],
    },
    {
        label: 'dailySpecials',
        mobileLabel: 'specialsMenu',
        href: '/admin/daily-specials',
        icon: 'Star',
        requiredPermissions: ['daily_specials:view'],
    },
    {
        label: 'restaurant',
        mobileLabel: 'restaurantMenu',
        href: '/admin/restaurant',
        icon: 'Store',
        requiredPermissions: ['restaurant:view_config'],
    },
    {
        label: 'orders',
        mobileLabel: 'ordersMenu',
        href: '/admin/orders',
        icon: 'ShoppingCart',
        requiredPermissions: ['orders:view'],
    },
    {
        label: 'account',
        mobileLabel: 'accountMobile',
        href: '/account',
        icon: 'User',
        requiredPermissions: ['account:view_own'],
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

        // Verificar si tiene todos los permisos requeridos
        const hasRequiredPermissions = item.requiredPermissions.every(
            permission => userWithPermissions.permissions.includes(permission)
        );

        if (hasRequiredPermissions) {
            authorizedItems.push(item);
        }
    }

    return authorizedItems;
} 