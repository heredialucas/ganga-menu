'use client';

import { useState, useTransition, useMemo } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Star, Trash2, ImageIcon } from 'lucide-react';
import { type DailySpecial, type Dish } from '@repo/database';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/components/ui/popover';
import { Calendar } from '@repo/design-system/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { cn } from '@repo/design-system/lib/utils';
import Image from 'next/image';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import {
    DataTable,
    ColumnDef,
    TanstackTable,
    HeaderContext,
    CellContext,
} from '@repo/design-system/components/ui/data-table';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { DataTableColumnHeader } from '@repo/design-system/components/ui/data-table-column-header';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Label } from '@repo/design-system/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@repo/design-system/components/ui/toggle-group';

type RecurrenceTypeString = 'WEEKLY' | 'MONTHLY';

interface DailySpecialWithDish extends DailySpecial {
    dish: Dish;
}

interface DailySpecialManagerProps {
    dailySpecials: DailySpecialWithDish[];
    dishes: Dish[];
    upsertDailySpecial: (data: any) => Promise<any>;
    deleteDailySpecials: (ids: string[]) => Promise<any>;
}

// Helper para formatear fechas sin dependencias externas
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    }).format(new Date(date));
}

const getColumns = (
    onDelete: (dishId: string, date: Date) => Promise<void>
): ColumnDef<DailySpecialWithDish>[] => [
        {
            id: "select",
            header: ({ table }: HeaderContext<DailySpecialWithDish, unknown>) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }: CellContext<DailySpecialWithDish, unknown>) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "dish.name",
            header: ({ column }: HeaderContext<DailySpecialWithDish, unknown>) => <DataTableColumnHeader column={column} title="Plato" />,
        },
        {
            accessorKey: "date",
            header: ({ column }: HeaderContext<DailySpecialWithDish, unknown>) => <DataTableColumnHeader column={column} title="Fecha" />,
            cell: ({ row }: CellContext<DailySpecialWithDish, unknown>) => <span>{formatDate(row.original.date)}</span>,
        },
        {
            id: "actions",
            cell: ({ row }: CellContext<DailySpecialWithDish, unknown>) => {
                const [isPending, startTransition] = useTransition();

                const handleDelete = () => {
                    startTransition(async () => {
                        toast.promise(onDelete(row.original.dishId, row.original.date), {
                            loading: 'Eliminando promoción...',
                            success: 'Promoción eliminada con éxito.',
                            error: 'No se pudo eliminar la promoción.',
                        });
                    });
                };

                return (
                    <div className="text-right">
                        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                )
            },
        },
    ];

function TableToolbar({ table, onDeleteSelected, isDeleting }: { table: TanstackTable<DailySpecialWithDish>, onDeleteSelected: () => void, isDeleting: boolean }) {
    const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {/* Aquí iría el filtro de fecha si se implementa */}
            </div>
            {selectedRowCount > 0 && (
                <Button variant="destructive" onClick={onDeleteSelected} disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? `Eliminando ${selectedRowCount}...` : `Eliminar (${selectedRowCount})`}
                </Button>
            )}
        </div>
    );
}

export function DailySpecialManager({ dailySpecials, dishes, upsertDailySpecial, deleteDailySpecials }: DailySpecialManagerProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedDishId, setSelectedDishId] = useState<string>('');
    const [isPending, startTransition] = useTransition();

    // Estados para la recurrencia
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceTypeString>('WEEKLY');
    const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();

    const handleDeleteSelected = (table: TanstackTable<DailySpecialWithDish>) => {
        const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
        startTransition(async () => {
            toast.promise(deleteDailySpecials(selectedIds), {
                loading: `Eliminando ${selectedIds.length} promociones...`,
                success: () => {
                    table.resetRowSelection();
                    return `${selectedIds.length} promociones eliminadas con éxito.`;
                },
                error: 'No se pudieron eliminar las promociones.',
            });
        });
    };

    const columns = useMemo(() => getColumns(async (dishId, date) => {
        await upsertDailySpecial({ dishId, date });
    }), [upsertDailySpecial]);

    const handleAddSpecial = () => {
        if (!selectedDishId || !date) {
            toast.error("Por favor, selecciona un plato y una fecha de inicio.");
            return;
        }
        if (isRecurring && (!recurrenceEndDate || (recurrenceType === 'WEEKLY' && recurrenceDays.length === 0))) {
            toast.error("Para promociones recurrentes, completa todos los campos de repetición.");
            return;
        }

        const specialData = {
            dishId: selectedDishId,
            date,
            isRecurring,
            recurrenceType,
            recurrenceDays,
            recurrenceEndDate
        };

        startTransition(() => {
            const promise = upsertDailySpecial(specialData);

            toast.promise(promise, {
                loading: 'Añadiendo promoción(es)...',
                success: (result) => {
                    // Resetear el formulario
                    setSelectedDishId('');
                    setDate(new Date());
                    setIsRecurring(false);
                    setRecurrenceType('WEEKLY');
                    setRecurrenceDays([]);
                    setRecurrenceEndDate(undefined);
                    return result.message;
                },
                error: (err: any) => err.message || 'No se pudo añadir la promoción.',
            });
        });
    };

    const selectedDishForPreview = useMemo(() => dishes.find(d => d.id === selectedDishId) || null, [selectedDishId, dishes]);

    const weekDays = [
        { value: '1', label: 'L' },
        { value: '2', label: 'M' },
        { value: '3', label: 'X' },
        { value: '4', label: 'J' },
        { value: '5', label: 'V' },
        { value: '6', label: 'S' },
        { value: '0', label: 'D' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-2">
            <div className="lg:col-span-2 space-y-4">
                <h4 className="font-semibold">Programar Promoción</h4>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Plato</label>
                    <Select value={selectedDishId} onValueChange={setSelectedDishId}>
                        <SelectTrigger><SelectValue placeholder="Selecciona un plato" /></SelectTrigger>
                        <SelectContent>
                            {dishes.map(dish => <SelectItem key={dish.id} value={dish.id}>{dish.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{isRecurring ? 'Fecha de Inicio' : 'Fecha'}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? formatDate(date) : <span>Selecciona una fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="recurring-switch" checked={isRecurring} onCheckedChange={setIsRecurring} />
                    <Label htmlFor="recurring-switch">Repetir Promoción</Label>
                </div>

                {isRecurring && (
                    <Card className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Tipo de Repetición</Label>
                            <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as RecurrenceTypeString)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {recurrenceType === 'WEEKLY' && (
                            <div className="space-y-2">
                                <Label>Días de la Semana</Label>
                                <ToggleGroup type="multiple" value={recurrenceDays} onValueChange={setRecurrenceDays} className="flex-wrap justify-start">
                                    {weekDays.map(day => (
                                        <ToggleGroupItem key={day.value} value={day.value} aria-label={day.label}>{day.label}</ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Fecha de Fin de Repetición</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !recurrenceEndDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {recurrenceEndDate ? formatDate(recurrenceEndDate) : <span>Selecciona una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={recurrenceEndDate} onSelect={setRecurrenceEndDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </Card>
                )}

                <Button onClick={handleAddSpecial} disabled={isPending} className="w-full">
                    <Star className="h-4 w-4 mr-2" />
                    {isPending ? 'Añadiendo...' : 'Añadir Promoción'}
                </Button>
                {selectedDishForPreview && (
                    <div>
                        <h4 className="font-semibold mb-2">Previsualización de la Promoción</h4>
                        <Card className="overflow-hidden">
                            <div className="relative h-32 w-full">
                                {selectedDishForPreview.imageUrl ? (
                                    <Image src={selectedDishForPreview.imageUrl} alt={selectedDishForPreview.name} layout="fill" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-3">
                                <h3 className="font-semibold text-base truncate">{selectedDishForPreview.name}</h3>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <p className="font-bold text-lg text-red-500 line-through">
                                        ${selectedDishForPreview.price.toFixed(2)}
                                    </p>
                                    <p className="font-bold text-xl text-green-600">
                                        ${selectedDishForPreview.promotionalPrice?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    El precio promocional se debe establecer en el plato.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <div className="lg:col-span-3 space-y-4">
                <h4 className="font-semibold">Promociones Activas</h4>
                <DataTable
                    className="space-y-4"
                    containerClassName="max-h-[65vh] overflow-y-auto"
                    columns={columns}
                    data={dailySpecials}
                    toolbar={(table) => (
                        <TableToolbar
                            table={table}
                            onDeleteSelected={() => handleDeleteSelected(table)}
                            isDeleting={isPending}
                        />
                    )}
                />
            </div>
        </div>
    );
} 