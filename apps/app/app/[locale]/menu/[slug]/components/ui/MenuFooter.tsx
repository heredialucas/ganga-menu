import React from 'react';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { Dictionary } from '@repo/internationalization';
import DecorativeElements from './DecorativeElements';
import { SnowParticlesWrapper } from './SnowParticlesWrapper';

interface MenuFooterProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
}

// Función para formatear horarios con soporte a múltiples rangos
function formatHoursAsJSX(hours: string, dictionary: Dictionary): React.ReactElement {
    try {
        const parsed = JSON.parse(hours);
        if (parsed && typeof parsed === 'object') {
            const DAYS = [
                { key: 'monday', label: 'Lunes' },
                { key: 'tuesday', label: 'Martes' },
                { key: 'wednesday', label: 'Miércoles' },
                { key: 'thursday', label: 'Jueves' },
                { key: 'friday', label: 'Viernes' },
                { key: 'saturday', label: 'Sábado' },
                { key: 'sunday', label: 'Domingo' }
            ];

            const openDays = DAYS.filter(({ key }) => {
                const day = parsed[key];
                return day && day.isOpen;
            }).map(({ key, label }) => {
                const day = parsed[key];

                // Soporte para múltiples rangos horarios
                if (day.ranges && Array.isArray(day.ranges) && day.ranges.length > 0) {
                    const ranges = day.ranges.map((range: any, index: number) => (
                        <span key={index} className="font-mono text-white/90">
                            {range.openTime} - {range.closeTime}
                            {index < day.ranges.length - 1 && ', '}
                        </span>
                    ));
                    return (
                        <div key={key} className="flex justify-between items-center py-1 hover:bg-white/5 rounded px-2 transition-all duration-300">
                            <span className="font-medium text-white/80">{label}:</span>
                            <span>{ranges}</span>
                        </div>
                    );
                }

                // Compatibilidad con formato anterior (openTime/closeTime directos)
                if (day.openTime && day.closeTime) {
                    return (
                        <div key={key} className="flex justify-between items-center py-1 hover:bg-white/5 rounded px-2 transition-all duration-300">
                            <span className="font-medium text-white/80">{label}:</span>
                            <span className="font-mono text-white/90">{day.openTime} - {day.closeTime}</span>
                        </div>
                    );
                }

                return null;
            }).filter(Boolean);

            return openDays.length > 0 ? (
                <div className="space-y-1 bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                    {openDays}
                </div>
            ) : (
                <div className="text-white/70 bg-black/20 rounded-lg p-3 backdrop-blur-sm">
                    {dictionary.web?.menu?.closed || 'Cerrado'}
                </div>
            );
        }
    } catch {
        return <div className="text-white/70 bg-black/20 rounded-lg p-3 backdrop-blur-sm">{hours}</div>;
    }
    return <div className="text-white/70 bg-black/20 rounded-lg p-3 backdrop-blur-sm">{hours}</div>;
}

export default function MenuFooter({ restaurantConfig, dictionary }: MenuFooterProps) {
    return (
        <footer className={`text-white py-12 mt-12 relative overflow-hidden`} style={{ background: 'var(--gradient-header)' }}>
            {/* Gradientes animados de fondo más hermosos */}
            <div className="absolute inset-0">
                {/* Gradiente base con movimiento */}
                <div className={`absolute inset-0 animate-pulse`} style={{ background: 'var(--gradient-overlay)' }}></div>

                {/* Gradientes animados múltiples */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-shimmer"></div>
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent animate-shimmer" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/6 to-transparent animate-shimmer" style={{ animationDelay: '3s', animationDuration: '5s' }}></div>

                {/* Gradiente de brillo superior */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10"></div>

                {/* Efecto de ondas */}
                <div className="absolute inset-0 bg-gradient-radial from-white/3 via-transparent to-transparent animate-pulse" style={{ animationDuration: '6s' }}></div>
            </div>

            {/* Partículas de nieve en el footer */}
            <div className="absolute inset-0 overflow-hidden">
                <SnowParticlesWrapper
                    count={25}
                />
            </div>

            {/* Elementos decorativos */}
            <DecorativeElements
                variant="background"
            />

            {/* Efecto de ondas en la parte superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

            <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                <div className="animate-fadeInUp">
                    <h3 className={`text-3xl md:text-4xl font-bold mb-4 drop-shadow-2xl hover:scale-105 transition-all duration-500 bg-clip-text text-transparent`} style={{ backgroundImage: 'var(--theme-text-gradient)' }}>
                        {restaurantConfig.name}
                    </h3>
                    {restaurantConfig.description && (
                        <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-lg font-medium max-w-2xl mx-auto animate-slideInLeft">
                            {restaurantConfig.description}
                        </p>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-8 text-sm md:text-base mb-8">
                    {restaurantConfig.address && (
                        <div className="group animate-slideInLeft bg-black/20 rounded-xl p-6 backdrop-blur-sm hover:bg-black/30 transition-all duration-500 hover:scale-105">
                            <h4 className="font-bold mb-3 text-lg md:text-xl group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
                                <span className="text-2xl">📍</span>
                                {dictionary.web?.menu?.address || 'Dirección'}
                            </h4>
                            <p className="text-white/90 group-hover:text-white transition-colors duration-300 font-medium">
                                {restaurantConfig.address}
                            </p>
                        </div>
                    )}
                    {restaurantConfig.hours && (
                        <div className="group animate-slideInRight bg-black/20 rounded-xl p-6 backdrop-blur-sm hover:bg-black/30 transition-all duration-500 hover:scale-105">
                            <h4 className="font-bold mb-3 text-lg md:text-xl group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
                                <span className="text-2xl">🕒</span>
                                {dictionary.web?.menu?.hours || 'Horarios'}
                            </h4>
                            <div className="text-white/90 group-hover:text-white transition-colors duration-300">
                                {formatHoursAsJSX(restaurantConfig.hours, dictionary)}
                            </div>
                        </div>
                    )}
                </div>

                {restaurantConfig.email && (
                    <div className="mb-8 group animate-fadeInUp bg-black/20 rounded-xl p-6 backdrop-blur-sm hover:bg-black/30 transition-all duration-500 hover:scale-105 max-w-md mx-auto">
                        <h4 className="font-bold mb-3 text-lg md:text-xl group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
                            <span className="text-2xl">✉️</span>
                            {dictionary.web?.menu?.contact || 'Contacto'}
                        </h4>
                        <a
                            href={`mailto:${restaurantConfig.email}`}
                            className="text-white/90 hover:text-white transition-all duration-300 underline decoration-transparent hover:decoration-white font-medium text-lg hover:scale-105 inline-block"
                        >
                            {restaurantConfig.email}
                        </a>
                    </div>
                )}

                <div className="pt-8 border-t border-white/20 relative animate-fadeInUp">
                    {/* Línea decorativa animada */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>

                    <p className="text-sm md:text-base text-white/70 hover:text-white/90 transition-colors duration-300">
                        {dictionary.web?.menu?.footer?.poweredBy || 'Menú digital creado con'}
                        <span className={`font-bold ml-2 text-lg md:text-xl drop-shadow-lg hover:scale-110 inline-block transition-all duration-300 bg-clip-text text-transparent`} style={{ backgroundImage: 'var(--theme-text-gradient)' }}>
                            Ganga Menu
                        </span>
                    </p>
                </div>
            </div>

            {/* Efecto de partículas en las esquinas */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-8 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-white/35 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-4 right-4 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </footer>
    );
} 