import React, { useState } from 'react';
import Image from 'next/image';
import { Clock, Star, MessageCircle, Sparkles, Crown, Heart, Minus, Palette, Expand } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';
import { generateWhatsAppLinkForDish } from './utils';
import { getTemplateStyles } from './templateStyles';
import ImageModal from './ImageModal';
import { TodaySpecialProps, getDefaultTemplate } from '../../types/templates';

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



export default function TodaySpecial({ todaySpecial, dictionary, restaurantName, restaurantPhone, isTableSpecificView = false, themeColor = '#16a34a', template = getDefaultTemplate() }: TodaySpecialProps) {
    const whatsappLink = restaurantPhone ? generateWhatsAppLinkForDish(restaurantPhone, todaySpecial.dish.name, restaurantName) : '';
    const styles = getTemplateStyles(template);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <section className={styles.section}>
            <div className="w-full max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className={`${styles.badge} relative`}>
                        {template === 'luxury-premium' ? (
                            <>
                                <Crown className="w-5 h-5 text-yellow-400 absolute -top-2 -left-2" />
                                <span className="text-yellow-100 font-semibold">{dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                <Crown className="w-5 h-5 text-yellow-400 absolute -top-2 -right-2" />
                            </>
                        ) : template === 'playful-fun' ? (
                            <>
                                <span className="text-2xl animate-spin">⭐</span>
                                <span className="text-pink-700 font-black text-xl">{dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                <span className="text-2xl animate-spin">⭐</span>
                            </>
                        ) : template === 'zen-minimal' ? (
                            <>
                                <div className="w-1 h-8 bg-black mx-auto"></div>
                            </>
                        ) : template === 'artistic-creative' ? (
                            <>
                                <Palette className="w-5 h-5 text-pink-400 absolute -top-2 -left-2" />
                                <span className="text-white font-bold">{dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                <Palette className="w-5 h-5 text-purple-400 absolute -top-2 -right-2" />
                            </>
                        ) : template === 'retro-vintage' ? (
                            <>
                                <Star className="w-5 h-5 text-red-500 absolute -top-2 -left-2" />
                                <span className="text-amber-800 font-bold">{dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                <Star className="w-5 h-5 text-red-500 absolute -top-2 -right-2" />
                            </>
                        ) : (
                            <>
                                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse absolute -top-1 -left-1" />
                                <span className="text-gray-700 font-semibold">{dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse absolute -top-1 -right-1" />
                            </>
                        )}
                    </div>
                    <h3 className={styles.title}>{dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</h3>
                    <p className={styles.subtitle}>{dictionary.web?.menu?.specialDescription || 'Descubre nuestro plato especial del día'}</p>
                </div>

                <div className={styles.card}>
                    <div className="grid lg:grid-cols-2 gap-8">
                        {todaySpecial.dish.imageUrl && (
                            <div className="relative">
                                <div className={styles.imageContainer}>
                                    <Image
                                        src={todaySpecial.dish.imageUrl}
                                        alt={todaySpecial.dish.name}
                                        width={600}
                                        height={400}
                                        className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-[1rem] sm:rounded-[1.5rem] cursor-pointer hover:scale-105 transition-transform duration-300"
                                        priority
                                        onClick={openModal}
                                    />
                                </div>
                                <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                                    <button onClick={openModal} className={styles.expandButton} aria-label="Ver imagen completa">
                                        {template === 'luxury-premium' ? (
                                            <Heart className="w-6 h-6 text-white" />
                                        ) : template === 'playful-fun' ? (
                                            <span className="text-2xl animate-bounce">😋</span>
                                        ) : template === 'zen-minimal' ? (
                                            <Minus className="w-4 h-4 text-white" />
                                        ) : template === 'artistic-creative' ? (
                                            <Heart className="w-6 h-6 text-white" />
                                        ) : template === 'retro-vintage' ? (
                                            <Expand className="w-4 h-4 sm:w-6 sm:h-6 text-amber-800" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500" />
                                        )}
                                    </button>

                                </div>
                            </div>
                        )}
                        <div className="flex flex-col justify-center p-4">
                            <div className={`${styles.badge} flex items-center`}>
                                {template === 'luxury-premium' ? (
                                    <>
                                        <Crown className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />
                                        <span className="text-yellow-400">{todaySpecial.dish.category?.name || dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                    </>
                                ) : template === 'playful-fun' ? (
                                    <>
                                        <span className="text-2xl animate-spin">⭐</span>
                                        <span className="text-pink-700 font-black text-xl">{todaySpecial.dish.category?.name || dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                        <span className="text-2xl animate-spin">⭐</span>
                                    </>
                                ) : template === 'zen-minimal' ? (
                                    <>
                                        <div className="w-1 h-6 bg-black mr-2"></div>
                                        <span className="text-black font-light">{todaySpecial.dish.category?.name || dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                        <div className="w-1 h-6 bg-black ml-6"></div>
                                    </>
                                ) : template === 'artistic-creative' ? (
                                    <>
                                        <Palette className="w-4 h-4 text-pink-400 mr-2 flex-shrink-0" />
                                        <span className="text-pink-300 font-bold">{todaySpecial.dish.category?.name || dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                        <Palette className="w-4 h-4 text-purple-400 ml-2 flex-shrink-0" />
                                    </>
                                ) : template === 'retro-vintage' ? (
                                    <>
                                        <Star className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                                        <span className="text-red-500 font-bold">{todaySpecial.dish.category?.name || dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                        <Star className="w-4 h-4 text-red-500 ml-2 flex-shrink-0" />
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mr-2"></div>
                                        <span className="text-gray-700 font-semibold">{todaySpecial.dish.category?.name || dictionary.web?.menu?.todaySpecial || 'Plato del Día'}</span>
                                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full ml-2"></div>
                                    </>
                                )}
                            </div>
                            <h4 className={styles.title}>{todaySpecial.dish.name}</h4>
                            <p className={styles.subtitle}>{todaySpecial.dish.description}</p>
                            <div className="flex items-baseline gap-4 mb-8">
                                {todaySpecial.dish.promotionalPrice && todaySpecial.dish.promotionalPrice > 0 ? (
                                    <>
                                        <span className={`line-through text-xl ${template === 'retro-vintage' ? 'text-amber-400' : template === 'luxury-premium' ? 'text-yellow-600' : template === 'artistic-creative' ? 'text-pink-200' : 'text-gray-500'}`}>${todaySpecial.dish.price.toFixed(2)}</span>
                                        <span className={styles.promotionalPrice}>${todaySpecial.dish.promotionalPrice.toFixed(2)}</span>
                                    </>
                                ) : (
                                    <span className={styles.price}>${todaySpecial.dish.price.toFixed(2)}</span>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                                {todaySpecial.dish.promotionalPrice && todaySpecial.dish.promotionalPrice > 0 && (
                                    <div className={styles.specialOffer}>
                                        {dictionary.web?.menu?.todayOnly || 'Solo por hoy'}
                                    </div>
                                )}
                                <span className={`text-sm sm:text-base ${template === 'retro-vintage' ? 'text-amber-600' : template === 'luxury-premium' ? 'text-yellow-600/70' : template === 'artistic-creative' ? 'text-pink-200' : 'text-gray-500'}`}>• {dictionary.web?.menu?.todayOnly || 'Solo por hoy'}</span>
                            </div>

                            {/* Botón de WhatsApp - solo en vista general */}
                            {whatsappLink && !isTableSpecificView && (
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.button}
                                >
                                    {dictionary.web?.menu?.contact || 'Contactar'}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para ver imagen completa */}
            {todaySpecial.dish.imageUrl && (
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    imageUrl={todaySpecial.dish.imageUrl}
                    imageName={todaySpecial.dish.name}
                    description={todaySpecial.dish.description}
                    price={todaySpecial.dish.price}
                    promotionalPrice={todaySpecial.dish.promotionalPrice ?? undefined}
                    isSpecialDish={!!todaySpecial.dish.promotionalPrice && todaySpecial.dish.promotionalPrice > 0}
                />
            )}
        </section>
    );
} 