import { env } from '@/env';

/**
 * Obtiene la URL base de la aplicación
 */
export function getAppUrl() {
    return env.NEXT_PUBLIC_APP_URL;
}

/**
 * Obtiene la URL base de la API
 */
export function getApiBaseUrl() {
    return env.NEXT_PUBLIC_API_BASE_URL;
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

/**
 * Construye una URL completa para la API
 */
export function buildApiUrl(path: string = '') {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
} 