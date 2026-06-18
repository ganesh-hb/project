'use client'

import { useRouter } from "next/navigation";
import { loginContext } from "./hooks/LoginContext";
import { useContext, useState } from "react";
import Header from "./Header";
import { toast } from "react-toastify";
import { authHeaders } from "@/app/lib/auth";

export default function ChangePassword() {

    const { isLogin, setLogin } = useContext(loginContext);
    // console.log(isLogin)

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const router = useRouter();

    const gotoBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.back();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    const handleUpdate = async () => {

        if (formData.newPassword != formData.confirmPassword) {
            toast.error(`New password and confirm password do not match`, {
                position: "top-right",
            });
            return;
        }

        try {

            const response = await fetch("http://localhost:3000/relayapi", {
                method: "PUT",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                    endpoint: "user-changepass"
                },
                body: JSON.stringify({
                    email: isLogin?.email,
                    password: formData.currentPassword,
                    newpass: formData.newPassword,
                    confirmpass: formData.confirmPassword
                })
            });
            const data = await response.json();
            // console.log(data)
            if (data.success == 1) {
                setLogin((prev) => ({
                    ...prev,
                    password: formData.newPassword
                }));

                toast.success(`password updated successfully `, {
                    position: "top-right",
                });
                router.back();
            }
            else {
                toast.error(`${data.message}`, {
                    position: "top-right",
                });
            }

        } catch (error) {
            toast.error(`server error`, {
                position: "top-right",
            });
        }
    };

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

                    <h1 className="text-4xl font-semibold text-black mb-2">
                        Change your password
                    </h1>

                    <p className="text-gray-500 text-sm mb-8">
                        Pick a strong password you haven't used in the past.
                    </p>

                    <div className="mb-5">

                        <label className="block text-sm text-gray-700 mb-2">
                            Current Password
                        </label>

                        <div className="relative">

                            <input
                                type="password"
                                name="currentPassword"
                                placeholder="Current Password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 pr-12 text-sm outline-none focus:border-gray-400 text-black"
                            />

                        </div>
                    </div>

                    <div className="mb-5">

                        <label className="block text-sm text-gray-700 mb-2">
                            New Password
                        </label>

                        <div className="relative">

                            <input
                                type="password"
                                name="newPassword"
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 pr-12 text-sm outline-none focus:border-gray-400 text-black"
                            />

                        </div>
                    </div>

                    <div className="mb-8">

                        <label className="block text-sm text-gray-700 mb-2">
                            Confirm Password
                        </label>

                        <div className="relative">

                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 pr-12 text-sm outline-none focus:border-gray-400 text-black"
                            />

                        </div>
                    </div>

                    <div className="flex justify-end gap-3">

                        <button
                            className="px-8 h-12 rounded-md bg-gray-500 text-white font-medium hover:bg-gray-600 transition"
                            onClick={gotoBack}
                        >
                            Back
                        </button>

                        <button
                            className="px-8 h-12 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                            onClick={handleUpdate}
                        >
                            Update
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}