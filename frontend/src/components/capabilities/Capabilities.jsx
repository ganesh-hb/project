"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/lib/auth";
import Header from "../Header";
import { loginContext } from "../hooks/LoginContext";

export default function CapabilitiesList() {
    const router = useRouter();
    const { isLogin } = useContext(loginContext);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await fetch("/relayapi", {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    endpoint: "group-list",
                    module: "group",
                },
                body: JSON.stringify({ page: 1, limit: 100 }),
            });
            const data = await res.json();
            setGroups(data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status) => {
        if (status === "active") return "inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-700";
        if (status === "inactive") return "inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700";
        return "inline-block rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700";
    };

    return (
        <div className="min-h-screen bg-[#f5f6f8]">
            <Header page="capabilities" />

            <div className="px-6 py-6">
                <nav className="mb-4 flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => router.push("/")}>Home</span>
                    <span className="text-gray-400">{">>"}</span>
                    <span className="text-gray-800">Capabilities</span>
                </nav>

                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">Capabilities</h1>
                </div>

                <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Loading groups...</div>
                    ) : groups.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm">No groups found.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-gray-500 font-semibold text-left">
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Group Name</th>
                                    <th className="px-6 py-4">Group Code</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((group, i) => (
                                    <tr key={group.groupId || i} className="border-b hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{group.groupName}</td>
                                        <td className="px-6 py-4 text-gray-600">{group.groupCode}</td>
                                        <td className="px-6 py-4">
                                            <span className={statusBadge(group.status)}>{group.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); router.push(`/capability/${group.groupId}`); }}
                                                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 cursor-pointer"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}