import React from 'react';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { Dictionary } from '@repo/internationalization';
import { getTemplateStyles } from './templateStyles';
import { MenuFooterProps, getDefaultTemplate } from '../../types/templates';
import { Coffee, Crown, Star, Heart, Minus, Palette } from 'lucide-react';

// Función para formatear horarios con soporte a múltiples rangos
function formatHoursAsJSX(hours: string, dictionary: Dictionary, styles: any, template?: string): React.ReactElement {
    try {
        const parsed = JSON.parse(hours);
        if (parsed && typeof parsed === 'object') {
            const DAYS = [
                { key: 'monday', label: dictionary.app?.restaurant?.openingHours?.days?.monday || 'Lunes' },
                { key: 'tuesday', label: dictionary.app?.restaurant?.openingHours?.days?.tuesday || 'Martes' },
                { key: 'wednesday', label: dictionary.app?.restaurant?.openingHours?.days?.wednesday || 'Miércoles' },
                { key: 'thursday', label: dictionary.app?.restaurant?.openingHours?.days?.thursday || 'Jueves' },
                { key: 'friday', label: dictionary.app?.restaurant?.openingHours?.days?.friday || 'Viernes' },
                { key: 'saturday', label: dictionary.app?.restaurant?.openingHours?.days?.saturday || 'Sábado' },
                { key: 'sunday', label: dictionary.app?.restaurant?.openingHours?.days?.sunday || 'Domingo' }
            ];

            const openDays = DAYS.filter(({ key }) => {
                const day = parsed[key];
                return day && day.isOpen;
            }).map(({ key, label }) => {
                const day = parsed[key];

                // Nuevo formato con slots (formato actual del OpeningHoursManager)
                if (day.slots && Array.isArray(day.slots) && day.slots.length > 0) {
                    return (
                        <div key={key} className={styles.hoursItem}>
                            <span className={styles.hoursDay}>{label}:</span>
                            <div className="flex flex-col">
                                {day.slots.map((slot: any, index: number) => (
                                    <span key={index} className={`font-mono ${template === 'luxury-premium' ? 'text-yellow-400' : template === 'artistic-creative' ? 'text-white' : 'text-gray-600'}`}>
                                        {slot.open} - {slot.close}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                }

                // Soporte para múltiples rangos horarios (formato legacy)
                if (day.ranges && Array.isArray(day.ranges) && day.ranges.length > 0) {
                    return (
                        <div key={key} className={styles.hoursItem}>
                            <span className={styles.hoursDay}>{label}:</span>
                            <div className="flex flex-col">
                                {day.ranges.map((range: any, index: number) => (
                                    <span key={index} className={`font-mono ${template === 'luxury-premium' ? 'text-yellow-400' : template === 'artistic-creative' ? 'text-white' : 'text-gray-600'}`}>
                                        {range.openTime} - {range.closeTime}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                }

                // Compatibilidad con formato anterior (openTime/closeTime directos)
                if (day.openTime && day.closeTime) {
                    return (
                        <div key={key} className={styles.hoursItem}>
                            <span className={styles.hoursDay}>{label}:</span>
                            <div className="flex flex-col">
                                <span className={`font-mono ${template === 'luxury-premium' ? 'text-yellow-400' : template === 'artistic-creative' ? 'text-white' : 'text-gray-600'}`}>
                                    {day.openTime} - {day.closeTime}
                                </span>
                            </div>
                        </div>
                    );
                }

                return null;
            }).filter(Boolean);

            return openDays.length > 0 ? (
                <div className={styles.hoursContainer}>
                    {openDays}
                </div>
            ) : (
                <div className={`${template === 'luxury-premium' ? 'text-yellow-400' : template === 'artistic-creative' ? 'text-white' : 'text-gray-500'} ${styles.hoursContainer}`}>
                    {dictionary.web?.menu?.closed || 'Cerrado'}
                </div>
            );
        }
    } catch {
        return <div className={`${template === 'luxury-premium' ? 'text-yellow-400' : template === 'artistic-creative' ? 'text-white' : 'text-gray-500'} ${styles.hoursContainer}`}>{hours}</div>;
    }
    return <div className={`${template === 'luxury-premium' ? 'text-yellow-400' : template === 'artistic-creative' ? 'text-white' : 'text-gray-500'} ${styles.hoursContainer}`}>{hours}</div>;
}

export default function MenuFooter({ restaurantConfig, dictionary, themeColor = '#16a34a', template = getDefaultTemplate() }: MenuFooterProps) {
    const styles = getTemplateStyles(template);
    return (
        <footer className={styles.footer}>
            <div className="w-full max-w-7xl mx-auto text-center">
                <div className="animate-fadeInUp">
                    <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 hover:scale-105 transition-all duration-500 ${template === 'luxury-premium' ? 'text-yellow-400' : template === 'playful-fun' ? 'text-pink-700' : template === 'artistic-creative' ? 'text-white font-akaya-kanadaka' : 'text-gray-900'}`}>
                        {template === 'luxury-premium' ? (
                            <>
                                <Crown className="w-8 h-8 text-yellow-400 inline mr-3" />
                                {restaurantConfig.name}
                                <Crown className="w-8 h-8 text-yellow-400 inline ml-3" />
                            </>
                        ) : template === 'playful-fun' ? (
                            <>
                                <span className="text-3xl mr-3">🎉</span>
                                {restaurantConfig.name}
                                <span className="text-3xl ml-3">🎊</span>
                            </>
                        ) : template === 'zen-minimal' ? (
                            <>
                                <Minus className="w-8 h-8 text-black inline mr-3" />
                                {restaurantConfig.name}
                                <Minus className="w-8 h-8 text-black inline ml-3" />
                            </>
                        ) : template === 'artistic-creative' ? (
                            <>
                                <Palette className="w-8 h-8 text-pink-400 inline mr-3" />
                                {restaurantConfig.name}
                                <Palette className="w-8 h-8 text-purple-400 inline ml-3" />
                            </>
                        ) : template === 'retro-vintage' ? (
                            <>
                                <Coffee className="w-8 h-8 text-amber-800 inline mr-3" />
                                {restaurantConfig.name}
                                <Star className="w-8 h-8 text-amber-800 inline ml-3" />
                            </>
                        ) : (
                            restaurantConfig.name
                        )}
                    </h3>
                    {restaurantConfig.description && (
                        <p className={`text-base sm:text-lg md:text-xl mb-6 sm:mb-8 font-medium max-w-2xl mx-auto animate-slideInLeft ${template === 'luxury-premium' ? 'text-yellow-300' : template === 'artistic-creative' ? 'text-pink-200 font-[Lobster]' : 'text-gray-600'}`}>
                            {restaurantConfig.description}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-sm md:text-base mb-6 sm:mb-8">
                    {(restaurantConfig.address || restaurantConfig.email) && (
                        <div className={`group animate-slideInLeft ${styles.footerCard} transition-all duration-200 hover:scale-105 max-w-md mx-auto`}>
                            <h4 className={`font-bold mb-2 sm:mb-3 text-base sm:text-lg md:text-xl flex items-center justify-center gap-2 ${template === 'luxury-premium' ? 'text-yellow-400' : template === 'artistic-creative' ? 'text-white font-akaya-kanadaka' : 'text-gray-800'}`}>
                                <span className="text-xl sm:text-2xl">📍</span>
                                {dictionary.web?.menu?.contact || 'Contacto'}
                            </h4>
                            <div className="space-y-2">
                                {restaurantConfig.address && (
                                    <p className={`text-sm sm:text-base font-medium ${template === 'luxury-premium' ? 'text-yellow-300' : template === 'artistic-creative' ? 'text-pink-200 font-akaya-kanadaka' : 'text-gray-600'}`}>
                                        {restaurantConfig.address}
                                    </p>
                                )}
                                {restaurantConfig.email && (
                                    <a
                                        href={`mailto:${restaurantConfig.email}`}
                                        className={`transition-all duration-300 underline decoration-transparent font-medium text-sm sm:text-base hover:scale-105 inline-block ${template === 'luxury-premium' ? 'text-yellow-300 hover:text-yellow-400 hover:decoration-yellow-400' : template === 'artistic-creative' ? 'text-pink-200 hover:text-pink-300 hover:decoration-pink-300 font-akaya-kanadaka' : 'text-gray-600 hover:text-gray-800 hover:decoration-gray-800'}`}
                                    >
                                        {restaurantConfig.email}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                    {restaurantConfig.hours && (
                        <div className={`group animate-slideInRight ${styles.footerCard} transition-all duration-200 hover:scale-105 max-w-md mx-auto`}>
                            <h4 className={`font-bold mb-2 sm:mb-3 text-base sm:text-lg md:text-xl flex items-center justify-center gap-2 ${template === 'luxury-premium' ? 'text-yellow-400' : template === 'artistic-creative' ? 'text-white font-akaya-kanadaka' : 'text-gray-800'}`}>
                                <span className="text-xl sm:text-2xl">🕒</span>
                                {dictionary.web?.menu?.hours || 'Horarios'}
                            </h4>
                            <div className={`text-sm sm:text-base ${template === 'luxury-premium' ? 'text-yellow-300' : template === 'artistic-creative' ? 'text-pink-200 font-akaya-kanadaka' : 'text-gray-600'}`}>
                                {formatHoursAsJSX(restaurantConfig.hours, dictionary, styles, template)}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`pt-8 border-t relative animate-fadeInUp ${template === 'artistic-creative' ? 'border-pink-300/30' : 'border-gray-200'}`}>
                    {/* Línea decorativa sutil */}
                    <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent ${template === 'artistic-creative' ? 'via-pink-300' : 'via-gray-300'} to-transparent`}></div>

                    <p className={`text-sm md:text-base transition-colors duration-300 ${template === 'artistic-creative' ? 'text-pink-200 hover:text-pink-300 font-akaya-kanadaka' : 'text-gray-500 hover:text-gray-700'}`}>
                        {dictionary.web?.menu?.footer?.poweredBy || 'Menú digital creado con'}
                        <a
                            href="https://ganga-menu-web.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-bold ml-2 text-lg md:text-xl hover:scale-110 inline-block transition-all duration-300 ${template === 'artistic-creative' ? 'text-white hover:text-pink-300 font-akaya-kanadaka' : 'text-gray-800 hover:text-gray-900'}`}
                        >
                            Ganga-Menu
                        </a>
                    </p>
                </div>
            </div>

            {/* Elementos decorativos sutiles en las esquinas */}
            <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${styles.decorativeElement}`}></div>
            <div className={`absolute top-4 right-3 sm:top-8 sm:right-6 ${styles.decorativeElement}`}></div>
            <div className={`absolute bottom-3 left-4 sm:bottom-6 sm:left-8 ${styles.decorativeElement}`}></div>
            <div className={`absolute bottom-2 right-2 sm:bottom-4 sm:right-4 ${styles.decorativeElement}`}></div>
        </footer >
    );
} 