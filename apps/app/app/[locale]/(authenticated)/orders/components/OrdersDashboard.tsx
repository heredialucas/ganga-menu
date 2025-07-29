'use client';

import React, { useState, useEffect } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { OrderData } from '@repo/data-services';
import { useSocket } from '@/hooks/useSocket';
import { OrdersTable } from './OrdersTable';
import { OrdersStats } from './OrdersStats';
import { OrdersFilters } from './OrdersFilters';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import {
    Wifi,
    WifiOff
} from 'lucide-react';
import { updateOrderStatusAction } from '../../../waiter/[slug]/actions';
import { deleteOrderAction } from '../actions';
import { toast } from 'sonner';
import { env } from '@/env';

interface OrdersDashboardProps {
    orders: OrderData[];
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    canView?: boolean;
    canEdit?: boolean;
}

type OrderStatus = 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID';

export function OrdersDashboard({
    orders: initialOrders,
    restaurantConfig,
    dictionary,
    canView = true,
    canEdit = true
}: OrdersDashboardProps) {
    const [orders, setOrders] = useState<OrderData[]>(initialOrders);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
    const [isConnected, setIsConnected] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

    // WebSocket connection
    const { isConnected: socketConnected, updateOrderStatus, deleteOrder } = useSocket({
        restaurantSlug: restaurantConfig.slug,
        roomType: 'menu', // El admin ve todas las órdenes
        onOrderEvent: (event) => {
            if (event.type === 'ORDER_CREATED') {
                setOrders(prev => {
                    // Verificar si la orden ya existe para evitar duplicados
                    const orderExists = prev.some(order => order.id === event.order.id);
                    if (orderExists) {
                        return prev;
                    }
                    return [event.order, ...prev];
                });
            } else if (event.type === 'ORDER_STATUS_CHANGED') {
                setOrders(prev => prev.map(order =>
                    order.id === event.order.id ? { ...order, status: event.order.status, updatedAt: event.order.updatedAt } : order
                ));
            } else if (event.type === 'ORDER_DELETED') {
                setOrders(prev => prev.filter(order => order.id !== event.orderId));
            }
        },
        onError: (error) => {
            console.error('Error de WebSocket en admin:', error);
        }
    });

    // Actualizar estado de conexión
    useEffect(() => {
        setIsConnected(socketConnected);
    }, [socketConnected]);

    // Sincronizar órdenes con el servidor WebSocket cuando se conecte (solo una vez)
    useEffect(() => {
        if (socketConnected && orders.length > 0) {
            const syncOrders = async () => {
                try {
                    const socketUrl = env.NEXT_PUBLIC_SOCKET_IO_URL;
                    const response = await fetch(`${socketUrl}/sync-orders`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            restaurantSlug: restaurantConfig.slug,
                            orders: orders
                        })
                    });

                    if (response.ok) {
                        console.log('Órdenes sincronizadas con el servidor WebSocket');
                    } else {
                        console.error('Error sincronizando órdenes con WebSocket');
                    }
                } catch (error) {
                    console.error('Error en sincronización:', error);
                }
            };

            syncOrders();
        }
    }, [socketConnected, restaurantConfig.slug, orders.length]); // Agregado orders.length para sincronizar cuando cambien las órdenes

    // Filtrar órdenes por estado
    const filteredOrders = selectedStatus === 'ALL'
        ? orders
        : orders.filter(order => order.status === selectedStatus);

    // Estadísticas
    const stats = {
        total: orders.length,
        active: orders.filter(o => o.status === 'ACTIVE').length,
        ready: orders.filter(o => o.status === 'READY').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    };

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        if (!canEdit) return; // No permitir actualizar si no puede editar
        setUpdatingOrderId(orderId);

        try {
            // Mostrar toast de loading
            const loadingToast = toast.loading(dictionary.web?.orders?.toast?.updatingStatus || 'Actualizando estado de la orden...');

            // Actualizar en la base de datos
            const result = await updateOrderStatusAction(orderId, newStatus);

            if (result.success && result.order) {
                // Actualizar estado local inmediatamente
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? result.order : order
                ));

                // Emitir evento al WebSocket para sincronizar con otras vistas
                updateOrderStatus(orderId, newStatus);

                // Mostrar toast de éxito
                toast.success(dictionary.web?.orders?.toast?.statusUpdated || 'Estado actualizado correctamente', {
                    id: loadingToast
                });
            } else {
                console.error('Error al actualizar estado:', result.error);
                toast.error(result.error || (dictionary.web?.orders?.toast?.statusError || 'Error al actualizar estado'), {
                    id: loadingToast
                });
            }
        } catch (error) {
            console.error('Error actualizando estado:', error);
            toast.error(dictionary.web?.orders?.toast?.statusError || 'Error al actualizar estado');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!canEdit) return; // No permitir eliminar si no puede editar
        setDeletingOrderId(orderId);

        try {
            // Mostrar toast de loading
            const loadingToast = toast.loading(dictionary.web?.orders?.toast?.deletingOrder || 'Eliminando orden...');

            // Eliminar de la base de datos
            const result = await deleteOrderAction(orderId);

            if (result.success) {
                // Actualizar estado local inmediatamente
                setOrders(prev => prev.filter(order => order.id !== orderId));

                // Emitir evento de eliminación al WebSocket
                deleteOrder(orderId);

                // Mostrar toast de éxito
                toast.success(dictionary.web?.orders?.toast?.orderDeleted || 'Orden eliminada correctamente', {
                    id: loadingToast
                });
            } else {
                console.error('Error al eliminar orden:', result.error);
                toast.error(result.error || (dictionary.web?.orders?.toast?.deleteError || 'Error al eliminar la orden'), {
                    id: loadingToast
                });
            }
        } catch (error) {
            console.error('Error eliminando orden:', error);
            toast.error(dictionary.web?.orders?.toast?.deleteError || 'Error al eliminar la orden');
        } finally {
            setDeletingOrderId(null);
        }
    };

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        {canEdit
                            ? (dictionary.web?.orders?.title || 'Gestión de Órdenes')
                            : (dictionary.web?.orders?.title || 'Gestión de Órdenes') + ' (Solo Lectura)'
                        }
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        {canEdit
                            ? (dictionary.web?.orders?.subtitle || 'Monitorea y gestiona las órdenes de tu restaurante en tiempo real')
                            : (dictionary.web?.orders?.subtitle || 'Monitorea y gestiona las órdenes de tu restaurante en tiempo real') + ' (Modo solo lectura)'
                        }
                    </p>
                    {!canEdit && (
                        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Modo solo lectura: Puedes ver las órdenes pero no modificarlas.
                            </p>
                        </div>
                    )}
                </div>

                {/* Estado de conexión */}
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <Badge variant="default" className="bg-green-500 text-xs sm:text-sm">
                            <Wifi className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{dictionary.web?.orders?.connection?.connected || 'Conectado'}</span>
                            <span className="sm:hidden">{dictionary.web?.orders?.connection?.connectedShort || 'OK'}</span>
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="text-xs sm:text-sm">
                            <WifiOff className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">{dictionary.web?.orders?.connection?.disconnected || 'Desconectado'}</span>
                            <span className="sm:hidden">{dictionary.web?.orders?.connection?.disconnectedShort || 'Off'}</span>
                        </Badge>
                    )}
                </div>
            </div>

            {/* Estadísticas */}
            <OrdersStats stats={stats} dictionary={dictionary} />

            {/* Filtros */}
            <OrdersFilters
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                dictionary={dictionary}
            />

            {/* Tabs para diferentes vistas */}
            <Tabs defaultValue="all" className="space-y-3 sm:space-y-4">
                <TabsList className="grid w-full grid-cols-3 h-auto sm:h-10">
                    <TabsTrigger value="all" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                        <span className="hidden sm:inline">{dictionary.web?.orders?.tabs?.allOrders?.desktop || 'Todas las Órdenes'}</span>
                        <span className="sm:hidden">{dictionary.web?.orders?.tabs?.allOrders?.mobile || 'Todas'}</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                        <span className="hidden sm:inline">{dictionary.web?.orders?.tabs?.activeOrders?.desktop || 'Órdenes Activas'}</span>
                        <span className="sm:hidden">{dictionary.web?.orders?.tabs?.activeOrders?.mobile || 'Activas'}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0">
                        <span className="hidden sm:inline">{dictionary.web?.orders?.tabs?.completed?.desktop || 'Completadas'}</span>
                        <span className="sm:hidden">{dictionary.web?.orders?.tabs?.completed?.mobile || 'Listas'}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3 sm:space-y-4">
                    <OrdersTable
                        orders={filteredOrders}
                        onStatusUpdate={handleStatusUpdate}
                        onDeleteOrder={handleDeleteOrder}
                        dictionary={dictionary}
                        updatingOrderId={updatingOrderId}
                        deletingOrderId={deletingOrderId}
                        canView={canView}
                        canEdit={canEdit}
                    />
                </TabsContent>

                <TabsContent value="active" className="space-y-3 sm:space-y-4">
                    <OrdersTable
                        orders={orders.filter(o => o.status === 'ACTIVE')}
                        onStatusUpdate={handleStatusUpdate}
                        onDeleteOrder={handleDeleteOrder}
                        dictionary={dictionary}
                        updatingOrderId={updatingOrderId}
                        deletingOrderId={deletingOrderId}
                        canView={canView}
                        canEdit={canEdit}
                    />
                </TabsContent>

                <TabsContent value="completed" className="space-y-3 sm:space-y-4">
                    <OrdersTable
                        orders={orders.filter(o => o.status === 'READY' || o.status === 'CANCELLED')}
                        onStatusUpdate={handleStatusUpdate}
                        onDeleteOrder={handleDeleteOrder}
                        dictionary={dictionary}
                        updatingOrderId={updatingOrderId}
                        deletingOrderId={deletingOrderId}
                        canView={canView}
                        canEdit={canEdit}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
} 