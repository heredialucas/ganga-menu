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
import { Copy, Share2, ExternalLink } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { useRestaurantConfig } from '@/store/restaurant-config-context';

interface ShareLinksWidgetProps {
    dictionary: Dictionary;
}

export function ShareLinksWidget({ dictionary }: ShareLinksWidgetProps) {
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    {dictionary.app.share.links_button}
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
                    {Object.entries(links).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <Label htmlFor={`link-${key}`} className="capitalize">
                                {dictionary.app.share[key as keyof typeof dictionary.app.share] || key}
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input id={`link-${key}`} value={value} readOnly />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleCopyToClipboard(value, key)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <a href={value} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="icon">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
} 