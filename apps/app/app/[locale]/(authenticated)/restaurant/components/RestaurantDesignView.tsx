'use client';

import { useState, useRef, useEffect, type FC, useTransition } from 'react';
import { Stage, Layer, Rect, Circle, Transformer, Line, Group, Text } from 'react-konva';
import { toast } from 'sonner';
import { useActionState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/design-system/components/ui/card';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@repo/design-system/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/components/ui/popover';
import { PlusCircle, Save, Square, Circle as CircleIcon, MinusSquare, Pen, Trash2, MousePointer, Loader2, ChevronsUp } from 'lucide-react';
import { saveRestaurantDesign } from '../actions';
import type { RestaurantConfigData } from '@repo/data-services/src/services/restaurantConfigService';
import type { RestaurantElement } from '@repo/data-services/src/services/restaurantDesignService';
import Konva from 'konva';

type ExtendedRestaurantElement = RestaurantElement;
const initialFormState = { success: false, message: '' };

const Staircase: FC<{ width: number; height: number; fill: string; }> = ({ width, height, fill }) => {
    const stepCount = 5;
    const stepHeight = height / stepCount;
    return (
        <>
            <Rect width={width} height={height} stroke="#333" strokeWidth={1} fill={fill} />
            {Array.from({ length: stepCount - 1 }).map((_, i) => (
                <Line key={i} points={[0, (i + 1) * stepHeight, width, (i + 1) * stepHeight]} stroke="#333" strokeWidth={0.5} />
            ))}
            <Text text="Escalera" fontSize={12} fill="#333" width={width} align="center" verticalAlign="middle" listening={false} />
        </>
    );
};

interface ShapeProps {
    shapeProps: ExtendedRestaurantElement;
    onSelect: () => void;
    onChange: (newAttrs: ExtendedRestaurantElement) => void;
}

const Shape: FC<ShapeProps> = ({ shapeProps, onSelect, onChange }) => {
    const shapeRef = useRef<any>(null);

    if (shapeProps.type === 'wall') {
        return <Line
            id={shapeProps.id}
            points={shapeProps.points}
            stroke={shapeProps.fill}
            strokeWidth={5}
            onClick={onSelect}
            onTap={onSelect}
            draggable
            onDragEnd={(e) => {
                const node = e.target;
                if (!(node instanceof Konva.Line)) return;
                const newPoints = shapeProps.points.map((point, index) => {
                    return index % 2 === 0 ? point + node.x() : point + node.y();
                });
                node.position({ x: 0, y: 0 });
                onChange({ ...shapeProps, points: newPoints });
            }}
            onTransformEnd={(e) => {
                const node = e.target;
                if (!(node instanceof Konva.Line)) return;
                const transform = node.getTransform();
                const points = node.points();
                const newPoints: number[] = [];
                for (let i = 0; i < points.length; i += 2) {
                    const { x, y } = transform.point({ x: points[i], y: points[i + 1] });
                    newPoints.push(x, y);
                }
                node.position({ x: 0, y: 0 });
                node.rotation(0);
                node.scale({ x: 1, y: 1 });
                onChange({ ...shapeProps, points: newPoints });
            }}
        />;
    }

    let component;
    switch (shapeProps.type) {
        case 'staircase':
            component = <Staircase width={shapeProps.width} height={shapeProps.height} fill={shapeProps.fill} />;
            break;
        case 'table':
        case 'bar':
            const { width, height, fill, shape } = shapeProps;
            if (shape === 'rectangle' || shape === 'square') {
                component = <Rect width={width} height={height} fill={fill} />;
            } else {
                component = <Circle radius={width / 2} fill={fill} />;
            }
            break;
        default: return null;
    }

    return (
        <Group
            ref={shapeRef}
            id={shapeProps.id}
            x={shapeProps.x}
            y={shapeProps.y}
            rotation={shapeProps.rotation || 0}
            draggable
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() })}
            onTransformEnd={() => {
                const node = shapeRef.current;
                if (!node) return;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1); node.scaleY(1);
                const newWidth = Math.max(10, shapeProps.width * scaleX);

                onChange({
                    ...shapeProps,
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    width: newWidth,
                    height: (shapeProps.type === 'table' && shapeProps.shape === 'circle') ? newWidth : Math.max(10, shapeProps.height * scaleY),
                });
            }}
        >
            {component}
        </Group>
    );
};

export function RestaurantDesignView({ config, design }: {
    config: RestaurantConfigData | null;
    design: { elements: ExtendedRestaurantElement[] } | null;
}) {
    const [elements, setElements] = useState<ExtendedRestaurantElement[]>(design?.elements || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<'select' | 'wall'>('select');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentWall, setCurrentWall] = useState<number[]>([]);
    const [state, formAction] = useActionState(saveRestaurantDesign, initialFormState);
    const [isPending, startTransition] = useTransition();

    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
    const [tooltipPos, setTooltipPos] = useState<{ top: number, left: number } | null>(null);

    const stageRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    useEffect(() => {
        if (!selectedId) {
            setTooltipPos(null);
            trRef.current?.nodes([]);
            return;
        }

        const selectedNode = stageRef.current?.findOne('#' + selectedId);
        if (selectedNode) {
            trRef.current?.nodes([selectedNode]);
            const stageBox = stageRef.current.container().getBoundingClientRect();
            const nodeBox = selectedNode.getClientRect({ relativeTo: stageRef.current });
            setTooltipPos({
                top: stageBox.top + window.scrollY + nodeBox.y - 60,
                left: stageBox.left + window.scrollX + nodeBox.x + nodeBox.width / 2
            });
        } else {
            trRef.current?.nodes([]);
        }
    }, [selectedId, elements]);


    const addElement = (type: 'table' | 'bar' | 'staircase', shape: 'rectangle' | 'circle' | null) => {
        const common = {
            id: `el_${Date.now()}`, x: 50, y: 50, rotation: 0
        };
        let newElement: ExtendedRestaurantElement;
        if (type === 'staircase') {
            newElement = { ...common, type, width: 80, height: 120, fill: '#D2B48C' };
        } else {
            const isCircle = shape === 'circle';
            newElement = {
                ...common, type, shape: shape!,
                width: isCircle ? 60 : 120,
                height: 60,
                fill: type === 'bar' ? '#A0A0A0' : '#89CFF0',
                name: `Mesa ${elements.filter(e => e.type === 'table').length + 1}`,
                capacity: 4,
            };
            if (isCircle) {
                (newElement as any).height = 60;
            }
        }
        setElements(prev => [...prev, newElement]);
    };

    const deleteSelected = () => {
        if (!selectedId) return;
        setElements(elements.filter(e => e.id !== selectedId));
        setSelectedId(null);
    };

    const handleMouseDown = (e: any) => {
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
        setCurrentWall(prev => [prev[0], prev[1], e.target.getStage().getPointerPosition().x, e.target.getStage().getPointerPosition().y]);
    };

    const handleMouseUp = () => {
        if (!isDrawing || activeTool !== 'wall') return;
        setIsDrawing(false);
        if (currentWall.length < 4 || (currentWall[0] === currentWall[2] && currentWall[1] === currentWall[3])) {
            setCurrentWall([]); return;
        }
        setElements(prev => [...prev, { id: `wall_${Date.now()}`, type: 'wall', points: currentWall, fill: '#333' }]);
        setCurrentWall([]);
    };

    const handleSave = (formData: FormData) => {
        startTransition(() => {
            toast.promise(saveRestaurantDesign(state, formData), {
                loading: 'Guardando diseño...',
                success: (res) => res.message,
                error: (err) => err.message,
            });
        });
    };

    return (
        <Card>
            <CardHeader><CardTitle>Diseño del Restaurante</CardTitle></CardHeader>
            <CardContent>
                {!config ? (<div className="text-center py-8"><p>Guarda la configuración para empezar.</p></div>) : (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-4 items-center p-2 border rounded-lg">
                            <Button variant={activeTool === 'select' ? 'secondary' : 'outline'} onClick={() => setActiveTool('select')}><MousePointer className="mr-2 h-4" /> Seleccionar</Button>
                            <Button variant={activeTool === 'wall' ? 'secondary' : 'outline'} onClick={() => setActiveTool('wall')}><Pen className="mr-2 h-4" /> Pared</Button>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline"><PlusCircle className="mr-2 h-4" /> Añadir Objeto</Button></PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                    <div className="flex gap-2">
                                        <Button variant="ghost" onClick={() => addElement('table', 'rectangle')} className="flex-col h-auto"><Square className="h-6" /><span className="text-xs">Mesa</span></Button>
                                        <Button variant="ghost" onClick={() => addElement('table', 'circle')} className="flex-col h-auto"><CircleIcon className="h-6" /><span className="text-xs">Mesa Red.</span></Button>
                                        <Button variant="ghost" onClick={() => addElement('bar', 'rectangle')} className="flex-col h-auto"><MinusSquare className="h-6" /><span className="text-xs">Barra</span></Button>
                                        <Button variant="ghost" onClick={() => addElement('staircase', null)} className="flex-col h-auto"><ChevronsUp className="h-6" /><span className="text-xs">Escalera</span></Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="outline"><Trash2 className="mr-2 h-4" /> Limpiar</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará todo el diseño.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => setElements([])}>Confirmar</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {tooltipPos && selectedId && (
                            <div className="flex items-center gap-2 p-1 rounded-lg bg-background border shadow-lg" style={{ position: 'absolute', top: tooltipPos.top, left: tooltipPos.left, transform: 'translateX(-50%)', zIndex: 10 }}>
                                <input type="color" value={elements.find(el => el.id === selectedId)?.fill || '#000'}
                                    onChange={(e) => setElements(elements.map(el => {
                                        if (el.id === selectedId && 'fill' in el) {
                                            return { ...el, fill: e.target.value };
                                        }
                                        return el;
                                    }))}
                                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                                <Button variant="ghost" size="icon" onClick={deleteSelected} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        )}

                        <div className="bg-gray-50 border rounded-lg overflow-x-auto relative" style={{ cursor: activeTool === 'wall' ? 'crosshair' : 'default' }}>
                            <Stage width={dimensions.width} height={dimensions.height} ref={stageRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                                <Layer>
                                    {elements.map((el) => (
                                        <Shape key={el.id} shapeProps={el}
                                            onSelect={() => {
                                                if (el.type !== 'wall') {
                                                    setActiveTool('select');
                                                }
                                                setSelectedId(el.id);
                                            }}
                                            onChange={(newAttrs) => setElements(elements.map(e => e.id === newAttrs.id ? newAttrs : e))} />
                                    ))}
                                    {isDrawing && <Line points={currentWall} stroke="#333" strokeWidth={5} />}
                                    <Transformer
                                        ref={trRef}
                                        boundBoxFunc={(oldBox, newBox) =>
                                            newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
                                        }
                                    />
                                </Layer>
                            </Stage>
                        </div>
                    </div>
                )}
            </CardContent>
            {config && (
                <CardFooter className="flex justify-end gap-4 items-center">
                    <form action={handleSave}>
                        <input type="hidden" name="restaurantConfigId" value={config.id} />
                        <input type="hidden" name="elements" value={JSON.stringify(elements)} />
                        <input type="hidden" name="canvasWidth" value={dimensions.width.toString()} />
                        <input type="hidden" name="canvasHeight" value={dimensions.height.toString()} />
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4" />}
                            Guardar Diseño
                        </Button>
                    </form>
                </CardFooter>
            )}
        </Card>
    );
} 