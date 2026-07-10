"use client";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Header from "./Header";
import { userListContext } from "./hooks/UserListContext";
import { toast } from "react-toastify";
import { DataTable } from "./data-table";
import { columns } from "./Column";
import { loginContext } from "./hooks/LoginContext";
import { isSuperAdmin, isCompanyAdmin, authHeaders } from "../app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import AppPagination from "./ui/AppPagination";
import { ChevronDown } from "lucide-react";

function formatRoles(assignments) {
    if (!Array.isArray(assignments) || assignments.length === 0) return "N/A";
    return [...new Set(assignments.map((a) => a.groupName).filter(Boolean))]
        .map((n) => n.replace(/([A-Z])/g, " $1").trim())
        .join(", ");
}

function formatCompanies(assignments) {
    if (!Array.isArray(assignments) || assignments.length === 0) return "-";
    return [...new Set(assignments.map((a) => a.companyName).filter(Boolean))].join(", ");
}

export default function UsersPage() {
    const router = useRouter();
    const { users, setUsers } = useContext(userListContext);
    const { isLogin } = useContext(loginContext);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const LIMIT = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState("grid");
    const [count, setCount] = useState(1);


    const [superAdmin, setSuperAdmin] = useState(false);
    const [companyAdmin, setCompanyAdmin] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
        setSuperAdmin(isSuperAdmin(isLogin || storedUser));
        setCompanyAdmin(isCompanyAdmin(isLogin || storedUser));
    }, [isLogin]);

    const [expandedRows, setExpandedRows] = useState({});

    const toggleRow = (id) => {
        setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        fetchData(1, {});
    }, []);

    async function fetchData(page = currentPage, searchParams = {}) {
        setLoading(true);
        setError("");

        try {
            let body = { page, limit: LIMIT };

            if (searchParams.filters && searchParams.filters.length > 0) {
                body.condition = searchParams.condition || "All";
                body.filters = searchParams.filters;
            }

            const response = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    endpoint: "user-list",
                    module: "user"
                },
                body: JSON.stringify(body),
            });

            if (response.status === 401 || response.status === 403) {
                router.push("/forbidden");
                return;
            }

            if (!response.ok) {
                toast.error("Failed to fetch users", { position: "top-right" });
            }
            const payload = await response.json();


            const data = payload.encrypted
                ? decryptResponse(payload.encrypted)
                : payload;

            console.log(data.data)
            setUsers(
                Array.isArray(data)
                    ? data
                    : (data.data ?? []).map((user) => ({
                        user_userId: user.userId,
                        user_name: user.name,
                        user_fName: user.firstName,
                        user_sName: user.surname,
                        user_email: user.email,
                        user_phone: user.phone,
                        user_status: user.status,
                        user_userFile: user.userFile,
                        user_age: user.age,
                        assignments: Array.isArray(user.assignments) ? user.assignments : [],
                    }))
            );
            setTotalPages(Math.ceil((data?.total || 1) / LIMIT));
        } catch (err) {
            toast.error(`${err}`, { position: "top-right" });
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (searchParams) => {
        fetchData(1, searchParams);
    };

    const gotoUser = (e, user) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`http://localhost:3000/user/${user.user_userId}`);
    };

    const route = useRouter();

    const gotoPages = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        route.push(`http://localhost:3000${url}`);
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchData(page);
    };
    const { impersonating, loginAs, stopImpersonating, can } = useContext(loginContext);

    const handleLoginAs = async (e, user) => {
        e.stopPropagation();
        const success = await loginAs(user.user_userId);
        if (success) {
            toast.success(`Now acting as ${user.user_name}`, { position: "top-right" });
            window.location.href = "/";
        } else {
            toast.error("Failed to switch user", { position: "top-right" });
        }
    };


    return (
        <div className="w-full min-h-screen bg-[#f5f6fa] overflow-x-hidden">
            <Header onSearch={handleSearch} page="users" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                <nav
                    className="mb-6 flex items-center space-x-2 text-sm font-medium text-gray-500"
                    aria-label="Breadcrumb"
                >
                    <span
                        className="cursor-pointer transition-colors hover:text-blue-600 hover:underline"
                        onClick={(e) => gotoPages(e, "/")}
                    >
                        Home
                    </span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800" onClick={(e) => gotoPages(e, "/users")}>
                        Users
                    </span>
                    {/* {(superAdmin || companyAdmin) && (
                        <span
                            className={`ml-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${superAdmin
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                                }`}
                        >
                            {superAdmin ? "Super Admin" : "Company Admin"}
                        </span>
                    )} */}
                </nav>

                <div className="w-full">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                        <h1 className="text-2xl font-semibold text-[#1f2937]">
                            {superAdmin ? "All Users" : companyAdmin ? "Company Users" : "Users"}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3">
                            {can("userAdd") && (
                                <button
                                    onClick={() => router.push("/add-user")}
                                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors cursor-pointer"
                                >
                                    <span>+</span> Add User
                                </button>

                            )}


                            <div className="flex border rounded-md overflow-hidden bg-white ">
                                {["grid", "list", "table"].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-4 py-2 text-sm font-medium transition capitalize cursor-pointer ${viewMode === mode
                                            ? "bg-[#1d6fdc] text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {mode === "table" ? "Data Table" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {loading && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-xl font-semibold text-gray-500">
                            Loading users...
                        </div>
                    )}

                    {error && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-red-600 font-semibold">
                            {error}
                        </div>
                    )}

                    {!loading && !error && viewMode === "grid" && (
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                            {users?.map((user, index) => (
                                <div
                                    key={user.user_userId || index}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="flex h-20 w-20 min-w-[80px] items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold uppercase text-blue-600 shadow-md">
                                            <img
                                                src={`http://localhost:4000/upload/${user.user_userId}/${user.user_userFile}`}
                                                alt="userImage"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className={`font-semibold text-lg truncate ${can("userView") ? "cursor-pointer hover:underline text-[#3563e9]" : "text-gray-800"}`}
                                                onClick={(e) => can("userView") && gotoUser(e, user)}
                                            >
                                                {user.user_fName ? user.user_fName + " " + user.user_sName : user.user_name}
                                            </div>
                                            <div className="text-sm text-gray-600 break-all mt-1">
                                                {user.user_name}
                                            </div>

                                            <div
                                                className={
                                                    user.user_status === "Active"
                                                        ? "mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                                                        : user.user_status === "Inactive"
                                                            ? "mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                                                            : "mt-2 inline-block rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-700"
                                                }
                                            >
                                                {user.user_status}
                                            </div>
                                            {superAdmin && !impersonating && user.user_userId !== isLogin?.userId && (
                                                <button
                                                    onClick={(e) => handleLoginAs(e, user)}
                                                    className="mt-2 inline-block rounded-full px-3 py-1 cursor-pointer bg-blue-200 float-right"
                                                >
                                                    Login As
                                                </button>

                                            )}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600 pt-3 pb-3 border-y border-gray-200 py-1">
                                        <span className="text-[#71717b] text-xs uppercase tracking-wide">
                                            Role
                                        </span>
                                        <p className="font-semibold mt-1 break-words">
                                            {formatRoles(user.assignments)}
                                        </p>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <div className="text-sm text-gray-600 break-all">
                                            <span className="font-medium">Email:</span>{" "}
                                            {user.user_email}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">Phone:</span>{" "}
                                            {user.user_phone || "-"}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">Company:</span>{" "}
                                            {formatCompanies(user.assignments)}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {users.length === 0 && (
                                <div className="col-span-full text-center text-gray-400 py-20 bg-white rounded-xl border border-gray-200">
                                    No users found.
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && !error && viewMode === "list" && (
                        <div className="w-full bg-white rounded-2xl border border-gray-200 grid grid-cols-1 gap-5 p-4">
                            {users?.map((user, index) => {
                                const rowId = user.user_userId || index;
                                const isOpen = !!expandedRows[rowId];
                                return (
                                    <div key={rowId} className="px-6 py-6 border border-gray-200 bg-gray-50/2 rounded-xl">
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                                            <div>
                                                <div className="text-sm text-gray-500 mb-1">Name</div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 min-w-[40px] items-center justify-center overflow-hidden rounded-full bg-blue-600 text-base font-bold uppercase text-white">
                                                        {user.user_userFile ? (
                                                            <img
                                                                src={`http://localhost:4000/upload/${user.user_userId}/${user.user_userFile}`}
                                                                alt="userImage"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            (user.user_name || "?").charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div
                                                            className={`text-base font-semibold ${can("userView") ? "cursor-pointer hover:underline text-[#3563e9]" : "text-gray-800"}`}
                                                            onClick={(e) => can("userView") && gotoUser(e, user)}
                                                        >
                                                            {user.user_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{user.user_phone || "-"}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 mb-1">User Name</div>
                                                <div className="text-base text-gray-800 break-all">{user.user_name}</div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-gray-500 mb-1">Status</div>
                                                <span
                                                    className={
                                                        user.user_status === "Active"
                                                            ? "inline-block rounded-full bg-green-100 px-3 py-1 text-base text-green-700"
                                                            : user.user_status === "Inactive"
                                                                ? "inline-block rounded-full bg-red-100 px-3 py-1 text-base text-red-700"
                                                                : "inline-block rounded-full bg-sky-100 px-3 py-1 text-base text-sky-700"
                                                    }
                                                >
                                                    {user.user_status || "Inactive"}
                                                </span>
                                            </div>

                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-sm text-gray-500 mb-1">Company Name</div>
                                                    <div className="text-base text-[#3563e9] font-medium">
                                                        {formatCompanies(user.assignments)}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRow(rowId)}
                                                    aria-label={isOpen ? "Collapse" : "Expand"}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                                >
                                                    <ChevronDown
                                                        className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {isOpen && (
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 pt-4 border-gray-100">
                                                <div>
                                                    <div className="text-sm text-gray-500 mb-1">Email</div>
                                                    <div className="text-base text-gray-800 break-all">{user.user_email}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500 mb-1">Phone</div>
                                                    <div className="text-base text-gray-800 break-all">{user.user_phone}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500 mb-1">Group Name</div>
                                                    <div className="text-base text-gray-800">{formatRoles(user.assignments)}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {users.length === 0 && (
                                <div className="text-center text-gray-400 py-16">No users found.</div>
                            )}
                        </div>
                    )}

                    {!loading && !error && viewMode === "table" && (
                        <DataTable columns={columns} data={users} />
                    )}
                </div>
            </div>

            <div className="fixed bottom-0 right-0 p-4">
                <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
            </div>
        </div>
    );
}