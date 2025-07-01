'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import { RestaurantElement } from '@repo/data-services/src/services/restaurantDesignService';

interface RestaurantCanvasProps {
    elements: RestaurantElement[];
    selectedId: string | null;
    onSelectElement: (id: string | null) => void;
    onUpdateElement: (id: string, updates: Partial<RestaurantElement>) => void;
    onCanvasResize: (size: { width: number; height: number }) => void;
}

export default function RestaurantCanvas({
    elements,
    selectedId,
    onSelectElement,
    onUpdateElement,
    onCanvasResize
}: RestaurantCanvasProps) {
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Configurar el observer para el tamaño del contenedor
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { offsetWidth, offsetHeight } = containerRef.current;
                // En mobile usamos el ancho completo del contenedor, en desktop restamos un poco
                const width = window.innerWidth < 1024 ? Math.max(800, offsetWidth) : Math.max(400, offsetWidth - 20);
                const height = Math.max(400, offsetHeight - 20);
                const newSize = { width, height };
                setStageSize(newSize);
                onCanvasResize(newSize);
            }
        };

        const observer = new ResizeObserver(updateSize);
        const handleResize = () => updateSize();

        if (containerRef.current) {
            observer.observe(containerRef.current);
            updateSize(); // Inicial
        }

        window.addEventListener('resize', handleResize);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        // Deseleccionar solo si se hace click en el stage o en el grid
        const clickedOnBackground = e.target === e.target.getStage() ||
            e.target.attrs.name === 'grid-line';
        if (clickedOnBackground) {
            onSelectElement(null);
        }
    };

    return (
        <div ref={containerRef} className="flex-1 bg-white min-h-96 overflow-auto">
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onClick={handleStageClick}
            >
                <Layer>
                    {/* Grid background - usando Group para evitar interferencia con eventos */}
                    <Group name="grid-background" listening={false}>
                        {/* Líneas verticales */}
                        {Array.from({ length: Math.ceil(stageSize.width / 50) + 1 }).map((_, i) => (
                            <Rect
                                key={`grid-v-${i}`}
                                x={i * 50}
                                y={0}
                                width={1}
                                height={stageSize.height}
                                fill="#e5e5e5"
                                name="grid-line"
                                listening={false}
                            />
                        ))}
                        {/* Líneas horizontales */}
                        {Array.from({ length: Math.ceil(stageSize.height / 50) + 1 }).map((_, i) => (
                            <Rect
                                key={`grid-h-${i}`}
                                x={0}
                                y={i * 50}
                                width={stageSize.width}
                                height={1}
                                fill="#e5e5e5"
                                name="grid-line"
                                listening={false}
                            />
                        ))}
                    </Group>

                    {/* Elements */}
                    {elements.map((element) => (
                        <RestaurantElementComponent
                            key={element.id}
                            element={element}
                            isSelected={element.id === selectedId}
                            onSelect={() => onSelectElement(element.id)}
                            onUpdate={(updates) => onUpdateElement(element.id, updates)}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}

interface RestaurantElementComponentProps {
    element: RestaurantElement;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<RestaurantElement>) => void;
}

function RestaurantElementComponent({ element, isSelected, onSelect, onUpdate }: RestaurantElementComponentProps) {
    const groupRef = useRef<Konva.Group>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (isSelected && transformerRef.current && groupRef.current) {
            transformerRef.current.nodes([groupRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        } else if (!isSelected && transformerRef.current) {
            // Limpiar el transformer cuando se deselecciona
            transformerRef.current.nodes([]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true; // Prevenir propagación al stage
        onSelect();
    };

    const handleDragEnd = () => {
        if (groupRef.current) {
            const node = groupRef.current;
            onUpdate({
                x: node.x(),
                y: node.y(),
            });
        }
    };

    const handleTransformEnd = () => {
        if (groupRef.current) {
            const node = groupRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            onUpdate({
                x: node.x(),
                y: node.y(),
                width: Math.max(30, element.width * scaleX),
                height: Math.max(30, element.height * scaleY),
            });

            // Reset scale after applying to width/height
            node.scaleX(1);
            node.scaleY(1);
        }
    };

    return (
        <>
            <Group
                ref={groupRef}
                x={element.x}
                y={element.y}
                draggable
                onClick={handleClick}
                onTap={handleClick}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                name={`element-${element.id}`}
            >
                {element.shape === 'circle' ? (
                    <Circle
                        radius={element.width / 2}
                        fill={element.fill}
                        stroke={isSelected ? '#0066cc' : '#333'}
                        strokeWidth={isSelected ? 2 : 1}
                    />
                ) : (
                    <Rect
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        stroke={isSelected ? '#0066cc' : '#333'}
                        strokeWidth={isSelected ? 2 : 1}
                    />
                )}

                {/* Texto del nombre - con mejor espaciado */}
                <Text
                    text={element.name}
                    fontSize={12}
                    fill="white"
                    align="center"
                    verticalAlign="middle"
                    x={element.shape === 'circle' ? -element.width / 4 : 0}
                    y={element.shape === 'circle' ? -10 : element.height / 2 - 16}
                    width={element.shape === 'circle' ? element.width / 2 : element.width}
                    height={20}
                />

                {/* Texto de capacidad - con más separación */}
                {element.capacity && (
                    <Text
                        text={`${element.capacity} pers.`}
                        fontSize={10}
                        fill="white"
                        align="center"
                        x={element.shape === 'circle' ? -element.width / 4 : 0}
                        y={element.shape === 'circle' ? 8 : element.height / 2 + 6}
                        width={element.shape === 'circle' ? element.width / 2 : element.width}
                    />
                )}
            </Group>

            {isSelected && (
                <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // Mínimo tamaño para evitar elementos demasiado pequeños
                        if (newBox.width < 30 || newBox.height < 30) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    enabledAnchors={[
                        'top-left',
                        'top-right',
                        'bottom-left',
                        'bottom-right',
                    ]}
                    rotateEnabled={false}
                    borderStroke="#0066cc"
                    borderStrokeWidth={2}
                    anchorFill="#0066cc"
                    anchorStroke="#003d7a"
                    anchorSize={8}
                    anchorCornerRadius={2}
                />
            )}
        </>
    );
} 