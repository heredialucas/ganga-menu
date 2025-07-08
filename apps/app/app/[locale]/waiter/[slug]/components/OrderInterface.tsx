'use client';

import React, { useState } from 'react';
import { Dictionary } from '@repo/internationalization';
import { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import { createOrderAction, getRestaurantOrdersAction, updateOrderStatusAction } from '../actions';
import {
    Plus,
    Minus,
    Search,
    Filter,
    User,
    MapPin,
    ChefHat,
    CheckCircle,
    Clock,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@repo/design-system/components/ui/card';

interface Category {
    id: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    order: number;
    isActive: boolean;
    dishes: Dish[];
}

interface Dish {
    id: string;
    name: string;
    description: string;
    price: number;
    promotionalPrice?: number | null;
    imageUrl?: string | null;
    status: string;
    order: number;
    category?: {
        name: string;
    } | null;
}

interface DailySpecial {
    id: string;
    date: Date;
    isActive: boolean;
    dish: Dish;
}

interface OrderItem {
    dish: Dish;
    quantity: number;
    notes?: string;
}

interface SubmittedOrder {
    id: string;
    table: { id: string; label: string; } | null;
    waiterName?: string | null;
    total: number;
    items: {
        id: string;
        quantity: number;
        price: number;
        notes?: string | null;
        dish: {
            id: string;
            name: string;
            description: string;
            price: number;
            imageUrl?: string | null;
        };
    }[];
    createdAt: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
}

interface OrderInterfaceProps {
    restaurantConfig: RestaurantConfigData;
    categories: Category[];
    dailySpecials: DailySpecial[];
    dictionary: Dictionary;
    existingOrders: SubmittedOrder[];
    tables: { id: string; label: string; }[];
}

export default function OrderInterface({
    restaurantConfig,
    categories,
    dailySpecials,
    dictionary,
    existingOrders,
    tables,
}: OrderInterfaceProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [tableId, setTableId] = useState(tables[0]?.id || '');
    const [waiterName, setWaiterName] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedOrders, setSubmittedOrders] = useState<SubmittedOrder[]>(existingOrders);
    const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
    const [isOrdersExpanded, setIsOrdersExpanded] = useState(true); // Default to expanded
    const [addingToOrderId, setAddingToOrderId] = useState<string | null>(null);
    const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'ready' | 'delivered'>('all');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

    const waiterDict = (dictionary as any).waiter?.order || {};

    const getOrderConfig = (status: SubmittedOrder['status']) => {
        switch (status) {
            case 'PENDING':
                return {
                    bg: 'bg-yellow-50', blob: 'bg-yellow-200', accent: 'bg-yellow-500',
                    text: 'Pendiente', borderColor: 'border-yellow-200'
                };
            case 'IN_PROGRESS':
                return {
                    bg: 'bg-blue-50', blob: 'bg-blue-200', accent: 'bg-blue-500',
                    text: 'En preparación', borderColor: 'border-blue-200'
                };
            case 'READY':
                return {
                    bg: 'bg-green-50', blob: 'bg-green-200', accent: 'bg-green-500',
                    text: 'Listo', borderColor: 'border-green-200'
                };
            case 'DELIVERED':
                return {
                    bg: 'bg-gray-50', blob: 'bg-gray-200', accent: 'bg-gray-500',
                    text: 'Entregado', borderColor: 'border-gray-200'
                };
            case 'CANCELLED':
                return {
                    bg: 'bg-red-50', blob: 'bg-red-200', accent: 'bg-red-700',
                    text: 'Cancelado', borderColor: 'border-red-300'
                };
            default:
                return {
                    bg: 'bg-gray-50', blob: 'bg-gray-200', accent: 'bg-gray-500',
                    text: status, borderColor: 'border-gray-200'
                };
        }
    };

    const getTimeElapsedString = (date: string | Date) => {
        const orderTime = new Date(date).getTime();
        const now = new Date().getTime();
        const diffMinutes = Math.round((now - orderTime) / (1000 * 60));
        if (diffMinutes < 1) return '<1m';
        if (diffMinutes < 60) return `${diffMinutes}m`;
        const diffHours = Math.floor(diffMinutes / 60);
        return `${diffHours}h ${diffMinutes % 60}m`;
    };

    // Función para obtener el precio correcto (promocional solo si es especial del día HOY)
    const getCorrectPrice = (dish: Dish): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isSpecialToday = dailySpecials.some(special => {
            const specialDate = new Date(special.date);
            specialDate.setHours(0, 0, 0, 0);
            return special.dish.id === dish.id &&
                specialDate.getTime() === today.getTime() &&
                special.isActive;
        });

        if (isSpecialToday && dish.promotionalPrice && dish.promotionalPrice > 0) {
            return dish.promotionalPrice;
        }
        return dish.price;
    };

    const isSpecialToday = (dish: Dish): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dailySpecials.some(special => {
            const specialDate = new Date(special.date);
            specialDate.setHours(0, 0, 0, 0);
            return special.dish.id === dish.id &&
                specialDate.getTime() === today.getTime() &&
                special.isActive;
        });
    };

    // Filtrar platos
    const filteredCategories = categories.filter(category => {
        const filteredDishes = category.dishes.filter(dish =>
            dish.status === 'ACTIVE' &&
            (!searchTerm || dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || dish.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return filteredDishes.length > 0 && (selectedCategory === 'all' || category.id === selectedCategory);
    }).map(category => ({
        ...category,
        dishes: category.dishes.filter(dish =>
            dish.status === 'ACTIVE' &&
            (!searchTerm || dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || dish.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    }));

    const updateQuantity = (dish: Dish, quantity: number) => {
        setOrderItems(prev => {
            if (quantity <= 0) return prev.filter(item => item.dish.id !== dish.id);
            const existingItem = prev.find(item => item.dish.id === dish.id);
            if (existingItem) return prev.map(item => item.dish.id === dish.id ? { ...item, quantity } : item);
            return [...prev, { dish, quantity }];
        });
    };

    const updateItemNotes = (dishId: string, notes: string) => {
        setOrderItems(prev => prev.map(item => item.dish.id === dishId ? { ...item, notes } : item));
    };

    const total = orderItems.reduce((sum, item) => sum + (getCorrectPrice(item.dish) * item.quantity), 0);

    const submitOrder = async () => {
        if (orderItems.length === 0 || !tableId.trim()) return;
        setIsSubmitting(true);
        try {
            const result = await createOrderAction({
                tableId,
                waiterName: waiterName.trim() || undefined,
                notes: orderNotes.trim() || undefined,
                restaurantConfigId: restaurantConfig.id,
                items: orderItems.map(item => ({
                    dishId: item.dish.id,
                    quantity: item.quantity,
                    notes: item.notes?.trim() || undefined
                }))
            });
            if (result.success && result.order) {
                setSubmittedOrders(prev => [result.order, ...prev]);
                setOrderItems([]);
                setTableId(tables[0]?.id || '');
                setWaiterName('');
                setOrderNotes('');
                setAddingToOrderId(null);
                setShowOrderConfirmation(true);
                setTimeout(() => setShowOrderConfirmation(false), 3000);
            } else {
                alert(result.error || waiterDict.error || 'Error al enviar la orden');
            }
        } catch (error) {
            console.error('Error enviando orden:', error);
            alert(waiterDict.error || 'Error al enviar la orden');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addToExistingOrder = (orderId: string) => {
        const order = submittedOrders.find(o => o.id === orderId);
        if (order && order.table) {
            setTableId(order.table.id);
            setWaiterName(order.waiterName || '');
            setAddingToOrderId(orderId);
            setOrderNotes(`Agregar a orden existente - ${order.table.label}`);
        }
    };

    const getQuantityForDish = (dish: Dish): number => orderItems.find(item => item.dish.id === dish.id)?.quantity || 0;

    const filteredOrders = submittedOrders.filter(order => {
        if (orderFilter === 'all') return true;
        if (orderFilter === 'active') return ['PENDING', 'IN_PROGRESS'].includes(order.status);
        if (orderFilter === 'ready') return order.status === 'READY';
        if (orderFilter === 'delivered') return order.status === 'DELIVERED';
        return false;
    });

    const updateOrderState = async (orderId: string, newStatus: 'DELIVERED') => {
        setIsUpdatingStatus(orderId);
        try {
            const result = await updateOrderStatusAction(orderId, newStatus);
            if (result.success && result.order) {
                setSubmittedOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
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

    const FilterButton = ({ filter, label, count }: { filter: typeof orderFilter, label: string, count: number }) => (
        <button
            onClick={() => setOrderFilter(filter)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${orderFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
        >
            {label} ({count})
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{waiterDict.title || 'Tomar Orden'}</h1>
                            <p className="text-sm text-gray-600">{restaurantConfig.name}</p>
                        </div>
                    </div>
                </div>
            </header>

            {showOrderConfirmation && (
                <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{waiterDict.orderSent || '¡Orden enviada a la cocina!'}</span>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-6">
                {submittedOrders.length > 0 && (
                    <Card className="bg-white rounded-lg shadow-sm mb-6">
                        <button
                            onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">{waiterDict.submittedOrders || 'Historial de Órdenes'}</h3>
                            </div>
                            {isOrdersExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {isOrdersExpanded && (
                            <div className="border-t">
                                <div className="p-4 border-b bg-gray-50">
                                    <div className="flex gap-2 flex-wrap">
                                        <FilterButton filter="all" label="Todas" count={submittedOrders.length} />
                                        <FilterButton filter="active" label="Activas" count={submittedOrders.filter(o => ['PENDING', 'IN_PROGRESS'].includes(o.status)).length} />
                                        <FilterButton filter="ready" label="Listas" count={submittedOrders.filter(o => o.status === 'READY').length} />
                                        <FilterButton filter="delivered" label="Entregadas" count={submittedOrders.filter(o => o.status === 'DELIVERED').length} />
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                                    {filteredOrders.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">{waiterDict.noOrdersFound || 'No se encontraron órdenes'}</div>
                                    ) : (
                                        filteredOrders.map(order => {
                                            const config = getOrderConfig(order.status);
                                            return (
                                                <Card key={order.id} className={`${config.bg} ${config.borderColor} border-2 relative overflow-hidden`}>
                                                    <div className={`absolute -top-4 -right-4 w-20 h-16 ${config.blob} opacity-20 r-blob`}></div>
                                                    <div className={`absolute -bottom-2 -left-2 w-12 h-10 ${config.blob} opacity-15 r-blob`}></div>
                                                    <CardHeader className="pb-3 relative z-10">
                                                        <div className="flex items-center justify-between">
                                                            <div className={`${config.accent} text-white px-4 py-2 text-sm font-medium r-blob-b`}>{config.text}</div>
                                                            <span className="text-sm font-mono bg-white px-2 py-1 rounded-full border">#{order.id.substring(0, 5)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <h3 className="font-bold text-xl text-gray-800">Mesa {order.table?.label || 'Mostrador'}</h3>
                                                            <span className="text-sm text-gray-500">hace {getTimeElapsedString(order.createdAt)}</span>
                                                        </div>
                                                        {order.waiterName && <p className="text-xs text-gray-600 mt-1">Por: {order.waiterName}</p>}
                                                    </CardHeader>
                                                    <CardContent className="relative z-10">
                                                        <div className="space-y-2">
                                                            {order.items.map(item => (
                                                                <div key={item.id} className="flex justify-between items-start text-sm">
                                                                    <div className="flex-1"><span className="font-medium text-gray-800">{item.quantity}x {item.dish.name}</span>{item.notes && <p className="text-xs text-gray-600 mt-1 italic">"{item.notes}"</p>}</div>
                                                                    <span className="text-gray-700 ml-2 font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="relative z-10 flex-col items-start gap-3 pt-4 border-t">
                                                        <div className="w-full flex justify-between items-center"><p className="text-lg font-bold text-green-700">Total: ${order.total.toFixed(2)}</p></div>
                                                        <div className="w-full flex gap-2 pt-2 border-t">
                                                            <button onClick={() => addToExistingOrder(order.id)} className="flex-1 text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 font-medium">+ {waiterDict.addDishes || 'Agregar platos'}</button>
                                                            {(order.status === 'READY' || order.status === 'PENDING') && (
                                                                <button onClick={() => updateOrderState(order.id, 'DELIVERED')} disabled={isUpdatingStatus === order.id} className="flex-1 text-xs bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200 font-medium disabled:opacity-50">{isUpdatingStatus === order.id ? (waiterDict.updating || '...') : (waiterDict.markDelivered || 'Marcar Entregado')}</button>
                                                            )}
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                <Card className="relative overflow-hidden border-2 border-gray-200 bg-white/50 shadow-sm mb-6">
                    <div className={`absolute -top-8 -left-8 w-40 h-32 bg-blue-200 opacity-15 r-blob`}></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{addingToOrderId ? `${waiterDict.addToOrder || 'Agregar a Orden'} - ${tables.find(t => t.id === tableId)?.label}` : (waiterDict.orderInfo || 'Nueva Orden')}</h3>
                            {addingToOrderId && <button onClick={() => { setAddingToOrderId(null); setTableId(tables[0]?.id || ''); setWaiterName(''); setOrderNotes(''); setOrderItems([]); }} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{waiterDict.table || 'Mesa'} *</label>
                                <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={tableId} onChange={(e) => setTableId(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required disabled={!!addingToOrderId}>{tables.map(table => <option key={table.id} value={table.id}>{table.label}</option>)}</select></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{waiterDict.waiterName || 'Nombre Mozo'}</label>
                                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" value={waiterName} onChange={(e) => setWaiterName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Opcional" /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{waiterDict.total || 'Total'}</label>
                                <div className="text-2xl font-bold text-green-600 py-1">${total.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">{waiterDict.orderNotes || 'Notas de la orden'}</label><textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Notas especiales..."></textarea></div>
                        {orderItems.length > 0 && <button onClick={submitOrder} disabled={isSubmitting || !tableId.trim()} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50">{isSubmitting ? 'Enviando...' : addingToOrderId ? (waiterDict.addToOrder || 'Agregar a Orden') : (waiterDict.submit || 'Enviar Orden')}</button>}
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-2 border-gray-200 bg-white/50 shadow-sm p-4 mb-6">
                    <div className={`absolute top-4 right-4 w-12 h-10 bg-blue-200 opacity-15 r-blob`}></div>
                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder={waiterDict.search || 'Buscar platos...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                        <div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"><option value="all">{waiterDict.all || 'Todos'}</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
                    </div>
                </Card>

                <div className="space-y-6 mb-8">
                    {filteredCategories.map(category => (
                        <Card key={category.id} className="relative overflow-hidden border-2 border-gray-200 bg-white/50 shadow-sm">
                            <div className={`absolute bottom-0 -right-4 w-20 h-20 bg-blue-200 opacity-10 r-blob`}></div>
                            <CardHeader className="p-4 border-b"><h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>{category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}</CardHeader>
                            <CardContent className="p-4"><div className="space-y-4">
                                {category.dishes.map(dish => {
                                    const quantity = getQuantityForDish(dish);
                                    const price = getCorrectPrice(dish);
                                    const isSpecial = isSpecialToday(dish);
                                    const hasPromotion = isSpecial && dish.promotionalPrice && dish.promotionalPrice > 0;
                                    return (
                                        <Card key={dish.id} className="border border-gray-200 rounded-lg p-4 bg-white/70 relative z-10">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1"><h4 className="font-medium text-gray-900">{dish.name}</h4>{isSpecial && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Especial</span>}</div>
                                                    <p className="text-sm text-gray-600 mb-2">{dish.description}</p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    {hasPromotion ? (<><p className="text-lg font-bold text-green-600">${dish.promotionalPrice?.toFixed(2)}</p><p className="text-sm text-gray-500 line-through">${dish.price.toFixed(2)}</p></>) : (<p className="text-lg font-bold text-gray-900">${dish.price.toFixed(2)}</p>)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3"><button onClick={() => updateQuantity(dish, quantity - 1)} disabled={quantity === 0} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"><Minus className="w-4 h-4" /></button><span className="font-medium text-lg w-8 text-center">{quantity}</span><button onClick={() => updateQuantity(dish, quantity + 1)} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200"><Plus className="w-4 h-4" /></button></div>
                                                {quantity > 0 && (<div className="flex items-center gap-3"><input type="text" placeholder="Notas..." value={orderItems.find(item => item.dish.id === dish.id)?.notes || ''} onChange={(e) => updateItemNotes(dish.id, e.target.value)} className="px-3 py-1 border border-gray-300 rounded text-sm w-32" /><span className="font-bold text-green-600">${(price * quantity).toFixed(2)}</span></div>)}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
// Helper para los blobs
const blobStyles = `
    .r-blob { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    .r-blob-b { border-radius: 50% 20% 80% 30% / 60% 70% 30% 40%; }
`;
// Para usar estos estilos, necesitarías un <style jsx>{blobStyles}</style> en algún lugar del componente.
// Como no puedo agregar style jsx directamente, los he dejado como inline styles.