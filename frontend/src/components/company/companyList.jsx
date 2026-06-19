"use client";

import { decryptResponse } from "@/app/lib/crypto";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { loginContext } from "../hooks/LoginContext";
import Header from "../Header";
import { toast } from "react-toastify";
import { authHeaders } from "@/app/lib/auth";

export default function CompanyList() {
    const router = useRouter();
    const { isLogin } = useContext(loginContext);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [count, setCount] = useState(1);
    const limits = process.env.NEXT_PUBLIC_USERS_LIST_LIMIT || 10;
    const totalPages = 1;
    const currentPage = parseInt(count) || 1;

    useEffect(() => {
        fetchData(1);
    }, []);

    async function fetchData(page = currentPage) {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    endpoint: "company-list",
                    module: "company",
                    service: "company",
                },
                body: JSON.stringify({ page, limit: limits }),
            });

            if (response.status === 401 || response.status === 403) {
                toast.error("You don't have permission to view this list", { position: "top-right" });
                setError("Access denied.");
                return;
            }

            const payload = await response.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            setCompanies(data?.data ?? []);
        } catch (err) {
            toast.error(`${err}`, { position: "top-right" });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const goToPage = (e, page) => {
        e.preventDefault();
        if (page < 1 || page > totalPages) return;
        setCount(page);
        fetchData(page);
    };

    const gotoPages = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`http://localhost:3000${url}`);
    };

    return (
        <div className="w-full min-h-screen bg-[#f5f6fa]">
            <Header page="companies" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                <nav className="mb-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">Companies</span>
                </nav>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Companies</h1>
                    <button
                        onClick={() => router.push("#")}
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
                    >
                        <span>+</span> Add Company
                    </button>
                </div>

                {loading && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-xl font-semibold text-gray-500">
                        Loading companies...
                    </div>
                )}

                {error && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-red-600 font-semibold">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className="text-gray-500 text-sm font-semibold">
                                        <th className="px-5 py-4 text-left w-[50px]">#</th>
                                        <th className="px-5 py-4 text-left">Company Name</th>
                                        <th className="px-5 py-4 text-left">Email</th>
                                        <th className="px-5 py-4 text-left">Phone</th>
                                        <th className="px-5 py-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((company, index) => (
                                        <tr
                                            key={company.companyId || index}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                                        >
                                            <td className="px-5 py-4 text-gray-500 text-sm">{index + 1}</td>
                                            <td className="px-5 py-4 font-medium text-blue-600 hover:underline">
                                                {company.companyName}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">{company.email || "-"}</td>
                                            <td className="px-5 py-4 text-gray-600">{company.phone || "-"}</td>
                                            <td className="px-5 py-4">
                                                <span className={
                                                    company.status === "Active"
                                                        ? "inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                                                        : company.status === "Inactive"
                                                            ? "inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                                                            : "inline-block rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700"
                                                }>
                                                    {company.status || "Unknown"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {companies.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-gray-400 py-16">
                                                No companies found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 right-0 p-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => goToPage(e, currentPage - 1)}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive={currentPage === 1} onClick={(e) => goToPage(e, 1)}>1</PaginationLink>
                        </PaginationItem>
                        {currentPage > 2 && <PaginationEllipsis />}
                        {currentPage !== 1 && currentPage !== totalPages && (
                            <PaginationItem>
                                <PaginationLink href="#" isActive>{currentPage}</PaginationLink>
                            </PaginationItem>
                        )}
                        {currentPage < totalPages - 1 && <PaginationEllipsis />}
                        <PaginationItem>
                            <PaginationLink href="#" isActive={currentPage === totalPages} onClick={(e) => goToPage(e, totalPages)}>
                                {totalPages}
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => goToPage(e, currentPage + 1)}
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}