"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "../Header";
import { authHeaders } from "@/app/lib/auth";
import { CurrencyUpdateSchema } from "../Zod";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useRouter } from "next/navigation";
import { decryptResponse } from "@/app/lib/crypto";

const MySwal = withReactContent(Swal);

export default function CurrencyUpdate({ id, onBack }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        conversionRate: "",
        status: "Active",
    });

    useEffect(() => {
        fetchCurrency();
    }, [id]);

    const fetchCurrency = async () => {
        setFetching(true);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `currency-details/${id}`,
                    module: "currency",
                },
            });
            const payload = await res.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;

            if (data?.curId) {
                setFormData({
                    name: data.name || "",
                    code: data.code || "",
                    symbol: data.symbol || "",
                    conversionRate: data.conversionRate !== undefined ? String(data.conversionRate) : "",
                    status: data.status || "Active",
                });
            }
        } catch (err) {
            toast.error("Failed to load currency data.", { position: "top-right" });
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await MySwal.fire({
            title: 'Update Currency?',
            text: "Are you sure you want to save these changes?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update it!'
        });

        if (!res.isConfirmed) return;

        const result = CurrencyUpdateSchema.safeParse({
            ...formData,
            curId: id,
        });

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0];
                if (field && !fieldErrors[field]) {
                    fieldErrors[field] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/relayapi", {
                method: "PUT",
                headers: {
                    endpoint: "currency-update",
                    module: "currency",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    curId: Number(id),
                    ...formData,
                    conversionRate: Number(formData.conversionRate),
                }),
            });

            const payload = await response.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;

            if (response.ok && data?.success === 1) {
                toast.success("Currency updated successfully", { position: "top-right" });
                setTimeout(() => onBack(), 1000);
            } else {
                toast.error(data?.message || "Failed to update currency.", { position: "top-right" });
            }
        } catch (err) {
            toast.error(`${err}`, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-sm";
    const labelClass = "mb-2 block text-sm font-medium text-gray-700";
    const errorClass = "mt-1 text-sm text-red-500";

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#f5f6f8]">
                <Header page="currency-update" />
                <div className="p-8 text-gray-500 text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    const gotoPages = async (e, url) => {
        e.stopPropagation();
        e.preventDefault();
        const result = await MySwal.fire({
            title: "Discard changes?",
            text: "Any unsaved data will be lost.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, go back",
            cancelButtonText: "Stay",
        });
        if (result.isConfirmed) {
            router.push(url);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
            <Header page="currency-update" />

            <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                <span className="text-gray-400">{">>"}</span>
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/currency-list")}>Currencies</span>
                <span className="text-gray-400">{">>"}</span>
                <span className="text-gray-800 cursor-pointer">Edit Currency</span>
            </nav>

            <div className="px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800">Edit Currency</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Currency Details</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Currency Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. US Dollar" className={inputClass} />
                                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Currency Code <span className="text-red-500">*</span></label>
                                    <input type="text" name="code" value={formData.code} readOnly placeholder="e.g. USD" className={inputClass} />
                                    {errors.code && <p className={errorClass}>{errors.code}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Currency Symbol <span className="text-red-500">*</span></label>
                                    <input type="text" name="symbol" value={formData.symbol} readOnly placeholder="e.g. $" className={inputClass} />
                                    {errors.symbol && <p className={errorClass}>{errors.symbol}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Conversion Rate <span className="text-red-500">*</span></label>
                                    <input type="text" name="conversionRate" value={formData.conversionRate} onChange={handleChange} placeholder="e.g. 1.0" className={inputClass} />
                                    {errors.conversionRate && <p className={errorClass}>{errors.conversionRate}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-8 shadow-sm mb-6">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Status</h2>
                            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
                                <div className="w-full">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Status <span className="text-red-500 text-[16px]">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 mb-10 flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={async () => {
                                const result = await MySwal.fire({
                                    title: "Discard changes?",
                                    text: "Any unsaved data will be lost.",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#d33",
                                    cancelButtonColor: "#6b7280",
                                    confirmButtonText: "Yes, discard",
                                    cancelButtonText: "Stay",
                                });
                                if (result.isConfirmed) onBack();
                            }}
                            className="rounded-xl bg-gray-200 px-8 py-3 font-medium text-gray-700 hover:bg-gray-300 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer"
                        >
                            {loading ? "Updating..." : "Update Currency"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
