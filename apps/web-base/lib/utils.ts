import { env } from '@/env';

/**
 * Obtiene la URL base de la aplicación
 */
export function getAppUrl() {
    return env.NEXT_PUBLIC_APP_URL;
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