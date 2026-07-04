"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "../Header";
import { authHeaders } from "@/app/lib/auth";
import { CompanyUpdateSchema } from "../Zod";

export default function CompanyUpdate({ id, onBack }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState({});
    const [companyFile, setCompanyFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [currencies, setCurrencies] = useState([]);

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
        curId: "",
        ownerPhone: "",
    });

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        setFetching(true);
        try {
            const res = await fetch("/relayapi", {
                method: "GET",
                headers: {
                    ...authHeaders(),
                    endpoint: `company-details/${id}`,
                    module: "company",
                },
            });
            const data = await res.json();
            if (data?.companyId) {
                setFormData({
                    companyName: data.companyName || "",
                    companyCode: data.companyCode || "",
                    companyLocation: data.companyLocation || "",
                    status: data.status || "active",
                    email: data.email || "",
                    website: data.website || "",
                    dialCode: data.dialCode || "",
                    phone: data.phone || "",
                    country: data.country || "",
                    state: data.state || "",
                    postalCode: data.postalCode || "",
                    AddressLineOne: data.AddressLineOne || "",
                    ownerName: data.ownerName || "",
                    ownerEmail: data.ownerEmail || "",
                    ownerPhone: data.ownerPhone || "",
                    curId: data.curId || "",
                });

                setCurrencies(data.allCurrencies || []);
                if (data.companyFile) {
                    setPreview(`http://localhost:4000/upload/company/${data.companyId}/${data.companyFile}`);
                }
            }
        } catch (err) {
            toast.error("Failed to load company data.", { position: "top-right" });
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImage = (e) => {
        const file = e?.target?.files[0];
        if (!file) return;
        setErrors((prev) => ({ ...prev, companyFile: "" }));
        setCompanyFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = CompanyUpdateSchema.safeParse({
            ...formData,
            companyFile: companyFile || undefined,
        });

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) fieldErrors[err.path[0]] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);
        try {
            const payload = new FormData();
            payload.append("companyId", String(id));
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    payload.append(key, String(value));
                }
            });
            if (companyFile) payload.append("companyFile", companyFile);

            const response = await fetch("http://localhost:3000/relayapi", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    endpoint: "company-update",
                    module: "company",
                },
                body: payload,
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Company updated successfully", { position: "top-right" });
                setTimeout(() => onBack(), 1000);
            } else {
                toast.error(data?.message || "Failed to update company.", { position: "top-right" });
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
                <Header page="company-update" />
                <div className="p-8 text-gray-500 text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
            <Header page="company-update" />

            <nav className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500">
                <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => onBack()}>← Back to Details</span>
            </nav>

            <div className="px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800">Edit Company</h1>
                    <button
                        onClick={() => onBack()}
                        className="rounded-xl bg-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300 cursor-pointer"
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
                                    {errors.companyLocation && <p className={errorClass}>{errors.companyLocation}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="company@email.com" className={inputClass} />
                                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Website</label>
                                    <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className={inputClass} />
                                    {errors.website && <p className={errorClass}>{errors.website}</p>}
                                </div>

                                <div className="lg:col-span-2">
                                    <label className={labelClass}>Company Logo</label>
                                    <input type="file" accept="image/*" onChange={handleImage} className={inputClass} />
                                    {errors.companyFile && <p className={errorClass}>{errors.companyFile}</p>}
                                    {preview && (
                                        <div className="mt-4">
                                            <img src={preview} alt="preview" className="h-24 w-24 rounded-xl object-cover border" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>Currency</label>
                                    <select name="curId" value={formData.curId} onChange={handleChange} className={inputClass}>
                                        <option value="">Select currency</option>
                                        {currencies.map((c) => (
                                            <option key={c.curId} value={c.curId}>
                                                {c.name} ({c.code}) {c.symbol}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.curId && <p className={errorClass}>{errors.curId}</p>}
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
                                    {errors.dialCode && <p className={errorClass}>{errors.dialCode}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input type="number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" className={inputClass} />
                                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
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
                                    {errors.AddressLineOne && <p className={errorClass}>{errors.AddressLineOne}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className={inputClass} />
                                    {errors.country && <p className={errorClass}>{errors.country}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className={inputClass} />
                                    {errors.state && <p className={errorClass}>{errors.state}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Postal Code</label>
                                    <input type="number" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal / ZIP code" className={inputClass} />
                                    {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}
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
                                    {errors.ownerName && <p className={errorClass}>{errors.ownerName}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Owner Email</label>
                                    <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} placeholder="owner@email.com" className={inputClass} />
                                    {errors.ownerEmail && <p className={errorClass}>{errors.ownerEmail}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Owner Phone</label>
                                    <input type="text" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="Owner phone number" className={inputClass} />
                                    {errors.ownerPhone && <p className={errorClass}>{errors.ownerPhone}</p>}
                                </div>
                            </div>
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
                            className="rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer"
                        >
                            {loading ? "Updating..." : "Update Company"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}