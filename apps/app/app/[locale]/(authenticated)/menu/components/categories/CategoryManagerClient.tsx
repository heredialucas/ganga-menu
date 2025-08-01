'use client';

import { useTransition, useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import type { Category } from '@repo/database';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/design-system/components/ui/alert-dialog';
import { createCategory, deleteCategory } from '@repo/data-services/src/services/categoryService';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/design-system/components/ui/table';
import type { Dictionary } from '@repo/internationalization';

interface CategoryManagerClientProps {
    categories: Category[];
    dictionary: Dictionary;
    canEdit?: boolean;
    canView?: boolean;
}

export function CategoryManagerClient({ categories, dictionary, canEdit = true, canView = true }: CategoryManagerClientProps) {
    const [isPending, startTransition] = useTransition();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canEdit) {
            toast.error(dictionary.app?.menu?.categories?.noPermission || 'No tienes permisos para crear categorías');
            return;
        }

        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get('name') as string;

        startTransition(async () => {
            try {
                const user = await getCurrentUser();

                if (!user) throw new Error(dictionary.app?.menu?.categories?.toast?.notAuthenticated || "Usuario no autenticado.");

                await createCategory({ name }, user.id);

                toast.success(dictionary.app?.menu?.categories?.toast?.success || "Categoría creada.");
                form.reset();
            } catch (error: any) {
                toast.error(error.message);
            }
        });
    };

    const handleDelete = (category: Category) => {
        if (!canEdit) {
            toast.error(dictionary.app?.menu?.categories?.noPermission || 'No tienes permisos para eliminar categorías');
            return;
        }

        startTransition(async () => {
            try {
                await deleteCategory(category.id);
                toast.success(dictionary.app?.menu?.categories?.toast?.deleteSuccess || "Categoría eliminada.");
            } catch (error: any) {
                toast.error(error.message);
            }
            setDeleteDialog({ open: false, category: null });
        });
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 p-1 sm:p-2">
                {canEdit && (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-base sm:text-lg">{dictionary.app?.menu?.categories?.newCategory || 'Nueva Categoría'}</h4>
                        <form onSubmit={handleSubmit} className="flex items-stretch gap-2">
                            <Input name="name" placeholder={dictionary.app?.menu?.categories?.namePlaceholder || 'Nombre de la categoría'} required className="flex-1" />
                            <Button type="submit" disabled={isPending} className="px-3">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">{dictionary.app?.menu?.categories?.add?.desktop || 'Agregar'}</span>
                            </Button>
                        </form>
                    </div>
                )}
                <div className="space-y-3">
                    <h4 className="font-semibold text-base sm:text-lg">{dictionary.app?.menu?.categories?.existingCategories || 'Categorías Existentes'}</h4>
                    <div className="border rounded-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableBody>
                                    {categories.map(cat => (
                                        <TableRow key={cat.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-sm sm:text-base flex items-center justify-between">
                                                <span>{cat.name}</span>
                                                {canEdit && (
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, category: cat })}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, category: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dictionary.app?.menu?.categories?.deleteConfirmation || '¿Estás seguro?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dictionary.app?.menu?.categories?.deleteDescription || 'Esta acción no se puede deshacer. Se eliminará la categoría'} "{deleteDialog.category?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{dictionary.app?.menu?.categories?.cancel || 'Cancelar'}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(deleteDialog.category!)} disabled={isPending}>
                            {isPending ? (dictionary.app?.menu?.categories?.deleting || 'Eliminando...') : (dictionary.app?.menu?.categories?.delete || 'Eliminar')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 