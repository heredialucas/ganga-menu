import { env } from '@/env';

/**
 * Obtiene la URL base de la aplicación
 * En desarrollo usa localhost:4000, en producción usa la variable de entorno
 */
export function getAppUrl() {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:4000';
    }
    return env.NEXT_PUBLIC_APP_URL;
}

/**
 * Obtiene la URL base de la aplicación
 * En desarrollo usa localhost:4000, en producción usa la variable de entorno
 */
export function getWebBaseUrl() {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:4001';
    }
    return env.NEXT_PUBLIC_WEB_BASE_URL;
}

/**
 * Obtiene las URLs de redes sociales
 */
export function getSocialUrls() {
    return {
        facebook: env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/',
        instagram: env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/',
        linkedin: env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/',
    };
}

/**
 * Construye una URL completa para la aplicación
 */
export function buildAppUrl(path: string = '') {
    const baseUrl = getAppUrl();
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
} 