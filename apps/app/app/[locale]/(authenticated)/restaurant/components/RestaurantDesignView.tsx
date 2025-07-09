'use client';

import { useState, useRef, useEffect, type FC, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/design-system/components/ui/card';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@repo/design-system/components/ui/alert-dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/components/ui/popover';
import { PlusCircle, Save, Square, Circle as CircleIcon, MinusSquare, Pen, Trash2, MousePointer, Loader2, ChevronsUp, Type } from 'lucide-react';
import { saveRestaurantDesign } from '@repo/data-services/src/services/restaurantDesignService';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { RestaurantDesignData, RestaurantTableData as BaseRestaurantTableData, RestaurantElement, SaveDesignResult } from '@repo/data-services/src/services/restaurantDesignService';

type RestaurantTableData = BaseRestaurantTableData & { type: 'table' };

const initialState: SaveDesignResult = {
    success: false,
    message: '',
    tables: undefined,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4" />}
            Guardar Diseño
        </Button>
    );
}

// Importar componentes de Konva directamente para evitar problemas de SSR
let KonvaComponents: any = null;

const initializeKonva = async () => {
    if (typeof window !== 'undefined' && !KonvaComponents) {
        const { Stage, Layer, Rect, Circle, Transformer, Line, Group, Text } = await import('react-konva');
        KonvaComponents = { Stage, Layer, Rect, Circle, Transformer, Line, Group, Text };
    }
    return KonvaComponents;
};

const Staircase: FC<{ width: number; height: number; fill: string; onSelect?: () => void; }> = ({ width, height, fill, onSelect }) => {
    const stepCount = 5;
    const stepHeight = height / stepCount;

    console.log('🏢 Staircase rendering:', { width, height, fill, onSelect: !!onSelect });

    if (!KonvaComponents) return null;

    const { Group, Rect, Line, Text } = KonvaComponents;

    const handleClick = (e: any) => {
        console.log('🏢 Staircase clicked!');
        if (onSelect) {
            e.cancelBubble = true;
            onSelect();
        }
    };

    const handleTap = (e: any) => {
        console.log('🏢 Staircase tapped!');
        if (onSelect) {
            e.cancelBubble = true;
            onSelect();
        }
    };

    return (
        <Group>
            <Rect
                width={width}
                height={height}
                stroke="#333"
                strokeWidth={1}
                fill={fill}
                perfectDrawEnabled={false}
                shadowForStrokeEnabled={false}
                hitStrokeWidth={10}
                listening={true}
                opacity={0.8}
                onClick={handleClick}
                onTap={handleTap}
                onMouseDown={handleClick}
            />
            {Array.from({ length: stepCount - 1 }).map((_, i) => (
                <Line
                    key={i}
                    points={[0, (i + 1) * stepHeight, width, (i + 1) * stepHeight]}
                    stroke="#333"
                    strokeWidth={0.5}
                    listening={false}
                    perfectDrawEnabled={false}
                />
            ))}
            <Text
                text="Escalera"
                fontSize={12}
                fill="#333"
                width={width}
                align="center"
                verticalAlign="middle"
                listening={false}
                perfectDrawEnabled={false}
            />
        </Group>
    );
};

interface ShapeProps {
    shapeProps: RestaurantElement | RestaurantTableData;
    onSelect: () => void;
    onChange: (newAttrs: RestaurantElement | RestaurantTableData) => void;
}

const Shape: FC<ShapeProps> = ({ shapeProps, onSelect, onChange }) => {
    const shapeRef = useRef<any>(null);

    if (!KonvaComponents) return null;

    const { Group, Rect, Circle, Text } = KonvaComponents;

    console.log('🔧 Shape rendering:', {
        id: shapeProps.id,
        type: shapeProps.type,
        shape: 'shape' in shapeProps ? shapeProps.shape : 'none',
        x: (shapeProps as any).x,
        y: (shapeProps as any).y,
        width: 'width' in shapeProps ? shapeProps.width : 'none',
        height: 'height' in shapeProps ? shapeProps.height : 'none'
    });

    const handleTransformEnd = () => {
        console.log('🔄 Transform end triggered for:', shapeProps.id);
        const node = shapeRef.current;
        if (!node) {
            console.log('❌ No node found in shapeRef');
            return;
        }
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1); node.scaleY(1);

        const baseProps = shapeProps as any;
        let newWidth = Math.max(10, baseProps.width * scaleX);
        let newHeight = Math.max(10, baseProps.height * scaleY);

        if ('shape' in shapeProps && shapeProps.shape === 'circle') {
            const diameter = Math.max(newWidth, newHeight);
            newWidth = diameter;
            newHeight = diameter;
        }

        const newAttrs = {
            ...shapeProps,
            x: node.x(), y: node.y(), rotation: node.rotation(),
            width: newWidth,
            height: newHeight,
        };
        onChange(newAttrs as RestaurantElement | RestaurantTableData);
    };

    const handleClick = (e: any) => {
        console.log('🖱️ Shape clicked:', shapeProps.id, shapeProps.type);
        e.cancelBubble = true;
        onSelect();
    };

    const handleTap = (e: any) => {
        console.log('👆 Shape tapped:', shapeProps.id, shapeProps.type);
        e.cancelBubble = true;
        onSelect();
    };

    const handleDragEnd = (e: any) => {
        console.log('🚚 Drag end for:', shapeProps.id);
        onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() } as any);
    };

    let component;
    const label = 'label' in shapeProps ? shapeProps.label : null;
    const width = 'width' in shapeProps ? shapeProps.width : 50;
    const height = 'height' in shapeProps ? shapeProps.height : 50;
    const fill = 'fill' in shapeProps ? shapeProps.fill : '#ccc';

    // Para círculos, usar el diámetro como width y height para centrar el texto correctamente
    const textWidth = ('shape' in shapeProps && shapeProps.shape === 'circle') ? width : width;
    const textHeight = ('shape' in shapeProps && shapeProps.shape === 'circle') ? width : height;

    // Propiedades comunes para mejorar la detección de hits
    const commonShapeProps = {
        stroke: '#transparent',
        strokeWidth: 0,
        fill: fill,
        perfectDrawEnabled: false,
        shadowForStrokeEnabled: false,
        hitStrokeWidth: 0,
        listening: true,
    };

    console.log('🎨 Common shape props for', shapeProps.id, ':', commonShapeProps);

    switch (shapeProps.type) {
        case 'staircase':
            console.log('🏢 Rendering staircase component');
            component = <Staircase width={width} height={height} fill={fill} onSelect={() => onSelect()} />;
            break;
        case 'wall':
        case 'bar':
        case 'table':
            if ('shape' in shapeProps && shapeProps.shape) {
                if (shapeProps.shape === 'rectangle' || shapeProps.shape === 'square') {
                    console.log('⬛ Rendering rectangle component for:', shapeProps.id);
                    component = (
                        <Rect
                            width={width}
                            height={height}
                            stroke="#000"
                            strokeWidth={1}
                            fill={fill}
                            perfectDrawEnabled={false}
                            shadowForStrokeEnabled={false}
                            hitStrokeWidth={10}
                            listening={true}
                            opacity={0.8}
                            onClick={handleClick}
                            onTap={handleTap}
                            onMouseDown={handleClick}
                        />
                    );
                } else if (shapeProps.shape === 'circle') {
                    console.log('🔵 Rendering circle component for:', shapeProps.id);
                    component = (
                        <Circle
                            radius={width / 2}
                            {...commonShapeProps}
                            onClick={handleClick}
                            onTap={handleTap}
                        />
                    );
                }
            } else {
                console.log('❌ No shape property for:', shapeProps.type);
            }
            break;
        default:
            console.log('❌ Unknown shape type:', (shapeProps as any).type);
            return null;
    }

    console.log('✅ Shape component created for:', shapeProps.id, component ? 'SUCCESS' : 'FAILED');

    return (
        <Group
            ref={shapeRef}
            id={shapeProps.id}
            x={(shapeProps as any).x || 0}
            y={(shapeProps as any).y || 0}
            rotation={(shapeProps as any).rotation || 0}
            draggable
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
            listening={true}
            perfectDrawEnabled={false}
            onClick={(e: any) => {
                console.log('🎯 Group clicked:', shapeProps.id);
                handleClick(e);
            }}
            onTap={(e: any) => {
                console.log('🎯 Group tapped:', shapeProps.id);
                handleTap(e);
            }}
        >
            {component}
            {label && (
                <Text
                    text={label}
                    fontSize={14}
                    fill="#333"
                    width={textWidth}
                    height={textHeight}
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                    perfectDrawEnabled={false}
                />
            )}
        </Group>
    );
};

function DesignCanvas({ config, design, tables, setTables, elements, setElements }: {
    config: RestaurantConfigData;
    design: RestaurantDesignData | null;
    tables: RestaurantTableData[];
    setTables: React.Dispatch<React.SetStateAction<RestaurantTableData[]>>;
    elements: RestaurantElement[];
    setElements: React.Dispatch<React.SetStateAction<RestaurantElement[]>>;
}) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<'select' | 'wall'>('select');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentWall, setCurrentWall] = useState<number[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [konvaReady, setKonvaReady] = useState(false);

    const designSize = {
        width: design?.canvasWidth || 800,
        height: design?.canvasHeight || 600,
    };
    const [stageSize, setStageSize] = useState(designSize);
    const containerRef = useRef<HTMLDivElement>(null);

    const [tooltipPos, setTooltipPos] = useState<{ top: number, left: number } | null>(null);
    const stageRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    // Asegurar que el componente se monta correctamente en el cliente
    useEffect(() => {
        const init = async () => {
            await initializeKonva();
            setKonvaReady(true);
            setIsMounted(true);
        };
        init();
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            const containerWidth = container.offsetWidth;
            setStageSize({
                width: Math.max(containerWidth, designSize.width),
                height: designSize.height,
            });
        });
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, [designSize.width, designSize.height, isMounted]);

    useEffect(() => {
        console.log('🎯 Selection useEffect triggered:', {
            isMounted,
            stageRef: !!stageRef.current,
            trRef: !!trRef.current,
            selectedId,
            tablesCount: tables.length,
            elementsCount: elements.length
        });

        if (!isMounted || !stageRef.current || !trRef.current) {
            console.log('❌ Early return - not ready for selection');
            return;
        }

        if (!selectedId) {
            console.log('🚫 No selection - clearing transformer');
            setTooltipPos(null);
            trRef.current.nodes([]);
            return;
        }

        console.log('🔍 Looking for node with ID:', selectedId);
        const selectedNode = stageRef.current.findOne('#' + selectedId);
        if (selectedNode) {
            console.log('✅ Found selected node:', selectedId);
            trRef.current.nodes([selectedNode]);

            // Configurar transformer basado en el tipo de forma seleccionada
            const allItems = [...tables, ...elements];
            const selectedItem = allItems.find(item => item.id === selectedId);
            console.log('📋 Selected item:', selectedItem);

            if (selectedItem && 'shape' in selectedItem && selectedItem.shape === 'circle') {
                console.log('🔵 Configuring transformer for circle');
                // Para círculos, mantener proporción y habilitar solo algunos anchors
                trRef.current.keepRatio(true);
                trRef.current.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
            } else {
                console.log('⬛ Configuring transformer for rectangle/other');
                // Para rectangulos, permitir redimensionamiento libre
                trRef.current.keepRatio(false);
                trRef.current.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'middle-right', 'bottom-center', 'middle-left']);
            }

            const stageBox = stageRef.current.container().getBoundingClientRect();
            const nodeBox = selectedNode.getClientRect({ relativeTo: stageRef.current });
            const tooltipPosition = {
                top: stageBox.top + window.scrollY + nodeBox.y - 120,
                left: stageBox.left + window.scrollX + nodeBox.x - 50,
            };
            console.log('📍 Setting tooltip position:', tooltipPosition);
            setTooltipPos(tooltipPosition);
        } else {
            console.log('❌ Node not found with ID:', selectedId);
        }
    }, [selectedId, tables, elements, isMounted]);

    const addElement = (type: 'table' | 'bar' | 'staircase', shape: 'rectangle' | 'circle' | null) => {
        console.log('➕ Adding element:', { type, shape });
        const common = { id: `el_${Date.now()}_${Math.random()}`, x: 50, y: 50, rotation: 0 };
        if (type === 'table') {
            const newTable: RestaurantTableData = {
                ...common, type, shape: shape!, width: shape === 'circle' ? 60 : 120, height: 60, fill: '#89CFF0',
                label: `Mesa ${tables.length + 1}`, createdAt: new Date(), updatedAt: new Date(), restaurantDesignId: design!.id,
            };
            console.log('🍽️ New table created:', newTable);
            setTables(prev => [...prev, newTable]);
        } else {
            const newElement = {
                ...common, type, width: 80, height: type === 'staircase' ? 120 : 60,
                fill: type === 'bar' ? '#A0A0A0' : '#D2B48C', shape: type === 'bar' ? 'rectangle' : undefined,
            } as RestaurantElement;
            console.log('🏗️ New element created:', newElement);
            setElements(prev => [...prev, newElement]);
        }
    };

    const deleteSelected = () => {
        console.log('🗑️ Deleting selected:', selectedId);
        if (!selectedId) return;
        setTables(prev => prev.filter(t => t.id !== selectedId));
        setElements(prev => prev.filter(e => e.id !== selectedId));
        setSelectedId(null);
    };

    const updateLabel = (id: string, newLabel: string) => {
        console.log('📝 Updating label for:', id, 'to:', newLabel);
        setTables(prev => prev.map(t => t.id === id ? { ...t, label: newLabel } : t));
    };

    const handleUpdate = (newAttrs: RestaurantTableData | RestaurantElement) => {
        console.log('🔄 Updating element:', newAttrs.id, newAttrs);
        if (newAttrs.type === 'table') {
            setTables(prev => prev.map(t => t.id === newAttrs.id ? newAttrs as RestaurantTableData : t));
        } else {
            setElements(prev => prev.map(e => e.id === newAttrs.id ? newAttrs as RestaurantElement : e));
        }
    }

    const allItems = [...tables, ...elements];
    console.log('📋 All items:', allItems.length, 'tables:', tables.length, 'elements:', elements.length);
    const selectedItem = allItems.find(item => item.id === selectedId);
    console.log('🎯 Currently selected item:', selectedItem);

    const handleMouseDown = (e: any) => {
        console.log('🖱️ Stage mouse down:', e.target);

        // Obtener el objeto clickeado
        const clickedShape = e.target;
        console.log('🎯 Clicked target:', clickedShape);
        console.log('🎯 Target ID:', clickedShape.id ? clickedShape.id() : 'no-id');
        console.log('🎯 Target attrs:', clickedShape.attrs);

        // Buscar si el elemento clickeado o su padre tiene un ID válido
        let targetElement = clickedShape;
        let targetId = null;

        // Intentar obtener ID del elemento clickeado
        if (targetElement.id && typeof targetElement.id === 'function') {
            targetId = targetElement.id();
        }

        // Si no tiene ID, buscar en el padre (Group)
        if (!targetId && targetElement.getParent && targetElement.getParent()) {
            const parent = targetElement.getParent();
            if (parent.id && typeof parent.id === 'function') {
                targetId = parent.id();
                targetElement = parent;
            }
        }

        console.log('🎯 Final target ID:', targetId);

        if (targetId && allItems.find(item => item.id === targetId)) {
            console.log('🎯 Found valid item with ID:', targetId);
            setActiveTool('select');
            setSelectedId(targetId);
            return;
        }

        const clickedOnEmpty = e.target === e.target.getStage();
        console.log('🎯 Clicked on empty:', clickedOnEmpty);
        if (clickedOnEmpty) {
            if (activeTool === 'wall') {
                console.log('🧱 Starting wall drawing');
                setIsDrawing(true);
                const pos = e.target.getStage().getPointerPosition();
                setCurrentWall([pos.x, pos.y, pos.x, pos.y]);
            } else {
                console.log('🚫 Clearing selection');
                setSelectedId(null);
            }
        }
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing || activeTool !== 'wall') return;
        const pos = e.target.getStage().getPointerPosition();
        setCurrentWall(prev => [prev[0], prev[1], pos.x, pos.y]);
    };

    const handleMouseUp = () => {
        if (!isDrawing || activeTool !== 'wall') return;
        console.log('🧱 Finishing wall drawing');
        setIsDrawing(false);
        if (currentWall.length < 4 || (currentWall[0] === currentWall[2] && currentWall[1] === currentWall[3])) {
            setCurrentWall([]);
            return;
        }

        const [x1, y1, x2, y2] = currentWall;
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

        const newWall: RestaurantElement = {
            id: `wall_${Date.now()}`,
            type: 'wall',
            shape: 'rectangle',
            x: x1,
            y: y1,
            width: length,
            height: 5,
            fill: '#333',
            rotation: angle,
        };

        console.log('🧱 New wall created:', newWall);
        setElements((prev) => [...prev, newWall]);
        setCurrentWall([]);
    };

    if (!isMounted || !konvaReady || !KonvaComponents) {
        return <div className="h-96 bg-gray-50 border rounded-lg flex items-center justify-center">Cargando diseñador...</div>;
    }

    const { Stage, Layer, Line, Transformer } = KonvaComponents;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center p-2 border rounded-lg">
                <Button type="button" variant={activeTool === 'select' ? 'secondary' : 'outline'} onClick={() => setActiveTool('select')}><MousePointer className="mr-2 h-4" /> Seleccionar</Button>
                <Button type="button" variant={activeTool === 'wall' ? 'secondary' : 'outline'} onClick={() => setActiveTool('wall')}><Pen className="mr-2 h-4" /> Pared</Button>
                <Popover>
                    <PopoverTrigger asChild><Button type="button" variant="outline"><PlusCircle className="mr-2 h-4" /> Añadir Objeto</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => addElement('table', 'rectangle')} className="flex-col h-auto"><Square className="h-6" /><span className="text-xs">Mesa</span></Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('table', 'circle')} className="flex-col h-auto"><CircleIcon className="h-6" /><span className="text-xs">Mesa Red.</span></Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('bar', 'rectangle')} className="flex-col h-auto"><MinusSquare className="h-6" /><span className="text-xs">Barra</span></Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('staircase', null)} className="flex-col h-auto"><ChevronsUp className="h-6" /><span className="text-xs">Escalera</span></Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <AlertDialog>
                    <AlertDialogTrigger asChild><Button type="button" variant="outline" disabled={!tables.length && !elements.length}><Trash2 className="mr-2 h-4" /> Limpiar</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará todo el diseño.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { setElements([]); setTables([]); }}>Confirmar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            {tooltipPos && selectedItem && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background border shadow-lg" style={{ position: 'absolute', top: tooltipPos.top, left: tooltipPos.left, zIndex: 10 }}>
                    {selectedItem.type === 'table' && (
                        <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            <Input type="text" value={selectedItem.label} onChange={(e) => updateLabel(selectedId!, e.target.value)} className="h-8 w-24" placeholder="Nombre" />
                        </div>
                    )}
                    {'fill' in selectedItem && <input type="color" value={selectedItem.fill || '#000'} onChange={(e) => handleUpdate({ ...selectedItem, fill: e.target.value } as any)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />}
                    <Button type="button" variant="ghost" size="icon" onClick={deleteSelected} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
            )}
            <div ref={containerRef} className="bg-gray-50 border rounded-lg overflow-x-auto relative mt-4" style={{ cursor: activeTool === 'wall' ? 'crosshair' : 'default' }}>
                <Stage
                    width={stageSize.width}
                    height={stageSize.height}
                    ref={stageRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <Layer>
                        {allItems.map((item) => {
                            console.log('🎨 Rendering item:', item.id, item.type, 'shape' in item ? item.shape : 'no-shape');
                            return (
                                <Shape key={item.id} shapeProps={item}
                                    onSelect={() => {
                                        console.log(`🎯 Item selected: ${item.id} ${item.type}`);
                                        setActiveTool('select');
                                        setSelectedId(item.id);
                                    }}
                                    onChange={handleUpdate}
                                />
                            );
                        })}
                        {isDrawing && <Line points={currentWall} stroke="#333" strokeWidth={5} />}
                        <Transformer
                            ref={trRef}
                            boundBoxFunc={(oldBox: any, newBox: any) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)}
                            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                            rotateAnchorOffset={50}
                            anchorSize={14}
                            anchorFill={'#4F46E5'}
                            anchorStroke={'#312E81'}
                            anchorStrokeWidth={2}
                            anchorCornerRadius={3}
                            borderStroke={'#4F46E5'}
                            borderStrokeWidth={2}
                            borderDash={[4, 4]}
                            keepRatio={false}
                            centeredScaling={false}
                            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'middle-right', 'bottom-center', 'middle-left']}
                            ignoreStroke={true}
                            flipEnabled={false}
                        />
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}

export function RestaurantDesignView({ config, design }: {
    config: RestaurantConfigData | null;
    design: RestaurantDesignData | null;
}) {
    const [tables, setTables] = useState<RestaurantTableData[]>((design?.tables || []).map(t => ({ ...t, type: 'table' })));
    const [elements, setElements] = useState<RestaurantElement[]>(design?.elements || []);
    const [state, formAction] = useActionState(saveRestaurantDesign, initialState);

    const designSize = {
        width: design?.canvasWidth || 800,
        height: design?.canvasHeight || 600,
    };

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
                if (state.tables) {
                    setTables(state.tables.map((t: BaseRestaurantTableData) => ({ ...t, type: 'table' })));
                }
            } else {
                toast.error(state.message || 'Error desconocido');
            }
        }
    }, [state]);

    return (
        <form action={formAction}>
            <Card>
                <CardHeader><CardTitle>Diseño del Restaurante</CardTitle></CardHeader>
                <CardContent>
                    {!config ? (<div className="text-center py-8"><p>Guarda la configuración para empezar.</p></div>) : (
                        <div>
                            <input type="hidden" name="restaurantConfigId" value={config.id} />
                            <input type="hidden" name="tables" value={JSON.stringify(tables.map(({ type, ...rest }) => rest))} />
                            <input type="hidden" name="elements" value={JSON.stringify(elements)} />
                            <input type="hidden" name="canvasWidth" value={designSize.width} />
                            <input type="hidden" name="canvasHeight" value={designSize.height} />

                            <DesignCanvas
                                config={config}
                                design={design}
                                tables={tables}
                                setTables={setTables}
                                elements={elements}
                                setElements={setElements}
                            />
                        </div>
                    )}
                </CardContent>
                {config && (
                    <CardFooter className="flex justify-end gap-4 items-center">
                        <SubmitButton />
                    </CardFooter>
                )}
            </Card>
        </form>
    );
} 