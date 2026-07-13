"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { authHeaders } from "@/app/lib/auth";
import { loginContext } from "./hooks/LoginContext";
import { ResetPasswordSchema } from "./Zod";
import RouteGuard from "./RouteGuard";
import Header from "./Header";

export default function AdminResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get("userId");
    const { isLogin } = useContext(loginContext);

    const [targetUser, setTargetUser] = useState(null);
    const [formData, setFormData] = useState({ password: "", confirmPass: "" });
    const [errors, setErrors] = useState({ password: "", confirmPass: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!targetUserId) {
            router.push("/users");
            return;
        }
        const fetchUser = async () => {
            try {
                const res = await fetch("/relayapi", {
                    method: "GET",
                    headers: { ...authHeaders(), endpoint: `user-details/${targetUserId}`, module: "user" },
                });
                const data = await res.json();
                setTargetUser(data);
            } catch (err) {
                toast.error(`${err}`, { position: "top-right" });
            }
        };
        fetchUser();
    }, [targetUserId]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = ResetPasswordSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors = { password: "", confirmPass: "" };
            result.error.issues.forEach((err) => {
                const field = err.path[0];
                if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/relayapi", {
                method: "PUT",
                headers: { ...authHeaders(), endpoint: "user-admin-reset-pass", module: "user" },
                body: JSON.stringify({
                    userId: Number(targetUserId),
                    newPassword: formData.password,
                }),
            });
            const data = await res.json();

            if (data?.success === 1) {
                toast.success(`Password reset for ${targetUser?.name || "user"}`, { position: "top-right" });
                setTimeout(() => router.push("/users"), 1000);
            } else {
                toast.error(data?.message || "Failed to reset password", { position: "top-right" });
            }
        } catch (err) {
            toast.error(`${err}`, { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <RouteGuard isSuperAdminOnly>
            <div className="min-h-screen w-full bg-[#f5f6f8] text-black">
                <Header page="admin-reset-pass" />

                <div className="px-6 py-10 flex justify-center">
                    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                        <h1 className="mb-2 text-2xl font-semibold text-gray-800">Reset Password</h1>
                        <p className="mb-6 text-sm text-gray-500">
                            {targetUser
                                ? `Set a new password for ${targetUser.name} (${targetUser.email})`
                                : "Loading user..."}
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-16 outline-none focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPass"
                                    value={formData.confirmPass}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                                {errors.confirmPass && <p className="mt-1 text-sm text-red-500">{errors.confirmPass}</p>}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push("/users")}
                                    className="rounded-xl bg-gray-200 px-8 py-3 font-medium text-gray-700 hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {loading ? "Saving..." : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}