'use client'

import { useRouter } from "next/navigation";
import { loginContext } from "./hooks/LoginContext";
import { useContext, useState } from "react";
import Header from "./Header";
import { toast } from "react-toastify";
import { authHeaders } from "@/app/lib/auth";
import { ChangePasswordSchema } from "./Zod";


export default function ChangePassword() {
    const { isLogin, setLogin, displayUser } = useContext(loginContext);
    const router = useRouter();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const gotoBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.back();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleUpdate = async () => {
        const result = ChangePasswordSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors = { currentPassword: "", newPassword: "", confirmPassword: "" };
            result.error.issues.forEach((err) => {
                const field = err.path[0];
                if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/relayapi", {
                method: "PUT",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                    endpoint: "user-changepass",
                    module: "user",
                },
                body: JSON.stringify({
                    email: displayUser?.email,
                    password: formData.currentPassword,
                    newpass: formData.newPassword,
                    confirmpass: formData.confirmPassword
                })
            });

            const data = await response.json();
            if (data.success === 1) {
                toast.success("Password updated successfully", { position: "top-right" });
                router.back();
            } else {
                toast.error(`${data.message}`, { position: "top-right" });
            }
        } catch {
            toast.error("Server error", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full h-12 rounded-lg border border-gray-300 bg-white px-4 pr-16 text-sm outline-none focus:border-blue-400 text-black";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div className="min-h-screen bg-[#f3f3f3]">
            <Header
                page="change-password"
                pageProps={{
                    breadcrumbs: [
                        { label: "Home", onClick: (e) => { e.preventDefault(); router.push("/"); } },
                        { label: "Change Password" },
                    ],
                    title: "Change Password",
                    actions: (
                        <button
                            className="px-6 h-10 rounded-md bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition"
                            onClick={gotoBack}
                        >
                            ← Back
                        </button>
                    ),
                }}
            />

            <div className="flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-[#f7f7f7] rounded-2xl shadow-sm p-10">
                    <h1 className="text-4xl font-semibold text-black mb-2">Change your password</h1>
                    <p className="text-gray-500 text-sm mb-8">Pick a strong password you haven't used before.</p>

                    <div className="mb-5">
                        <label className="block text-sm text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                name="currentPassword"
                                placeholder="Current Password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className={`${inputClass} ${errors.currentPassword ? "border-red-500" : ""}`}
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-4 top-3.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                {showCurrent ? "Hide" : "View"}
                            </button>
                        </div>
                        {errors.currentPassword && <p className={errorClass}>{errors.currentPassword}</p>}
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                name="newPassword"
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={`${inputClass} ${errors.newPassword ? "border-red-500" : ""}`}
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-3.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                {showNew ? "Hide" : "View"}
                            </button>
                        </div>
                        {errors.newPassword && <p className={errorClass}>{errors.newPassword}</p>}
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`${inputClass} ${errors.confirmPassword ? "border-red-500" : ""}`}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-3.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                                {showConfirm ? "Hide" : "View"}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            className="px-8 h-12 rounded-md bg-gray-500 text-white font-medium hover:bg-gray-600 transition"
                            onClick={gotoBack}
                        >
                            Back
                        </button>
                        <button
                            disabled={loading}
                            className="px-8 h-12 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
                            onClick={handleUpdate}
                        >
                            {loading ? "Updating..." : "Update"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}