// Función para obtener colores del tema
export function getThemeColors(theme: string) {
    const themes = {
        green: {
            bg: 'bg-green-600',
            text: 'text-white',
            accent: 'text-green-600',
            priceColor: 'text-green-600',
            promotionalPriceColor: 'text-green-700',
            offerBadge: 'bg-green-100 text-green-800',
            gradients: {
                header: 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700',
                category: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600',
                special: 'bg-gradient-to-br from-emerald-50 to-green-50',
                overlay: 'bg-gradient-to-r from-emerald-200/20 to-green-200/20',
                badge: 'bg-gradient-to-r from-emerald-500 to-green-500'
            },
            decorative: {
                primary: 'bg-green-600/20',
                secondary: 'bg-green-400/10',
                tertiary: 'bg-green-500/15',
                accent: 'bg-green-600/30'
            }
        },
        red: {
            bg: 'bg-red-600',
            text: 'text-white',
            accent: 'text-red-600',
            priceColor: 'text-red-600',
            promotionalPriceColor: 'text-red-700',
            offerBadge: 'bg-red-100 text-red-800',
            gradients: {
                header: 'bg-gradient-to-br from-red-600 via-rose-600 to-pink-700',
                category: 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600',
                special: 'bg-gradient-to-br from-red-50 to-rose-50',
                overlay: 'bg-gradient-to-r from-red-200/20 to-rose-200/20',
                badge: 'bg-gradient-to-r from-red-500 to-rose-500'
            },
            decorative: {
                primary: 'bg-red-600/20',
                secondary: 'bg-red-400/10',
                tertiary: 'bg-red-500/15',
                accent: 'bg-red-600/30'
            }
        },
        blue: {
            bg: 'bg-blue-600',
            text: 'text-white',
            accent: 'text-blue-600',
            priceColor: 'text-blue-600',
            promotionalPriceColor: 'text-blue-700',
            offerBadge: 'bg-blue-100 text-blue-800',
            gradients: {
                header: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700',
                category: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
                special: 'bg-gradient-to-br from-blue-50 to-indigo-50',
                overlay: 'bg-gradient-to-r from-blue-200/20 to-indigo-200/20',
                badge: 'bg-gradient-to-r from-blue-500 to-indigo-500'
            },
            decorative: {
                primary: 'bg-blue-600/20',
                secondary: 'bg-blue-400/10',
                tertiary: 'bg-blue-500/15',
                accent: 'bg-blue-600/30'
            }
        },
        yellow: {
            bg: 'bg-yellow-600',
            text: 'text-white',
            accent: 'text-yellow-600',
            priceColor: 'text-yellow-600',
            promotionalPriceColor: 'text-yellow-700',
            offerBadge: 'bg-yellow-100 text-yellow-800',
            gradients: {
                header: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600',
                category: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500',
                special: 'bg-gradient-to-br from-yellow-50 to-orange-50',
                overlay: 'bg-gradient-to-r from-yellow-200/20 to-orange-200/20',
                badge: 'bg-gradient-to-r from-yellow-500 to-orange-500'
            },
            decorative: {
                primary: 'bg-yellow-600/20',
                secondary: 'bg-yellow-400/10',
                tertiary: 'bg-yellow-500/15',
                accent: 'bg-yellow-600/30'
            }
        },
        brown: {
            bg: 'bg-amber-700',
            text: 'text-white',
            accent: 'text-amber-700',
            priceColor: 'text-amber-700',
            promotionalPriceColor: 'text-amber-800',
            offerBadge: 'bg-amber-100 text-amber-800',
            gradients: {
                header: 'bg-gradient-to-br from-amber-700 via-orange-700 to-red-800',
                category: 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-700',
                special: 'bg-gradient-to-br from-amber-50 to-orange-50',
                overlay: 'bg-gradient-to-r from-amber-200/20 to-orange-200/20',
                badge: 'bg-gradient-to-r from-amber-600 to-orange-600'
            },
            decorative: {
                primary: 'bg-amber-700/20',
                secondary: 'bg-amber-600/10',
                tertiary: 'bg-amber-500/15',
                accent: 'bg-amber-700/30'
            }
        }
    };

    return themes[theme as keyof typeof themes] || themes.green;
}

// Función para generar enlace de WhatsApp
export function generateWhatsAppLink(phone: string, message?: string): string {
    if (!phone) return '';

    // Limpiar el número de teléfono (remover espacios, guiones, paréntesis)
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    // Mensaje por defecto
    const defaultMessage = '¡Hola! Vi su menú y me gustaría hacer una consulta.';
    const finalMessage = message || defaultMessage;

    // Crear URL de WhatsApp
    const encodedMessage = encodeURIComponent(finalMessage);
    return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedMessage}`;
}

// Función para generar mensaje personalizado de WhatsApp para un plato
export function generateWhatsAppLinkForDish(phone: string, dishName: string, restaurantName: string): string {
    const message = `¡Hola ${restaurantName}! Me interesa el plato "${dishName}" que vi en su menú.`;
    return generateWhatsAppLink(phone, message);
}

// Función para generar elementos decorativos temáticos
export function getDecorativeElements(themeColors: any) {
    return {
        // Elementos grandes para background
        large: [
            {
                className: `absolute -top-20 right-1/4 w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 ${themeColors.decorative.primary} rounded-full blur-3xl`,
                position: 'top-right'
            },
            {
                className: `absolute bottom-10 left-1/3 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 ${themeColors.decorative.secondary} rounded-full blur-2xl`,
                position: 'bottom-left'
            },
            {
                className: `absolute top-1/2 -left-10 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 ${themeColors.decorative.tertiary} rounded-full blur-2xl`,
                position: 'middle-left'
            }
        ],
        // Elementos medianos para secciones
        medium: [
            {
                className: `absolute right-0 bottom-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 ${themeColors.decorative.primary} rounded-full blur-xl`,
                position: 'section-bottom-right'
            },
            {
                className: `absolute -left-5 top-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ${themeColors.decorative.secondary} rounded-full blur-xl`,
                position: 'section-middle-left'
            }
        ],
        // Elementos pequeños para detalles
        small: [
            {
                className: `absolute top-1/3 left-1/4 w-1 h-1 sm:w-2 sm:h-2 ${themeColors.decorative.accent} rounded-full`,
                position: 'detail-1'
            },
            {
                className: `absolute bottom-1/4 right-1/3 w-1.5 h-1.5 sm:w-2 sm:h-2 ${themeColors.decorative.accent} rounded-full`,
                position: 'detail-2'
            },
            {
                className: `absolute top-1/2 left-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 ${themeColors.decorative.accent} rounded-full`,
                position: 'detail-3'
            }
        ]
    };
} 