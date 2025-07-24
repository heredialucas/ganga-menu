import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Expand, Plus, Minus, Heart, Minus as MinusIcon, Palette } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';
import { Dish } from './types';
import { generateWhatsAppLinkForDish } from './utils';
import ImageModal from './ImageModal';
import { getTemplateStyles } from './templateStyles';
import { DishCardProps, getDefaultTemplate } from '../../types/templates';

export default function DishCard({ dish, dictionary, restaurantName, restaurantPhone, specialDishIds, restaurantConfigId, onAddToOrder, isTableSpecificView = false, themeColor = '#16a34a', template = getDefaultTemplate() }: DishCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const whatsappLink = restaurantPhone ? generateWhatsAppLinkForDish(restaurantPhone, dish.name, restaurantName) : '';
    const isSpecialDish = specialDishIds.has(dish.id);
    const styles = getTemplateStyles(template);

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
            <div className={`${styles.card} transition-all duration-200 overflow-hidden group hover:scale-105 h-full flex flex-col`}>
                {dish.imageUrl && (
                    <div className="relative h-32 sm:h-48 overflow-hidden">
                        <div className={styles.cardImageContainer}>
                            <Image
                                src={dish.imageUrl}
                                alt={dish.name}
                                width={400}
                                height={200}
                                className="w-full h-24 sm:h-40 object-cover rounded-md sm:rounded-xl cursor-pointer group-hover:scale-105 transition-transform duration-300"
                                onClick={openModal}
                            />
                        </div>
                        {/* Botón de expandir imagen */}
                        <button
                            onClick={openModal}
                            className={`absolute top-1 right-1 sm:top-4 sm:right-4 ${styles.expandButton} sm:opacity-0 sm:group-hover:opacity-100 opacity-100`}
                            aria-label="Ver imagen completa"
                        >
                            {template === 'luxury-premium' ? (
                                <Heart className="w-4 h-4 text-white" />
                            ) : template === 'playful-fun' ? (
                                <span className="text-lg animate-bounce">😋</span>
                            ) : template === 'zen-minimal' ? (
                                <MinusIcon className="w-4 h-4 text-white" />
                            ) : template === 'artistic-creative' ? (
                                <Heart className="w-4 h-4 text-white" />
                            ) : template === 'retro-vintage' ? (
                                <Expand className="w-4 h-4 text-amber-800" />
                            ) : (
                                <Expand className="w-4 h-4 text-gray-600" />
                            )}
                        </button>
                    </div>
                )}

                <div className="p-3 sm:p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-1 sm:gap-2 md:gap-3">
                        <h3 className={`text-xs sm:text-base md:text-lg lg:text-xl font-semibold flex-1 leading-tight break-words line-clamp-2 ${template === 'retro-vintage' ? 'text-amber-900' : template === 'luxury-premium' ? 'text-yellow-100' : template === 'artistic-creative' ? 'text-white font-akaya-kanadaka' : 'text-gray-800'}`}>
                            {dish.name}
                        </h3>
                        <div className="flex flex-col items-end text-right shrink-0 min-w-0">
                            {isSpecialDish && dish.promotionalPrice && dish.promotionalPrice > 0 ? (
                                <>
                                    <span className={`text-xs line-through whitespace-nowrap ${template === 'retro-vintage' ? 'text-amber-400' : template === 'luxury-premium' ? 'text-yellow-600' : template === 'artistic-creative' ? 'text-pink-200' : 'text-gray-400'}`}>
                                        ${dish.price.toFixed(2)}
                                    </span>
                                    <span className={`text-xs sm:text-base md:text-lg lg:text-xl font-bold whitespace-nowrap ${styles.promotionalPrice}`}>
                                        ${dish.promotionalPrice.toFixed(2)}
                                    </span>
                                    <span className={`text-xs font-semibold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full mt-0.5 sm:mt-1 whitespace-nowrap ${styles.specialOffer}`}>
                                        {dictionary.web?.menu?.todayOnly || 'OFERTA'}
                                    </span>
                                </>
                            ) : (
                                <span className={`text-xs sm:text-base md:text-lg lg:text-xl font-bold whitespace-nowrap ${styles.price}`}>
                                    ${dish.price.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className={`text-xs sm:text-sm md:text-base mb-1.5 sm:mb-3 flex-1 break-words line-clamp-2 sm:line-clamp-3 ${template === 'retro-vintage' ? 'text-amber-700' : template === 'luxury-premium' ? 'text-yellow-300' : template === 'artistic-creative' ? 'text-pink-200 font-akaya-kanadaka' : 'text-gray-600'}`}>
                        {dish.description}
                    </p>

                    {/* Controles de cantidad - solo en vista de mesa específica */}
                    {isTableSpecificView && (
                        <div className="flex items-center justify-between mb-1.5 sm:mb-3">
                            <div className={styles.quantityContainer}>
                                <button
                                    onClick={decreaseQuantity}
                                    className={styles.quantityButton}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className={`w-2 h-2 sm:w-3 sm:h-3 ${template === 'retro-vintage' ? 'text-amber-800' : template === 'artistic-creative' ? 'text-pink-200' : 'text-gray-600'}`} />
                                </button>
                                <span className={`text-xs font-medium min-w-[1.25rem] sm:min-w-[2rem] text-center ${template === 'retro-vintage' ? 'text-amber-800' : template === 'artistic-creative' ? 'text-pink-200' : 'text-gray-700'}`}>{quantity}</span>
                                <button
                                    onClick={increaseQuantity}
                                    className={styles.quantityButton}
                                >
                                    <Plus className={`w-2 h-2 sm:w-3 sm:h-3 ${template === 'retro-vintage' ? 'text-amber-800' : template === 'artistic-creative' ? 'text-pink-200' : 'text-gray-600'}`} />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToOrder}
                                className={styles.buttonSecondary}
                            >
                                <span className="hidden sm:inline">{dictionary.web?.menu?.dish?.addToOrder || 'Agregar'}</span>
                                <span className="sm:hidden">+</span>
                            </button>
                        </div>
                    )}

                    {/* Botón de WhatsApp con colores temáticos - solo en vista general */}
                    {whatsappLink && !isTableSpecificView && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-1 sm:gap-2 w-full py-1.5 sm:py-3 ${styles.buttonSecondary} mt-auto`}
                        >
                            <MessageCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${template === 'retro-vintage' ? 'text-amber-800' : template === 'artistic-creative' ? 'text-pink-200' : 'text-gray-600'}`} />
                            <span className="whitespace-nowrap text-xs sm:text-sm">{dictionary.web?.menu?.dish?.consult || 'Consultar'}</span>
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