"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginContext } from "./hooks/LoginContext";
import { userLoginSchema } from "./Zod";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import { decryptResponse } from "@/app/lib/crypto";

const CRYPTO_SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || "hiddenbrainspune";

function encryptValue(plain) {
    return CryptoJS.AES.encrypt(plain, CRYPTO_SECRET).toString();
}

function decryptValue(cipher) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipher, CRYPTO_SECRET);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        return "";
    }
}

export default function LoginPage() {
    const { isLogin, setLogin } = useContext(loginContext);
    const route = useRouter();

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [formData, setFormData] = useState({ email: "", password: "" });

    useEffect(() => {
        const savedRaw = localStorage.getItem("rememberMeCredentials");
        if (savedRaw) {
            try {
                const parsed = JSON.parse(savedRaw);
                setFormData({
                    email: parsed.email || "",
                    password: parsed.encryptedPassword
                        ? decryptValue(parsed.encryptedPassword)
                        : "",
                });
                setRememberMe(true);
            } catch {
                localStorage.removeItem("rememberMeCredentials");
            }
        }
    }, []);

    const handleChange = (e) => {
        const updated = { ...formData, [e.target.id]: e.target.value };
        setFormData(updated);
        setErrors({ ...errors, [e.target.id]: "" });
        if (rememberMe) saveEncryptedCredentials(updated);
    };

    function saveEncryptedCredentials(data) {
        const toStore = {
            email: data.email,
            encryptedPassword: encryptValue(data.password),
        };
        localStorage.setItem("rememberMeCredentials", JSON.stringify(toStore));
    }

    const handleRememberMe = (e) => {
        const checked = e.target.checked;
        setRememberMe(checked);
        if (checked) {
            saveEncryptedCredentials(formData);
        } else {
            localStorage.removeItem("rememberMeCredentials");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = userLoginSchema.safeParse(formData);

        setLoading(true);
        setMessage("");
        setErrors({ email: "", password: "" });

        try {
            if (!result.success) {
                const fieldErrors = { email: "", password: "" };
                result.error.issues.forEach((err) => {
                    const field = err.path[0];
                    if (field && !fieldErrors[field]) {
                        fieldErrors[field] = err.message;
                    }
                });
                setErrors(fieldErrors);
                return;
            }

            if (rememberMe) saveEncryptedCredentials(formData);

            const response = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    endpoint: "user-login",
                    "Content-Type": "application/json",
                    module: "user",
                },
                body: JSON.stringify(formData),
            });

            const payload = await response.json();
            const data = payload.encrypted ? decryptResponse(payload.encrypted) : payload;
            if (response.ok && data.success === 1 && data.user?.userId) {
                const jwt = data.accessToken || data.token;
                localStorage.setItem("accessToken", jwt);
                if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
                localStorage.setItem("userInfo", JSON.stringify(data.user));
                localStorage.setItem("permissions", JSON.stringify(data.user?.permissions || []));
                setLogin(data.user);
                toast.success(`Welcome ${data.user?.name}`, { position: "top-right" });

                document.cookie = `session=yes`;
                document.cookie = `loggedIn=${data.user.userId}`;

                window.location.href = "/";
            } else {
                const msg = data.message || "Login failed";
                toast.error(msg, { position: "top-right" });
                setMessage(msg);
            }
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-2 h-screen">
            <div className="relative bg-white flex flex-col justify-center px-24">
                <div className="absolute top-6 left-6">
                    <img src="/logo.png" className="h-16" alt="Logo" />
                </div>
                <div className="max-w-md ms-24">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        Log in to Production Planning
                    </h1>
                    <p className="text-gray-500 mb-10">Enter your credentials to continue</p>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">
                                Email <span className="text-red-500 text-[16px]">*</span>
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                className={`text-black w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 ${errors.email
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-blue-500"
                                    }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div className="relative">
                            <label className="block text-sm text-gray-600 mb-2">
                                Password <span className="text-red-500 text-[16px]">*</span>
                            </label>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                className={`text-black w-full border rounded-lg px-4 py-3 pr-20 outline-none focus:ring-2 ${errors.password
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-blue-500"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <img
                                    src={showPassword ? "/password/hidden.png" : "/password/eye.png"}
                                    alt=""
                                    className="w-5 h-5 object-contain opacity-60 hover:opacity-100 transition mt-5"
                                />
                            </button>

                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-black flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={handleRememberMe}
                                />
                                <span className="ps-2">Remember Me</span>
                            </label>

                            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Forgot Password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:bg-gray-400 mt-2"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        {message && (
                            <p className={`text-center font-medium ${message === "success" ? "text-green-500" : "text-red-500"}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </div >
            <div className="bg-blue-200 flex justify-center items-center h-screen">
                <img
                    src={process.env.NEXT_PUBLIC_LOGO_RIGHT}
                    className="max-h-full max-w-full object-contain"
                    alt="Login Illustration"
                />
            </div>
        </div >
    );
}