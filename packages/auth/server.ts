// Export our own auth utilities
export { getCurrentUser } from '@repo/data-services/src/services/authService';

// Export permissions system
export {
    type Permission,
    ADMIN_PERMISSIONS,
    PREMIUM_PERMISSIONS,
    USER_DEFAULT_PERMISSIONS,
    getCurrentUserWithPermissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isPremium,
    requirePermission,
    requireAdmin,
    requireAdminOrPremium,
    type SidebarItem,
    SIDEBAR_CONFIG,
    getAuthorizedSidebarItems,
} from './server-permissions';
