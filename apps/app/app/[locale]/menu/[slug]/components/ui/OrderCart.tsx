'use client';

import React, { useState } from 'react';
import { ShoppingCart, X, Trash2, Send } from 'lucide-react';
import { Dictionary } from '@repo/internationalization';
import { Dish } from './types';
import { TableData } from '@repo/data-services/src/services/tableService';

interface CartItem {
    dish: Dish;
    quantity: number;
}

interface OrderCartProps {
    items: CartItem[];
    onRemoveItem: (dishId: string) => void;
    onUpdateQuantity: (dishId: string, quantity: number) => void;
    onPlaceOrder: (notes?: string) => void;
    dictionary: Dictionary;
    restaurantConfigId: string;
    table?: TableData; // Mesa específica (opcional para compatibilidad)
    todaySpecials?: Array<{ id: string; date: Date; isActive: boolean; dish: { id: string } }>; // Para calcular precios correctos
}

export default function OrderCart({
    items,
    onRemoveItem,
    onUpdateQuantity,
    onPlaceOrder,
    dictionary,
    restaurantConfigId,
    table,
    todaySpecials = []
}: OrderCartProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState('');

    // Función para obtener el precio correcto (promocional solo si es especial del día HOY)
    const getCorrectPrice = (dish: any): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isSpecialToday = todaySpecials.some(special => {
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

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
        const price = getCorrectPrice(item.dish);
        return sum + (price * item.quantity);
    }, 0);

    const handlePlaceOrder = () => {
        if (!table) {
            alert('No se ha especificado una mesa para el pedido');
            return;
        }
        onPlaceOrder(notes.trim() || undefined);
        setIsOpen(false);
        setNotes('');
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <>
            {/* Botón flotante del carrito */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
            >
                <ShoppingCart className="w-6 h-6" />
                <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {totalItems}
                </span>
            </button>

            {/* Modal del carrito */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">{dictionary?.app?.menu?.cart?.title || 'Tu Pedido'}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Lista de items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {items.map((item) => (
                                <div key={item.dish.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.dish?.name || dictionary?.app?.menu?.cart?.dishNotAvailable || 'Plato no disponible'}</h4>
                                        <p className="text-sm text-gray-600">
                                            ${getCorrectPrice(item.dish).toFixed(2)} x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
                                            className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                            disabled={item.quantity <= 1}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <span className="text-sm font-medium min-w-[2rem] text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                                            className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                                        >
                                            <X className="w-3 h-3 rotate-45" />
                                        </button>
                                        <button
                                            onClick={() => onRemoveItem(item.dish.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Formulario de orden */}
                        <div className="p-4 border-t space-y-3">
                            {table && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {dictionary?.app?.menu?.cart?.table || 'Mesa'}
                                    </label>
                                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                                        {table.label}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {dictionary?.app?.menu?.cart?.notes || 'Notas (opcional)'}
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={dictionary?.app?.menu?.cart?.notesPlaceholder || "Instrucciones especiales..."}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center py-2 border-t">
                                <span className="text-lg font-semibold">{dictionary?.app?.menu?.cart?.total || 'Total'}:</span>
                                <span className="text-lg font-bold text-green-600">
                                    ${totalPrice.toFixed(2)}
                                </span>
                            </div>

                            {/* Botón de enviar orden */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={!table}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {dictionary?.app?.menu?.cart?.sendOrder || 'Enviar Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 