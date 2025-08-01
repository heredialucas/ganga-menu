'use client';

import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@repo/design-system/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteOrderDialogClientProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    orderId: string;
    orderInfo: string;
    isLoading?: boolean;
    dictionary?: any;
}

export function DeleteOrderDialogClient({
    isOpen,
    onClose,
    onConfirm,
    orderId,
    orderInfo,
    isLoading = false,
    dictionary
}: DeleteOrderDialogClientProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        {dictionary?.web?.orders?.deleteDialog?.title || 'Eliminar Orden'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {dictionary?.web?.orders?.deleteDialog?.description || '¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.'}
                        <br />
                        <br />
                        <strong>{dictionary?.web?.orders?.deleteDialog?.order || 'Orden'}:</strong> #{orderId.slice(-8)}
                        <br />
                        <strong>{dictionary?.web?.orders?.deleteDialog?.details || 'Detalles'}:</strong> {orderInfo}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        {dictionary?.web?.orders?.deleteDialog?.cancel || 'Cancelar'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                {dictionary?.web?.orders?.deleteDialog?.deleting || 'Eliminando...'}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                {dictionary?.web?.orders?.deleteDialog?.delete || 'Eliminar'}
                            </div>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 