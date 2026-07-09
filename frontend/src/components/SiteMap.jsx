'use client'

import { useRouter } from "next/navigation";
import Header from "./Header";
import { useContext, useEffect, useState } from "react";
import { loginContext } from "./hooks/LoginContext";
import { isSuperAdmin } from "@/app/lib/auth";

export default function SiteMap() {
    const { isLogin } = useContext(loginContext);
    const [superAdmin, setSuperAdmin] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
        setSuperAdmin(isSuperAdmin(isLogin || storedUser));
    }, [isLogin]);
    const dashboardSections = [
        {
            title: "Dashboards",
            items: ["Sitemap"],
            redirectTo: '/'
        },
        {
            title: "Users",
            items: ["User List"],
            redirectTo: '/users'
        },
        {
            title: "Companies",
            items: ["Company List"],
            redirectTo: '/company-list'
        },
        {
            title: "Groups",
            items: ["Group List"],
            redirectTo: '/group-list'
        },
        ...(superAdmin ? [{
            title: "Settings",
            items: ["Capabilities"],
            redirectTo: '/capabilities'
        }] : []),
    ];
    const router = useRouter()
    const gotoPage = (e, item) => {
        router.push(item)
    }
    const gotoPages = (e, url) => {
        e.preventDefault()
        e.stopPropagation()
        // router.push(`http://localhost:3000${url}`)
    }

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