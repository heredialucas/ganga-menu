import React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    imageName: string;
    description?: string;
    price: number;
    promotionalPrice?: number;
    isSpecialDish?: boolean;
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
}

export default function ImageModal({
    isOpen,
    onClose,
    imageUrl,
    imageName,
    description,
    price,
    promotionalPrice,
    isSpecialDish,
    themeColors
}: ImageModalProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Manejar tecla ESC para cerrar
    React.useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Prevenir scroll del body cuando el modal está abierto
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen, onClose]);

    if (!mounted || !isOpen) return null;

    // Manejar clic en el overlay para cerrar
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeInUp p-2 sm:p-4"
            onClick={handleOverlayClick}
        >
            <div className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh]">
                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    className="absolute -top-8 sm:-top-12 right-0 z-10 p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-300 hover:scale-110"
                    aria-label="Cerrar modal"
                >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Contenedor de la imagen */}
                <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl">
                    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gray-100">
                        <Image
                            src={imageUrl}
                            alt={imageName}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                            priority
                        />
                    </div>

                    {/* Información de la imagen con gradiente temático */}
                    <div className={`${themeColors.gradients.category} ${themeColors.text} p-3 sm:p-4 md:p-6 relative overflow-hidden`}>
                        {/* Gradientes animados de fondo */}
                        <div className="absolute inset-0">
                            {/* Gradiente base con movimiento */}
                            <div className={`absolute inset-0 ${themeColors.gradients.overlay} animate-pulse`}></div>

                            {/* Gradientes animados múltiples */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent animate-shimmer" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>

                            {/* Gradiente de brillo superior */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3">
                                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-lg flex-1 break-words">
                                    {imageName}
                                </h3>
                                <div className="flex flex-col items-start sm:items-end text-left sm:text-right shrink-0">
                                    {isSpecialDish && promotionalPrice && promotionalPrice > 0 ? (
                                        <>
                                            <span className="text-sm sm:text-base md:text-lg text-white/70 line-through whitespace-nowrap drop-shadow-md">
                                                ${price.toFixed(2)}
                                            </span>
                                            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg whitespace-nowrap">
                                                ${promotionalPrice.toFixed(2)}
                                            </span>
                                            <span className="bg-red-500 text-white text-xs sm:text-sm font-semibold px-2 py-1 rounded-full mt-1 whitespace-nowrap drop-shadow-md">
                                                OFERTA
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg whitespace-nowrap">
                                            ${price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {description && (
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 drop-shadow-md leading-relaxed break-words">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
} 