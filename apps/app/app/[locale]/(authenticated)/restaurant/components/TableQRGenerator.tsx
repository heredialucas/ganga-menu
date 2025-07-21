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
import { getRestaurantTables } from '../actions';

interface TableQRGeneratorProps {
    config: RestaurantConfigData | null;
    appUrl: string;
}

export function TableQRGenerator({ config, appUrl }: TableQRGeneratorProps) {
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
            toast.error('Error al cargar las mesas');
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
            toast.error('Error al generar el código QR');
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
        toast.success('QR descargado correctamente');
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
                        <title>QR Mesa ${selectedTable.label}</title>
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
                            <img src="${qrCodeUrl}" alt="QR Code" style="width: 300px; height: 300px;" />
                            <div class="table-info">Mesa ${selectedTable.label}</div>
                            <div class="restaurant-info">${config.name}</div>
                            <div class="instructions">
                                Escanea este código QR para ver el menú y hacer tu pedido
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    if (!config) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Primero configura tu restaurante</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Información explicativa */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        Códigos QR por Mesa
                    </CardTitle>
                    <CardDescription>
                        Genera códigos QR específicos para cada mesa de tu restaurante.
                        Cada QR llevará a los clientes directamente al menú de esa mesa específica.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-2">¿Cómo funciona?</p>
                                <ul className="space-y-1">
                                    <li>• <strong>Seguridad:</strong> Cada mesa tiene su propio QR único</li>
                                    <li>• <strong>Simplicidad:</strong> Los clientes no necesitan seleccionar mesa</li>
                                    <li>• <strong>Organización:</strong> Los pedidos se asocian automáticamente a la mesa correcta</li>
                                    <li>• <strong>Experiencia:</strong> Proceso más rápido y sin errores</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de mesas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mesas Disponibles</CardTitle>
                        <CardDescription>
                            Selecciona una mesa para generar su código QR único
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Cargando mesas...</p>
                            </div>
                        ) : tables.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No hay mesas configuradas</p>
                                <p className="text-sm">Configura las mesas en la pestaña "Diseño"</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {tables.map((table) => (
                                    <button
                                        key={table.id}
                                        onClick={() => generateQRForTable(table)}
                                        className={`p-4 rounded-lg border-2 transition-all ${selectedTable?.id === table.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {table.label}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Mesa {table.label}
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
                        <CardTitle>Código QR</CardTitle>
                        <CardDescription>
                            {selectedTable
                                ? `QR para Mesa ${selectedTable.label}`
                                : 'Selecciona una mesa para ver el QR'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedTable && qrCodeUrl ? (
                            <div className="space-y-4">
                                {/* QR Code */}
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white rounded-lg border">
                                        <img
                                            src={qrCodeUrl}
                                            alt={`QR Code Mesa ${selectedTable.label}`}
                                            className="w-64 h-64"
                                        />
                                    </div>
                                </div>

                                {/* Información de la mesa */}
                                <div className="text-center space-y-2">
                                    <Badge variant="secondary" className="text-lg px-4 py-2">
                                        Mesa {selectedTable.label}
                                    </Badge>
                                    <p className="text-sm text-gray-600">
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
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar
                                    </Button>
                                    <Button
                                        onClick={printQR}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Imprimir
                                    </Button>
                                    <Button
                                        onClick={copyMenuUrl}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copiar URL
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p>Selecciona una mesa para generar el código QR</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 