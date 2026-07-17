'use client'

import { useRouter } from "next/navigation";
import Header from "./Header";
import { useContext, useEffect, useState } from "react";
import { loginContext } from "./hooks/LoginContext";
import { isSuperAdmin } from "@/app/lib/auth";

export default function SiteMap() {
    const router = useRouter();
    const { isLogin, can, impersonating, permissions, authReady } = useContext(loginContext);
    const [superAdmin, setSuperAdmin] = useState(false);

    useEffect(() => {
        const activeUser = impersonating || isLogin;
        setSuperAdmin(isSuperAdmin(activeUser));
    }, [isLogin, impersonating, permissions]);

    if (!authReady) {
        return (
            <main className="min-h-screen">
                <Header page="sitemap" />
                <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
                    Loading...
                </div>
            </main>
        );
    }

    const dashboardSections = [
        {
            title: "Dashboards",
            items: ["Sitemap"],
            redirectTo: '/',
            show: true,
        },
        {
            title: "Users",
            items: ["Users"],
            redirectTo: '/users',
            show: permissions.includes("userList"),
        },
        {
            title: "Companies",
            items: ["Companies"],
            redirectTo: '/company-list',
            show: permissions.includes("companyList"),
        },
        {
            title: "Groups",
            items: ["Groups"],
            redirectTo: '/group-list',
            show: permissions.includes("groupList"),
        },
        {
            title: "Currencies",
            items: ["Currencies"],
            redirectTo: '/currency-list',
            show: permissions.includes("currencyList") || superAdmin,
        },
        {
            title: "Settings",
            items: ["Capabilities"],
            redirectTo: '/capabilities',
            show: superAdmin,
        },
    ].filter((s) => s.show);

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