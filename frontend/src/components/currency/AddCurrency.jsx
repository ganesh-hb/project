"use client";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Header from "../Header";
import { CurrencyFormSchema } from "../Zod";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { loginContext } from "../hooks/LoginContext";

const MySwal = withReactContent(Swal);

export default function AddCurrency() {
    const { displayUser } = useContext(loginContext);
    console.log(displayUser, "DIsplay user currency add")
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        symbol: "",
        conversionRate: "",
        status: "Active",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const onBack = async () => {
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
        if (result.isConfirmed) router.push("/currency-list");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = CurrencyFormSchema.safeParse(formData);
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

        const res = await MySwal.fire({
            title: 'Add New Currency?',
            text: "Are you sure you want to add this currency to the system?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'Cancel'
        });

        if (res.isConfirmed) {
            setLoading(true);
            try {
                const response = await fetch("/relayapi", {
                    method: "POST",
                    headers: {
                        "endpoint": "currency-add",
                        "module": "currency",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        addedBy: displayUser.userId,
                        conversionRate: Number(formData.conversionRate),
                    }),
                });

                const data = await response.json();
                if (response.status === 401 || response.status === 403) {
                    router.push("/forbidden");
                    return;
                }

                if (response.ok && data?.settings?.success === 1) {
                    toast.success("Currency created successfully", { position: "top-right" });
                    setTimeout(() => router.push("/currency-list"), 1000);
                } else {
                    toast.error(data?.message || "Failed to create currency.", { position: "top-right" });
                }
            } catch (err) {
                toast.error(`${err}`, { position: "top-right" });
            } finally {
                setLoading(false);
            }
        }
    };

    const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-sm";
    const labelClass = "mb-2 block text-sm font-medium text-gray-700";
    const errorClass = "mt-1 text-sm text-red-500";

    return (
        <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
            <Header page="currency-add" />

            <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                <span className="text-gray-400">{">>"}</span>
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/currency-list")}>Currencies</span>
                <span className="text-gray-400">{">>"}</span>
                <span className="text-gray-800 cursor-pointer">Add Currency</span>
            </nav>

            <div className="px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800">Add Currency</h1>
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
                                    <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. USD" className={inputClass} />
                                    {errors.code && <p className={errorClass}>{errors.code}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Currency Symbol <span className="text-red-500">*</span></label>
                                    <input type="text" name="symbol" value={formData.symbol} onChange={handleChange} placeholder="e.g. $" className={inputClass} />
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
                            onClick={onBack}
                            className="px-6 py-2 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
                        >
                            {loading ? "Creating..." : "Add Currency"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
