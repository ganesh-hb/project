"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { loginContext } from "@/components/hooks/LoginContext";

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
];