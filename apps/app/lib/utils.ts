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

export function getAppUrl() {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:4000';
    }
    return process.env.NEXT_PUBLIC_APP_URL || '';
} 