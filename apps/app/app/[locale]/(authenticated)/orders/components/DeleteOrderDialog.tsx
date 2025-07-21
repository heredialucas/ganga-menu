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

interface DeleteOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    orderId: string;
    orderInfo: string;
    isLoading?: boolean;
}

export function DeleteOrderDialog({
    isOpen,
    onClose,
    onConfirm,
    orderId,
    orderInfo,
    isLoading = false
}: DeleteOrderDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Eliminar Orden
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.
                        <br />
                        <br />
                        <strong>Orden:</strong> #{orderId.slice(-8)}
                        <br />
                        <strong>Detalles:</strong> {orderInfo}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Eliminando...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </div>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 