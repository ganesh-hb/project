"use client";

import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function DataTable({
    columns,
    data,
    filterableColumns = [
        { id: "user_name", label: "Name" },
        { id: "user_email", label: "Email" },
        { id: "user_phone", label: "Phone" },
        { id: "user_age", label: "Age" },
        { id: "role", label: "Role" },
        { id: "company", label: "Company" },
        { id: "user_status", label: "Status" },
    ],
    emptyMessage = "No results found."
}) {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [showFilters, setShowFilters] = React.useState(false);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    const setFilter = (colId, value) => {
        table.getColumn(colId)?.setFilterValue(value || undefined);
    };

    const getFilter = (colId) =>
        table.getColumn(colId)?.getFilterValue() ?? "";

    return (
        <div className="space-y-3">

            {/* Filter toggle button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
            </div>

            {/* Per-column search inputs */}
            {showFilters && (
                <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Filter by column</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                        {filterableColumns.map(({ id, label }) => (
                            <div key={id}>
                                <label className="block text-xs text-gray-500 mb-1 font-medium">
                                    {label}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={getFilter(id)}
                                    onChange={(e) => setFilter(id, e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-gray-50 border-b-2 border-gray-200">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="px-5 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="px-5 py-4 text-base align-middle"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="text-center h-32 text-gray-400 text-base"
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-500">
                    Page{" "}
                    <span className="font-semibold text-gray-700">
                        {table.getState().pagination.pageIndex + 1}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">{table.getPageCount()}</span>
                    {" "}· {table.getFilteredRowModel().rows.length} result{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="cursor-pointer"
                    >
                        ← Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="cursor-pointer"
                    >
                        Next →
                    </Button>
                </div>
            </div>
        </div>
    );
}