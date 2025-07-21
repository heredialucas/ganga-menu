import React from 'react';
import Image from 'next/image';
import { Clock, Star, MessageCircle, Sparkles } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';
import { generateWhatsAppLinkForDish } from './utils';
import DecorativeElements from './DecorativeElements';

interface Dish {
    id: string;
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number | null;
    imageUrl?: string | null;
    category?: {
        name: string;
    } | null;
}

interface TodaySpecialData {
    id: string;
    date: Date;
    isActive: boolean;
    dish: Dish;
}

interface TodaySpecialProps {
    todaySpecial: TodaySpecialData;
    dictionary: Dictionary;
    restaurantName: string;
    restaurantPhone?: string | null;
    isTableSpecificView?: boolean;
}

export default function TodaySpecial({ todaySpecial, dictionary, restaurantName, restaurantPhone, isTableSpecificView = false }: TodaySpecialProps) {
    const whatsappLink = restaurantPhone ? generateWhatsAppLinkForDish(restaurantPhone, todaySpecial.dish.name, restaurantName) : '';

    return (
        <section className={`relative border-b overflow-hidden`} style={{ background: 'var(--gradient-special)' }}>
            {/* Gradiente base temático */}
            <div className={`absolute inset-0`} style={{ background: 'var(--gradient-overlay)' }}></div>

            {/* Elementos decorativos como en web-base */}
            <DecorativeElements
                variant="section"
            />

            <div className="relative max-w-6xl mx-auto px-4 py-12 z-10">
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center px-4 py-2 text-white rounded-full text-sm font-semibold mb-2 shadow-lg`} style={{ background: 'var(--gradient-badge)' }}>
                        <Star className="animate-pulse mr-2 w-4 h-4" />
                        {dictionary.web?.menu?.todaySpecial || 'Plato del Día'}
                        <Star className="animate-pulse ml-2 w-4 h-4" />
                    </div>
                    <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-dark-text)' }}>
                        {dictionary.web?.menu?.todaySpecial || 'Plato del Día'}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {dictionary.web?.menu?.specialDescription || 'Descubre nuestro plato especial del día'}
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 relative">
                    <div className="flex flex-col lg:flex-row relative z-10">
                        {todaySpecial.dish.imageUrl && (
                            <div className="lg:w-1/2 relative h-80 lg:h-96">
                                <Image
                                    src={todaySpecial.dish.imageUrl}
                                    alt={todaySpecial.dish.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                                {/* Sparkle decorativo en la imagen */}
                                <div className="absolute top-4 right-4 text-yellow-400 animate-pulse">
                                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg" />
                                </div>
                            </div>
                        )}
                        <div className={`${todaySpecial.dish.imageUrl ? 'lg:w-1/2' : 'w-full'} p-8 lg:p-12 flex flex-col justify-center`}>
                            <div className="mb-4">
                                {todaySpecial.dish.category && (
                                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full shadow-md`} style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
                                        {todaySpecial.dish.category.name}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4" style={{ color: 'var(--color-dark-text)' }}>
                                {todaySpecial.dish.name}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                {todaySpecial.dish.description}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    {todaySpecial.dish.promotionalPrice && todaySpecial.dish.promotionalPrice > 0 ? (
                                        <>
                                            <span className="text-2xl font-medium text-gray-400 line-through">
                                                ${todaySpecial.dish.price.toFixed(2)}
                                            </span>
                                            <span className={`text-4xl font-bold`} style={{ color: 'var(--theme-promotional-price)' }}>
                                                ${todaySpecial.dish.promotionalPrice.toFixed(2)}
                                            </span>
                                            <span className={`text-sm font-semibold px-2 py-1 rounded-full shadow-md animate-pulse`} style={{ backgroundColor: 'var(--theme-offer-badge-bg)', color: 'var(--theme-offer-badge-text)' }}>
                                                ¡OFERTA!
                                            </span>
                                        </>
                                    ) : (
                                        <span className={`text-4xl font-bold`} style={{ color: 'var(--theme-price)' }}>
                                            ${todaySpecial.dish.price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {dictionary.web?.menu?.todayOnly || 'Solo por hoy'}
                                </div>
                            </div>

                            {/* Botón de WhatsApp con color temático - solo en vista general */}
                            {whatsappLink && !isTableSpecificView && (
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105`}
                                    style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Consultar Plato Especial
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 