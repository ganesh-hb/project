'use client'

import { useRouter } from "next/navigation";
import Header from "./Header";
import { useContext, useEffect, useState } from "react";
import { loginContext } from "./hooks/LoginContext";
import { isSuperAdmin } from "@/app/lib/auth";

export default function SiteMap() {
    const { isLogin, can } = useContext(loginContext);
    const [superAdmin, setSuperAdmin] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
        setSuperAdmin(isSuperAdmin(isLogin || storedUser));
    }, [isLogin]);

    const allSections = [
        {
            title: "Dashboards",
            items: ["Sitemap"],
            redirectTo: '/',
            show: true,
        },
        {
            title: "Users",
            items: ["User List"],
            redirectTo: '/users',
            show: can("userList"),
        },
        {
            title: "Companies",
            items: ["Company List"],
            redirectTo: '/company-list',
            show: can("companyList"),
        },
        {
            title: "Groups",
            items: ["Group List"],
            redirectTo: '/group-list',
            show: can("groupList"),
        },
        {
            title: "Settings",
            items: ["Capabilities"],
            redirectTo: '/capabilities',
            show: superAdmin,
        },
    ];

    const dashboardSections = allSections.filter((s) => s.show);

    const router = useRouter();
    const gotoPage = (e, item) => {
        router.push(item);
    };
    const gotoPages = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <main className="min-h-screen">
            <Header
                page="user-details"
                pageProps={{
                    breadcrumbs: [
                        { label: "Home", onClick: (e) => gotoPages(e, "/") },
                    ]
                }}
            />
            <section className="px-6 py-8">
                <h2 className="mb-8 text-4xl font-bold text-gray-800">
                    Welcome { }
                </h2>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {dashboardSections.map((section, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-gray-200 bg-white shadow-sm"
                        >
                            <div className="border-b px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {section.title}
                                </h3>
                            </div>

                            <ul className="space-y-3 px-6 py-5">
                                {section.items.map((item, itemIndex) => (
                                    <li
                                        key={itemIndex}
                                        className="flex items-center text-gray-600 hover:text-black cursor-pointer transition"
                                        onClick={(e) => { gotoPage(e, section.redirectTo) }}
                                    >
                                        <span className="mr-3 text-xs">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

        </main>
    );
}