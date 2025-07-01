'use client';

import React, { useState, useCallback } from 'react';
import { Copy, ExternalLink, QrCode, Download, ChefHat } from 'lucide-react';
import QRCode from 'qrcode';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@repo/design-system/components/ui/accordion';

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
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="compact-main" className="border border-gray-200 rounded-lg">
                    <AccordionTrigger className="px-3 py-2 text-gray-800 hover:text-gray-900">
                        <span className="text-sm font-semibold">
                            🔗 Enlaces del Restaurante
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pb-3">
                        <Accordion type="single" collapsible className="w-full space-y-2 px-3">
                            {/* Enlace del Menú - Versión Compacta */}
                            <AccordionItem value="compact-menu" className="bg-green-50 border border-green-200 rounded-lg">
                                <AccordionTrigger className="px-3 py-2 text-green-800 hover:text-green-900">
                                    <span className="text-xs font-medium">
                                        🔗 Enlace del Menú
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3">
                                    <p className="text-xs text-green-700 truncate font-mono mb-2">
                                        {menuUrl}
                                    </p>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={copyToClipboard}
                                            className={`p-2 text-xs rounded-md transition-colors flex-1 ${copied
                                                ? 'bg-green-600 text-white'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                            title="Copiar enlace"
                                        >
                                            <Copy className="w-3 h-3 mx-auto" />
                                        </button>
                                        <a
                                            href={menuUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors flex-1"
                                            title="Ver menú"
                                        >
                                            <ExternalLink className="w-3 h-3 mx-auto" />
                                        </a>
                                        <button
                                            onClick={generateAndDownloadQR}
                                            disabled={generatingQR}
                                            className="p-2 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 rounded-md transition-colors flex-1"
                                            title="Descargar QR"
                                        >
                                            <QrCode className="w-3 h-3 mx-auto" />
                                        </button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Enlace de Mozos - Versión Compacta */}
                            <AccordionItem value="compact-waiter" className="bg-blue-50 border border-blue-200 rounded-lg">
                                <AccordionTrigger className="px-3 py-2 text-blue-800 hover:text-blue-900">
                                    <span className="text-xs font-medium">
                                        👨‍🍳 Sistema de Mozos
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3">
                                    <p className="text-xs text-blue-700 truncate font-mono mb-2">
                                        {waiterUrl}
                                    </p>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={copyWaiterToClipboard}
                                            className={`p-2 text-xs rounded-md transition-colors flex-1 ${copiedWaiter
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                }`}
                                            title="Copiar enlace de mozos"
                                        >
                                            <Copy className="w-3 h-3 mx-auto" />
                                        </button>
                                        <a
                                            href={waiterUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors flex-1"
                                            title="Abrir sistema de mozos"
                                        >
                                            <ChefHat className="w-3 h-3 mx-auto" />
                                        </a>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Enlace de Cocina - Versión Compacta */}
                            <AccordionItem value="compact-kitchen" className="bg-orange-50 border border-orange-200 rounded-lg">
                                <AccordionTrigger className="px-3 py-2 text-orange-800 hover:text-orange-900">
                                    <span className="text-xs font-medium">
                                        🍳 Panel de Cocina
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3">
                                    <p className="text-xs text-orange-700 truncate font-mono mb-2">
                                        {kitchenUrl}
                                    </p>
                                    <div className="flex gap-1">
                                        <a
                                            href={kitchenUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-md transition-colors flex-1"
                                            title="Abrir panel de cocina"
                                        >
                                            <ChefHat className="w-3 h-3 mx-auto" />
                                        </a>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="main" className="border border-gray-200 rounded-lg">
                <AccordionTrigger className="px-4 sm:px-6 py-4 text-gray-800 hover:text-gray-900">
                    <span className="text-lg sm:text-xl font-semibold">
                        🔗 Enlaces del Restaurante - {restaurantName}
                    </span>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-4">
                    <Accordion type="single" collapsible className="w-full space-y-3 px-4 sm:px-6">
                        {/* Enlace del Menú para Clientes */}
                        <AccordionItem value="menu" className="bg-green-50 border border-green-200 rounded-lg">
                            <AccordionTrigger className="px-4 sm:px-6 text-green-800 hover:text-green-900">
                                <span className="text-base sm:text-lg font-semibold">
                                    🔗 Enlace de tu Menú
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6 pb-4">
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* Enlace del Sistema de Mozos */}
                        <AccordionItem value="waiter" className="bg-blue-50 border border-blue-200 rounded-lg">
                            <AccordionTrigger className="px-4 sm:px-6 text-blue-800 hover:text-blue-900">
                                <span className="text-base sm:text-lg font-semibold">
                                    👨‍🍳 Sistema de Órdenes para Mozos
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6 pb-4">
                                <p className="text-xs sm:text-sm text-blue-700 mb-3 sm:mb-4">
                                    Comparte este enlace con tus mozos para que puedan tomar órdenes digitalmente
                                </p>

                                {/* URL del sistema de mozos */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
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

                                <p className="text-xs text-blue-600 text-center">
                                    🔐 Los mozos necesitarán el código de acceso que configuraste para poder ingresar
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Enlace del Panel de Cocina */}
                        <AccordionItem value="kitchen" className="bg-orange-50 border border-orange-200 rounded-lg">
                            <AccordionTrigger className="px-4 sm:px-6 text-orange-800 hover:text-orange-900">
                                <span className="text-base sm:text-lg font-semibold">
                                    🍳 Panel de Cocina
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6 pb-4">
                                <p className="text-xs sm:text-sm text-orange-700 mb-3 sm:mb-4">
                                    Enlace directo para que la cocina gestione todas las órdenes
                                </p>

                                {/* URL del panel de cocina */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
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

                                <p className="text-xs text-orange-600 text-center">
                                    👨‍🍳 Vista privada para la cocina - no requiere código de acceso
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
} 