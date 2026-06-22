"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import Header from "../Header";


export default function AddCompany() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        companyName: "",
        companyCode: "",
        companyLocation: "",
        status: "active",
        email: "",
        website: "",
        dialCode: "",
        phone: "",
        country: "",
        state: "",
        postalCode: "",
        AddressLineOne: "",
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
    });

    const [companyFile, setCompanyFile] = useState(null);
    const [preview, setPreview] = useState("");
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

    const handleImage = (e) => {
        const file = e?.target?.files[0];
        if (!file) return;
        const allowed = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowed.includes(file.type)) {
            setErrors((prev) => ({ ...prev, companyFile: "Only JPG/PNG files are accepted." }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, companyFile: "Max file size is 5MB." }));
            return;
        }
        setErrors((prev) => ({ ...prev, companyFile: "" }));
        setCompanyFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.companyName.trim()) newErrors.companyName = "Company name is required.";
        if (!formData.companyCode.trim()) newErrors.companyCode = "Company code is required.";
        if (!formData.status) newErrors.status = "Status is required.";
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Enter a valid email.";
        if (formData.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail))
            newErrors.ownerEmail = "Enter a valid owner email.";
        if (!companyFile) newErrors.companyFile = "Company logo is required.";
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
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    payload.append(key, String(value));
                }
            });
            if (companyFile) payload.append("companyFile", companyFile);

            // console.log(...payload)

            const response = await fetch("http://localhost:3000/relayapi", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    endpoint: "company-add",
                    module: "company",
                },
                body: payload,
            });

            const data = await response.json();
            if (response.ok && data?.settings?.success === 1) {
                toast.success("Company created successfully", { position: "top-right" });
                setTimeout(() => router.push("/company-list"), 1000);
            } else {
                toast.error(data?.message || "Failed to create company.", { position: "top-right" });
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
            <Header page="company-add" />

            <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/")}>Home</span>
                <span className="text-gray-400">{">>"}</span>
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={(e) => gotoPages(e, "/company-list")}>Companies</span>
                <span className="text-gray-400">{">>"}</span>
                <span className="text-gray-800 cursor-pointer">Add Company</span>
            </nav>

            <div className="px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800">Add Company</h1>
                    <button
                        onClick={() => router.push("/companies")}
                        className="rounded-xl bg-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300"
                    >
                        ← Back
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">

                        {/* Basic Info */}
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Basic Information</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                                <div>
                                    <label className={labelClass}>Company Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter company name" className={inputClass} />
                                    {errors.companyName && <p className={errorClass}>{errors.companyName}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Company Code <span className="text-red-500">*</span></label>
                                    <input type="text" name="companyCode" value={formData.companyCode} onChange={handleChange} placeholder="e.g. ACME01" className={inputClass} />
                                    {errors.companyCode && <p className={errorClass}>{errors.companyCode}</p>}
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

                                <div>
                                    <label className={labelClass}>Location</label>
                                    <input type="text" name="companyLocation" value={formData.companyLocation} onChange={handleChange} placeholder="Enter company location" className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="company@email.com" className={inputClass} />
                                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Website</label>
                                    <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className={inputClass} />
                                </div>

                                {/* Logo */}
                                <div className="lg:col-span-2">
                                    <label className={labelClass}>Company Logo <span className="text-red-500">*</span></label>
                                    <input type="file" accept="image/*" onChange={handleImage} className={inputClass} />
                                    {errors.companyFile && <p className={errorClass}>{errors.companyFile}</p>}
                                    {preview && (
                                        <div className="mt-4">
                                            <img src={preview} alt="preview" className="h-24 w-24 rounded-xl object-cover border" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Contact Information</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                                <div>
                                    <label className={labelClass}>Dial Code</label>
                                    <input type="number" name="dialCode" value={formData.dialCode} onChange={handleChange} placeholder="e.g. 91" className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input type="number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Address</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                                <div className="lg:col-span-2">
                                    <label className={labelClass}>Address Line</label>
                                    <input type="text" name="AddressLineOne" value={formData.AddressLineOne} onChange={handleChange} placeholder="Street address" className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Postal Code</label>
                                    <input type="number" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal / ZIP code" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Owner Info */}
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Owner Information</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                                <div>
                                    <label className={labelClass}>Owner Name</label>
                                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Owner full name" className={inputClass} />
                                </div>

                                <div>
                                    <label className={labelClass}>Owner Email</label>
                                    <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} placeholder="owner@email.com" className={inputClass} />
                                    {errors.ownerEmail && <p className={errorClass}>{errors.ownerEmail}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Owner Phone</label>
                                    <input type="text" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="Owner phone number" className={inputClass} />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 mb-10 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
                        >
                            {loading ? "Creating..." : "Add Company"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}