import React from 'react';
import Image from 'next/image';
import { MessageCircle, Coffee, Crown, Sparkles, Star, Minus, Palette } from 'lucide-react';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { Dictionary } from '@repo/internationalization';
import { generateWhatsAppLink } from './utils';
import { getTemplateStyles } from './templateStyles';
import { MenuHeaderProps, getDefaultTemplate } from '../../types/templates';

export default function MenuHeader({ restaurantConfig, dictionary, isTableSpecificView = false, themeColor = '#16a34a', template = getDefaultTemplate() }: MenuHeaderProps) {
    const whatsappLink = restaurantConfig.phone ? generateWhatsAppLink(restaurantConfig.phone) : '';
    const styles = getTemplateStyles(template);

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className="flex items-center gap-6">
                    {restaurantConfig.logoUrl ? (
                        <div className={styles.logo}>
                            <div className="w-12 h-12 relative">
                                <Image
                                    src={restaurantConfig.logoUrl}
                                    alt={`${restaurantConfig.name} logo`}
                                    fill
                                    className="object-contain rounded-2xl"
                                    sizes="48px"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.logo}>
                            {template === 'retro-vintage' ? (
                                <>
                                    <div className="absolute inset-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                        <Coffee className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">★</span>
                                    </div>
                                </>
                            ) : template === 'luxury-premium' ? (
                                <>
                                    <Crown className="w-8 h-8 text-white" />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"></div>
                                </>
                            ) : template === 'playful-fun' ? (
                                <>
                                    <span className="text-3xl transform -rotate-12">🍽️</span>
                                </>
                            ) : template === 'zen-minimal' ? (
                                <>
                                    <div className="w-1 sm:w-2 h-12 sm:h-16 bg-black"></div>
                                </>
                            ) : template === 'artistic-creative' ? (
                                <>
                                    <Palette className="w-8 h-8 text-white transform -rotate-12" />
                                </>
                            ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-xl">{restaurantConfig.name.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className={template === 'zen-minimal' ? 'ml-8' : ''}>
                        <h1 className={styles.title}>{restaurantConfig.name}</h1>
                        {restaurantConfig.description && (
                            <p className={styles.subtitle}>{restaurantConfig.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        {restaurantConfig.address && (
                            <div className={styles.infoCard}>
                                📍 {restaurantConfig.address}
                            </div>
                        )}
                        {restaurantConfig.email && (
                            <div className={styles.infoCard}>
                                ✉️ {restaurantConfig.email}
                            </div>
                        )}
                    </div>
                    {/* Botón de WhatsApp - solo en vista general */}
                    {whatsappLink && !isTableSpecificView && (
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.button}
                        >
                            💬 WhatsApp
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
} 