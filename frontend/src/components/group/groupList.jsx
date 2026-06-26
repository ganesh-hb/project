"use client";
import { decryptResponse } from "@/app/lib/crypto";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { loginContext } from "../hooks/LoginContext";
import Header from "../Header";
import { toast } from "react-toastify";
import { authHeaders } from "@/app/lib/auth";
import AppPagination from "../ui/AppPagination";

export default function GroupList() {
    const router = useRouter();
    const { isLogin } = useContext(loginContext);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [count, setCount] = useState(1);
    const LIMIT = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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
                    endpoint: "group-list",
                    module: "group",
                },
                body: JSON.stringify({ page, limit: LIMIT }),
            });

            if (response.status === 401 || response.status === 403) {
                toast.error("You don't have permission to view this list", { position: "top-right" });
                setError("Access denied.");
                return;
            }

            const payload = await response.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            setGroups(data?.data ?? []);
            setTotalPages(Math.ceil((data?.total || 1) / LIMIT));
        } catch (err) {
            toast.error(`${err}`, { position: "top-right" });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchData(page);
    };

    const gotoPages = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`http://localhost:3000${url}`);
    };

    return (
        <div className="w-full min-h-screen bg-[#f5f6fa]">
            <Header page="groups" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                <nav className="mb-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">Groups</span>
                </nav>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Groups</h1>
                    <button
                        onClick={() => router.push("/add-group")}
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition"
                    >
                        <span>+</span> Add Group
                    </button>
                </div>

                {loading && (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-xl font-semibold text-gray-500">
                        Loading groups...
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
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr className="text-gray-500 text-sm font-semibold">
                                        <th className="px-5 py-4 text-left w-[50px]">#</th>
                                        <th className="px-5 py-4 text-left">Group Name</th>
                                        <th className="px-5 py-4 text-left">Group Code</th>
                                        <th className="px-5 py-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map((group, index) => (
                                        <tr
                                            key={group.groupId || index}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => router.push(`/group/${group.groupId}`)}
                                        >
                                            <td className="px-5 py-4 text-gray-500 text-sm">{index + 1}</td>
                                            <td className="px-5 py-4 font-medium text-blue-600 hover:underline">
                                                {group.groupName
                                                    ? group.groupName.replace(/([A-Z])/g, " $1").trim()
                                                    : "-"}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">{group.description || "-"}</td>
                                            <td className="px-5 py-4">
                                                <span className={
                                                    group.status === "Active"
                                                        ? "inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                                                        : group.status === "Inactive"
                                                            ? "inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                                                            : "inline-block rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700"
                                                }>
                                                    {group.status || "Unknown"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {groups.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center text-gray-400 py-16">
                                                No groups found.
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
                <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
            </div>
        </div>
    );
}