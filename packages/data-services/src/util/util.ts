/**
 * Extraer el key de una URL pública de R2
 */
export function extractR2KeyFromUrl(url: string): string | null {
    if (!url) return null;
    const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;
    if (!publicDomain) return null;
    const parts = url.split(publicDomain);
    if (parts.length < 2) return null;
    // Quitar el slash inicial si existe
    return parts[1].replace(/^\//, '');
}
