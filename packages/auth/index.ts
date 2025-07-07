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
} from './server';

// Middleware
export { authMiddleware } from './middleware';

// Environment and keys
export { keys } from './keys'; 