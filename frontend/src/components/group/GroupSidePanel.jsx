"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import Loader from "../ui/Loader";
import { useSlideOverPanel } from "../hooks/useSlideOverPanel";

export default function GroupSidePanel({ groupId, onClose, onMoreDetails }) {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isOpen, handleClose } = useSlideOverPanel(onClose, 300);

    function getInitials(name) {
        if (!name) return "?";
        return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    }

    useEffect(() => {
        if (!groupId) return;
        fetchGroup();
    }, [groupId]);

    const fetchGroup = async () => {
        setLoading(true);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `group-details/${groupId}`,
                    module: "group",
                },
            });
            const resJson = await res.json();
            const data = resJson?.encrypted ? decryptResponse(resJson.encrypted) : resJson;
            setGroup(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status) => {
        if (!status || typeof status !== "string") return "inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700";
        const s = status.toLowerCase();
        if (s === "active") return "inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700";
        if (s === "inactive") return "inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700";
        return "inline-block rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700";
    };

    const formatStatus = (status) => {
        if (!status || typeof status !== "string") return "-";
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    const assignments = Array.isArray(group?.assignments) ? group.assignments : [];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
                    isOpen ? "opacity-100" : "opacity-0"
                }`}
                onClick={handleClose}
            />

            {/* Side panel */}
            <div
                className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto flex flex-col transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-white sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-gray-800">Group Details</h2>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center flex-1 transition-opacity duration-200">
                        <Loader label="Loading group details..." />
                    </div>
                ) : !group ? (
                    <div className="flex items-center justify-center flex-1 text-red-400 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        Group not found.
                    </div>
                ) : (
                    <div className="flex-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                        {/* Header Block */}
                        <div className="flex items-center gap-4 px-6 py-5 border-b bg-gray-50">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-50 border shadow-sm flex-shrink-0 relative transition-transform hover:scale-105 duration-200">
                                <span className="h-full w-full flex items-center justify-center text-xl font-bold text-blue-400 absolute inset-0">
                                    {getInitials(group.groupName)}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-base">{group.groupName}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{group.groupCode || "-"}</p>
                                <span className={`mt-1 transition-all duration-200 ${statusBadge(group.status)}`}>{formatStatus(group.status)}</span>
                            </div>
                        </div>

                        {onMoreDetails && (
                            <div className="px-6 py-3 border-b">
                                <button
                                    onClick={() => onMoreDetails(groupId)}
                                    className="w-full rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 active:scale-[0.99] text-gray-800 font-medium text-sm py-2.5 transition-all duration-150 shadow-sm hover:shadow text-center"
                                >
                                    More Details
                                </button>
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="px-6 py-4 border-b">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Basic Info</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Group Name</p>
                                    <p className="text-sm font-medium text-gray-800">{group.groupName || "-"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Group Code</p>
                                    <p className="text-sm font-medium text-gray-800">{group.groupCode || "-"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Added By</p>
                                    <p className="text-sm font-medium text-gray-800">{group.addedByName || "-"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Updated By</p>
                                    <p className="text-sm font-medium text-gray-800">{group.updatedByName || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Assigned Users */}
                        {assignments.length > 0 && (
                            <div className="px-6 py-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Assigned Users</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {assignments.map((a, i) => (
                                        <div key={i} className="p-2.5 rounded-lg border bg-gray-50 flex flex-col text-xs space-y-0.5 transition-colors hover:bg-gray-100">
                                            <span className="font-semibold text-gray-800">{a.userName || a.name || "-"}</span>
                                            {a.email && <span className="text-gray-500">{a.email}</span>}
                                            {a.companyName && <span className="text-gray-400">{a.companyName}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
