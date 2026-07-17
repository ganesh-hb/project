"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import Header from "../Header";
import { decryptResponse } from "@/app/lib/crypto";
import { loginContext } from "../hooks/LoginContext";

export default function CurrencyDetails({ id }) {
    const router = useRouter();
    const { can } = useContext(loginContext);
    const [currency, setCurrency] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrency();
    }, [id]);

    const fetchCurrency = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/relayapi`, {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `currency-details/${id}`,
                    module: "currency",
                },
            });
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            setCurrency(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const gotoPages = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(url);
    };

    function formatDate(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strTime = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;
        return `${day}/${month}/${year} ${strTime}`;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f6f8]">
                <Header page="currency-details" />
                <div className="p-8 text-gray-500 text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    if (!currency) {
        return (
            <div className="min-h-screen bg-[#f5f6f8]">
                <Header page="currency-details" />
                <div className="p-8 text-red-500 text-lg font-semibold">Currency not found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f6f8] text-gray-800">
            <Header page="currency-details" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 pb-20">
                <nav className="mb-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/currency-list")}>Currencies</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">Currency</span>



                </nav>

                {/* Title and Edit Button */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Details</h1>
                    <button
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                        onClick={() => { }}
                    >
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column: Summary Card */}
                    <div className="col-span-12 md:col-span-3">
                        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm min-h-[350px]">
                            <h2 className="text-lg font-bold text-gray-800">{currency.name || "N/A"}</h2>
                            <p className="text-sm font-semibold text-gray-400 mt-0.5">{currency.code || "N/A"}</p>

                            <div className="w-full border-t border-gray-100 my-4"></div>

                            <button
                                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-left text-sm font-bold text-white transition shadow-sm"
                            >
                                Summary
                            </button>
                        </div>
                    </div>

                    {/* Right Column: details, added info, modified info row */}
                    <div className="col-span-12 md:col-span-9">
                        <div className="grid grid-cols-12 gap-6">

                            {/* Middle details card */}
                            <div className="col-span-12 lg:col-span-6">
                                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm min-h-[220px]">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Details</h3>
                                    <div className="space-y-3.5 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Currency Name</span>
                                            <span className="text-gray-800 font-semibold text-right">{currency.name || "-"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Currency Code</span>
                                            <span className="text-gray-800 font-semibold text-right">{currency.code || "-"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Currency Symbol</span>
                                            <span className="text-gray-800 font-semibold text-right">{currency.symbol || "-"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Last Synced Date</span>
                                            <span className="text-gray-800 font-semibold text-right">
                                                {currency.lastSyncedDate ? formatDate(currency.lastSyncedDate) : "-"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Status</span>
                                            <span className="text-green-600 font-bold text-right">{currency.status || "-"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Added Info Card */}
                            <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm min-h-[220px]">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Added Info</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-bold shadow-inner">
                                            S
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-blue-600">System</div>
                                            <div className="text-xs text-gray-400 mt-0.5 font-medium">
                                                {currency.addedDate ? formatDate(currency.addedDate) : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modified Info Card */}
                            <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm min-h-[220px]">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Modified Info</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-bold shadow-inner">
                                            S
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-blue-600">System</div>
                                            <div className="text-xs text-gray-400 mt-0.5 font-medium">
                                                {currency.updatedDate ? formatDate(currency.updatedDate) : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
