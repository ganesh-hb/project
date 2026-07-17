"use client";

import { decryptResponse } from "@/app/lib/crypto";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { loginContext } from "../hooks/LoginContext";
import Header from "../Header";
import { toast } from "react-toastify";
import { authHeaders } from "@/app/lib/auth";
import AppPagination from "../ui/AppPagination";
import { DataTable } from "../data-table";
import { currencyColumns } from "./CurrencyColumn";

export default function CurrencyList() {
    const router = useRouter();
    const { isLogin, can } = useContext(loginContext);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentFilters, setCurrentFilters] = useState({});

    useEffect(() => {
        fetchData(1, {});
    }, []);

    async function fetchData(page = currentPage, searchParams = currentFilters, limitOverride = limit) {
        setLoading(true);
        setError("");
        try {
            let body = { page, limit: limitOverride };
            if (searchParams?.filters?.length > 0) {
                body.condition = searchParams.condition || "All";
                body.filters = searchParams.filters;
            }
            const response = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    endpoint: "currency-list",
                    module: "currency",
                    service: "currency"
                },
                body: JSON.stringify(body),
            });
            if (response.status === 401 || response.status === 403) {
                toast.error("You don't have permission to view this list", { position: "top-right" });
                setError("Access denied.");
                return;
            }
            const payload = await response.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            setCurrencies(data?.data ?? []);
            setTotalPages(Math.ceil((data?.total || 1) / limitOverride));
            setTotalRecords(data?.total || 0);
        } catch (err) {
            toast.error(`${err}`, { position: "top-right" });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (searchParams) => {
        setCurrentPage(1);
        setCurrentFilters(searchParams);
        fetchData(1, searchParams);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setCurrentPage(1);
        fetchData(1, currentFilters, newLimit);
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchData(page, currentFilters);
    };

    const gotoPages = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`http://localhost:3000${url}`);
    };

    return (
        <div className="w-full min-h-screen bg-[#f5f6fa]">
            <Header page="currencies" onSearch={handleSearch} />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 pb-20">
                <nav className="mb-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">Currencies</span>
                </nav>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Currencies</h1>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20 text-gray-500 text-sm font-medium">
                        Loading currencies...
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center py-20 text-red-500 text-sm font-medium">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <DataTable
                        columns={currencyColumns}
                        data={currencies}
                        filterableColumns={[
                            { id: "name", label: "Currency Name" },
                            { id: "code", label: "Code" },
                            { id: "symbol", label: "Symbol" },
                            { id: "status", label: "Status" },
                        ]}
                        emptyMessage="No currencies found."
                    />
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-white border-t border-gray-200 px-6 py-3 z-30">
                <div className="text-sm font-medium text-gray-800">
                    {totalRecords > 0
                        ? `View ${(currentPage - 1) * limit + 1} - ${Math.min(currentPage * limit, totalRecords)} of ${totalRecords}`
                        : "View 0 of 0"}
                </div>
                <div className="flex items-center gap-3">
                    <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                    <select
                        value={limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="h-9 rounded-lg border border-blue-500 bg-white px-3 text-sm text-gray-700 outline-none cursor-pointer"
                    >
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
