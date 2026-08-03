'use client';

import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginContext } from "./hooks/LoginContext";
import { isSuperAdmin } from "@/app/lib/auth";

export default function HeaderMenuPanel({ isOpen, onClose, hasMounted }) {
    const router = useRouter();
    const { isLogin, impersonating, permissions } = useContext(loginContext);

    const [activeCategory, setActiveCategory] = useState("dashboard");
    const [superAdmin, setSuperAdmin] = useState(false);

    useEffect(() => {
        const activeUser = impersonating || isLogin;
        setSuperAdmin(isSuperAdmin(activeUser));
    }, [isLogin, impersonating, permissions]);

    const activePermissions = hasMounted ? (permissions || []) : [];
    const isSuper = hasMounted ? superAdmin : false;

    const rawCategories = [
        {
            id: "dashboard",
            title: "Dashboard",
            items: [
                { label: "Sitemap", redirectTo: "/", show: true },
            ]
        },
        {
            id: "users",
            title: "Users",
            items: [
                { label: "Users", redirectTo: "/users", show: activePermissions.includes("userList") },
            ]
        },
        {
            id: "master",
            title: "Master",
            items: [
                { label: "Companies", redirectTo: "/company-list", show: activePermissions.includes("companyList") },
                { label: "Groups", redirectTo: "/group-list", show: activePermissions.includes("groupList") },
                { label: "Currencies", redirectTo: "/currency-list", show: activePermissions.includes("currencyList") || isSuper },
            ]
        }
    ];

    const menuCategories = rawCategories
        .map(cat => ({
            ...cat,
            items: cat.items.filter(item => item.show)
        }))
        .filter(cat => cat.items.length > 0);

    const currentCat = menuCategories.find(c => c.id === activeCategory) || menuCategories[0];
    const currentCatId = currentCat?.id;

    return (
        <>
            {/* Menu Panel Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 top-[72px] bg-black/40 z-30 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Menu Panel Drawer */}
            <div
                className={`fixed inset-x-0 bottom-0 top-[72px] bg-white z-40 shadow-2xl flex transition-transform duration-300 ease-in-out ${isOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
                    }`}
            >
                {/* Left sidebar: category selector */}
                <div className="w-64 border-r border-gray-200 bg-gray-50/50 p-4 flex flex-col gap-1 overflow-y-auto">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Modules
                    </div>
                    {menuCategories.map((cat) => {
                        const isActive = cat.id === currentCatId;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer text-left ${isActive
                                        ? "bg-blue-50 text-blue-700 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <span>{cat.title}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200/60 text-gray-600">
                                    {cat.items.length}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right main area: category items */}
                <div className="flex-1 p-6 overflow-y-auto bg-white">
                    {currentCat && (
                        <div>
                            <div className="mb-6 pb-3 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800">{currentCat.title}</h3>
                                {/* <p className="text-xs text-gray-500 mt-0.5">
                                    Available views and tools in this section
                                </p> */}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentCat.items.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            onClose();
                                            router.push(item.redirectTo);
                                        }}
                                        className="group flex flex-col gap-1 p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all cursor-pointer text-left"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-800 group-hover:text-blue-600">
                                                {item.label}
                                            </span>
                                            <span className="text-gray-400 group-hover:text-blue-600 text-sm">
                                                →
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
