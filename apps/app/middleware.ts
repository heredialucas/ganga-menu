import { NextRequest, NextResponse } from 'next/server';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { env } from './env';
import { internationalizationMiddleware } from '@repo/internationalization/middleware';
// Dynamic role system - easily extendable
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  // Add more roles as needed
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

// Role configuration with route permissions
interface RoleConfig {
  defaultRedirect: string;
  allowedRoutes: string[];
}

// Map roles to their configurations
// To add a new role, simply add a new entry here
const ROLE_CONFIGURATION: Record<Role, RoleConfig> = {
  [ROLES.ADMIN]: {
    defaultRedirect: '/admin/dashboard',
    allowedRoutes: ['/admin']
  },
  [ROLES.USER]: {
    defaultRedirect: '/client/dashboard',
    allowedRoutes: ['/client']
  }
  // Example for adding a new role:
  // [ROLES.PROFESSIONAL]: {
  //   defaultRedirect: '/professional/dashboard',
  //   allowedRoutes: ['/professional']
  // }
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks',
  '/access-denied',
  '/menu', // Public menu pages for sharing
];

// Authentication cookie name
const AUTH_COOKIE_NAME = 'auth-token';

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

// Check if user has access to the current route based on their role
const hasAccessToRoute = (pathname: string, userRole: Role): boolean => {
  // If user doesn't have a configured role, they don't have access
  if (!ROLE_CONFIGURATION[userRole]) return false;

  // Check if current route is allowed for user's role
  return ROLE_CONFIGURATION[userRole].allowedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
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

  // Parse token if it exists
  if (tokenCookie) {
    try {
      const token = JSON.parse(tokenCookie.value);
      userId = token.id;
      userRole = getUserRole(token.role);
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }

  // User is not authenticated but trying to access an authenticated route
  if (!userId && isAuthenticatedRoute(pathnameWithoutLocale)) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
  }

  // User is authenticated
  if (userId) {
    // Root path redirect to role-specific dashboard
    if (pathnameWithoutLocale === '/' || pathnameWithoutLocale === '') {
      const redirectUrl = ROLE_CONFIGURATION[userRole]?.defaultRedirect ||
        ROLE_CONFIGURATION[ROLES.USER].defaultRedirect;
      return NextResponse.redirect(new URL(`/${locale}${redirectUrl}`, req.url));
    }

    // Check if user has access to the requested route
    if (!hasAccessToRoute(pathnameWithoutLocale, userRole)) {
      // Admin can access any route
      if (userRole === ROLES.ADMIN) {
        return securityHeaders();
      }

      // Handle specific route access permissions

      if (pathnameWithoutLocale.startsWith('/admin')) {
        return NextResponse.redirect(new URL(`/${locale}/access-denied`, req.url));
      }

      // Otherwise redirect to their default route
      const redirectUrl = ROLE_CONFIGURATION[userRole]?.defaultRedirect ||
        ROLE_CONFIGURATION[ROLES.USER].defaultRedirect;
      return NextResponse.redirect(new URL(`/${locale}${redirectUrl}`, req.url));
    }
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
