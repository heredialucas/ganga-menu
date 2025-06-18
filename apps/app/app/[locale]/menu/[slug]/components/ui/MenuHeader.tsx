import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { Dictionary } from '@repo/internationalization';
import { generateWhatsAppLink } from './utils';
import DecorativeElements from './DecorativeElements';
import { SnowParticlesWrapper } from './SnowParticlesWrapper';

interface MenuHeaderProps {
    restaurantConfig: RestaurantConfigData;
    themeColors: {
        bg: string;
        text: string;
        accent: string;
        decorative: {
            primary: string;
            secondary: string;
            tertiary: string;
            accent: string;
        };
    };
    dictionary: Dictionary;
}

// Función para obtener gradientes temáticos
const getThemeGradients = (theme: string) => {
    const gradients = {
        green: {
            bg: 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700',
            overlay: 'bg-gradient-to-r from-emerald-500/20 via-green-400/30 to-teal-500/20',
            text: 'bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent',
            accent: 'from-emerald-400 to-teal-400'
        },
        red: {
            bg: 'bg-gradient-to-br from-red-600 via-rose-600 to-pink-700',
            overlay: 'bg-gradient-to-r from-red-500/20 via-rose-400/30 to-pink-500/20',
            text: 'bg-gradient-to-r from-white via-rose-100 to-white bg-clip-text text-transparent',
            accent: 'from-red-400 to-pink-400'
        },
        blue: {
            bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700',
            overlay: 'bg-gradient-to-r from-blue-500/20 via-indigo-400/30 to-purple-500/20',
            text: 'bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent',
            accent: 'from-blue-400 to-purple-400'
        },
        yellow: {
            bg: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600',
            overlay: 'bg-gradient-to-r from-yellow-400/20 via-orange-400/30 to-red-400/20',
            text: 'bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent',
            accent: 'from-yellow-400 to-orange-400'
        },
        brown: {
            bg: 'bg-gradient-to-br from-amber-700 via-orange-700 to-red-800',
            overlay: 'bg-gradient-to-r from-amber-600/20 via-orange-500/30 to-red-600/20',
            text: 'bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent',
            accent: 'from-amber-400 to-orange-400'
        }
    };

    return gradients[theme as keyof typeof gradients] || gradients.green;
};

export default function MenuHeader({ restaurantConfig, themeColors, dictionary }: MenuHeaderProps) {
    const whatsappLink = restaurantConfig.phone ? generateWhatsAppLink(restaurantConfig.phone) : '';
    const gradients = getThemeGradients(restaurantConfig.themeColor);

    return (
        <header className={`${gradients.bg} text-white shadow-2xl relative overflow-hidden min-h-[200px] flex items-center`}>
            {/* Gradientes animados de fondo más hermosos */}
            <div className="absolute inset-0">
                {/* Gradiente base con movimiento */}
                <div className={`absolute inset-0 ${gradients.overlay} animate-pulse`}></div>

                {/* Gradientes animados múltiples */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent animate-shimmer" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/8 to-transparent animate-shimmer" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>

                {/* Gradiente de brillo superior */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/20"></div>

                {/* Efecto de ondas */}
                <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>

            {/* Partículas de nieve en el header */}
            <div className="absolute inset-0 overflow-hidden">
                <SnowParticlesWrapper
                    themeColors={themeColors}
                    count={30}
                />
            </div>

            {/* Elementos decorativos */}
            <DecorativeElements
                themeColors={themeColors}
                variant="hero"
            />

            {/* Contenido principal */}
            <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-center lg:text-left gap-6">
                    <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8 flex-1">
                        {restaurantConfig.logoUrl && (
                            <div className="w-24 h-24 lg:w-32 lg:h-32 relative group animate-float shrink-0">
                                <Image
                                    src={restaurantConfig.logoUrl}
                                    alt={`${restaurantConfig.name} logo`}
                                    fill
                                    className="object-contain rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 filter drop-shadow-2xl"
                                    sizes="(max-width: 1024px) 96px, 128px"
                                />
                                {/* Efecto de brillo en hover */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                                {/* Anillo de brillo */}
                                <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-500"></div>
                            </div>
                        )}
                        <div className="space-y-2 flex-1 lg:max-w-2xl">
                            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${gradients.text} drop-shadow-2xl hover:scale-105 transition-all duration-500 animate-fadeInUp`}>
                                {restaurantConfig.name}
                            </h1>
                            {restaurantConfig.description && (
                                <p className="hidden lg:block text-lg md:text-xl lg:text-2xl text-white/90 drop-shadow-lg font-medium animate-slideInLeft max-w-full lg:max-w-2xl break-words">
                                    {restaurantConfig.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="lg:text-right space-y-4 animate-slideInRight shrink-0 lg:min-w-[300px]">
                        <div className="space-y-2">
                            {restaurantConfig.address && (
                                <p className="text-sm md:text-base text-white/90 drop-shadow-lg hover:text-white hover:scale-105 transition-all duration-300 flex items-center justify-center lg:justify-end gap-2">
                                    <span className="text-lg">📍</span>
                                    <span className="font-medium break-words">{restaurantConfig.address}</span>
                                </p>
                            )}
                            {restaurantConfig.email && (
                                <p className="text-sm md:text-base text-white/90 drop-shadow-lg hover:text-white hover:scale-105 transition-all duration-300 flex items-center justify-center lg:justify-end gap-2">
                                    <span className="text-lg">✉️</span>
                                    <span className="font-medium break-words">{restaurantConfig.email}</span>
                                </p>
                            )}
                        </div>

                        {/* Botón de WhatsApp con efectos mejorados */}
                        {whatsappLink && (
                            <div className="flex justify-center lg:justify-end">
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl transition-all duration-500 text-sm md:text-base font-bold shadow-2xl hover:shadow-green-500/25 hover:scale-110 relative overflow-hidden group animate-glow whitespace-nowrap"
                                >
                                    {/* Efecto de brillo en el botón */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    <MessageCircle className="w-5 h-5 relative z-10 animate-pulse" />
                                    <span className="relative z-10">Contactar por WhatsApp</span>
                                    {/* Partículas en el botón */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                                        <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                                    </div>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Efecto de ondas en la parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </header>
    );
} 