'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { QrCode, Download, Copy, ExternalLink, Save, Loader2 } from 'lucide-react';
import { toDataURL } from 'qrcode';
import { toast } from 'sonner';
import { saveMenuConfig } from '../actions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';
import { AVAILABLE_TEMPLATES, TemplateType } from '../../../menu/[slug]/types/templates';

interface MenuAccessWidgetProps {
    config: RestaurantConfigData | null;
    appUrl: string;
    dictionary: Dictionary;
    canEdit: boolean;
    canView: boolean;
}

export function MenuAccessWidget({ config, appUrl, dictionary, canEdit, canView }: MenuAccessWidgetProps) {
    const [slug, setSlug] = useState(config?.slug || '');
    const [themeColor, setThemeColor] = useState(config?.themeColor || '#16a34a');
    const [template, setTemplate] = useState<TemplateType>(config?.template as TemplateType || 'neomorphic');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canEdit) return; // Solo permitir submit si puede editar

        const formData = new FormData();
        formData.append('slug', slug);
        formData.append('themeColor', themeColor);
        formData.append('template', template);

        startTransition(async () => {
            try {
                const result = await saveMenuConfig({}, formData);
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            } catch (error: any) {
                toast.error(error.message || 'Error al guardar la configuración');
            }
        });
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(menuUrl);
        toast.success(dictionary.app?.menu?.access?.toast?.linkCopied || "Enlace del menú copiado al portapapeles.");
    };

    const handleDownloadQR = () => {
        if (!qrCodeDataUrl) return;
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `qr-codigo-${slug || 'menu'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(dictionary.app?.menu?.access?.toast?.qrDownloaded || "QR descargado correctamente");
    };

    if (!config) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>{dictionary.app?.menu?.access?.configureRestaurant || 'Primero configura tu restaurante'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{dictionary.app?.menu?.access?.title || 'Acceso de Clientes'}</CardTitle>
                <CardDescription>
                    {dictionary.app?.menu?.access?.description || 'Configura cómo tus clientes accederán al menú digital. Este enlace y QR son los que debes compartir.'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 items-start p-3 sm:p-4 md:p-6">
                    {!canEdit && (
                        <div className="lg:col-span-3 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Modo solo lectura: Puedes ver la configuración pero no modificarla.
                            </p>
                        </div>
                    )}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="slug">{dictionary.app?.menu?.access?.customLink || 'Enlace Personalizado (URL)'}</Label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                                <span className="flex-shrink-0 text-xs sm:text-sm text-muted-foreground p-2 bg-muted rounded-t-md sm:rounded-l-md sm:rounded-t-none border border-b-0 sm:border-b sm:border-r-0">
                                    {`${appUrl}/es/menu/`}
                                </span>
                                <Input
                                    id="slug"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder={dictionary.app?.menu?.access?.slugPlaceholder || 'tu-restaurante'}
                                    className="rounded-t-none sm:rounded-l-none min-w-0"
                                    required
                                    disabled={!canEdit}
                                    readOnly={!canEdit}
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={handleCopyToClipboard} className="w-full">
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{dictionary.app?.menu?.access?.copyLink?.desktop || 'Copiar Enlace'}</span>
                                    <span className="sm:hidden">{dictionary.app?.menu?.access?.copyLink?.mobile || 'Copiar'}</span>
                                </Button>
                                <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                                    <Button type="button" variant="outline" className="w-full">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">{dictionary.app?.menu?.access?.preview?.desktop || 'Vista previa'}</span>
                                        <span className="sm:hidden">{dictionary.app?.menu?.access?.preview?.mobile || 'Vista'}</span>
                                    </Button>
                                </a>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="themeColor">{dictionary.app?.menu?.access?.themeColor || 'Color Principal del Sitio'}</Label>
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
                                        disabled={!canEdit}
                                    />
                                    <Input
                                        type="text"
                                        value={themeColor}
                                        onChange={(e) => setThemeColor(e.target.value)}
                                        placeholder="#16a34a"
                                        className="w-full sm:w-28"
                                        required
                                        disabled={!canEdit}
                                        readOnly={!canEdit}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{dictionary.app?.menu?.access?.themeColorNote || 'Este será el color predominante en la página que ven tus clientes.'}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Template del Menú</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {AVAILABLE_TEMPLATES.map((templateOption) => (
                                    <button
                                        key={templateOption.id}
                                        type="button"
                                        onClick={() => setTemplate(templateOption.id)}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${template === templateOption.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        disabled={!canEdit}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">
                                                {templateOption.id === 'neomorphic' ? '🎨' :
                                                    templateOption.id === 'retro-vintage' ? '🕰️' :
                                                        templateOption.id === 'luxury-premium' ? '👑' :
                                                            templateOption.id === 'playful-fun' ? '🎉' :
                                                                templateOption.id === 'zen-minimal' ? '🧘' :
                                                                    templateOption.id === 'artistic-creative' ? '🎭' : '🎨'}
                                            </span>
                                            <span className="font-medium text-sm">{templateOption.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{templateOption.description}</p>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">Elige el diseño visual de tu menú digital.</p>
                        </div>
                        {canEdit && (
                            <Button type="submit" disabled={isPending} className="w-full">
                                {isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">
                                    {isPending ? (dictionary.app?.menu?.access?.saving || 'Guardando...') : (dictionary.app?.menu?.access?.save || 'Guardar Configuración')}
                                </span>
                                <span className="sm:hidden">
                                    {isPending ? (dictionary.app?.menu?.access?.saving || 'Guardando...') : (dictionary.app?.menu?.access?.saveMobile || 'Guardar')}
                                </span>
                            </Button>
                        )}
                    </div>
                    <div className="lg:col-span-1 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg">
                        <Label className="text-sm sm:text-base">{dictionary.app?.menu?.access?.qrCode || 'Código QR del Menú'}</Label>
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
                                <span className="hidden sm:inline">{dictionary.app?.menu?.access?.downloadQR?.desktop || 'Descargar QR'}</span>
                                <span className="sm:hidden">{dictionary.app?.menu?.access?.downloadQR?.mobile || 'Descargar'}</span>
                            </Button>
                        )}
                        <p className="text-xs text-muted-foreground">{dictionary.app?.menu?.access?.qrNote || 'Tus clientes pueden escanear este código para ver el menú.'}</p>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
} 