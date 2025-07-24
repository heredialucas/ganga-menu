import { hasPermission } from '@repo/auth/server-permissions';
import type { Permission } from '@repo/auth/server-permissions';

interface PermissionWrapperProps {
    children: React.ReactNode;
    requiredPermissions: Permission[];
    fallback?: React.ReactNode;
}

export async function PermissionWrapper({
    children,
    requiredPermissions,
    fallback = null
}: PermissionWrapperProps) {
    const hasAllPermissions = await Promise.all(
        requiredPermissions.map(permission => hasPermission(permission))
    ).then(results => results.every(result => result));

    if (!hasAllPermissions) {
        return fallback;
    }

    return <>{children}</>;
} 