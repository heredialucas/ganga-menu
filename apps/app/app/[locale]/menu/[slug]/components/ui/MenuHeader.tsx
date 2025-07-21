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
    dictionary: Dictionary;
    isTableSpecificView?: boolean;
}

export default function MenuHeader({ restaurantConfig, dictionary, isTableSpecificView = false }: MenuHeaderProps) {
    const whatsappLink = restaurantConfig.phone ? generateWhatsAppLink(restaurantConfig.phone) : '';

    return (
        <header className={`text-white shadow-2xl relative overflow-hidden min-h-[200px] flex items-center`} style={{ background: 'var(--gradient-header)' }}>
            {/* Gradientes animados de fondo más hermosos */}
            <div className="absolute inset-0">
                {/* Gradiente base con movimiento */}
                <div className={`absolute inset-0 animate-pulse`} style={{ background: 'var(--gradient-overlay)' }}></div>

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
                    count={30}
                />
            </div>

            {/* Elementos decorativos */}
            <DecorativeElements
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
                            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-2xl hover:scale-105 transition-all duration-500 animate-fadeInUp bg-clip-text text-transparent`} style={{ backgroundImage: 'var(--theme-text-gradient)' }}>
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

                        {/* Botón de WhatsApp con efectos mejorados - solo en vista general */}
                        {whatsappLink && !isTableSpecificView && (
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl transition-all duration-500 text-sm md:text-base font-bold shadow-2xl hover:shadow-green-500/25 hover:scale-110 relative overflow-hidden group animate-glow whitespace-nowrap"
                                style={{
                                    background: 'var(--gradient-badge)',
                                    color: 'var(--theme-text)'
                                }}
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
                        )}
                    </div>
                </div>
            </div>

            {/* Efecto de ondas en la parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </header>
    );
} 