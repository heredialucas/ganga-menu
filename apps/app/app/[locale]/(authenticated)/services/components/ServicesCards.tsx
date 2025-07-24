'use client';

import { useState, useTransition, useEffect } from 'react';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { ChefHat, UtensilsCrossed, Copy, ExternalLink, Save, QrCode, Download } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { toast } from 'sonner';
import { toDataURL } from 'qrcode';
import { updateWaiterCode, updateKitchenCode } from '../actions';

interface ServicesCardsProps {
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
    canView: boolean;
    canEdit: boolean;
}

interface ShareableLinkProps {
    link: string;
    linkName: string;
    onCopy: () => void;
}

const ShareableLink = ({ link, linkName, onCopy, dictionary, canView }: ShareableLinkProps & { dictionary: Dictionary, canView: boolean }) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

    useEffect(() => {
        toDataURL(link, { errorCorrectionLevel: 'H', width: 256, margin: 2 }, (err, dataUrl) => {
            if (err) {
                console.error("QR Code Generation Error:", err);
                return;
            }
            setQrCodeDataUrl(dataUrl);
        });
    }, [link]);

    const handleDownloadQR = () => {
        if (!qrCodeDataUrl) return;
        const a = document.createElement('a');
        a.href = qrCodeDataUrl;
        a.download = `qr-code-${linkName.toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
                <div className="flex-grow p-2 bg-muted rounded-md font-mono text-xs sm:text-sm text-muted-foreground truncate">
                    {link}
                </div>
                {canView && (
                    <Button variant="outline" size="icon" onClick={onCopy} className="flex-shrink-0">
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
            </div>
            {qrCodeDataUrl && (
                <div className="p-2 sm:p-4 bg-white rounded-lg border flex flex-col items-center gap-2 sm:gap-4">
                    <img src={qrCodeDataUrl} alt={`QR Code for ${linkName}`} className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48" />
                </div>
            )}
            <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                {qrCodeDataUrl && (
                    <Button variant="outline" onClick={handleDownloadQR} className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{dictionary.web?.services?.shared?.downloadQR || 'Descargar QR'}</span>
                        <span className="sm:hidden">{dictionary.web?.services?.shared?.downloadQRShort || 'Descargar'}</span>
                    </Button>
                )}
                <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="secondary" className="w-full">
                        <span className="hidden sm:inline">{dictionary.web?.services?.shared?.open || 'Abrir'}</span>
                        <span className="sm:hidden">{dictionary.web?.services?.shared?.openShort || 'Abrir'}</span>
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </a>
            </div>
        </div>
    );
};


export function ServicesCards({ restaurantConfig, dictionary, locale, canView, canEdit }: ServicesCardsProps) {
    const [isPending, startTransition] = useTransition();
    const [waiterCode, setWaiterCode] = useState(restaurantConfig.waiterCode);
    const [kitchenCode, setKitchenCode] = useState(restaurantConfig.kitchenCode || '5678');

    const kitchenLink = `${window.location.origin}/${locale}/kitchen/${restaurantConfig.slug}`;
    const waiterLink = `${window.location.origin}/${locale}/waiter/${restaurantConfig.slug}`;

    const handleCopyToClipboard = (link: string, name: string) => {
        navigator.clipboard.writeText(link);
        toast.success(dictionary.web?.services?.shared?.copySuccess?.replace('{name}', name) || `Enlace para ${name} copiado al portapapeles.`);
    };

    const handleUpdateWaiterCode = () => {
        if (!canEdit) return; // No permitir actualizar si no puede editar

        startTransition(async () => {
            const promise = async () => {
                const formData = new FormData();
                formData.append('code', waiterCode);
                const result = await updateWaiterCode(formData);
                if (!result.success) {
                    throw new Error(result.message);
                }
                return result;
            };

            toast.promise(promise(), {
                loading: dictionary.web?.services?.shared?.savingCode || 'Guardando nuevo código...',
                success: (result) => `${result.message || dictionary.web?.services?.shared?.codeSaved || 'Código actualizado exitosamente'}`,
                error: (err) => `${dictionary.web?.services?.shared?.codeError || 'Error al actualizar el código'}: ${err.message}`,
            });
        });
    };

    const handleUpdateKitchenCode = () => {
        if (!canEdit) return; // No permitir actualizar si no puede editar

        startTransition(async () => {
            const promise = async () => {
                const formData = new FormData();
                formData.append('code', kitchenCode);
                const result = await updateKitchenCode(formData);
                if (!result.success) {
                    throw new Error(result.message);
                }
                return result;
            };

            toast.promise(promise(), {
                loading: dictionary.web?.services?.shared?.savingCode || 'Guardando nuevo código...',
                success: (result) => `${result.message || dictionary.web?.services?.shared?.codeSaved || 'Código actualizado exitosamente'}`,
                error: (err) => `${dictionary.web?.services?.shared?.codeError || 'Error al actualizar el código'}: ${err.message}`,
            });
        });
    };

    return (
        <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2">
            {/* Card para Mozos */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                        <div className="text-center sm:text-left">
                            <CardTitle className="text-lg sm:text-xl">
                                {canEdit
                                    ? (dictionary.web?.services?.waiter?.title || 'Gestión de Mozos')
                                    : (dictionary.web?.services?.waiter?.title || 'Gestión de Mozos') + ' (Solo Lectura)'
                                }
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                {canEdit
                                    ? (dictionary.web?.services?.waiter?.description || 'Modifica el código de acceso y comparte el enlace.')
                                    : (dictionary.web?.services?.waiter?.description || 'Modifica el código de acceso y comparte el enlace.') + ' (Modo solo lectura)'
                                }
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col p-3 sm:p-4 md:p-6">
                    <div>
                        <label className="text-sm sm:text-base font-medium">{dictionary.web?.services?.waiter?.accessCode || 'Código de Acceso para Mozos'}</label>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            {dictionary.web?.services?.waiter?.accessCodeDescription || 'Este es el código que los mozos usarán para acceder.'}
                        </p>
                        <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                            <Input
                                type="text"
                                placeholder={dictionary.web?.services?.waiter?.placeholder || '4+ dígitos'}
                                value={waiterCode}
                                onChange={(e) => setWaiterCode(e.target.value)}
                                className="flex-grow"
                                disabled={!canEdit}
                            />
                            {canEdit && (
                                <Button type="button" onClick={handleUpdateWaiterCode} disabled={isPending} className="flex-shrink-0">
                                    <Save className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{isPending ? (dictionary.web?.services?.waiter?.saving || 'Guardando...') : (dictionary.web?.services?.waiter?.save || 'Guardar')}</span>
                                    <span className="sm:hidden">{isPending ? (dictionary.web?.services?.waiter?.savingShort || '...') : (dictionary.web?.services?.waiter?.saveShort || 'OK')}</span>
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="mt-auto pt-6 sm:pt-8">
                        <label className="text-sm font-medium">{dictionary.web?.services?.waiter?.accessLink || 'Enlace de Acceso para Mozos'}</label>
                        <ShareableLink
                            link={waiterLink}
                            linkName="Mozos"
                            onCopy={() => handleCopyToClipboard(waiterLink, 'Mozos')}
                            dictionary={dictionary}
                            canView={canView}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        {dictionary.web?.services?.waiter?.footer || 'Recuerda guardar los cambios del código antes de compartir el enlace.'}
                    </p>
                </CardFooter>
            </Card>

            {/* Card para Cocina */}
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
                        <div className="text-center sm:text-left">
                            <CardTitle className="text-lg sm:text-xl">
                                {canEdit
                                    ? (dictionary.web?.services?.kitchen?.title || 'Gestión de Cocina')
                                    : (dictionary.web?.services?.kitchen?.title || 'Gestión de Cocina') + ' (Solo Lectura)'
                                }
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                {canEdit
                                    ? (dictionary.web?.services?.kitchen?.description || 'Modifica el código de acceso y comparte el enlace.')
                                    : (dictionary.web?.services?.kitchen?.description || 'Modifica el código de acceso y comparte el enlace.') + ' (Modo solo lectura)'
                                }
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col p-3 sm:p-4 md:p-6">
                    <div>
                        <label className="text-sm sm:text-base font-medium">{dictionary.web?.services?.kitchen?.accessCode || 'Código de Acceso para Cocina'}</label>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            {dictionary.web?.services?.kitchen?.accessCodeDescription || 'Este es el código que la cocina usará para acceder.'}
                        </p>
                        <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2">
                            <Input
                                type="text"
                                placeholder={dictionary.web?.services?.kitchen?.placeholder || '4+ dígitos'}
                                value={kitchenCode}
                                onChange={(e) => setKitchenCode(e.target.value)}
                                className="flex-grow"
                                disabled={!canEdit}
                            />
                            {canEdit && (
                                <Button type="button" onClick={handleUpdateKitchenCode} disabled={isPending} className="flex-shrink-0">
                                    <Save className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">{isPending ? (dictionary.web?.services?.kitchen?.saving || 'Guardando...') : (dictionary.web?.services?.kitchen?.save || 'Guardar')}</span>
                                    <span className="sm:hidden">{isPending ? (dictionary.web?.services?.kitchen?.savingShort || '...') : (dictionary.web?.services?.kitchen?.saveShort || 'OK')}</span>
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="mt-auto pt-4 sm:pt-6">
                        <label className="text-sm sm:text-base font-medium">{dictionary.web?.services?.kitchen?.accessLink || 'Enlace de Acceso para Cocina'}</label>
                        <ShareableLink
                            link={kitchenLink}
                            linkName="Cocina"
                            onCopy={() => handleCopyToClipboard(kitchenLink, 'Cocina')}
                            dictionary={dictionary}
                            canView={canView}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        {dictionary.web?.services?.kitchen?.footer || 'El acceso a la cocina es directo y no requiere código.'}
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
} 