'use client';

import React, { useState, useCallback } from 'react';
import { Copy, ExternalLink, QrCode, Download, ChefHat } from 'lucide-react';
import QRCode from 'qrcode';

// Función auxiliar para generar URL del menú
function generateMenuUrl(slug: string, locale: string): string {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://ganga-menu-app.vercel.app'
        : 'http://localhost:4000';
    return `${baseUrl}/${locale}/menu/${slug}`;
}

// Función auxiliar para generar URL de mozos
function generateWaiterUrl(slug: string, locale: string): string {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://ganga-menu-app.vercel.app'
        : 'http://localhost:4000';
    return `${baseUrl}/${locale}/waiter/${slug}`;
}

// Función auxiliar para generar URL de cocina
function generateKitchenUrl(slug: string, locale: string): string {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://ganga-menu-app.vercel.app'
        : 'http://localhost:4000';
    return `${baseUrl}/${locale}/kitchen/${slug}`;
}

interface MenuShareWidgetProps {
    slug: string;
    locale: string;
    restaurantName: string;
    compact?: boolean; // Para mostrar versión compacta en otras vistas
}

export default function MenuShareWidget({ slug, locale, restaurantName, compact = false }: MenuShareWidgetProps) {
    const [copied, setCopied] = useState(false);
    const [copiedWaiter, setCopiedWaiter] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);

    const menuUrl = generateMenuUrl(slug, locale);
    const waiterUrl = generateWaiterUrl(slug, locale);
    const kitchenUrl = generateKitchenUrl(slug, locale);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(menuUrl);
            setCopied(true);
            const timer = window.setTimeout(() => setCopied(false), 2000);
            return () => window.clearTimeout(timer);
        } catch (err) {
            console.error('Error copying to clipboard:', err);
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = menuUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            const timer = window.setTimeout(() => setCopied(false), 2000);
            return () => window.clearTimeout(timer);
        }
    }, [menuUrl]);

    const copyWaiterToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(waiterUrl);
            setCopiedWaiter(true);
            const timer = window.setTimeout(() => setCopiedWaiter(false), 2000);
            return () => window.clearTimeout(timer);
        } catch (err) {
            console.error('Error copying to clipboard:', err);
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = waiterUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedWaiter(true);
            const timer = window.setTimeout(() => setCopiedWaiter(false), 2000);
            return () => window.clearTimeout(timer);
        }
    }, [waiterUrl]);

    const generateAndDownloadQR = useCallback(async () => {
        if (generatingQR) return;

        setGeneratingQR(true);
        try {
            // Generar QR code como Data URL
            const qrDataUrl = await QRCode.toDataURL(menuUrl, {
                width: 512,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            // Crear elemento para download
            const link = document.createElement('a');
            link.href = qrDataUrl;
            link.download = `menu-qr-${slug}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating QR code:', error);
        } finally {
            setGeneratingQR(false);
        }
    }, [menuUrl, slug, generatingQR]);

    if (compact) {
        return (
            <div className="space-y-3">
                {/* Enlace del Menú - Versión Compacta */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-800 mb-1">
                                🔗 Enlace del Menú
                            </p>
                            <p className="text-xs text-green-700 truncate font-mono">
                                {menuUrl}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={copyToClipboard}
                                className={`p-2 text-xs rounded-md transition-colors ${copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                title="Copiar enlace"
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                            <a
                                href={menuUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                                title="Ver menú"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                                onClick={generateAndDownloadQR}
                                disabled={generatingQR}
                                className="p-2 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 rounded-md transition-colors"
                                title="Descargar QR"
                            >
                                <QrCode className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enlace de Mozos - Versión Compacta */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-blue-800 mb-1">
                                👨‍🍳 Sistema de Mozos
                            </p>
                            <p className="text-xs text-blue-700 truncate font-mono">
                                {waiterUrl}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={copyWaiterToClipboard}
                                className={`p-2 text-xs rounded-md transition-colors ${copiedWaiter
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                title="Copiar enlace de mozos"
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                            <a
                                href={waiterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                                title="Abrir sistema de mozos"
                            >
                                <ChefHat className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Enlace de Cocina - Versión Compacta */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-orange-800 mb-1">
                                🍳 Panel de Cocina
                            </p>
                            <p className="text-xs text-orange-700 truncate font-mono">
                                {kitchenUrl}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <a
                                href={kitchenUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-md transition-colors"
                                title="Abrir panel de cocina"
                            >
                                <ChefHat className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Enlace del Menú para Clientes */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4">
                    🔗 Enlace de tu Menú
                </h2>
                <p className="text-xs sm:text-sm text-green-700 mb-3 sm:mb-4">
                    Comparte este enlace con tus clientes para que vean tu menú de <strong>{restaurantName}</strong>
                </p>

                {/* URL del menú */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                    <input
                        type="text"
                        value={menuUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-green-800 font-mono text-xs sm:text-sm overflow-hidden text-ellipsis"
                    />
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={copyToClipboard}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                        >
                            <Copy className="w-4 h-4 inline mr-1" />
                            {copied ? '¡Copiado!' : 'Copiar'}
                        </button>
                        <a
                            href={menuUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center"
                        >
                            <ExternalLink className="w-4 h-4 inline mr-1" />
                            <span className="sm:hidden">Ver</span>
                            <span className="hidden sm:inline">Ver Menú</span>
                        </a>
                    </div>
                </div>

                {/* Botón QR */}
                <div className="flex justify-center">
                    <button
                        onClick={generateAndDownloadQR}
                        disabled={generatingQR}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                        {generatingQR ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generando QR...
                            </>
                        ) : (
                            <>
                                <QrCode className="w-4 h-4" />
                                <Download className="w-4 h-4" />
                                Descargar Código QR
                            </>
                        )}
                    </button>
                </div>

                <p className="text-xs text-green-600 text-center mt-2">
                    💡 Imprime el código QR y colócalo en tu restaurante para que los clientes accedan fácilmente
                </p>
            </div>

            {/* Enlace del Sistema de Mozos */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4">
                    👨‍🍳 Sistema de Órdenes para Mozos
                </h2>
                <p className="text-xs sm:text-sm text-blue-700 mb-3 sm:mb-4">
                    Comparte este enlace con tus mozos para que puedan tomar órdenes digitalmente
                </p>

                {/* URL del sistema de mozos */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                        type="text"
                        value={waiterUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-md text-blue-800 font-mono text-xs sm:text-sm overflow-hidden text-ellipsis"
                    />
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={copyWaiterToClipboard}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${copiedWaiter
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                        >
                            <Copy className="w-4 h-4 inline mr-1" />
                            {copiedWaiter ? '¡Copiado!' : 'Copiar'}
                        </button>
                        <a
                            href={waiterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                        >
                            <ChefHat className="w-4 h-4 inline mr-1" />
                            <span className="sm:hidden">Ver</span>
                            <span className="hidden sm:inline">Ir al sistema</span>
                        </a>
                    </div>
                </div>

                <p className="text-xs text-blue-600 text-center mt-3">
                    🔐 Los mozos necesitarán el código de acceso que configuraste para poder ingresar
                </p>
            </div>

            {/* Enlace del Panel de Cocina */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-orange-800 mb-3 sm:mb-4">
                    🍳 Panel de Cocina
                </h2>
                <p className="text-xs sm:text-sm text-orange-700 mb-3 sm:mb-4">
                    Enlace directo para que la cocina gestione todas las órdenes
                </p>

                {/* URL del panel de cocina */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                        type="text"
                        value={kitchenUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-orange-300 rounded-md text-orange-800 font-mono text-xs sm:text-sm overflow-hidden text-ellipsis"
                    />
                    <div className="flex gap-2 sm:gap-3">
                        <a
                            href={kitchenUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-center"
                        >
                            <ChefHat className="w-4 h-4 inline mr-1" />
                            <span className="sm:hidden">Ver</span>
                            <span className="hidden sm:inline">Ir a Cocina</span>
                        </a>
                    </div>
                </div>

                <p className="text-xs text-orange-600 text-center mt-3">
                    👨‍🍳 Vista privada para la cocina - no requiere código de acceso
                </p>
            </div>
        </div>
    );
} 