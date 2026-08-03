"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import { Lock, UserX } from "lucide-react";
import Loader from "./ui/Loader";
import { useSlideOverPanel } from "./hooks/useSlideOverPanel";

export default function UserSidePanel({ userId, onClose, onMoreDetails }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorType, setErrorType] = useState(null);
    const { isOpen, handleClose } = useSlideOverPanel(onClose, 300);

    useEffect(() => {
        if (!userId) return;
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        setLoading(true);
        setErrorType(null);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `user-details/${userId}`,
                    module: "user",
                },
            });

            if (res.status === 403 || res.status === 401) {
                setErrorType("forbidden");
                setUser(null);
                return;
            }

            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;

            const isForbidden =
                data?.statusCode === 403 ||
                data?.statusCode === 401 ||
                data?.error === "Forbidden" ||
                data?.error === "Unauthorized" ||
                (typeof data?.message === "string" &&
                    (data.message.toLowerCase().includes("permission") ||
                        data.message.toLowerCase().includes("access denied") ||
                        data.message.toLowerCase().includes("forbidden") ||
                        data.message.toLowerCase().includes("unauthorized") ||
                        data.message.toLowerCase().includes("no profile assigned")));

            if (isForbidden) {
                setErrorType("forbidden");
                setUser(null);
            } else if (!res.ok || (data && (data.success === 0 || !data.userId))) {
                setErrorType("not-found");
                setUser(null);
            } else {
                setUser(data);
            }
        } catch (err) {
            console.error(err);
            setErrorType("not-found");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status) => {
        if (status === "active" || status === "Active")
            return "inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700";
        if (status === "inactive" || status === "Inactive")
            return "inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700";
        return "inline-block rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700";
    };

    const primary = user?.primaryProfile || user?.activeAssignment || null;

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
                    <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center flex-1 transition-opacity duration-200">
                        <Loader label="Loading user details..." />
                    </div>
                ) : !user ? (
                    errorType === "forbidden" ? (
                        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4 shadow-sm border border-amber-100">
                                <Lock className="h-7 w-7" />
                            </div>
                            <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 mb-2">
                                Error 403
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">Access Restricted</h3>
                            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                                You don't have permission to view this user's details.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4 shadow-sm border border-red-100">
                                <UserX className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">User Not Found</h3>
                            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                                This user may have been removed or the link is no longer valid.
                            </p>
                        </div>
                    )
                ) : (
                    <div className="flex-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-4 px-6 py-5 border-b bg-gray-50">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-50 border shadow-sm flex-shrink-0 relative transition-transform hover:scale-105 duration-200">
                                {user.userFile ? (
                                    <img
                                        src={`http://localhost:4000/upload/${user.userId}/${user.userFile}`}
                                        alt="avatar"
                                        className="h-full w-full object-cover transition-opacity duration-300"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                                        }}
                                    />
                                ) : null}
                                <span
                                    style={{ display: user.userFile ? "none" : "flex" }}
                                    className="h-full w-full items-center justify-center text-xl font-bold text-blue-400 absolute inset-0 uppercase"
                                >
                                    {user.name?.charAt(0) ?? "U"}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-base">{user.name}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                                <span className={`mt-1 transition-all duration-200 ${statusBadge(user.status)}`}>{user.status}</span>
                            </div>
                        </div>

                        {onMoreDetails && (
                            <div className="px-6 py-3 border-b">
                                <button
                                    onClick={() => onMoreDetails(userId)}
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
                                    <p className="text-sm text-gray-500">UserName</p>
                                    <p className="text-sm font-medium text-gray-800">{user.name || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Age</p>
                                    <p className="text-sm font-medium text-gray-800">{user.age ?? "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="px-6 py-4 border-b">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Contact</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-800 break-all">{user.email || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {user.dialCode ? `+${user.dialCode} ` : ""}{user.phone || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Role & Company */}
                        <div className="px-6 py-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Role &amp; Company</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {primary?.groupName ? primary.groupName.replace(/([A-Z])/g, " $1").trim() : "N/A"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Company</p>
                                    <p className="text-sm font-medium text-gray-800">{primary?.companyName || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}