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
import type { Dictionary } from '@repo/internationalization';

type RecurrenceTypeString = 'WEEKLY' | 'MONTHLY';

interface DailySpecialWithDish extends DailySpecial {
    dish: Dish;
}

interface DailySpecialManagerProps {
    dailySpecials: DailySpecialWithDish[];
    dishes: Dish[];
    upsertDailySpecial: (data: any) => Promise<any>;
    deleteDailySpecials: (ids: string[]) => Promise<any>;
    dictionary: Dictionary;
}

// Helper para formatear fechas sin dependencias externas
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    }).format(new Date(date));
}

const getColumns = (
    onDelete: (dishId: string, date: Date) => Promise<void>,
    dictionary: Dictionary
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
            header: ({ column }: HeaderContext<DailySpecialWithDish, unknown>) => <DataTableColumnHeader column={column} title={dictionary.app?.menu?.dailySpecials?.dish || "Plato"} />,
        },
        {
            accessorKey: "date",
            header: ({ column }: HeaderContext<DailySpecialWithDish, unknown>) => <DataTableColumnHeader column={column} title={dictionary.app?.menu?.dailySpecials?.date || "Fecha"} />,
            cell: ({ row }: CellContext<DailySpecialWithDish, unknown>) => <span>{formatDate(row.original.date)}</span>,
        },
        {
            id: "actions",
            cell: ({ row }: CellContext<DailySpecialWithDish, unknown>) => {
                const [isPending, startTransition] = useTransition();

                const handleDelete = () => {
                    startTransition(async () => {
                        toast.promise(onDelete(row.original.dishId, row.original.date), {
                            loading: dictionary.app?.menu?.dailySpecials?.deletingPromotion || 'Eliminando promoción...',
                            success: dictionary.app?.menu?.dailySpecials?.promotionDeleted || 'Promoción eliminada con éxito.',
                            error: dictionary.app?.menu?.dailySpecials?.toast?.deleteError || 'No se pudo eliminar la promoción.',
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

function TableToolbar({ table, onDeleteSelected, isDeleting, dictionary }: { table: TanstackTable<DailySpecialWithDish>, onDeleteSelected: () => void, isDeleting: boolean, dictionary: Dictionary }) {
    const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {/* Aquí iría el filtro de fecha si se implementa */}
            </div>
            {selectedRowCount > 0 && (
                <Button variant="destructive" onClick={onDeleteSelected} disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? `${dictionary.app?.menu?.dailySpecials?.deletingPromotions || 'Eliminando'} ${selectedRowCount}...` : `${dictionary.app?.menu?.dailySpecials?.deletePromotions || 'Eliminar'} (${selectedRowCount})`}
                </Button>
            )}
        </div>
    );
}

export function DailySpecialManager({ dailySpecials, dishes, upsertDailySpecial, deleteDailySpecials, dictionary }: DailySpecialManagerProps) {
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
                loading: `${dictionary.app?.menu?.dailySpecials?.deletingPromotions || 'Eliminando'} ${selectedIds.length} ${dictionary.app?.menu?.dailySpecials?.toast?.deleting || 'promociones...'}`,
                success: () => {
                    table.resetRowSelection();
                    return `${selectedIds.length} ${dictionary.app?.menu?.dailySpecials?.promotionsDeleted || 'promociones eliminadas con éxito.'}`;
                },
                error: dictionary.app?.menu?.dailySpecials?.toast?.deleteError || 'No se pudieron eliminar las promociones.',
            });
        });
    };

    const columns = useMemo(() => getColumns(async (dishId, date) => {
        await upsertDailySpecial({ dishId, date });
    }, dictionary), [upsertDailySpecial, dictionary]);

    const handleAddSpecial = () => {
        if (!selectedDishId || !date) {
            toast.error(dictionary.app?.menu?.dailySpecials?.validation?.selectDishAndDate || "Por favor, selecciona un plato y una fecha de inicio.");
            return;
        }
        if (isRecurring && (!recurrenceEndDate || (recurrenceType === 'WEEKLY' && recurrenceDays.length === 0))) {
            toast.error(dictionary.app?.menu?.dailySpecials?.validation?.completeRecurrenceFields || "Para promociones recurrentes, completa todos los campos de repetición.");
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
                loading: dictionary.app?.menu?.dailySpecials?.toast?.adding || 'Añadiendo promoción(es)...',
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
                error: (err: any) => err.message || (dictionary.app?.menu?.dailySpecials?.toast?.error || 'No se pudo añadir la promoción.'),
            });
        });
    };

    const selectedDishForPreview = useMemo(() => dishes.find(d => d.id === selectedDishId) || null, [selectedDishId, dishes]);

    const weekDays = [
        { value: '1', label: dictionary.app?.restaurant?.openingHours?.days?.monday?.charAt(0) || 'L' },
        { value: '2', label: dictionary.app?.restaurant?.openingHours?.days?.tuesday?.charAt(0) || 'M' },
        { value: '3', label: dictionary.app?.restaurant?.openingHours?.days?.wednesday?.charAt(0) || 'X' },
        { value: '4', label: dictionary.app?.restaurant?.openingHours?.days?.thursday?.charAt(0) || 'J' },
        { value: '5', label: dictionary.app?.restaurant?.openingHours?.days?.friday?.charAt(0) || 'V' },
        { value: '6', label: dictionary.app?.restaurant?.openingHours?.days?.saturday?.charAt(0) || 'S' },
        { value: '0', label: dictionary.app?.restaurant?.openingHours?.days?.sunday?.charAt(0) || 'D' },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 p-1 sm:p-2">
            <div className="xl:col-span-2 space-y-4">
                <h4 className="font-semibold text-base sm:text-lg">{dictionary.app?.menu?.dailySpecials?.schedulePromotion || 'Programar Promoción'}</h4>
                <div className="space-y-2">
                    <label className="text-sm font-medium">{dictionary.app?.menu?.dailySpecials?.dish || 'Plato'}</label>
                    <Select value={selectedDishId} onValueChange={setSelectedDishId}>
                        <SelectTrigger><SelectValue placeholder={dictionary.app?.menu?.dailySpecials?.dishPlaceholder || 'Selecciona un plato'} /></SelectTrigger>
                        <SelectContent>
                            {dishes.map(dish => <SelectItem key={dish.id} value={dish.id}>{dish.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{isRecurring ? (dictionary.app?.menu?.dailySpecials?.startDate || 'Fecha de Inicio') : (dictionary.app?.menu?.dailySpecials?.date || 'Fecha')}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? formatDate(date) : <span>{dictionary.app?.menu?.dailySpecials?.datePlaceholder || 'Selecciona una fecha'}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="recurring-switch" checked={isRecurring} onCheckedChange={setIsRecurring} />
                    <Label htmlFor="recurring-switch" className="text-sm">{dictionary.app?.menu?.dailySpecials?.repeatPromotion || 'Repetir Promoción'}</Label>
                </div>

                {isRecurring && (
                    <Card className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm">{dictionary.app?.menu?.dailySpecials?.recurrenceType || 'Tipo de Repetición'}</Label>
                            <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as RecurrenceTypeString)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEEKLY">{dictionary.app?.menu?.dailySpecials?.weekly || 'Semanal'}</SelectItem>
                                    <SelectItem value="MONTHLY">{dictionary.app?.menu?.dailySpecials?.monthly || 'Mensual'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {recurrenceType === 'WEEKLY' && (
                            <div className="space-y-2">
                                <Label className="text-sm">{dictionary.app?.menu?.dailySpecials?.weekDays || 'Días de la Semana'}</Label>
                                <ToggleGroup type="multiple" value={recurrenceDays} onValueChange={setRecurrenceDays} className="flex-wrap justify-start">
                                    {weekDays.map(day => (
                                        <ToggleGroupItem key={day.value} value={day.value} aria-label={day.label} className="text-xs sm:text-sm">{day.label}</ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-sm">{dictionary.app?.menu?.dailySpecials?.endDate || 'Fecha de Fin de Repetición'}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !recurrenceEndDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {recurrenceEndDate ? formatDate(recurrenceEndDate) : <span>{dictionary.app?.menu?.dailySpecials?.datePlaceholder || 'Selecciona una fecha'}</span>}
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
                    <span className="hidden sm:inline">{isPending ? (dictionary.app?.menu?.dailySpecials?.adding || 'Añadiendo...') : (dictionary.app?.menu?.dailySpecials?.addPromotion?.desktop || 'Añadir Promoción')}</span>
                    <span className="sm:hidden">{isPending ? (dictionary.app?.menu?.dailySpecials?.adding || 'Añadiendo...') : (dictionary.app?.menu?.dailySpecials?.addPromotion?.mobile || 'Añadir')}</span>
                </Button>
                {selectedDishForPreview && (
                    <div>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">{dictionary.app?.menu?.dailySpecials?.promotionPreview || 'Previsualización de la Promoción'}</h4>
                        <Card className="overflow-hidden">
                            <div className="relative h-24 sm:h-32 w-full">
                                {selectedDishForPreview.imageUrl ? (
                                    <Image src={selectedDishForPreview.imageUrl} alt={selectedDishForPreview.name} layout="fill" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-2 sm:p-3">
                                <h3 className="font-semibold text-sm sm:text-base truncate">{selectedDishForPreview.name}</h3>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <p className="font-bold text-sm sm:text-lg text-red-500 line-through">
                                        ${selectedDishForPreview.price.toFixed(2)}
                                    </p>
                                    <p className="font-bold text-base sm:text-xl text-green-600">
                                        ${selectedDishForPreview.promotionalPrice?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {dictionary.app?.menu?.dailySpecials?.promotionalPriceNote || 'El precio promocional se debe establecer en el plato.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <div className="xl:col-span-3 space-y-4">
                <h4 className="font-semibold text-base sm:text-lg">{dictionary.app?.menu?.dailySpecials?.activePromotions || 'Promociones Activas'}</h4>
                <div className="overflow-x-auto">
                    <DataTable
                        className="space-y-4"
                        containerClassName="max-h-[50vh] sm:max-h-[65vh] overflow-y-auto"
                        columns={columns}
                        data={dailySpecials}
                        toolbar={(table) => (
                            <TableToolbar
                                table={table}
                                onDeleteSelected={() => handleDeleteSelected(table)}
                                isDeleting={isPending}
                                dictionary={dictionary}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
} 