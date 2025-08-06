'use client';

import { useState, useEffect } from 'react';

interface LocationData {
    country: string;
    currency: string;
    symbol: string;
    price: string;
    paymentLink: string;
}

// Países de Europa
const EUROPEAN_COUNTRIES = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
    'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES'
];

// Países anglosajones
const ANGLOSAXON_COUNTRIES = ['US', 'CA', 'AU', 'NZ', 'GB'];

// Países de Latinoamérica (excluyendo Argentina)
const LATIN_AMERICAN_COUNTRIES = [
    'MX', 'BR', 'CL', 'CO', 'PE', 'UY', 'PY', 'BO', 'EC', 'VE', 'CR', 'PA', 'GT',
    'SV', 'HN', 'NI', 'CU', 'DO', 'PR', 'JM', 'TT', 'BB', 'GD', 'LC', 'VC', 'AG'
];

// Función para obtener el link de pago según la región
const getPaymentLink = (countryCode: string, isDevelopment: boolean) => {
    const baseUrl = isDevelopment
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_LINK_TEST
        : process.env.NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE;

    // Si no hay baseUrl, usar un link por defecto
    if (!baseUrl) {
        return 'https://buy.stripe.com/test_link';
    }

    // Para Argentina, no usar Stripe (usar MercadoPago)
    if (countryCode === 'AR') {
        return '';
    }

    // Para Europa, usar el link de Europa
    if (EUROPEAN_COUNTRIES.includes(countryCode)) {
        return `${baseUrl}?prefilled_promotion_code=EUROPE`;
    }

    // Para países anglosajones, usar el link estándar
    if (ANGLOSAXON_COUNTRIES.includes(countryCode)) {
        return `${baseUrl}?prefilled_promotion_code=ANGLOSAXON`;
    }

    // Para Latinoamérica, usar el link de LATAM
    if (LATIN_AMERICAN_COUNTRIES.includes(countryCode)) {
        return `${baseUrl}?prefilled_promotion_code=LATAM`;
    }

    // Por defecto, usar el link estándar
    return baseUrl;
};

export const useLocation = () => {
    const [locationData, setLocationData] = useState<LocationData>({
        country: 'default',
        currency: 'USD',
        symbol: 'USD$',
        price: '49.99',
        paymentLink: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const detectLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                const countryCode = data.country_code;
                const isDevelopment = process.env.NODE_ENV === 'development';
                const paymentLink = getPaymentLink(countryCode, isDevelopment);
                let config: LocationData;

                if (countryCode === 'AR') {
                    // Argentina: Pesos argentinos
                    config = {
                        country: countryCode,
                        currency: 'ARS',
                        symbol: 'AR$',
                        price: '49000',
                        paymentLink: paymentLink // Vacío para usar MercadoPago
                    };
                } else if (EUROPEAN_COUNTRIES.includes(countryCode)) {
                    // Europa: Euros
                    config = {
                        country: countryCode,
                        currency: 'EUR',
                        symbol: '€',
                        price: '39.99',
                        paymentLink: paymentLink
                    };
                } else if (ANGLOSAXON_COUNTRIES.includes(countryCode)) {
                    // Países anglosajones: Dólares
                    config = {
                        country: countryCode,
                        currency: 'USD',
                        symbol: 'USD$',
                        price: '49.99',
                        paymentLink: paymentLink
                    };
                } else if (LATIN_AMERICAN_COUNTRIES.includes(countryCode)) {
                    // Resto de Latinoamérica: Dólares
                    config = {
                        country: countryCode,
                        currency: 'USD',
                        symbol: 'USD$',
                        price: '49.99',
                        paymentLink: paymentLink
                    };
                } else {
                    // Por defecto: Dólares
                    config = {
                        country: countryCode,
                        currency: 'USD',
                        symbol: 'USD$',
                        price: '49.99',
                        paymentLink: paymentLink
                    };
                }

                setLocationData(config);
            } catch (error) {
                console.warn('No se pudo detectar la ubicación, usando configuración por defecto:', error);
                const isDevelopment = process.env.NODE_ENV === 'development';
                const defaultPaymentLink = getPaymentLink('default', isDevelopment);

                setLocationData({
                    country: 'default',
                    currency: 'USD',
                    symbol: 'USD$',
                    price: '49.99',
                    paymentLink: defaultPaymentLink
                });
            } finally {
                setIsLoading(false);
            }
        };

        detectLocation();
    }, []);

    return { locationData, isLoading };
}; 