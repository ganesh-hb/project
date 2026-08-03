"use client";
import { useEffect, useState, useCallback } from "react";

export function useSlideOverPanel(onClose, duration = 300) {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Trigger enter transition on mount
        const timer = requestAnimationFrame(() => {
            setIsOpen(true);
        });
        return () => cancelAnimationFrame(timer);
    }, []);

    const handleClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);
        setIsOpen(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, duration);
    }, [onClose, duration, isClosing]);

    return {
        isOpen,
        isClosing,
        handleClose,
    };
}
