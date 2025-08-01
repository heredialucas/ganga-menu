'use client';

import React, { useState, useEffect } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { OrderData } from '@repo/data-services';
import { useSocket } from '@/hooks/useSocket';
import { OrdersTableClient } from '../table/OrdersTableClient';
import { OrdersStatsClient } from '../stats/OrdersStatsClient';
import { OrdersFiltersClient } from '../filters/OrdersFiltersClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { deleteOrderAction } from '../../actions';
import { toast } from 'sonner';
import { env } from '@/env';
import { updateOrderStatusAction } from '@/app/[locale]/waiter/[slug]/actions';

interface OrdersDashboardClientProps {
    orders: OrderData[];
    restaurantConfig: RestaurantConfigData;
    dictionary: Dictionary;
    locale: string;
    canView: boolean;
    canEdit: boolean;
}

type OrderStatus = 'ACTIVE' | 'READY' | 'CANCELLED' | 'PAID';

export function OrdersDashboardClient({
    orders: initialOrders,
    restaurantConfig,
    dictionary,
    locale,
    canView,
    canEdit
}: OrdersDashboardClientProps) {
    const [orders, setOrders] = useState<OrderData[]>(initialOrders);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

    // WebSocket connection
    const { updateOrderStatus, deleteOrder } = useSocket({
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

    // Sincronizar órdenes con el servidor WebSocket cuando se conecte (solo una vez)
    useEffect(() => {
        if (orders.length > 0) {
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
    }, [restaurantConfig.slug, orders.length]);

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
        if (!canEdit) {
            toast.error(dictionary.web?.orders?.toast?.statusError || 'No tienes permisos para actualizar el estado de las órdenes');
            return;
        }
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
        if (!canEdit) {
            toast.error(dictionary.web?.orders?.toast?.deleteError || 'No tienes permisos para eliminar órdenes');
            return;
        }
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
            {/* Estadísticas */}
            <OrdersStatsClient stats={stats} dictionary={dictionary} />

            {/* Filtros */}
            <OrdersFiltersClient
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
                    <OrdersTableClient
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
                    <OrdersTableClient
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
                    <OrdersTableClient
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