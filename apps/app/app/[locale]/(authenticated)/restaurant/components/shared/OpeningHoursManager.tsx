'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Input } from '@repo/design-system/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

type TimeSlot = {
    id: string;
    open: string;
    close: string;
};

type DayHours = {
    isOpen: boolean;
    slots: TimeSlot[];
};

type OpeningHours = Record<string, DayHours>;

interface OpeningHoursManagerProps {
    initialHours?: string; // JSON string
    dictionary: Dictionary;
    canEdit?: boolean;
}

function parseInitialHours(initialHoursString?: string): OpeningHours {
    const defaultHours = daysOfWeek.reduce((acc, day) => {
        acc[day] = { isOpen: false, slots: [{ id: `default-${day}`, open: '09:00', close: '17:00' }] };
        return acc;
    }, {} as OpeningHours);

    if (!initialHoursString) {
        return defaultHours;
    }

    try {
        const parsed = JSON.parse(initialHoursString);
        // Basic validation to check if it's the new or old format
        for (const day of daysOfWeek) {
            if (parsed[day]) {
                // If slots array doesn't exist, it's the old format. Convert it.
                if (!parsed[day].slots) {
                    // Handle old format with openTime/closeTime
                    if (parsed[day].openTime && parsed[day].closeTime) {
                        parsed[day].slots = [{
                            id: `migrated-${day}`,
                            open: parsed[day].openTime,
                            close: parsed[day].closeTime
                        }];
                    }
                    // Handle old format with open/close
                    else if (parsed[day].open && parsed[day].close) {
                        parsed[day].slots = [{
                            id: `migrated-${day}`,
                            open: parsed[day].open,
                            close: parsed[day].close
                        }];
                    }
                    // Handle old format with ranges
                    else if (parsed[day].ranges && Array.isArray(parsed[day].ranges)) {
                        parsed[day].slots = parsed[day].ranges.map((range: any, index: number) => ({
                            id: `migrated-${day}-${index}`,
                            open: range.openTime || range.open || '09:00',
                            close: range.closeTime || range.close || '17:00'
                        }));
                    }
                    // Default fallback
                    else {
                        parsed[day].slots = [{
                            id: `migrated-${day}`,
                            open: '09:00',
                            close: '17:00'
                        }];
                    }
                }
                // Ensure every slot has an ID and proper format
                parsed[day].slots.forEach((slot: TimeSlot, index: number) => {
                    if (!slot.id) {
                        slot.id = `${day}-${index}-${Date.now()}`;
                    }
                    // Ensure open and close properties exist
                    if (!slot.open) slot.open = '09:00';
                    if (!slot.close) slot.close = '17:00';
                });
            }
        }
        return { ...defaultHours, ...parsed };
    } catch (e) {
        console.error('Error parsing initial hours JSON:', e);
        return defaultHours;
    }
}

export function OpeningHoursManager({ initialHours, dictionary, canEdit = true }: OpeningHoursManagerProps) {
    const [hours, setHours] = useState<OpeningHours>(() => parseInitialHours(initialHours));

    const handleToggleDay = (day: string, isOpen: boolean) => {
        setHours(prev => ({ ...prev, [day]: { ...prev[day], isOpen } }));
    };

    const handleTimeChange = (day: string, slotId: string, type: 'open' | 'close', value: string) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                slots: prev[day].slots.map(slot =>
                    slot.id === slotId ? { ...slot, [type]: value } : slot
                ),
            },
        }));
    };

    const handleAddSlot = (day: string) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                slots: [...prev[day].slots, { id: `${day}-${Date.now()}`, open: '09:00', close: '17:00' }],
            },
        }));
    };

    const handleRemoveSlot = (day: string, slotId: string) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                slots: prev[day].slots.filter(slot => slot.id !== slotId),
            },
        }));
    };

    const handleToggleAll = (isOpen: boolean) => {
        setHours(prev => {
            const newHours = { ...prev };
            for (const day of daysOfWeek) {
                newHours[day] = { ...newHours[day], isOpen };
            }
            return newHours;
        });
    };

    const areAllOpen = daysOfWeek.every(day => hours[day].isOpen);

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <input type="hidden" name="hours" value={JSON.stringify(hours)} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 border rounded-lg gap-2 sm:gap-0">
                <Label className="text-sm sm:text-base">{dictionary.app.restaurant.openingHours.applyToAll}</Label>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Switch
                        checked={areAllOpen}
                        onCheckedChange={handleToggleAll}
                        aria-label="Toggle all days"
                        disabled={!canEdit}
                    />
                    <Label className="text-xs sm:text-sm">{areAllOpen ? dictionary.app.restaurant.openingHours.allOpen : dictionary.app.restaurant.openingHours.markAllOpen}</Label>
                </div>
            </div>

            <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {daysOfWeek.map(day => {
                    const dayHours = hours[day];
                    return (
                        <div key={day} className="p-2 sm:p-3 md:p-4 border rounded-lg space-y-2 sm:space-y-3 md:space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                <Label className="capitalize text-base sm:text-lg font-medium">
                                    {dictionary.app.restaurant.openingHours.days[day as keyof typeof dictionary.app.restaurant.openingHours.days]}
                                </Label>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Switch
                                        checked={dayHours.isOpen}
                                        onCheckedChange={(checked) => handleToggleDay(day, checked)}
                                        disabled={!canEdit}
                                    />
                                    <Label className="text-xs sm:text-sm">{dayHours.isOpen ? dictionary.app.restaurant.openingHours.open : dictionary.app.restaurant.openingHours.closed}</Label>
                                </div>
                            </div>

                            {dayHours.isOpen && (
                                <div className="space-y-3 pl-4 border-l-2">
                                    {dayHours.slots.map((slot) => (
                                        <div key={slot.id} className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={slot.open}
                                                onChange={(e) => handleTimeChange(day, slot.id, 'open', e.target.value)}
                                                disabled={!canEdit}
                                            />
                                            <span>-</span>
                                            <Input
                                                type="time"
                                                value={slot.close}
                                                onChange={(e) => handleTimeChange(day, slot.id, 'close', e.target.value)}
                                                disabled={!canEdit}
                                            />
                                            {canEdit && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveSlot(day, slot.id)}
                                                    disabled={dayHours.slots.length <= 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {canEdit && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddSlot(day)}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            {dictionary.app.restaurant.openingHours.addShift}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 