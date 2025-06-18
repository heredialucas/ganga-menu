'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { OrderData } from '@repo/data-services';
import { updateOrderStatusAction } from '../actions';
import {
    ChefHat,
    Clock,
    CheckCircle,
    Play,
    Filter,
    User,
    StickyNote
} from 'lucide-react';

interface KitchenInterfaceProps {
    restaurantConfig: RestaurantConfigData;
    orders: OrderData[];
    dictionary: Dictionary;
}

export default function KitchenInterface({
    restaurantConfig,
    orders,
    dictionary
}: KitchenInterfaceProps) {
    const [allOrders, setAllOrders] = useState<OrderData[]>(orders);
    const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'in_progress' | 'ready' | 'delivered'>('all');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

    // Filtrar órdenes según el filtro seleccionado
    const filteredOrders = allOrders.filter(order => {
        if (orderFilter === 'all') return true;
        if (orderFilter === 'pending') return order.status === 'PENDING';
        if (orderFilter === 'in_progress') return order.status === 'IN_PROGRESS';
        if (orderFilter === 'ready') return order.status === 'READY';
        if (orderFilter === 'delivered') return order.status === 'DELIVERED';
        return true;
    });

    // Actualizar estado de orden
    const updateOrderState = async (orderId: string, newStatus: 'IN_PROGRESS' | 'READY') => {
        setIsUpdatingStatus(orderId);
        try {
            const result = await updateOrderStatusAction(orderId, newStatus);
            if (result.success && result.order) {
                setAllOrders(prev =>
                    prev.map(order =>
                        order.id === orderId
                            ? { ...order, status: newStatus }
                            : order
                    )
                );
            } else {
                alert(result.error || 'Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error al actualizar estado');
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    // Función para obtener el color del estado
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-red-100 text-red-800 border-red-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'READY': return 'bg-green-100 text-green-800 border-green-200';
            case 'DELIVERED': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Función para obtener el texto del estado
    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendiente';
            case 'IN_PROGRESS': return 'En preparación';
            case 'READY': return 'Listo';
            case 'DELIVERED': return 'Entregado';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    // Obtener órdenes por prioridad (pendientes primero, luego en proceso, etc.)
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const priority = { 'PENDING': 1, 'IN_PROGRESS': 2, 'READY': 3, 'DELIVERED': 4, 'CANCELLED': 5 };
        const aPriority = priority[a.status as keyof typeof priority] || 6;
        const bPriority = priority[b.status as keyof typeof priority] || 6;

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // Si tienen la misma prioridad, ordenar por fecha de creación (más recientes primero)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Panel de Cocina
                                </h1>
                                <p className="text-sm text-gray-600">{restaurantConfig.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Total órdenes</p>
                                <p className="text-2xl font-bold text-orange-600">{allOrders.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Filtros
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:flex gap-2 flex-wrap">
                        <button
                            onClick={() => setOrderFilter('all')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${orderFilter === 'all'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todas ({allOrders.length})
                        </button>
                        <button
                            onClick={() => setOrderFilter('pending')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${orderFilter === 'pending'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pendientes ({allOrders.filter(o => o.status === 'PENDING').length})
                        </button>
                        <button
                            onClick={() => setOrderFilter('in_progress')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${orderFilter === 'in_progress'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            En proceso ({allOrders.filter(o => o.status === 'IN_PROGRESS').length})
                        </button>
                        <button
                            onClick={() => setOrderFilter('ready')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${orderFilter === 'ready'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Listos ({allOrders.filter(o => o.status === 'READY').length})
                        </button>
                        <button
                            onClick={() => setOrderFilter('delivered')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${orderFilter === 'delivered'
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Entregados ({allOrders.filter(o => o.status === 'DELIVERED').length})
                        </button>
                    </div>
                </div>

                {/* Lista de órdenes */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Órdenes Activas ({sortedOrders.length})
                        </h3>
                    </div>

                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                        {sortedOrders.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <ChefHat className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p>No hay órdenes para mostrar</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {sortedOrders.map((order, index) => (
                                    <div
                                        key={order.id}
                                        className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                            } ${order.status === 'PENDING' ? 'border-l-4 border-l-red-500' :
                                                order.status === 'IN_PROGRESS' ? 'border-l-4 border-l-blue-500' :
                                                    order.status === 'READY' ? 'border-l-4 border-l-green-500' :
                                                        'border-l-4 border-l-gray-300'
                                            }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center flex-shrink-0">
                                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-1">
                                                        <span className="text-lg font-bold text-orange-800">
                                                            {order.tableNumber}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">Mesa</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                        {order.waiterName && (
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <User className="w-4 h-4" />
                                                                <span>{order.waiterName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            {new Date(order.createdAt).toLocaleString('es-ES', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right sm:text-right">
                                                <p className="text-xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                                                <div className="flex gap-2 mt-2 flex-wrap justify-end">
                                                    {order.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateOrderState(order.id, 'IN_PROGRESS')}
                                                                disabled={isUpdatingStatus === order.id}
                                                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Play className="w-3 h-3" />
                                                                {isUpdatingStatus === order.id ? '...' : 'Iniciar'}
                                                            </button>
                                                            <button
                                                                onClick={() => updateOrderState(order.id, 'READY')}
                                                                disabled={isUpdatingStatus === order.id}
                                                                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <CheckCircle className="w-3 h-3" />
                                                                {isUpdatingStatus === order.id ? '...' : 'Listo'}
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status === 'IN_PROGRESS' && (
                                                        <button
                                                            onClick={() => updateOrderState(order.id, 'READY')}
                                                            disabled={isUpdatingStatus === order.id}
                                                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <CheckCircle className="w-3 h-3" />
                                                            {isUpdatingStatus === order.id ? 'Actualizando...' : 'Marcar Listo'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items de la orden */}
                                        <div className="space-y-3">
                                            {order.items.map(item => (
                                                <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                                    {item.quantity}x
                                                                </span>
                                                                <span className="font-medium text-gray-900">
                                                                    {item.dish.name}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {item.dish.description}
                                                            </p>
                                                            {item.notes && (
                                                                <div className="flex items-start gap-2 bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                                                                    <StickyNote className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                                    <p className="text-sm text-yellow-800 font-medium">
                                                                        {item.notes}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-lg font-semibold text-gray-900 sm:ml-4">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Notas de la orden */}
                                        {order.notes && (
                                            <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                                <div className="flex items-start gap-2">
                                                    <StickyNote className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-900 mb-1">
                                                            Notas de la orden:
                                                        </p>
                                                        <p className="text-sm text-blue-800">{order.notes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 