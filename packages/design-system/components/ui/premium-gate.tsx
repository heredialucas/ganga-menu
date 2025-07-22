import { ReactNode } from 'react';

type UserRole = 'admin' | 'premium' | 'user';

interface PremiumGateProps {
    userRole?: UserRole;
    minRole?: UserRole; // Rol mínimo requerido para ver el contenido
    children?: ReactNode;
    fallback?: ReactNode;
    showForHigherRoles?: boolean;
    userId?: string; // ID del usuario para verificar herencia
}

/**
 * Componente wrapper que controla la visibilidad del contenido basado en el rol del usuario
 * 
 * @param userRole - Rol del usuario (admin, premium, user)
 * @param minRole - Rol mínimo requerido para ver el contenido
 * @param children - Contenido a mostrar si el usuario tiene permisos
 * @param fallback - Contenido alternativo si el usuario no tiene permisos
 * @param showForHigherRoles - Si es true, usuarios con roles superiores también pueden ver el contenido
 * @param userId - ID del usuario para verificar herencia del padre
 */
export function PremiumGate({
    userRole = 'user',
    minRole = 'user',
    children = null,
    fallback = null,
    showForHigherRoles = true,
    userId
}: PremiumGateProps) {
    // Definir jerarquía de roles según el schema de la base de datos
    const roleHierarchy: Record<UserRole, number> = {
        'user': 0,
        'premium': 1,
        'admin': 2
    };

    const userLevel = roleHierarchy[userRole];
    const requiredLevel = roleHierarchy[minRole];

    // Verificar si el usuario tiene permisos
    const hasAccess = showForHigherRoles
        ? userLevel >= requiredLevel
        : userLevel === requiredLevel;

    if (hasAccess) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}

/**
 * Hook para verificar si un usuario tiene acceso a funcionalidades premium
 */
export function usePremiumAccess(userRole?: UserRole, minRole: UserRole = 'premium') {
    const roleToCheck = userRole || 'user';

    const roleHierarchy: Record<UserRole, number> = {
        'user': 0,
        'premium': 1,
        'admin': 2
    };

    const userLevel = roleHierarchy[roleToCheck];
    const requiredLevel = roleHierarchy[minRole];

    return {
        hasAccess: userLevel >= requiredLevel,
        isPremium: roleToCheck === 'premium' || roleToCheck === 'admin',
        isAdmin: roleToCheck === 'admin',
        isUser: roleToCheck === 'user',
        userLevel,
        requiredLevel
    };
} 