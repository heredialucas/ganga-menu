import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Expand, Plus, Minus } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';
import { Dish } from './types';
import { generateWhatsAppLinkForDish } from './utils';
import ImageModal from './ImageModal';

interface DishCardProps {
    dish: Dish;
    dictionary: Dictionary;
    restaurantName: string;
    restaurantPhone?: string | null;
    specialDishIds: Set<string>;
    restaurantConfigId: string;
    onAddToOrder?: (dishId: string, quantity: number) => void;
}

export default function DishCard({ dish, dictionary, restaurantName, restaurantPhone, specialDishIds, restaurantConfigId, onAddToOrder }: DishCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const whatsappLink = restaurantPhone ? generateWhatsAppLinkForDish(restaurantPhone, dish.name, restaurantName) : '';
    const isSpecialDish = specialDishIds.has(dish.id);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleAddToOrder = () => {
        onAddToOrder?.(dish.id, quantity);
        setQuantity(1); // Reset quantity after adding
    };

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

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
                                    <span className={`text-base sm:text-lg md:text-xl font-bold whitespace-nowrap`} style={{ color: 'var(--theme-promotional-price)' }}>
                                        ${dish.promotionalPrice.toFixed(2)}
                                    </span>
                                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full mt-1 whitespace-nowrap`} style={{ backgroundColor: 'var(--theme-offer-badge-bg)', color: 'var(--theme-offer-badge-text)' }}>
                                        OFERTA
                                    </span>
                                </>
                            ) : (
                                <span className={`text-base sm:text-lg md:text-xl font-bold whitespace-nowrap`} style={{ color: 'var(--theme-price)' }}>
                                    ${dish.price.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-3 flex-1 break-words line-clamp-3">
                        {dish.description}
                    </p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={decreaseQuantity}
                                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
                            <button
                                onClick={increaseQuantity}
                                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToOrder}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg`}
                            style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
                        >
                            Agregar
                        </button>
                    </div>

                    {/* Botón de WhatsApp con colores temáticos */}
                    {whatsappLink && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg mt-auto`}
                            style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}
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
                />
            )}
        </>
    );
} 