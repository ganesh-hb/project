"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/app/lib/auth";

export default function UserSidePanel({ userId, onClose }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `user-details/${userId}`,
                    module: "user",
                },
            });
            const data = await res.json();
            setUser(data);
        } catch (err) {
            console.error(err);
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
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Side panel */}
            <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-white sticky top-0">
                    <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
                        Loading...
                    </div>
                ) : !user ? (
                    <div className="flex items-center justify-center flex-1 text-red-400 text-sm">
                        User not found.
                    </div>
                ) : (
                    <div className="flex-1">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-4 px-6 py-5 border-b bg-gray-50">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-50 border shadow-sm flex-shrink-0">
                                <img
                                    src={`http://localhost:4000/upload/${user.userId}/${user.userFile}`}
                                    alt="avatar"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentNode.innerHTML = `<span class="text-xl font-bold text-blue-400">${user.name?.charAt(0) ?? "U"}</span>`;
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-base">{user.name}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                                <span className={`mt-1 ${statusBadge(user.status)}`}>{user.status}</span>
                            </div>
                        </div>

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