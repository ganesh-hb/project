"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/app/lib/auth";

export default function CompanySidePanel({ companyId, onClose }) {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    function getInitials(name) {
        if (!name) return "?";
        return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    }

    useEffect(() => {
        if (!companyId) return;
        fetchCompany();
    }, [companyId]);

    const fetchCompany = async () => {
        setLoading(true);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `company-details/${companyId}`,
                    module: "company",
                },
            });
            const data = await res.json();
            setCompany(data);
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
                    <h2 className="text-lg font-semibold text-gray-800">Company Details</h2>
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
                ) : !company ? (
                    <div className="flex items-center justify-center flex-1 text-red-400 text-sm">
                        Company not found.
                    </div>
                ) : (
                    <div className="flex-1">
                        {/* Logo + name */}
                        <div className="flex items-center gap-4 px-6 py-5 border-b bg-gray-50">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-50 border shadow-sm flex-shrink-0 relative">
                                {company.companyFile
                                    ? <img
                                        src={`http://localhost:4000/upload/company/${company.companyId}/${company.companyFile}`}
                                        alt="logo"
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                    : null
                                }
                                <span
                                    style={{ display: company.companyFile ? 'none' : 'flex' }}
                                    className="h-full w-full items-center justify-center text-xl font-bold text-blue-400 absolute inset-0"
                                >
                                    {getInitials(company.companyName)}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-base">{company.companyName}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{company.companyCode}</p>
                                <span className={`mt-1 ${statusBadge(company.status)}`}>{company.status}</span>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="px-6 py-4 border-b">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Basic Info</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="text-sm font-medium text-gray-800">{company.companyLocation || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Website</p>
                                    <p className="text-sm font-medium text-gray-800 break-all">
                                        {company.website
                                            ? <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{company.website}</a>
                                            : "N/A"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="px-6 py-4 border-b">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Contact</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-800 break-all">{company.email || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {company.dialCode ? `+${company.dialCode} ` : ""}{company.phone || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="px-6 py-4 border-b">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Address</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-sm font-medium text-gray-800">{company.AddressLineOne || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">City / State</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {[company.city, company.state, company.country].filter(Boolean).join(", ") || "N/A"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Postal Code</p>
                                    <p className="text-sm font-medium text-gray-800">{company.postalCode || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Owner */}
                        <div className="px-6 py-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Owner</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-sm font-medium text-gray-800">{company.ownerName || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-800 break-all">{company.ownerEmail || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-sm font-medium text-gray-800">{company.ownerPhone || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}