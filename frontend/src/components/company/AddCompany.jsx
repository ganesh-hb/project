"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import Header from "../Header";
import { CompanyUpdateSchema } from "../Zod";
import { City, Country, State } from "country-state-city";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);


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
        city: "",
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
    });

    const [companyFile, setCompanyFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [countries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        if (formData.country) {
            setStates(State.getStatesOfCountry(formData.country));
            setFormData((prev) => ({ ...prev, state: "", city: "" }));
            setCities([]);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [formData.country]);

    useEffect(() => {
        if (formData.country && formData.state) {
            setCities(City.getCitiesOfState(formData.country, formData.state));
            setFormData((prev) => ({ ...prev, city: "" }));
        } else {
            setCities([]);
        }
    }, [formData.state, formData.country]);

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

    const [currencies, setCurrencies] = useState([]);

    useEffect(() => {
        fetch("/relayapi", {
            method: "GET",
            headers: { ...authHeaders(), endpoint: "currency-list", module: "company" },
        })
            .then((r) => r.json())
            .then((data) => setCurrencies(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);

    const handleImage = (e) => {
        const file = e?.target?.files[0];
        if (!file) return;
        setErrors((prev) => ({ ...prev, companyFile: "" }));
        setCompanyFile(file);
        setPreview(URL.createObjectURL(file));
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
        if (result.isConfirmed) router.push("/company-list");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = CompanyUpdateSchema.safeParse({ ...formData, companyFile });
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
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== "" && value !== null && value !== undefined) {
                    payload.append(key, String(value));
                }
            });
            if (companyFile) payload.append("companyFile", companyFile);

            // console.log(...payload)

            const response = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    endpoint: "company-add",
                    module: "company",
                },
                body: payload,
            });

            const data = await response.json();
            if (response.status === 401 || response.status === 403) {
                router.push("/forbidden");
                return;
            }
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
                                    </select>
                                    {errors.status && <p className={errorClass}>{errors.status}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Location</label>
                                    <input type="text" name="companyLocation" value={formData.companyLocation} onChange={handleChange} placeholder="Enter company location" className={inputClass} />
                                    {errors.companyLocation && <p className={errorClass}>{errors.companyLocation}</p>}   </div>

                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="company@email.com" className={inputClass} />
                                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Website</label>
                                    <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" className={inputClass} />
                                    {errors.website && <p className={errorClass}>{errors.website}</p>}     </div>

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
                                    {errors.dialCode && <p className={errorClass}>{errors.dialCode}</p>}      </div>

                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input type="number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" className={inputClass} />
                                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}      </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Address</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                                <div>
                                    <label className={labelClass}>Country</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((c) => (
                                            <option key={c.isoCode} value={c.isoCode}>
                                                {c.flag} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.country && <p className={errorClass}>{errors.country}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>State</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        disabled={!formData.country}
                                        className={`${inputClass} disabled:bg-gray-100`}
                                    >
                                        <option value="">Select State</option>
                                        {states.map((s) => (
                                            <option key={s.isoCode} value={s.isoCode}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.state && <p className={errorClass}>{errors.state}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>City</label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!formData.state}
                                        className={`${inputClass} disabled:bg-gray-100`}
                                    >
                                        <option value="">Select City</option>
                                        {cities.map((city) => (
                                            <option key={city.name} value={city.name}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.postalCode && <p className={errorClass}>{errors.postalCode}</p>}      </div>
                            </div>
                        </div>

                        {/* Owner Info */}
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-gray-700 border-b pb-3">Owner Information</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                                <div>
                                    <label className={labelClass}>Owner Name</label>
                                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Owner full name" className={inputClass} />
                                    {errors.ownerName && <p className={errorClass}>{errors.ownerName}</p>}      </div>

                                <div>
                                    <label className={labelClass}>Owner Email</label>
                                    <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} placeholder="owner@email.com" className={inputClass} />
                                    {errors.ownerEmail && <p className={errorClass}>{errors.ownerEmail}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>Owner Phone</label>
                                    <input type="text" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="Owner phone number" className={inputClass} />
                                    {errors.ownerPhone && <p className={errorClass}>{errors.ownerPhone}</p>}   </div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Currency</label>
                            <select name="curId" value={formData.curId} onChange={handleChange} className={inputClass}>
                                <option value="" >Select currency</option>
                                {currencies.map((c) => (
                                    <option key={c.curId} value={c.curId}>
                                        {c.name} ({c.code}) {c.symbol}
                                    </option>
                                ))}
                            </select>
                            {errors.curId && <p className={errorClass}>{errors.curId}</p>}
                        </div>

                    </div>

                    <div className="mt-8 mb-10 flex justify-center"> {/* Changed justify-end to justify-center */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer rounded-xl bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
                        >
                            {loading ? "Creating..." : "Add Company"}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}