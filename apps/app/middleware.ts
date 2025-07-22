import { NextRequest, NextResponse } from 'next/server';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { env } from './env';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
import { COOKIE_NAMES } from '@repo/data-services/src/constants';
// --- 1. Definición de Roles ---
const ROLES = {
  ADMIN: 'admin',
  PREMIUM: 'premium',
  USER: 'user',
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

// --- 2. Permisos y Rutas con sistema granular ---
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Main 4 sections
  '/account': ['account:view_own'],
  '/menu': ['dishes:view'], // Menu section includes dishes, categories, daily specials
  '/waiter': ['waiter:view_orders', 'waiter:create_orders'],
  '/restaurant': ['restaurant:view_config'],

  // Menu sub-routes
  '/menu/dishes': ['dishes:view'],
  '/menu/categories': ['categories:view'],
  '/menu/daily-specials': ['daily_specials:view'],

  // Waiter sub-routes
  '/waiter/orders': ['orders:view'],
  '/waiter/history': ['orders:view'],

  // Restaurant sub-routes
  '/restaurant/config': ['restaurant:view_config'],
  '/restaurant/design': ['restaurant:view_design'],

  // Kitchen routes (existing)
  '/kitchen': ['kitchen:view_orders'],

  // Client routes (if they exist - fallback)
  '/client': ['account:view_own'],
};

// --- 3. Redirección por Rol con soporte para rutas existentes ---
const getDefaultRedirect = (userRole: Role, userPermissions: string[]): string => {
  if (userRole === ROLES.ADMIN || userRole === ROLES.PREMIUM) {
    // Redirigir a la sección de menú como página principal
    return '/menu';
  }

  // Para usuarios regulares, puede acceder a su cuenta
  if (userPermissions.includes('account:view_own')) {
    return '/account';
  }

  // Fallback a cliente si existe esa ruta
  return '/client/dashboard';
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks',
  '/access-denied',
  '/menu', // Menu público - accesible sin autenticación
  '/waiter', // Waiter - requiere código pero no autenticación de usuario
  '/kitchen', // Kitchen - requiere código pero no autenticación de usuario
];

// Authentication cookie name
const AUTH_COOKIE_NAME = COOKIE_NAMES.AUTH_TOKEN;

// Security middleware
const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

// Check if a route is a public route
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};

// Check if the URL path is within the authenticated route group
const isAuthenticatedRoute = (pathname: string): boolean => {
  // All routes except those in PUBLIC_ROUTES are considered authenticated
  return !isPublicRoute(pathname);
};

// --- 4. Lógica de Acceso Mejorada con Permisos ---
const hasAccessToRoute = (pathname: string, userRole: Role, userPermissions: string[] = []): boolean => {
  // El Admin y Premium siempre tienen acceso a todo - sin verificar permisos específicos
  if (userRole === ROLES.ADMIN || userRole === ROLES.PREMIUM) {
    return true;
  }

  // Para usuarios normales, verificar permisos específicos
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  if (matchingRoute) {
    const requiredPermissions = ROUTE_PERMISSIONS[matchingRoute];
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }

  // Si está en una ruta de primer nivel pero no hay una regla definida, denegar por seguridad
  if (!pathname.includes('/', 1)) {
    return false;
  }

  // Por defecto, permitir acceso a sub-rutas si la ruta base está permitida
  return !!matchingRoute;
};

// Determine user role from session claims
const getUserRole = (role?: string): Role => {
  if (!role) return ROLES.USER;

  // Normalizar a minúsculas
  const roleStr = role.toLowerCase();

  // Check for admin role
  if (roleStr === ROLES.ADMIN) {
    return ROLES.ADMIN;
  }

  if (roleStr === ROLES.PREMIUM) {
    return ROLES.PREMIUM;
  }

  // Add more role checks as needed
  // if (roleStr === ROLES.PROFESSIONAL) {
  //   return ROLES.PROFESSIONAL;
  // }

  // Default to USER role
  return ROLES.USER;
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Si es un webhook de la API, no procesar nada más
  if (pathname.startsWith('/api/webhooks')) {
    return;
  }

  // Primero aplicar middleware de internacionalización
  const i18nResponse = internationalizationMiddleware({
    headers: req.headers,
    nextUrl: req.nextUrl
  });
  if (i18nResponse) {
    return i18nResponse;
  }

  // Extraer el locale de la URL
  const locale = pathname.match(/^\/([a-z]{2})(?:\/|$)/)?.[1] || 'es';
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '/');

  // Always allow public routes
  if (isPublicRoute(pathnameWithoutLocale)) {
    return securityHeaders();
  }

  // Get authentication cookie
  const tokenCookie = req.cookies.get(AUTH_COOKIE_NAME);
  let userId: string | undefined;
  let userRole: Role = ROLES.USER;
  let userPermissions: string[] = [];

  // Parse token if it exists
  if (tokenCookie) {
    try {
      const token = JSON.parse(tokenCookie.value);
      userId = token.id;
      userRole = getUserRole(token.role);
      userPermissions = token.permissions || [];

    } catch (error) {
      console.error('Error parsing auth token:', error);
      // Si el token es inválido, tratar al usuario como no autenticado
      const response = NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
      response.cookies.delete(AUTH_COOKIE_NAME);
      response.cookies.delete('auth-token'); // También eliminar cookie con nombre antiguo por compatibilidad
      return response;
    }
  }

  // Si no hay ID de usuario y la ruta no es pública, redirigir a sign-in
  if (!userId) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in?redirect=${pathname}`, req.url));
  }

  // Si el usuario está autenticado
  // Redirigir desde la raíz a su página por defecto
  if (pathnameWithoutLocale === '/' || pathnameWithoutLocale === '') {
    const redirectUrl = getDefaultRedirect(userRole, userPermissions);
    return NextResponse.redirect(new URL(`/${locale}${redirectUrl}`, req.url));
  }

  // Verificar si tiene acceso a la ruta solicitada
  const hasAccess = hasAccessToRoute(pathnameWithoutLocale, userRole, userPermissions);

  if (!hasAccess) {
    return NextResponse.redirect(new URL(`/${locale}/access-denied`, req.url));
  }

  // Apply security headers
  return securityHeaders();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
