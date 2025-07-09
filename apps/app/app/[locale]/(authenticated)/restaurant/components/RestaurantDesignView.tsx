'use client';

import { useState, useRef, useEffect, type FC, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Stage, Layer, Rect, Circle, Transformer, Line, Group, Text } from 'react-konva';
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
import Konva from 'konva';

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

const Staircase: FC<{ width: number; height: number; fill: string; }> = ({ width, height, fill }) => {
    const stepCount = 5;
    const stepHeight = height / stepCount;
    return (
        <Group>
            <Rect width={width} height={height} stroke="#333" strokeWidth={1} fill={fill} />
            {Array.from({ length: stepCount - 1 }).map((_, i) => (
                <Line key={i} points={[0, (i + 1) * stepHeight, width, (i + 1) * stepHeight]} stroke="#333" strokeWidth={0.5} />
            ))}
            <Text text="Escalera" fontSize={12} fill="#333" width={width} align="center" verticalAlign="middle" listening={false} />
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

    const handleTransformEnd = () => {
        const node = shapeRef.current;
        if (!node) return;
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

    let component;
    const label = 'label' in shapeProps ? shapeProps.label : null;
    const width = 'width' in shapeProps ? shapeProps.width : 50;
    const height = 'height' in shapeProps ? shapeProps.height : 50;
    const fill = 'fill' in shapeProps ? shapeProps.fill : '#ccc';

    switch (shapeProps.type) {
        case 'staircase':
            component = <Staircase width={width} height={height} fill={fill} />;
            break;
        case 'wall':
        case 'bar':
        case 'table':
            if ('shape' in shapeProps) {
                if (shapeProps.shape === 'rectangle' || shapeProps.shape === 'square') {
                    component = <Rect width={width} height={height} fill={fill} />;
                } else {
                    component = <Circle radius={width / 2} fill={fill} />;
                }
            }
            break;
        default: return null;
    }

    return (
        <Group
            ref={shapeRef} id={shapeProps.id} x={(shapeProps as any).x || 0} y={(shapeProps as any).y || 0}
            rotation={(shapeProps as any).rotation || 0} draggable onClick={onSelect} onTap={onSelect}
            onDragEnd={(e) => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() } as any)}
            onTransformEnd={handleTransformEnd}
        >
            {component}
            {label && (
                <Text text={label} fontSize={14} fill="#333" width={width} height={height} align="center" verticalAlign="middle" listening={false} />
            )}
        </Group>
    );
};

export function RestaurantDesignView({ config, design }: {
    config: RestaurantConfigData | null;
    design: RestaurantDesignData | null;
}) {
    const [tables, setTables] = useState<RestaurantTableData[]>((design?.tables || []).map(t => ({ ...t, type: 'table' })));
    const [elements, setElements] = useState<RestaurantElement[]>(design?.elements || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<'select' | 'wall'>('select');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentWall, setCurrentWall] = useState<number[]>([]);
    const [state, formAction] = useActionState(saveRestaurantDesign, initialState);

    const designSize = {
        width: design?.canvasWidth || 800,
        height: design?.canvasHeight || 600,
    };
    const [stageSize, setStageSize] = useState(designSize);
    const containerRef = useRef<HTMLDivElement>(null);

    const [tooltipPos, setTooltipPos] = useState<{ top: number, left: number } | null>(null);
    const stageRef = useRef<any>(null);
    const trRef = useRef<any>(null);

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

    useEffect(() => {
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
    }, [designSize.width, designSize.height]);

    useEffect(() => {
        if (!selectedId) {
            setTooltipPos(null);
            trRef.current?.nodes([]); return;
        }
        const selectedNode = stageRef.current?.findOne('#' + selectedId);
        if (selectedNode) {
            trRef.current?.nodes([selectedNode]);
            const stageBox = stageRef.current.container().getBoundingClientRect();
            const nodeBox = selectedNode.getClientRect({ relativeTo: stageRef.current });
            setTooltipPos({
                top: stageBox.top + window.scrollY + nodeBox.y - 120,
                left: stageBox.left + window.scrollX + nodeBox.x - 50,
            });
        }
    }, [selectedId, tables, elements]);

    const addElement = (type: 'table' | 'bar' | 'staircase', shape: 'rectangle' | 'circle' | null) => {
        const common = { id: `el_${Date.now()}_${Math.random()}`, x: 50, y: 50, rotation: 0 };
        if (type === 'table') {
            const newTable: RestaurantTableData = {
                ...common, type, shape: shape!, width: shape === 'circle' ? 60 : 120, height: 60, fill: '#89CFF0',
                label: `Mesa ${tables.length + 1}`, createdAt: new Date(), updatedAt: new Date(), restaurantDesignId: design!.id,
            };
            setTables(prev => [...prev, newTable]);
        } else {
            const newElement = {
                ...common, type, width: 80, height: type === 'staircase' ? 120 : 60,
                fill: type === 'bar' ? '#A0A0A0' : '#D2B48C', shape: type === 'bar' ? 'rectangle' : undefined,
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

    const handleUpdate = (newAttrs: RestaurantTableData | RestaurantElement) => {
        if (newAttrs.type === 'table') {
            setTables(prev => prev.map(t => t.id === newAttrs.id ? newAttrs as RestaurantTableData : t));
        } else {
            setElements(prev => prev.map(e => e.id === newAttrs.id ? newAttrs as RestaurantElement : e));
        }
    }

    const handleMouseDown = (e: any) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            if (activeTool === 'wall') {
                setIsDrawing(true);
                const pos = e.target.getStage().getPointerPosition();
                setCurrentWall([pos.x, pos.y, pos.x, pos.y]);
            } else { setSelectedId(null); }
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

    const allItems = [...tables, ...elements];
    const selectedItem = allItems.find(item => item.id === selectedId);

    return (
        <form action={formAction}>
            <Card>
                <CardHeader><CardTitle>Diseño del Restaurante</CardTitle></CardHeader>
                <CardContent>
                    {!config ? (<div className="text-center py-8"><p>Guarda la configuración para empezar.</p></div>) : (
                        <div className="space-y-4">
                            <input type="hidden" name="restaurantConfigId" value={config.id} />
                            <input type="hidden" name="tables" value={JSON.stringify(tables.map(({ type, ...rest }) => rest))} />
                            <input type="hidden" name="elements" value={JSON.stringify(elements)} />
                            <input type="hidden" name="canvasWidth" value={designSize.width} />
                            <input type="hidden" name="canvasHeight" value={designSize.height} />

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
                                <Stage width={stageSize.width} height={stageSize.height} ref={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                                    <Layer>
                                        {allItems.map((item) => (
                                            <Shape key={item.id} shapeProps={item}
                                                onSelect={() => {
                                                    setActiveTool('select');
                                                    setSelectedId(item.id);
                                                }}
                                                onChange={handleUpdate}
                                            />
                                        ))}
                                        {isDrawing && <Line points={currentWall} stroke="#333" strokeWidth={5} />}
                                        <Transformer
                                            ref={trRef}
                                            boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)}
                                            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                                            rotateAnchorOffset={30}
                                            anchorSize={10}
                                            anchorFill={'#fff'}
                                            anchorStroke={'#666'}
                                            anchorStrokeWidth={1}
                                            borderStroke={'#666'}
                                            borderDash={[3, 3]}
                                        />
                                    </Layer>
                                </Stage>
                            </div>
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