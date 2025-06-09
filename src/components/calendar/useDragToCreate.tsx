import { useState, useCallback } from 'react';
import { Slot, DragState } from './types';

export const useDragToCreate = (onCreateEvent: (startSlot: Slot, endSlot: Slot) => void) => {
    const [dragState, setDragState] = useState<DragState>({
        startSlot: null,
        endSlot: null,
        isDragging: false,
    });

    const handleDragStart = useCallback((slot: Slot) => {
        setDragState({
            startSlot: slot,
            endSlot: slot,
            isDragging: true,
        });
    }, []);

    const handleDragMove = useCallback((slot: Slot) => {
        setDragState(prev => {
            if (!prev.isDragging || !prev.startSlot) return prev;

            // Only allow dragging within the same day
            if (slot.day.toDateString() !== prev.startSlot.day.toDateString()) {
                return prev;
            }

            return {
                ...prev,
                endSlot: slot,
            };
        });
    }, []);

    const handleDragEnd = useCallback(() => {
        if (dragState.isDragging && dragState.startSlot && dragState.endSlot) {
            onCreateEvent(dragState.startSlot, dragState.endSlot);
        }

        setDragState({
            startSlot: null,
            endSlot: null,
            isDragging: false,
        });
    }, [dragState, onCreateEvent]);

    const isSlotInDragRange = useCallback((slot: Slot): boolean => {
        if (!dragState.isDragging || !dragState.startSlot || !dragState.endSlot) {
            return false;
        }

        // Check if same day
        if (slot.day.toDateString() !== dragState.startSlot.day.toDateString()) {
            return false;
        }

        const minHour = Math.min(dragState.startSlot.hour, dragState.endSlot.hour);
        const maxHour = Math.max(dragState.startSlot.hour, dragState.endSlot.hour);

        return slot.hour >= minHour && slot.hour <= maxHour;
    }, [dragState]);

    return {
        dragState,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        isSlotInDragRange,
    };
};