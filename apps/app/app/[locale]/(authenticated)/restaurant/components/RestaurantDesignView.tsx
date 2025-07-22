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
import type { Dictionary } from '@repo/internationalization';

type RestaurantTableData = BaseRestaurantTableData & { type: 'table' };

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
            <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.design?.saveDesign || 'Guardar Diseño'}</span>
            <span className="sm:hidden">{(dictionary as any).app?.restaurant?.design?.savingDesign || 'Guardando...'}</span>
        </Button>
    );
}

// Dynamic import para Konva
let Stage: any, Layer: any, Rect: any, Circle: any, Transformer: any, Line: any, Group: any, Text: any;

const initializeKonva = async () => {
    if (typeof window !== 'undefined') {
        const konva = await import('react-konva');
        Stage = konva.Stage;
        Layer = konva.Layer;
        Rect = konva.Rect;
        Circle = konva.Circle;
        Transformer = konva.Transformer;
        Line = konva.Line;
        Group = konva.Group;
        Text = konva.Text;
        return true;
    }
    return false;
};

// Componente individual para cada elemento
interface ElementProps {
    element: RestaurantTableData | RestaurantElement;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (attrs: any) => void;
}

const KonvaElement: FC<ElementProps> = ({ element, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && shapeRef.current) {
            // El transformer será manejado por el componente padre
        }
    }, [isSelected]);

    const handleDragEnd = (e: any) => {
        const node = e.target;
        onChange({
            ...element,
            x: node.x(),
            y: node.y(),
        });
    };

    const handleTransformEnd = (e: any) => {
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
        onSelect();
    };

    // Propiedades comunes
    const commonProps = {
        ref: shapeRef,
        id: element.id,
        x: (element as any).x || 0,
        y: (element as any).y || 0,
        rotation: (element as any).rotation || 0,
        draggable: true,
        onClick: handleClick,
        onTap: handleClick,
        onDragEnd: handleDragEnd,
        onTransformEnd: handleTransformEnd,
        strokeWidth: isSelected ? 2 : 1,
        stroke: isSelected ? '#4F46E5' : '#333',
        opacity: 0.9,
    };

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

function DesignCanvas({ config, design, tables, setTables, elements, setElements, dictionary }: {
    config: RestaurantConfigData;
    design: RestaurantDesignData | null;
    tables: RestaurantTableData[];
    setTables: React.Dispatch<React.SetStateAction<RestaurantTableData[]>>;
    elements: RestaurantElement[];
    setElements: React.Dispatch<React.SetStateAction<RestaurantElement[]>>;
    dictionary: Dictionary;
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
        initializeKonva().then(setKonvaReady);
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
        if (!konvaReady || !trRef.current) return;

        if (selectedId) {
            const selectedNode = layerRef.current?.findOne(`#${selectedId}`);
            if (selectedNode) {
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
            }
        } else {
            trRef.current.nodes([]);
            setTooltipPos(null);
        }
    }, [selectedId, konvaReady]);

    const allItems = [...tables, ...elements];

    const handleStageClick = (e: any) => {
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
        if (!isDrawing || activeTool !== 'wall') return;
        const pos = e.target.getStage().getPointerPosition();
        setCurrentWall(prev => [prev[0], prev[1], pos.x, pos.y]);
    };

    const handleMouseUp = () => {
        if (!isDrawing || activeTool !== 'wall') return;
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
        if (newAttrs.type === 'table') {
            setTables(prev => prev.map(t => t.id === newAttrs.id ? newAttrs : t));
        } else {
            setElements(prev => prev.map(e => e.id === newAttrs.id ? newAttrs : e));
        }
    };

    const addElement = (type: 'table' | 'bar' | 'staircase', shape: 'rectangle' | 'circle' | null) => {
        const common = { id: `el_${Date.now()}_${Math.random()}`, x: 50, y: 50, rotation: 0 };

        if (type === 'table') {
            const newTable: RestaurantTableData = {
                ...common,
                type,
                shape: shape!,
                width: shape === 'circle' ? 60 : 120,
                height: 60,
                fill: '#89CFF0',
                label: `Mesa ${tables.length + 1}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                restaurantDesignId: design!.id,
            };
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
        if (!selectedId) return;
        setTables(prev => prev.filter(t => t.id !== selectedId));
        setElements(prev => prev.filter(e => e.id !== selectedId));
        setSelectedId(null);
    };

    const updateLabel = (id: string, newLabel: string) => {
        setTables(prev => prev.map(t => t.id === id ? { ...t, label: newLabel } : t));
    };

    const updateColor = (id: string, newColor: string) => {
        const allItems = [...tables, ...elements];
        const item = allItems.find(item => item.id === id);
        if (!item) return;

        if (item.type === 'table') {
            setTables(prev => prev.map(t => t.id === id ? { ...t, fill: newColor } : t));
        } else {
            setElements(prev => prev.map(e => e.id === id ? { ...e, fill: newColor } : e));
        }
    };

    if (!konvaReady) {
        return <div className="h-96 bg-gray-50 border rounded-lg flex items-center justify-center">{(dictionary as any).app?.restaurant?.design?.loading || 'Cargando diseñador...'}</div>;
    }

    return (
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-4 items-center p-2 sm:p-3 border rounded-lg">
                <Button type="button" variant={activeTool === 'select' ? 'secondary' : 'outline'} onClick={() => setActiveTool('select')} className="text-xs sm:text-sm">
                    <MousePointer className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.design?.tools?.select?.desktop || 'Seleccionar'}</span>
                    <span className="sm:hidden">{(dictionary as any).app?.restaurant?.design?.tools?.select?.mobile || 'Sel'}</span>
                </Button>
                <Button type="button" variant={activeTool === 'wall' ? 'secondary' : 'outline'} onClick={() => setActiveTool('wall')} className="text-xs sm:text-sm">
                    <Pen className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.design?.tools?.wall?.desktop || 'Pared'}</span>
                    <span className="sm:hidden">{(dictionary as any).app?.restaurant?.design?.tools?.wall?.mobile || 'Pared'}</span>
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="text-xs sm:text-sm">
                            <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.design?.tools?.addObject?.desktop || 'Añadir Objeto'}</span>
                            <span className="sm:hidden">{(dictionary as any).app?.restaurant?.design?.tools?.addObject?.mobile || 'Añadir'}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-2 sm:flex sm:gap-2">
                            <Button type="button" variant="ghost" onClick={() => addElement('table', 'rectangle')} className="flex-col h-auto text-xs">
                                <Square className="h-4 w-4 sm:h-6 sm:w-6" />
                                <span className="text-xs">{(dictionary as any).app?.restaurant?.design?.tools?.table || 'Mesa'}</span>
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('table', 'circle')} className="flex-col h-auto text-xs">
                                <CircleIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                                <span className="text-xs">{(dictionary as any).app?.restaurant?.design?.tools?.roundTable || 'Mesa Red.'}</span>
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('bar', 'rectangle')} className="flex-col h-auto text-xs">
                                <MinusSquare className="h-4 w-4 sm:h-6 sm:w-6" />
                                <span className="text-xs">{(dictionary as any).app?.restaurant?.design?.tools?.bar || 'Barra'}</span>
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('staircase', null)} className="flex-col h-auto text-xs">
                                <ChevronsUp className="h-4 w-4 sm:h-6 sm:w-6" />
                                <span className="text-xs">{(dictionary as any).app?.restaurant?.design?.tools?.staircase || 'Escalera'}</span>
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button type="button" variant="outline" onClick={deleteSelected} disabled={!selectedId} className="text-xs sm:text-sm min-w-[80px] sm:min-w-[100px]">
                    <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.design?.deleteButton || 'Eliminar'}</span>
                    <span className="sm:hidden">{(dictionary as any).app?.restaurant?.design?.deleteButton || 'Elim'}</span>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="outline" disabled={!tables.length && !elements.length} className="text-xs sm:text-sm">
                            <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">{(dictionary as any).app?.restaurant?.design?.resetDesign || 'Limpiar'}</span>
                            <span className="sm:hidden">{(dictionary as any).app?.restaurant?.design?.resetDesign || 'Limpiar'}</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-base sm:text-lg">{(dictionary as any).app?.restaurant?.design?.resetDesignConfirmation || '¿Estás seguro?'}</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm sm:text-base">
                                {(dictionary as any).app?.restaurant?.design?.resetDesignDescription || 'Esta acción no se puede deshacer. Se eliminará todo el diseño.'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="text-xs sm:text-sm">{(dictionary as any).app?.restaurant?.config?.cancel || 'Cancelar'}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { setElements([]); setTables([]); setSelectedId(null); }} className="text-xs sm:text-sm">
                                {(dictionary as any).app?.restaurant?.design?.confirmReset || 'Confirmar'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

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
                            title={(dictionary as any).app?.restaurant?.design?.deleteElement || 'Eliminar elemento'}
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
                        {allItems.map((item) => (
                            <KonvaElement
                                key={item.id}
                                element={item}
                                isSelected={item.id === selectedId}
                                onSelect={() => setSelectedId(item.id)}
                                onChange={handleElementChange}
                            />
                        ))}

                        {isDrawing && <Line points={currentWall} stroke="#333" strokeWidth={5} listening={false} />}

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
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}

export function RestaurantDesignView({ config, design, dictionary }: {
    config: RestaurantConfigData | null;
    design: RestaurantDesignData | null;
    dictionary: Dictionary;
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
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">{(dictionary as any).app?.restaurant?.design?.title || 'Diseño del Restaurante'}</CardTitle>
                </CardHeader>
                <CardContent className="p-1 sm:p-2 md:p-6">
                    {!config ? (
                        <div className="text-center py-6 sm:py-8">
                            <p className="text-sm sm:text-base">{(dictionary as any).app?.restaurant?.view?.noConfig || 'Guarda la configuración para empezar.'}</p>
                        </div>
                    ) : (
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
                                dictionary={dictionary}
                            />
                        </div>
                    )}
                </CardContent>
                {config && (
                    <CardFooter className="flex justify-center sm:justify-end gap-2 sm:gap-4 items-center">
                        <SubmitButton dictionary={dictionary} />
                    </CardFooter>
                )}
            </Card>
        </form>
    );
} 