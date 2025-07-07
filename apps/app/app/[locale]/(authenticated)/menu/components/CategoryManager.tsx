'use client';

import { useTransition, useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import type { Category } from '@repo/database';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/design-system/components/ui/alert-dialog';
import { createCategory, deleteCategory } from '@repo/data-services/src/services/categoryService';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/design-system/components/ui/table';

interface CategoryManagerProps {
    categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get('name') as string;

        startTransition(async () => {
            try {
                const user = await getCurrentUser();
                if (!user) throw new Error("Usuario no autenticado.");

                await createCategory({ name }, user.id);
                toast({ title: "Éxito", description: "Categoría creada." });
                form.reset();
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        });
    };

    const handleDelete = (category: Category) => {
        startTransition(async () => {
            try {
                await deleteCategory(category.id);
                toast({ title: "Éxito", description: "Categoría eliminada." });
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
            setDeleteDialog({ open: false, category: null });
        });
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                <div className="space-y-3">
                    <h4 className="font-semibold">Nueva Categoría</h4>
                    <form onSubmit={handleSubmit} className="flex items-start gap-2">
                        <Input name="name" placeholder="Nombre de la categoría" required className="flex-1" />
                        <Button type="submit" disabled={isPending}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar
                        </Button>
                    </form>
                </div>
                <div className="space-y-3">
                    <h4 className="font-semibold">Categorías Existentes</h4>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map(cat => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, category: cat })}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, category: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la categoría "{deleteDialog.category?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(deleteDialog.category!)} disabled={isPending}>
                            {isPending ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 