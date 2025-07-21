'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
    restaurantSlug: string;
    roomType: 'menu' | 'kitchen' | 'waiter';
    onOrderEvent?: (event: any) => void;
    onError?: (error: any) => void;
}

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    joinRestaurant: () => void;
    createOrder: (orderData: any) => void;
    updateOrderStatus: (orderId: string, status: string) => void;
    deleteOrder: (orderId: string) => void;
}

export function useSocket({
    restaurantSlug,
    roomType,
    onOrderEvent,
    onError
}: UseSocketOptions): UseSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Inicializar conexión
    useEffect(() => {
        // Evitar múltiples conexiones
        if (socketRef.current) {
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:3001';

        socketRef.current = io(socketUrl, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        const socket = socketRef.current;

        // Eventos de conexión
        socket.on('connect', () => {
            console.log('Conectado al servidor WebSocket');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Desconectado del servidor WebSocket');
            setIsConnected(false);
            setHasJoinedRoom(false);
        });

        // Eventos de la aplicación
        socket.on('joined_room', (data) => {
            console.log('Unido a la sala:', data);
            setHasJoinedRoom(true);
        });

        socket.on('order_event', (event) => {
            onOrderEvent?.(event);
        });

        socket.on('order_created', (data) => {
            console.log('Orden creada:', data);
        });

        socket.on('order_updated', (data) => {
            console.log('Orden actualizada:', data);
        });

        socket.on('error', (error) => {
            console.error('Error del WebSocket:', error);
            onError?.(error);
        });

        // Conectar automáticamente
        socket.connect();

        // Cleanup al desmontar
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []); // Removemos las dependencias que causan re-renders

    // Función para unirse al restaurante
    const joinRestaurant = useCallback(() => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('join_restaurant', {
                restaurantSlug,
                roomType
            });
        }
    }, [restaurantSlug, roomType, isConnected]);

    // Función para crear orden
    const createOrder = useCallback((orderData: any) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('create_order', {
                restaurantSlug,
                order: orderData
            });
        }
    }, [restaurantSlug, isConnected]);

    // Función para actualizar estado de orden
    const updateOrderStatus = useCallback((orderId: string, status: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('update_order_status', {
                restaurantSlug,
                orderId,
                status
            });
        }
    }, [restaurantSlug, isConnected]);

    // Función para eliminar orden
    const deleteOrder = useCallback((orderId: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('delete_order', {
                restaurantSlug,
                orderId
            });
        }
    }, [restaurantSlug, isConnected]);

    // Unirse automáticamente cuando se conecte
    useEffect(() => {
        if (isConnected && socketRef.current && !hasJoinedRoom) {
            joinRestaurant();
        }
    }, [isConnected, restaurantSlug, roomType, hasJoinedRoom]); // Agregamos las dependencias necesarias

    return {
        socket: socketRef.current,
        isConnected,
        joinRestaurant,
        createOrder,
        updateOrderStatus,
        deleteOrder
    };
} 