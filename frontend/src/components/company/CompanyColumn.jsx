"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { loginContext } from "@/components/hooks/LoginContext";
import { ArrowUpDown } from "lucide-react";

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function StatusBadge({ status }) {
    if (!status) return <span className="text-gray-400 text-sm">-</span>;
    const formatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const cls =
        formatted === "Active"
            ? "bg-green-100 text-green-700"
            : formatted === "Inactive"
                ? "bg-red-100 text-red-700"
                : "bg-sky-100 text-sky-700";
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${cls}`}>
            {formatted}
        </span>
    );
}

function CompanyAvatar({ company, sizeClass = "h-8 w-8" }) {
    return company.companyFile ? (
        <img
            src={`http://localhost:4000/upload/company/${company.companyId}/${company.companyFile}`}
            alt="logo"
            className={`${sizeClass} rounded-full object-cover`}
            onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
            }}
        />
    ) : (
        <span className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs`}>
            {getInitials(company.companyName)}
        </span>
    );
}

function CompanyNameCell({ row }) {
    const router = useRouter();
    const { can } = useContext(loginContext);
    const company = row.original;
    return (
        <div className="flex items-center gap-3">
            <CompanyAvatar company={company} sizeClass="h-8 w-8" />
            <span
                className={`font-semibold text-base ${can("companyView") ? "text-blue-600 cursor-pointer hover:underline" : "text-gray-800"}`}
                onClick={() => can("companyView") && router.push(`/company/${company.companyId}`)}
            >
                {company.companyName}
            </span>
        </div>
    );
}

function sortableHeader(label) {
    const SortableHeaderComponent = ({ column }) => (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold text-[#4b5563] text-sm px-0 hover:bg-transparent"
        >
            {label}
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
    );
    SortableHeaderComponent.displayName = `SortableHeader_${label.replace(/\s+/g, "")}`;
    return SortableHeaderComponent;
}

export const companyColumns = [
    {
        accessorKey: "companyName",
        header: sortableHeader("Company"),
        cell: ({ row }) => <CompanyNameCell row={row} />,
        filterFn: "includesString",
    },
    {
        accessorKey: "companyCode",
        header: sortableHeader("Code"),
        cell: ({ row }) => (
            <span className="text-gray-700 text-sm">{row.getValue("companyCode") || "-"}</span>
        ),
        filterFn: "includesString",
    },
    {
        accessorKey: "email",
        header: sortableHeader("Email"),
        cell: ({ row }) => (
            <span className="text-gray-700 text-sm">{row.getValue("email") || "-"}</span>
        ),
        filterFn: "includesString",
    },
    {
        accessorKey: "phone",
        header: sortableHeader("Phone"),
        cell: ({ row }) => {
            const dialCode = row.original.dialCode || 0;
            const phone = row.original.phone || "-";
            return <span className="text-gray-700 text-sm">+{dialCode} {phone}</span>;
        },
        filterFn: "includesString",
    },
    {
        accessorKey: "website",
        header: () => <span className="font-semibold text-gray-600 text-sm">Website</span>,
        cell: ({ row }) => {
            const website = row.getValue("website");
            return website ? (
                <a href={website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                    {website}
                </a>
            ) : (
                <span className="text-gray-400 text-sm">-</span>
            );
        },
    },
    {
        accessorKey: "companyLocation",
        header: sortableHeader("Location"),
        cell: ({ row }) => (
            <span className="text-gray-700 text-sm">{row.getValue("companyLocation") || "-"}</span>
        ),
        filterFn: "includesString",
    },
    {
        id: "owner",
        header: () => <span className="font-semibold text-gray-600 text-sm">Owner</span>,
        cell: ({ row }) => (
            <div className="flex flex-col text-sm text-gray-700">
                <div className="font-medium">{row.original.ownerName || "-"}</div>
                <div className="text-xs text-gray-400">{row.original.ownerPhone || ""}</div>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: sortableHeader("Status"),
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        filterFn: "includesString",
    },
];
