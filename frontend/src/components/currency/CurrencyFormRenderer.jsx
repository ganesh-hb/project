"use client";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Header from "../Header";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { authHeaders } from "@/app/lib/auth";
import { decryptResponse } from "@/app/lib/crypto";
import { loginContext } from "../hooks/LoginContext";
import { currencyFormConfig } from "./configs/currencyForm.config";

const MySwal = withReactContent(Swal);

export default function CurrencyFormRenderer({ context = "currency-add", id, onBack }) {
    const router = useRouter();
    const { displayUser } = useContext(loginContext) || {};
    const config = currencyFormConfig.contexts[context] || currencyFormConfig.contexts["currency-add"];

    const initialFormData = config.fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue ?? "";
        return acc;
    }, {});

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(config.mode === "update");

    useEffect(() => {
        if (config.mode === "update" && id) {
            fetchCurrencyDetails();
        } else {
            setFetching(false);
        }
    }, [context, id]);

    const fetchCurrencyDetails = async () => {
        setFetching(true);
        try {
            const numericId = Number(Array.isArray(id) ? id[0] : id);
            const endpoint = `${config.api.fetchEndpoint}/${numericId}`;
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint,
                    module: config.api.module,
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

    const gotoPages = async (e, url) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
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
            if (url === "/currency" && onBack) {
                onBack();
            } else {
                router.push(url);
            }
        }
    };

    const handleCancel = async () => {
        const result = await MySwal.fire({
            title: "Discard changes?",
            text: "Any unsaved data will be lost.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6b7280",
            confirmButtonText: config.mode === "update" ? "Yes, discard" : "Yes, go back",
            cancelButtonText: "Stay",
        });
        if (result.isConfirmed) {
            if (config.cancelAction === "callback" && onBack) {
                onBack();
            } else if (config.cancelRedirectUrl) {
                router.push(config.cancelRedirectUrl);
            } else if (onBack) {
                onBack();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numericId = Number(Array.isArray(id) ? id[0] : id);
        const validationInput = config.mode === "update"
            ? { ...formData, curId: numericId }
            : formData;

        const result = config.schema.safeParse(validationInput);
        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((err) => {
                const field = err.path[0];
                if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        const confirmTitle = config.mode === "update" ? "Update Currency?" : "Add New Currency?";
        const confirmText = config.mode === "update"
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to add this currency to the system?";
        const confirmButtonText = config.mode === "update" ? "Yes, update it!" : "Yes, add it!";

        const confirmRes = await MySwal.fire({
            title: confirmTitle,
            text: confirmText,
            icon: config.mode === "update" ? "question" : "info",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            confirmButtonText: confirmButtonText,
            cancelButtonText: "Cancel"
        });

        if (!confirmRes.isConfirmed) return;

        setLoading(true);
        try {
            const payload = config.mode === "update"
                ? {
                    curId: numericId,
                    ...formData,
                    conversionRate: Number(formData.conversionRate),
                }
                : {
                    ...formData,
                    ...(displayUser?.userId ? { addedBy: displayUser.userId } : {}),
                    conversionRate: Number(formData.conversionRate),
                };

            const headers = {
                "Content-Type": "application/json",
                endpoint: config.api.endpoint,
                module: config.api.module,
            };

            const response = await fetch("/relayapi", {
                method: config.api.method,
                headers,
                body: JSON.stringify(payload),
            });

            const resJson = await response.json();
            const data = resJson?.encrypted ? decryptResponse(resJson.encrypted) : resJson;

            if (response.status === 401 || response.status === 403) {
                router.push("/forbidden");
                return;
            }

            if (response.ok && (data?.settings?.success === 1 || data?.success === 1)) {
                toast.success(config.successMessage, { position: "top-right" });
                setTimeout(() => {
                    if (config.onSuccessAction === "callback" && onBack) {
                        onBack();
                    } else if (config.successRedirectUrl) {
                        router.push(config.successRedirectUrl);
                    } else if (onBack) {
                        onBack();
                    }
                }, 1000);
            } else {
                toast.error(data?.message || "Operation failed.", { position: "top-right" });
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
                <Header page={config.headerPage} />
                <div className="p-8 text-gray-500 text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    const mainFields = config.fields.filter((f) => f.name !== "status" && !f.hidden);
    const statusField = config.fields.find((f) => f.name === "status" && !f.hidden);

    return (
        <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
            <Header page={config.headerPage} />

            <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                {config.breadcrumbs.map((crumb, idx) => (
                    <span key={idx} className="flex items-center space-x-2">
                        {idx > 0 && <span className="text-gray-400">{">>"}</span>}
                        {crumb.active ? (
                            <span className="text-gray-800 cursor-pointer">{crumb.label}</span>
                        ) : (
                            <span
                                className="cursor-pointer hover:text-blue-600 hover:underline"
                                onClick={(e) => gotoPages(e, crumb.url)}
                            >
                                {crumb.label}
                            </span>
                        )}
                    </span>
                ))}
            </nav>

            <div className="px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800">{config.title}</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Currency Details</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {mainFields.map((field) => (
                                    <div key={field.name}>
                                        <label className={labelClass}>
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={field.type || "text"}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            readOnly={field.readOnly}
                                            placeholder={field.placeholder}
                                            className={inputClass}
                                        />
                                        {errors[field.name] && <p className={errorClass}>{errors[field.name]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {statusField && (
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
                                            {statusField.options?.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 mb-10 flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={
                                config.mode === "update"
                                    ? "rounded-xl bg-gray-200 px-8 py-3 font-medium text-gray-700 hover:bg-gray-300 transition cursor-pointer"
                                    : "px-6 py-2 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                            }
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
                        >
                            {loading ? config.loadingButtonText : config.submitButtonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
