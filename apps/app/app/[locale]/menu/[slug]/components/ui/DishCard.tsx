import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Expand } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';
import { Dish } from './types';
import { generateWhatsAppLinkForDish } from './utils';
import ImageModal from './ImageModal';

interface DishCardProps {
    dish: Dish;
    themeColors: {
        bg: string;
        text: string;
        accent: string;
        priceColor: string;
        promotionalPriceColor: string;
        offerBadge: string;
        gradients: {
            header: string;
            category: string;
            special: string;
            overlay: string;
            badge: string;
        };
        decorative: {
            primary: string;
            secondary: string;
            tertiary: string;
            accent: string;
        };
    };
    dictionary: Dictionary;
    restaurantName: string;
    restaurantPhone?: string | null;
    specialDishIds: Set<string>;
}

export default function DishCard({ dish, themeColors, dictionary, restaurantName, restaurantPhone, specialDishIds }: DishCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const whatsappLink = restaurantPhone ? generateWhatsAppLinkForDish(restaurantPhone, dish.name, restaurantName) : '';
    const isSpecialDish = specialDishIds.has(dish.id);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 group hover:scale-105 h-full flex flex-col">
                {dish.imageUrl && (
                    <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                        <Image
                            src={dish.imageUrl}
                            alt={dish.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            onClick={openModal}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                        {/* Botón de expandir imagen - visible en mobile, hover en desktop */}
                        <button
                            onClick={openModal}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
                            aria-label="Ver imagen completa"
                        >
                            <Expand className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2 sm:gap-3">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 flex-1 leading-tight break-words line-clamp-2">
                            {dish.name}
                        </h3>
                        <div className="flex flex-col items-end text-right shrink-0 min-w-0">
                            {isSpecialDish && dish.promotionalPrice && dish.promotionalPrice > 0 ? (
                                <>
                                    <span className="text-xs sm:text-sm text-gray-400 line-through whitespace-nowrap">
                                        ${dish.price.toFixed(2)}
                                    </span>
                                    <span className={`text-base sm:text-lg md:text-xl font-bold ${themeColors.promotionalPriceColor} whitespace-nowrap`}>
                                        ${dish.promotionalPrice.toFixed(2)}
                                    </span>
                                    <span className={`${themeColors.offerBadge} text-xs font-semibold px-1.5 py-0.5 rounded-full mt-1 whitespace-nowrap`}>
                                        OFERTA
                                    </span>
                                </>
                            ) : (
                                <span className={`text-base sm:text-lg md:text-xl font-bold ${themeColors.priceColor} whitespace-nowrap`}>
                                    ${dish.price.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-3 flex-1 break-words line-clamp-3">
                        {dish.description}
                    </p>

                    {/* Botón de WhatsApp con colores temáticos */}
                    {whatsappLink && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 ${themeColors.bg} hover:opacity-90 ${themeColors.text} rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg mt-auto`}
                        >
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="whitespace-nowrap">Consultar</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Modal para ver imagen completa */}
            {dish.imageUrl && (
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    imageUrl={dish.imageUrl}
                    imageName={dish.name}
                    description={dish.description}
                    price={dish.price}
                    promotionalPrice={dish.promotionalPrice ?? undefined}
                    isSpecialDish={isSpecialDish}
                    themeColors={themeColors}
                />
            )}
        </>
    );
} 