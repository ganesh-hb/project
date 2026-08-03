"use client";
import { useEffect, useState } from "react";

export default function ImagePreviewModal({ open, onClose, imageUrl, alt = "preview" }) {
    const [render, setRender] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setRender(true);
            const timer = setTimeout(() => {
                setVisible(true);
            }, 10);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
            const timer = setTimeout(() => {
                setRender(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!render) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-200 ease-in-out ${
                visible ? "opacity-100" : "opacity-0"
            }`}
            onClick={onClose}
        >
            <div
                className={`relative bg-white rounded-2xl shadow-2xl p-4 max-w-sm w-full mx-4 transition-all duration-200 ease-in-out ${
                    visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer"
                    onClick={onClose}
                >
                    ✕
                </button>
                <img src={imageUrl} alt={alt} className="w-full rounded-xl object-contain max-h-80" />
            </div>
        </div>
    );
}
