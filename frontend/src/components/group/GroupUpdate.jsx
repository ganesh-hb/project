"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "../Header";
import { authHeaders } from "@/app/lib/auth";

export default function GroupUpdate({ id, onBack }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        groupName: "",
        groupCode: "",
        status: "active",
    });

    useEffect(() => {
        fetchGroup();
    }, []);

    const fetchGroup = async () => {
        setFetching(true);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `group-details/${id}`,
                    module: "group",
                },
            });
            const data = await res.json();
            if (data?.groupId) {
                setFormData({
                    groupName: data.groupName || "",
                    groupCode: data.groupCode || "",
                    status: data.status || "active",
                });
            }
        } catch (err) {
            toast.error("Failed to load group data.", { position: "top-right" });
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.groupName || formData.groupName.length < 2)
            errs.groupName = "Group name must be at least 2 characters.";
        if (!formData.groupCode || formData.groupCode.length < 2)
            errs.groupCode = "Group code must be at least 2 characters.";
        if (!formData.status) errs.status = "Status is required.";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/relayapi", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                    endpoint: "group-update",
                    module: "group",
                },
                body: JSON.stringify({ groupId: Number(Array.isArray(id) ? id[0] : id), ...formData }),
            });

            const data = await response.json();
            if (data?.settings?.success === 1 || data?.status?.success === 1) {
                toast.success("Group updated successfully", { position: "top-right" });
                setTimeout(() => onBack(), 1000);
            } else if (response.ok) {
                toast.success("Group updated successfully", { position: "top-right" });
                setTimeout(() => onBack(), 1000);
            } else {
                toast.error(data?.message || "Failed to update group.", { position: "top-right" });
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
                <Header page="group-update" />
                <div className="p-8 text-gray-500 text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
            <Header page="group-update" />

            <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => onBack()}>← Back to Details</span>
            </nav>

            <div className="px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800 cursor-pointer">Edit Group</h1>
                    <button
                        onClick={() => onBack()}
                        className="rounded-xl bg-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300 cursor-pointer"
                    >
                        ← Back
                    </button>
                </div>

                <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            <div>
                                <label className={labelClass}>Group Name <span className="text-red-500">*</span></label>
                                <input type="text" name="groupName" value={formData.groupName} onChange={handleChange} placeholder="Enter group name" className={inputClass} />
                                {errors.groupName && <p className={errorClass}>{errors.groupName}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Group Code <span className="text-red-500">*</span></label>
                                <input type="text" name="groupCode" value={formData.groupCode} onChange={handleChange} placeholder="e.g. GRP01" className={inputClass} />
                                {errors.groupCode && <p className={errorClass}>{errors.groupCode}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Status <span className="text-red-500">*</span></label>
                                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                    <option value="block">Block</option>
                                </select>
                                {errors.status && <p className={errorClass}>{errors.status}</p>}
                            </div>

                        </div>

                        <div className="mt-8 mb-10 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => onBack()}
                                className="rounded-xl bg-gray-200 px-8 py-3 font-medium text-gray-700 hover:bg-gray-300 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
                            >
                                {loading ? "Updating..." : "Update Group"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}