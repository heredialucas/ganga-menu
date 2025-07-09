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
    const [konvaReady, setKonvaReady] = useState(false);

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
            }
        } else {
            trRef.current.nodes([]);
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

    if (!konvaReady) {
        return <div className="h-96 bg-gray-50 border rounded-lg flex items-center justify-center">Cargando diseñador...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center p-2 border rounded-lg">
                <Button type="button" variant={activeTool === 'select' ? 'secondary' : 'outline'} onClick={() => setActiveTool('select')}>
                    <MousePointer className="mr-2 h-4" /> Seleccionar
                </Button>
                <Button type="button" variant={activeTool === 'wall' ? 'secondary' : 'outline'} onClick={() => setActiveTool('wall')}>
                    <Pen className="mr-2 h-4" /> Pared
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline">
                            <PlusCircle className="mr-2 h-4" /> Añadir Objeto
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => addElement('table', 'rectangle')} className="flex-col h-auto">
                                <Square className="h-6" />
                                <span className="text-xs">Mesa</span>
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('table', 'circle')} className="flex-col h-auto">
                                <CircleIcon className="h-6" />
                                <span className="text-xs">Mesa Red.</span>
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('bar', 'rectangle')} className="flex-col h-auto">
                                <MinusSquare className="h-6" />
                                <span className="text-xs">Barra</span>
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => addElement('staircase', null)} className="flex-col h-auto">
                                <ChevronsUp className="h-6" />
                                <span className="text-xs">Escalera</span>
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button type="button" variant="outline" onClick={deleteSelected} disabled={!selectedId}>
                    <Trash2 className="mr-2 h-4" /> Eliminar
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="outline" disabled={!tables.length && !elements.length}>
                            <Trash2 className="mr-2 h-4" /> Limpiar
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará todo el diseño.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { setElements([]); setTables([]); setSelectedId(null); }}>
                                Confirmar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div ref={containerRef} className="bg-gray-50 border rounded-lg overflow-x-auto relative mt-4" style={{ cursor: activeTool === 'wall' ? 'crosshair' : 'default' }}>
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
                    {!config ? (
                        <div className="text-center py-8">
                            <p>Guarda la configuración para empezar.</p>
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