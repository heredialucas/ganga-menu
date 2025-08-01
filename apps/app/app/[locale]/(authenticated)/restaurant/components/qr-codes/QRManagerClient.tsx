'use client';

import React, { useState, useEffect } from 'react';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { TableData } from '@repo/data-services/src/services/tableService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Download, QrCode, Printer, Copy, Info } from 'lucide-react';
import { toDataURL } from 'qrcode';
import { toast } from 'sonner';
import { getRestaurantTables } from '../../actions';
import type { Dictionary } from '@repo/internationalization';

interface QRManagerClientProps {
    config: RestaurantConfigData | null;
    appUrl: string;
    dictionary: Dictionary;
    canEdit?: boolean;
    canView?: boolean;
}

export function QRManagerClient({ config, appUrl, dictionary, canEdit = true, canView = true }: QRManagerClientProps) {
    const [tables, setTables] = useState<TableData[]>([]);
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (config) {
            loadTables();
        }
    }, [config]);

    const loadTables = async () => {
        if (!config) return;

        try {
            setLoading(true);
            const result = await getRestaurantTables();

            if (result.success) {
                setTables(result.tables);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error cargando mesas:', error);
            toast.error(dictionary.app.restaurant.qr.toast.downloadError);
        } finally {
            setLoading(false);
        }
    };

    const generateQRForTable = async (table: TableData) => {
        try {
            // URL específica para esta mesa
            const menuUrl = `${appUrl}/es/menu/${config?.slug}/table/${table.id}`;

            // Generar QR
            const qrDataUrl = await toDataURL(menuUrl, {
                errorCorrectionLevel: 'H',
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            setQrCodeUrl(qrDataUrl);
            setSelectedTable(table);
        } catch (error) {
            console.error('Error generando QR:', error);
            toast.error(dictionary.app.restaurant.qr.toast.downloadError);
        }
    };

    const downloadQR = () => {
        if (!qrCodeUrl) return;

        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `qr-mesa-${selectedTable?.label}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(dictionary.app.restaurant.qr.toast.downloaded);
    };

    const copyMenuUrl = () => {
        if (!selectedTable || !config) return;

        const menuUrl = `${appUrl}/es/menu/${config.slug}/table/${selectedTable.id}`;
        navigator.clipboard.writeText(menuUrl);
        toast.success('URL copiada al portapapeles');
    };

    const printQR = () => {
        if (!qrCodeUrl || !selectedTable || !config) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${dictionary.app.restaurant.qr.table} ${selectedTable.label}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                text-align: center; 
                                padding: 20px;
                                margin: 0;
                            }
                            .qr-container {
                                display: inline-block;
                                padding: 20px;
                                border: 2px solid #ccc;
                                border-radius: 10px;
                                background: white;
                            }
                            .table-info {
                                margin-top: 15px;
                                font-size: 18px;
                                font-weight: bold;
                                color: #333;
                            }
                            .restaurant-info {
                                margin-top: 10px;
                                color: #666;
                                font-size: 14px;
                            }
                            .instructions {
                                margin-top: 15px;
                                font-size: 12px;
                                color: #888;
                                max-width: 300px;
                                margin-left: auto;
                                margin-right: auto;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="qr-container">
                            <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
                            <div class="table-info">${dictionary.app.restaurant.qr.table} ${selectedTable.label}</div>
                            <div class="restaurant-info">${config.name}</div>
                            <div class="instructions">
                                ${dictionary.app.restaurant.qr.printInstructions}
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    if (!canView) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{dictionary.app.restaurant.qr.toast.downloadError}</p>
            </div>
        );
    }

    if (!config) {
        return (
            <Card>
                <CardContent className="p-1 sm:p-2 md:p-6">
                    <div className="text-center text-gray-500">
                        <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>{dictionary.app.restaurant.view.noConfig}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Información explicativa */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                        {dictionary.app.restaurant.qr.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        {dictionary.app.restaurant.qr.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-1 sm:p-2 md:p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs sm:text-sm text-blue-800">
                                <p className="font-medium mb-2">{dictionary.app.restaurant.qr.howItWorks.title}</p>
                                <ul className="space-y-1">
                                    <li>• <strong>{dictionary.app.restaurant.qr.howItWorks.security}</strong></li>
                                    <li>• <strong>{dictionary.app.restaurant.qr.howItWorks.simplicity}</strong></li>
                                    <li>• <strong>{dictionary.app.restaurant.qr.howItWorks.organization}</strong></li>
                                    <li>• <strong>{dictionary.app.restaurant.qr.howItWorks.experience}</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Lista de mesas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">{dictionary.app.restaurant.qr.tablesAvailable}</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {dictionary.app.restaurant.qr.selectTableForQR}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-1 sm:p-2 md:p-6">
                        {loading ? (
                            <div className="text-center py-6 sm:py-8">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-2">{dictionary.app.restaurant.qr.loadingTables}</p>
                            </div>
                        ) : tables.length === 0 ? (
                            <div className="text-center py-6 sm:py-8 text-gray-500">
                                <QrCode className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-sm sm:text-base">{dictionary.app.restaurant.qr.noTablesConfigured}</p>
                                <p className="text-xs sm:text-sm">{dictionary.app.restaurant.qr.configureTablesInDesign}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                {tables.map((table) => (
                                    <button
                                        key={table.id}
                                        onClick={() => generateQRForTable(table)}
                                        className={`p-2 sm:p-4 rounded-lg border-2 transition-all ${selectedTable?.id === table.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                                                <span className="text-xs sm:text-sm font-semibold text-blue-600">
                                                    {table.label}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                                                {dictionary.app.restaurant.qr.table} {table.label}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Preview del QR */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">{dictionary.app.restaurant.qr.tableQR}</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {selectedTable
                                ? `${dictionary.app.restaurant.qr.tableForQR} ${selectedTable.label}`
                                : dictionary.app.restaurant.qr.selectTable
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-1 sm:p-2 md:p-6">
                        {selectedTable && qrCodeUrl ? (
                            <div className="space-y-3 sm:space-y-4">
                                {/* QR Code */}
                                <div className="flex justify-center">
                                    <div className="p-2 sm:p-4 bg-white rounded-lg border">
                                        <img
                                            src={qrCodeUrl}
                                            alt={`QR Code Mesa ${selectedTable.label}`}
                                            className="w-48 h-48 sm:w-64 sm:h-64"
                                        />
                                    </div>
                                </div>

                                {/* Información de la mesa */}
                                <div className="text-center space-y-2">
                                    <Badge variant="secondary" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
                                        {dictionary.app.restaurant.qr.table} {selectedTable.label}
                                    </Badge>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        {config.name}
                                    </p>
                                    <p className="text-xs text-gray-500 break-all">
                                        {appUrl}/es/menu/{config.slug}/table/{selectedTable.id}
                                    </p>
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Button
                                        onClick={downloadQR}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                                    >
                                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">{dictionary.app.restaurant.qr.downloadQR}</span>
                                        <span className="sm:hidden">{dictionary.app.restaurant.qr.downloadQR}</span>
                                    </Button>
                                    <Button
                                        onClick={printQR}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                                    >
                                        <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">{dictionary.app.restaurant.qr.print.desktop}</span>
                                        <span className="sm:hidden">{dictionary.app.restaurant.qr.print.mobile}</span>
                                    </Button>
                                    <Button
                                        onClick={copyMenuUrl}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                                    >
                                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">{dictionary.app.restaurant.qr.copyURL.desktop}</span>
                                        <span className="sm:hidden">{dictionary.app.restaurant.qr.copyURL.mobile}</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 sm:py-12 text-gray-500">
                                <QrCode className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-sm sm:text-base">{dictionary.app.restaurant.qr.selectTableToGenerate}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 