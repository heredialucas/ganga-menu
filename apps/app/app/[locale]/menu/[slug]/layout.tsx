import { getDictionary } from '@repo/internationalization';
import { getRestaurantConfigBySlug } from '@repo/data-services/src/services/restaurantConfigService';
import { Akaya_Kanadaka, Playfair_Display, Dancing_Script, Bebas_Neue, Orbitron } from 'next/font/google';
import type { ReactNode } from 'react';

// Fuentes específicas para templates
const akayaKanadaka = Akaya_Kanadaka({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-akaya-kanadaka',
    display: 'swap',
});

const playfairDisplay = Playfair_Display({
    weight: ['400', '700', '900'],
    subsets: ['latin'],
    variable: '--font-playfair-display',
    display: 'swap',
});

const dancingScript = Dancing_Script({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-dancing-script',
    display: 'swap',
});

const bebasNeue = Bebas_Neue({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-bebas-neue',
    display: 'swap',
});

const orbitron = Orbitron({
    weight: ['400', '700', '900'],
    subsets: ['latin'],
    variable: '--font-orbitron',
    display: 'swap',
});

type MenuLayoutProperties = {
    readonly children: ReactNode;
    readonly params: Promise<{
        locale: string;
        slug: string;
    }>;
};

const MenuLayout = async ({ children, params }: MenuLayoutProperties) => {
    const { locale } = await params;

    return (
        <div className={`${akayaKanadaka.variable} ${playfairDisplay.variable} ${dancingScript.variable} ${bebasNeue.variable} ${orbitron.variable}`}>
            {children}
        </div>
    );
};

export default MenuLayout; 