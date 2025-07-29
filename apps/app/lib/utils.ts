import { env } from '@/env';

/**
 * Formatea un número como moneda en formato ARS (pesos argentinos)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
    }).format(amount);
}

/**
 * Obtiene la URL base de la aplicación
 */
export function getAppUrl() {
    return env.NEXT_PUBLIC_APP_URL;
}

/**
 * Obtiene la URL del socket IO
 */
export function getSocketUrl() {
    return env.NEXT_PUBLIC_SOCKET_IO_URL;
}

/**
 * Obtiene la URL base de web-base
 */
export function getWebBaseUrl() {
    return env.NEXT_PUBLIC_WEB_BASE_URL;
}

/**
 * Construye una URL completa para la aplicación
 */
export function buildAppUrl(path: string = '') {
    const baseUrl = getAppUrl();
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Construye una URL completa para web-base
 */
export function buildWebBaseUrl(path: string = '') {
    const baseUrl = getWebBaseUrl();
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
} 