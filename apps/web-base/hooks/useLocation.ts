'use client';

import { useState, useEffect } from 'react';

interface LocationData {
    country: string;
    currency: string;
    symbol: string;
    price: string;
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

export const useLocation = () => {
    const [locationData, setLocationData] = useState<LocationData>({
        country: 'default',
        currency: 'USD',
        symbol: 'USD$',
        price: '49.99'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const detectLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                const countryCode = data.country_code;
                let config: LocationData;

                if (countryCode === 'AR') {
                    // Argentina: Pesos argentinos
                    config = {
                        country: countryCode,
                        currency: 'ARS',
                        symbol: 'AR$',
                        price: '49000'
                    };
                } else if (EUROPEAN_COUNTRIES.includes(countryCode)) {
                    // Europa: Euros
                    config = {
                        country: countryCode,
                        currency: 'EUR',
                        symbol: '€',
                        price: '39.99'
                    };
                } else if (ANGLOSAXON_COUNTRIES.includes(countryCode)) {
                    // Países anglosajones: Dólares
                    config = {
                        country: countryCode,
                        currency: 'USD',
                        symbol: 'USD$',
                        price: '49.99'
                    };
                } else if (LATIN_AMERICAN_COUNTRIES.includes(countryCode)) {
                    // Resto de Latinoamérica: Dólares
                    config = {
                        country: countryCode,
                        currency: 'USD',
                        symbol: 'USD$',
                        price: '49.99'
                    };
                } else {
                    // Por defecto: Dólares
                    config = {
                        country: countryCode,
                        currency: 'USD',
                        symbol: 'USD$',
                        price: '49.99'
                    };
                }

                setLocationData(config);
            } catch (error) {
                console.warn('No se pudo detectar la ubicación, usando configuración por defecto:', error);
                setLocationData({
                    country: 'default',
                    currency: 'USD',
                    symbol: 'USD$',
                    price: '49.99'
                });
            } finally {
                setIsLoading(false);
            }
        };

        detectLocation();
    }, []);

    return { locationData, isLoading };
}; 