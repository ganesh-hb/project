"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Header from "../Header";

export default function AddGroup() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        groupName: "",
        groupCode: "",
        status: "active",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const gotoPages = (e, url) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(url);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.groupName.trim()) newErrors.groupName = "Group name is required.";
        if (!formData.groupCode.trim()) newErrors.groupCode = "Group code is required.";
        if (!formData.status) newErrors.status = "Status is required.";
        return newErrors;
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
            const response = await fetch("http://localhost:3000/relayapi", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    endpoint: "group-add",
                    module: "group",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data?.settings?.success === 1) {
                toast.success("Group created successfully", { position: "top-right" });
                setTimeout(() => router.push("/group-list"), 1000);
            } else {
                toast.error(data?.message || data?.settings?.message || JSON.stringify(data) || "Failed to create group.", { position: "top-right" });
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

    return (
        <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
            <Header page="group-add" />

            <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                <span className="text-gray-400">{">>"}</span>
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/group-list")}>Groups</span>
                <span className="text-gray-400">{">>"}</span>
                <span className="text-gray-800">Add Group</span>
            </nav>

            <div className="px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800 ">Add Group</h1>
                    <button
                        onClick={() => router.push("/group-list")}
                        className="rounded-xl bg-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300 cursor-pointer"
                    >
                        ← Back
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="rounded-2xl bg-white p-8 shadow-sm">
                        <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Group Information</h2>
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
                    </div>

                    <div class="mt-8 mb-10 flex justify-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer"
                        >
                            {loading ? "Creating..." : "Add Group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}