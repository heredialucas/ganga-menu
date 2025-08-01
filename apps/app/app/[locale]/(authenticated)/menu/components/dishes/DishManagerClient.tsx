'use client';

import { useState, useTransition, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@repo/design-system/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/design-system/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, UtensilsCrossed, ImageIcon, Trash2 } from 'lucide-react';
import type { Dish, Category } from '@repo/database';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import Image from 'next/image';
import { createDish, updateDish, deleteDish } from '@repo/data-services/src/services/dishService';
import { uploadR2Image } from '@repo/data-services/src/services/uploadR2Image';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getRestaurantOwner } from '@repo/data-services/src/services/restaurantConfigService';
import type { Dictionary } from '@repo/internationalization';

interface DishWithCategory extends Dish {
    category: Category | null;
}

interface DishManagerClientProps {
    dishes: DishWithCategory[];
    categories: Category[];
    dictionary: Dictionary;
    canEdit: boolean;
    canView: boolean;
}

export function DishManagerClient({ dishes, categories, dictionary, canEdit, canView }: DishManagerClientProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDish, setEditingDish] = useState<DishWithCategory | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; dish: DishWithCategory | null }>({ open: false, dish: null });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenDialog = (dish: DishWithCategory | null) => {
        if (!canEdit) return;
        setEditingDish(dish);
        setPreviewImage(dish?.imageUrl || null);
        setIsDialogOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canEdit) return;

        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get('name') as string;

        const promise = async () => {
            const imageFile = formData.get('image') as File;

            const dishData: any = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                promotionalPrice: formData.get('promotionalPrice') ? parseFloat(formData.get('promotionalPrice') as string) : null,
                categoryId: formData.get('categoryId') as string,
                imageUrl: editingDish?.imageUrl || undefined,
            };

            if (imageFile && imageFile.size > 0) {
                dishData.imageFile = imageFile;
            }

            if (editingDish) {
                await updateDish(editingDish.id, dishData);
            } else {
                const user = await getCurrentUser();
                if (!user) throw new Error(dictionary.app?.menu?.dishes?.toast?.notAuthenticated || "Usuario no autenticado");

                const restaurantOwnerId = await getRestaurantOwner(user.id);
                if (!restaurantOwnerId) {
                    throw new Error("No se pudo determinar el dueño del restaurante");
                }

                await createDish(dishData, restaurantOwnerId);
            }
        };

        startTransition(async () => {
            toast.promise(promise(), {
                loading: dictionary.app?.menu?.dishes?.toast?.saving || 'Guardando plato...',
                success: (data) => {
                    setIsDialogOpen(false);
                    return editingDish ? (dictionary.app?.menu?.dishes?.toast?.updated || 'Plato actualizado correctamente.') : (dictionary.app?.menu?.dishes?.toast?.created || 'Plato creado correctamente.');
                },
                error: (err) => err.message,
            });
        });
    };

    const handleDelete = (dish: DishWithCategory) => {
        if (!canEdit) return;

        startTransition(async () => {
            toast.promise(deleteDish(dish.id), {
                loading: dictionary.app?.menu?.dishes?.toast?.deleting || 'Eliminando plato...',
                success: () => {
                    setDeleteDialog({ open: false, dish: null });
                    return dictionary.app?.menu?.dishes?.toast?.deleted || 'Plato eliminado correctamente.';
                },
                error: (err) => err.message,
            });
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 text-center sm:text-left">
                            <CardTitle className="flex items-center gap-2 justify-center sm:justify-start">
                                <UtensilsCrossed className="h-5 w-5" />
                                <span className="text-lg sm:text-xl">
                                    {canEdit
                                        ? (dictionary.app?.menu?.dishes?.title || 'Platos')
                                        : (dictionary.app?.menu?.dishes?.title || 'Platos') + ' (Solo Lectura)'
                                    }
                                </span>
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                {canEdit
                                    ? (dictionary.app?.menu?.dishes?.description || 'Crea y gestiona los platos de tu menú.')
                                    : (dictionary.app?.menu?.dishes?.description || 'Crea y gestiona los platos de tu menú.') + ` (${dictionary.app?.menu?.dishes?.readOnlyMode || 'Modo solo lectura'})`
                                }
                            </CardDescription>
                        </div>
                        {canEdit && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                                        <Plus className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">{dictionary.app?.menu?.dishes?.newDish?.desktop || 'Nuevo Plato'}</span>
                                        <span className="sm:hidden">{dictionary.app?.menu?.dishes?.newDish?.mobile || 'Nuevo'}</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] sm:max-w-md lg:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg sm:text-xl">{editingDish ? (dictionary.app?.menu?.dishes?.editDish || 'Editar Plato') : (dictionary.app?.menu?.dishes?.createDish || 'Crear Plato')}</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="image-upload">{dictionary.app?.menu?.dishes?.image || 'Imagen'}</Label>
                                            <Input id="image" name="image" type="file" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                                            <div
                                                className="w-full h-32 bg-gray-100 dark:bg-zinc-800 rounded-md flex flex-col items-center justify-center border-2 border-dashed cursor-pointer"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                {previewImage ? (
                                                    <Image src={previewImage} alt="Vista previa" width={128} height={128} className="h-full w-full rounded-md object-cover" />
                                                ) : (
                                                    <div className="text-center text-muted-foreground">
                                                        <ImageIcon className="h-8 w-8 mx-auto" />
                                                        <p className="text-sm mt-1">{dictionary.app?.menu?.dishes?.imagePlaceholder || 'Haz clic para subir una imagen'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="name">{dictionary.app?.menu?.dishes?.name || 'Nombre'}</Label>
                                            <Input id="name" name="name" defaultValue={editingDish?.name} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">{dictionary.app?.menu?.dishes?.description || 'Descripción'}</Label>
                                            <Textarea id="description" name="description" defaultValue={editingDish?.description || ''} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="price">{dictionary.app?.menu?.dishes?.price || 'Precio'}</Label>
                                                <Input id="price" name="price" type="number" step="0.01" defaultValue={editingDish?.price} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="promotionalPrice">{dictionary.app?.menu?.dishes?.promotionalPrice || 'Precio Promocional'}</Label>
                                                <Input id="promotionalPrice" name="promotionalPrice" type="number" step="0.01" defaultValue={editingDish?.promotionalPrice || ''} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="categoryId">{dictionary.app?.menu?.dishes?.category || 'Categoría'}</Label>
                                            <Select name="categoryId" defaultValue={editingDish?.categoryId || ''}>
                                                <SelectTrigger><SelectValue placeholder={dictionary.app?.menu?.dishes?.categoryPlaceholder || 'Selecciona una categoría'} /></SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>{dictionary.app?.menu?.dishes?.cancel || 'Cancelar'}</Button>
                                            <Button type="submit" disabled={isPending}>{isPending ? (dictionary.app?.menu?.dishes?.saving || 'Guardando...') : (dictionary.app?.menu?.dishes?.save || 'Guardar')}</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-3 md:p-6">
                    <ScrollArea className="h-[60vh] sm:h-[70vh] lg:h-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            {dishes.map((dish) => (
                                <Card key={dish.id} className="overflow-hidden flex flex-col relative">
                                    {canEdit && (
                                        <div className="absolute top-2 right-2 z-10 transition-opacity">
                                            <Button variant="destructive" size="icon" onClick={() => setDeleteDialog({ open: true, dish })}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="relative h-24 sm:h-32 w-full">
                                        {dish.imageUrl ? (
                                            <Image src={dish.imageUrl} alt={dish.name} layout="fill" className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-2 sm:p-3 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">{dish.category?.name || (dictionary.app?.menu?.dishes?.noCategory || 'Sin categoría')}</p>
                                            <h3 className="font-semibold text-sm sm:text-base leading-tight truncate">{dish.name}</h3>
                                            <p className="text-xs text-muted-foreground h-10 sm:h-12 overflow-hidden my-1">{dish.description}</p>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-bold text-base sm:text-lg">${dish.price.toFixed(2)}</p>
                                        </div>
                                        {canEdit && (
                                            <Button variant="outline" size="sm" className="w-full mt-2 sm:mt-3" onClick={() => handleOpenDialog(dish)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">{dictionary.app?.menu?.dishes?.edit?.desktop || 'Editar'}</span>
                                                <span className="sm:hidden">{dictionary.app?.menu?.dishes?.edit?.mobile || 'Editar'}</span>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, dish: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dictionary.app?.menu?.dishes?.deleteConfirmation || '¿Estás seguro?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dictionary.app?.menu?.dishes?.deleteDescription || 'Esta acción no se puede deshacer. Se eliminará permanentemente el plato'} "{deleteDialog.dish?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{dictionary.app?.menu?.dishes?.cancel || 'Cancelar'}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(deleteDialog.dish!)} disabled={isPending}>
                            {isPending ? (dictionary.app?.menu?.dishes?.deleting || 'Eliminando...') : (dictionary.app?.menu?.dishes?.delete || 'Eliminar')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 