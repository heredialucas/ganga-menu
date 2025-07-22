'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { OrderData } from '@repo/data-services';
import { deleteOrderAction } from '../actions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@repo/design-system/components/ui/table';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/design-system/components/ui/select';
import {
    Clock,
    ChefHat,
    CheckCircle,
    Truck,
    XCircle,
    Trash2,
    Loader2
} from 'lucide-react';
import { DeleteOrderDialog } from './DeleteOrderDialog';
import { toast } from 'sonner';

type OrderStatus = 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID';

interface OrdersTableProps {
    orders: OrderData[];
    onStatusUpdate: (orderId: string, status: OrderStatus) => void;
    onDeleteOrder?: (orderId: string) => void;
    dictionary: Dictionary;
    updatingOrderId?: string | null;
    deletingOrderId?: string | null;
}

const statusConfig = {
    ACTIVE: {
        label: 'Activa',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800',
    },
    READY: {
        label: 'Lista/Entregada',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
    },
    CANCELLED: {
        label: 'Cancelada',
        icon: XCircle,
        color: 'bg-red-100 text-red-800',
    },
    PAID: {
        label: 'Pagada',
        icon: CheckCircle,
        color: 'bg-blue-100 text-blue-800',
    },
};

export function OrdersTable({ orders, onStatusUpdate, onDeleteOrder, dictionary, updatingOrderId, deletingOrderId }: OrdersTableProps) {
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        orderId: string;
        orderInfo: string;
    }>({
        isOpen: false,
        orderId: '',
        orderInfo: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const getStatusIcon = (status: OrderStatus) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return <Icon className="h-4 w-4" />;
    };

    const handleDeleteClick = (order: OrderData) => {
        const orderInfo = `${order.items.length} items - ${formatPrice(order.total)}`;
        setDeleteDialog({
            isOpen: true,
            orderId: order.id,
            orderInfo
        });
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            // Primero eliminar de la base de datos
            const result = await deleteOrderAction(deleteDialog.orderId);

            if (result.success) {
                // Si se eliminó de la BD, emitir evento WebSocket para tiempo real
                if (onDeleteOrder) {
                    onDeleteOrder(deleteDialog.orderId);
                }
                toast.success("Orden eliminada exitosamente");
            } else {
                toast.error(result.error || "Error al eliminar la orden");
            }

            setDeleteDialog({ isOpen: false, orderId: '', orderInfo: '' });
        } catch (error) {
            toast.error("Error inesperado al eliminar la orden");
        } finally {
            setIsDeleting(false);
        }
    };

    if (orders.length === 0) {
        return (
            <>
                <Card>
                    <CardContent className="flex items-center justify-center h-24 sm:h-32 p-3 sm:p-6">
                        <p className="text-sm sm:text-base text-muted-foreground">No hay órdenes para mostrar</p>
                    </CardContent>
                </Card>

                {/* Diálogo de confirmación de eliminación */}
                <DeleteOrderDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, orderId: '', orderInfo: '' })}
                    onConfirm={handleDeleteConfirm}
                    orderId={deleteDialog.orderId}
                    orderInfo={deleteDialog.orderInfo}
                    isLoading={isDeleting}
                />
            </>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Órdenes ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs sm:text-sm">ID</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Cliente</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Items</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Total</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Estado</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Fecha</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs sm:text-sm">
                                            #{order.id.slice(-6)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-xs sm:text-sm">
                                                    {order.waiterName || 'Cliente'}
                                                </div>
                                                {order.table && (
                                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                                        Mesa: {order.table.label}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="space-y-1">
                                                {order.items?.map((item, index) => (
                                                    <div key={index} className="text-xs sm:text-sm">
                                                        {item.quantity}x {item.dish?.name || 'Plato no disponible'}
                                                        {item.notes && (
                                                            <span className="text-muted-foreground ml-1">
                                                                ({item.notes})
                                                            </span>
                                                        )}
                                                    </div>
                                                )) || (
                                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                                            Sin items
                                                        </div>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-xs sm:text-sm">
                                            {order.total ? formatPrice(order.total) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={`text-xs sm:text-sm ${statusConfig[order.status as OrderStatus].color}`}
                                            >
                                                {getStatusIcon(order.status as OrderStatus)}
                                                <span className="ml-1">
                                                    {statusConfig[order.status as OrderStatus].label}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                                            {order.createdAt ? formatDate(new Date(order.createdAt).toISOString()) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value: OrderStatus) =>
                                                        onStatusUpdate(order.id, value)
                                                    }
                                                    disabled={updatingOrderId === order.id}
                                                >
                                                    <SelectTrigger className="w-20 sm:w-32 text-xs sm:text-sm">
                                                        {updatingOrderId === order.id ? (
                                                            <div className="flex items-center gap-1 sm:gap-2">
                                                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                                <span className="hidden sm:inline">Actualizando...</span>
                                                                <span className="sm:hidden">...</span>
                                                            </div>
                                                        ) : (
                                                            <SelectValue />
                                                        )}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(statusConfig).map(([status, config]) => (
                                                            <SelectItem key={status} value={status}>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusIcon(status as OrderStatus)}
                                                                    {config.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(order)}
                                                    disabled={deletingOrderId === order.id}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    {deletingOrderId === order.id ? (
                                                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Diálogo de confirmación de eliminación */}
            <DeleteOrderDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, orderId: '', orderInfo: '' })}
                onConfirm={handleDeleteConfirm}
                orderId={deleteDialog.orderId}
                orderInfo={deleteDialog.orderInfo}
                isLoading={isDeleting}
            />
        </>
    );
} 