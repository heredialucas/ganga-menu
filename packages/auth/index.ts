// Client-side exports
export { signIn, signOut, signUp } from './client';
export { AuthProvider } from './provider';
export { SignIn } from './components/sign-in';
export { SignUp } from './components/sign-up';

// Server-side exports (only available in server components)
export {
    getCurrentUser,
    type Permission,
    ADMIN_PERMISSIONS,
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
} from './server';

// Permission Guard Components
export {
    PermissionGuard,
    SinglePermissionGuard,
    AllPermissionsGuard,
    AnyPermissionGuard,
} from './components/PermissionGuard';

// Middleware
export { authMiddleware } from './middleware';

// Environment and keys
export { keys } from './keys'; 