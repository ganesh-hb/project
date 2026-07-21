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
import { DataTable } from "../data-table";

const groupColumns = [
    {
        accessorKey: "groupName",
        header: "Group Name",
        cell: ({ row }) => {
            const group = row.original;
            return (
                <span className="font-semibold text-blue-600 hover:underline">
                    {group.groupName ? group.groupName.replace(/([A-Z])/g, " $1").trim() : "-"}
                </span>
            );
        },
        filterFn: "includesString"
    },
    {
        accessorKey: "groupCode",
        header: "Group Code",
        cell: ({ row }) => <span>{row.getValue("groupCode") || "-"}</span>,
        filterFn: "includesString"
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") || "inactive";
            const formatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            const cls =
                formatted === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700";
            return (
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${cls}`}>
                    {formatted}
                </span>
            );
        },
        filterFn: "includesString"
    }
];

export default function GroupList() {
    const router = useRouter();
    const { isLogin, can } = useContext(loginContext);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [count, setCount] = useState(1);
    const LIMIT = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentFilters, setCurrentFilters] = useState({});
    useEffect(() => {
        fetchData(1, {});
    }, []);

    async function fetchData(page = currentPage, searchParams = currentFilters) {
        setLoading(true);
        setError("");
        try {
            let body = { page, limit: LIMIT };
            if (searchParams?.filters?.length > 0) {
                body.condition = searchParams.condition || "All";
                body.filters = searchParams.filters;
            }
            const response = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    endpoint: "group-list",
                    module: "group",
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
            setGroups(data?.data ?? []);
            setTotalPages(Math.ceil((data?.total || 1) / LIMIT));
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
        <div className="fixed inset-0 flex flex-col bg-[#f5f6fa] overflow-hidden">
            <Header page="groups" onSearch={handleSearch} onAddClick={() => router.push("/add-group")} />

            <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0 overflow-hidden">
                <nav className="mb-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">Groups</span>
                </nav>

                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
                    <DataTable
                        title="Groups"
                        columns={groupColumns}
                        data={groups}
                        filterableColumns={[
                            { id: "groupName", label: "Group Name" },
                            { id: "groupCode", label: "Group Code" },
                            { id: "status", label: "Status" },
                        ]}
                        emptyMessage="No groups found."
                        onRowClick={(group) => can("groupView") && router.push(`/group/${group.groupId}`)}
                        containerClassName="flex-1 overflow-y-auto"
                    />
                )}
                </div>
            </div>

            <div className="w-full flex items-center justify-between bg-white border-t border-gray-200 px-6 py-3 z-30">
                <div className="text-sm font-medium text-gray-800">
                    View {groups.length} records
                </div>
                <div className="flex items-center gap-3">
                    <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                </div>
            </div>
        </div>
    );
}