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
import { saveRestaurantDesign } from '../../actions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { RestaurantDesignData, RestaurantTableData as BaseRestaurantTableData, RestaurantElement, SaveDesignResult, TemporaryRestaurantTableData } from '@repo/data-services/src/services/restaurantDesignService';
import type { Dictionary } from '@repo/internationalization';

// Tipo local para mesas temporales (sin restaurantDesignId requerido)
type LocalRestaurantTableData = {
    id: string;
    type: 'table';
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    shape: string;
    fill: string;
    createdAt: Date;
    updatedAt: Date;
    restaurantDesignId?: string;
};

const initialState: SaveDesignResult = {
    success: false,
    message: '',
    tables: undefined,
};

function SubmitButton({ dictionary }: { dictionary: Dictionary }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto text-xs sm:text-sm">
            {pending ? <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline">
                {pending ? dictionary.app.restaurant.design.savingDesign : dictionary.app.restaurant.design.saveDesign}
            </span>
            <span className="sm:hidden">
                {pending ? dictionary.app.restaurant.design.savingDesign : dictionary.app.restaurant.design.saveDesign}
            </span>
        </Button>
    );
}

// Dynamic import para Konva
let Stage: any, Layer: any, Rect: any, Circle: any, Transformer: any, Line: any, Group: any, Text: any;

const initializeKonva = async () => {
    if (typeof window !== 'undefined') {
        try {
            const konva = await import('react-konva');
            Stage = konva.Stage;
            Layer = konva.Layer;
            Rect = konva.Rect;
            Circle = konva.Circle;
            Transformer = konva.Transformer;
            Line = konva.Line;
            Group = konva.Group;
            Text = konva.Text;
            console.log('Konva components loaded:', { Stage, Layer, Rect, Circle, Transformer, Line, Group, Text });
            return true;
        } catch (error) {
            console.error('Error loading Konva:', error);
            return false;
        }
    }
    return false;
};

// Componente individual para cada elemento
interface ElementProps {
    element: LocalRestaurantTableData | RestaurantElement;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (attrs: any) => void;
}

const KonvaElement: FC<ElementProps & { canEdit?: boolean }> = ({ element, isSelected, onSelect, onChange, canEdit = true }) => {
    const shapeRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && shapeRef.current) {
            // El transformer será manejado por el componente padre
        }
    }, [isSelected]);

    const handleDragEnd = (e: any) => {
        if (!canEdit) return; // No permitir arrastrar si no puede editar
        const node = e.target;
        onChange({
            ...element,
            x: node.x(),
            y: node.y(),
        });
    };

    const handleTransformEnd = (e: any) => {
        if (!canEdit) return; // No permitir transformar si no puede editar
        const node = shapeRef.current;
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();

        // Reset scale
        node.scaleX(1);
        node.scaleY(1);

        const width = 'width' in element ? element.width : 50;
        const height = 'height' in element ? element.height : 50;

        let newWidth = Math.max(10, width * scaleX);
        let newHeight = Math.max(10, height * scaleY);

        // Para círculos, mantener proporción
        if ('shape' in element && element.shape === 'circle') {
            const diameter = Math.max(newWidth, newHeight);
            newWidth = diameter;
            newHeight = diameter;
        }

        onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            rotation: rotation,
            width: newWidth,
            height: newHeight,
        });
    };

    const handleClick = () => {
        if (!canEdit) return; // No permitir seleccionar si no puede editar
        console.log('Element clicked:', element.id);
        onSelect();
    };

    // Propiedades comunes
    const commonProps = {
        ref: shapeRef,
        id: element.id,
        x: element.x || 0,
        y: element.y || 0,
        rotation: element.rotation || 0,
        draggable: canEdit, // Solo arrastrable si puede editar
        onClick: handleClick,
        onTap: handleClick,
        onDragEnd: handleDragEnd,
        onTransformEnd: handleTransformEnd,
        strokeWidth: isSelected ? 2 : 1,
        stroke: isSelected ? '#4F46E5' : '#333',
        opacity: canEdit ? 0.9 : 0.6, // Más opaco si no puede editar
    };

    console.log('KonvaElement props for', element.id, ':', { id: element.id, x: element.x, y: element.y, isSelected });

    const width = 'width' in element ? element.width : 50;
    const height = 'height' in element ? element.height : 50;
    const fill = 'fill' in element ? element.fill : '#ccc';
    const label = 'label' in element ? element.label : null;

    if (element.type === 'staircase') {
        return (
            <Group {...commonProps}>
                <Rect
                    width={width}
                    height={height}
                    fill={fill}
                />
                {/* Líneas de escalera */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <Line
                        key={i}
                        points={[0, (i + 1) * (height / 5), width, (i + 1) * (height / 5)]}
                        stroke="#333"
                        strokeWidth={0.5}
                        listening={false}
                    />
                ))}
                <Text
                    text="Escalera"
                    fontSize={12}
                    fill="#333"
                    width={width}
                    height={height}
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                />
            </Group>
        );
    }

    if ('shape' in element && element.shape === 'circle') {
        return (
            <Group {...commonProps}>
                <Circle
                    radius={width / 2}
                    fill={fill}
                />
                {label && (
                    <Text
                        text={label}
                        fontSize={14}
                        fill="#333"
                        x={-width / 2}
                        y={-7}
                        width={width}
                        align="center"
                        listening={false}
                    />
                )}
            </Group>
        );
    }

    // Rectángulos (mesas, barras, paredes)
    return (
        <Group {...commonProps}>
            <Rect
                width={width}
                height={height}
                fill={fill}
            />
            {label && (
                <Text
                    text={label}
                    fontSize={14}
                    fill="#333"
                    width={width}
                    height={height}
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                />
            )}
        </Group>
    );
};

function DesignCanvas({ config, design, tables, setTables, elements, setElements, dictionary, canEdit = true, canView = true }: {
    config: RestaurantConfigData;
    design: RestaurantDesignData | null;
    tables: LocalRestaurantTableData[];
    setTables: React.Dispatch<React.SetStateAction<LocalRestaurantTableData[]>>;
    elements: RestaurantElement[];
    setElements: React.Dispatch<React.SetStateAction<RestaurantElement[]>>;
    dictionary: Dictionary;
    canEdit?: boolean;
    canView?: boolean;
}) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<'select' | 'wall'>('select');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentWall, setCurrentWall] = useState<number[]>([]);
    const [konvaReady, setKonvaReady] = useState(false);
    const [tooltipPos, setTooltipPos] = useState<{ top: number, left: number } | null>(null);

    const stageRef = useRef<any>(null);
    const layerRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    const designSize = {
        width: design?.canvasWidth || 800,
        height: design?.canvasHeight || 600,
    };

    const [stageSize, setStageSize] = useState(designSize);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('Initializing Konva...');
        initializeKonva().then((ready) => {
            console.log('Konva initialization result:', ready);
            setKonvaReady(ready);
        });
    }, []);

    useEffect(() => {
        if (!konvaReady) return;
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
    }, [designSize.width, designSize.height, konvaReady]);

    // Manejo del transformer
    useEffect(() => {
        console.log('Transformer effect - konvaReady:', konvaReady, 'selectedId:', selectedId, 'trRef:', !!trRef.current);
        if (!konvaReady || !trRef.current) return;

        if (selectedId) {
            const selectedNode = layerRef.current?.findOne(`#${selectedId}`);
            console.log('Selected node:', selectedNode, 'for ID:', selectedId);
            if (selectedNode) {
                console.log('Applying transformer to node:', selectedNode);
                trRef.current.nodes([selectedNode]);
                layerRef.current?.batchDraw();

                // Configurar posición del tooltip
                const stageBox = stageRef.current.container().getBoundingClientRect();
                const nodeBox = selectedNode.getClientRect({ relativeTo: stageRef.current });
                const tooltipPosition = {
                    top: stageBox.top + window.scrollY + nodeBox.y - 120,
                    left: stageBox.left + window.scrollX + nodeBox.x - 50,
                };
                setTooltipPos(tooltipPosition);
            } else {
                console.log('Node not found for ID:', selectedId);
                console.log('Available nodes in layer:', layerRef.current?.children);
            }
        } else {
            console.log('Clearing transformer');
            trRef.current.nodes([]);
            setTooltipPos(null);
        }
    }, [selectedId, konvaReady]);

    const allItems = [...tables, ...elements];

    const handleStageClick = (e: any) => {
        if (!canEdit) return; // No permitir interacciones si no puede editar

        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            if (activeTool === 'wall') {
                setIsDrawing(true);
                const pos = e.target.getStage().getPointerPosition();
                setCurrentWall([pos.x, pos.y, pos.x, pos.y]);
            } else {
                setSelectedId(null);
            }
        }
    };

    const handleMouseMove = (e: any) => {
        if (!canEdit || !isDrawing || activeTool !== 'wall') return;
        const pos = e.target.getStage().getPointerPosition();
        setCurrentWall(prev => [prev[0], prev[1], pos.x, pos.y]);
    };

    const handleMouseUp = () => {
        if (!canEdit || !isDrawing || activeTool !== 'wall') return;
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

        setElements((prev) => [...prev, newWall]);
        setCurrentWall([]);
    };

    const handleElementChange = (newAttrs: any) => {
        console.log('Element change:', newAttrs);
        if (newAttrs.type === 'table') {
            setTables(prev => prev.map(t => t.id === newAttrs.id ? newAttrs : t));
        } else {
            setElements(prev => prev.map(e => e.id === newAttrs.id ? newAttrs : e));
        }
    };

    const addElement = (type: 'table' | 'bar' | 'staircase', shape: 'rectangle' | 'circle' | null) => {
        if (!canEdit) {
            toast.error(dictionary.app.restaurant.design.noEditPermission || 'No tienes permisos para editar el diseño del restaurante');
            return;
        }
        const common = { id: `el_${Date.now()}_${Math.random()}`, x: 50, y: 50, rotation: 0 };

        if (type === 'table') {
            const newTable: LocalRestaurantTableData = {
                ...common,
                type,
                shape: shape!,
                width: shape === 'circle' ? 60 : 120,
                height: 60,
                fill: '#89CFF0',
                label: `Mesa ${tables.length + 1}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Solo asignar restaurantDesignId si el diseño existe
                ...(design?.id && { restaurantDesignId: design.id }),
            };
            console.log('Creating new table:', newTable);
            setTables(prev => [...prev, newTable]);
        } else {
            const newElement = {
                ...common,
                type,
                width: 80,
                height: type === 'staircase' ? 120 : 60,
                fill: type === 'bar' ? '#A0A0A0' : '#D2B48C',
                shape: type === 'bar' ? 'rectangle' : undefined,
            } as RestaurantElement;
            setElements(prev => [...prev, newElement]);
        }
    };

    const deleteSelected = () => {
        if (!canEdit) {
            toast.error(dictionary.app.restaurant.design.noEditPermission || 'No tienes permisos para editar el diseño del restaurante');
            return;
        }
        if (!selectedId) return;
        setTables(prev => prev.filter(t => t.id !== selectedId));
        setElements(prev => prev.filter(e => e.id !== selectedId));
        setSelectedId(null);
    };

    const updateLabel = (id: string, newLabel: string) => {
        if (!canEdit) {
            toast.error(dictionary.app.restaurant.design.noEditPermission || 'No tienes permisos para editar el diseño del restaurante');
            return;
        }
        setTables(prev => prev.map(t => t.id === id ? { ...t, label: newLabel } : t));
    };

    const updateColor = (id: string, newColor: string) => {
        if (!canEdit) {
            toast.error(dictionary.app.restaurant.design.noEditPermission || 'No tienes permisos para editar el diseño del restaurante');
            return;
        }
        const allItems = [...tables, ...elements];
        const item = allItems.find(item => item.id === id);
        if (!item) return;

        if (item.type === 'table') {
            setTables(prev => prev.map(t => t.id === id ? { ...t, fill: newColor } : t));
        } else {
            setElements(prev => prev.map(e => e.id === id ? { ...e, fill: newColor } : e));
        }
    };

    if (!konvaReady || !Stage || !Layer || !Rect || !Circle || !Transformer || !Line || !Group || !Text) {
        console.log('Konva not ready:', { konvaReady, Stage, Layer, Rect, Circle, Transformer, Line, Group, Text });
        return <div className="h-96 bg-gray-50 border rounded-lg flex items-center justify-center">{dictionary.app.restaurant.design.loading}</div>;
    }

    return (
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {canEdit && (
                <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-4 items-center p-2 sm:p-3 border rounded-lg">
                    <Button type="button" variant={activeTool === 'select' ? 'secondary' : 'outline'} onClick={() => setActiveTool('select')} className="text-xs sm:text-sm">
                        <MousePointer className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{dictionary.app.restaurant.design.tools.select.desktop}</span>
                        <span className="sm:hidden">{dictionary.app.restaurant.design.tools.select.mobile}</span>
                    </Button>
                    <Button type="button" variant={activeTool === 'wall' ? 'secondary' : 'outline'} onClick={() => setActiveTool('wall')} className="text-xs sm:text-sm">
                        <Pen className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{dictionary.app.restaurant.design.tools.wall.desktop}</span>
                        <span className="sm:hidden">{dictionary.app.restaurant.design.tools.wall.mobile}</span>
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline" className="text-xs sm:text-sm">
                                <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">{dictionary.app.restaurant.design.tools.addObject.desktop}</span>
                                <span className="sm:hidden">{dictionary.app.restaurant.design.tools.addObject.mobile}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                            <div className="grid grid-cols-2 sm:flex sm:gap-2">
                                <Button type="button" variant="ghost" onClick={() => addElement('table', 'rectangle')} className="flex-col h-auto text-xs">
                                    <Square className="h-4 w-4 sm:h-6 sm:w-6" />
                                    <span className="text-xs">{dictionary.app.restaurant.design.tools.table}</span>
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => addElement('table', 'circle')} className="flex-col h-auto text-xs">
                                    <CircleIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                                    <span className="text-xs">{dictionary.app.restaurant.design.tools.roundTable}</span>
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => addElement('bar', 'rectangle')} className="flex-col h-auto text-xs">
                                    <MinusSquare className="h-4 w-4 sm:h-6 sm:w-6" />
                                    <span className="text-xs">{dictionary.app.restaurant.design.tools.bar}</span>
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => addElement('staircase', null)} className="flex-col h-auto text-xs">
                                    <ChevronsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                                    <span className="text-xs">{dictionary.app.restaurant.design.tools.staircase}</span>
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button type="button" variant="outline" onClick={deleteSelected} disabled={!selectedId} className="text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]">
                        <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{dictionary.app.restaurant.design.deleteButton}</span>
                        <span className="sm:hidden">{dictionary.app.restaurant.design.deleteButton}</span>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="outline" disabled={!tables.length && !elements.length} className="text-xs sm:text-sm">
                                <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">{dictionary.app.restaurant.design.resetDesign}</span>
                                <span className="sm:hidden">{dictionary.app.restaurant.design.resetDesign}</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-base sm:text-lg">{dictionary.app.restaurant.design.resetDesignConfirmation}</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm sm:text-base">
                                    {dictionary.app.restaurant.design.resetDesignDescription}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="text-xs sm:text-sm">{dictionary.app.restaurant.config.cancel}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                    if (canEdit) {
                                        setElements([]);
                                        setTables([]);
                                        setSelectedId(null);
                                    }
                                }} className="text-xs sm:text-sm">
                                    {dictionary.app.restaurant.design.confirmReset}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {tooltipPos && selectedId && (() => {
                const allItems = [...tables, ...elements];
                const selectedItem = allItems.find(item => item.id === selectedId);
                if (!selectedItem) return null;

                return (
                    <div
                        className="flex items-center gap-2 p-2 rounded-lg bg-background border shadow-lg z-50"
                        style={{
                            position: 'absolute',
                            top: tooltipPos.top,
                            left: tooltipPos.left,
                            zIndex: 50
                        }}
                    >
                        {selectedItem.type === 'table' && 'label' in selectedItem && (
                            <div className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                <Input
                                    type="text"
                                    value={selectedItem.label || ''}
                                    onChange={(e) => updateLabel(selectedId, e.target.value)}
                                    className="h-8 w-24"
                                    placeholder="Nombre"
                                />
                            </div>
                        )}
                        {'fill' in selectedItem && (
                            <input
                                type="color"
                                value={selectedItem.fill || '#000'}
                                onChange={(e) => updateColor(selectedId, e.target.value)}
                                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                                title="Cambiar color"
                            />
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={deleteSelected}
                            className="text-destructive hover:text-destructive/80"
                            title={dictionary.app.restaurant.design.deleteElement}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            })()}

            <div ref={containerRef} className="bg-gray-50 border rounded-lg overflow-x-auto relative mt-3 sm:mt-4" style={{ cursor: activeTool === 'wall' ? 'crosshair' : 'default' }}>
                <Stage
                    width={stageSize.width}
                    height={stageSize.height}
                    ref={stageRef}
                    onClick={handleStageClick}
                    onTap={handleStageClick}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <Layer ref={layerRef}>
                        {allItems.map((item) => {
                            console.log('Rendering item:', item);
                            return (
                                <KonvaElement
                                    key={item.id}
                                    element={item}
                                    isSelected={item.id === selectedId}
                                    onSelect={() => {
                                        console.log('Selecting item:', item.id);
                                        setSelectedId(item.id);
                                    }}
                                    onChange={handleElementChange}
                                    canEdit={canEdit}
                                />
                            );
                        })}

                        {isDrawing && <Line points={currentWall} stroke="#333" strokeWidth={5} listening={false} />}

                        {canEdit && (
                            <Transformer
                                ref={trRef}
                                rotateEnabled={true}
                                rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                                rotateAnchorOffset={60}
                                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'middle-right', 'bottom-center', 'middle-left']}
                                boundBoxFunc={(oldBox: any, newBox: any) => {
                                    if (newBox.width < 5 || newBox.height < 5) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                                anchorSize={20}
                                borderStroke="#4F46E5"
                                borderStrokeWidth={2}
                                anchorStroke="#4F46E5"
                                anchorFill="white"
                                anchorStrokeWidth={2}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}

interface DesignManagerClientProps {
    config: RestaurantConfigData | null;
    design: RestaurantDesignData | null;
    dictionary: Dictionary;
    canEdit?: boolean;
    canView?: boolean;
}

export function DesignManagerClient({ config, design, dictionary, canEdit = true, canView = true }: DesignManagerClientProps) {
    const [tables, setTables] = useState<LocalRestaurantTableData[]>((design?.tables || []).map(t => ({ ...t, type: 'table' })));
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
                toast.error(state.message || dictionary.app.restaurant.design.toast.error);
            }
        }
    }, [state, dictionary.app.restaurant.design.toast.error]);

    if (!canView) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">{dictionary.app.restaurant.design.toast.error}</p>
            </div>
        );
    }

    return (
        <form action={formAction}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{dictionary.app.restaurant.design.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-2 md:p-6">
                    {!canEdit && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md mb-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                {dictionary.app.restaurant.design.readOnlyDescription || 'Modo solo lectura: Puedes ver el diseño pero no modificarlo.'}
                            </p>
                        </div>
                    )}
                    {!config ? (
                        <div className="text-center py-6 sm:py-8">
                            <p className="text-sm sm:text-base">{dictionary.app.restaurant.view.noConfig}</p>
                        </div>
                    ) : (
                        <div>
                            <input type="hidden" name="restaurantConfigId" value={config.id} />
                            <input type="hidden" name="tables" value={JSON.stringify(tables.map(({ type, restaurantDesignId, ...rest }) => rest))} />
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
                                dictionary={dictionary}
                                canEdit={canEdit}
                                canView={canView}
                            />
                        </div>
                    )}
                </CardContent>
                {config && canEdit && (
                    <CardFooter className="flex justify-center sm:justify-end gap-2 sm:gap-4 items-center">
                        <SubmitButton dictionary={dictionary} />
                    </CardFooter>
                )}
            </Card>
        </form>
    );
} 