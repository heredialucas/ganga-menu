'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@repo/design-system/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Copy, Share2, ExternalLink, Lock } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { useRestaurantConfig } from '@/store/restaurant-config-context';

interface ShareLinksWidgetClientProps {
    dictionary: Dictionary;
    canViewPremiumLinks: boolean;
}

export function ShareLinksWidgetClient({ dictionary, canViewPremiumLinks }: ShareLinksWidgetClientProps) {
    const [isOpen, setIsOpen] = useState(false);
    const params = useParams();
    const locale = params.locale || 'es';
    const restaurantConfig = useRestaurantConfig();
    const slug = restaurantConfig?.slug;

    if (!slug) {
        return null;
    }

    const baseUrl =
        typeof window !== 'undefined'
            ? `${window.location.protocol}//${window.location.host}`
            : '';

    const links = {
        menu: `${baseUrl}/${locale}/menu/${slug}`,
        kitchen: `${baseUrl}/${locale}/kitchen/${slug}`,
        waiter: `${baseUrl}/${locale}/waiter/${slug}`,
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado al portapapeles.`);
    };

    const handlePremiumLinkClick = () => {
        toast.error(dictionary.app?.share?.premiumRequired || 'Esta función requiere una cuenta premium');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Share2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{dictionary.app.share.links_button}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{dictionary.app.share.title}</DialogTitle>
                    <DialogDescription>
                        {dictionary.app.share.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    {/* Enlace del Menú - Siempre visible */}
                    <div className="space-y-2">
                        <Label htmlFor="link-menu" className="capitalize">
                            {dictionary.app.share.menu || 'Menú'}
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input id="link-menu" value={links.menu} readOnly />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopyToClipboard(links.menu, 'Menú')}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                            <a href={links.menu} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="icon">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Enlaces Premium - Solo visibles para usuarios premium/admin */}
                    {canViewPremiumLinks ? (
                        <>
                            {/* Enlace de Cocina */}
                            <div className="space-y-2">
                                <Label htmlFor="link-kitchen" className="capitalize">
                                    {dictionary.app.share.kitchen || 'Cocina'}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input id="link-kitchen" value={links.kitchen} readOnly />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleCopyToClipboard(links.kitchen, 'Cocina')}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <a href={links.kitchen} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="icon">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </a>
                                </div>
                            </div>

                            {/* Enlace de Mozos */}
                            <div className="space-y-2">
                                <Label htmlFor="link-waiter" className="capitalize">
                                    {dictionary.app.share.waiter || 'Mozos'}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input id="link-waiter" value={links.waiter} readOnly />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleCopyToClipboard(links.waiter, 'Mozos')}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <a href={links.waiter} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="icon">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Enlaces Premium Bloqueados */}
                            <div className="space-y-2">
                                <Label className="capitalize flex items-center gap-2">
                                    {dictionary.app.share.kitchen || 'Cocina'}
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input value="🔒 Función Premium" readOnly className="bg-muted" />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePremiumLinkClick}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePremiumLinkClick}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="capitalize flex items-center gap-2">
                                    {dictionary.app.share.waiter || 'Mozos'}
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input value="🔒 Función Premium" readOnly className="bg-muted" />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePremiumLinkClick}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePremiumLinkClick}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 