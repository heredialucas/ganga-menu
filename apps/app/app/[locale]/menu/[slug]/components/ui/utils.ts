import tinycolor from 'tinycolor2';

// Función para obtener colores del tema dinámicamente
export function getThemeColors(baseColor: string) {
    const color = tinycolor(baseColor);

    // 1. Determinar si el color base es claro u oscuro para el contraste del texto
    const isLight = color.getBrightness() > 180;
    const textColor = isLight ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)';
    const textGradient = isLight
        ? `linear-gradient(to bottom, hsl(0 0% 20%), hsl(0 0% 10%))`
        : `linear-gradient(to bottom, hsl(0 0% 98%), hsl(0 0% 85%))`;

    // 2. Generar una paleta de colores armónica en lugar de solo oscurecer
    const analogousColors = color.analogous();
    const accentColor = analogousColors[1].saturate(10);
    const darkShade = color.clone().darken(isLight ? 15 : 25).saturate(5);
    const lightShade = color.clone().lighten(isLight ? 20 : 15).desaturate(10);

    // 3. Definir colores específicos para elementos de la UI con la nueva paleta
    const priceColor = darkShade.toHslString();
    const promotionalPriceColor = accentColor.darken(10).toHslString();

    const gradients = {
        // Degradado más sutil y basado en el color de acento
        header: `linear-gradient(to bottom right, ${color.toHslString()}, ${accentColor.toHslString()})`,
        category: `linear-gradient(to bottom right, ${color.clone().lighten(5).toHslString()}, ${color.toHslString()})`,
        special: `linear-gradient(to bottom right, ${lightShade.toHslString()}, ${color.clone().lighten(15).toHslString()})`,
        overlay: `linear-gradient(to right, ${color.clone().setAlpha(0.1).toRgbString()}, ${color.clone().setAlpha(0.15).toRgbString()})`,
        badge: `linear-gradient(to right, ${accentColor.toHslString()}, ${darkShade.toHslString()})`
    };

    const decorativeColors = {
        primary: color.clone().setAlpha(0.2).toRgbString(),
        secondary: accentColor.clone().setAlpha(0.1).toRgbString(),
        tertiary: accentColor.clone().setAlpha(0.15).toRgbString(),
        accent: color.clone().complement().setAlpha(0.3).toRgbString()
    };

    // 4. Mapear todo a variables CSS para que la UI las consuma
    const cssVariables = {
        '--theme-bg': color.toHslString(),
        '--theme-text': textColor,
        '--theme-text-gradient': textGradient,
        '--theme-accent': accentColor.toHslString(),
        '--theme-price': priceColor,
        '--theme-promotional-price': promotionalPriceColor,
        '--theme-offer-badge-bg': accentColor.isLight() ? accentColor.darken(15).toHslString() : accentColor.lighten(15).toHslString(),
        '--theme-offer-badge-text': accentColor.isLight() ? 'hsl(0 0% 98%)' : 'hsl(0 0% 10%)',

        '--gradient-header': gradients.header,
        '--gradient-category': gradients.category,
        '--gradient-special': gradients.special,
        '--gradient-overlay': gradients.overlay,
        '--gradient-badge': gradients.badge,

        '--decorative-primary': decorativeColors.primary,
        '--decorative-secondary': decorativeColors.secondary,
        '--decorative-tertiary': decorativeColors.tertiary,
        '--decorative-accent': decorativeColors.accent,

        '--color-dark-text': 'hsl(0 0% 10%)',
        '--color-light-text': 'hsl(0 0% 98%)',
    } as React.CSSProperties;


    return {
        isLight: color.isLight(),
        bg: color.toHslString(),
        text: textColor,
        accent: accentColor.toHslString(),
        priceColor: priceColor,
        promotionalPriceColor: promotionalPriceColor,
        offerBadge: {
            bg: lightShade.toHslString(),
            text: darkShade.toHslString(),
        },
        gradients,
        decorative: decorativeColors,
        cssVariables
    };
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