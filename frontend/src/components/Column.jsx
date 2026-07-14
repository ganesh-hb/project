"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { loginContext } from "@/components/hooks/LoginContext";
import { isSuperAdmin } from "@/app/lib/auth";
import { toast } from "react-toastify";
import { ArrowUpDown, LogIn, RotateCw } from "lucide-react";

function StatusBadge({ status }) {
    if (!status) return <span className="text-gray-400 text-sm">-</span>;
    const cls =
        status === "Active"
            ? "bg-green-100 text-green-700"
            : status === "Inactive"
                ? "bg-red-100 text-red-700"
                : "bg-sky-100 text-sky-700";
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${cls}`}>
            {status}
        </span>
    );
}

function NameCell({ row }) {
    const router = useRouter();
    const { can } = useContext(loginContext);
    return (
        <span
            className={`font-semibold text-base ${can("userView") ? "text-blue-600 cursor-pointer hover:underline" : "text-gray-800"}`}
            onClick={() => can("userView") && router.push(`/user/${row.original.user_userId}`)}
        >
            {row.getValue("user_name")}
        </span>
    );
}

function RoleCell({ row }) {
    const assignments = row.original.assignments || [];
    const roles = [...new Set(assignments.map((a) => a.groupName).filter(Boolean))];
    if (!roles.length) return <span className="text-gray-400 text-sm">-</span>;
    return (
        <div className="flex flex-wrap gap-1">
            {roles.map((r) => (
                <span key={r} className="rounded-full px-2 py-0.5 text-sm font-medium">
                    {r.replace(/([A-Z])/g, " $1").trim()}
                </span>
            ))}
        </div>
    );
}

function LoginAsCell({ row }) {
    const router = useRouter();
    const { isLogin, impersonating, loginAs } = useContext(loginContext);
    const user = row.original;

    const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const superAdmin = isSuperAdmin(isLogin || storedUser);

    const canLoginAs = superAdmin && !impersonating && user.user_userId !== isLogin?.userId;

    if (!canLoginAs) return <span className="text-gray-400 text-sm">-</span>;

    const handleLoginAs = async (e) => {
        e.stopPropagation();
        const success = await loginAs(user.user_userId);
        if (success) {
            toast.success(`Now acting as ${user.user_name}`, { position: "top-right" });
            window.location.href = "/";
        } else {
            toast.error("Failed to switch user", { position: "top-right" });
        }
    };

    const handleResetPassword = (e) => {
        e.stopPropagation();
        router.push(`/admin-reset-pass?userId=${user.user_userId}`);
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleLoginAs}
                title="Login As"
                className="text-gray-500 hover:text-blue-600 transition cursor-pointer"
            >
                <LogIn className="h-4 w-4" />
            </button>
            <button
                onClick={handleResetPassword}
                title="Reset Password"
                className="text-gray-500 hover:text-blue-600 transition cursor-pointer"
            >
                <RotateCw className="h-4 w-4" />
            </button>
        </div>
    );
}

function CompanyCell({ row }) {
    const assignments = row.original.assignments || [];
    const companies = [...new Set(assignments.map((a) => a.companyName).filter(Boolean))];
    if (!companies.length) return <span className="text-gray-400 text-sm">-</span>;
    return (
        <div className="flex flex-wrap gap-1">
            {companies.map((c) => (
                <span key={c} className="rounded-full px-2 py-0.5 text-sm font-medium">
                    {c}
                </span>
            ))}
        </div>
    );
}

function sortableHeader(label) {
    return ({ column }) => (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-gray-600 text-sm px-0 hover:bg-transparent"
        >
            {label}
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
    );
}

export const columns = [
    {
        accessorKey: "user_name",
        header: sortableHeader("Name"),
        cell: ({ row }) => <NameCell row={row} />,
        filterFn: "includesString",
    },
    {
        accessorKey: "user_email",
        header: sortableHeader("Email"),
        cell: ({ row }) => (
            <span className="text-gray-700 text-sm">{row.getValue("user_email") || "-"}</span>
        ),
        filterFn: "includesString",
    },
    {
        accessorKey: "user_phone",
        header: sortableHeader("Phone"),
        cell: ({ row }) => (
            <span className="text-gray-700 text-sm">{row.getValue("user_phone") || "-"}</span>
        ),
        filterFn: "includesString",
    },
    {
        accessorKey: "user_age",
        header: sortableHeader("Age"),
        cell: ({ row }) => (
            <span className="text-gray-700 text-sm">{row.getValue("user_age") || "-"}</span>
        ),
        filterFn: "includesString",
    },
    {
        id: "role",
        header: () => <span className="font-semibold text-gray-600 text-sm">Role</span>,
        cell: ({ row }) => <RoleCell row={row} />,
        filterFn: (row, _id, filterValue) => {
            const assignments = row.original.assignments || [];
            return assignments.some((a) =>
                a.groupName?.toLowerCase().includes(filterValue.toLowerCase())
            );
        },
    },
    {
        id: "company",
        header: () => <span className="font-semibold text-gray-600 text-sm">Company</span>,
        cell: ({ row }) => <CompanyCell row={row} />,
        filterFn: (row, _id, filterValue) => {
            const assignments = row.original.assignments || [];
            return assignments.some((a) =>
                a.companyName?.toLowerCase().includes(filterValue.toLowerCase())
            );
        },
    },
    {
        accessorKey: "user_status",
        header: sortableHeader("Status"),
        cell: ({ row }) => <StatusBadge status={row.getValue("user_status")} />,
        filterFn: "includesString",
    },
    {
        id: "loginAs",
        header: () => <span className="font-semibold text-gray-600 text-sm">Login As</span>,
        cell: ({ row }) => <LoginAsCell row={row} />,
    },
];