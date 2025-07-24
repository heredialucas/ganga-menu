import { hasPermission, hasAllPermissions, hasAnyPermission } from '@repo/auth/server-permissions';
import type { Permission } from '@repo/auth/server-permissions';

interface PermissionGuardProps {
    children: React.ReactNode;
    requiredPermissions?: Permission[];
    anyRequiredPermissions?: Permission[];
    allRequiredPermissions?: Permission[];
    fallback?: React.ReactNode;
    showFallback?: boolean;
    mode?: 'hide' | 'readonly' | 'disabled';
}

/**
 * Componente wrapper para control de permisos a nivel de servidor
 * 
 * @param children - Contenido a mostrar si el usuario tiene permisos
 * @param requiredPermissions - Permisos requeridos (cualquiera de ellos)
 * @param anyRequiredPermissions - Permisos requeridos (cualquiera de ellos) - alias de requiredPermissions
 * @param allRequiredPermissions - Permisos requeridos (todos deben estar presentes)
 * @param fallback - Contenido a mostrar si no tiene permisos
 * @param showFallback - Si mostrar el fallback o no mostrar nada
 * @param mode - Modo de comportamiento: 'hide' (ocultar), 'readonly' (solo lectura), 'disabled' (deshabilitado)
 */
export async function PermissionGuard({
    children,
    requiredPermissions = [],
    anyRequiredPermissions = [],
    allRequiredPermissions = [],
    fallback = null,
    showFallback = false,
    mode = 'hide'
}: PermissionGuardProps) {
    // Determinar qué tipo de verificación usar
    const permissionsToCheck = allRequiredPermissions.length > 0
        ? allRequiredPermissions
        : requiredPermissions.length > 0
            ? requiredPermissions
            : anyRequiredPermissions;

    if (permissionsToCheck.length === 0) {
        // Si no hay permisos especificados, mostrar el contenido
        return <>{children}</>;
    }

    // Verificar permisos según el tipo
    let hasAccess = false;

    if (allRequiredPermissions.length > 0) {
        hasAccess = await hasAllPermissions(allRequiredPermissions);
    } else {
        hasAccess = await hasAnyPermission(permissionsToCheck);
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    // Si no tiene acceso, manejar según el modo
    if (mode === 'hide') {
        return showFallback ? <>{fallback}</> : null;
    }

    // Para modos readonly y disabled, siempre mostrar el contenido
    return <>{children}</>;
}

/**
 * Componente wrapper para verificar un solo permiso
 */
export async function SinglePermissionGuard({
    children,
    permission,
    fallback = null,
    showFallback = false,
    mode = 'hide'
}: {
    children: React.ReactNode;
    permission: Permission;
    fallback?: React.ReactNode;
    showFallback?: boolean;
    mode?: 'hide' | 'readonly' | 'disabled';
}) {
    const hasAccess = await hasPermission(permission);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (mode === 'hide') {
        return showFallback ? <>{fallback}</> : null;
    }

    // Para modos readonly y disabled, siempre mostrar el contenido
    return <>{children}</>;
}

/**
 * Componente wrapper para verificar múltiples permisos (todos requeridos)
 */
export async function AllPermissionsGuard({
    children,
    permissions,
    fallback = null,
    showFallback = false,
    mode = 'hide'
}: {
    children: React.ReactNode;
    permissions: Permission[];
    fallback?: React.ReactNode;
    showFallback?: boolean;
    mode?: 'hide' | 'readonly' | 'disabled';
}) {
    const hasAccess = await hasAllPermissions(permissions);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (mode === 'hide') {
        return showFallback ? <>{fallback}</> : null;
    }

    // Para modos readonly y disabled, siempre mostrar el contenido
    return <>{children}</>;
}

/**
 * Componente wrapper para verificar múltiples permisos (cualquiera requerido)
 */
export async function AnyPermissionGuard({
    children,
    permissions,
    fallback = null,
    showFallback = false,
    mode = 'hide'
}: {
    children: React.ReactNode;
    permissions: Permission[];
    fallback?: React.ReactNode;
    showFallback?: boolean;
    mode?: 'hide' | 'readonly' | 'disabled';
}) {
    const hasAccess = await hasAnyPermission(permissions);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (mode === 'hide') {
        return showFallback ? <>{fallback}</> : null;
    }

    // Para modos readonly y disabled, siempre mostrar el contenido
    return <>{children}</>;
}

/**
 * Hook para obtener el estado de permisos en componentes cliente
 */
export function usePermissionState(hasPermission: boolean, mode: 'hide' | 'readonly' | 'disabled' = 'hide') {
    if (hasPermission) {
        return {
            isVisible: true,
            isEditable: true,
            isDisabled: false,
            showActions: true
        };
    }

    switch (mode) {
        case 'hide':
            return {
                isVisible: false,
                isEditable: false,
                isDisabled: true,
                showActions: false
            };
        case 'readonly':
            return {
                isVisible: true,
                isEditable: false,
                isDisabled: true,
                showActions: false
            };
        case 'disabled':
            return {
                isVisible: true,
                isEditable: false,
                isDisabled: true,
                showActions: false
            };
        default:
            return {
                isVisible: false,
                isEditable: false,
                isDisabled: true,
                showActions: false
            };
    }
} 