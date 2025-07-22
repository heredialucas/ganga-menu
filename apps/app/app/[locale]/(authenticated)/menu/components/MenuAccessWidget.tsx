'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { QrCode, Download, Copy, ExternalLink } from 'lucide-react';
import { toDataURL } from 'qrcode';
import { toast } from 'sonner';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';

interface MenuAccessWidgetProps {
    config: RestaurantConfigData | null;
    appUrl: string;
}

export function MenuAccessWidget({ config, appUrl }: MenuAccessWidgetProps) {
    const [slug, setSlug] = useState(config?.slug || '');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState(config?.themeColor || '#16a34a');
    const menuUrl = `${appUrl}/es/menu/${slug || 'tu-restaurante'}`;

    useEffect(() => {
        toDataURL(menuUrl, { errorCorrectionLevel: 'H', width: 256, margin: 2 }, (err, dataUrl) => {
            if (err) {
                console.error("QR Code Generation Error:", err);
                return;
            }
            setQrCodeDataUrl(dataUrl);
        });
    }, [menuUrl]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(menuUrl);
        toast.success("Enlace del menú copiado al portapapeles.");
    };

    const handleDownloadQR = () => {
        if (!qrCodeDataUrl) return;
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `qr-codigo-${slug || 'menu'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR descargado correctamente");
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
        <Card>
            <CardHeader>
                <CardTitle>Acceso de Clientes</CardTitle>
                <CardDescription>
                    Configura cómo tus clientes accederán al menú digital. Este enlace y QR son los que debes compartir.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-start p-3 sm:p-4 md:p-6">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="slug">Enlace Personalizado (URL)</Label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                            <span className="flex-shrink-0 text-xs sm:text-sm text-muted-foreground p-2 bg-muted rounded-t-md sm:rounded-l-md sm:rounded-t-none border border-b-0 sm:border-b sm:border-r-0">
                                {`${appUrl}/es/menu/`}
                            </span>
                            <Input
                                id="slug"
                                name="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="tu-restaurante"
                                className="rounded-t-none sm:rounded-l-none min-w-0"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={handleCopyToClipboard} className="w-full">
                                <Copy className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Copiar Enlace</span>
                                <span className="sm:hidden">Copiar</span>
                            </Button>
                            <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button type="button" variant="outline" className="w-full">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Vista previa</span>
                                    <span className="sm:hidden">Vista</span>
                                </Button>
                            </a>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="themeColor">Color Principal del Sitio</Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-md border flex-shrink-0"
                                style={{ backgroundColor: themeColor }}
                            />
                            <div className="flex items-center gap-2 flex-1">
                                <Input
                                    id="themeColor"
                                    name="themeColor"
                                    type="color"
                                    value={themeColor}
                                    onChange={(e) => setThemeColor(e.target.value)}
                                    className="p-1 h-8 w-12 flex-shrink-0"
                                />
                                <Input
                                    type="text"
                                    value={themeColor}
                                    onChange={(e) => setThemeColor(e.target.value)}
                                    placeholder="#16a34a"
                                    className="w-full sm:w-28"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Este será el color predominante en la página que ven tus clientes.</p>
                    </div>
                </div>
                <div className="lg:col-span-1 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg">
                    <Label className="text-sm sm:text-base">Código QR del Menú</Label>
                    <div className="relative group">
                        {qrCodeDataUrl ? (
                            <img src={qrCodeDataUrl} alt="Código QR del Menú" className="w-24 h-24 sm:w-32 sm:h-32" />
                        ) : (
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-md flex items-center justify-center">
                                <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    {qrCodeDataUrl && (
                        <Button type="button" variant="outline" size="sm" onClick={handleDownloadQR} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Descargar QR</span>
                            <span className="sm:hidden">Descargar</span>
                        </Button>
                    )}
                    <p className="text-xs text-muted-foreground">Tus clientes pueden escanear este código para ver el menú.</p>
                </div>
            </CardContent>
        </Card>
    );
} 