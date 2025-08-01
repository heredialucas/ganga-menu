'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { OrderData } from '@repo/data-services';
import { deleteOrderAction } from '../../actions';
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
    CheckCircle,
    XCircle,
    Trash2,
    Loader2
} from 'lucide-react';
import { DeleteOrderDialogClient } from '../dialog/DeleteOrderDialogClient';
import { toast } from 'sonner';

type OrderStatus = 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID';

interface OrdersTableClientProps {
    orders: OrderData[];
    onStatusUpdate: (orderId: string, status: OrderStatus) => void;
    onDeleteOrder?: (orderId: string) => void;
    dictionary: Dictionary;
    updatingOrderId?: string | null;
    deletingOrderId?: string | null;
    canView?: boolean;
    canEdit?: boolean;
}

const statusConfig = (dictionary: Dictionary) => ({
    ACTIVE: {
        label: dictionary.web?.orders?.table?.status?.active || 'Activa',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800',
    },
    READY: {
        label: dictionary.web?.orders?.table?.status?.ready || 'Lista/Entregada',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
    },
    CANCELLED: {
        label: dictionary.web?.orders?.table?.status?.cancelled || 'Cancelada',
        icon: XCircle,
        color: 'bg-red-100 text-red-800',
    },
    PAID: {
        label: dictionary.web?.orders?.table?.status?.paid || 'Pagada',
        icon: CheckCircle,
        color: 'bg-blue-100 text-blue-800',
    },
});

export function OrdersTableClient({ orders, onStatusUpdate, onDeleteOrder, dictionary, updatingOrderId, deletingOrderId, canView = true, canEdit = true }: OrdersTableClientProps) {
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
        const config = statusConfig(dictionary)[status];
        const Icon = config.icon;
        return <Icon className="h-4 w-4" />;
    };

    const handleDeleteClick = (order: OrderData) => {
        if (!canEdit) return; // No permitir eliminar si no puede editar
        const orderInfo = `${order.items.length} items - ${formatPrice(order.total)}`;
        setDeleteDialog({
            isOpen: true,
            orderId: order.id,
            orderInfo
        });
    };

    const handleDeleteConfirm = async () => {
        if (!canEdit) return; // No permitir eliminar si no puede editar
        setIsDeleting(true);
        try {
            // Primero eliminar de la base de datos
            const result = await deleteOrderAction(deleteDialog.orderId);

            if (result.success) {
                // Si se eliminó de la BD, emitir evento WebSocket para tiempo real
                if (onDeleteOrder) {
                    onDeleteOrder(deleteDialog.orderId);
                }
                toast.success(dictionary.web?.orders?.toast?.orderDeleted || "Orden eliminada exitosamente");
            } else {
                toast.error(result.error || (dictionary.web?.orders?.toast?.deleteError || "Error al eliminar la orden"));
            }

            setDeleteDialog({ isOpen: false, orderId: '', orderInfo: '' });
        } catch (error) {
            toast.error(dictionary.web?.orders?.toast?.unexpectedError || "Error inesperado al eliminar la orden");
        } finally {
            setIsDeleting(false);
        }
    };

    if (orders.length === 0) {
        return (
            <>
                <Card>
                    <CardContent className="flex items-center justify-center h-24 sm:h-32 p-3 sm:p-6">
                        <p className="text-sm sm:text-base text-muted-foreground">{dictionary.web?.orders?.table?.noOrders || 'No hay órdenes para mostrar'}</p>
                    </CardContent>
                </Card>

                {/* Diálogo de confirmación de eliminación */}
                <DeleteOrderDialogClient
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, orderId: '', orderInfo: '' })}
                    onConfirm={handleDeleteConfirm}
                    orderId={deleteDialog.orderId}
                    orderInfo={deleteDialog.orderInfo}
                    isLoading={isDeleting}
                    dictionary={dictionary}
                />
            </>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">
                        {canEdit
                            ? (dictionary.web?.orders?.table?.title || 'Órdenes')
                            : (dictionary.web?.orders?.table?.title || 'Órdenes') + ' (Solo Lectura)'
                        } ({orders.length})
                    </CardTitle>
                    {!canEdit && (
                        <p className="text-sm text-muted-foreground">
                            Modo solo lectura: Puedes ver las órdenes pero no modificarlas.
                        </p>
                    )}
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs sm:text-sm">{dictionary.web?.orders?.table?.headers?.id || 'ID'}</TableHead>
                                    <TableHead className="text-xs sm:text-sm">{dictionary.web?.orders?.table?.headers?.customer || 'Cliente'}</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{dictionary.web?.orders?.table?.headers?.items || 'Items'}</TableHead>
                                    <TableHead className="text-xs sm:text-sm">{dictionary.web?.orders?.table?.headers?.total || 'Total'}</TableHead>
                                    <TableHead className="text-xs sm:text-sm">{dictionary.web?.orders?.table?.headers?.status || 'Estado'}</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">{dictionary.web?.orders?.table?.headers?.date || 'Fecha'}</TableHead>
                                    <TableHead className="text-xs sm:text-sm">{dictionary.web?.orders?.table?.headers?.actions || 'Acciones'}</TableHead>
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
                                                    {order.waiterName || (dictionary.web?.orders?.table?.customer || 'Cliente')}
                                                </div>
                                                {order.table && (
                                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                                        {dictionary.web?.orders?.table?.table || 'Mesa'}: {order.table.label}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="space-y-1">
                                                {order.items?.map((item, index) => (
                                                    <div key={index} className="text-xs sm:text-sm">
                                                        {item.quantity}x {item.dish?.name || (dictionary.web?.orders?.table?.dishNotAvailable || 'Plato no disponible')}
                                                        {item.notes && (
                                                            <span className="text-muted-foreground ml-1">
                                                                ({item.notes})
                                                            </span>
                                                        )}
                                                    </div>
                                                )) || (
                                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                                            {dictionary.web?.orders?.table?.noItems || 'Sin items'}
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
                                                className={`text-xs sm:text-sm ${statusConfig(dictionary)[order.status as OrderStatus].color}`}
                                            >
                                                {getStatusIcon(order.status as OrderStatus)}
                                                <span className="ml-1">
                                                    {statusConfig(dictionary)[order.status as OrderStatus].label}
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
                                                    disabled={!canEdit || updatingOrderId === order.id}
                                                >
                                                    <SelectTrigger className="w-20 sm:w-32 text-xs sm:text-sm">
                                                        {updatingOrderId === order.id ? (
                                                            <div className="flex items-center gap-1 sm:gap-2">
                                                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                                <span className="hidden sm:inline">{dictionary.web?.orders?.table?.updating || 'Actualizando...'}</span>
                                                                <span className="sm:hidden">{dictionary.web?.orders?.table?.updatingShort || '...'}</span>
                                                            </div>
                                                        ) : (
                                                            <SelectValue />
                                                        )}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(statusConfig(dictionary)).map(([status, config]) => (
                                                            <SelectItem key={status} value={status}>
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusIcon(status as OrderStatus)}
                                                                    {config.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                {canEdit && (
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
                                                )}
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
            <DeleteOrderDialogClient
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, orderId: '', orderInfo: '' })}
                onConfirm={handleDeleteConfirm}
                orderId={deleteDialog.orderId}
                orderInfo={deleteDialog.orderInfo}
                isLoading={isDeleting}
                dictionary={dictionary}
            />
        </>
    );
} 