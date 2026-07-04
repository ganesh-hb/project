"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { UpdateFormSchema } from "./Zod";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/styles";
import Header from "./Header";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { authHeaders } from "@/app/lib/auth";

const MIN_AGE_MS = 18 * 365 * 24 * 60 * 61 * 1000;

export default function EditUserPage({ user, onBack }) {
    const router = useRouter();

    const gotoPages = (e, url) => {
        e.stopPropagation();
        e.preventDefault();
        if (url === "/user") {
            onBack();
        } else {
            router.push(url);
        }
    };

    const phoneRef = useRef(null);
    const itiRef = useRef(null);

    useEffect(() => {
        if (phoneRef.current) {
            itiRef.current = intlTelInput(phoneRef.current, {
                initialCountry: "in",
                separateDialCode: true,
                utilsScript:
                    "https://cdn.jsdelivr.net/npm/intl-tel-input@26.1.1/build/js/utils.js",
            });
        }
        setFormData((prev) => ({ ...prev, tel: phoneRef.current?.value || "" }));
        return () => {
            if (itiRef.current) itiRef.current.destroy();
        };
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: "",
        phone: "",
        status: user?.user_status || "",
        tel: "",
        userId: "",
        dob: dayjs(Date.now() - MIN_AGE_MS),
        isActive: "true",
        userFile: null,
        alternatePhone: "",
        country: "",
        state: "",
        postalCode: "",
        AddressLineOne: "",
    });

    // Flat single company + group selection
    const [companyId, setCompanyId] = useState("");
    const [groupId, setGroupId] = useState("");

    const [preview, setPreview] = useState("");
    const [groups, setGroups] = useState([]);
    const [companies, setCompanies] = useState([]);

    const [errors, setErrors] = useState({
        email: "",
        name: "",
        age: "",
        phone: "",
        userFile: "",
        alternatePhone: "",
        companyId: "",
        groupId: "",
    });

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch("/relayapi", {
                    method: "POST",
                    headers: { ...authHeaders(), endpoint: "group-list", module: "group" },
                    body: JSON.stringify({ page: 1, limit: 200 }),
                });
                const data = await res.json();
                setGroups(data.data || []);
            } catch (err) {
                toast.error(`${err}`, { position: "top-right" });
            }
        };
        fetchGroups();
    }, []);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await fetch("/relayapi", {
                    method: "POST",
                    headers: { ...authHeaders(), endpoint: "company-list", module: "company" },
                    body: JSON.stringify({ page: 1, limit: 200 }),
                });
                const data = await res.json();
                setCompanies(data.data || []);
            } catch (err) {
                toast.error(`${err}`, { position: "top-right" });
            }
        };
        fetchCompanies();
    }, []);

    // Populate form from user prop
    useEffect(() => {
        if (!user) return;

        const parsedDob = user.user_dob
            ? dayjs(user.user_dob)
            : dayjs(Date.now() - MIN_AGE_MS);
        const calculatedAge =
            parsedDob && parsedDob.isValid() ? dayjs().diff(parsedDob, "year") : "";

        setFormData({
            name: user.user_name || "",
            email: user.user_email || "",
            age: calculatedAge,
            phone: user.user_phone || "",
            status: user.user_status || "Active",
            tel: user.user_tel || "",
            userId: user.user_userId || "",
            dob: parsedDob,
            isActive:
                user.user_isActive !== undefined ? String(user.user_isActive) : "true",
            userFile: null,
            alternatePhone: user.user_alternatePhone || "",
            country: user.user_country || "",
            state: user.user_state || "",
            postalCode: user.user_postalCode || "",
            AddressLineOne: user.user_AddressLineOne || "",
        });

        setPreview(
            `http://localhost:4000/upload/${user.user_userId}/${user.user_userFile}`
        );

        const primary =
            user.assignments?.find((a) => a.is_parent === 0) ??
            user.assignments?.[0] ??
            null;

        if (primary) {
            if (primary.groupId) setGroupId(String(primary.groupId));
            if (primary.companyId) setCompanyId(String(primary.companyId));
        }

    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            e.target.tagName === "INPUT" &&
            e.target.type !== "submit"
        ) {
            e.preventDefault();
        }
    };

    const handleDateChange = (date) => {
        const calculatedAge = date && date.isValid() ? dayjs().diff(date, "year") : "";
        setFormData((prev) => ({ ...prev, dob: date, age: calculatedAge }));
    };

    const handleImage = (e) => {
        const file = e?.target?.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, userFile: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = UpdateFormSchema.safeParse(formData);

        let hasSelectionError = false;
        const selectionErrors = { companyId: "", groupId: "" };
        if (!companyId) {
            selectionErrors.companyId = "Please select a company.";
            hasSelectionError = true;
        }
        if (!groupId) {
            selectionErrors.groupId = "Please select a role.";
            hasSelectionError = true;
        }
        if (hasSelectionError) {
            setErrors((prev) => ({ ...prev, ...selectionErrors }));
            return;
        }

        try {
            if (!result.success) {
                const fieldErrors = {
                    email: "",
                    name: "",
                    age: "",
                    phone: "",
                    userFile: "",
                    alternatePhone: "",
                    companyId: "",
                    groupId: "",
                };
                result.error.issues.forEach((err) => {
                    if (err.path[0]) fieldErrors[err.path[0]] = err.message;
                });
                setErrors(fieldErrors);
                return;
            }

            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("email", formData.email);
            payload.append("age", formData.age);
            payload.append("tel", formData.tel);
            payload.append("phone", formData.phone);
            payload.append("status", formData.status);
            payload.append("dob", formData.dob ? formData.dob.format("YYYY-MM-DD") : "");
            payload.append("userId", formData.userId);
            payload.append("isActive", formData.isActive);
            payload.append("companyId", companyId);
            payload.append("groupId", groupId);
            if (formData.country) payload.append("country", formData.country);
            if (formData.state) payload.append("state", formData.state);
            if (formData.postalCode) payload.append("postalCode", formData.postalCode);
            if (formData.AddressLineOne) payload.append("AddressLineOne", formData.AddressLineOne);

            if (formData.userFile) {
                payload.append("userFile", formData.userFile);
            }

            const response = await fetch("/relayapi", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    endpoint: "user-update",
                    module: 'user',
                },
                body: payload,
            });

            const data = await response.json();

            if (data?.success != undefined && data?.success == 0) {
                toast.error(`Update failed: ${data?.message}`, { position: "top-right" });
            } else if (data?.statusCode != undefined && data?.statusCode != 200) {
                toast.error(`Update failed: ${data?.message}`, { position: "top-right" });
            } else {
                if (response.ok) {
                    toast.success("Updating user was successful", { position: "top-right" });
                    setTimeout(() => onBack(), 1000);
                } else {
                    toast.error(`Update failed: ${data?.message}`, { position: "top-right" });
                }
            }
        } catch (error) {
            toast.error(`${error}`, { position: "top-right" });
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">Loading...</div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
            <Header page="user-edit" />

            <nav
                className="p-6 flex items-center space-x-2 text-sm font-medium text-gray-500"
                aria-label="Breadcrumb"
            >
                <span
                    className="cursor-pointer transition-colors hover:text-blue-600 hover:underline"
                    onClick={(e) => gotoPages(e, "/")}
                >
                    Home
                </span>
                <span className="text-gray-400">{">>"}</span>
                <span
                    className="cursor-pointer transition-colors hover:text-blue-600 hover:underline"
                    onClick={(e) => gotoPages(e, "/users")}
                >
                    Users
                </span>
                <span className="text-gray-400">{">>"}</span>
                <span
                    className="cursor-pointer transition-colors hover:text-blue-600 hover:underline"
                    onClick={(e) => gotoPages(e, "/user")}
                >
                    User
                </span>
                <span className="text-gray-400">{">>"}</span>
                <span className="text-gray-800 cursor-pointer">Update</span>
            </nav>

            <div className="px-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="mt-1 text-3xl font-semibold text-gray-800">Edit User</h1>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="rounded-xl bg-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300"
                        >
                            ← Back
                        </button>
                    )}
                </div>

                <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
                    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
                        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">

                            {/* Name */}
                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    User Name <span className="text-red-500 text-[16px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Email <span className="text-red-500 text-[16px]">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* DOB */}
                            <div>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer
                                        components={["DatePicker", "MobileDatePicker", "DesktopDatePicker", "StaticDatePicker"]}
                                    >
                                        <DemoItem label="DOB *">
                                            <DesktopDatePicker
                                                value={formData.dob}
                                                onChange={handleDateChange}
                                                maxDate={dayjs(Date.now() - MIN_AGE_MS)}
                                            />
                                        </DemoItem>
                                    </DemoContainer>
                                </LocalizationProvider>
                                {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
                            </div>

                            {/* Phone */}
                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Phone Number <span className="text-red-500 text-[16px]">*</span>
                                </label>
                                <input
                                    type="tel"
                                    ref={phoneRef}
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            {/* Status */}
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
                                    <option value="Pending">Pending</option>
                                    <option value="Block">Block</option>
                                </select>
                            </div>

                            {/* Alternate Phone */}
                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Alternate Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="alternatePhone"
                                    value={formData.alternatePhone}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                                {errors.alternatePhone && (
                                    <p className="mt-1 text-sm text-red-500">{errors.alternatePhone}</p>
                                )}
                            </div>

                            {/* Role dropdown */}
                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Role <span className="text-red-500 text-[16px]">*</span>
                                </label>
                                <select
                                    value={groupId}
                                    onChange={(e) => {
                                        setGroupId(e.target.value);
                                        setErrors((prev) => ({ ...prev, groupId: "" }));
                                    }}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                >
                                    <option value="">Select role</option>
                                    {groups.map((g) => (
                                        <option key={g.groupId} value={String(g.groupId)}>
                                            {g.groupName}
                                        </option>
                                    ))}
                                </select>
                                {errors.groupId && (
                                    <p className="mt-1 text-sm text-red-500">{errors.groupId}</p>
                                )}
                            </div>

                            {/* Company dropdown */}
                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Company <span className="text-red-500 text-[16px]">*</span>
                                </label>
                                <select
                                    value={companyId}
                                    onChange={(e) => {
                                        setCompanyId(e.target.value);
                                        setErrors((prev) => ({ ...prev, companyId: "" }));
                                    }}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                >
                                    <option value="">Select company</option>
                                    {companies.map((c) => (
                                        <option key={c.companyId} value={String(c.companyId)}>
                                            {c.companyName}
                                        </option>
                                    ))}
                                </select>
                                {errors.companyId && (
                                    <p className="mt-1 text-sm text-red-500">{errors.companyId}</p>
                                )}
                            </div>

                            {/* Address Section */}
                            <div className="w-full lg:col-span-2">
                                <h3 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">
                                    Address
                                </h3>
                            </div>

                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Address Line</label>
                                <input
                                    type="text"
                                    name="AddressLineOne"
                                    value={formData.AddressLineOne}
                                    onChange={handleChange}
                                    placeholder="Street address"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Country"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Postal Code</label>
                                <input
                                    type="number"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    placeholder="Postal / ZIP code"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Profile Image */}
                            <div className="w-full lg:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Profile Image
                                </label>
                                <input
                                    type="file"
                                    onChange={handleImage}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                                />
                                {errors.userFile && (
                                    <p className="mt-1 text-sm text-red-500">{errors.userFile}</p>
                                )}
                                {preview && (
                                    <div className="mt-4">
                                        <img
                                            src={preview}
                                            alt="preview"
                                            className="h-24 w-24 rounded-full object-cover border"
                                        />
                                    </div>
                                )}
                            </div>


                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                            >
                                Update User
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}